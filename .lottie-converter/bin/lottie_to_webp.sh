#!/data/data/com.termux/files/usr/bin/bash
HEIGHT=512
WIDTH=512
FPS=60
OUTPUT_EXTENSION=.webp
QUALITY=75

SCRIPT_DIR=$(dirname "$0")

. $SCRIPT_DIR/lottie_common.sh && img2webp -lossy -d $((1000 / $FPS)) -q $QUALITY $PNG_FILES -o $OUTPUT
