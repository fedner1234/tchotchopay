#!/bin/bash
# netlify-cli-deploy.command — Deploy TchotchoPay with functions via Netlify CLI
# Double-click in Finder to run

cd "$(dirname "$0")"
echo "=== TchotchoPay CLI Deploy ==="
echo ""

TOKEN="nfp_nFVSzDkHCHH58hxZfzxCy8f2G7MNzQ1Aec71"
SITE_ID="030f5b79-ef65-4497-ad97-49153b00c893"

# Ensure Node / npm are available
if ! command -v node &>/dev/null; then
  echo "ERROR: Node.js not found. Install from https://nodejs.org and try again."
  read -p "Press Enter to close..."
  exit 1
fi

echo "Node: $(node -v)   npm: $(npm -v)"
echo ""

echo "Deploying site + functions to production via npx..."
echo ""

# Redirect HOME to /tmp to avoid root-owned ~/.npm permission error
export HOME=/tmp/tchotchopay-home
mkdir -p "$HOME"
export npm_config_cache=/tmp/npm-cache-tchotchopay

npx --yes netlify-cli@17 deploy \
  --prod \
  --auth "$TOKEN" \
  --site "$SITE_ID" \
  --dir "website-upload" \
  --functions "website-upload/netlify/functions" \
  --message "Deploy via CLI - website-upload with all functions"

echo ""
read -p "Press Enter to close..."
