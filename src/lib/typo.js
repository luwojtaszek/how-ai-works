// Non-breaking spaces so a line never ends on a one-letter Polish word, inside a number ("128 256"),
// between a number and its unit ("70 mld", "140 GB") or before a cross-reference title.
const NB = ' ', WJ = '⁠'; // WJ: word joiner, keeps "50–100" together
export function typo(s, lang) {
  if (lang === 'pl') s = s.replace(/(?<=^|[\s(„"])([aiouwzAIOUWZ]) /g, '$1' + NB)
    .replace(/(?<=(?:^|\s)(?:ok\.|np\.|ze|do|od|po|co|ponad)) (?=\d)/g, NB).replace(/\(zobacz /g, '(zobacz' + NB);
  else s = s.replace(/\(see /g, '(see' + NB);
  return s.replace(/(?<=\d) (?=\d{3}(?!\d))/g, NB)
    .replace(/(?<=\d) (?=(?:mld|mln|tys\.|bln|GB|TB|MB|KB|ms|GFLOP|USD|zł|billion|million)(?![\p{L}]))/gu, NB)
    .replace(/(?<=\d)–(?=\d)/g, '–' + WJ);
}
// The same for a whole HTML page: text only, never inside tags, scripts, styles or code.
export function typoHtml(html, lang) {
  let skip = 0;
  return html.split(/(<[^>]*>)/).map((part) => {
    if (part[0] === '<') { const m = part.match(/^<(\/?)(script|style|pre|code|textarea)\b/i); if (m) skip += m[1] ? -1 : 1; return part; }
    return skip > 0 ? part : typo(part, lang);
  }).join('');
}
