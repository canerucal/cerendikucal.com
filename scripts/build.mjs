import { cp, mkdir, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { transform } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

// Publish only site assets; local settings and source tooling stay out of deploys.
for (const entry of ['index.html', 'favicon.ico', 'robots.txt', 'sitemap.xml', 'js', 'img', 'fonts']) {
  await cp(path.join(root, entry), path.join(output, entry), {
    recursive: true,
    filter: source => path.basename(source) !== '.DS_Store',
  });
}
// This single-page site's small stylesheet stays inline to avoid render-blocking
// round trips. Preserve the cascade and minify with a CSS parser.
let html = await readFile(path.join(output, 'index.html'), 'utf8');
const styles = await Promise.all(['fonts.css', 'index.css', 'refinement.css'].map(file => readFile(path.join(root, 'css', file), 'utf8')));
const css = await transform(styles.join('\n'), { loader: 'css', minify: true, target: 'safari15' });
html = html.replace(/    <link rel="stylesheet" href="css\/fonts\.css" \/>\s*<link rel="stylesheet" href="css\/index\.css[^\"]*" \/>\s*<link rel="stylesheet" href="css\/refinement\.css[^\"]*" \/>/, `<style>${css.code}</style>`);
const headers = [];
// Content-addressed assets can be cached safely across releases.
async function fingerprint(dir) {
  for (const entry of await readdir(path.join(output, dir), { withFileTypes: true })) {
    const relative = `${dir}/${entry.name}`;
    if (entry.isDirectory()) { await fingerprint(relative); continue; }
    if (!/\.(?:woff2|webp|js)$/.test(entry.name)) continue;
    let bytes = await readFile(path.join(output, relative));
    if (entry.name.endsWith('.js')) bytes = Buffer.from((await transform(bytes.toString(), { loader: 'js', minify: true, target: 'safari15' })).code);
    const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 12);
    const named = relative.replace(/(\.[^.]+)$/, `.${hash}$1`);
    await writeFile(path.join(output, named), bytes);
    await rm(path.join(output, relative));
    html = html.replaceAll(relative, named);
    headers.push(`/${named}\n  Cache-Control: public, max-age=31536000, immutable`);
  }
}
await fingerprint('fonts');
await fingerprint('img');
await fingerprint('js');
await writeFile(path.join(output, 'index.html'), html);
await writeFile(path.join(output, '_headers'), headers.join('\n\n') + '\n');
console.log('Static site prepared in dist/');
