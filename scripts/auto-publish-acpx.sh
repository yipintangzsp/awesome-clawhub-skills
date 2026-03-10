#!/bin/bash
# Auto-publish ACPX articles to social platforms
# Usage: ./auto-publish-acpx.sh

set -e

WORKSPACE="/Users/admin/.openclaw/workspace"
LOG_FILE="$HOME/Library/Logs/openclaw/acpx-publish.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=== ACPX 文章自动发布开始 ==="

# 检查文件是否存在
if [ ! -f "$WORKSPACE/pending-posts/zhihu/acpx-article.md" ]; then
    log "❌ 知乎文章不存在"
    exit 1
fi

if [ ! -f "$WORKSPACE/pending-posts/twitter/acpx-thread.md" ]; then
    log "❌ Twitter 线程不存在"
    exit 1
fi

if [ ! -f "$WORKSPACE/pending-posts/xiaohongshu/acpx-note.md" ]; then
    log "❌ 小红书笔记不存在"
    exit 1
fi

log "✅ 所有文章文件就绪"

# 知乎发布（需要手动，生成提示）
log "📝 知乎发布指南："
log "1. 打开 https://zhuanlan.zhihu.com/"
log "2. 点击'写文章'"
log "3. 复制：$WORKSPACE/pending-posts/zhihu/acpx-article.md"
log "4. 添加话题：#AI #自动化 #OpenClaw #ACPX #效率工具"
log "5. 发布时间：14:00-16:00（工作日）或 20:00-22:00"

# Twitter 发布（需要手动，生成提示）
log "🐦 Twitter 发布指南："
log "1. 打开 https://twitter.com/"
log "2. 复制：$WORKSPACE/pending-posts/twitter/acpx-thread.md"
log "3. 分 8 条推文发布（使用'添加推文'功能）"
log "4. 添加标签：#AI #OpenClaw #ACPX #自动化"
log "5. 发布时间：20:00-22:00"

# 小红书发布（需要手动，生成提示）
log "📕 小红书发布指南："
log "1. 打开小红书 APP"
log "2. 上传封面图（标题：AI 代理的 USB-C 时刻）"
log "3. 复制：$WORKSPACE/pending-posts/xiaohongshu/acpx-note.md"
log "4. 添加标签：#AI 工具 #自动化 #被动收入 #副业"
log "5. 发布时间：12:00-13:00 或 20:00-22:00"

log "=== 发布指南生成完成 ==="
log "⚠️ 注意：由于平台 API 限制，需要手动复制粘贴发布"
log "💡 提示：发布后 1-2 小时内积极回复评论可提高曝光"

# 生成发布检查清单
cat > "$WORKSPACE/pending-posts/ACPX-PUBLISH-CHECKLIST.md" << 'EOF'
# ACPX 文章发布检查清单

## 知乎
- [ ] 登录知乎创作者中心
- [ ] 复制 acpx-article.md 内容
- [ ] 添加话题：#AI #自动化 #OpenClaw #ACPX
- [ ] 上传封面图（可选：收入截图）
- [ ] 发布时间：14:00-16:00
- [ ] 发布后 2 小时回复评论
- [ ] 私信设置："ACPX"自动回复模板

## Twitter
- [ ] 登录 Twitter
- [ ] 复制 acpx-thread.md 内容
- [ ] 分 8 条推文发布
- [ ] 添加话题标签
- [ ] 发布时间：20:00-22:00
- [ ] 发布后置顶
- [ ] 回复前 10 条评论

## 小红书
- [ ] 准备封面图（收入截图 + 大标题）
- [ ] 复制 acpx-note.md 内容
- [ ] 添加标签
- [ ] 发布时间：12:00-13:00 或 20:00-22:00
- [ ] 发布后回复前 10 条评论
- [ ] 设置私信自动回复

## 私信自动回复模板

```
感谢关注 ACPX！🙏

我已整理好工作流模板：
1. 链上监控 + 自动交易
2. 内容创作流水线
3. 电商选品自动化

回复数字获取：
1️⃣ 链上工作流
2️⃣ 内容工作流
3️⃣ 电商工作流
📚 全部模板

（如果是合作/咨询，请直接说问题）
```

## 效果追踪

| 平台 | 曝光 | 互动 | 私信 | 转化 | 备注 |
|------|------|------|------|------|------|
| 知乎 | - | - | - | - | 待发布 |
| Twitter | - | - | - | - | 待发布 |
| 小红书 | - | - | - | - | 待发布 |

**目标**：
- 知乎：5000+ 阅读，50+ 私信
- Twitter: 2000+ 曝光，2% 点击率
- 小红书：10000+ 阅读，100+ 互动

---

*最后更新：2026-03-10 11:25*
EOF

log "✅ 发布检查清单已生成：$WORKSPACE/pending-posts/ACPX-PUBLISH-CHECKLIST.md"
log "=== 脚本执行完成 ==="
