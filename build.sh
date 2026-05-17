#!/bin/bash
set -e
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la
echo ""
echo "Looking for apps/web..."
if [ -d "apps/web" ]; then
  echo "Found apps/web!"
  cd apps/web
else
  echo "apps/web not found, searching..."
  find . -name "vite.config.js" -not -path "*/node_modules/*"
  exit 1
fi
echo "Installing dependencies..."
npm install --legacy-peer-deps
echo "Building..."
./node_modules/.bin/vite build --outDir ../../dist/apps/web
echo "Build complete!"
