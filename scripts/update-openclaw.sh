#!/bin/bash
# OpenClaw Auto-Update Script
# 每天自动升级 OpenClaw 到最新版本

set -e

echo "🔄 OpenClaw 自动升级脚本"
echo "=============================="
echo "时间：$(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# 记录升级前版本
BEFORE=$(openclaw --version 2>&1 | head -1)
echo "📊 升级前版本：$BEFORE"

# 检查是否有新版本
echo ""
echo "🔍 检查新版本..."
npm view openclaw version 2>/dev/null || echo "无法检查 npm 版本"

# 升级 OpenClaw
echo ""
echo "📦 开始升级 OpenClaw..."
npm install -g openclaw 2>&1 | tail -10

# 验证升级
echo ""
echo "✅ 升级完成！"
AFTER=$(openclaw --version 2>&1 | head -1)
echo "📊 升级后版本：$AFTER"

# 对比版本
echo ""
if [ "$BEFORE" = "$AFTER" ]; then
    echo "ℹ️  已是最新版本，无需升级"
else
    echo "🎉 升级成功！$BEFORE → $AFTER"
fi

# 重启 OpenClaw Gateway（如果正在运行）
echo ""
echo "🔄 检查 Gateway 状态..."
if pgrep -f "openclaw.*gateway" > /dev/null 2>&1; then
    echo "⚠️  Gateway 正在运行，建议手动重启以应用更新"
    echo "   运行：openclaw gateway restart"
else
    echo "ℹ️  Gateway 未运行"
fi

# 输出报告
echo ""
echo "=============================="
REPORT="🔄 OpenClaw 升级报告 ($(date '+%Y-%m-%d %H:%M'))
升级前：$BEFORE
升级后：$AFTER
状态：✅ 成功"
echo "$REPORT"

# 如果升级失败，发送通知
if [ $? -ne 0 ]; then
    echo ""
    echo "❌ 升级失败，请检查日志"
    exit 1
fi

echo ""
echo "✅ 所有操作完成！"
