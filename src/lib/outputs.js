// Text outputs for search and AI readers, one set per language.
import { UI, content, root } from '../i18n.js';
import { TOPICS, topic, fmtDate, SITE_UPDATED } from './content.js';

const txt = (body, type = 'text/plain; charset=utf-8') => new Response(body, { headers: { 'Content-Type': type } });
const absUrl = (site, p) => (site ? new URL(p, site).href : p);

export const searchJson = (lang) => txt(JSON.stringify(TOPICS[lang].flatMap((t) => t.entries)), 'application/json');

export const topicMd = (lang, id, site) => {
  const t = topic(lang, id);
  return txt(`${t.markdown}\n\n${UI[lang].page}: ${absUrl(site, content(lang).path(id))}\n`, 'text/markdown; charset=utf-8');
};

export const llmsTxt = (lang, site) => {
  const ui = UI[lang], c = content(lang), r = root(lang);
  const lines = [`# ${ui.siteName}`, '', `> ${ui.siteDesc}`, '', ui.llmsIntro, `${ui.lastUpdate}: ${SITE_UPDATED}. ${ui.whatsNew}: ${absUrl(site, `${r}changelog/`)}`,
    `${ui.wholeFile}: ${absUrl(site, `${r}llms-full.txt`)}`, ui.license, ''];
  for (const [g, desc, ids] of c.groups) {
    lines.push(`## ${g}`, '', desc, '');
    for (const id of ids) lines.push(`- [${c.titleOf(id)}](${absUrl(site, `${r}${c.slug(id)}.md`)}): ${topic(lang, id).desc}`);
    lines.push('');
  }
  return txt(lines.join('\n'));
};

export const llmsFull = (lang, site) => {
  const ui = UI[lang];
  const head = `# ${ui.siteName}\n\n> ${ui.siteDesc}\n\n${absUrl(site, root(lang))}\n`;
  return txt([head, ...TOPICS[lang].map((t) => t.markdown)].join('\n\n---\n\n') + '\n');
};

// RSS 2.0 feed of the changelog, one per language.
import { CHANGELOG } from '../changelog.js';
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const rss = (lang, site) => {
  const ui = UI[lang], c = content(lang), r = root(lang), home = absUrl(site, r);
  const items = CHANGELOG.map((e) => {
    const topics = [...e.added, ...e.updated].map((id) => c.titleOf(id)).join(', ');
    return `<item><title>${esc(fmtDate(e.date, lang) + (topics ? ': ' + topics : ''))}</title><link>${absUrl(site, `${r}changelog/`)}</link><guid isPermaLink="false">${e.date}-${lang}</guid><pubDate>${new Date(e.date + 'T12:00:00Z').toUTCString()}</pubDate><description>${esc(e[lang])}</description></item>`;
  }).join('');
  return txt(`<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0"><channel><title>${esc(ui.siteName + ': ' + ui.whatsNew)}</title><link>${home}</link><description>${esc(ui.changelogIntro)}</description><language>${lang}</language>${items}</channel></rss>\n`, 'application/rss+xml; charset=utf-8');
};
