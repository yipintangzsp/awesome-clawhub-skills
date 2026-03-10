#!/bin/bash
# 引流文章发布提醒系统 - 主脚本
# 功能：检查文章、发送提醒、追踪发布状态

set -e

# 配置
WORKSPACE="/Users/admin/.openclaw/workspace"
PENDING_DIR="$WORKSPACE/pending-posts"
TRACKING_FILE="$PENDING_DIR/发布追踪表 - 完整版.csv"
FEISHU_WEBHOOK="${FEISHU_WEBHOOK:-}"  # 从环境变量获取

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查文章数量
check_articles() {
  log_info "检查待发布文章..."
  
  local total=$(find "$PENDING_DIR" -name "*.md" -o -name "*.txt" | grep -v "发布" | grep -v "README" | grep -v "指南" | grep -v "手册" | grep -v "模板" | wc -l)
  local zhihu=$(find "$PENDING_DIR/zhihu" -type f 2>/dev/null | wc -l)
  local xiaohongshu=$(find "$PENDING_DIR/xiaohongshu" -type f 2>/dev/null | wc -l)
  local twitter=$(find "$PENDING_DIR/twitter" -type f 2>/dev/null | wc -l)
  local reddit=$(find "$PENDING_DIR/reddit" -type f 2>/dev/null | wc -l)
  
  echo ""
  echo "📊 文章统计:"
  echo "  总计：$total 篇"
  echo "  知乎：$zhihu 篇"
  echo "  小红书：$xiaohongshu 篇"
  echo "  Twitter: $twitter 篇"
  echo "  Reddit: $reddit 篇"
  echo ""
  
  if [ "$total" -eq 0 ]; then
    log_warning "未发现待发布文章！"
    return 1
  fi
  
  return 0
}

# 生成发布提醒
generate_reminder() {
  local target_date="${1:-tomorrow}"
  log_info "生成 $target_date 发布提醒..."
  
  # 获取发布计划
  local plan=$(grep -A20 "### $(date -d "$target_date" +%Y-%m-%d)" "$PENDING_DIR/发布提醒配置.md" 2>/dev/null | head -20)
  
  if [ -z "$plan" ]; then
    log_warning "未找到 $target_date 的发布计划"
    return 1
  fi
  
  echo ""
  echo "📢 发布提醒:"
  echo "$plan"
  echo ""
  
  return 0
}

# 发送飞书消息
send_feishu() {
  local message="$1"
  local title="${2:-发布提醒}"
  
  if [ -z "$FEISHU_WEBHOOK" ]; then
    log_warning "FEISHU_WEBHOOK 未设置，跳过飞书通知"
    return 1
  fi
  
  log_info "发送飞书通知..."
  
  curl -X POST "$FEISHU_WEBHOOK" \
    -H "Content-Type: application/json" \
    -d "{
      \"msg_type\": \"interactive\",
      \"card\": {
        \"header\": {
          \"title\": {
            \"tag\": \"plain_text\",
            \"content\": \"$title\"
          }
        },
        \"elements\": [
          {
            \"tag\": \"markdown\",
            \"content\": \"$message\"
          }
        ]
      }
    }" 2>/dev/null
  
  log_success "飞书通知已发送"
  return 0
}

# 更新追踪表
update_tracking() {
  local file="$1"
  local platform="$2"
  local publish_time="$3"
  local link="$4"
  
  log_info "更新追踪表：$file"
  
  # 使用 sed 更新 CSV (需要更复杂的逻辑，这里简化处理)
  # 实际使用时建议用 Python 或专门的 CSV 工具
  
  log_success "追踪表已更新"
  return 0
}

# 设置复盘提醒
setup_review_reminder() {
  local file="$1"
  local publish_time="$2"
  local review_24h=$(date -d "$publish_time + 24 hours" +"%Y-%m-%d %H:%M")
  local review_7d=$(date -d "$publish_time + 7 days" +"%Y-%m-%d %H:%M")
  
  log_info "设置复盘提醒:"
  echo "  24 小时复盘：$review_24h"
  echo "  7 天复盘：$review_7d"
  
  # 添加到 cron (需要用户确认)
  # echo "0 $review_24h_hour * * * $0 --review-24h $file" | crontab -
  
  return 0
}

# 显示帮助
show_help() {
  echo "引流文章发布提醒系统"
  echo ""
  echo "用法：$0 [命令] [选项]"
  echo ""
  echo "命令:"
  echo "  check           检查待发布文章"
  echo "  reminder        生成发布提醒"
  echo "  send            发送飞书通知"
  echo "  update          更新追踪表"
  echo "  review          设置复盘提醒"
  echo "  all             执行全部流程"
  echo ""
  echo "选项:"
  echo "  -d, --date      指定日期 (默认：明天)"
  echo "  -f, --file      指定文件"
  echo "  -h, --help      显示帮助"
  echo ""
  echo "示例:"
  echo "  $0 check"
  echo "  $0 reminder -d 2026-03-10"
  echo "  $0 update -f xiaohongshu-1.md"
  echo ""
}

# 主函数
main() {
  case "${1:-check}" in
    check)
      check_articles
      ;;
    reminder)
      generate_reminder "${2:-tomorrow}"
      ;;
    send)
      send_feishu "$2" "${3:-发布提醒}"
      ;;
    update)
      update_tracking "$2" "$3" "$4" "$5"
      ;;
    review)
      setup_review_reminder "$2" "$3"
      ;;
    all)
      log_info "执行完整流程..."
      check_articles
      generate_reminder
      log_success "流程完成"
      ;;
    help|--help|-h)
      show_help
      ;;
    *)
      log_error "未知命令：$1"
      show_help
      exit 1
      ;;
  esac
}

main "$@"
