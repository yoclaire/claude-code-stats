#!/usr/bin/env bash
set -euo pipefail

STATS_FILE="${HOME}/.claude/stats-cache.json"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DATA_DIR="${SCRIPT_DIR}/data"

# Determine instance name: argument > .instance-name file > hostname
if [[ -n "${1:-}" ]]; then
  INSTANCE="$1"
elif [[ -f "${SCRIPT_DIR}/.instance-name" ]]; then
  INSTANCE="$(cat "${SCRIPT_DIR}/.instance-name")"
else
  INSTANCE="$(hostname -s)"
fi

if [[ ! -f "$STATS_FILE" ]]; then
  echo "Error: Claude Code stats not found at $STATS_FILE"
  exit 1
fi

if ! command -v jq &> /dev/null; then
  echo "Error: jq is required but not installed"
  exit 1
fi

echo "Syncing stats for instance: $INSTANCE"

# Extract and transform stats
jq --arg name "$INSTANCE" --arg date "$(date +%Y-%m-%d)" '{
  instanceName: $name,
  lastUpdated: $date,
  totalTokens: ([.modelUsage[] | (.inputTokens // 0) + (.outputTokens // 0) + (.cacheReadInputTokens // 0) + (.cacheCreationInputTokens // 0)] | add),
  modelUsage: (
    .modelUsage | to_entries | map({
      key: .key,
      value: ((.value.inputTokens // 0) + (.value.outputTokens // 0) + (.value.cacheReadInputTokens // 0) + (.value.cacheCreationInputTokens // 0))
    }) | from_entries
  ),
  dailyTokens: [
    .dailyModelTokens[] | {
      date: .date,
      tokens: ([.tokensByModel[]] | add)
    }
  ]
}' "$STATS_FILE" > "${DATA_DIR}/${INSTANCE}.json"

echo "Wrote ${DATA_DIR}/${INSTANCE}.json"

# Git operations
cd "$SCRIPT_DIR"
git add "data/${INSTANCE}.json"

if git diff --cached --quiet; then
  echo "No changes to commit"
else
  git commit -m "stats: update ${INSTANCE} $(date +%Y-%m-%d)"
  git push
  echo "Pushed updated stats"
fi
