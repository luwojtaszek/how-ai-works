// What changed, newest first. Add an entry whenever topics are added or meaningfully updated
// (see AGENTS.md). `added` topics get a "new" badge in the table of contents for 45 days,
// `updated` ones are linked from the entry. Dates are YYYY-MM-DD.
export const CHANGELOG = [
  {
    date: '2026-10-03',
    added: [],
    updated: ['tokeny'],
    en: 'Tokens: a new step-through widget walks a small, simplified example through the stages of BPE training: from text, through a table of word counts, to merges that stop at the size you choose. Clicking a token shows its bytes. A new note explains what text the vocabulary is built from and what its first merges reveal, and the notes on vocabulary size and bytes are simpler.',
    pl: 'Tokeny: nowy widżet przeprowadza mały, uproszczony przykład przez etapy treningu BPE: od tekstu, przez tabelę liczników słów, do scaleń, które kończą się na wybranym rozmiarze. Kliknięcie tokena pokazuje jego bajty. Nowa notka wyjaśnia, z jakiego tekstu powstaje słownik i co zdradzają jego pierwsze scalenia, a opis rozmiaru słownika i bajtów jest prostszy.',
  },
  {
    date: '2026-09-30',
    added: [],
    updated: ['evals', 'reasoning', 'promptcache', 'narzedzia'],
    en: 'Evals: how to tune a prompt against the set without fitting the cases, how to check the set itself, and which sources of noise aren’t the model. Reasoning models: what higher effort changes in an agent and what it doesn’t fix. Correction: on the newest Claude models a system instruction, a tool and the effort level can change mid-conversation without invalidating the prompt cache.',
    pl: 'Ewaluacje: jak poprawiać prompt pod zestaw, nie dopasowując go do samych przypadków, jak sprawdzić sam zestaw i jakie źródła szumu nie pochodzą od modelu. Modele rozumujące: co wyższy wysiłek zmienia w pracy agenta, a czego nie naprawia. Poprawka: w najnowszych modelach Claude instrukcję systemową, narzędzie i poziom wysiłku można zmienić w trakcie rozmowy bez unieważniania prompt cache.',
  },
  {
    date: '2026-09-26',
    added: [],
    updated: [],
    en: 'First public version: 34 topics in 9 chapters, from tokens, attention and distillation to agents, the coding-agent harness, choosing a model and running LLMs in production, each with an interactive widget, a self-check and sources, plus system design exercises and flashcards. English and Polish.',
    pl: 'Pierwsza publiczna wersja: 34 tematy w 9 rozdziałach, od tokenów, attention i destylacji po agentów, harness agenta kodującego, wybór modelu i LLM-y w produkcji, każdy z interaktywnym widżetem, sekcją „Sprawdź się” i źródłami, do tego ćwiczenia z projektowania systemów i fiszki. Po angielsku i po polsku.',
  },
];
