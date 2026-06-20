#!/bin/bash
set -e
echo "Starting build..."
echo "Node version: $(node --version)"
echo "NPM version: $(npm --version)"
 
echo "Installing root dependencies (for serverless functions)..."
npm install --legacy-peer-deps
 
cd apps/web
echo "Installing frontend dependencies..."
npm install --legacy-peer-deps
echo "Building..."
./node_modules/.bin/vite build --outDir ../../dist/apps/web
echo "Build complete!"
