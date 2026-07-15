#!/bin/bash

echo "🚀 Starting WhisperBot..."

npm install pm2 --save

npx pm2 start index.js --name whisperbot --attach
