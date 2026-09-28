// Build-time view of every topic in every language: HTML with section anchors,
// plain text for search, and markdown for AI readers. Stations stay hand-written HTML:
// Polish in src/stations/<id>.html, English in src/stations/en/<id>.html.
import { execFileSync } from 'node:child_process';
import { parse } from 'node-html-parser';
import { LANGS, UI, content } from '../i18n.js';
import { CHANGELOG } from '../changelog.js';

// Last change of a topic = newest commit touching its station files (either language),
// or the newest changelog entry that mentions it, whichever is later.
const gitDate = (files) => { try { return execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], { encoding: 'utf8' }).trim() || null; } catch (e) { return null; } };
export const SITE_UPDATED = CHANGELOG[0]?.date;
export const updatedOf = (id) => [gitDate([`src/stations/${id}.html`, `src/stations/en/${id}.html`]), ...CHANGELOG.filter((e) => [...e.added, ...e.updated].includes(id)).map((e) => e.date)]
  .filter(Boolean).sort().pop() || SITE_UPDATED;
export const fmtDate = (d, lang) => new Date(d + 'T12:00:00Z').toLocaleDateString(lang === 'pl' ? 'pl-PL' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
// topics added in the last 45 days (relative to the build) get a "new" badge
const BUILD = new Date().toISOString().slice(0, 10);
export const isNew = (id) => CHANGELOG.some((e) => e.added.includes(id) && (Date.parse(BUILD) - Date.parse(e.date)) / 864e5 <= 45);

const RAW = {
  pl: import.meta.glob('../stations/*.html', { query: '?raw', import: 'default', eager: true }),
  en: import.meta.glob('../stations/en/*.html', { query: '?raw', import: 'default', eager: true }),
};
const stationHtml = (lang, id) => (lang === 'en' && RAW.en[`../stations/en/${id}.html`]) || RAW.pl[`../stations/${id}.html`];

export const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ł/g, 'l')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const clean = (s) => s.replace(/\s+/g, ' ').trim();
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

// Inline HTML -> markdown for the few tags stations use.
function md(node) {
  if (node.nodeType === 3) return decode(node.rawText.replace(/\s+/g, ' '));
  const inner = node.childNodes.map(md).join('');
  switch (node.rawTagName?.toLowerCase()) {
    case 'code': return '`' + inner + '`';
    case 'b': case 'strong': return inner.trim() ? '**' + inner.trim() + '** ' : '';
    case 'em': case 'i': return inner.trim() ? '*' + inner.trim() + '*' : '';
    case 'a': return `[${inner}](${node.getAttribute('href')})`;
    case 'br': return '\n';
    default: return inner;
  }
}

function blockMd(el, out, ui) {
  const tag = el.rawTagName?.toLowerCase();
  const cls = el.classList ? [...el.classList.values()] : [];
  if (cls.includes('lab')) {
    const t = el.querySelector('.lab-title');
    out.push(`*${ui.widget}${t ? ': ' + clean(t.text) : ''}.*`);
    return;
  }
  if (tag === 'h2') return;
  if (tag === 'h3') { out.push('### ' + clean(el.text)); return; }
  if (tag === 'p') { const t = clean(md(el)); if (t) out.push(t); return; }
  if (tag === 'ul' || tag === 'ol') {
    out.push(el.querySelectorAll(':scope > li').map((li, i) => (tag === 'ol' ? `${i + 1}. ` : '- ') + clean(md(li))).join('\n'));
    return;
  }
  if (tag === 'table') {
    const rows = el.querySelectorAll('tr').map((tr) => '| ' + tr.querySelectorAll('th,td').map((c) => clean(md(c))).join(' | ') + ' |');
    if (rows.length) out.push([rows[0], '|' + ' --- |'.repeat(rows[0].split(' | ').length), ...rows.slice(1)].join('\n'));
    return;
  }
  el.childNodes.filter((c) => c.nodeType === 1).forEach((c) => blockMd(c, out, ui));
}

function build(lang, id) {
  const ui = UI[lang], c = content(lang);
  const sec = parse(stationHtml(lang, id)).querySelector('section');
  const sections = [];
  for (const h of sec.querySelectorAll('h3.sub')) {
    const title = clean(h.text);
    const anchor = slug(title);
    h.setAttribute('id', anchor);
    sections.push({ title, anchor });
  }
  const s = c.st(id), x = c.x(id);
  const title = c.titleOf(id);
  const group = c.groups.find((g) => g[2].includes(id))[0];
  const lede = clean(sec.querySelector('.lede')?.text || '');

  const out = [];
  sec.childNodes.filter((n) => n.nodeType === 1).forEach((n) => blockMd(n, out, ui));
  const lines = [`## ${title}`, `*${group}*`, out[0] ?? ''];
  if (x.lay) lines.push(`**${ui.lay}:** ${x.lay}`);
  lines.push(...out.slice(1));
  if (s) lines.push(`### ${ui.interview}`, `**${ui.q}:** ${s.q}`, `**${ui.a}:** ${s.a}`);
  if (x.f?.length) lines.push(`### ${ui.followups}`, x.f.map(([q, a]) => `- **${q}** ${a}`).join('\n'));
  if (x.r?.length) lines.push(`### ${ui.sources}`, x.r.map(([t, u]) => `- [${t}](${u})`).join('\n'));

  const entries = [{ id, anchor: '', title, section: '', text: [lede, x.d, x.lay, s?.q].filter(Boolean).join(' ') }];
  let cur = null;
  for (const el of sec.childNodes.filter((n) => n.nodeType === 1)) {
    if (el.classList?.contains('sub')) { cur = { id, anchor: el.getAttribute('id'), title, section: clean(el.text), text: '' }; entries.push(cur); continue; }
    if (el.classList?.contains('lab') || el.rawTagName === 'h2') continue;
    const t = clean(el.text);
    if (cur) cur.text += ' ' + t; else entries[0].text += ' ' + t;
  }
  if (s) entries.push({ id, anchor: 'check', title, section: ui.interview, text: [s.q, s.a, ...(x.f || []).flat()].join(' ') });

  const updated = updatedOf(id);
  lines.splice(2, 0, `*${ui.updated}: ${fmtDate(updated, lang)}*`);
  return { id, lang, title, group, lede, desc: x.d || lede, sections, updated, html: sec.toString(), markdown: lines.join('\n\n'), entries };
}

export const TOPICS = Object.fromEntries(LANGS.map((lang) => [lang, content(lang).order.map((id) => build(lang, id))]));
export const topic = (lang, id) => TOPICS[lang].find((t) => t.id === id);
