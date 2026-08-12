/**
 * Wire Sanity publishes to a Vercel rebuild.
 *
 *   npm run webhook           # create or update the webhook
 *   npm run webhook -- --dry  # show what would change, touch nothing
 *
 * WHY THIS EXISTS AT ALL: the site is a static Astro build, so every GROQ query
 * in `src/lib/content.ts` runs once, at build time. Publishing in the Studio
 * changes the Content Lake but not one byte of the deployed HTML. Something has
 * to tell Vercel to build again, and that something is a Sanity webhook
 * pointing at a Vercel Deploy Hook.
 *
 * THE ONE MANUAL STEP: Vercel has no public REST endpoint that *creates* a
 * deploy hook — the field is read-only on `PATCH /v9/projects/{id}` and the
 * dashboard is the only writer. Existing hooks *are* readable, so this script
 * finds one and only asks you to click if there is genuinely nothing to find.
 *
 * CREDENTIALS ARE NEVER ARGUMENTS. Both tokens are read from the CLI logins you
 * already have (`vercel login`, `sanity login`), the same trick
 * `scripts/blog/push.mjs` uses. Nothing secret is printed, and the deploy hook
 * URL is redacted in output because it is a bearer credential in URL clothing:
 * anyone holding it can spend your build minutes.
 *
 * Re-running is safe. The webhook is matched by name, and an unchanged one is
 * left alone — this converges to a desired state rather than appending a
 * duplicate. Note that Sanity has no general update endpoint: `PATCH` accepts
 * only `isDisabledByUser`, so changing anything real (url, filter, dataset)
 * means delete-then-recreate, which is what `drift()` below is deciding.
 */
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const DRY = process.argv.includes('--dry');

/** The name is the idempotency key — rename it and you get a second webhook. */
const HOOK_NAME = 'Vercel — rebuild on publish';

/**
 * Only ever fires on published documents.
 *
 * Without this filter every autosave keystroke in the Studio is an `update`
 * event, and a portfolio would sit in a permanent rebuild loop while burning
 * through the 60-triggers-per-hour project limit. Drafts live under the
 * `drafts.` id prefix, so excluding that path is exactly "on publish".
 */
const FILTER = '!(_id in path("drafts.**"))';

const die = (msg: string): never => {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
};

/** Redact a deploy hook URL down to something safe to look at in a terminal. */
const redact = (url: string) => url.replace(/\/([^/]{4})[^/]+$/, '/$1••••••••');

// ── credentials ────────────────────────────────────────────────────────────

function vercelToken(): string {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  // macOS and Linux disagree about where the CLI puts its auth file.
  const paths = [
    join(homedir(), 'Library/Application Support/com.vercel.cli/auth.json'),
    join(homedir(), '.local/share/com.vercel.cli/auth.json'),
  ];
  for (const p of paths) {
    if (!existsSync(p)) continue;
    const token = JSON.parse(readFileSync(p, 'utf8')).token;
    if (token) return token;
  }
  return die('No Vercel token. Run `vercel login`, or set VERCEL_TOKEN.');
}

function sanityToken(): string {
  if (process.env.SANITY_AUTH_TOKEN) return process.env.SANITY_AUTH_TOKEN;
  const p = join(homedir(), '.config/sanity/config.json');
  if (existsSync(p)) {
    const token = JSON.parse(readFileSync(p, 'utf8')).authToken;
    if (token) return token;
  }
  return die('No Sanity token. Run `sanity login`, or set SANITY_AUTH_TOKEN.');
}

// ── project identity ───────────────────────────────────────────────────────

function vercelProject(): { projectId: string; teamId: string } {
  const p = new URL('../.vercel/project.json', import.meta.url);
  if (!existsSync(p)) die('Not linked to Vercel. Run `vercel link`.');
  const { projectId, orgId } = JSON.parse(readFileSync(p, 'utf8'));
  return { projectId, teamId: orgId };
}

/**
 * Read the Sanity project from `.env` rather than hardcoding it, so this script
 * cannot drift from the one the site actually queries.
 */
function sanityProject(): { projectId: string; dataset: string } {
  const p = new URL('../.env', import.meta.url);
  if (!existsSync(p)) die('No .env. Copy .env.example to .env first.');
  const env = readFileSync(p, 'utf8');
  const read = (k: string) => env.match(new RegExp(`^${k}=(.*)$`, 'm'))?.[1]?.trim();
  const projectId = read('PUBLIC_SANITY_PROJECT_ID');
  const dataset = read('PUBLIC_SANITY_DATASET') || 'production';
  if (!projectId || projectId === 'placeholder') {
    die('PUBLIC_SANITY_PROJECT_ID is unset or "placeholder" — the site is running\n  on seeded fallback content, so a rebuild would change nothing.');
  }
  return { projectId: projectId!, dataset };
}

// ── step 1: find the Vercel deploy hook ────────────────────────────────────

async function findDeployHook(token: string, projectId: string, teamId: string) {
  if (process.env.DEPLOY_HOOK_URL) return process.env.DEPLOY_HOOK_URL;

  const res = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}?teamId=${teamId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) die(`Vercel API ${res.status}: ${(await res.text()).slice(0, 300)}`);

  const link = (await res.json()).link;
  if (!link) {
    die('This Vercel project has no Git repository connected, and a deploy hook\n  has to target a branch. Connect the repo in Settings → Git first.');
  }

  const hooks: Array<{ name: string; url: string; ref: string }> = link.deployHooks ?? [];
  if (hooks.length) {
    // Prefer one that looks like it was made for this, else take the first.
    const mine = hooks.find((h) => /sanity|cms|content/i.test(h.name)) ?? hooks[0];
    console.log(`  found deploy hook "${mine.name}" → ${mine.ref}`);
    return mine.url;
  }

  const branch = link.productionBranch ?? 'main';
  die(
    `No deploy hook on this project yet, and Vercel's API cannot create one.\n\n` +
      `  Create it once, by hand:\n` +
      `    1. https://vercel.com/selfworks/workfolio/settings/git\n` +
      `    2. Deploy Hooks → name it "Sanity", branch "${branch}" → Create\n` +
      `    3. Copy the URL, then re-run:  npm run webhook\n\n` +
      `  (Or pass it directly: DEPLOY_HOOK_URL=https://... npm run webhook)`
  );
}

// ── step 2: converge the Sanity webhook ────────────────────────────────────

const API = 'https://api.sanity.io/v2025-02-19/hooks/projects';

async function syncWebhook(
  token: string,
  { projectId, dataset }: { projectId: string; dataset: string },
  url: string
) {
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const listRes = await fetch(`${API}/${projectId}`, { headers: auth });
  if (!listRes.ok) die(`Sanity API ${listRes.status}: ${(await listRes.text()).slice(0, 300)}`);
  const existing = (await listRes.json()).find((h: { name: string }) => h.name === HOOK_NAME);

  const body = {
    type: 'document',
    name: HOOK_NAME,
    description: 'Static Astro build — publishing must trigger a rebuild to reach the site.',
    url,
    dataset,
    apiVersion: 'v2021-06-07',
    httpMethod: 'POST',
    includeDrafts: false,
    isDisabledByUser: false,
    rule: {
      on: ['create', 'update', 'delete'],
      filter: FILTER,
      // Deploy hooks ignore the payload entirely; keep it tiny rather than
      // shipping whole documents over the wire on every publish.
      projection: '{_id, _type}',
    },
  };

  /**
   * Which fields of the live webhook disagree with what we want.
   *
   * Compared explicitly rather than by deep-equal: the API decorates its
   * response with fields we never send (`id`, `createdAt`, a legacy top-level
   * `filter: null` superseded by `rule.filter`), and a blind comparison would
   * report drift on every run and recreate the webhook forever.
   */
  const drift = (h: Record<string, any>): string[] => {
    const want: Record<string, unknown> = {
      url: body.url,
      dataset: body.dataset,
      apiVersion: body.apiVersion,
      httpMethod: body.httpMethod,
      includeDrafts: body.includeDrafts,
      isDisabledByUser: body.isDisabledByUser,
      'rule.filter': body.rule.filter,
      'rule.projection': body.rule.projection,
      'rule.on': body.rule.on.join(),
    };
    const got: Record<string, unknown> = {
      url: h.url,
      dataset: h.dataset,
      apiVersion: h.apiVersion,
      httpMethod: h.httpMethod,
      includeDrafts: h.includeDrafts,
      isDisabledByUser: h.isDisabledByUser,
      'rule.filter': h.rule?.filter,
      'rule.projection': h.rule?.projection,
      'rule.on': [...(h.rule?.on ?? [])].join(),
    };
    return Object.keys(want).filter((k) => want[k] !== got[k]);
  };

  const changed = existing ? drift(existing) : null;

  if (existing && changed!.length === 0) {
    console.log(`  webhook "${HOOK_NAME}" already correct — no change`);
    return;
  }

  const verb = existing ? `recreate (drift: ${changed!.join(', ')})` : 'create';
  if (DRY) {
    console.log(`\n  --dry: would ${verb} "${HOOK_NAME}"`);
    console.log(`  ${JSON.stringify({ ...body, url: redact(url) }, null, 2).replace(/\n/g, '\n  ')}`);
    return;
  }

  // No general update endpoint exists — PATCH takes only `isDisabledByUser` —
  // so a config change is a delete followed by a create.
  if (existing) {
    const del = await fetch(`${API}/${projectId}/${existing.id}`, { method: 'DELETE', headers: auth });
    if (!del.ok) die(`Sanity API ${del.status} deleting old webhook: ${(await del.text()).slice(0, 300)}`);
  }

  const res = await fetch(`${API}/${projectId}`, {
    method: 'POST',
    headers: auth,
    body: JSON.stringify(body),
  });
  if (!res.ok) die(`Sanity API ${res.status}: ${(await res.text()).slice(0, 400)}`);

  console.log(`  ${existing ? 'recreated' : 'created'} webhook "${HOOK_NAME}"`);
}

// ── run ────────────────────────────────────────────────────────────────────

const vercel = vercelProject();
const sanity = sanityProject();

console.log(`\n  vercel  ${vercel.projectId}`);
console.log(`  sanity  ${sanity.projectId} / ${sanity.dataset}\n`);

const hookUrl = await findDeployHook(vercelToken(), vercel.projectId, vercel.teamId);
await syncWebhook(sanityToken(), sanity, hookUrl);

console.log(`\n  ${redact(hookUrl)}`);
console.log(`  Publish in /admin → Vercel rebuilds. Drafts are ignored.\n`);
