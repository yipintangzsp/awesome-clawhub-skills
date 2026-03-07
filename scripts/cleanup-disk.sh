#!/bin/bash
# Disk Cleanup Script for OpenClaw Host
# 自动清理磁盘空间，保持系统流畅运行

set -e

echo "🧹 开始磁盘清理..."
echo "=============================="

# 记录清理前空间
BEFORE=$(df -h / | tail -1 | awk '{print $4}')
echo "📊 清理前可用空间：$BEFORE"

# 1. Homebrew 缓存清理
echo ""
echo "🍺 清理 Homebrew 缓存..."
brew cleanup --prune=all --quiet 2>/dev/null || true
rm -rf ~/Library/Caches/Homebrew/downloads/*.dmg 2>/dev/null || true
rm -rf ~/Library/Caches/Homebrew/downloads/*.tar.gz 2>/dev/null || true
echo "✅ Homebrew 缓存已清理"

# 2. npm 缓存清理
echo ""
echo "📦 清理 npm 缓存..."
npm cache clean --force 2>/dev/null || true
echo "✅ npm 缓存已清理"

# 3. pip 缓存清理
echo ""
echo "🐍 清理 pip 缓存..."
rm -rf ~/Library/Caches/pip 2>/dev/null || true
echo "✅ pip 缓存已清理"

# 4. 系统缓存清理（安全项）
echo ""
echo "💾 清理系统缓存..."
rm -rf ~/Library/Caches/com.apple.Safari/Cache.db 2>/dev/null || true
rm -rf ~/Library/Caches/Google/Chrome/Default/Cache/* 2>/dev/null || true
rm -rf ~/Library/Caches/electron/*/electron-v*.zip 2>/dev/null || true
rm -rf ~/Library/Caches/node-gyp 2>/dev/null || true
echo "✅ 系统缓存已清理"

# 5. 清理下载文件夹的旧 DMG/ZIP 文件（超过 30 天）
echo ""
echo "📥 清理下载文件夹的旧安装包..."
find ~/Downloads -type f \( -name "*.dmg" -o -name "*.zip" \) -mtime +30 -delete 2>/dev/null || true
echo "✅ 旧安装包已清理"

# 6. 清理日志文件
echo ""
echo "📋 清理日志文件..."
rm -rf ~/Library/Logs/*.log 2>/dev/null || true
find ~/Library/Logs -type f -mtime +7 -delete 2>/dev/null || true
echo "✅ 日志文件已清理"

# 7. 清理 Playwright 缓存（如果存在）
echo ""
echo "🎭 清理 Playwright 缓存..."
rm -rf ~/Library/Caches/ms-playwright 2>/dev/null || true
echo "✅ Playwright 缓存已清理"

# 8. 清理 Colima/Lima 缓存（如果存在）
echo ""
echo "🐳 清理 Colima 缓存..."
colima prune -f 2>/dev/null || true
echo "✅ Colima 缓存已清理"

# 记录清理后空间
AFTER=$(df -h / | tail -1 | awk '{print $4}')
echo ""
echo "=============================="
echo "📊 清理后可用空间：$AFTER"
echo "✅ 磁盘清理完成！"

# 输出清理报告
REPORT="🧹 磁盘清理报告 ($(date '+%Y-%m-%d %H:%M'))
清理前：$BEFORE
清理后：$AFTER
状态：✅ 成功"

echo ""
echo "$REPORT"

# 如果清理后空间仍小于 5GB，发送警告
THRESHOLD=$(df -h / | tail -1 | awk '{gsub(/G/,"",$4); print $4}')
if (( $(echo "$THRESHOLD < 5" | bc -l 2>/dev/null || echo 0) )); then
    echo ""
    echo "⚠️  警告：可用空间仍小于 5GB，请手动清理大文件！"
fi
