/**
 * Post-build steps specific to GitHub Pages.
 *
 * Pages has no rewrite rules and runs Jekyll by default, so:
 *  - 404.html lets deep links resolve to the SPA
 *  - .nojekyll stops Jekyll ignoring underscore-prefixed paths
 */
import { copyFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');

if (!existsSync(path.join(dist, 'index.html'))) {
  console.error('dist/index.html not found — run this after `vite build`.');
  process.exit(1);
}

copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
writeFileSync(path.join(dist, '.nojekyll'), '');

console.log('Pages post-build complete: 404.html + .nojekyll written.');
