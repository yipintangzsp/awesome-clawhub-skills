#!/bin/bash
# Twitter 书签管理助手 - 同步脚本
# 使用 6551 API + SQLite 存储

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.json"

# 读取配置
API_KEY=$(jq -r '.api_key // ""' "$CONFIG_FILE")
API_SECRET=$(jq -r '.api_secret // ""' "$CONFIG_FILE")
USERNAME=$(jq -r '.twitter_username // ""' "$CONFIG_FILE")
DB_PATH=$(jq -r '.db_path // "./bookmarks.db"' "$CONFIG_FILE")
OUTPUT_DIR=$(jq -r '.output_dir // "./reports"' "$CONFIG_FILE")

# 检查配置
if [ -z "$API_KEY" ] || [ -z "$API_SECRET" ]; then
    echo "❌ 错误：请在 config.json 中配置 6551 API Key 和 Secret"
    exit 1
fi

if [ -z "$USERNAME" ]; then
    echo "❌ 错误：请在 config.json 中配置 twitter_username"
    exit 1
fi

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

echo "🐦 Twitter 书签同步工具"
echo "======================"
echo "👤 用户：$USERNAME"
echo "📅 时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 运行 Node.js 同步脚本
node "$SCRIPT_DIR/fetch_bookmarks.js" \
    --api-key "$API_KEY" \
    --api-secret "$API_SECRET" \
    --username "$USERNAME" \
    --db-path "$DB_PATH" \
    --output-dir "$OUTPUT_DIR"

echo ""
echo "✅ 书签同步完成！"
