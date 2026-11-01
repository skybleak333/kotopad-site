#!/usr/bin/env bash
set -euo pipefail
SITE_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GAME_ROOT="${1:-$SITE_ROOT/../game-ios/some-game}"
mkdir -p "$SITE_ROOT/.cache/cats" "$SITE_ROOT/public/assets/cats" "$SITE_ROOT/public/assets/screens"
awk '/^enum OutfitSlot:/{copy=1} copy{print} copy && /^}/{exit}' "$GAME_ROOT/Kotopad/Model/Wardrobe.swift" > "$SITE_ROOT/.cache/OutfitSlot.swift"
cp "$SITE_ROOT/scripts/render-cats.swift" "$SITE_ROOT/.cache/main.swift"
swiftc -O "$SITE_ROOT/.cache/main.swift" "$SITE_ROOT/.cache/OutfitSlot.swift" \
  "$GAME_ROOT/Kotopad/Core/CatKind.swift" "$GAME_ROOT/Kotopad/Core/SeededRandom.swift" \
  "$GAME_ROOT/Kotopad/Art/RGBA.swift" "$GAME_ROOT/Kotopad/Art/DrawKit.swift" "$GAME_ROOT/Kotopad/Art/CatLook.swift" \
  "$GAME_ROOT/Kotopad/Art"/CatPainter*.swift "$GAME_ROOT/Kotopad/Art"/AccessoryPainter*.swift \
  -o "$SITE_ROOT/.cache/render-cats"
"$SITE_ROOT/.cache/render-cats" "$SITE_ROOT/.cache/cats"
for file in "$SITE_ROOT/.cache/cats/"*.png; do
  name="$(basename "$file" .png)"
  if [ "$name" = social ]; then cp "$file" "$SITE_ROOT/public/assets/social.png"; else
    cwebp -quiet -q 92 -alpha_q 100 -resize 600 600 "$file" -o "$SITE_ROOT/public/assets/cats/$name.webp"
  fi
done
for lang in ru en; do
  for story in 1-merge 2-room 3-family 4-journey 5-style 6-zen; do
    cwebp -quiet -q 86 -resize 660 0 "$GAME_ROOT/.superpowers/appstore-raw/$lang/iphone-medium-$story.png" -o "$SITE_ROOT/public/assets/screens/$lang-$story.webp"
  done
done
cwebp -quiet -q 90 -resize 192 192 "$GAME_ROOT/Kotopad/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png" -o "$SITE_ROOT/public/assets/icon.webp"
sips -z 180 180 "$GAME_ROOT/Kotopad/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon-1024.png" --out "$SITE_ROOT/public/assets/apple-touch-icon.png" >/dev/null
printf 'Game artwork and screenshots imported.\n'
