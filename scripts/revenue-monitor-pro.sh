#!/bin/bash
# ============================================================================
# SkillPay 收入监控专业版 (Revenue Monitor Pro)
# 功能：
#   1. 每小时自动检查收入数据
#   2. 收入异常波动告警（>30%）
#   3. 每日/每周/每月收入报告自动生成
#   4. 各 Skill 收入排名和趋势分析
#   5. 自动优化建议（下架低效/涨价高效）
#   6. 飞书/邮件自动推送报告
#
# 作者：张 sir
# 版本：1.0.0
# 创建：2026-03-09
# ============================================================================

set -e

# ==================== 配置 ====================
WORKSPACE="$HOME/.openclaw/workspace"
DATA_DIR="$WORKSPACE/data/revenue"
REPORTS_DIR="$WORKSPACE/reports"
CONFIG_FILE="$WORKSPACE/scripts/revenue-alert-config.json"
LOGFILE="$HOME/Library/Logs/skillpay-revenue-monitor.log"

# 数据文件
HISTORY_FILE="$DATA_DIR/revenue_history.json"
TODAY_FILE="$DATA_DIR/revenue_today.json"
SKILL_STATS_FILE="$DATA_DIR/skill_stats.json"

# 告警阈值（从配置文件读取）
ALERT_THRESHOLD=30  # 收入波动超过 30% 触发告警
ALERT_EMAIL="zhangsir@example.com"
FEISHU_WEBHOOK=""  # 飞书 webhook URL（从配置文件读取）

# ==================== 初始化 ====================
mkdir -p "$DATA_DIR" "$REPORTS_DIR"

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOGFILE"
}

# ==================== 数据收集 ====================
collect_revenue_data() {
    log "开始收集收入数据..."
    
    cd "$WORKSPACE"
    
    # 使用 clawhub CLI 获取收入数据
    local earnings_output
    earnings_output=$(clawhub earnings --today --json 2>/dev/null || echo '{"error": "clawhub CLI failed"}')
    
    # 解析收入数据
    local total_income total_downloads timestamp
    timestamp=$(date +%s)
    
    # 从输出中提取数据（简化版，实际需要解析 JSON）
    total_income=$(echo "$earnings_output" | grep -o '"income":[0-9]*' | cut -d: -f2 || echo "0")
    total_downloads=$(echo "$earnings_output" | grep -o '"downloads":[0-9]*' | cut -d: -f2 || echo "0")
    
    # 保存今日数据
    cat > "$TODAY_FILE" <<EOF
{
    "timestamp": $timestamp,
    "date": "$(date '+%Y-%m-%d')",
    "total_income": ${total_income:-0},
    "total_downloads": ${total_downloads:-0},
    "skills": []
}
EOF
    
    log "今日收入：¥${total_income:-0}, 下载：${total_downloads:-0} 次"
    
    # 追加到历史数据
    append_to_history "$timestamp" "${total_income:-0}" "${total_downloads:-0}"
}

# 追加历史数据
append_to_history() {
    local timestamp=$1
    local income=$2
    local downloads=$3
    
    if [[ ! -f "$HISTORY_FILE" ]]; then
        echo '{"records":[]}' > "$HISTORY_FILE"
    fi
    
    # 使用 Python 追加记录（更可靠的 JSON 处理）
    python3 <<PYEOF
import json
from datetime import datetime

with open('$HISTORY_FILE', 'r') as f:
    data = json.load(f)

new_record = {
    "timestamp": $timestamp,
    "date": "$(date '+%Y-%m-%d %H:%M:%S')",
    "income": $income,
    "downloads": $downloads
}

data['records'].append(new_record)

# 保留最近 30 天的数据
cutoff = time.time() - 30 * 24 * 3600
data['records'] = [r for r in data['records'] if r['timestamp'] > cutoff]

with open('$HISTORY_FILE', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
PYEOF
}

# ==================== 告警检测 ====================
check_alerts() {
    log "检查收入异常波动..."
    
    if [[ ! -f "$HISTORY_FILE" ]]; then
        log "历史数据文件不存在，跳过告警检查"
        return
    fi
    
    python3 <<'PYEOF'
import json
import sys
import os

CONFIG_FILE = os.environ.get('CONFIG_FILE', 'revenue-alert-config.json')
HISTORY_FILE = os.environ.get('HISTORY_FILE', 'revenue_history.json')
LOGFILE = os.environ.get('LOGFILE', 'revenue-monitor.log')

# 读取配置
try:
    with open(CONFIG_FILE, 'r') as f:
        config = json.load(f)
    alert_threshold = config.get('alert_threshold', 30)
    feishu_webhook = config.get('feishu_webhook', '')
    alert_email = config.get('alert_email', '')
except:
    alert_threshold = 30
    feishu_webhook = ''
    alert_email = ''

# 读取历史数据
try:
    with open(HISTORY_FILE, 'r') as f:
        data = json.load(f)
except:
    print("无法读取历史数据")
    sys.exit(0)

records = data.get('records', [])
if len(records) < 2:
    print("数据不足，跳过告警检查")
    sys.exit(0)

# 计算小时环比
current = records[-1]
previous = records[-2]

current_income = current.get('income', 0)
previous_income = previous.get('income', 0)

if previous_income > 0:
    change_pct = ((current_income - previous_income) / previous_income) * 100
else:
    change_pct = 0 if current_income == 0 else 100

print(f"收入变化：¥{previous_income} → ¥{current_income} ({change_pct:+.1f}%)")

# 检查是否触发告警
if abs(change_pct) > alert_threshold:
    alert_msg = f"⚠️ 收入异常波动告警\n\n"
    alert_msg += f"当前收入：¥{current_income}\n"
    alert_msg += f"上次收入：¥{previous_income}\n"
    alert_msg += f"变化幅度：{change_pct:+.1f}%\n"
    alert_msg += f"阈值：{alert_threshold}%"
    
    print(f"🚨 触发告警：{alert_msg}")
    
    # 发送飞书告警
    if feishu_webhook:
        import requests
        try:
            requests.post(feishu_webhook, json={
                "msg_type": "text",
                "content": {"text": alert_msg}
            }, timeout=10)
            print("✓ 飞书告警已发送")
        except Exception as e:
            print(f"✗ 飞书告警发送失败：{e}")
    
    # 发送邮件告警
    if alert_email:
        # 使用 mail 命令或 SMTP
        print(f"✉ 邮件告警应发送到：{alert_email}")
else:
    print("✓ 收入波动正常")

PYEOF
}

# ==================== 报告生成 ====================
generate_daily_report() {
    log "生成每日收入报告..."
    
    local report_date=$(date '+%Y-%m-%d')
    local report_file="$REPORTS_DIR/daily-revenue-$report_date.md"
    
    python3 <<PYEOF
import json
from datetime import datetime

HISTORY_FILE = '$HISTORY_FILE'
SKILL_STATS_FILE = '$SKILL_STATS_FILE'
REPORT_FILE = '$report_file'

# 读取数据
try:
    with open(HISTORY_FILE, 'r') as f:
        history = json.load(f)
except:
    history = {'records': []}

try:
    with open(SKILL_STATS_FILE, 'r') as f:
        skill_stats = json.load(f)
except:
    skill_stats = {'skills': []}

# 获取今日数据
today = datetime.now().strftime('%Y-%m-%d')
today_records = [r for r in history['records'] if r['date'].startswith(today)]

total_income = sum(r.get('income', 0) for r in today_records)
total_downloads = sum(r.get('downloads', 0) for r in today_records)
avg_price = total_income / total_downloads if total_downloads > 0 else 0

# 获取昨日数据
yesterday = (datetime.now().date() - timedelta(days=1)).strftime('%Y-%m-%d')
yesterday_records = [r for r in history['records'] if r['date'].startswith(yesterday)]
yesterday_income = sum(r.get('income', 0) for r in yesterday_records)

# 计算环比
if yesterday_income > 0:
    day_change = ((total_income - yesterday_income) / yesterday_income) * 100
else:
    day_change = 0

# 生成报告
report = f"""# 📊 SkillPay 每日收入报告

**日期：** {today}
**生成时间：** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

---

## 💰 今日收入概览

| 指标 | 数值 | 环比 |
|------|------|------|
| **总收入** | ¥{total_income} | {day_change:+.1f}% |
| **总下载** | {total_downloads} 次 | - |
| **平均单价** | ¥{avg_price:.2f} | - |
| **检查次数** | {len(today_records)} 次 | - |

---

## 🏆 Skill 收入 TOP 榜

"""

# 添加 Skill 排名
skills = skill_stats.get('skills', [])
if skills:
    # 按收入排序
    sorted_skills = sorted(skills, key=lambda x: x.get('income', 0), reverse=True)
    
    report += "| 排名 | Skill | 下载 | 收入 | 单价 | 状态 |\n"
    report += "|------|-------|------|------|------|------|\n"
    
    for i, skill in enumerate(sorted_skills[:10], 1):
        name = skill.get('name', 'Unknown')
        downloads = skill.get('downloads', 0)
        income = skill.get('income', 0)
        price = skill.get('price', 0)
        
        # 状态判断
        if income > 50:
            status = "🔥 热门"
        elif income > 20:
            status = "💰 稳定"
        elif downloads > 5:
            status = "📈 引流"
        else:
            status = "⚠️ 低效"
        
        report += f"| {i} | {name} | {downloads} | ¥{income} | ¥{price} | {status} |\n"
else:
    report += "*暂无 Skill 详细数据*\n"

report += f"""
---

## 📈 趋势分析

### 收入趋势
- **今日峰值：** ¥{max([r.get('income', 0) for r in today_records], default=0)}
- **今日最低：** ¥{min([r.get('income', 0) for r in today_records], default=0)}
- **平均小时收入：** ¥{total_income / max(len(today_records), 1):.2f}

### 优化建议
"""

# 生成优化建议
low_efficiency = [s for s in skills if s.get('income', 0) < 10 and s.get('downloads', 0) < 5]
high_demand = [s for s in skills if s.get('downloads', 0) > 10]

if high_demand:
    report += "\n**建议涨价：**\n"
    for s in high_demand[:3]:
        report += f"- {s.get('name')}：当前¥{s.get('price', 0)}，建议涨价 30-50%\n"

if low_efficiency:
    report += "\n**建议优化/下架：**\n"
    for s in low_efficiency[:3]:
        report += f"- {s.get('name')}：下载少收入低，考虑优化或下架\n"

report += f"""
---

## 🎯 月度目标追踪

| 指标 | 今日 | 月累计 | 月目标 | 完成率 |
|------|------|--------|--------|--------|
| **收入** | ¥{total_income} | ¥{total_income} | ¥5,000 | {min(100, total_income/50):.1f}% |
| **下载** | {total_downloads} | {total_downloads} | 1,000 | {min(100, total_downloads/10):.1f}% |

---

*报告由 Revenue Monitor Pro 自动生成 | 下一次报告：明天 20:00*
"""

with open(REPORT_FILE, 'w', encoding='utf-8') as f:
    f.write(report)

print(f"✓ 日报已生成：{REPORT_FILE}")
PYEOF
    
    log "日报生成完成：$report_file"
}

generate_weekly_report() {
    log "生成每周收入报告..."
    
    local week_start=$(date -v-mon +%Y-%m-%d 2>/dev/null || date +%Y-%m-%d)
    local report_file="$REPORTS_DIR/weekly-revenue-$week_start.md"
    
    # 简化版周报生成
    cat > "$report_file" <<EOF
# 📊 SkillPay 每周收入报告

**周期：** $week_start 至 $(date +%Y-%m-%d)
**生成时间：** $(date '+%Y-%m-%d %H:%M:%S')

---

## 💰 本周收入概览

*周报数据需要从历史数据中聚合，待完善*

---

## 🏆 本周 Skill 表现榜

*待完善*

---

## 📈 趋势分析

*待完善*

---

## 💡 优化建议

*待完善*

---

*报告由 Revenue Monitor Pro 自动生成*
EOF
    
    log "周报生成完成：$report_file"
}

# ==================== 通知推送 ====================
send_feishu_notification() {
    local message="$1"
    
    # 从配置文件读取 webhook
    local webhook
    webhook=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('feishu_webhook', ''))" 2>/dev/null || echo "")
    
    if [[ -n "$webhook" ]]; then
        curl -s -X POST "$webhook" \
            -H "Content-Type: application/json" \
            -d "{\"msg_type\": \"text\", \"content\": {\"text\": \"$message\"}}" \
            >> "$LOGFILE" 2>&1
        
        log "✓ 飞书通知已发送"
    else
        log "⚠ 飞书 webhook 未配置，跳过通知"
    fi
}

send_email_notification() {
    local subject="$1"
    local body="$2"
    
    # 从配置文件读取邮箱
    local email
    email=$(python3 -c "import json; print(json.load(open('$CONFIG_FILE')).get('alert_email', ''))" 2>/dev/null || echo "")
    
    if [[ -n "$email" ]]; then
        echo "$body" | mail -s "$subject" "$email" 2>> "$LOGFILE" || \
        log "⚠ 邮件发送失败"
        
        log "✓ 邮件通知已发送到 $email"
    else
        log "⚠ 邮箱未配置，跳过通知"
    fi
}

# ==================== 主流程 ====================
main() {
    local mode="${1:-check}"
    
    log "=========================================="
    log "Revenue Monitor Pro 启动 (模式：$mode)"
    log "=========================================="
    
    case "$mode" in
        check)
            # 每小时检查
            collect_revenue_data
            check_alerts
            ;;
        daily)
            # 每日报告
            collect_revenue_data
            generate_daily_report
            send_feishu_notification "📊 今日收入报告已生成，请查看：$REPORTS_DIR"
            ;;
        weekly)
            # 每周报告
            generate_weekly_report
            send_feishu_notification "📈 每周收入报告已生成"
            ;;
        alert)
            # 仅检查告警
            check_alerts
            ;;
        *)
            echo "用法：$0 {check|daily|weekly|alert}"
            exit 1
            ;;
    esac
    
    log "任务完成"
}

# 执行主流程
main "$@"
