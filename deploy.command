#!/bin/bash
cd /Users/fednerfrancois/Claude/Projects/tchotchopay
LOG="/tmp/tchotchopay-deploy-log.txt"
echo "=== Deploy $(date) ===" > "$LOG"

# Remove stale files that confuse Netlify
rm -f deploy-log.txt
rm -rf .netlify/functions .netlify/functions-internal .netlify/v1

# Write the site link file directly (skips 'netlify link' prompt)
mkdir -p .netlify
echo '{"siteId":"030f5b79-ef65-4497-ad97-49153b00c893"}' > .netlify/state.json

echo "Installing Netlify CLI..." | tee -a "$LOG"
npm_config_cache="$(pwd)/.npm-cache" npm install netlify-cli --no-save --silent 2>&1 | tee -a "$LOG"

echo "Checking Netlify auth..." | tee -a "$LOG"
NETLIFY_STATUS=$(./node_modules/.bin/netlify status 2>&1)
if echo "$NETLIFY_STATUS" | grep -q "Logged in\|Current user"; then
  echo "Already logged in." | tee -a "$LOG"
else
  echo "Not logged in — opening browser to authenticate..." | tee -a "$LOG"
  ./node_modules/.bin/netlify login
fi

echo "Deploying to Netlify..." | tee -a "$LOG"
npm_config_cache="$(pwd)/.npm-cache" ./node_modules/.bin/netlify deploy \
  --prod \
  --dir . \
  --functions netlify/functions \
  --site 030f5b79-ef65-4497-ad97-49153b00c893 \
  --skip-functions-cache \
  2>&1 | tee -a "$LOG"

echo ""
echo "Deploy finished. Log: /tmp/tchotchopay-deploy-log.txt"
echo "You can close this window."
