import { defineConfig } from 'astro/config';

export default defineConfig({
  // Public address of the guide; used for canonical URLs, sitemap and llms.txt.
  site: 'https://howaiworks.dev',
  devToolbar: { enabled: false },
});
