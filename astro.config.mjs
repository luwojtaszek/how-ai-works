import { defineConfig } from 'astro/config';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { typoHtml } from './src/lib/typo.js';

// After the build, add non-breaking spaces to the text of every page (see src/lib/typo.js).
const typography = { name: 'typography', hooks: { 'astro:build:done': async ({ dir }) => {
  const root = fileURLToPath(dir);
  for (const f of await readdir(root, { recursive: true })) {
    if (!f.endsWith('.html')) continue;
    const p = `${root}/${f}`, html = await readFile(p, 'utf8');
    await writeFile(p, typoHtml(html, /<html[^>]*lang="pl"/.test(html) ? 'pl' : 'en'));
  }
} } };

export default defineConfig({
  // Public address of the guide; used for canonical URLs, sitemap and llms.txt.
  site: 'https://howaiworks.dev',
  devToolbar: { enabled: false },
  integrations: [typography],
});
