#!/bin/bash
# =============================================================================
# SkillPay 自动发布脚本 - 绕过 ClawHub 限流
# =============================================================================
# 功能:
#   1. 每小时检查限流状态
#   2. 限流解除后自动发布最多 5 个 Skill
#   3. 发布失败自动重试 (最多 3 次)
#   4. 记录发布日志到 JSON 和文本文件
#   5. 发布完成后通过飞书通知
#
# 使用方式:
#   ./auto-publish-skills.sh [--dry-run] [--force] [--notify]
#
# Crontab 配置 (每小时执行):
#   0 * * * * /Users/admin/.openclaw/workspace/scripts/auto-publish-skills.sh --notify >> ~/Library/Logs/skillpay-auto-publish.log 2>&1
# =============================================================================

set -e

# -----------------------------------------------------------------------------
# 配置
# -----------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE="$HOME/.openclaw/workspace"
QUEUE_FILE="$SCRIPT_DIR/publish-queue.json"
LOG_DIR="$HOME/Library/Logs"
LOG_FILE="$LOG_DIR/skillpay-auto-publish.log"
DETAILED_LOG="$LOG_DIR/skillpay-publish-detailed-$(date +%Y%m%d).log"

# 限流配置
MAX_PER_HOUR=5
MAX_RETRIES=3
RETRY_DELAY=30  # 秒

# 通知配置
NOTIFY_CHANNEL="feishu"  # 可选项：feishu, telegram, wecom

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# -----------------------------------------------------------------------------
# 参数解析
# -----------------------------------------------------------------------------
DRY_RUN=false
FORCE=false
NOTIFY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --notify)
            NOTIFY=true
            shift
            ;;
        -h|--help)
            echo "用法：$0 [--dry-run] [--force] [--notify]"
            echo ""
            echo "选项:"
            echo "  --dry-run   模拟执行，不实际发布"
            echo "  --force     忽略限流限制，强制发布"
            echo "  --notify    发布完成后发送通知"
            echo "  -h, --help  显示帮助信息"
            exit 0
            ;;
        *)
            echo "未知选项：$1"
            exit 1
            ;;
    esac
done

# -----------------------------------------------------------------------------
# 工具函数
# -----------------------------------------------------------------------------

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}[$(date '+%H:%M:%S')] $1${NC}"
    log "INFO" "$1"
}

log_success() {
    echo -e "${GREEN}[$(date '+%H:%M:%S')] ✓ $1${NC}"
    log "SUCCESS" "$1"
}

log_warning() {
    echo -e "${YELLOW}[$(date '+%H:%M:%S')] ⚠ $1${NC}"
    log "WARNING" "$1"
}

log_error() {
    echo -e "${RED}[$(date '+%H:%M:%S')] ✗ $1${NC}"
    log "ERROR" "$1"
}

# 检查 jq 是否安装
check_dependencies() {
    if ! command -v jq &> /dev/null; then
        log_error "jq 未安装，请先安装：brew install jq"
        exit 1
    fi
    
    if ! command -v clawhub &> /dev/null; then
        log_error "clawhub CLI 未安装，请先安装：npm install -g clawhub"
        exit 1
    fi
}

# 确保日志目录存在
ensure_log_dir() {
    mkdir -p "$LOG_DIR"
}

# -----------------------------------------------------------------------------
# 限流检查
# -----------------------------------------------------------------------------

check_rate_limit() {
    if [ "$FORCE" = true ]; then
        log_warning "强制模式：跳过限流检查"
        return 0
    fi
    
    local current_hour=$(date '+%Y-%m-%d %H:00')
    local last_reset=$(jq -r '.rate_limit.last_reset // "null"' "$QUEUE_FILE")
    local blocked_until=$(jq -r '.rate_limit.blocked_until // "null"' "$QUEUE_FILE")
    local hour_count=$(jq -r '.rate_limit.current_hour_count' "$QUEUE_FILE")
    
    # 检查是否在封锁期内
    if [ "$blocked_until" != "null" ]; then
        local blocked_ts=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "$blocked_until" +%s 2>/dev/null || echo "0")
        local now_ts=$(date +%s)
        
        if [ "$now_ts" -lt "$blocked_ts" ]; then
            local wait_minutes=$(( (blocked_ts - now_ts) / 60 ))
            log_warning "仍在限流封锁期内，还需等待 ${wait_minutes} 分钟"
            return 1
        else
            log_info "限流封锁已解除"
            reset_rate_limit
            return 0
        fi
    fi
    
    # 检查是否需要重置小时计数
    if [ "$last_reset" != "$current_hour" ]; then
        log_info "新的小时周期开始，重置计数器"
        reset_rate_limit
        return 0
    fi
    
    # 检查当前小时已发布数量
    if [ "$hour_count" -ge "$MAX_PER_HOUR" ]; then
        log_warning "已达到每小时发布上限 ($MAX_PER_HOUR 个)，需等待下一小时"
        return 1
    fi
    
    local remaining=$((MAX_PER_HOUR - hour_count))
    log_info "当前小时可发布 $remaining 个 Skill"
    return 0
}

reset_rate_limit() {
    local current_hour=$(date '+%Y-%m-%d %H:00')
    local temp_file=$(mktemp)
    
    jq --arg hour "$current_hour" \
       '.rate_limit.last_reset = $hour | .rate_limit.current_hour_count = 0 | .rate_limit.blocked_until = null' \
       "$QUEUE_FILE" > "$temp_file" && mv "$temp_file" "$QUEUE_FILE"
}

increment_hour_count() {
    local temp_file=$(mktemp)
    jq '.rate_limit.current_hour_count += 1' "$QUEUE_FILE" > "$temp_file" && mv "$temp_file" "$QUEUE_FILE"
}

set_blocked_until() {
    local minutes="$1"
    local blocked_time=$(date -v+${minutes}M '+%Y-%m-%dT%H:%M:%S+08:00')
    local temp_file=$(mktemp)
    
    jq --arg blocked "$blocked_time" \
       '.rate_limit.blocked_until = $blocked' \
       "$QUEUE_FILE" > "$temp_file" && mv "$temp_file" "$QUEUE_FILE"
}

# -----------------------------------------------------------------------------
# 发布逻辑
# -----------------------------------------------------------------------------

publish_skill() {
    local skill_path="$1"
    local slug="$2"
    local version="$3"
    local name="$4"
    
    log_info "发布 Skill: $name ($slug)"
    
    if [ "$DRY_RUN" = true ]; then
        log_info "[模拟] 将发布：$skill_path --slug $slug --version $version"
        return 0
    fi
    
    # 检查技能目录是否存在
    if [ ! -d "$WORKSPACE/$skill_path" ]; then
        log_error "技能目录不存在：$WORKSPACE/$skill_path"
        return 1
    fi
    
    # 检查 SKILL.md 是否存在
    if [ ! -f "$WORKSPACE/$skill_path/SKILL.md" ]; then
        log_error "SKILL.md 不存在：$WORKSPACE/$skill_path/SKILL.md"
        return 1
    fi
    
    # 执行发布
    local output
    local exit_code=0
    
    cd "$WORKSPACE"
    output=$(clawhub publish "$skill_path" \
            --slug "$slug" \
            --version "$version" \
            --no-input \
            2>&1) || exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        # 提取 version_id (从输出中解析)
        local version_id=$(echo "$output" | grep -o 'k[a-z0-9]\{32\}' | head -1 || echo "unknown")
        log_success "发布成功: $slug (version_id: $version_id)"
        
        # 更新队列状态
        update_queue_published "$skill_path" "$slug" "$version_id"
        increment_hour_count
        
        # 记录详细日志
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] SUCCESS: $slug ($version_id)" >> "$DETAILED_LOG"
        
        return 0
    else
        log_error "发布失败: $slug"
        echo "$output" >> "$DETAILED_LOG"
        return 1
    fi
}

update_queue_published() {
    local skill_path="$1"
    local slug="$2"
    local version_id="$3"
    local published_at=$(date '+%Y-%m-%dT%H:%M:%S+08:00')
    
    local temp_file=$(mktemp)
    
    # 从 queue 移到 published
    jq --arg path "$skill_path" \
       --arg slug "$slug" \
       --arg vid "$version_id" \
       --arg ts "$published_at" \
       '
       .published += [{
         "skill_path": $path,
         "slug": $slug,
         "version_id": $vid,
         "published_at": $ts,
         "status": "success"
       }] |
       .queue = [.queue[] | select(.skill_path != $path)]
       ' "$QUEUE_FILE" > "$temp_file" && mv "$temp_file" "$QUEUE_FILE"
}

update_queue_retry() {
    local skill_path="$1"
    local error_msg="$2"
    
    local temp_file=$(mktemp)
    
    jq --arg path "$skill_path" \
       --arg err "$error_msg" \
       '
       .queue = [.queue[] | 
         if .skill_path == $path then
           .retry_count += 1 |
           .last_attempt = (now | strftime("%Y-%m-%dT%H:%M:%S+08:00")) |
           .error_message = $err
         else . end
       ]
       ' "$QUEUE_FILE" > "$temp_file" && mv "$temp_file" "$QUEUE_FILE"
}

# -----------------------------------------------------------------------------
# 主发布流程
# -----------------------------------------------------------------------------

run_publish_cycle() {
    log_info "=========================================="
    log_info "开始发布周期 - $(date '+%Y-%m-%d %H:%M')"
    log_info "=========================================="
    
    # 检查限流
    if ! check_rate_limit; then
        log_warning "限流检查未通过，跳过本次发布"
        return 0
    fi
    
    # 获取待发布的技能 (按优先级排序)
    local pending_count=$(jq '[.queue[] | select(.status == "pending" or .status == "pending_slug_fix")] | length' "$QUEUE_FILE")
    
    if [ "$pending_count" -eq 0 ]; then
        log_info "没有待发布的 Skill"
        return 0
    fi
    
    log_info "队列中有 $pending_count 个待发布 Skill"
    
    # 计算本次可发布数量
    local hour_count=$(jq -r '.rate_limit.current_hour_count' "$QUEUE_FILE")
    local can_publish=$((MAX_PER_HOUR - hour_count))
    
    if [ "$can_publish" -le 0 ]; then
        log_warning "本小时额度已用完"
        return 0
    fi
    
    log_info "本次最多可发布 $can_publish 个 Skill"
    
    # 获取待发布列表 (按优先级排序，取前 N 个)
    local skills_to_publish=$(jq -r --argjson limit "$can_publish" \
        '[.queue[] | select(.status == "pending" or .status == "pending_slug_fix")] | 
         sort_by(.priority) | 
         .[:$limit] | 
         .[] | 
         "\(.skill_path)|\(.slug)|\(.version)|\(.name)"' \
        "$QUEUE_FILE")
    
    local published_count=0
    local failed_count=0
    
    # 遍历发布
    while IFS='|' read -r skill_path slug version name; do
        if [ -z "$skill_path" ]; then
            continue
        fi
        
        # 尝试发布 (带重试)
        local attempt=0
        local success=false
        
        while [ $attempt -lt $MAX_RETRIES ] && [ "$success" = false ]; do
            if [ $attempt -gt 0 ]; then
                log_info "重试发布 ($attempt/$MAX_RETRIES): $name"
                sleep $RETRY_DELAY
            fi
            
            if publish_skill "$skill_path" "$slug" "$version" "$name"; then
                success=true
                ((published_count++))
            else
                ((attempt++))
                
                if [ $attempt -ge $MAX_RETRIES ]; then
                    log_error "达到最大重试次数，标记为失败: $name"
                    update_queue_retry "$skill_path" "Max retries exceeded"
                    ((failed_count++))
                fi
            fi
        done
        
        # 检查是否达到限流
        local new_hour_count=$(jq -r '.rate_limit.current_hour_count' "$QUEUE_FILE")
        if [ "$new_hour_count" -ge "$MAX_PER_HOUR" ]; then
            log_warning "已达到每小时发布上限，停止发布"
            break
        fi
        
    done <<< "$skills_to_publish"
    
    # 总结
    log_info "=========================================="
    log_info "发布周期完成"
    log_info "  成功：$published_count 个"
    log_info "  失败：$failed_count 个"
    log_info "=========================================="
    
    # 发送通知
    if [ "$NOTIFY" = true ] && [ $published_count -gt 0 ]; then
        send_notification "$published_count" "$failed_count"
    fi
    
    return 0
}

# -----------------------------------------------------------------------------
# 通知
# -----------------------------------------------------------------------------

send_notification() {
    local published="$1"
    local failed="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M')
    
    local message="🐾 Skill 自动发布完成

📊 发布统计 ($timestamp)
• 成功发布：$published 个
• 发布失败：$failed 个

⏰ 限流状态：每小时最多 $MAX_PER_HOUR 个
📝 详细日志：~/Library/Logs/skillpay-publish-detailed-$(date +%Y%m%d).log"
    
    log_info "发送通知..."
    
    # 根据通道发送通知
    case "$NOTIFY_CHANNEL" in
        feishu)
            # 使用 message 工具发送飞书消息
            # 注意：这里需要通过 openclaw 的 message 工具
            echo "$message" | openclaw message send --target "feishu" --message - 2>/dev/null || \
            log_warning "飞书通知发送失败"
            ;;
        telegram)
            # Telegram 通知逻辑
            log_info "Telegram 通知：$message"
            ;;
        wecom)
            # 企业微信通知逻辑
            log_info "企业微信通知：$message"
            ;;
    esac
}

# -----------------------------------------------------------------------------
# 主程序
# -----------------------------------------------------------------------------

main() {
    ensure_log_dir
    check_dependencies
    
    # 检查队列文件是否存在
    if [ ! -f "$QUEUE_FILE" ]; then
        log_error "队列文件不存在：$QUEUE_FILE"
        exit 1
    fi
    
    run_publish_cycle
    
    log_info "脚本执行完成"
}

# 执行主程序
main "$@"
