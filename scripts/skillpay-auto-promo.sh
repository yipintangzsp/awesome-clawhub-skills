#!/bin/bash
# SkillPay 自动引流 - 每天发布内容到各大平台

LOGFILE="$HOME/Library/Logs/skillpay-promo.log"
WORKSPACE="$HOME/.openclaw/workspace"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始执行自动引流任务..." >> "$LOGFILE"

cd "$WORKSPACE"

# 检查是否有待发布的文章
ARTICLE_COUNT=$(ls -1 articles/*.md 2>/dev/null | wc -l)

if [ "$ARTICLE_COUNT" -gt 0 ]; then
    echo "发现 $ARTICLE_COUNT 篇文章，准备发布..." >> "$LOGFILE"
    
    # 使用 openclaw 发布文章到知乎/Twitter
    openclaw run "检查 articles/ 目录下待发布的文章，发布到知乎和 Twitter，记录发布状态" >> "$LOGFILE" 2>&1
else
    echo "没有待发布的文章" >> "$LOGFILE"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 引流任务完成" >> "$LOGFILE"
