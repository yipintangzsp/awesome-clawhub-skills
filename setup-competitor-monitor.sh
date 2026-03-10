#!/bin/bash
# setup-competitor-monitor.sh - 竞争情报监控系统安装脚本
# 一键部署 ClawHub 竞品监控工具

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "======================================"
echo "  ClawHub 竞争情报监控系统安装"
echo "======================================"
echo ""

# 1. 检查依赖
echo "[1/5] 检查依赖..."

if ! command -v python3 &> /dev/null; then
    echo "✗ 错误：需要 Python 3"
    echo "  请安装：brew install python3"
    exit 1
fi
echo "  ✓ Python 3: $(python3 --version)"

if ! command -v clawhub &> /dev/null; then
    echo "✗ 错误：需要 ClawHub CLI"
    echo "  请安装：npm install -g openclaw"
    exit 1
fi
echo "  ✓ ClawHub CLI: $(clawhub --cli-version 2>&1 | head -1)"

# 2. 创建数据目录
echo ""
echo "[2/5] 创建数据目录..."
mkdir -p "${SCRIPT_DIR}/competitor-data"
echo "  ✓ 数据目录：${SCRIPT_DIR}/competitor-data"

# 3. 设置执行权限
echo ""
echo "[3/5] 设置执行权限..."
chmod +x "${SCRIPT_DIR}/competitor-monitor.sh"
chmod +x "${SCRIPT_DIR}/setup-competitor-monitor.sh"
echo "  ✓ 脚本权限已设置"

# 4. 安装 crontab（可选）
echo ""
echo "[4/5] 配置定时任务..."
read -p "是否安装 crontab 定时任务？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 备份现有 crontab
    if crontab -l &> /dev/null; then
        crontab -l > "${SCRIPT_DIR}/crontab.backup.$(date +%Y%m%d%H%M%S)"
        echo "  ✓ 已备份现有 crontab"
    fi
    
    # 安装新的 crontab
    cat "${SCRIPT_DIR}/competitor-crontab.txt" | crontab -
    echo "  ✓ Crontab 已安装"
    echo "  查看任务：crontab -l"
else
    echo "  ⚠ 跳过 crontab 安装"
    echo "  手动安装：crontab ${SCRIPT_DIR}/competitor-crontab.txt"
fi

# 5. 首次运行测试
echo ""
echo "[5/5] 首次运行测试..."
read -p "是否立即执行一次监控测试？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "  运行监控脚本..."
    ./competitor-monitor.sh || {
        echo ""
        echo "  ⚠ 监控脚本执行失败（可能是速率限制）"
        echo "  这是正常的，稍后会自动重试"
    }
else
    echo "  ⚠ 跳过首次测试"
    echo "  手动运行：./competitor-monitor.sh"
fi

# 完成
echo ""
echo "======================================"
echo "  安装完成！"
echo "======================================"
echo ""
echo "📁 文件结构:"
echo "  competitor-monitor.sh    - 主监控脚本"
echo "  market-analyzer.py       - 市场分析工具"
echo "  opportunity-finder.py    - 机会发现工具"
echo "  competitor-crontab.txt   - Crontab 配置"
echo "  setup-competitor-monitor.sh - 安装脚本（本文件）"
echo "  competitor-data/         - 数据目录"
echo ""
echo "📋 使用指南:"
echo "  1. 手动运行：./competitor-monitor.sh"
echo "  2. 查看数据：ls -la competitor-data/"
echo "  3. 查看报告：cat competitor-data/market_analysis_*.md"
echo "  4. 查看 crontab: crontab -l"
echo ""
echo "⚠️  注意事项:"
echo "  - ClawHub API 有速率限制，脚本会自动重试"
echo "  - 建议首次运行在白天进行"
echo "  - 定期检查 competitor-data/ 目录大小"
echo ""
echo "🎯 下一步:"
echo "  1. 等待数据收集完成"
echo "  2. 查看生成的市场分析报告"
echo "  3. 根据机会发现报告选择开发方向"
echo "  4. 使用生成的 Skill 脚手架开始开发"
echo ""
