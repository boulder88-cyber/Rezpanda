#!/bin/bash
set -e
echo "Moving to web directory..."
cd apps/web
echo "Installing dependencies..."
npm install --legacy-peer-deps
echo "Building with local vite..."
./node_modules/.bin/vite build --outDir ../../dist/apps/web
echo "Build complete!"
