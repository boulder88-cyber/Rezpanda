#!/bin/bash
set -e
echo "Starting build..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
cd apps/web
echo "Installing dependencies..."
npm install --legacy-peer-deps
echo "Building..."
./node_modules/.bin/vite build --outDir ../../dist/apps/web
echo "Build complete!"
