#!/usr/bin/env bash
# يحدّث www/index.html من ملف التطبيق الأحدث (مرّر المسار: bash scripts/prepare-www.sh ../khatwa.html)
set -e
SRC="${1:-../pwa/index.html}"
python3 - "$SRC" <<'PY'
import re,sys
s=open(sys.argv[1],encoding='utf-8').read()
s=re.sub(r'<script>if\("serviceWorker".*?</script>\n?','',s,count=1)
open('www/index.html','w',encoding='utf-8').write(s)
print('www/index.html updated')
PY
