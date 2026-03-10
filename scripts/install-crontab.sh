#!/bin/bash
# 安装 crontab 配置

CRONTAB_FILE="$HOME/.openclaw/workspace/crontab"

echo "正在安装 crontab..."
crontab "$CRONTAB_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Crontab 安装成功！"
    echo ""
    echo "已安装的定时任务："
    crontab -l | grep "SkillPay"
else
    echo "❌ Crontab 安装失败"
    exit 1
fi
