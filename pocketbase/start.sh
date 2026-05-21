#!/bin/bash
set -e

echo "Current directory: $(pwd)"
echo "Files here: $(ls -la)"

if [ ! -f "./pocketbase" ]; then
  echo "ERROR: pocketbase binary not found!"
  ls -la
  exit 1
fi

echo "Found PocketBase binary - starting..."
chmod +x ./pocketbase
./pocketbase serve --http=0.0.0.0:${PORT:-8090}
