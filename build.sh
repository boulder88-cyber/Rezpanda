#!/bin/bash
cd apps/web
npm install
npx vite build --outDir ../../dist/apps/web
