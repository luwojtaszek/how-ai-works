// Languages: English is the default at the site root, Polish lives under /pl/.
import * as PL from './data.js';
import * as EN from './data.en.js';

export const LANGS = ['en', 'pl'];
export const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const root = (lang) => BASE + (lang === 'pl' ? 'pl/' : '');
// Public source repository: error reports go to its issues, fixes come as pull requests.
export const REPO = 'https://github.com/luwojtaszek/how-ai-works';
export const other = (lang) => (lang === 'pl' ? 'en' : 'pl');

export const UI = {
  en: {
    useAI: 'Use with AI', copyMd: 'Copy page as Markdown', copied: 'Copied ✓', openIn: 'Open in', viewMd: 'View as Markdown',
    aiPrompt: (url, title) => `Read ${url} and quiz me on “${title}”. Ask me one question at a time, wait for my answer, then correct it and go deeper.`,
    siteName: 'How AI works', updated: 'Last edited', lastUpdate: 'Last updated', minRead: (n) => `${n} min read`, about: 'How this guide is made', aboutShort: 'About this guide', license: 'Licence: text and images CC BY 4.0 (quote and adapt with a link to the source), code MIT.', footer: 'Footer', reportError: 'Report an error', suggestFix: 'Suggest a fix', whatsNew: 'What’s new', newBadge: 'new', changelogIntro: 'New topics and meaningful changes, newest first. Subscribe via RSS to follow updates.', rss: 'RSS feed', topicsLabel: 'Topics', home: 'Home', chapter: 'Chapter', nextShort: 'Next',
    tagline: 'a guide to LLMs and AI agents',
    siteDesc: 'An interactive guide for engineers: how language models work under the hood and what matters when building agentic systems. With self-check questions.',
    search: 'Search…', searchLabel: 'Search the guide', searchPlaceholder: 'Search for a topic or term, e.g. KV cache, MCP, hallucinations', closeSearch: 'Close search',
    toc: 'Contents', closeToc: 'Close contents', allTopics: 'Map of all topics', topicMap: 'Map of topics', topicList: 'Topics', railHide: 'Hide sidebar', railShow: 'Show sidebar',
    theme: 'Toggle light and dark mode', themeTitle: 'Light / dark (follows your system by default)',
    aiNote: ['Studying with ChatGPT or Claude? Give it a link to ', 'the whole guide as text', '.'],
    lay: 'In plain words', interview: 'Check yourself', followups: 'Follow-up questions', sources: 'Sources', otherLangAnswer: 'Po polsku',
    prev: 'Previous topic', next: 'Next topic', back: 'Back', end: 'End', neighbours: 'Neighbouring topics',
    langName: 'English', switchTo: 'Polski', switchLabel: 'Ta strona po polsku', widget: 'Interactive widget on the page',
    llmsIntro: 'The guide is in English (Polish version under /pl/). Every topic: intuition, an interactive widget, mechanism, nuances, a short answer to check yourself, follow-up questions and sources.',
    wholeFile: 'The whole guide in one file', page: 'Interactive page', q: 'Question', a: 'Short answer', locale: 'en_GB',
  },
  pl: {
    useAI: 'Użyj z AI', copyMd: 'Kopiuj stronę jako Markdown', copied: 'Skopiowano ✓', openIn: 'Otwórz w', viewMd: 'Pokaż jako Markdown',
    aiPrompt: (url, title) => `Przeczytaj ${url} i przepytaj mnie z tematu „${title}”. Zadawaj po jednym pytaniu, poczekaj na moją odpowiedź, popraw ją i drąż temat głębiej.`,
    siteName: 'Jak działa AI', updated: 'Ostatnia zmiana', lastUpdate: 'Ostatnia aktualizacja', minRead: (n) => `${n} min czytania`, about: 'Jak powstaje ten przewodnik', aboutShort: 'O przewodniku', license: 'Licencja: tekst i obrazy CC BY 4.0 (możesz cytować i przerabiać z linkiem do źródła), kod MIT.', footer: 'Stopka', reportError: 'Zgłoś błąd', suggestFix: 'Zaproponuj poprawkę', whatsNew: 'Co nowego', newBadge: 'nowość', changelogIntro: 'Nowe tematy i istotne zmiany, od najnowszych. Możesz śledzić je przez RSS.', rss: 'Kanał RSS', topicsLabel: 'Tematy', home: 'Strona główna', chapter: 'Rozdział', nextShort: 'Dalej',
    tagline: 'przewodnik po modelach i agentach',
    siteDesc: 'Interaktywny przewodnik dla inżynierów: jak działają modele językowe pod spodem i co jest ważne w budowaniu systemów agentowych. Z pytaniami sprawdzającymi.',
    search: 'Szukaj…', searchLabel: 'Szukaj w przewodniku', searchPlaceholder: 'Szukaj tematu albo pojęcia, np. KV cache, MCP, halucynacje', closeSearch: 'Zamknij wyszukiwanie',
    toc: 'Spis treści', closeToc: 'Zamknij spis treści', allTopics: 'Mapa wszystkich tematów', topicMap: 'Mapa tematów', topicList: 'Spis tematów', railHide: 'Ukryj pasek boczny', railShow: 'Pokaż pasek boczny',
    theme: 'Przełącz tryb jasny i ciemny', themeTitle: 'Tryb jasny / ciemny (domyślnie jak w systemie)',
    aiNote: ['Uczysz się z ChatGPT albo Claude? Daj mu link do ', 'całego przewodnika w wersji tekstowej', '.'],
    lay: 'Po ludzku', interview: 'Sprawdź się', followups: 'Pytania pogłębiające', sources: 'Źródła', otherLangAnswer: 'In English',
    prev: 'Poprzedni temat', next: 'Następny temat', back: 'Wróć', end: 'Koniec', neighbours: 'Sąsiednie tematy',
    langName: 'Polski', switchTo: 'English', switchLabel: 'This page in English', widget: 'Interaktywny widżet na stronie',
    llmsIntro: 'Przewodnik jest po polsku (wersja angielska pod /). Każdy temat: intuicja, interaktywny widżet, mechanizm, niuanse, krótka odpowiedź do sprawdzenia się, pytania pogłębiające i źródła.',
    wholeFile: 'Cały przewodnik w jednym pliku', page: 'Strona interaktywna', q: 'Pytanie', a: 'Krótka odpowiedź', locale: 'pl_PL',
  },
};

// Per-language view of the curriculum. Missing English entries fall back to Polish
// so the site keeps building while translation is in progress.
export function content(lang) {
  const en = lang === 'en';
  const groups = PL.GROUPS.map(([name, desc, ids]) => (en && EN.GROUPS_EN[name] ? [...EN.GROUPS_EN[name], ids] : [name, desc, ids]));
  const st = (id) => {
    const s = PL.ST[id];
    const e = en && EN.ST_EN[id];
    if (!s && !e) return null;
    return e ? { t: e.t, q: e.q, a: e.a, alt: s?.pl } : { t: s.t, q: s.q, a: s.pl, alt: s.en };
  };
  const x = (id) => (en && EN.X_EN[id]) ? { ...PL.X[id], ...EN.X_EN[id] } : PL.X[id] || {};
  const titleOf = (id) => (en && (EN.ST_EN[id]?.t || EN.TITLES_EN[id])) || PL.titleOf(id);
  // English pages use English URL slugs, Polish pages the topic id
  const slug = (id) => (en && EN.SLUG_EN[id]) || id;
  const path = (id) => root(lang) + slug(id) + '/';
  // numbered topics; the last chapter (design practice and flashcards) is not counted as topics
  const topics = PL.ORDER.filter((id) => !PL.GROUPS.at(-1)[2].includes(id));
  return { lang, groups, st, x, titleOf, slug, path, topics, order: PL.ORDER, hues: PL.HUES, translated: (id) => !en || !!EN.ST_EN[id] || !!EN.TITLES_EN[id] };
}
