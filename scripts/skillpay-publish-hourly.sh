#!/bin/bash
# SkillPay 每小时发布 5 个 Skill（绕过限流）

LOGFILE="$HOME/Library/Logs/skillpay-publish-hourly.log"
WORKSPACE="$HOME/.openclaw/workspace"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始每小时 Skill 发布任务..." >> "$LOGFILE"

cd "$WORKSPACE"

# 使用 openclaw 批量发布 5 个 Skill 到 ClawHub
# 通过分批发布绕过 API 限流
openclaw run "
使用 clawhub 批量发布 Skill：
1. 检查 skills/ 目录下未发布的 Skill
2. 选择 5 个优先级最高的 Skill
3. 逐个发布到 ClawHub（每个间隔 30 秒绕过限流）
4. 记录发布状态到 publish-log.md
" >> "$LOGFILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 每小时发布任务完成" >> "$LOGFILE"
