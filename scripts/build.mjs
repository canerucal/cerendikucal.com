import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

// Publish only site assets; local settings and source tooling stay out of deploys.
for (const entry of ['index.html', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'css', 'js', 'img']) {
  await cp(path.join(root, entry), path.join(output, entry), {
    recursive: true,
    filter: source => path.basename(source) !== '.DS_Store',
  });
}
console.log('Static site prepared in dist/');
