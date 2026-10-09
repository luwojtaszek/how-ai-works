// What changed, newest first. Add an entry whenever topics are added or meaningfully updated
// (see AGENTS.md). `added` topics get a "new" badge in the table of contents for 45 days,
// `updated` ones are linked from the entry. Dates are YYYY-MM-DD.
export const CHANGELOG = [
  {
    date: '2026-10-10',
    added: [],
    updated: ['format'],
    en: 'Enforcing output format: a new widget walks the schema through the server step by step, from compilation into an automaton and a mask table, through prefill and a reasoning model’s thinking, to every token of the response. It shows who applies the mask, at which stage, and what stays in the cache after the response. New notes: why to keep the schema stable, how code and SDKs can silently change the field order, and what a schema can’t guarantee for lists. The note on reasoning quality explains why a reasoning model still needs the justification first and cites the “Structure Tax” study (2026).',
    pl: 'Wymuszanie formatu: nowy widżet przeprowadza schemat przez serwer krok po kroku, od kompilacji do automatu i tabeli masek, przez prefill i myślenie modelu rozumującego, do każdego tokena odpowiedzi. Pokazuje, kto nakłada maskę, na jakim etapie i co zostaje w cache’u po odpowiedzi. Nowe notki: czemu trzymać schemat stały, jak kod i SDK potrafią po cichu zmienić kolejność pól i czego schemat nie gwarantuje przy listach. Notka o jakości rozumowania wyjaśnia, czemu model rozumujący też potrzebuje uzasadnienia przed decyzją, i przytacza badanie „Structure Tax” (2026).',
  },
  {
    date: '2026-10-09',
    added: [],
    updated: ['format', 'injection', 'produkcja', 'roofline', 'kwantyzacja', 'moe', 'context', 'sampling'],
    en: 'Widget corrections after a full review. Enforcing output format: a new example with a free-text field shows where the mask cuts tokens and where it lets almost everything through. Prompt injection: the defences now say which ones work, which only reduce risk and which only limit scale, and the agent’s permissions sit next to the result. LLMs in production: the retry cost matches the counter. Why the GPU is idle: a large batch with long contexts runs out of memory before compute. Quantisation: the quality label follows the error, and BF16 is shown as the reference. Mixture of Experts, The context window and agents, and The next token: counters and messages match what the widget shows.',
    pl: 'Poprawki widżetów po pełnym przeglądzie. Wymuszanie formatu: nowy przykład z polem tekstowym pokazuje, gdzie maska wycina tokeny, a gdzie przepuszcza prawie wszystko. Prompt injection: obrony mówią, które działają, które tylko zmniejszają ryzyko, a które ograniczają skalę, a uprawnienia agenta stoją obok wyniku. LLM na produkcji: koszt ponowień zgadza się z licznikiem. Czemu GPU się nudzi: duży batch z długim kontekstem kończy się na pamięci, zanim na liczeniu. Kwantyzacja: ocena jakości wynika z błędu, a BF16 jest pokazane jako wzorzec. Mixture of Experts, Okno kontekstowe i agent oraz Następny token: liczniki i komunikaty zgadzają się z tym, co pokazuje widżet.',
  },
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
