#!/bin/bash
# Push to GitHub — token removed for security
# Use: git push origin main (with credentials stored in macOS Keychain)
cd "/Users/fednerfrancois/Claude/Projects/tchotchopay"
git add index.html
git commit -m "Fix hero overlay pointer-events — restore Figma design with clickable buttons"
git push origin main
