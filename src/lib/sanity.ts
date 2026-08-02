import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'placeholder';
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';

/** True only when a real Sanity project is configured via .env. */
export const sanityConfigured = !!projectId && projectId !== 'placeholder';

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: '2024-10-01',
  useCdn: false,
});

const builder = imageUrlBuilder(sanityClient);
export function urlForImage(source: unknown) {
  return builder.image(source as never);
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/**
 * Fill gaps in a Sanity result from the seeded content, field by field.
 *
 * Without this the fallback is all-or-nothing: add a field in code, and every
 * page that reads it crashes the build until the dataset is re-seeded. Only
 * `null`/`undefined` fall back — an empty array means the editor cleared it
 * and is respected as-is.
 */
function withFallback<T>(res: unknown, fallback: T): T {
  if (res === null || res === undefined) return fallback;
  if (isPlainObject(res) && isPlainObject(fallback)) {
    const out: Record<string, unknown> = { ...fallback };
    for (const [key, value] of Object.entries(res)) {
      out[key] = key in fallback ? withFallback(value, fallback[key]) : value;
    }
    return out as T;
  }
  return res as T;
}

/**
 * Fetch from Sanity, but transparently fall back to seeded content when
 * Sanity isn't configured, the query errors, or a field is missing.
 */
export async function safeFetch<T>(
  query: string,
  params: Record<string, unknown>,
  fallback: T
): Promise<T> {
  if (!sanityConfigured) return fallback;
  try {
    const res = await sanityClient.fetch<T>(query, params);
    const empty = res == null || (Array.isArray(res) && res.length === 0);
    return empty ? fallback : withFallback(res, fallback);
  } catch (err) {
    console.warn('[sanity] fetch failed — using fallback content:', (err as Error).message);
    return fallback;
  }
}
