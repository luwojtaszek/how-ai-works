// Run: bun src/lib/typo.test.js
import assert from 'node:assert';
import { typo, typoHtml } from './typo.js';
const NB = ' ';
assert.equal(typo('kot i pies w domu', 'pl'), `kot i${NB}pies w${NB}domu`);
assert.equal(typo('a i w domu', 'pl'), `a${NB}i${NB}w${NB}domu`);
assert.equal(typo('na każdy ze 128 256 tokenów, ok. 70 mld', 'pl'), `na każdy ze${NB}128${NB}256 tokenów, ok.${NB}70${NB}mld`);
assert.equal(typo('(zobacz „RAG”)', 'pl'), `(zobacz${NB}„RAG”)`);
assert.equal(typo('chunka 50–100 tokenów', 'pl'), 'chunka 50–⁠100 tokenów');
assert.equal(typo('a cat in 2024 took 140 GB (see “RAG”)', 'en'), `a cat in 2024 took 140${NB}GB (see${NB}“RAG”)`);
assert.equal(typo('w 2024 roku', 'pl'), `w${NB}2024 roku`);
assert.equal(typo('140 GBit', 'en'), '140 GBit');
assert.equal(typoHtml('<p class="a b">w domu</p><script>a = "w x"</script><code>i j</code>', 'pl'), `<p class="a b">w${NB}domu</p><script>a = "w x"</script><code>i j</code>`);
console.log('typo ok');
