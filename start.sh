#!/bin/bash

echo "🚀 Starting WhisperBot..."

pm2 start index.js --name whisperbot --attach
