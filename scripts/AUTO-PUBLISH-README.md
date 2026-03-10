# Skill 自动发布系统 - 安装说明

## 📦 已创建文件

### 1. 自动发布脚本
**路径**: `scripts/auto-publish-skills.sh`

**功能**:
- ✅ 每小时检查限流状态
- ✅ 限流解除后自动发布最多 5 个 Skill
- ✅ 发布失败自动重试（最多 3 次）
- ✅ 记录发布日志到 JSON 和文本文件
- ✅ 发布完成后通过飞书通知

**使用方法**:
```bash
# 模拟运行（不实际发布）
./scripts/auto-publish-skills.sh --dry-run

# 正常运行
./scripts/auto-publish-skills.sh --notify

# 强制模式（忽略限流）
./scripts/auto-publish-skills.sh --force --notify

# 查看帮助
./scripts/auto-publish-skills.sh --help
```

### 2. 发布队列文件
**路径**: `scripts/publish-queue.json`

**内容**:
- 待发布 Skill 队列（10 个）
- 已发布 Skill 记录（5 个）
- 限流状态跟踪
- 发布日志

### 3. Crontab 配置
**路径**: `crontab`

**定时任务**:
```
0 * * * * /Users/admin/.openclaw/workspace/scripts/auto-publish-skills.sh --notify
```
每小时 :00 执行，自动发布最多 5 个 Skill

---

## 🔧 安装步骤

### 步骤 1: 确保依赖已安装

```bash
# 检查 jq 是否安装
which jq
# 如果未安装：brew install jq

# 检查 clawhub CLI 是否安装
which clawhub
# 如果未安装：npm install -g clawhub
```

### 步骤 2: 测试脚本

```bash
cd ~/.openclaw/workspace

# 模拟运行测试
./scripts/auto-publish-skills.sh --dry-run

# 查看输出，确认正常后继续
```

### 步骤 3: 安装 Crontab

**方法 A: 使用 Python 脚本**
```bash
python3 scripts/setup-crontab.py
```

**方法 B: 手动安装**
```bash
crontab crontab
```

**方法 C: 使用安装脚本**
```bash
bash scripts/install-crontab.sh
```

### 步骤 4: 验证安装

```bash
# 查看已安装的 crontab
crontab -l

# 确认包含以下行：
# 0 * * * * /Users/admin/.openclaw/workspace/scripts/auto-publish-skills.sh --notify >> ~/Library/Logs/skillpay-auto-publish.log 2>&1
```

### 步骤 5: 手动执行一次（可选）

```bash
# 立即执行一次发布（不使用 --dry-run）
./scripts/auto-publish-skills.sh --notify
```

---

## 📊 监控和日志

### 日志文件位置

| 日志类型 | 文件路径 |
|---------|---------|
| 主日志 | `~/Library/Logs/skillpay-auto-publish.log` |
| 详细日志 | `~/Library/Logs/skillpay-publish-detailed-YYYYMMDD.log` |
| 队列状态 | `scripts/publish-queue.json` |

### 查看日志

```bash
# 实时查看主日志
tail -f ~/Library/Logs/skillpay-auto-publish.log

# 查看今天的详细日志
cat ~/Library/Logs/skillpay-publish-detailed-$(date +%Y%m%d).log

# 查看发布队列状态
cat scripts/publish-queue.json | jq '.queue'
```

---

## 🎯 当前发布队列状态

### 待发布（优先级 1 - 限流）
1. etsy-tag-generator
2. cross-border-logistics-calculator
3. amazon-keyword-tracker
4. tiktok-hashtag-generator
5. youtube-thumbnail-ai

### 待发布（优先级 2 - 限流）
6. weibo-trending-tracker
7. instagram-caption-magic

### 待发布（优先级 3 - Slug 冲突需修复）
8. ai-video-script-pro (原 slug 冲突)
9. ai-seo-writer-pro (原 slug 冲突)
10. xiaohongshu-copy-magic (原 slug 冲突)

---

## ⚠️ 注意事项

1. **限流限制**: ClawHub 每小时最多发布 5 个新 Skill，脚本会自动检测并等待
2. **Slug 冲突**: 如果 slug 已被占用，需要修改 SKILL.md 或使用 --slug 参数指定新 slug
3. **重试机制**: 发布失败会自动重试 3 次，每次间隔 30 秒
4. **通知**: 使用 --notify 参数会在发布完成后发送飞书通知

---

## 🐛 故障排除

### 问题：脚本无法执行
```bash
# 确保脚本有执行权限
chmod +x scripts/auto-publish-skills.sh
```

### 问题：clawhub 命令未找到
```bash
# 重新安装 clawhub CLI
npm install -g clawhub
```

### 问题：jq 未安装
```bash
# 安装 jq
brew install jq
```

### 问题：crontab 无法安装
```bash
# 检查 crontab 文件语法
crontab -l  # 查看当前配置
crontab crontab  # 重新安装
```

### 问题：发布失败
```bash
# 查看详细日志
tail -100 ~/Library/Logs/skillpay-publish-detailed-$(date +%Y%m%d).log

# 检查队列状态
cat scripts/publish-queue.json | jq '.queue[] | select(.status != "pending")'
```

---

## 📝 手动管理发布队列

### 添加新 Skill 到队列

编辑 `scripts/publish-queue.json`，在 `queue` 数组中添加：

```json
{
  "priority": 1,
  "skill_path": "skills/your-new-skill",
  "slug": "your-new-skill",
  "name": "Your New Skill",
  "version": "1.0.0",
  "status": "pending",
  "retry_count": 0,
  "last_attempt": null,
  "error_message": null
}
```

### 查看已发布历史

```bash
cat scripts/publish-queue.json | jq '.published'
```

### 重置限流计数器（紧急情况）

```bash
# 编辑队列文件，将以下字段设为 null 或 0
jq '.rate_limit.current_hour_count = 0 | .rate_limit.blocked_until = null' scripts/publish-queue.json > tmp.json && mv tmp.json scripts/publish-queue.json
```

---

## 🚀 下一步

1. ✅ 测试脚本运行正常
2. ⏳ 安装 crontab（如果尚未安装）
3. ⏳ 等待下一次发布周期（每小时 :00）
4. 📊 监控发布日志和队列状态

---

**创建时间**: 2026-03-09 09:12 GMT+8  
**版本**: 1.0.0  
**维护者**: 小爪 (Xiao Zhua)
