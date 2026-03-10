#!/bin/bash
# ============================================================================
# Revenue Monitor Pro - 快速测试脚本
# 功能：测试系统各组件是否正常工作
# ============================================================================

set -e

WORKSPACE="$HOME/.openclaw/workspace"
SCRIPTS_DIR="$WORKSPACE/scripts"
DATA_DIR="$WORKSPACE/data/revenue"
LOGFILE="$HOME/Library/Logs/skillpay-revenue-test.log"

echo "🐾 Revenue Monitor Pro - 系统测试"
echo "=================================="
echo ""

# 测试 1：检查文件是否存在
echo "📁 检查文件..."
files=(
    "scripts/revenue-monitor-pro.sh"
    "scripts/revenue-alert-config.json"
    "scripts/revenue-monitor.crontab"
    "scripts/revenue_analyzer.py"
    "scripts/REVENUE-MONITOR-README.md"
)

all_exist=true
for file in "${files[@]}"; do
    if [[ -f "$WORKSPACE/$file" ]]; then
        echo "  ✓ $file"
    else
        echo "  ✗ $file (缺失)"
        all_exist=false
    fi
done

if ! $all_exist; then
    echo ""
    echo "❌ 部分文件缺失，请重新安装"
    exit 1
fi

# 测试 2：检查目录结构
echo ""
echo "📂 检查目录..."
dirs=(
    "$DATA_DIR"
    "$WORKSPACE/reports"
)

for dir in "${dirs[@]}"; do
    if [[ -d "$dir" ]]; then
        echo "  ✓ $dir"
    else
        echo "  ✗ $dir (创建中...)"
        mkdir -p "$dir"
    fi
done

# 测试 3：检查执行权限
echo ""
echo "🔐 检查执行权限..."
if [[ -x "$SCRIPTS_DIR/revenue-monitor-pro.sh" ]]; then
    echo "  ✓ revenue-monitor-pro.sh 可执行"
else
    echo "  ✗ revenue-monitor-pro.sh 无执行权限"
    chmod +x "$SCRIPTS_DIR/revenue-monitor-pro.sh"
    echo "  ✓ 已添加执行权限"
fi

if [[ -x "$SCRIPTS_DIR/revenue_analyzer.py" ]]; then
    echo "  ✓ revenue_analyzer.py 可执行"
else
    echo "  ✗ revenue_analyzer.py 无执行权限"
    chmod +x "$SCRIPTS_DIR/revenue_analyzer.py"
    echo "  ✓ 已添加执行权限"
fi

# 测试 4：检查配置
echo ""
echo "⚙️  检查配置..."
if python3 -c "import json; json.load(open('$SCRIPTS_DIR/revenue-alert-config.json'))" 2>/dev/null; then
    echo "  ✓ revenue-alert-config.json 格式正确"
    
    # 显示配置摘要
    echo ""
    echo "配置摘要："
    python3 <<PYEOF
import json
with open('$SCRIPTS_DIR/revenue-alert-config.json') as f:
    config = json.load(f)
print(f"  - 告警阈值：{config.get('alert_threshold', 30)}%")
print(f"  - 告警邮箱：{config.get('alert_email', '未配置')}")
print(f"  - 飞书 webhook: {'已配置' if config.get('feishu_webhook') else '未配置'}")
PYEOF
else
    echo "  ✗ revenue-alert-config.json 格式错误"
fi

# 测试 5：检查 clawhub CLI
echo ""
echo "🔧 检查 clawhub CLI..."
if command -v clawhub &> /dev/null; then
    echo "  ✓ clawhub 已安装"
    
    # 测试 clawhub 命令（不实际执行）
    echo "  ℹ️  测试 clawhub 连接..."
    if clawhub --version &>/dev/null; then
        echo "  ✓ clawhub CLI 正常"
    else
        echo "  ⚠️  clawhub CLI 可能未登录"
    fi
else
    echo "  ✗ clawhub 未安装"
    echo "  提示：运行 'npm install -g clawhub' 安装"
fi

# 测试 6：检查 crontab
echo ""
echo "⏰ 检查 crontab..."
if crontab -l 2>/dev/null | grep -q "revenue-monitor-pro.sh"; then
    echo "  ✓ Revenue Monitor 定时任务已安装"
    echo ""
    echo "已安装的任务："
    crontab -l 2>/dev/null | grep "revenue-monitor" | head -5
else
    echo "  ⚠️  Revenue Monitor 定时任务未安装"
    echo "  提示：运行 './scripts/install-revenue-monitor.sh' 安装"
fi

# 测试 7：运行数据分析器测试
echo ""
echo "🧪 测试数据分析器..."
if python3 "$SCRIPTS_DIR/revenue_analyzer.py" trend &>/dev/null; then
    echo "  ✓ 数据分析器工作正常"
else
    echo "  ⚠️  数据分析器测试失败（可能是数据文件不存在）"
fi

# 测试 8：创建测试数据
echo ""
echo "📊 创建测试数据..."
if [[ ! -f "$DATA_DIR/revenue_history.json" ]]; then
    echo '{"records":[]}' > "$DATA_DIR/revenue_history.json"
    echo "  ✓ 创建历史数据文件"
fi

if [[ ! -f "$DATA_DIR/skill_stats.json" ]]; then
    echo '{"skills":[],"last_updated":0}' > "$DATA_DIR/skill_stats.json"
    echo "  ✓ 创建 Skill 统计文件"
fi

# 测试 9：模拟收入数据（用于测试）
echo ""
read -p "是否生成模拟测试数据？[y/N]: " generate_data

if [[ "$generate_data" =~ ^[Yy]$ ]]; then
    python3 <<'PYEOF'
import json
from datetime import datetime, timedelta
import random

DATA_DIR = '/Users/admin/.openclaw/workspace/data/revenue'

# 生成最近 7 天的模拟数据
records = []
base_income = 250
base_downloads = 50

for i in range(7, -1, -1):
    timestamp = (datetime.now() - timedelta(days=i)).timestamp()
    date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d %H:%M:%S')
    
    # 添加一些随机波动
    income = base_income + random.randint(-50, 100)
    downloads = base_downloads + random.randint(-10, 20)
    
    records.append({
        'timestamp': int(timestamp),
        'date': date,
        'income': max(0, income),
        'downloads': max(0, downloads)
    })

# 保存
with open(f'{DATA_DIR}/revenue_history.json', 'w', encoding='utf-8') as f:
    json.dump({'records': records}, f, indent=2, ensure_ascii=False)

# 生成模拟 Skill 数据
skills = [
    {'name': '🎯 爆款标题魔法师', 'downloads': 12, 'income': 36, 'price': 5},
    {'name': '🔍 新币保命扫描器', 'downloads': 10, 'income': 50, 'price': 9},
    {'name': '🪂 空投资格检测', 'downloads': 8, 'income': 40, 'price': 8},
    {'name': '📝 Prompt 降维打击', 'downloads': 6, 'income': 30, 'price': 5},
    {'name': '🐋 Whale 地址追踪', 'downloads': 5, 'income': 25, 'price': 9},
    {'name': '🔍 Perplexica AI 搜索', 'downloads': 5, 'income': 15, 'price': 3},
    {'name': '🖼️ NFT 地板价监控', 'downloads': 4, 'income': 12, 'price': 5},
    {'name': '📦 亚马逊选品助手', 'downloads': 3, 'income': 24, 'price': 15},
    {'name': '🎓 名校文书润色', 'downloads': 2, 'income': 30, 'price': 29},
]

with open(f'{DATA_DIR}/skill_stats.json', 'w', encoding='utf-8') as f:
    json.dump({'skills': skills, 'last_updated': int(datetime.now().timestamp())}, f, indent=2, ensure_ascii=False)

print("  ✓ 已生成 7 天模拟收入数据")
print("  ✓ 已生成 9 个 Skill 模拟数据")
PYEOF
fi

# 测试 10：运行完整测试
echo ""
echo "🚀 运行完整功能测试..."
echo ""

echo "测试 1: 收入趋势分析"
python3 "$SCRIPTS_DIR/revenue_analyzer.py" trend | head -10

echo ""
echo "测试 2: 优化建议生成"
python3 "$SCRIPTS_DIR/revenue_analyzer.py" suggest | head -15

echo ""
echo "测试 3: 收入预测"
python3 "$SCRIPTS_DIR/revenue_analyzer.py" forecast | head -10

# 完成
echo ""
echo "=================================="
echo "✅ 测试完成！"
echo ""
echo "📊 查看日志：tail -f $LOGFILE"
echo "📁 数据目录：$DATA_DIR"
echo "📄 报告目录：$WORKSPACE/reports"
echo ""
echo "下一步："
echo "  1. 配置飞书 webhook 和邮箱"
echo "  2. 运行 ./scripts/install-revenue-monitor.sh 安装定时任务"
echo "  3. 等待下一次整点自动检查"
echo ""
echo "🐾 祝赚钱愉快！"
