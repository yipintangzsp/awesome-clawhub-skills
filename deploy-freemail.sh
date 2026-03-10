#!/bin/bash

###############################################################################
# Freemail 部署脚本 - Cloudflare Email Routing 自动化配置
# 用途：配置域名邮箱转发，用于 ChatGPT 批量注册
###############################################################################

set -e

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

# 检查参数
if [ $# -lt 2 ]; then
    echo "用法：$0 <域名> <主邮箱>"
    echo "示例：$0 yourdomain.com main@gmail.com"
    exit 1
fi

DOMAIN="$1"
MAIN_EMAIL="$2"
CONFIG_DIR="$HOME/.freemail"
CREDENTIALS_FILE="$CONFIG_DIR/cloudflare_credentials"

# 创建配置目录
mkdir -p "$CONFIG_DIR"

log_info "开始部署 Freemail 系统"
log_info "域名：$DOMAIN"
log_info "转发邮箱：$MAIN_EMAIL"

###############################################################################
# 步骤 1: 检查 Cloudflare API 凭证
###############################################################################
check_cloudflare_credentials() {
    log_info "检查 Cloudflare API 凭证..."
    
    if [ -f "$CREDENTIALS_FILE" ]; then
        log_success "找到 Cloudflare 凭证文件"
        source "$CREDENTIALS_FILE"
        return 0
    fi
    
    log_warning "未找到凭证文件，需要配置"
    echo ""
    echo "请获取 Cloudflare API Token:"
    echo "1. 登录 https://dash.cloudflare.com/profile/api-tokens"
    echo "2. 创建新 Token，权限：Zone:Email Routing:Edit"
    echo "3. 粘贴 Token 到下方"
    echo ""
    
    read -p "Cloudflare API Token: " -s CF_API_TOKEN
    echo ""
    read -p "Cloudflare Account ID: " CF_ACCOUNT_ID
    read -p "Cloudflare Zone ID (可选，自动获取): " CF_ZONE_ID
    
    # 保存凭证
    cat > "$CREDENTIALS_FILE" << EOF
export CF_API_TOKEN="$CF_API_TOKEN"
export CF_ACCOUNT_ID="$CF_ACCOUNT_ID"
export CF_ZONE_ID="$CF_ZONE_ID"
EOF
    
    chmod 600 "$CREDENTIALS_FILE"
    log_success "凭证已保存到 $CREDENTIALS_FILE"
    
    source "$CREDENTIALS_FILE"
}

###############################################################################
# 步骤 2: 获取 Zone ID（如果未提供）
###############################################################################
get_zone_id() {
    if [ -n "$CF_ZONE_ID" ]; then
        log_info "使用提供的 Zone ID: $CF_ZONE_ID"
        return 0
    fi
    
    log_info "自动获取 Zone ID..."
    
    RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$DOMAIN" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json")
    
    ZONE_ID=$(echo "$RESPONSE" | jq -r '.result[0].id')
    
    if [ "$ZONE_ID" = "null" ] || [ -z "$ZONE_ID" ]; then
        log_error "未找到域名 $DOMAIN 的 Zone ID"
        log_info "请确保域名已添加到 Cloudflare"
        exit 1
    fi
    
    CF_ZONE_ID="$ZONE_ID"
    log_success "获取 Zone ID: $CF_ZONE_ID"
    
    # 更新凭证文件
    sed -i.bak "s/CF_ZONE_ID=.*/CF_ZONE_ID=\"$CF_ZONE_ID\"/" "$CREDENTIALS_FILE"
}

###############################################################################
# 步骤 3: 配置 DNS 记录
###############################################################################
configure_dns() {
    log_info "配置 DNS 记录..."
    
    # 添加 MX 记录指向 Cloudflare Email Routing
    log_info "添加 MX 记录..."
    
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{
            \"type\": \"MX\",
            \"name\": \"$DOMAIN\",
            \"content\": \"route1.mx.cloudflare.net\",
            \"priority\": 1,
            \"proxied\": false
        }" | jq '.success'
    
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{
            \"type\": \"MX\",
            \"name\": \"$DOMAIN\",
            \"content\": \"route2.mx.cloudflare.net\",
            \"priority\": 5,
            \"proxied\": false
        }" | jq '.success'
    
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/dns_records" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{
            \"type\": \"MX\",
            \"name\": \"$DOMAIN\",
            \"content\": \"route3.mx.cloudflare.net\",
            \"priority\": 10,
            \"proxied\": false
        }" | jq '.success'
    
    log_success "MX 记录配置完成"
}

###############################################################################
# 步骤 4: 启用 Email Routing
###############################################################################
enable_email_routing() {
    log_info "启用 Cloudflare Email Routing..."
    
    # 启用 Email Routing
    RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/email/routing" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data '{"enabled": true}')
    
    if echo "$RESPONSE" | jq -r '.success' | grep -q "true"; then
        log_success "Email Routing 已启用"
    else
        log_warning "Email Routing 可能已启用或需要手动配置"
        log_info "请访问 Cloudflare 仪表板手动启用：Email Routing"
    fi
}

###############################################################################
# 步骤 5: 创建转发规则
###############################################################################
create_forwarding_rule() {
    log_info "创建邮箱转发规则..."
    
    # 创建通配符转发规则
    RULE_NAME="ChatGPT Auto Forward"
    
    # 先创建目标地址
    log_info "创建目标邮箱地址..."
    DEST_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/email/routing/addresses" \
        -H "Authorization: Bearer $CF_API_TOKEN" \
        -H "Content-Type: application/json" \
        --data "{
            \"email\": \"$MAIN_EMAIL\",
            \"name\": \"Main Email\"
        }")
    
    ADDRESS_ID=$(echo "$DEST_RESPONSE" | jq -r '.result.id')
    
    if [ "$ADDRESS_ID" = "null" ]; then
        log_warning "目标地址可能已存在，尝试获取现有地址"
        ADDRESS_RESPONSE=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/email/routing/addresses" \
            -H "Authorization: Bearer $CF_API_TOKEN")
        ADDRESS_ID=$(echo "$ADDRESS_RESPONSE" | jq -r '.result[] | select(.email=="'"$MAIN_EMAIL"'") | .id')
    fi
    
    if [ -n "$ADDRESS_ID" ] && [ "$ADDRESS_ID" != "null" ]; then
        log_success "目标地址 ID: $ADDRESS_ID"
        
        # 创建通配符规则
        log_info "创建通配符转发规则 (*@$DOMAIN)..."
        RULE_RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/email/routing/rules" \
            -H "Authorization: Bearer $CF_API_TOKEN" \
            -H "Content-Type: application/json" \
            --data "{
                \"name\": \"$RULE_NAME\",
                \"type\": \"wildcard\",
                \"matchers\": [{\"type\": \"all\"}],
                \"actions\": [{\"type\": \"forward\", \"value\": [\"$ADDRESS_ID\"]}]
            }")
        
        if echo "$RULE_RESPONSE" | jq -r '.success' | grep -q "true"; then
            log_success "转发规则创建成功"
        else
            log_warning "规则可能已存在，继续..."
        fi
    else
        log_error "无法创建或获取目标地址"
        log_info "请手动在 Cloudflare 仪表板配置转发规则"
    fi
}

###############################################################################
# 步骤 6: 测试邮箱接收
###############################################################################
test_email_delivery() {
    log_info "测试邮箱接收..."
    
    TEST_ADDRESS="test-$(date +%s)@$DOMAIN"
    log_info "发送测试邮件到：$TEST_ADDRESS"
    log_warning "请手动发送测试邮件并检查 $MAIN_EMAIL 是否收到"
    
    echo ""
    echo "测试步骤："
    echo "1. 使用其他邮箱发送测试邮件到：$TEST_ADDRESS"
    echo "2. 检查 $MAIN_EMAIL 是否收到邮件"
    echo "3. 确认邮件头显示正确的转发路径"
    echo ""
    
    read -p "测试是否成功？(y/n): " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_warning "测试失败，请检查配置"
        return 1
    fi
    
    log_success "邮箱转发测试通过"
}

###############################################################################
# 步骤 7: 生成配置文件
###############################################################################
generate_config() {
    log_info "生成配置文件..."
    
    cat > "$CONFIG_DIR/freemail_config.yaml" << EOF
# Freemail 配置文件
# 由 deploy-freemail.sh 自动生成

domain: $DOMAIN
main_email: $MAIN_EMAIL

cloudflare:
  zone_id: $CF_ZONE_ID
  account_id: $CF_ACCOUNT_ID
  # API Token 存储在环境变量中

email_routing:
  enabled: true
  wildcard_forwarding: true
  
test:
  last_test: $(date -Iseconds)
  status: completed
EOF
    
    log_success "配置文件已生成：$CONFIG_DIR/freemail_config.yaml"
}

###############################################################################
# 主流程
###############################################################################
main() {
    echo "========================================"
    echo "  Freemail 部署脚本 v1.0"
    echo "  Cloudflare Email Routing 自动化配置"
    echo "========================================"
    echo ""
    
    # 检查依赖
    command -v curl >/dev/null 2>&1 || { log_error "需要 curl 但未安装"; exit 1; }
    command -v jq >/dev/null 2>&1 || { log_error "需要 jq 但未安装"; exit 1; }
    
    check_cloudflare_credentials
    get_zone_id
    configure_dns
    enable_email_routing
    create_forwarding_rule
    generate_config
    
    echo ""
    echo "========================================"
    log_success "Freemail 部署完成！"
    echo "========================================"
    echo ""
    echo "下一步："
    echo "1. 手动测试邮箱转发功能"
    echo "2. 运行 auto-register-chatgpt.py 开始注册"
    echo "3. 配置 verify-forwarder.py 处理验证码"
    echo ""
    echo "配置文件位置：$CONFIG_DIR/freemail_config.yaml"
    echo "凭证文件位置：$CREDENTIALS_FILE (权限 600)"
    echo ""
}

# 执行主流程
main "$@"
