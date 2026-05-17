#!/bin/bash
set -e
cd apps/web
npm install --legacy-peer-deps
./node_modules/.bin/vite build --outDir ../../dist/apps/web
