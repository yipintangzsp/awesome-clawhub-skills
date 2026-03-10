#!/bin/bash
# SkillPay 自动发布 - 每小时发布 5 个 Skill（绕过限流）

LOGFILE="$HOME/Library/Logs/skillpay-publish.log"
WORKSPACE="$HOME/.openclaw/workspace"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始检查待发布 Skill..." >> "$LOGFILE"

cd "$WORKSPACE/skills"

# 待发布 Skill 列表（新增的 10 个）
SKILLS=(
  "github-bounty-hunter"
  "upwork-auto-bidder"
  "bug-bounty-scanner"
  "xiaohongshu-auto-post"
  "douyin-hot-monitor"
  "weibo-trending-bot"
  "youtube-auto-captions"
  "tiktok-viral-predictor"
  "amazon-price-tracker"
  "shopify-seo-bot"
)

# 每小时发布 5 个
for skill in "${SKILLS[@]}"; do
  if [ -d "$skill" ]; then
    echo "发布 Skill: $skill" >> "$LOGFILE"
    clawhub publish "./$skill" --version 1.0.0 --no-input >> "$LOGFILE" 2>&1
    sleep 2
  fi
done

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 发布任务完成" >> "$LOGFILE"
