#!/bin/bash
# Twitter 书签查看脚本

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.json"

# 读取配置
DB_PATH=$(jq -r '.db_path // "./bookmarks.db"' "$CONFIG_FILE")

# 解析参数
TARGET_DATE=""
LIMIT=20

while [[ $# -gt 0 ]]; do
    case $1 in
        --date)
            TARGET_DATE="$2"
            shift 2
            ;;
        --limit)
            LIMIT="$2"
            shift 2
            ;;
        *)
            echo "未知参数：$1"
            echo "用法：$0 [--date YYYY-MM-DD] [--limit 数量]"
            exit 1
            ;;
    esac
done

# 检查数据库是否存在
if [ ! -f "$DB_PATH" ]; then
    echo "❌ 数据库不存在：$DB_PATH"
    echo "请先运行 ./sync_bookmarks.sh 同步书签"
    exit 1
fi

echo "📚 Twitter 书签浏览"
echo "=================="

if [ -n "$TARGET_DATE" ]; then
    echo "📅 日期：$TARGET_DATE"
    # 转换日期为时间戳范围
    START_TS=$(date -j -f "%Y-%m-%d" "$TARGET_DATE" +%s 2>/dev/null || date -d "$TARGET_DATE" +%s)
    END_TS=$((START_TS + 86400))
    
    sqlite3 "$DB_PATH" <<EOF
.mode column
.headers on
.width 5 20 60
SELECT 
    substr(tweet_url, instr(tweet_url, 'status/') + 7, 20) as ID,
    author_username as 用户，
    substr(tweet_text, 1, 60) as 内容
FROM bookmarks 
WHERE bookmarked_at >= $START_TS AND bookmarked_at < $END_TS
ORDER BY bookmarked_at DESC
LIMIT $LIMIT;
EOF
else
    echo "📅 显示最新 $LIMIT 条书签"
    
    sqlite3 "$DB_PATH" <<EOF
.mode column
.headers on
.width 5 20 60
SELECT 
    substr(tweet_url, instr(tweet_url, 'status/') + 7, 20) as ID,
    author_username as 用户，
    substr(tweet_text, 1, 60) as 内容
FROM bookmarks 
ORDER BY bookmarked_at DESC
LIMIT $LIMIT;
EOF
fi

echo ""
echo "💡 提示：使用 --date YYYY-MM-DD 查看指定日期的书签"
