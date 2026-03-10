#!/bin/bash

###############################################################################
# ChatGPT 无限额度系统 - 快速启动脚本
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

echo "========================================"
echo "  ChatGPT 无限额度系统"
echo "  快速启动向导"
echo "========================================"
echo ""

# 检查 Python
if ! command -v python3 &> /dev/null; then
    log_error "需要 Python 3"
    exit 1
fi

# 检查 Node.js（用于 clawhub）
if ! command -v node &> /dev/null; then
    log_warning "未找到 Node.js，部分功能可能不可用"
fi

# 创建虚拟环境（可选）
read -p "是否创建 Python 虚拟环境？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "创建虚拟环境..."
    python3 -m venv venv
    source venv/bin/activate
    log_success "虚拟环境已创建并激活"
fi

# 安装依赖
log_info "安装 Python 依赖..."
pip3 install -r requirements.txt

# 安装 Playwright 浏览器
log_info "安装 Playwright 浏览器..."
playwright install chromium

# 检查 clawhub
if command -v node &> /dev/null; then
    read -p "是否安装 clawhub CLI？(y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "安装 clawhub..."
        npm install -g clawhub
        log_success "clawhub 已安装"
    fi
fi

# 配置向导
echo ""
echo "========================================"
echo "  配置向导"
echo "========================================"
echo ""

log_info "请准备以下信息："
echo "  1. 自有域名（用于临时邮箱）"
echo "  2. 主邮箱地址（接收验证码）"
echo "  3. Cloudflare API Token"
echo ""

read -p "是否现在配置？(y/n): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 运行部署脚本
    if [ -f "deploy-freemail.sh" ]; then
        log_info "运行 Freemail 部署..."
        echo "请按照提示输入域名和邮箱"
        echo ""
        # 注意：这里需要用户手动输入参数
        log_warning "请手动运行：./deploy-freemail.sh <域名> <邮箱>"
    else
        log_error "未找到 deploy-freemail.sh"
    fi
fi

# 显示使用说明
echo ""
echo "========================================"
echo "  安装完成！"
echo "========================================"
echo ""
echo "下一步操作："
echo ""
echo "1. 配置邮箱转发"
echo "   ./deploy-freemail.sh yourdomain.com main@gmail.com"
echo ""
echo "2. 注册 ChatGPT 账号"
echo "   python3 auto-register-chatgpt.py --count 10 --domain yourdomain.com"
echo ""
echo "3. 启动验证码监控"
echo "   python3 verify-forwarder.py --email main@gmail.com --password APP_PASSWORD"
echo ""
echo "4. 使用账号池"
echo "   python3 example-usage.py"
echo ""
echo "5. 生成新 Skill"
echo "   python3 codex-skill-generator.py --prompt \"创建天气查询 Skill\" --name weather"
echo ""
echo "文档："
echo "  - infinite-chatgpt-system.md (完整文档)"
echo "  - config/settings.yaml (配置文件)"
echo ""
echo "========================================"
log_success "准备就绪！"
echo "========================================"
