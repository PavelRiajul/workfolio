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

/**
 * Fetch from Sanity, but transparently fall back to seeded content when
 * Sanity isn't configured, the query errors, or it returns nothing.
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
    return empty ? fallback : res;
  } catch (err) {
    console.warn('[sanity] fetch failed — using fallback content:', (err as Error).message);
    return fallback;
  }
}
