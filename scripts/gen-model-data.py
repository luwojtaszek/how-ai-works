"""Generate src/scripts/model-data.json: real attention weights and next-token
probabilities from a small open model, for the attention and sampling widgets.

Run on CPU in a throwaway venv, e.g.:
  uv venv ~/.cache/aic-venv && VIRTUAL_ENV=~/.cache/aic-venv uv pip install \
    --index-url https://download.pytorch.org/whl/cpu torch && \
    VIRTUAL_ENV=~/.cache/aic-venv uv pip install transformers
  ~/.cache/aic-venv/bin/python scripts/gen-model-data.py
"""
import json
from pathlib import Path

import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

MODEL = 'Qwen/Qwen3-0.6B-Base'  # Apache 2.0, no licence gate
LAYER, HEAD = 10, 3  # counted from 0; picked by hand: "it" -> "cat" is its clearest non-sink link
SENTENCES = {
    'en': ['The', 'cat', 'ran', 'to', 'the', 'kitchen', 'because', 'it', 'was', 'hungry'],
    'pl': ['Kot', 'wszedł', 'do', 'kuchni', ',', 'bo', 'był', 'głodny'],
}
PROMPTS = {  # key: know (model knows), wrong (confident but wrong), guess (model doesn't know)
    'en': {'know': 'Question: What is the capital of France?\nAnswer:',
           'wrong': 'Albert Einstein received the Nobel Prize in Physics for his theory of',
           'guess': 'The head of Pcim municipality in 1923 was Mr.'},
    'pl': {'know': 'Pytanie: Jakie miasto jest stolicą Polski?\nOdpowiedź:',
           'wrong': 'Albert Einstein dostał Nagrodę Nobla z fizyki za teorię',
           'guess': 'W 1923 roku wójtem gminy Pcim był pan'},
}
TOP = 8
OUT = Path(__file__).resolve().parent.parent / 'src/scripts/model-data.json'

tok = AutoTokenizer.from_pretrained(MODEL)
model = AutoModelForCausalLM.from_pretrained(MODEL, dtype=torch.float32, attn_implementation='eager').eval()
START = tok.eos_token_id  # Qwen adds no BOS; a start token keeps the attention sink off the first word


def attention(words):
    """Word-level weights of one head: rows averaged over a word's tokens, columns summed (Clark et al., 2019)."""
    ids, owner = [START], [0]
    for w, word in enumerate(words, 1):
        t = tok((' ' if w > 1 and word != ',' else '') + word, add_special_tokens=False)['input_ids']
        ids += t
        owner += [w] * len(t)
    with torch.no_grad():
        a = model(torch.tensor([ids]), output_attentions=True).attentions[LAYER][0, HEAD]  # tokens x tokens
    n = len(words) + 1
    to_word = torch.zeros(len(ids), n)
    to_word[range(len(ids)), owner] = 1
    cols = a @ to_word
    w = torch.stack([cols[[i for i, o in enumerate(owner) if o == r]].mean(0) for r in range(n)])
    return [[round(v, 3) for v in w[r, :r + 1].tolist()] for r in range(n)]


def show(t):
    return t.strip() or {'\n': '↵', ' ': '␣'}.get(t, repr(t))


def next_tokens(prompt):
    ids = [START] + tok(prompt)['input_ids']
    with torch.no_grad():
        logp = torch.log_softmax(model(torch.tensor([ids])).logits[0, -1], -1)
    v, i = logp.topk(TOP)
    return {'prompt': prompt, 'cover': round(v.exp().sum().item(), 3),
            'top': [[show(tok.decode([j])), round(x, 2)] for x, j in zip(v.tolist(), i.tolist())]}


data = {'model': MODEL.split('/')[1], 'layer': LAYER, 'head': HEAD,
        'att': {lang: {'words': words, 'w': attention(words)} for lang, words in SENTENCES.items()},
        'smp': {lang: {k: next_tokens(p) for k, p in ps.items()} for lang, ps in PROMPTS.items()}}
for a in data['att'].values():
    assert all(abs(sum(r) - 1) < 0.01 for r in a['w']), 'every attention row must sum to 1'
OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
print(f'wrote {OUT}')
