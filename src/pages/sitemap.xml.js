import { ORDER } from '../data.js';
import { content } from '../i18n.js';
import { updatedOf, SITE_UPDATED } from '../lib/content.js';

export const GET = ({ site }) => {
  const u = (p) => new URL(p, site).href;
  const en = content('en'), pl = content('pl');
  // [en path, pl path, lastmod]
  const pages = [['/', '/pl/', SITE_UPDATED], ['/changelog/', '/pl/changelog/', SITE_UPDATED], ['/about/', '/pl/about/', SITE_UPDATED],
    ...ORDER.map((id) => [en.path(id), pl.path(id), updatedOf(id)])];
  const urls = pages.flatMap(([e, p, mod]) => [e, p].map((loc) => `<url><loc>${u(loc)}</loc><lastmod>${mod}</lastmod>` +
    `<xhtml:link rel="alternate" hreflang="en" href="${u(e)}"/><xhtml:link rel="alternate" hreflang="pl" href="${u(p)}"/><xhtml:link rel="alternate" hreflang="x-default" href="${u(e)}"/></url>`));
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>\n`, { headers: { 'Content-Type': 'application/xml' } });
};
