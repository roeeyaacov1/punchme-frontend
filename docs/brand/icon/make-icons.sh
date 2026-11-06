#!/usr/bin/env bash
# Turns one of the marks in this folder into the six icons in public/:
#
#   docs/brand/icon/make-icons.sh docs/brand/icon/a-three-cards-dark-back.svg
#
# The favicon is the option as drawn, rounded plate and all. The home-screen
# icons are full-bleed, since iOS and Android round or mask them themselves,
# and draw the mark smaller: APP for the plain ones, MASK for the maskable one,
# which must keep the mark inside the middle 80% circle. Chrome rasterises.
set -euo pipefail

src=${1:?usage: make-icons.sh <option.svg>}
APP=${APP:-0.88}
MASK=${MASK:-0.66}
CHROME=${CHROME:-"/c/Program Files/Google/Chrome/Application/chrome.exe"}
public="$(cd "$(dirname "$0")/../../.." && pwd)/public"
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

scale=$(sed -n 's/.*scale(\([0-9.]*\)).*/\1/p' "$src" | head -1)
fullbleed() { # $1 = factor on the option's own scale
  local s
  s=$(awk -v a="$scale" -v f="$1" 'BEGIN { printf "%.3f", a * f }')
  sed "s/ rx=\"7\" fill=\"#f67748\"/ fill=\"#f67748\"/; s/scale($scale)/scale($s)/" "$src"
}
fullbleed "$APP" > "$tmp/app.svg"
fullbleed "$MASK" > "$tmp/mask.svg"
cp "$src" "$tmp/fav.svg"

shot() { # $1 = svg, $2 = size, $3 = output in public/
  local page="$tmp/shot.html"
  printf '<!doctype html><body style="margin:0;background:transparent"><img src="%s" width="%s" height="%s" style="display:block">' \
    "$(basename "$1")" "$2" "$2" > "$page"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --default-background-color=00000000 --user-data-dir="$tmp/chrome" \
    --window-size="$2,$2" --screenshot="$(cygpath -w "$public/$3")" \
    "file:///$(cygpath -m "$page")" 2>/dev/null
}
cp "$src" "$public/favicon.svg"
shot "$tmp/fav.svg" 48 favicon.png
shot "$tmp/app.svg" 192 icon-192.png
shot "$tmp/app.svg" 512 icon-512.png
shot "$tmp/app.svg" 180 apple-touch-icon.png
shot "$tmp/mask.svg" 512 icon-maskable-512.png
echo "icons written to $public from $(basename "$src")"
