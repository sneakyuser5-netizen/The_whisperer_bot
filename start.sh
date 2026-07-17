#!/bin/bash

echo "🚀 Starting WhisperBot..."

npm install pm2 --save

npx pm2 describe whisperbot >/dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "♻️ Restarting existing WhisperBot..."
    npx pm2 restart whisperbot --attach
else
    echo "✨ Starting WhisperBot for the first time..."
    npx pm2 start index.js --name whisperbot --attach
fi
