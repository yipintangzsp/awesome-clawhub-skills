# wechat-group-digest - 微信群消息自动整理技能

## 描述
自动解密、分类、整理微信群聊天记录，生成日报/周报/月报，推送重要提醒。适合群主、知识付费运营者、社群管理者。

## 功能
- 📥 调用 wechat-decrypt 解密微信聊天记录
- 🤖 AI 自动分类整理（按话题/人员/重要性）
- 📊 生成日报/周报/月报摘要
- 🔔 推送重要提醒和待办事项
- 📈 统计群活跃度、热门话题、关键决策

## 使用方法
```bash
# 一次性生成日报
openclaw run wechat-group-digest --mode daily --group "项目名称"

# 生成周报
openclaw run wechat-group-digest --mode weekly --group "项目名称"

# 生成月报
openclaw run wechat-group-digest --mode monthly --group "项目名称"

# 实时监控模式
openclaw run wechat-group-digest --mode monitor --group "项目名称" --interval 3600
```

## 参数说明
| 参数 | 说明 | 默认值 |
|------|------|--------|
| --mode | 报告类型：daily/weekly/monthly/monitor | daily |
| --group | 微信群名称或 ID | 必填 |
| --interval | 监控模式下的检查间隔（秒） | 3600 |
| --output | 输出格式：markdown/html/json | markdown |
| --notify | 通知渠道：feishu/telegram/email | feishu |

## 定价
- **按次付费**: ¥20/次
- **月度订阅**: ¥299/月（无限次使用 + 实时监控）
- **年度订阅**: ¥2999/年（省¥589，送企业部署支持）

## 依赖
- wechat-decrypt 技能（需单独安装）
- 微信聊天记录导出文件（.txt 或 .json 格式）

## 输出示例
```markdown
## 群聊日报 - 产品讨论群
📅 2026-03-09

### 📊 今日概览
- 消息总数：342 条
- 活跃成员：28 人
- 高峰时段：14:00-16:00

### 🔥 热门话题
1. 新功能上线时间（45 条消息）
2. UI 设计评审（32 条消息）
3. 预算审批（28 条消息）

### ✅ 今日决策
- [决策] 新功能定于 3 月 15 日上线
- [待办] @张三 负责联系设计师

### ⚠️ 重要提醒
- 明天下午 3 点项目评审会议
- 预算审批截止本周五
```

## 安装
```bash
openclaw skills install wechat-group-digest
```

## 作者
张 sir | 内容创作者/自媒体/跨境电商

## 更新日志
- v1.0.0 (2026-03-09): 初始版本发布
