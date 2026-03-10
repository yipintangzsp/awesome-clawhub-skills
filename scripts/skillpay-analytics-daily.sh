#!/bin/bash
# SkillPay 爆款数据分析 - 每天 14:00 执行

LOGFILE="$HOME/Library/Logs/skillpay-analytics.log"
WORKSPACE="$HOME/.openclaw/workspace"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始爆款数据分析..." >> "$LOGFILE"

cd "$WORKSPACE"

# 深度分析收入数据，生成优化报告
openclaw run "
爆款数据分析任务：
1. 读取 revenue-today.md 和最近 7 天的收入数据
2. 分析：
   - TOP5 热门 Skill（下载量 + 收入）
   - 增长率最快的 Skill
   - 零下载 Skill 及原因
3. 输出：
   - 成功模式总结（标题/定价/描述特点）
   - 失败案例分析
   - 下周优化建议（创建哪些新 Skill、调整哪些定价）
4. 更新 analytics-daily.md
" >> "$LOGFILE" 2>&1

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 爆款数据分析完成" >> "$LOGFILE"
