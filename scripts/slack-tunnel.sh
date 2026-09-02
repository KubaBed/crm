#!/usr/bin/env bash
set -euo pipefail

hostname="${SLACK_TUNNEL_HOSTNAME:-}"
name="${SLACK_TUNNEL_NAME:-crm-dev}"
port="${SLACK_TUNNEL_PORT:-3001}"

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -z "$hostname" ] && [ -f "$root/.env" ]; then
	hostname="$(grep -E '^SLACK_TUNNEL_HOSTNAME=' "$root/.env" | tail -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | awk '{print $1}' || true)"
fi

if [ -z "$hostname" ]; then
	cat >&2 <<'MESSAGE'
Set SLACK_TUNNEL_HOSTNAME to the name you want, on a domain in your Cloudflare
account. It is the hostname Slack keeps, so pick one and never change it:

  SLACK_TUNNEL_HOSTNAME="crm-dev.example.com"

MESSAGE
	exit 1
fi

if ! command -v cloudflared >/dev/null 2>&1; then
	echo "cloudflared is not installed. brew install cloudflared" >&2
	exit 1
fi

if [ ! -f "$HOME/.cloudflared/cert.pem" ]; then
	cat >&2 <<'MESSAGE'
cloudflared is not signed in. This opens a browser once, and once only:

  cloudflared tunnel login

MESSAGE
	exit 1
fi

if ! cloudflared tunnel info "$name" >/dev/null 2>&1; then
	echo "Creating the $name tunnel."
	cloudflared tunnel create "$name"
fi

echo "Pointing $hostname at the $name tunnel."
cloudflared tunnel route dns --overwrite-dns "$name" "$hostname"

cat <<MESSAGE

Slack's Event Subscriptions request URL is, and stays:

  https://$hostname/webhooks/slack/events

MESSAGE

exec cloudflared tunnel run --url "http://127.0.0.1:$port" "$name"
