# Usage: uv run --no-project --with tiktoken --with tokenizers python scripts/gen-tokens.py  (writes src/scripts/tokens-data.json)
"""Real tokeniser splits for the Tokens widget presets, and EN vs PL token counts over the whole guide.

GPT-4o is tiktoken's o200k_base. Llama 3 and Gemma 3 come from ungated Hugging Face mirrors of the
official (gated) repos; the tokenizer files are the same. Keep TEXTS in sync with the presets in
initTok (src/scripts/app.js): a text missing here falls back to the widget's estimate.
"""
import html, json, pathlib, re

import tiktoken
from tokenizers import Tokenizer

ROOT = pathlib.Path(__file__).resolve().parent.parent
PAIR = ('Common words end up as a single token; rare ones are assembled from pieces.',
        'Częste słowa kończą jako jeden token, rzadkie składa się z kawałków.')
TEXTS = ["How many r's are in strawberry?", 'strawberry',
         'Ile liter r jest w słowie truskawka? Źdźbło chrząszcza.',
         'public static void main(String[] args) { return; }',
         'Transfer of 1234567.89 PLN on 2026-09-21', 'Przelew 1234567.89 PLN z dnia 2026-09-21', *PAIR]

o200k = tiktoken.get_encoding('o200k_base')
llama = Tokenizer.from_pretrained('NousResearch/Meta-Llama-3-8B')
gemma = Tokenizer.from_pretrained('unsloth/gemma-3-1b-it')

# GPT-2 byte-level alphabet (used by Llama 3), reversed: printable char -> byte
_bs = [*range(33, 127), *range(161, 173), *range(174, 256)]
_cs = _bs + [256 + i for i in range(256 - len(_bs))]
_bs = _bs + [b for b in range(256) if b not in _bs]
U2B = {chr(c): b for b, c in zip(_bs, _cs)}


def pieces(k, text):
    """[(bytes, id)] for tokeniser k; the bytes always reassemble to the input."""
    if k == 0:
        ids = o200k.encode(text)
        bs = [o200k.decode_single_token_bytes(i) for i in ids]
    else:
        tok = llama if k == 1 else gemma
        ids = tok.encode(text, add_special_tokens=False).ids
        if k == 1:
            bs = [bytes(U2B[c] for c in tok.id_to_token(i)) for i in ids]
        else:  # SentencePiece: ▁ is a space, <0xNN> is a byte-fallback token
            bs = [bytes([int(m[1], 16)]) if (m := re.fullmatch(r'<0x([0-9A-F]{2})>', t)) else t.replace('▁', ' ').encode()
                  for t in map(tok.id_to_token, ids)]
    assert b''.join(bs) == text.encode(), (k, text)
    return list(zip(bs, ids))


def count(k, text):
    return len(o200k.encode(text)) if k == 0 else len((llama if k == 1 else gemma).encode(text, add_special_tokens=False).ids)


def guide_lines(path):  # visible text of a station file, one element per line (keeps Gemma fast)
    lines = (html.unescape(re.sub(r'<[^>]+>', '', l)).strip() for l in path.read_text().splitlines())
    return [l for l in lines if l]


ids = sorted(p.stem for p in (ROOT / 'src/stations/en').glob('*.html') if (ROOT / 'src/stations' / p.name).exists())
corpus = [[l for i in ids for l in guide_lines(ROOT / d / f'{i}.html')] for d in ('src/stations/en', 'src/stations')]

data = {
    'vocab': [o200k.n_vocab, llama.get_vocab_size(), gemma.get_vocab_size()],
    # partial UTF-8 bytes (a letter split across tokens) show as \xNN
    'texts': {t: [[[b.decode('utf-8', 'backslashreplace'), i] for b, i in pieces(k, t)] for k in range(3)] for t in TEXTS},
    'pair': PAIR,
    'guide': {'topics': len(ids), 'chars': [sum(map(len, c)) for c in corpus],
              'tokens': [[sum(count(k, l) for l in c) for c in corpus] for k in range(3)]},
}
out = ROOT / 'src/scripts/tokens-data.json'
out.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
g = data['guide']
for k, (en, pl) in enumerate(g['tokens']):
    print(['GPT-4o', 'Llama 3', 'Gemma 3'][k], f'guide EN {en} ({g["chars"][0] / en:.2f} ch/tok), PL {pl} ({g["chars"][1] / pl:.2f} ch/tok), PL/EN {pl / en:.2f}')
print('wrote', out.relative_to(ROOT), out.stat().st_size, 'bytes')
