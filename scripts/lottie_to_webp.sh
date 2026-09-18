#!/usr/bin/env bash

HEIGHT=384
WIDTH=384
FPS=20
OUTPUT_EXTENSION=.webp
QUALITY=75

SCRIPT_DIR=$(dirname "$0")

. "$SCRIPT_DIR/lottie_common.sh"

CONCAT_FILE="$TMP_PATH/frames.txt"

: > "$CONCAT_FILE"

while IFS= read -r PNG_FILE; do
  printf "file '%s'\n" "$PNG_FILE" >> "$CONCAT_FILE"
done < <(find "$TMP_PATH" -type f -name '*.png' | sort)

ffmpeg -y \
  -f concat \
  -safe 0 \
  -i "$CONCAT_FILE" \
  -vf "fps=$FPS,scale=$WIDTH:$HEIGHT:force_original_aspect_ratio=decrease" \
  -c:v libwebp_anim \
  -lossless 0 \
  -q:v "$QUALITY" \
  "$OUTPUT"
