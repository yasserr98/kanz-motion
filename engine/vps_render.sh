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
# Renders queue on the VPS: one at a time, in start order (the log says "queued" while waiting).
# If this script is interrupted, the render continues; the log is out/<name>.vps.log on the VPS. Fetch later with:
#   scp <host>:<server folder>/projects/<slug>/out/<name>.mp4 projects/<slug>/out/
#
# One-time server setup: in the server folder, a Python venv in .venv with requirements.txt, the Playwright Chromium
# headless shell in .browsers (PLAYWRIGHT_BROWSERS_PATH=.browsers playwright install chromium), system ffmpeg. Needs only ssh, scp, tar, find, sort, comm, awk (Git Bash has them).
set -euo pipefail

if [ $# -lt 2 ]; then sed -n '2,8p' "$0"; exit 1; fi
SLUG=$1; NAME=$2; shift 2
for value in "$SLUG" "$NAME"; do
  [[ "$value" =~ ^[A-Za-z0-9._-]+$ && "$value" != . && "$value" != .. ]] || { echo "invalid slug or version name: $value" >&2; exit 1; }
done
quote() { local q="'\''"; printf "'%s'" "${1//\'/$q}"; }   # safe for embedded single quotes
# Keepalives (2026-10-17): a dropped connection used to hang the poll or copy-back forever after the render had finished.
remote() { ssh -o ConnectTimeout=20 -o ServerAliveInterval=15 -o ServerAliveCountMax=4 "$HOST" "bash -c $(quote "$1")"; }
ROOT=$(cd "$(dirname "$0")/.." && pwd)
P=projects/$SLUG
[ -d "$ROOT/$P" ] || [ ! -d "$ROOT/examples/$SLUG" ] || P=examples/$SLUG   # curated worked examples
cd "$ROOT"
envval() { [ -f .env ] && grep -E "^$1=" .env | tail -n 1 | cut -d= -f2- | tr -d '
"' || true; }
HOST=${KANZ_RENDER_HOST:-$(envval KANZ_RENDER_HOST)}
RDIR=${KANZ_RENDER_DIR:-$(envval KANZ_RENDER_DIR)}
[ -n "$HOST" ] || { echo "set KANZ_RENDER_HOST=<ssh alias> in .env" >&2; exit 1; }
RDIR=${RDIR:-kanz-motion-render}
case "$RDIR" in
  '~/'*) RQ='"$HOME"/'$(quote "${RDIR:2}") ;;
  '~') RQ='"$HOME"' ;;
  *) RQ=$(quote "$RDIR") ;;
esac
RDIR=$(remote "mkdir -p -- $RQ && cd -- $RQ && pwd")
RQ=$(quote "$RDIR")
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
remote "mkdir -p -- $RQ && cd -- $RQ && DIRS=$(quote "$DIRS") bash -s" <<< "$LIST" > "$TMP/remote" || true
LC_ALL=C comm -23 "$TMP/local" "$TMP/remote" | cut -f1 > "$TMP/changed"
N=$(wc -l < "$TMP/changed")
if [ "$N" -gt 0 ]; then
  echo "sync: $N changed file(s) -> $HOST:$RDIR"
  tar czf - -T "$TMP/changed" | remote "tar xzf - -C $RQ"
else
  echo "sync: VPS already up to date"
fi

# --remix <mp4>: the VPS deleted its copy after the copy-back, so send the approved MP4 up when it is missing there
PREV=""
for arg in "$@"; do
  if [ "$PREV" = "--remix" ]; then
    SRC=$(basename -- "$arg")
    [ -f "$P/out/$SRC" ] || { echo "--remix: no $P/out/$SRC" >&2; exit 1; }
    RS=$(remote "stat -c %s -- $(quote "$RDIR/$P/out/$SRC") 2>/dev/null || true")
    if [ "$RS" != "$(stat -c %s "$P/out/$SRC")" ]; then
      echo "remix: sending $SRC ($(( $(stat -c %s "$P/out/$SRC") / 1048576 )) MB) to the VPS"
      remote "mkdir -p -- $(quote "$RDIR/$P/out")"
      tar czf - -C "$P/out" -- "$SRC" | remote "tar xzf - -C $(quote "$RDIR/$P/out")"
    fi
  fi
  PREV=$arg
done

# --- 2. render on the VPS --------------------------------------------------------------------------------
ARGS=""
if [ "$#" -gt 0 ]; then ARGS=$(printf ' %q' "$@"); fi
LOG="$P/out/$NAME.vps.log"
LQ=$(quote "$LOG")
EQ=$(quote "$LOG.exit")
printf -v INNER '%q ' env "PLAYWRIGHT_BROWSERS_PATH=$RDIR/.browsers" .venv/bin/python engine/render.py "$P" --name "$NAME" "$@"
# One render at a time on the VPS (Ahmed 2026-10-17: two at once ran Chromium out of memory on the 7 GB server).
# flock queues renders started by this script; the pgrep wait also covers any render already running without it.
# The [x] keeps the wait loop from matching its own command line.
WAIT='echo "queued: waiting for the VPS render slot"; while pgrep -f chrome-headless-shell-linu[x]64 >/dev/null; do sleep 10; done; echo "slot free: rendering"; '
RUN="flock $(quote "$RDIR/.render.lock") bash -c $(quote "$WAIT$INNER")"
RUN+="; echo \$? > $EQ"
echo "render: $SLUG -> $NAME${ARGS} (on $HOST)"
remote "cd -- $RQ && mkdir -p -- $(quote "$P/out") && rm -f -- $EQ && nohup bash -c $(quote "$RUN") > $LQ 2>&1 < /dev/null &"
START=$(date +%s)
while :; do
  sleep 15
  STATUS=$(remote "cd -- $RQ && { tail -n 1 -- $LQ 2>/dev/null; cat -- $EQ 2>/dev/null || true; }")
  echo "  [$(( $(date +%s) - START ))s] $(printf '%s' "$STATUS" | head -n 1)"
  CODE=$(printf '%s\n' "$STATUS" | sed -n '2p')
  if [ -n "$CODE" ]; then break; fi
done
if [ "$CODE" != "0" ]; then
  echo "render failed (exit $CODE). VPS log:" >&2
  remote "tail -n 30 -- $(quote "$RDIR/$LOG")" >&2
  exit 1
fi

# --- 3. copy the result back -----------------------------------------------------------------------------
mkdir -p "$P/out"
remote "cat -- $(quote "$RDIR/$LOG")" > "$P/out/$NAME.vps.log"
if [[ " $* " == *" --stills "* ]]; then
  remote "tar czf - -C $(quote "$RDIR/$P/out") -- $(quote "stills-$NAME")" | tar xzf - -C "$P/out/"
  echo "done -> $P/out/stills-$NAME/"
else
  remote "tar czf - -C $(quote "$RDIR/$P/out") -- $(quote "$NAME.mp4") $(quote "$NAME.sfx-used.json")" | tar xzf - -C "$P/out/"
  RSIZE=$(remote "stat -c %s -- $(quote "$RDIR/$P/out/$NAME.mp4")")
  if [ "$(stat -c %s "$P/out/$NAME.mp4")" = "$RSIZE" ]; then
    remote "rm -f -- $(quote "$RDIR/$P/out/$NAME.mp4")"   # verified local copy; keep the VPS disk lean
  fi
  echo "done -> $P/out/$NAME.mp4"
fi
