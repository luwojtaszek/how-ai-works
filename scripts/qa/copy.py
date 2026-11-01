#!/usr/bin/env python3
"""Reject known wording mistakes in guide text (see docs/writing.md). Add each new one here."""
import pathlib
import re
import sys

BANNED = [(re.compile(p, re.I), why) for p, why in [
    (r'krótko (ważn|żyj)', 'krótkotrwały'),
    (r'kto dzwoni|woła system', 'kto wysłał żądanie, wywołuje usługę'),
    (r'dowód tożsamości|dowodem tożsamości', 'poświadczenie'),
    (r'na okaziciela', 'token bearer, or say who can use it'),
    (r'SVID-(y|a|em|ów)\b|bundle’|odcięci\w* agenta', 'see the Polish table'),
    (r'in order to|delve|seamless|leverag|worth noting', 'plain English'),
    (r'where the model ends|gets out of the container', 'name what happens'),
    (r'—', 'no dashes in place of punctuation'),
]]


def findings(text):
    """(line number, matched text, advice) for each banned phrase."""
    return [(n, m.group(0), why) for n, line in enumerate(text.split('\n'), 1)
            for rx, why in BANNED for m in rx.finditer(line)]


def main():
    root = pathlib.Path(__file__).resolve().parents[2] / 'src'
    files = [*root.glob('stations/**/*.html'), root / 'data.js', root / 'data.en.js', root / 'changelog.js', root / 'scripts/app.js']
    bad = [f'{f.relative_to(root.parent)}:{n}: "{hit}" ({why})' for f in files for n, hit, why in findings(f.read_text(encoding='utf8'))]
    print('\n'.join(bad) or 'copy ok')
    return 1 if bad else 0


if __name__ == '__main__':
    assert [h[0] for h in findings('ok\nkrótko ważny token\nfine')] == [2]
    assert findings('krótkotrwałe poświadczenie') == []
    assert findings('A — B')[0][1] == '—'
    sys.exit(main())
