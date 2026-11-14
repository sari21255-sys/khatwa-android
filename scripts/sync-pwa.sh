#!/usr/bin/env bash
# بعد python3 build.py (يكتب index.html في شجرة النشر): ينسخ index.html المبني إلى pwa/ ويعيد توليد _headers.
# شجرة pwa/ في المستودع هي المرجع لباقي ملفات النشر (sw.js، الصفحات القانونية، config.js ...).
set -e
SRC="${1:-/mnt/user-data/outputs/pwa}"
cp "$SRC/index.html" pwa/index.html
python3 scripts/gen-headers.py pwa
