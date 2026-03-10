#!/bin/bash
# -*- coding: utf-8 -*-
#
# SkillPay 自动发布调度器
# 定时发布营销文案到各大平台
#
# 功能:
# - 从生成器读取文案
# - 按平台最佳时间发布
# - 记录发布日志
# - 失败自动重试
# - 支持手动测试
#
# 使用:
# ./auto-post-scheduler.sh --install     # 安装定时任务
# ./auto-post-scheduler.sh --test        # 测试发布
# ./auto-post-scheduler.sh --status      # 查看状态
# ./auto-post-scheduler.sh --uninstall   # 卸载定时任务

set -e

# 配置
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="${SCRIPT_DIR}/config.json"
LOG_DIR="${SCRIPT_DIR}/logs"
COPY_DIR="${SCRIPT_DIR}/generated_copies"
LOCK_FILE="/tmp/skillpay_poster.lock"

# 日志配置
LOG_FILE="${LOG_DIR}/post_scheduler_$(date +%Y%m%d).log"
mkdir -p "$LOG_DIR"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${timestamp} [${level}] ${message}" | tee -a "$LOG_FILE"
}

log_info() { log "${BLUE}INFO${NC}" "$@"; }
log_success() { log "${GREEN}SUCCESS${NC}" "$@"; }
log_warning() { log "${YELLOW}WARNING${NC}" "$@"; }
log_error() { log "${RED}ERROR${NC}" "$@"; }

# 检查配置
check_config() {
    if [[ ! -f "$CONFIG_FILE" ]]; then
        log_error "配置文件不存在：$CONFIG_FILE"
        echo "请先创建配置文件：cp config.example.json config.json"
        exit 1
    fi
    
    # 检查 Python 依赖
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 未安装"
        exit 1
    fi
}

# 获取平台配置
get_platform_config() {
    local platform=$1
    python3 -c "
import json
with open('$CONFIG_FILE') as f:
    config = json.load(f)
platform = config.get('platforms', {}).get('$platform', {})
print('enabled' if platform.get('enabled', False) else 'disabled')
"
}

# 获取 API 密钥
get_api_key() {
    local platform=$1
    python3 -c "
import json
with open('$CONFIG_FILE') as f:
    config = json.load(f)
print(config.get('platforms', {}).get('$platform', {}).get('api_key', ''))
"
}

# 获取最新文案
get_latest_copy() {
    local platform=$1
    
    if [[ ! -d "$COPY_DIR" ]]; then
        log_error "文案目录不存在：$COPY_DIR"
        return 1
    fi
    
    # 获取最新的文案文件
    local latest_file=$(ls -t "${COPY_DIR}"/copies_*.json 2>/dev/null | head -1)
    
    if [[ -z "$latest_file" ]]; then
        log_error "未找到文案文件"
        return 1
    fi
    
    # 提取该平台的文案
    python3 << EOF
import json
import random

with open('$latest_file') as f:
    copies = json.load(f)

# 筛选平台
platform_copies = [c for c in copies if c['platform'] == '$platform']

if not platform_copies:
    print("NO_COPY")
    exit(1)

# 随机选择一个未使用的文案（简化版，实际应记录已使用）
copy = random.choice(platform_copies)
print(copy['copy'])
EOF
}

# 发布到 Twitter
post_to_twitter() {
    local content="$1"
    local api_key=$(get_api_key "twitter")
    
    if [[ -z "$api_key" ]]; then
        log_warning "Twitter API 密钥未配置"
        return 1
    fi
    
    log_info "发布到 Twitter..."
    
    # TODO: 集成 Twitter API
    # 这里使用示例调用，实际应替换为真实 API
    python3 << EOF
import requests
import json

# Twitter API v2 示例
api_key = "$api_key"
content = """$content"""

# 实际调用示例（需要安装 tweepy 或使用 requests）
# headers = {
#     'Authorization': f'Bearer {api_key}',
#     'Content-Type': 'application/json'
# }
# payload = {'text': content}
# response = requests.post(
#     'https://api.twitter.com/2/tweets',
#     headers=headers,
#     json=payload
# )

# 模拟成功
print("Twitter 发布成功 (模拟)")
EOF
    
    if [[ $? -eq 0 ]]; then
        log_success "Twitter 发布成功"
        return 0
    else
        log_error "Twitter 发布失败"
        return 1
    fi
}

# 发布到小红书
post_to_xiaohongshu() {
    local content="$1"
    local api_key=$(get_api_key "xiaohongshu")
    
    if [[ -z "$api_key" ]]; then
        log_warning "小红书 API 密钥未配置"
        return 1
    fi
    
    log_info "发布到小红书..."
    
    # TODO: 集成小红书 API
    python3 << EOF
# 小红书发布逻辑
# 注意：小红书官方 API 需要企业认证
content = """$content"""

# 模拟成功
print("小红书发布成功 (模拟)")
EOF
    
    if [[ $? -eq 0 ]]; then
        log_success "小红书发布成功"
        return 0
    else
        log_error "小红书发布失败"
        return 1
    fi
}

# 发布到知乎
post_to_zhihu() {
    local content="$1"
    local api_key=$(get_api_key "zhihu")
    
    if [[ -z "$api_key" ]]; then
        log_warning "知乎 API 密钥未配置"
        return 1
    fi
    
    log_info "发布到知乎..."
    
    # TODO: 集成知乎 API
    python3 << EOF
# 知乎发布逻辑
content = """$content"""

# 模拟成功
print("知乎发布成功 (模拟)")
EOF
    
    if [[ $? -eq 0 ]]; then
        log_success "知乎发布成功"
        return 0
    else
        log_error "知乎发布失败"
        return 1
    fi
}

# 发布到指定平台
post_to_platform() {
    local platform=$1
    local content=$(get_latest_copy "$platform")
    
    if [[ "$content" == "NO_COPY" ]]; then
        log_error "未找到 $platform 的文案"
        return 1
    fi
    
    case $platform in
        twitter)
            post_to_twitter "$content"
            ;;
        xiaohongshu)
            post_to_xiaohongshu "$content"
            ;;
        zhihu)
            post_to_zhihu "$content"
            ;;
        *)
            log_error "不支持的平台：$platform"
            return 1
            ;;
    esac
}

# 执行发布任务
run_posting() {
    # 防止并发
    if [[ -f "$LOCK_FILE" ]]; then
        log_warning "已有进程在运行，跳过本次执行"
        exit 0
    fi
    
    trap "rm -f $LOCK_FILE" EXIT
    touch "$LOCK_FILE"
    
    log_info "开始执行发布任务..."
    
    local platforms=("twitter" "xiaohongshu" "zhihu")
    local success_count=0
    local fail_count=0
    
    for platform in "${platforms[@]}"; do
        local status=$(get_platform_config "$platform")
        
        if [[ "$status" == "disabled" ]]; then
            log_info "平台 $platform 已禁用，跳过"
            continue
        fi
        
        if post_to_platform "$platform"; then
            ((success_count++))
        else
            ((fail_count++))
            # 失败重试逻辑
            log_info "5 分钟后重试 $platform..."
            sleep 300
            if ! post_to_platform "$platform"; then
                log_error "$platform 重试失败，发送告警"
                # TODO: 发送告警通知
            fi
        fi
    done
    
    log_success "发布完成：成功 $success_count, 失败 $fail_count"
    
    rm -f "$LOCK_FILE"
}

# 安装定时任务
install_cron() {
    log_info "安装定时任务..."
    
    # 创建 cron 配置
    local cron_job="0 9,14,20 * * * cd $SCRIPT_DIR && ./auto-post-scheduler.sh --run >> $LOG_FILE 2>&1"
    
    # 检查是否已存在
    if crontab -l 2>/dev/null | grep -q "auto-post-scheduler.sh"; then
        log_warning "定时任务已存在"
        return 0
    fi
    
    # 添加 cron 任务
    (crontab -l 2>/dev/null | grep -v "auto-post-scheduler.sh"; echo "$cron_job") | crontab -
    
    log_success "定时任务安装成功"
    log_info "发布时间：每天 09:00, 14:00, 20:00"
    
    # 显示当前 cron
    echo ""
    echo "当前 cron 配置:"
    crontab -l | grep "auto-post-scheduler"
}

# 卸载定时任务
uninstall_cron() {
    log_info "卸载定时任务..."
    
    # 移除 cron 任务
    crontab -l 2>/dev/null | grep -v "auto-post-scheduler.sh" | crontab -
    
    log_success "定时任务已卸载"
}

# 查看状态
show_status() {
    echo ""
    echo "======================================"
    echo "SkillPay 自动发布调度器状态"
    echo "======================================"
    echo ""
    
    # 检查配置
    if [[ -f "$CONFIG_FILE" ]]; then
        echo -e "${GREEN}✓${NC} 配置文件：$CONFIG_FILE"
    else
        echo -e "${RED}✗${NC} 配置文件不存在"
    fi
    
    # 检查文案目录
    if [[ -d "$COPY_DIR" ]]; then
        local copy_count=$(ls -1 "${COPY_DIR}"/copies_*.json 2>/dev/null | wc -l)
        echo -e "${GREEN}✓${NC} 文案目录：$copy_count 个文件"
    else
        echo -e "${RED}✗${NC} 文案目录不存在"
    fi
    
    # 检查定时任务
    if crontab -l 2>/dev/null | grep -q "auto-post-scheduler.sh"; then
        echo -e "${GREEN}✓${NC} 定时任务：已安装"
        echo "  发布时间：$(crontab -l | grep auto-post-scheduler | cut -d' ' -f1-5)"
    else
        echo -e "${YELLOW}✗${NC} 定时任务：未安装"
    fi
    
    # 显示平台状态
    echo ""
    echo "平台配置:"
    for platform in twitter xiaohongshu zhihu; do
        local status=$(get_platform_config "$platform" 2>/dev/null || echo "unknown")
        if [[ "$status" == "enabled" ]]; then
            echo -e "  ${GREEN}✓${NC} $platform: 已启用"
        else
            echo -e "  ${RED}✗${NC} $platform: 已禁用"
        fi
    done
    
    # 显示今日日志
    echo ""
    echo "今日发布记录:"
    if [[ -f "$LOG_FILE" ]]; then
        tail -20 "$LOG_FILE"
    else
        echo "  无记录"
    fi
    
    echo ""
}

# 测试发布
test_post() {
    local platform=${1:-"twitter"}
    
    log_info "测试发布到 $platform..."
    
    if post_to_platform "$platform"; then
        log_success "测试成功"
    else
        log_error "测试失败"
        exit 1
    fi
}

# 显示帮助
show_help() {
    cat << EOF
SkillPay 自动发布调度器

用法:
  $0 [选项]

选项:
  --install      安装定时任务
  --uninstall    卸载定时任务
  --run          执行发布任务 (由 cron 调用)
  --test         测试发布
  --status       查看状态
  --help         显示帮助

示例:
  $0 --install           # 安装定时任务
  $0 --test --platform twitter  # 测试 Twitter 发布
  $0 --status            # 查看状态

配置:
  配置文件：$CONFIG_FILE
  日志目录：$LOG_DIR
  文案目录：$COPY_DIR

EOF
}

# 主函数
main() {
    check_config
    
    case "${1:-}" in
        --install)
            install_cron
            ;;
        --uninstall)
            uninstall_cron
            ;;
        --run)
            run_posting
            ;;
        --test)
            shift
            test_post "${1:-twitter}"
            ;;
        --status)
            show_status
            ;;
        --help|-h)
            show_help
            ;;
        *)
            show_help
            ;;
    esac
}

main "$@"
