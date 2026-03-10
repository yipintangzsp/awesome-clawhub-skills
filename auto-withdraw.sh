#!/bin/bash
#
# auto-withdraw.sh - ClawHub 自动提现脚本
# 功能：监控余额，满¥1,000 自动申请提现
# 用法：./auto-withdraw.sh [--check-only] [--force]
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/withdraw-config.json"
TRACKER_FILE="${SCRIPT_DIR}/withdrawal-tracker.py"
LOG_FILE="${SCRIPT_DIR}/withdraw.log"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    # 使用 printf 正确处理颜色代码
    printf "%s %b\n" "$timestamp" "$1" | tee -a "$LOG_FILE"
}

# 检查配置文件
check_config() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log "${RED}错误：配置文件不存在 ${CONFIG_FILE}${NC}"
        log "${YELLOW}请先运行：python3 ${TRACKER_FILE} --init${NC}"
        exit 1
    fi
}

# 读取配置
read_config() {
    WITHDRAW_THRESHOLD=$(jq -r '.withdraw_threshold' "$CONFIG_FILE")
    WALLET_ADDRESS=$(jq -r '.wallet_address' "$CONFIG_FILE")
    WALLET_TYPE=$(jq -r '.wallet_type' "$CONFIG_FILE")
    CLAWHUB_TOKEN=$(jq -r '.clawhub_token' "$CONFIG_FILE")
    NOTIFY_CHANNEL=$(jq -r '.notify_channel' "$CONFIG_FILE")
}

# 获取余额（通过 ClawHub API）
get_balance() {
    # 方法 1: 使用 ClawHub CLI（如果支持）
    if command -v clawhub &> /dev/null; then
        # 尝试通过 CLI 获取余额
        local balance_info=$(clawhub balance 2>&1 || echo "")
        if [[ -n "$balance_info" ]]; then
            # macOS 兼容的数字提取
            echo "$balance_info" | grep -oE '[0-9]+\.?[0-9]*' | head -1
            return 0
        fi
    fi
    
    # 方法 2: 直接调用 API
    if [[ -n "$CLAWHUB_TOKEN" && "$CLAWHUB_TOKEN" != "null" ]]; then
        local response=$(curl -s -H "Authorization: Bearer $CLAWHUB_TOKEN" \
            "https://clawhub.ai/api/user/balance" 2>/dev/null || echo "")
        if [[ -n "$response" ]]; then
            local balance=$(echo "$response" | jq -r '.available // .balance // 0' 2>/dev/null || echo "")
            if [[ -n "$balance" && "$balance" != "null" ]]; then
                echo "$balance"
                return 0
            fi
        fi
    fi
    
    # 方法 3: 从追踪器获取最后已知余额
    if [[ -f "${SCRIPT_DIR}/balance_cache.json" ]]; then
        local balance=$(jq -r '.last_balance // 0' "${SCRIPT_DIR}/balance_cache.json" 2>/dev/null || echo "")
        if [[ -n "$balance" && "$balance" != "null" ]]; then
            echo "$balance"
            return 0
        fi
    fi
    
    echo "0"
}

# 申请提现
request_withdraw() {
    local amount=$1
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local withdraw_id="WD$(date +%Y%m%d%H%M%S)"
    
    log "${YELLOW}发起提现申请：¥${amount}${NC}"
    log "提现 ID: ${withdraw_id}"
    log "钱包地址：${WALLET_ADDRESS}"
    
    # 方法 1: 使用 ClawHub CLI
    if command -v clawhub &> /dev/null; then
        clawhub withdraw --amount "$amount" --wallet "$WALLET_ADDRESS" --type "$WALLET_TYPE" 2>&1 || true
    fi
    
    # 方法 2: 调用 API
    if [[ -n "$CLAWHUB_TOKEN" ]]; then
        curl -s -X POST \
            -H "Authorization: Bearer $CLAWHUB_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{
                \"amount\": ${amount},
                \"wallet_address\": \"${WALLET_ADDRESS}\",
                \"wallet_type\": \"${WALLET_TYPE}\",
                \"withdraw_id\": \"${withdraw_id}\"
            }" \
            "https://clawhub.ai/api/withdraw/request" 2>/dev/null || true
    fi
    
    # 记录提现申请
    python3 "$TRACKER_FILE" --record \
        --id "$withdraw_id" \
        --amount "$amount" \
        --wallet "$WALLET_ADDRESS" \
        --status "pending" \
        --time "$timestamp"
    
    log "${GREEN}提现申请已提交${NC}"
    
    # 发送通知
    send_notification "提现申请提交" "已申请提现 ¥${amount} 到 ${WALLET_TYPE} 钱包"
}

# 发送通知
send_notification() {
    local title="$1"
    local message="$2"
    
    log "发送通知：${title} - ${message}"
    
    # 飞书通知
    if [[ -n "$NOTIFY_CHANNEL" && "$NOTIFY_CHANNEL" != "null" ]]; then
        # 使用 message 工具发送飞书消息
        echo "{\"action\": \"send\", \"target\": \"${NOTIFY_CHANNEL}\", \"message\": \"🔔 **${title}**\\n${message}\"}" | \
            openclaw message --stdin 2>/dev/null || true
    fi
    
    # 系统通知
    if command -v osascript &> /dev/null; then
        osascript -e "display notification \"${message}\" with title \"ClawHub 提现\""
    fi
}

# 主逻辑
main() {
    local check_only=false
    local force=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --check-only)
                check_only=true
                shift
                ;;
            --force)
                force=true
                shift
                ;;
            *)
                log "${RED}未知参数：$1${NC}"
                echo "用法：$0 [--check-only] [--force]"
                exit 1
                ;;
        esac
    done
    
    log "=========================================="
    log "ClawHub 自动提现检查"
    log "=========================================="
    
    check_config
    read_config
    
    # 获取当前余额
    local balance=$(get_balance)
    log "当前可用余额：¥${balance}"
    
    # 更新余额缓存
    echo "{\"last_balance\": ${balance}, \"last_check\": \"$(date -Iseconds)\"}" > "${SCRIPT_DIR}/balance_cache.json"
    
    # 检查是否达到提现阈值
    if (( $(echo "$balance >= $WITHDRAW_THRESHOLD" | bc -l) )) || [[ "$force" == true ]]; then
        if [[ "$check_only" == true ]]; then
            log "${GREEN}余额充足，可以提现${NC}"
            echo "$balance"
        else
            request_withdraw "$balance"
        fi
    else
        if [[ -n "$balance" && "$balance" != "0" ]]; then
            local remaining=$(echo "$WITHDRAW_THRESHOLD - $balance" | bc 2>/dev/null || echo "$WITHDRAW_THRESHOLD")
            log "${YELLOW}余额不足，还需 ¥${remaining} 才能提现${NC}"
        else
            log "${YELLOW}余额不足，还需 ¥${WITHDRAW_THRESHOLD} 才能提现${NC}"
        fi
    fi
    
    log "=========================================="
}

# 执行
main "$@"
