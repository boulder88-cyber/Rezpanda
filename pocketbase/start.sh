#!/bin/bash
set -e

POCKETBASE_DIR="$(dirname "$0")"

echo "Checking for PocketBase binary..."

if [ ! -f "$POCKETBASE_DIR/pocketbase" ]; then
  echo "PocketBase binary not found!"
  exit 1
fi

echo "Starting PocketBase..."
chmod +x "$POCKETBASE_DIR/pocketbase"
"$POCKETBASE_DIR/pocketbase" serve --http=0.0.0.0:${PORT:-8090}
