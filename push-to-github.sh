#!/bin/bash
# Run this once from Terminal to push TchotchoPay to GitHub
# After it succeeds, delete this file (it contains your token)

cd "/Users/fednerfrancois/Claude/Projects/tchotchopay"

git remote remove origin 2>/dev/null
git remote add origin https://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@github.com/naples115/tchotchopay.git
git branch -M main
git push -u origin main

echo ""
echo "✅ Done! Delete this file now: rm push-to-github.sh"
