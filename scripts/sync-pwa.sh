#!/usr/bin/env bash
# يزامن شجرة pwa/ في المستودع مع شجرة النشر المبنية (بعد python3 build.py) ثم يعيد توليد _headers
set -e
SRC="${1:-/mnt/user-data/outputs/pwa}"
mkdir -p pwa && cp -r "$SRC"/. pwa/ && rm -rf pwa/worker
python3 scripts/gen-headers.py pwa
