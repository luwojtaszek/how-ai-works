#!/usr/bin/env bash
# Browser QA for every page in both languages: layout (clipped text, elements escaping cards,
# SVG labels outside charts, small tap targets) and widgets (every control exercised, no
# console errors, no NaN/undefined in widget output, no Polish text left on English pages) and internal links.
# Usage: scripts/qa.sh [topic-id ...]   (default: all pages). Needs bun, python3, agent-browser.
# Parallel runs: set QA_PORT, QA_SESSION and QA_OUT (an absolute build dir outside /tmp) per run.
set -uo pipefail
cd "$(dirname "$0")/.."
port=${QA_PORT:-4498} ses=${QA_SESSION:-qa} out=${QA_OUT:-$PWD/dist}
bun run build --outDir "$out" >/dev/null || exit 1
python3 -m http.server $port --bind 127.0.0.1 --directory "$out" >/dev/null 2>&1 &
srv=$!
trap 'kill $srv; agent-browser --session $ses close >/dev/null 2>&1 || true' EXIT
sleep 1
ab() { agent-browser --session $ses ${AB_ARGS:---args --no-sandbox} "$@" 2>/dev/null; }
ids=("$@"); [ ${#ids[@]} -eq 0 ] && ids=("" $(bun -e "import {ORDER} from './src/data.js'; console.log(ORDER.join(' '))"))
# English pages use English slugs (SLUG_EN in src/data.en.js), Polish pages use the topic id.
slug() { [ -z "$2" ] || [ "$1" = pl/ ] && { echo "$2"; return; }; bun -e "import {SLUG_EN} from './src/data.en.js'; console.log(SLUG_EN['$2']||'$2')"; }
fail=0
python3 scripts/qa/links.py "$out" || fail=1
for vp in "390 844" "1440 900"; do for lang in "" "pl/"; do for id in "${ids[@]}"; do
  s=$(slug "$lang" "$id"); url="http://127.0.0.1:$port/$lang$s${s:+/}"
  ab set viewport ${vp% *} ${vp#* } >/dev/null
  ab open "$url" >/dev/null; sleep 0.3; a=$(ab eval "$(cat scripts/qa/layout.js)")
  ab open "$url" >/dev/null; sleep 0.3; b=$(ab eval "$(cat scripts/qa/widgets.js)")
  [ "$a" = '"ok"' ] || { echo "LAYOUT ${vp% *} /$lang$id: $a"; fail=1; }
  case "$b" in *'px ok"') ;; *) echo "WIDGETS ${vp% *} /$lang$id: $b"; fail=1;; esac
done; done; done
errs=$(ab console | grep -ci error || true); [ "$errs" = 0 ] || { echo "console errors: $errs"; fail=1; }
[ $fail = 0 ] && echo "QA ok" || echo "QA found issues"
exit $fail
