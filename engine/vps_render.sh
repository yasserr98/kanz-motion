#!/usr/bin/env bash
# vps_render.sh - render a Kanz Motion project on a Linux server over SSH instead of this machine (saves local RAM).
#
# Set the server once in .env (git-ignored): KANZ_RENDER_HOST=<your ssh alias>, optionally
# KANZ_RENDER_DIR=<folder on the server> (default ~/kanz-motion-render). Nothing about the server lives in this repo.
#
#   bash engine/vps_render.sh <slug> <name> [extra render.py args]
#   bash engine/vps_render.sh short-house-always-wins v3
#   bash engine/vps_render.sh short-house-always-wins vpstest --stills 1,4,11
#   bash engine/vps_render.sh short-house-always-wins part --from 2 --to 6
#
# What it does:
#   1. Syncs engine/, runtime/, brand/, library/, node_modules/gsap/, projects/<slug>/ (without out/) and any
#      ../../shorts/<x>/photos-style folders the scene references, to the server folder.
#      Only files whose size or mtime differ from the VPS copy are sent (the uplink is slow, ~0.7 MB/s).
#   2. Runs engine/render.py there under nohup (it keeps going if this SSH session drops) and polls its log.
#   3. Copies <name>.mp4 + <name>.sfx-used.json (or the stills-<name>/ folder) back into projects/<slug>/out/,
#      then deletes the VPS copy of the MP4 to keep the VPS disk lean.
#
# If this script is interrupted, the render continues; the log is out/<name>.vps.log on the VPS. Fetch later with:
#   scp <host>:<server folder>/projects/<slug>/out/<name>.mp4 projects/<slug>/out/
#
# One-time server setup: in the server folder, a Python venv in .venv with requirements.txt, the Playwright Chromium
# headless shell in .browsers (PLAYWRIGHT_BROWSERS_PATH=.browsers playwright install chromium), system ffmpeg. Needs only ssh, scp, tar, find, sort, comm, awk (Git Bash has them).
set -euo pipefail

if [ $# -lt 2 ]; then sed -n '2,8p' "$0"; exit 1; fi
SLUG=$1; NAME=$2; shift 2
ROOT=$(cd "$(dirname "$0")/.." && pwd)
P=projects/$SLUG
cd "$ROOT"
envval() { [ -f .env ] && grep -E "^$1=" .env | tail -n 1 | cut -d= -f2- | tr -d '"' || true; }
HOST=${KANZ_RENDER_HOST:-$(envval KANZ_RENDER_HOST)}
RDIR=${KANZ_RENDER_DIR:-$(envval KANZ_RENDER_DIR)}
[ -n "$HOST" ] || { echo "set KANZ_RENDER_HOST=<ssh alias> in .env" >&2; exit 1; }
RDIR=$(ssh "$HOST" "mkdir -p ${RDIR:-kanz-motion-render} && cd ${RDIR:-kanz-motion-render} && pwd")
[ -f "$P/index.html" ] || { echo "no such project: $P" >&2; exit 1; }

# --- 1. sync ---------------------------------------------------------------------------------------------
DIRS="engine runtime brand library node_modules/gsap $P"
# shared folders a scene reaches with ../../shorts/<something>/... (e.g. shorts/casino-wins-in-the-end/photos)
for d in $(grep -ohE '\.\./\.\./shorts/[^"'"'"'`) ]+/' "$P"/*.js "$P"/*.html 2>/dev/null | sed 's#^\.\./\.\./##; s#/$##' | sort -u); do
  [ -d "$d" ] && DIRS="$DIRS $d"
done

# "path<TAB>size<TAB>mtime-seconds", identical format on both ends so comm can diff them
LIST='find $DIRS -type f ! -path "*/out/*" ! -path "*/__pycache__/*" ! -name "*.pyc" -printf "%p\t%s\t%T@\n" 2>/dev/null | awk -F"\t" "{split(\$3,a,\".\"); print \$1\"\t\"\$2\"\t\"a[1]}" | LC_ALL=C sort'
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
DIRS=$DIRS bash -s <<< "$LIST" > "$TMP/local"
ssh "$HOST" "mkdir -p $RDIR && cd $RDIR && DIRS='$DIRS' bash -s" <<< "$LIST" > "$TMP/remote" || true
LC_ALL=C comm -23 "$TMP/local" "$TMP/remote" | cut -f1 > "$TMP/changed"
N=$(wc -l < "$TMP/changed")
if [ "$N" -gt 0 ]; then
  echo "sync: $N changed file(s) -> $HOST:$RDIR"
  tar czf - -T "$TMP/changed" | ssh "$HOST" "tar xzf - -C $RDIR"
else
  echo "sync: VPS already up to date"
fi

# --- 2. render on the VPS --------------------------------------------------------------------------------
ARGS=$(printf ' %q' "$@")
LOG="$P/out/$NAME.vps.log"
echo "render: $SLUG -> $NAME${ARGS} (on $HOST)"
ssh "$HOST" "cd $RDIR && mkdir -p $P/out && rm -f $LOG.exit && \
  nohup bash -c 'PLAYWRIGHT_BROWSERS_PATH=$RDIR/.browsers .venv/bin/python engine/render.py $P --name $NAME$ARGS; echo \$? > $LOG.exit' \
  > $LOG 2>&1 < /dev/null &"
START=$(date +%s)
while :; do
  sleep 15
  STATUS=$(ssh "$HOST" "cd $RDIR && tail -n 1 $LOG 2>/dev/null; cat $LOG.exit 2>/dev/null || true")
  echo "  [$(( $(date +%s) - START ))s] $(printf '%s' "$STATUS" | head -n 1)"
  CODE=$(printf '%s\n' "$STATUS" | sed -n '2p')
  if [ -n "$CODE" ]; then break; fi
done
if [ "$CODE" != "0" ]; then
  echo "render failed (exit $CODE). VPS log:" >&2
  ssh "$HOST" "tail -n 30 $RDIR/$LOG" >&2
  exit 1
fi

# --- 3. copy the result back -----------------------------------------------------------------------------
mkdir -p "$P/out"
scp -q "$HOST:$RDIR/$LOG" "$P/out/"
if [[ " $* " == *" --stills "* ]]; then
  scp -q -r "$HOST:$RDIR/$P/out/stills-$NAME" "$P/out/"
  echo "done -> $P/out/stills-$NAME/"
else
  scp -q "$HOST:$RDIR/$P/out/$NAME.mp4" "$HOST:$RDIR/$P/out/$NAME.sfx-used.json" "$P/out/"
  RSIZE=$(ssh "$HOST" "stat -c %s $RDIR/$P/out/$NAME.mp4")
  if [ "$(stat -c %s "$P/out/$NAME.mp4")" = "$RSIZE" ]; then
    ssh "$HOST" "rm -f $RDIR/$P/out/$NAME.mp4"   # verified local copy; keep the VPS disk lean
  fi
  echo "done -> $P/out/$NAME.mp4"
fi
