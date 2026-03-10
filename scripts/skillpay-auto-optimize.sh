#!/bin/bash
# =============================================================================
# SkillPay 收入优化自动化脚本
# 功能：每小时检查收入，发现爆款 Skill 后自动加大推广
# 作者：小爪 (Xiao Zhua)
# 版本：1.0
# =============================================================================

set -e

# 配置
WORKSPACE="$HOME/.openclaw/workspace"
LOGFILE="$HOME/Library/Logs/skillpay-auto-optimize.log"
CONFIG_FILE="$WORKSPACE/config/skillpay-promo-config.json"
PENDING_DIR="$WORKSPACE/pending-posts"
REVENUE_FILE="$WORKSPACE/revenue-today.md"

# 创建必要的目录
mkdir -p "$PENDING_DIR"
mkdir -p "$(dirname "$LOGFILE")"

# 日志函数（输出到 stderr 和日志文件，避免污染 stdout）
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOGFILE"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >&2
}

# 检查配置文件
check_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        log "⚠️  配置文件不存在：$CONFIG_FILE"
        log "将推广内容保存到待发布文件夹"
        return 1
    fi
    return 0
}

# 检查 API 配置
has_twitter_api() {
    if [ -f "$CONFIG_FILE" ]; then
        grep -q '"twitter_api_key"' "$CONFIG_FILE" && grep -q '"twitter_api_secret"' "$CONFIG_FILE"
        return $?
    fi
    return 1
}

has_zhihu_api() {
    if [ -f "$CONFIG_FILE" ]; then
        grep -q '"zhihu_token"' "$CONFIG_FILE"
        return $?
    fi
    return 1
}

# 从 revenue-today.md 提取 TOP3 下载 Skill
get_top_skills() {
    if [ ! -f "$REVENUE_FILE" ]; then
        echo "❌ 收入文件不存在：$REVENUE_FILE" >&2
        exit 1
    fi
    
    # 解析"今日收入"表格，提取 Skill 名称和下载量
    # 只解析 ## 💰 今日收入 和 ## 📈 累计收入 之间的内容
    awk -F'|' '
    /## 💰 今日收入/ { in_table=1; next }
    /## 📈 累计收入/ { in_table=0 }
    in_table && /^[|].*[|].*[|].*[|]$/ && !/Skill/ && !/合计/ && !/---/ {
        gsub(/^[ \t]+|[ \t]+$/, "", $2)  # Skill 名称
        gsub(/^[ \t]+|[ \t]+$/, "", $3)  # 下载量
        if ($3 ~ /^[0-9]+$/ && $3 > 0 && length($2) > 0) {
            print $3, $2
        }
    }
    ' "$REVENUE_FILE" | sort -rn | head -3
}

# 生成 Twitter 推文
generate_twitter_post() {
    local skill_name="$1"
    local downloads="$2"
    local revenue="$3"
    
    # 随机选择一个模板
    local template_idx=$((RANDOM % 3))
    local content=""
    
    case $template_idx in
        0)
            content="🔥 爆款预警！$skill_name 今日下载 $downloads 次，收入 ¥$revenue！

AI 工具让被动收入变得简单，你也行！

#SkillPay #AI 工具 #被动收入 #副业"
            ;;
        1)
            content="📈 $skill_name 太火了！今日 $downloads 人付费下载

用 AI 解决真实问题 = 持续赚钱
想了解的评论区见 👇

#AI 变现 #SkillPay"
            ;;
        2)
            content="💰 又一个小爆款！$skill_name 单日 $downloads 下载

做有用的 AI 工具，钱自然会来
#独立开发 #AI 工具 #被动收入"
            ;;
    esac
    
    echo "$content"
}

# 生成知乎想法
generate_zhihu_post() {
    local skill_name="$1"
    local downloads="$2"
    local revenue="$3"
    
    cat <<EOF
做 AI 工具 3 个月，说点真实的感受：

今天 $skill_name 数据不错，$downloads 次下载，¥$revenue 收入。

不算多，但验证了一个道理：
**解决真实问题的工具，用户愿意付费。**

之前总想着做什么"大而全"的平台，后来发现：
- 用户不为"可能性"买单
- 用户为"立刻解决问题"买单

$skill_name 能火，就因为它帮人避坑/省钱/赚时间。

下一步计划：
1. 继续优化这个 Skill
2. 基于用户反馈做衍生功能
3. 保持每周 1-2 个新工具的节奏

做 AI 工具变现，慢就是快。

共勉。

#AI 工具 #副业 #被动收入 #SkillPay
EOF
}

# 生成小红书笔记
generate_xiaohongshu_post() {
    local skill_name="$1"
    local downloads="$2"
    local revenue="$3"
    
    # 计算单价（避免除以 0）
    local unit_price=0
    if [ "$downloads" -gt 0 ]; then
        unit_price=$((revenue/downloads))
    fi
    
    cat <<EOF
🔥AI 工具变现｜$skill_name 单日下载$downloads 次！

姐妹们！我的 AI 工具终于开始赚钱了！💰

📊 今日数据：
- 下载：$downloads 次
- 收入：¥$revenue
- 单价：约¥$unit_price

✨ 做对了几件事：
1️⃣ 选对痛点（帮人避坑/省钱/提效）
2️⃣ 定价合理（¥3-5 门槛低）
3️⃣ 持续引流（知乎 + 小红书 + Twitter）
4️⃣ 快速迭代（根据反馈优化）

💡 给想入局的姐妹几点建议：
❌ 不要做"大而全"
✅ 做"小而美"解决具体问题
❌ 不要等完美再发布
✅ 先上线再迭代
❌ 不要只靠平台流量
✅ 多平台引流

🎯 下一步目标：
月入¥5000+（目前进度 5%）

有想了解 SkillPay 的评论区见～
会分享从 0 到 1 的全过程！

#AI 工具 #副业 #被动收入 #女生搞钱 #SkillPay #自媒体变现 #数字游民
EOF
}

# 保存推广内容到文件
save_post() {
    local platform="$1"
    local skill_name="$2"
    local content="$3"
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local safe_name=$(echo "$skill_name" | tr ' ' '_' | tr -d '[:punct:]')
    local filename="$PENDING_DIR/${platform}_${safe_name}_${timestamp}.md"
    
    echo "$content" > "$filename"
    log "✅ 已保存：$filename"
}

# 发布到 Twitter（如果配置了 API）
post_to_twitter() {
    local content="$1"
    log "🐦 发布到 Twitter..."
    
    # 使用 openclaw message 或 twurl 发布
    if command -v twurl &> /dev/null; then
        echo "$content" | twurl -X POST "/1.1/statuses/update.json" -d status="$(cat)"
        log "✅ Twitter 发布成功"
    else
        log "⚠️  twurl 未安装，保存到待发布文件夹"
        return 1
    fi
}

# 发布到知乎（如果配置了 API）
post_to_zhihu() {
    local content="$1"
    log "📖 发布到知乎..."
    
    # 知乎 API 需要特殊处理，这里用 openclaw 替代
    openclaw message --target "zhihu" --message "$content" 2>/dev/null && \
        log "✅ 知乎发布成功" || \
        log "⚠️  知乎发布失败，保存到待发布文件夹"
}

# 主函数
main() {
    log "=========================================="
    log "🚀 SkillPay 收入优化自动化开始"
    log "=========================================="
    
    # 检查配置
    local has_config=false
    check_config && has_config=true
    
    # 获取 TOP3 Skill
    log "📈 分析 TOP3 下载 Skill..."
    local top_skills=$(get_top_skills)
    
    if [ -z "$top_skills" ]; then
        log "❌ 未能解析出 TOP Skill，检查收入文件格式"
        exit 1
    fi
    
    log "✅ 找到 TOP Skill：\n$top_skills"
    
    # 为每个 TOP Skill 生成推广内容
    echo "$top_skills" | while read -r downloads skill_name; do
        # 从收入文件获取该 Skill 的收入
        local revenue=$(awk -F'|' -v skill="$skill_name" '
        $2 ~ skill {
            gsub(/^[ \t]+|[ \t]+$/, "", $4)
            gsub(/¥/, "", $4)
            print $4
            exit
        }
        ' "$REVENUE_FILE")
        
        # 如果收入为空，设为 0
        revenue=${revenue:-0}
        
        log "----------------------------------------"
        log "📦 处理 Skill: $skill_name"
        log "   下载：$downloads | 收入：¥$revenue"
        
        # 生成 Twitter 推文
        local twitter_content=$(generate_twitter_post "$skill_name" "$downloads" "$revenue")
        log "🐦 Twitter 推文已生成"
        
        # 生成知乎想法
        local zhihu_content=$(generate_zhihu_post "$skill_name" "$downloads" "$revenue")
        log "📖 知乎想法已生成"
        
        # 生成小红书笔记
        local xiaohongshu_content=$(generate_xiaohongshu_post "$skill_name" "$downloads" "$revenue")
        log "📕 小红书笔记已生成"
        
        # 发布或保存
        if $has_config; then
            # 检查并尝试自动发布
            if has_twitter_api; then
                post_to_twitter "$twitter_content" || save_post "twitter" "$skill_name" "$twitter_content"
            else
                save_post "twitter" "$skill_name" "$twitter_content"
            fi
            
            if has_zhihu_api; then
                post_to_zhihu "$zhihu_content" || save_post "zhihu" "$skill_name" "$zhihu_content"
            else
                save_post "zhihu" "$skill_name" "$zhihu_content"
            fi
            
            # 小红书没有官方 API，总是保存
            save_post "xiaohongshu" "$skill_name" "$xiaohongshu_content"
        else
            # 没有配置，全部保存
            save_post "twitter" "$skill_name" "$twitter_content"
            save_post "zhihu" "$skill_name" "$zhihu_content"
            save_post "xiaohongshu" "$skill_name" "$xiaohongshu_content"
        fi
    done
    
    log "=========================================="
    log "✅ SkillPay 收入优化自动化完成"
    log "=========================================="
    
    # 输出摘要
    local pending_count=$(ls -1 "$PENDING_DIR" 2>/dev/null | wc -l)
    log "📁 待发布内容：$pending_count 条"
    log "📄 日志文件：$LOGFILE"
}

# 执行
main "$@"
