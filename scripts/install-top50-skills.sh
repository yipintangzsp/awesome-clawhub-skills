#!/bin/bash
# Top 50 ClawHub Skills 批量安装脚本

SKILLS=(
  # Top 10
  "capability-evolver"
  "wacli"
  "byterover"
  "self-improving-agent"
  "atxp"
  "gog"
  "agent-browser"
  "summarize"
  "github"
  "sonoscli"
  
  # 11-20
  "weather"
  "humanize"
  "tavily"
  "free-ride"
  "bird"
  "find-skills"
  "proactive-agent"
  "auto-updater"
  "obsidian"
  "nano-banana-pro"
  
  # 21-30
  "twitter"
  "pg-release"
  "research-vault"
  "remind-me"
  "torch-market"
  "skillvet"
  "git"
  "botcoin-miner"
  "memory-tools"
  "typefully"
  
  # 31-40
  "essence-distiller"
  "pollinations"
  "config-guardian"
  "agent-chat"
  "nima-core"
  "mac-reminders"
  "danube-tools"
  "voice-ai"
  "babylon"
  "agent-boundaries"
  
  # 41-50
  "moltbillboard"
  "pinterest"
  "outlook-web"
  "pixiv"
  "narrator"
  "li-fi"
  "mediaproc"
  "golden-master"
)

echo "🦞 开始安装 Top 50 ClawHub 技能..."
echo "═══════════════════════════════════════"

INSTALLED=0
FAILED=0

for skill in "${SKILLS[@]}"; do
  echo ""
  echo "📦 安装：$skill"
  
  # 检查是否已安装
  if [ -d "skills/$skill" ]; then
    echo "⏭️  已存在，跳过"
    ((INSTALLED++))
    continue
  fi
  
  # 安装技能
  result=$(clawhub install "$skill" --force 2>&1)
  
  if echo "$result" | grep -q "OK\|Installed"; then
    echo "✅ 安装成功"
    ((INSTALLED++))
  else
    echo "❌ 安装失败：$result"
    ((FAILED++))
  fi
  
  # 避免限流，等待 2 秒
  sleep 2
done

echo ""
echo "═══════════════════════════════════════"
echo "✅ 完成！成功：$INSTALLED, 失败：$FAILED"
