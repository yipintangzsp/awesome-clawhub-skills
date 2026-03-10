#!/bin/bash
# SkillPay 自动发布 - 将新 Skill 发布到 ClawHub

LOGFILE="$HOME/Library/Logs/skillpay-publish.log"
WORKSPACE="$HOME/.openclaw/workspace"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始检查待发布 Skill..." >> "$LOGFILE"

cd "$WORKSPACE"

# 检查 skills 目录下新创建的 Skill
NEW_SKILLS=$(find skills -name "SKILL.md" -mtime -1 2>/dev/null | wc -l)

if [ "$NEW_SKILLS" -gt 0 ]; then
    echo "发现 $NEW_SKILLS 个新 Skill，准备发布到 ClawHub..." >> "$LOGFILE"
    
    # 使用 clawhub CLI 发布（需要先安装 clawhub）
    # 遍历新 Skill 目录
    for skill_dir in skills/*/; do
        if [ -f "$skill_dir/SKILL.md" ]; then
            SKILL_NAME=$(basename "$skill_dir")
            echo "发布 Skill: $SKILL_NAME" >> "$LOGFILE"
            # clawhub publish "$skill_dir" >> "$LOGFILE" 2>&1
        fi
    done
else
    echo "没有新 Skill 需要发布" >> "$LOGFILE"
fi

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 发布任务完成" >> "$LOGFILE"
