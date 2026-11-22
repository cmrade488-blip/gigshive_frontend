#!/usr/bin/env bash
# Mirror design/public-site/ from a local clone of gigshive_doc into this repo, and report whether
# packages/brand has drifted from gigshive_doc/brand.
#
# gigshive_doc is the source of truth for designs. Never edit design/ here: change it in
# gigshive_doc, pull, run this script, commit the result.
#
# Usage: bash scripts/sync-design.sh [path-to-gigshive_doc-clone]   (default: ../gigshive_doc)
set -euo pipefail

DOC_REPO="${1:-../gigshive_doc}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ ! -d "$DOC_REPO/design/public-site" ] || [ ! -d "$DOC_REPO/brand" ]; then
  echo "error: '$DOC_REPO' does not look like a gigshive_doc clone (needs design/public-site and brand)." >&2
  echo "Clone it first:  git clone https://github.com/cmrade488-blip/gigshive_doc.git ../gigshive_doc" >&2
  exit 1
fi
DOC_REPO="$(cd "$DOC_REPO" && pwd)"

if git -C "$DOC_REPO" rev-parse --git-dir >/dev/null 2>&1; then
  SHA="$(git -C "$DOC_REPO" rev-parse HEAD)"
  if ! git -C "$DOC_REPO" diff --quiet || ! git -C "$DOC_REPO" diff --cached --quiet; then
    echo "warning: gigshive_doc has uncommitted changes; the recorded commit will not match the files." >&2
  fi
else
  SHA="unknown (not a git clone)"
fi
echo "Source: $DOC_REPO @ $SHA"
echo "Tip: run 'git pull' in gigshive_doc first so you mirror the latest version."

SRC="$DOC_REPO/design/public-site"
DST="$HERE/design/public-site"
mkdir -p "$DST"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --delete --exclude 'SOURCE.md' "$SRC"/ "$DST"/
else
  find "$DST" -mindepth 1 -maxdepth 1 ! -name SOURCE.md -exec rm -rf {} +
  cp -R "$SRC"/. "$DST"/
fi
cat > "$DST/SOURCE.md" <<NOTE
# Mirrored folder: do not edit here

Copy of \`design/public-site\` from the gigshive_doc repository
(https://github.com/cmrade488-blip/gigshive_doc), commit \`$SHA\`.

To change it: edit it in gigshive_doc, then run \`bash scripts/sync-design.sh\` in this repo
and commit with \`chore(design): sync design from gigshive_doc\`.

Note: image paths inside the .dc.html sources point to \`../../brand/\`, which does not exist in this
repo (the brand kit lives in packages/brand). Use the PNG previews for visuals; the .dc.html files are
reference only.
NOTE
echo "Mirrored design/public-site."

echo
echo "Brand drift report (gigshive_doc/brand vs packages/brand):"
if diff -rq --exclude 'preview.*' --exclude 'package.json' --exclude 'node_modules' "$DOC_REPO/brand" "$HERE/packages/brand"; then
  echo "  no differences"
else
  echo "  ^ differences found. If packages/brand was changed on purpose, apply the same change in gigshive_doc;"
  echo "    otherwise copy the gigshive_doc version over packages/brand."
fi

echo
echo "Next:  git add design && git commit -m \"chore(design): sync design from gigshive_doc\""
