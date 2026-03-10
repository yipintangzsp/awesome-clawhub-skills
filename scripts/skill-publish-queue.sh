#!/bin/bash
# Skill 发布队列 - 12:15 自动执行
# Usage: ./skill-publish-queue.sh

set -e

WORKSPACE="/Users/admin/.openclaw/workspace/skills"
LOG_FILE="$HOME/Library/Logs/openclaw/skill-publish-queue.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== Skill 发布队列开始 ==="

cd "$WORKSPACE"

# 发布队列（按优先级排序）
SKILLS=(
    # 高优先级 - 链上工具
    "crypto-whale-alert"
    "crypto-arb"
    "crypto-lending-optimizer"
    "crypto-portfolio-optimizer"
    "crypto-sentiment-analyzer"
    
    # 中优先级 - 内容创作
    "ai-content-strategy"
    "ai-market-research"
    "ai-customer-service"
    "ai-meeting-assistant"
    
    # 中优先级 - 电商工具
    "amazon-fba-calculator"
    "amazon-ppc-optimizer"
    "amazon-keyword-tracker"
    "competitor-price-monitor"
    
    # 低优先级 - 其他
    "ai-financial-advisor"
    "ai-legal-assistant"
    "ai-hr-recruiter"
    "budget-tracker-lite"
)

SUCCESS_COUNT=0
FAIL_COUNT=0

for skill in "${SKILLS[@]}"; do
    if [ -d "$skill" ]; then
        log "📦 发布：$skill"
        
        # 检查是否有 SKILL.md
        if [ ! -f "$skill/SKILL.md" ]; then
            log "⚠️ 跳过 $skill：缺少 SKILL.md"
            ((FAIL_COUNT++))
            continue
        fi
        
        # 发布
        if clawhub publish "$skill" --version 1.1.0 >> "$LOG_FILE" 2>&1; then
            log "✅ 成功：$skill"
            ((SUCCESS_COUNT++))
        else
            log "❌ 失败：$skill"
            ((FAIL_COUNT++))
        fi
        
        # 速率限制检查（每 5 个休息 1 分钟）
        if [ $(( (SUCCESS_COUNT + 1) % 5 )) -eq 0 ]; then
            log "⏸️ 速率限制检查，等待 60 秒..."
            sleep 60
        fi
    else
        log "⚠️ 跳过 $skill：目录不存在"
    fi
done

log "=== 发布队列完成 ==="
log "✅ 成功：$SUCCESS_COUNT"
log "❌ 失败：$FAIL_COUNT"

# 生成报告
cat > "$WORKSPACE/skill-publish-queue-report-$(date +%Y-%m-%d).md" << EOF
# Skill 发布队列报告

**执行时间**：$(date '+%Y-%m-%d %H:%M:%S')

## 结果汇总

| 指标 | 数值 |
|------|------|
| 成功 | $SUCCESS_COUNT |
| 失败 | $FAIL_COUNT |
| 总计 | ${#SKILLS[@]} |

## 成功列表

$(for skill in "${SKILLS[@]}"; do echo "- $skill"; done)

## 下一步

1. 监控下载数据
2. 根据表现调整定价
3. 准备下一批发布

---

*自动生成：skill-publish-queue.sh*
EOF

log "📄 报告已生成：$WORKSPACE/skill-publish-queue-report-$(date +%Y-%m-%d).md"
