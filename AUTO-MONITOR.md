# 🤖 自动监控计划

**创建时间**：2026-03-10 11:35

---

## 监控任务

由于系统 crontab 不可用，我将使用**内置轮询**进行监控：

### 1. 12:15 - Skill 发布队列
- 检查速率限制是否解除
- 自动执行 `scripts/skill-publish-queue.sh`
- 发布 18 个待发布 Skill

### 2. 15:00 - 收入检查
- 读取 `data/revenue/revenue_history.json`
- 对比新旧价格效果
- 如下载量下降 >30%，建议回调

### 3. 20:00 - Twitter 发布提醒
- 提醒你发布 Twitter 线程
- 提供发布指南

---

## 如何触发

你只需要在对应时间发消息给我，例如：
- "12 点了" → 我执行 Skill 发布
- "3 点了" → 我检查收入
- "晚上 8 点了" → 我提醒 Twitter 发布

或者我会**主动在对话中提及**（如果对话持续）。

---

## 手动执行命令

如果你想立即执行：

```bash
# Skill 发布
/Users/admin/.openclaw/workspace/scripts/skill-publish-queue.sh

# ACPX 发布指南
/Users/admin/.openclaw/workspace/scripts/auto-publish-acpx.sh
```

---

*监控计划已就绪*
