#!/bin/bash
# 公众号文章搬运到飞书 - 执行脚本
# 使用 playwright-scraper + feishu-doc API

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.json"
CACHE_DIR="$SCRIPT_DIR/cache"

# 创建缓存目录
mkdir -p "$CACHE_DIR"

# 解析参数
ARTICLE_URL=""
BATCH_MODE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            ARTICLE_URL="$2"
            shift 2
            ;;
        --batch)
            BATCH_MODE=true
            shift
            ;;
        *)
            echo "未知参数：$1"
            echo "用法：$0 --url <文章 URL> 或 $0 --batch"
            exit 1
            ;;
    esac
done

echo "📰 公众号文章搬运工具"
echo "=================="

# 读取配置
FEISHU_DOC_TOKEN=$(jq -r '.feishu_doc_token // ""' "$CONFIG_FILE")
PARENT_FOLDER=$(jq -r '.parent_folder_token // ""' "$CONFIG_FILE")

if [ -z "$FEISHU_DOC_TOKEN" ]; then
    echo "❌ 错误：请在 config.json 中配置 feishu_doc_token"
    exit 1
fi

# 单次抓取模式
if [ -n "$ARTICLE_URL" ]; then
    echo "🔗 抓取单篇文章：$ARTICLE_URL"
    node "$SCRIPT_DIR/fetch_article.js" --url "$ARTICLE_URL" --doc-token "$FEISHU_DOC_TOKEN"
    exit $?
fi

# 批量抓取模式
if [ "$BATCH_MODE" = true ]; then
    echo "📚 批量抓取配置的文章列表..."
    
    # 获取文章列表
    ARTICLES=$(jq -c '.articles[]' "$CONFIG_FILE")
    
    if [ -z "$ARTICLES" ]; then
        echo "⚠️  config.json 中没有配置文章列表"
        exit 0
    fi
    
    SUCCESS_COUNT=0
    FAIL_COUNT=0
    
    while IFS= read -r article; do
        URL=$(echo "$article" | jq -r '.url')
        TITLE=$(echo "$article" | jq -r '.title // ""')
        
        echo ""
        echo "📄 处理：${TITLE:-$URL}"
        
        if node "$SCRIPT_DIR/fetch_article.js" --url "$URL" --doc-token "$FEISHU_DOC_TOKEN" --title "$TITLE"; then
            ((SUCCESS_COUNT++))
        else
            ((FAIL_COUNT++))
        fi
        
        # 避免请求过快
        sleep 2
    done <<< "$ARTICLES"
    
    echo ""
    echo "✅ 批量抓取完成！成功：$SUCCESS_COUNT, 失败：$FAIL_COUNT"
    exit 0
fi

echo "❌ 请指定 --url 或 --batch 参数"
exit 1
