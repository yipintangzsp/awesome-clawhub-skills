# OpenClaw 完全指南

_整理自社区热门文章 · 2026-02-28_

---

## 📚 目录

1. [核心概念](#核心概念)
2. [新手阶段：基础入门](#新手阶段基础入门)
3. [中级阶段：实用技能](#中级阶段实用技能)
4. [高级阶段：高级应用](#高级阶段高级应用)
5. [龙虾教文化](#龙虾教文化)
6. [现成基础设施](#现成基础设施)
7. [健康维护](#健康维护)
8. [快速检查清单](#快速检查清单)

---

## 核心概念

### OpenClaw 是什么？
- **不是聊天机器人**，是能够自主执行任务的个人 AI 助理
- **真实执行能力**：直接操作电脑，自动化处理邮件、日历、文件管理等
- **本地执行与隐私保护**：数据存储在本地设备，无需上传云端
- **多平台消息支持**：WhatsApp、Telegram、Discord、Slack 等 10+ 平台
- **持久记忆**：跨会话保存上下文和用户偏好
- **开源免费**：完全开源，只需订阅 AI 模型

### 核心架构
| 概念 | 说明 |
|------|------|
| **Gateway（网关）** | 与外部世界交互的方式（消息/API/CLI） |
| **Skills（技能）** | 能力扩展，类似插件，可从 Clawhub 安装 |
| **Memory（记忆）** | 记住偏好、习惯、对话上下文 |
| **Sandbox（沙盒）** | 限制系统访问权限，保护电脑安全 |

---

## 新手阶段：基础入门

### 1. 系统要求
- 操作系统：macOS、Linux 或 Windows
- 已订阅 AI 大模型：Claude、ChatGPT、Gemini 或国产大模型

### 2. 安装
```bash
# 一键安装
curl -fsSL https://openclaw.ai/install.sh | bash

# 验证安装
openclaw --version
```

### 3. 初始化配置
```bash
# 启动初始化向导
openclaw onboard
```
向导会引导完成：
- 配置 AI 模型提供商
- 选择消息平台
- 配置系统权限（建议先选沙盒模式）

### 4. 第一次对话
```bash
# 启动 OpenClaw
openclaw

# 或启动 Dashboard（Web 界面）
openclaw dashboard
# 访问 http://127.0.0.1:18789
```

### 5. 探索工作空间
```bash
# 查看工作目录
ls ~/.openclaw

# 查看配置文件
openclaw config list

# 查看已安装 Skills
openclaw skills list

# 运行安全审计
openclaw security audit
```

---

## 中级阶段：实用技能

### 1. 浏览与安装 Skills
```bash
# 搜索 Skills
openclaw skills search email

# 查看 Skill 详情
openclaw skills info @author/skill-name

# 使用 Clawhub 安装
clawhub install <skill-slug>
```

**常用 Skills 推荐：**
- 邮件管理：`@openclaw/email-manager`
- 日历管理：`@openclaw/calendar`
- 文件整理：`@openclaw/file-organizer`
- 网页搜索：`@openclaw/tavily-search`
- 新闻监控：`clawfeed-2`（6551 团队开源）

### 2. 设置定时任务
```bash
# 示例：创建每日简报
# 直接对 OpenClaw 说：
# "我想让你每天早上 8 点给我发送一份简报，包含：
#  1. 今天的天气 2. 最新的科技新闻 3. 我的日程安排"

# 管理定时任务
openclaw cron list
openclaw cron show <task-id>
openclaw cron disable <task-id>
openclaw cron delete <task-id>
```

---

## 高级阶段：高级应用

### 1. 多任务并行处理
- 创建多 Agent 并行处理任务
- 合理设置最大并发数（建议 3-5）
- 实时监控子 Agent 执行状态

### 2. Skill 开发
开发自定义 Skill 的流程：
- 清晰的文档
- 合理配置
- 错误处理
- 版本管理
- 充分测试

### 3. 多渠道部署
配置多个消息平台：
- Telegram、Discord、WebChat 等
- 消息路由规则：紧急通知→Telegram，日常交互→Discord

### 4. 性能调优与成本控制
- 启用缓存：减少重复计算
- 选择合适模型：根据任务需求选择
- 监控与限额：设置每日调用限额

---

## 龙虾教文化

### 现象级社区
- 旧金山千人聚会，粉丝戴蟹爪帽、穿龙虾服
- AI 机器人现场检测啤酒喝完自动下单
- Moltbook.com 上几万只"龙虾"AI 自己建社区、发帖

### 算力大迁徙
| 模型 | 成本 (每百万 token) |
|------|-------------------|
| MiniMax M2.5 | $0.3 |
| Claude Opus 4.6 | $5 |
| **价差** | **17 倍** |

开发者集体切换到高性价比模型：
- MiniMax M2.5（2.45 万亿 tokens/月，登顶第一）
- Kimi K2.5
- 智谱 GLM-5

### 核心理念
> **"Your machine, your rules"**

- 传统 AI：只能告诉你怎么做
- OpenClaw：直接动手帮你做
- Mac Mini M4 + 免费 API = 零成本私人 AI 军团

---

## 现成基础设施

### 6551 团队开源资源
解决了这些痛点：
- ❌ X API 太难接
- ❌ Skill 学不会
- ❌ 消息太多看不完

**MCP:**
- `github.com/6551Team/opennews-mcp`
- `github.com/6551Team/opentwitter-mcp`

**SKILL:**
- `clawhub.ai/infra404/opennews`
- `clawhub.ai/infra404/opentwitter`
- `clawfeed-2`（已安装✅）

功能：
- 直接连上 X 数据 + 全网 50+ 实时新闻 + 链上数据
- 不用配 API 密钥
- 24h 监控、分析、触发 TG 提醒

---

## 健康维护

### 为什么需要体检？
用久了会"亚健康"：
- ❌ 记忆堆积 → 检索变慢
- ❌ 技能过期 → 功能拉胯
- ❌ 项目卡住 → 胜率不修
- ❌ Token 没配 → 安全漏风
- ❌ 磁盘爆满 → 响应变慢

### 体检命令
```bash
# 健康检查
openclaw health

# 修复问题
openclaw doctor --fix

# 深度安全审计
openclaw security audit --deep

# 查看会话
openclaw sessions --store

# 清理会话
openclaw sessions cleanup --store "<path>" --dry-run
```

### 体检报告模块
1. 核心身份配置（SOUL.md）
2. 记忆系统（MEMORY.md + 每日记忆）
3. 已安装技能列表
4. 定时任务清单
5. 项目状态
6. 磁盘使用
7. 环境变量
8. 安全合规
9. 待办事项

---

## 快速检查清单

### 新手阶段 ✅
- [ ] 运行 `openclaw --version` 验证安装
- [ ] 完成 `openclaw onboard` 初始化
- [ ] 成功进行第一次对话
- [ ] 理解 Gateway/Skills/Memory/Sandbox 概念

### 中级阶段 ✅
- [ ] 安装至少 3 个 Skills
- [ ] 创建一个定时任务
- [ ] 探索工作空间结构

### 高级阶段 ✅
- [ ] 配置多 Agent 并行任务
- [ ] 开发一个自定义 Skill
- [ ] 配置至少两个消息平台
- [ ] 启用缓存并设置调用限额

### 维护 ✅
- [ ] 定期运行 `openclaw health`
- [ ] 定期运行 `openclaw doctor --fix`
- [ ] 清理过期会话和记忆文件

---

## 学习资源

### 官方资源
- 官方网站：https://openclaw.ai/
- GitHub 仓库：github.com/openclaw/openclaw
- 官方文档：https://docs.openclaw.ai/zh-CN
- Skills 市场：github.com/VoltAgent/awesome-openclaw-skills

### 社区
- Reddit: r/clawdbot, r/AiForSmallBusiness
- Discord: OpenClaw 官方 Discord 服务器
- GitHub Discussions: 在 GitHub 仓库的 Discussions 区提问

---

_最后更新：2026-02-28_
_🦞 祝你在 OpenClaw 的探索之旅中收获满满！_
