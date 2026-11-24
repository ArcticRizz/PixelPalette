#!/bin/bash
set -e
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  pixelpalette_node="$(command -v node)"
elif [ -x "$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node" ]; then
  pixelpalette_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
else
  echo "Install Node.js LTS from https://nodejs.org, then run npm install in this folder."
  read -r -p "Press Return to close. "
  exit 1
fi
if [ ! -f node_modules/vite/bin/vite.js ]; then
  echo "Run npm install in this folder first, then open this launcher again."
  read -r -p "Press Return to close. "
  exit 1
fi
exec "$pixelpalette_node" node_modules/vite/bin/vite.js --open
