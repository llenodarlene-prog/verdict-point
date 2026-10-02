#!/usr/bin/env bash
set -euo pipefail

: "${DEPLOY_HOST:?DEPLOY_HOST is required}"
: "${DEPLOY_USER:?DEPLOY_USER is required}"
: "${DEPLOY_ROOT:?DEPLOY_ROOT is required}"
: "${SSH_KNOWN_HOSTS:?SSH_KNOWN_HOSTS is required}"

deploy_port="${DEPLOY_PORT:-65002}"
if [[ ! "$deploy_port" =~ ^[0-9]{1,5}$ ]] || (( 10#$deploy_port < 1 || 10#$deploy_port > 65535 )); then
  echo "DEPLOY_PORT must be an integer from 1 to 65535" >&2; exit 2
fi

case "$DEPLOY_ROOT" in
  /|""|"$HOME"|"$HOME"/*) echo "Refusing unsafe DEPLOY_ROOT" >&2; exit 2 ;;
esac
if [[ ! "$DEPLOY_ROOT" =~ ^/[A-Za-z0-9._/-]+$ ]]; then echo "DEPLOY_ROOT contains unsafe characters" >&2; exit 2; fi

release="release-${GITHUB_SHA:-manual}"
known_hosts="$(mktemp)"
key_file="$(mktemp)"
cleanup(){ rm -f "$known_hosts" "$key_file"; }
trap cleanup EXIT
printf '%s\n' "$SSH_KNOWN_HOSTS" > "$known_hosts"
printf '%s\n' "${DEPLOY_SSH_KEY:?DEPLOY_SSH_KEY is required}" > "$key_file"
chmod 600 "$key_file"
ssh_opts=(-p "$deploy_port" -i "$key_file" -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$known_hosts")

ssh "${ssh_opts[@]}" "$DEPLOY_USER@$DEPLOY_HOST" "mkdir -p '$DEPLOY_ROOT/releases/$release'"
rsync -az --delete -e "ssh ${ssh_opts[*]}" dist/ "$DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_ROOT/releases/$release/"
ssh "${ssh_opts[@]}" "$DEPLOY_USER@$DEPLOY_HOST" "test -f '$DEPLOY_ROOT/releases/$release/index.html' && ln -sfn '$DEPLOY_ROOT/releases/$release' '$DEPLOY_ROOT/current.new' && mv -Tf '$DEPLOY_ROOT/current.new' '$DEPLOY_ROOT/current'"
echo "Activated $release"
