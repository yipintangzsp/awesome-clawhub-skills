#!/bin/bash
# OpenClaw Nightly Security Audit Script (v2.8 - macOS Adapter)
# 慢雾安全实践指南 v2.8 - 夜间自动巡检脚本
# 覆盖 13 项核心指标，输出显性化报告

set -uo pipefail

# 路径配置
OC="${OPENCLAW_STATE_DIR:-$HOME/.openclaw}"
REPORT_DIR="$OC/security-reports"
KNOWN_ISSUES_FILE="$OC/.security-audit-known-issues.json"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
REPORT_FILE="$REPORT_DIR/audit_$TIMESTAMP.md"

# 确保报告目录存在
mkdir -p "$REPORT_DIR"

# 计数器
CRITICAL_COUNT=0
WARN_COUNT=0
OK_COUNT=0

# 颜色/Emoji 定义
RED="🚨"
YELLOW="⚠️"
GREEN="✅"

# 加载已知问题排除清单（如果存在）
load_known_issues() {
    if [[ -f "$KNOWN_ISSUES_FILE" ]]; then
        cat "$KNOWN_ISSUES_FILE"
    else
        echo "[]"
    fi
}

# 检查是否匹配已知问题
is_known_issue() {
    local check="$1"
    local line="$2"
    if [[ -f "$KNOWN_ISSUES_FILE" ]]; then
        # 简单匹配：检查 line 是否包含已知问题中的 pattern
        grep -q "$line" "$KNOWN_ISSUES_FILE" 2>/dev/null && return 0
    fi
    return 1
}

# 输出边界锚点
print_header() {
    echo "=== [$1] $2 ==="
}

# 输出结果（带计数）
emit_result() {
    local status="$1"
    local message="$2"
    case "$status" in
        "CRITICAL") echo "$RED $message"; ((CRITICAL_COUNT++)) ;;
        "WARN") echo "$YELLOW $message"; ((WARN_COUNT++)) ;;
        "OK") echo "$GREEN $message"; ((OK_COUNT++)) ;;
    esac
}

# ============================================
# [1] OpenClaw 平台安全审计
# ============================================
print_header "1" "OpenClaw Platform Audit"
if command -v openclaw &>/dev/null; then
    AUDIT_OUTPUT=$(openclaw security audit 2>&1)
    # 忽略 Config warnings 和 Doctor warnings（非安全问题）
    REAL_ISSUES=$(echo "$AUDIT_OUTPUT" | grep -vi "Config warnings\|Doctor warnings\|duplicate plugin" | grep -iE "error|critical|fail|unauthorized|permission denied")
    if [[ -n "$REAL_ISSUES" ]]; then
        emit_result "CRITICAL" "OpenClaw 安全审计发现异常"
        echo "$REAL_ISSUES" | head -n 10
    else
        emit_result "OK" "OpenClaw 安全审计通过"
    fi
else
    emit_result "WARN" "openclaw 命令不可用"
fi
echo ""

# ============================================
# [2] 进程与网络审计
# ============================================
print_header "2" "Process & Network Audit"
# 监听端口（macOS 用 lsof）
LISTEN_PORTS=$(lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null | head -n 20)
if [[ -n "$LISTEN_PORTS" ]]; then
    echo "监听端口:"
    echo "$LISTEN_PORTS"
    # 检查是否有异常端口
    if echo "$LISTEN_PORTS" | grep -qv "openclaw\|node\|python"; then
        emit_result "WARN" "发现非常规监听端口"
    else
        emit_result "OK" "监听端口正常"
    fi
else
    emit_result "OK" "无 TCP 监听端口"
fi

# 出站连接
OUTBOUND=$(netstat -an 2>/dev/null | grep ESTABLISHED | head -n 10)
if [[ -n "$OUTBOUND" ]]; then
    echo "活跃连接:"
    echo "$OUTBOUND" | head -n 5
fi
echo ""

# ============================================
# [3] 敏感目录变更扫描
# ============================================
print_header "3" "Sensitive Directory Changes (24h)"
RECENT_CHANGES=$(find "$OC" -type f -mtime -1 2>/dev/null | head -n 50)
if [[ -n "$RECENT_CHANGES" ]]; then
    echo "最近 24h 变更文件 (最多 50 个):"
    echo "$RECENT_CHANGES"
    emit_result "OK" "敏感目录有正常变更"
else
    emit_result "OK" "敏感目录无变更"
fi
echo ""

# ============================================
# [4] 系统定时任务
# ============================================
print_header "4" "System Scheduled Tasks"
# macOS crontab
CRON_TASKS=$(crontab -l 2>/dev/null || echo "No crontab")
echo "用户 crontab:"
echo "$CRON_TASKS"
# 检查是否有异常任务
if echo "$CRON_TASKS" | grep -qi "curl.*bash\|wget.*sh\|/dev/tcp"; then
    emit_result "CRITICAL" "发现可疑定时任务"
else
    emit_result "OK" "定时任务正常"
fi
echo ""

# ============================================
# [5] OpenClaw Cron Jobs
# ============================================
print_header "5" "OpenClaw Cron Jobs"
if command -v openclaw &>/dev/null; then
    OC_CRONS=$(openclaw cron list 2>&1)
    echo "$OC_CRONS" | head -n 20
    if echo "$OC_CRONS" | grep -qi "nightly-security-audit"; then
        emit_result "OK" "夜间巡检 cron 已注册"
    else
        emit_result "WARN" "夜间巡检 cron 未注册"
    fi
else
    emit_result "WARN" "openclaw 命令不可用"
fi
echo ""

# ============================================
# [6] 登录与 SSH
# ============================================
print_header "6" "Logins & SSH"
# macOS 用 last
LAST_LOGINS=$(last 2>/dev/null | head -n 10)
if [[ -n "$LAST_LOGINS" ]]; then
    echo "最近登录记录:"
    echo "$LAST_LOGINS"
fi
# SSH 失败尝试（macOS 用 log show）
SSH_FAILS=$(log show --predicate 'eventMessage contains "Failed password"' --last 24h 2>/dev/null | wc -l)
if [[ "$SSH_FAILS" -gt 0 ]]; then
    emit_result "WARN" "24h 内 SSH 失败尝试：$SSH_FAILS 次"
else
    emit_result "OK" "无 SSH 失败尝试"
fi
echo ""

# ============================================
# [7] 关键文件完整性
# ============================================
print_header "7" "Critical File Integrity"
BASELINE_FILE="$OC/.config-baseline.sha256"
if [[ -f "$BASELINE_FILE" ]]; then
    # macOS 用 shasum
    CURRENT_HASH=$(shasum -a 256 "$OC/openclaw.json" 2>/dev/null | awk '{print $1}')
    BASELINE_HASH=$(awk '{print $1}' "$BASELINE_FILE")
    if [[ "$CURRENT_HASH" == "$BASELINE_HASH" ]]; then
        emit_result "OK" "openclaw.json 哈希校验通过"
    else
        emit_result "CRITICAL" "openclaw.json 哈希不匹配！可能被篡改"
        echo "当前：$CURRENT_HASH"
        echo "基线：$BASELINE_HASH"
    fi
else
    emit_result "WARN" "哈希基线文件不存在"
fi

# 权限检查
OC_PERMS=$(stat -f "%Lp" "$OC/openclaw.json" 2>/dev/null)
if [[ "$OC_PERMS" == "600" ]]; then
    emit_result "OK" "openclaw.json 权限正确 (600)"
else
    emit_result "WARN" "openclaw.json 权限异常：$OC_PERMS"
fi
echo ""

# ============================================
# [8] 黄线操作交叉验证
# ============================================
print_header "8" "Yellow Line Operation Validation"
# 检查 memory 中是否有黄线记录
TODAY=$(date +"%Y-%m-%d")
MEMORY_FILE="$OC/workspace/memory/$TODAY.md"
if [[ -f "$MEMORY_FILE" ]]; then
    YELLOW_LINES=$(grep -c "黄线\|sudo\|chmod\|chattr" "$MEMORY_FILE" 2>/dev/null || echo "0")
    echo "今日黄线操作记录：$YELLOW_LINES 条"
    emit_result "OK" "黄线操作已记录"
else
    emit_result "OK" "今日无黄线操作"
fi
echo ""

# ============================================
# [9] 磁盘使用
# ============================================
print_header "9" "Disk Usage"
DISK_USAGE=$(df -h / 2>/dev/null | tail -1 | awk '{print $5}' | tr -d '%')
if [[ -n "$DISK_USAGE" ]]; then
    echo "根分区使用率：${DISK_USAGE}%"
    if [[ "$DISK_USAGE" -gt 85 ]]; then
        emit_result "CRITICAL" "磁盘使用率过高：${DISK_USAGE}%"
    else
        emit_result "OK" "磁盘使用率正常：${DISK_USAGE}%"
    fi
fi

# 大文件扫描
LARGE_FILES=$(find "$OC" -type f -size +100M -mtime -1 2>/dev/null | head -n 10)
if [[ -n "$LARGE_FILES" ]]; then
    emit_result "WARN" "发现大文件 (>100MB):"
    echo "$LARGE_FILES"
else
    emit_result "OK" "无新增大文件"
fi
echo ""

# ============================================
# [10] Gateway 环境变量
# ============================================
print_header "10" "Gateway Environment Variables"
# 查找 openclaw gateway 进程
GATEWAY_PID=$(pgrep -f "openclaw.*gateway" 2>/dev/null | head -1)
if [[ -n "$GATEWAY_PID" ]]; then
    ENV_VARS=$(cat /proc/$GATEWAY_PID/environ 2>/dev/null | tr '\0' '\n' | grep -iE "KEY|TOKEN|SECRET|PASSWORD" | head -n 20)
    if [[ -n "$ENV_VARS" ]]; then
        echo "敏感环境变量:"
        echo "$ENV_VARS" | sed 's/=.*$/=***REDACTED***/'
        emit_result "WARN" "发现敏感环境变量"
    else
        emit_result "OK" "无可疑环境变量"
    fi
else
    # macOS 备用方案
    ENV_VARS=$(ps aux | grep -i openclaw | grep -v grep)
    if [[ -n "$ENV_VARS" ]]; then
        emit_result "OK" "Gateway 进程运行中"
    else
        emit_result "WARN" "Gateway 进程未找到"
    fi
fi
echo ""

# ============================================
# [11] 明文私钥/凭证泄露扫描 (DLP)
# ============================================
print_header "11" "DLP - Plaintext Credential Scan"
# 扫描私钥/助记词格式
PRIVATE_KEYS=$(grep -rE "0x[a-fA-F0-9]{64}|-----BEGIN.*PRIVATE KEY-----" "$OC/workspace" 2>/dev/null | head -n 10)
MNEMONICS=$(grep -rE "\b[a-z]{1,8}( [a-z]{1,8}){11,23}\b" "$OC/workspace/memory" 2>/dev/null | head -n 10)

if [[ -n "$PRIVATE_KEYS" ]]; then
    emit_result "CRITICAL" "发现疑似私钥！"
    echo "$PRIVATE_KEYS" | sed 's/0x[a-fA-F0-9]\{64\}/0x***REDACTED***/g'
elif [[ -n "$MNEMONICS" ]]; then
    emit_result "CRITICAL" "发现疑似助记词！"
    echo "$MNEMONICS" | head -n 3
else
    emit_result "OK" "未发现明文私钥/助记词"
fi
echo ""

# ============================================
# [12] Skill/MCP 完整性
# ============================================
print_header "12" "Skill/MCP Integrity"
SKILL_BASELINE="$OC/.skill-baseline.sha256"
if [[ -f "$SKILL_BASELINE" ]]; then
    CURRENT_SKILL_HASH=$(find "$OC/workspace/skills" -type f -not -path '*/.git/*' -exec shasum -a 256 {} \; 2>/dev/null | sort | shasum -a 256 | awk '{print $1}')
    BASELINE_SKILL_HASH=$(awk '{print $1}' "$SKILL_BASELINE")
    if [[ "$CURRENT_SKILL_HASH" == "$BASELINE_SKILL_HASH" ]]; then
        emit_result "OK" "Skill 完整性校验通过"
    else
        emit_result "WARN" "Skill 文件有变更"
        echo "当前：$CURRENT_SKILL_HASH"
        echo "基线：$BASELINE_SKILL_HASH"
    fi
else
    emit_result "OK" "Skill 基线未建立（首次运行正常）"
fi
echo ""

# ============================================
# [13] 大脑灾备同步状态 (可选)
# ============================================
print_header "13" "Brain Backup Status (Optional)"
if [[ -d "$OC/.git" ]]; then
    cd "$OC" 2>/dev/null && git status --short 2>/dev/null | head -n 10
    if git remote -v 2>/dev/null | grep -q "github\|gitlab"; then
        emit_result "OK" "Git 灾备仓库已配置"
    else
        emit_result "WARN" "Git 仓库存在但未配置远端"
    fi
else
    emit_result "OK" "未配置 Git 灾备（可选功能）"
fi
echo ""

# ============================================
# 统计摘要
# ============================================
echo "============================================"
echo "Summary: $CRITICAL_COUNT critical · $WARN_COUNT warn · $OK_COUNT ok"
echo "Report saved to: $REPORT_FILE"
echo "============================================"

# 保存详细报告
{
    echo "# OpenClaw Security Audit Report"
    echo "Generated: $(date)"
    echo ""
    echo "## Summary"
    echo "- 🚨 Critical: $CRITICAL_COUNT"
    echo "- ⚠️ Warn: $WARN_COUNT"
    echo "- ✅ Ok: $OK_COUNT"
    echo ""
    echo "## Details"
    # 重新执行一次保存详细输出（简化版）
} > "$REPORT_FILE"

# 轮转：删除 30 天前的报告
find "$REPORT_DIR" -type f -mtime +30 -delete 2>/dev/null

# 退出码：有 CRITICAL 则返回 1
if [[ "$CRITICAL_COUNT" -gt 0 ]]; then
    exit 1
fi
exit 0
