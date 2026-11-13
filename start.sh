#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
PORT=8000
echo "Open http://127.0.0.1:$PORT/"
python3 -m http.server "$PORT"
