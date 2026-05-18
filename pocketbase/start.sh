#!/bin/bash
set -e

POCKETBASE_VERSION="0.38.0"
POCKETBASE_DIR="$(dirname "$0")"

echo "Checking for PocketBase binary..."

if [ ! -f "$POCKETBASE_DIR/pocketbase" ]; then
  echo "Downloading PocketBase v$POCKETBASE_VERSION..."
  curl -L "https://github.com/pocketbase/pocketbase/releases/download/v${POCKETBASE_VERSION}/pocketbase_${POCKETBASE_VERSION}_linux_amd64.zip" -o /tmp/pocketbase.zip
  unzip -q /tmp/pocketbase.zip -d "$POCKETBASE_DIR"
  chmod +x "$POCKETBASE_DIR/pocketbase"
  rm /tmp/pocketbase.zip
  echo "PocketBase downloaded successfully!"
else
  echo "PocketBase binary already exists"
fi

echo "Starting PocketBase..."
"$POCKETBASE_DIR/pocketbase" serve --http=0.0.0.0:${PORT:-8090}
