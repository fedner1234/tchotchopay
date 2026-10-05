#!/bin/bash
# TchotchoPay Reel Renderer — run this from Terminal
# It installs what's needed and renders all 4 MP4 reels

set -e
cd "$(dirname "$0")"

echo ""
echo "TchotchoPay Reel Renderer"
echo "========================="

# Check ffmpeg
if ! command -v ffmpeg &>/dev/null; then
  echo "Installing ffmpeg..."
  brew install ffmpeg
fi

# Check pycairo
python3 -c "import cairo" 2>/dev/null || {
  echo "Installing pycairo..."
  brew install pkg-config cairo 2>/dev/null || true
  pip3 install pycairo --break-system-packages
}

# Check Poppins font (needed for matching style)
if ! fc-list 2>/dev/null | grep -qi "Poppins"; then
  echo "Note: Poppins font not found — using system sans-serif."
  # Patch script to use system font
  sed -i '' 's/"Poppins"/"Helvetica Neue"/g' render_all_reels.py
fi

echo ""
echo "Rendering 4 reels..."
python3 render_all_reels.py

echo ""
echo "All done! Open the MP4 files in Finder:"
echo "  $(pwd)/reel-voye-lajan-kr.mp4"
echo "  $(pwd)/reel-usdc-kr.mp4"
echo "  $(pwd)/reel-kouman-kr.mp4"
echo "  $(pwd)/reel-refere-kr.mp4"
