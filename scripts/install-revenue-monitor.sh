#!/bin/bash
# ============================================================================
# Revenue Monitor Pro 安装脚本
# 功能：一键安装和配置收入监控系统
# ============================================================================

set -e

WORKSPACE="$HOME/.openclaw/workspace"
SCRIPTS_DIR="$WORKSPACE/scripts"
DATA_DIR="$WORKSPACE/data/revenue"
REPORTS_DIR="$WORKSPACE/reports"
LOG_DIR="$HOME/Library/Logs"

echo "🐾 Revenue Monitor Pro 安装程序"
echo "================================"
echo ""

# 创建必要目录
echo "📁 创建目录结构..."
mkdir -p "$DATA_DIR" "$REPORTS_DIR" "$LOG_DIR"

# 初始化数据文件
echo "📊 初始化数据文件..."
if [[ ! -f "$DATA_DIR/revenue_history.json" ]]; then
    echo '{"records":[]}' > "$DATA_DIR/revenue_history.json"
    echo "  ✓ 创建历史数据文件"
fi

if [[ ! -f "$DATA_DIR/skill_stats.json" ]]; then
    echo '{"skills":[],"last_updated":0}' > "$DATA_DIR/skill_stats.json"
    echo "  ✓ 创建 Skill 统计文件"
fi

# 检查配置文件
echo "⚙️  检查配置文件..."
if [[ -f "$SCRIPTS_DIR/revenue-alert-config.json" ]]; then
    echo "  ✓ 告警配置文件已存在"
    echo ""
    echo "📝 请编辑配置文件以设置通知："
    echo "   $SCRIPTS_DIR/revenue-alert-config.json"
    echo ""
    echo "需要配置："
    echo "  - feishu_webhook: 飞书机器人 webhook URL"
    echo "  - alert_email: 告警邮箱地址"
else
    echo "  ✗ 告警配置文件不存在"
fi

# 检查脚本
echo "📜 检查脚本文件..."
if [[ -x "$SCRIPTS_DIR/revenue-monitor-pro.sh" ]]; then
    echo "  ✓ 主监控脚本已就绪"
else
    echo "  ✗ 主监控脚本不存在或无执行权限"
    chmod +x "$SCRIPTS_DIR/revenue-monitor-pro.sh" 2>/dev/null && echo "  ✓ 已添加执行权限" || true
fi

# 安装 crontab
echo ""
echo "⏰ 配置定时任务..."
echo ""
echo "选择安装方式："
echo "  1) 自动安装 crontab（推荐）"
echo "  2) 手动配置（查看配置内容）"
echo "  3) 跳过"
echo ""
read -p "请选择 [1-3]: " choice

case $choice in
    1)
        echo ""
        echo "📋 当前 crontab 配置："
        crontab -l 2>/dev/null || echo "  (空)"
        echo ""
        read -p "是否备份当前 crontab? [y/N]: " backup
        if [[ "$backup" =~ ^[Yy]$ ]]; then
            crontab -l > "$WORKSPACE/crontab.backup.$(date +%Y%m%d%H%M%S)" 2>/dev/null || true
            echo "  ✓ 已备份"
        fi
        
        echo ""
        echo "📦 安装 Revenue Monitor crontab..."
        
        # 合并 crontab
        TEMP_CRON=$(mktemp)
        crontab -l 2>/dev/null > "$TEMP_CRON" || true
        
        # 检查是否已安装
        if grep -q "revenue-monitor-pro.sh" "$TEMP_CRON" 2>/dev/null; then
            echo "  ⚠️  检测到已安装的 Revenue Monitor 任务"
            read -p "是否重新安装？[y/N]: " reinstall
            if [[ "$reinstall" =~ ^[Yy]$ ]]; then
                # 移除旧任务
                grep -v "revenue-monitor-pro.sh" "$TEMP_CRON" > "${TEMP_CRON}.new" || true
                mv "${TEMP_CRON}.new" "$TEMP_CRON"
            else
                echo "  ✓ 跳过安装"
                rm -f "$TEMP_CRON"
                exit 0
            fi
        fi
        
        # 添加新任务
        echo "" >> "$TEMP_CRON"
        echo "# Revenue Monitor Pro (installed on $(date '+%Y-%m-%d %H:%M:%S'))" >> "$TEMP_CRON"
        cat "$SCRIPTS_DIR/revenue-monitor.crontab" | grep -v "^#" | grep -v "^$" >> "$TEMP_CRON"
        
        # 安装
        crontab "$TEMP_CRON"
        rm -f "$TEMP_CRON"
        
        echo "  ✓ Crontab 安装完成"
        echo ""
        echo "📋 验证安装："
        crontab -l | grep "revenue-monitor"
        ;;
    2)
        echo ""
        echo "📄 Crontab 配置内容："
        echo "----------------------------------------"
        cat "$SCRIPTS_DIR/revenue-monitor.crontab"
        echo "----------------------------------------"
        echo ""
        echo "手动安装命令："
        echo "  crontab $SCRIPTS_DIR/revenue-monitor.crontab"
        ;;
    3)
        echo "  ⏭️  跳过 crontab 安装"
        ;;
    *)
        echo "  ✗ 无效选择"
        ;;
esac

# 测试运行
echo ""
echo "🧪 测试运行..."
read -p "是否立即运行一次检查？[y/N]: " test_run

if [[ "$test_run" =~ ^[Yy]$ ]]; then
    echo ""
    echo "运行收入检查..."
    cd "$WORKSPACE"
    "$SCRIPTS_DIR/revenue-monitor-pro.sh" check || echo "  ⚠️  测试运行失败（可能是 clawhub CLI 未配置）"
fi

# 完成
echo ""
echo "================================"
echo "✅ 安装完成！"
echo ""
echo "📚 下一步："
echo "  1. 配置飞书 webhook 和邮箱（revenue-alert-config.json）"
echo "  2. 测试 clawhub CLI 是否正常工作"
echo "  3. 等待下一次整点自动检查"
echo ""
echo "📊 查看日志："
echo "  tail -f $LOG_DIR/skillpay-revenue-monitor.log"
echo ""
echo "📁 报告位置："
echo "  $REPORTS_DIR/"
echo ""
echo "🐾 祝赚钱愉快！"
