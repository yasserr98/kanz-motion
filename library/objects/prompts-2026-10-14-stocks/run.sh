#!/usr/bin/env bash
# usage: run.sh <prompt-name> <ref1> [ref2 ...]   -> codex image generation, log in out/<name>.log, image copied to out/<name>.png
set -u
cd "$(dirname "$0")"
mkdir -p out
name=$1; shift
args=()
for r in "$@"; do args+=(-i "$r"); done
start=$(date +%s)
codex exec --skip-git-repo-check -s read-only "${args[@]}" - < "$name.txt" > "out/$name.log" 2>&1
sid=$(grep -oE "session id: [0-9a-f-]+" "out/$name.log" | head -1 | cut -d' ' -f3)
img=$(ls -t "$HOME/.codex/generated_images/$sid/"*.png 2>/dev/null | head -1)
if [ -n "$img" ]; then cp "$img" "out/$name.png"; echo "$name ok $sid $(( $(date +%s) - start ))s"; else echo "$name FAILED $sid"; fi
