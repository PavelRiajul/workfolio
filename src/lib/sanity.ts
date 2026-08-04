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
 * The stable identity of a list item, used to pair a Sanity document with its
 * seeded counterpart. `slug` covers posts and projects; `name` covers services.
 * Anything without one can't be paired and is passed through untouched.
 */
function identityOf(v: unknown): string | null {
  if (!isPlainObject(v)) return null;
  for (const key of ['slug', 'name', 'id', '_id']) {
    const raw = v[key];
    // A slug may arrive projected to a string or as the raw `{ current }` object.
    const value = isPlainObject(raw) ? raw.current : raw;
    if (typeof value === 'string' && value) return `${key}:${value}`;
  }
  return null;
}

/**
 * Fill gaps in a Sanity result from the seeded content, field by field.
 *
 * Without this the fallback is all-or-nothing: add a field in code, and every
 * page that reads it crashes the build until the dataset is re-seeded. Only
 * `null`/`undefined` fall back — an empty array means the editor cleared it
 * and is respected as-is.
 *
 * Arrays are paired by identity, not merged positionally. Doing it by index
 * would graft one post's body onto another the moment an editor reorders or
 * inserts a document. An item with no seeded counterpart — a genuinely new
 * post — passes through as authored.
 *
 * This pairing is what makes a partially-filled dataset safe. A `post`
 * document created in the Studio before `body` existed returns without it;
 * paired against the seed, the field is restored instead of silently
 * vanishing, which is what suppressed every `/blog/<slug>` page.
 */
function withFallback<T>(res: unknown, fallback: T): T {
  if (res === null || res === undefined) return fallback;

  if (Array.isArray(res) && Array.isArray(fallback)) {
    const seeded = new Map<string, unknown>();
    for (const item of fallback) {
      const id = identityOf(item);
      if (id) seeded.set(id, item);
    }
    return res.map((item) => {
      const id = identityOf(item);
      const match = id ? seeded.get(id) : undefined;
      return match === undefined ? item : withFallback(item, match);
    }) as T;
  }

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
