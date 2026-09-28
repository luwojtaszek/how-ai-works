# How AI works

An interactive guide for engineers: how language models work under the hood and what matters when building agentic systems. Every topic goes from the essence to the mechanism and its nuances, has a widget to play with, a short self-check, follow-up questions and sources. English at `/`, Polish at `/pl/`.

Live at https://howaiworks.dev

## Found an error?

Open an issue (every page has a "Report an error" link that fills in the address) or send a pull request with the fix. How topics are written and checked is in [AGENTS.md](AGENTS.md).

```bash
bun install
bun run dev      # http://localhost:4321
bun run build    # static site in dist/
```

## Where things live

| Path | What |
|---|---|
| `src/stations/<id>.html`, `src/stations/en/<id>.html` | Topic pages (Polish, English), plain HTML |
| `src/data.js`, `src/data.en.js` | Topic order and chapters, self-check answers, follow-ups, sources, search titles |
| `src/scripts/app.js` | Widgets; `tr('polski','English')` picks the page language |
| `src/i18n.js` | Languages, UI strings, per-language view of the data |
| `src/lib/content.js`, `src/lib/outputs.js` | Build-time section anchors, search index, markdown |

## For AI assistants

- `/llms.txt`, `/pl/llms.txt`: index of topics
- `/llms-full.txt`, `/pl/llms-full.txt`: the whole guide as one text file
- `/<slug>.md`, `/pl/<id>.md`: one topic as markdown

## License

The guide's text and images (`src/stations/`, the text in `src/data.js` and `src/data.en.js`, `public/og/`) are [CC BY 4.0](LICENSE-CONTENT): quote, translate and adapt them with a link to the source. The code is [MIT](LICENSE).

## Deploy

Every push to `main` builds the site and publishes it to Cloudflare Pages (`.github/workflows/deploy.yml`), served at https://howaiworks.dev. Pull requests get a preview URL in a comment. The public address is set in `astro.config.mjs` (`site`).
