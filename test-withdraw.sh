#!/bin/bash
#
# test-withdraw.sh - 测试提现系统
#

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================="
echo "ClawHub 自动提现系统 - 测试"
echo "=========================================="
echo ""

# 1. 检查文件
echo "1️⃣  检查文件..."
for file in auto-withdraw.sh withdraw-config.json withdrawal-tracker.py; do
    if [[ -f "$file" ]]; then
        echo "   ✅ $file"
    else
        echo "   ❌ $file (缺失)"
    fi
done
echo ""

# 2. 检查配置
echo "2️⃣  检查配置..."
if command -v jq &> /dev/null; then
    threshold=$(jq -r '.withdraw_threshold' withdraw-config.json 2>/dev/null || echo "未设置")
    wallet=$(jq -r '.wallet_address' withdraw-config.json 2>/dev/null || echo "未设置")
    echo "   提现阈值：¥$threshold"
    if [[ -z "$wallet" || "$wallet" == "null" ]]; then
        echo "   钱包地址：⚠️  未设置（需要先绑定）"
    else
        echo "   钱包地址：$wallet"
    fi
else
    echo "   ⚠️  jq 未安装，跳过配置检查"
fi
echo ""

# 3. 初始化追踪器
echo "3️⃣  初始化追踪器..."
python3 withdrawal-tracker.py --init
echo ""

# 4. 列出记录
echo "4️⃣  当前提现记录:"
python3 withdrawal-tracker.py --list --limit 5
echo ""

# 5. 测试余额检查
echo "5️⃣  测试余额检查（不实际提现）..."
./auto-withdraw.sh --check-only
echo ""

echo "=========================================="
echo "✅ 测试完成"
echo "=========================================="
echo ""
echo "📍 下一步："
echo "   1. 访问 https://clawhub.ai/settings/payout 绑定钱包"
echo "   2. 编辑 withdraw-config.json 填写钱包地址"
echo "   3. 运行 ./auto-withdraw.sh --check-only 测试"
echo ""
