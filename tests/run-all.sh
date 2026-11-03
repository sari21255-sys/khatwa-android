#!/usr/bin/env bash
set -e
cd "$(dirname "$0")/.."
echo "== الوسيط =="; node tests/worker.test.mjs
echo "== التطبيق =="; NODE_PATH="$(npm root -g)" node tests/app.e2e.js
