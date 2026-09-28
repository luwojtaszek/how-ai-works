// Search engines and AI assistants are welcome: the guide is meant to be found and cited.
export const GET = ({ site }) => new Response(`User-agent: *\nAllow: /\nDisallow: /og-card/\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`, { headers: { 'Content-Type': 'text/plain' } });
