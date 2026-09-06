/**
 * Google shows roughly 60 characters of a title and truncates the rest — and
 * when a title is obviously too long it often discards it and writes its own
 * from the page, which is worse than any title you would have chosen.
 *
 * Blog titles are written for the page, not the SERP, so several run to 88
 * characters once " — Riajul Islam" is appended. The brand suffix is the part
 * with the least information in it: a reader scanning results already knows
 * whose site it is from the URL line underneath. So it is appended only when
 * it fits, and dropped when the headline needs the room.
 */
export const SERP_TITLE_MAX = 60;

export function withBrand(title: string, brand: string, max = SERP_TITLE_MAX): string {
  const full = `${title} — ${brand}`;
  return full.length <= max ? full : title;
}
