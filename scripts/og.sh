#!/usr/bin/env bash
# Regenerate the social preview images public/og/<lang>/<id>.png from the /og-card/ pages.
# Run after adding or renaming topics. Needs bun, python3 and agent-browser.
set -euo pipefail
cd "$(dirname "$0")/.."
bun run build >/dev/null
python3 -m http.server 4499 --bind 127.0.0.1 --directory dist >/dev/null 2>&1 &
srv=$!
trap 'kill $srv; agent-browser --session og close >/dev/null 2>&1 || true' EXIT
sleep 1
ab() { agent-browser --session og ${AB_ARGS:---args --no-sandbox} "$@" >/dev/null; }
ab set viewport 1200 630
for f in dist/og-card/*/*/index.html; do
  rel=${f#dist/og-card/}; lang=${rel%%/*}; id=$(basename "$(dirname "$rel")")
  mkdir -p "public/og/$lang"
  ab open "http://127.0.0.1:4499/og-card/$lang/$id/"
  ab eval "document.fonts.ready.then(() => true)"
  ab screenshot "public/og/$lang/$id.png"
  echo "public/og/$lang/$id.png"
done
