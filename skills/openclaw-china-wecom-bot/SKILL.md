# wecom-bot - 企业微信机器人 Skill

## 描述
基于企业微信官方 API 的机器人开发框架，支持群聊机器人、应用消息、工作台集成、审批自动化等功能。相比个人微信，企业微信提供官方 API，无封号风险，适合企业客服、内部自动化场景。

## 定价
- **基础版**: ¥299/月（1 个应用，5000 消息/天）
- **专业版**: ¥799/月（5 个应用，50000 消息/天）
- **企业版**: ¥1999/月（无限应用，自定义配额）
- **部署费**: ¥1999（一次性）

## 功能特性
- ✅ 群聊机器人（关键词/AI 回复）
- ✅ 应用消息推送（模板消息）
- ✅ 工作台自定义应用
- ✅ 审批流程自动化
- ✅ 客户联系人群发
- ✅ 打卡/汇报自动化
- ✅ 消息审计与归档
- ✅ 多企业支持

## 用法
```bash
# 安装技能
openclaw skills install openclaw-china-wecom-bot

# 配置企业微信
openclaw wecom-bot config --corp-id CORP_ID --agent-id AGENT_ID

# 创建机器人
openclaw wecom-bot create --name "客服助手" --type chatbot

# 启动服务
openclaw wecom-bot start

# 查看消息日志
openclaw wecom-bot logs --app myapp
```

## 配置示例
```yaml
wecom:
  corp_id: "ww123456"
  corp_secret: "xxxxx"
  agent_id: 1000001
  
  # 机器人配置
  chatbot:
    - name: "客服助手"
      webhook: "https://qyapi.weixin.qq.com/cgi-bin/webhook/..."
      keywords:
        - trigger: "帮助"
          response: "请输入您的问题..."
  
  # 应用消息
  app_messages:
    - template: "daily_report"
      recipients: ["all"]
      schedule: "0 18 * * *"
```

## 依赖
- 企业微信认证账号
- Node.js v18+
- OpenClaw v2.0+

## 优势对比
| 功能 | 企业微信 | 个人微信 |
|------|----------|----------|
| 官方 API | ✅ 支持 | ❌ 第三方 |
| 封号风险 | ✅ 无 | ⚠️ 高 |
| 消息限额 | ✅ 高 | ⚠️ 低 |
| 客户管理 | ✅ CRM 集成 | ❌ 手动 |
| 数据分析 | ✅ 官方统计 | ⚠️ 自行统计 |

## 技术支持
- 文档：https://openclaw.cn/docs/wecom-bot
- 工单：support@openclaw.cn
- 社群：添加微信 openclaw_helper
