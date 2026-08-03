// Does a path under /public exist at build time?
//
// The obvious `new URL('../../public' + path, import.meta.url)` is wrong in a
// production build: components are bundled, so import.meta.url points at
// dist/pages/*.mjs and the check resolves to dist/public/… — which never
// exists, so every lookup silently fails and every image falls back. It works
// in dev (Vite serves from source) which is exactly what makes it easy to miss.
//
// process.cwd() is the project root in both dev and build.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

export function publicFileExists(path: string): boolean {
  if (!path.startsWith('/')) return true; // remote or relative — trust it
  return existsSync(resolve(process.cwd(), 'public', path.replace(/^\/+/, '')));
}
