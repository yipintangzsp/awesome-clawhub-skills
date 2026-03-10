#!/bin/bash
# 微博热搜爬虫脚本

OUTPUT_DIR="data/weibo"
mkdir -p "$OUTPUT_DIR"

# 爬取微博热搜
curl -s "https://weibo.com/ajax/side/hotSearch" | \
jq -r '.data.realtime[] | "\(.num|\(.topic_title)\t\(.hot_value)"' | \
head -50 > "$OUTPUT_DIR/hot-search-$(date +%Y%m%d).txt"

# 生成 Markdown 报告
cat > "$OUTPUT_DIR/hot-search-$(date +%Y%m%d).md" << EOF
# 微博实时热搜榜 - $(date '+%Y-%m-%d %H:%M')

| 排名 | 话题 | 热度值 |
|------|------|--------|
EOF

nl -ba "$OUTPUT_DIR/hot-search-$(date +%Y%m%d).txt" | \
awk -F'\t' '{print "| " $1 " | " $2 " | " $3 " |"}' >> "$OUTPUT_DIR/hot-search-$(date +%Y%m%d).md"

echo "微博热搜已保存到 $OUTPUT_DIR/hot-search-$(date +%Y%m%d).md"
