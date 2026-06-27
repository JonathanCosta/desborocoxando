#!/bin/bash
# Stage 1 - Setup commands
cd /home/jonathan/Projetos/Diversos/desborocoxando

# Install all dependencies
npm install

# Copy PWA icons
mkdir -p public/pwaicons
cp docs/pwaicons/ios/192.png public/pwaicons/192.png
cp docs/pwaicons/ios/512.png public/pwaicons/512.png

# Verify
echo "Running npm run dev test..."
timeout 5 npm run dev || true
echo "Running tsc check..."
npx tsc --noEmit
