#!/bin/bash
# SkillPay 收入日报生成 - 每天 20:00 执行

LOGFILE="$HOME/Library/Logs/skillpay-daily-report.log"
WORKSPACE="$HOME/.openclaw/workspace"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始生成收入日报..." >> "$LOGFILE"

cd "$WORKSPACE"

# 生成今日收入日报并推送给用户
openclaw run "
使用 revenue-monitor skill 生成今日收入日报：
1. 统计今日总收入、总下载量
2. 列出 TOP3 赚钱 Skill
3. 对比昨日数据（增长率）
4. 输出简洁日报到 revenue-today.md
5. 通过飞书推送给用户（张 sir）
格式要求：直接给数据，不要废话
" >> "$LOGFILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 收入日报生成完成" >> "$LOGFILE"
