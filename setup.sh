#!/usr/bin/env bash
set -euo pipefail

# mars-writing setup script
# Usage: bash setup.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$HOME/.claude/skills"
DATA_DIR="$HOME/.mars-writing"

echo "=== mars-writing setup ==="
echo ""

# 1. Check Node.js
if ! command -v node &>/dev/null; then
  echo "Error: Node.js not found. Please install Node.js >= 20.0.0"
  echo "  https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  echo "Error: Node.js >= 20.0.0 required, found $(node -v)"
  exit 1
fi
echo "✓ Node.js $(node -v)"

# 2. Create skills directory
mkdir -p "$SKILLS_DIR"
echo "✓ Skills directory: $SKILLS_DIR"

# 3. Create symlinks (or copy if symlinks not supported)
install_skill() {
  local skill_name="$1"
  local src="$SCRIPT_DIR/skills/$skill_name"
  local dst="$SKILLS_DIR/$skill_name"

  if [ -e "$dst" ]; then
    echo "  ⚠ $dst already exists, skipping"
    return
  fi

  if ln -s "$src" "$dst" 2>/dev/null; then
    echo "✓ Symlinked: $skill_name"
  else
    # Fallback: copy
    cp -r "$src" "$dst"
    echo "✓ Copied: $skill_name (symlinks not supported)"
  fi
}

echo ""
echo "Installing skills..."
install_skill "mars-writing"
install_skill "wechat-studio"

# 4. Install npm dependencies for wechat-studio
echo ""
echo "Installing npm dependencies..."
WECHAT_DIR="$SKILLS_DIR/wechat-studio"
if [ -f "$WECHAT_DIR/package.json" ]; then
  npm install --prefix "$WECHAT_DIR" --production 2>&1 | tail -3
  echo "✓ npm dependencies installed"
else
  echo "⚠ package.json not found, skipping npm install"
fi

# 5. Create data directory
mkdir -p "$DATA_DIR/articles" "$DATA_DIR/records"
if [ ! -f "$DATA_DIR/read-books.json" ]; then
  echo '{"books":[]}' > "$DATA_DIR/read-books.json"
fi
echo "✓ Data directory: $DATA_DIR"

# 6. Check WeChat config
echo ""
WECHAT_CONFIG="$HOME/.config/wechat-studio/config.yaml"
if [ -f "$WECHAT_CONFIG" ]; then
  echo "✓ WeChat config found: $WECHAT_CONFIG"
else
  echo "⚠ WeChat config not found."
  echo "  Create it with your credentials:"
  echo ""
  echo "  mkdir -p ~/.config/wechat-studio"
  echo "  cat > ~/.config/wechat-studio/config.yaml << 'EOF'"
  echo "  wechat:"
  echo "    appid: YOUR_APP_ID"
  echo "    secret: YOUR_APP_SECRET"
  echo "  EOF"
  echo ""
  echo "  Get credentials at: https://developers.weixin.qq.com/platform"
fi

echo ""
echo "=== Setup complete ==="
echo ""
echo "Restart Claude Code to load the new skills."
