#!/bin/bash
# SkillPay 自动引流文章发布 - 每天 9:00 执行

LOGFILE="$HOME/Library/Logs/skillpay-morning-promo.log"
WORKSPACE="$HOME/.openclaw/workspace"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始执行晨间引流任务..." >> "$LOGFILE"

cd "$WORKSPACE"

# 发布引流文章到各大平台
openclaw run "
晨间引流任务（9:00 黄金时间）：
1. 检查 articles/promo/ 目录下待发布文章
2. 选择 1 篇高质量引流文章
3. 发布到：
   - 知乎（带 SkillPay 链接）
   - Twitter/X（带话题标签）
   - 小红书（如果适用）
4. 记录发布链接到 promo-log.md
5. 如果没有现成文章，基于热门 Skill 生成一篇新文章
" >> "$LOGFILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 晨间引流任务完成" >> "$LOGFILE"
