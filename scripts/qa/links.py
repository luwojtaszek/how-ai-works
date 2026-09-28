# Every internal link in the build (HTML, llms.txt, sitemap, RSS) must resolve to a built file.
# Usage: python3 scripts/qa/links.py <build dir>
import glob, os, re, sys
# absolute links to the site itself count too; the address comes from astro.config.mjs
site = re.search(r"site:\s*'([^']+)'", open(os.path.join(os.path.dirname(__file__), '../../astro.config.mjs')).read()).group(1).rstrip('/')
os.chdir(sys.argv[1])
bad = {}
for f in glob.glob('**/*.html', recursive=True) + glob.glob('**/*.txt', recursive=True) + glob.glob('**/*.xml', recursive=True):
    s = open(f, encoding='utf-8').read()
    for h in re.findall(r'(?:href|src)="(/[^"#?]*)', s) + re.findall(re.escape(site) + r'(/[^\s)"<#?]*)', s):
        p = h.lstrip('/')
        if h == '/404/' or not p or os.path.exists(p) or os.path.exists(p.rstrip('/') + '/index.html'): continue
        bad.setdefault(h, set()).add(f)
for h, fs in sorted(bad.items()): print(f'BROKEN LINK {h} in {sorted(fs)[0]}' + (f' (+{len(fs) - 1})' if len(fs) > 1 else ''))
sys.exit(1 if bad else 0)
