#!/bin/bash
# SkillPay 收入监控 - 每小时检查并记录收入数据

LOGFILE="$HOME/Library/Logs/skillpay-revenue.log"
WORKSPACE="$HOME/.openclaw/workspace"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始检查 SkillPay 收入..." >> "$LOGFILE"

# 使用 clawhub CLI 检查收入
cd "$WORKSPACE"
clawhub earnings --today >> "$LOGFILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 收入检查完成" >> "$LOGFILE"
