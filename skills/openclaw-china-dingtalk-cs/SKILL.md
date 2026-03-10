# dingtalk-cs - 钉钉客服 Skill

## 描述
基于钉钉开放平台的智能客服系统，支持群机器人、工作通知、智能对话、工单管理、知识库等功能。适合企业客服、内部支持、客户咨询等场景。

## 定价
- **基础版**: ¥299/月（5000 对话/月）
- **专业版**: ¥799/月（50000 对话/月）
- **企业版**: ¥1999/月（无限对话 + 定制）
- **部署费**: ¥1999（一次性）

## 功能特性
- ✅ 钉钉群机器人（关键词/AI 回复）
- ✅ 工作通知推送
- ✅ 智能对话（AI 驱动）
- ✅ 工单系统（创建/分配/跟踪）
- ✅ 知识库管理（FAQ 自动匹配）
- ✅ 客服会话分配
- ✅ 服务质量统计
- ✅ 多渠道集成

## 用法
```bash
# 安装技能
openclaw skills install openclaw-china-dingtalk-cs

# 配置钉钉应用
openclaw dingtalk-cs config --agent-id AGENT_ID --app-key APP_KEY

# 创建客服机器人
openclaw dingtalk-cs create-bot --name "智能客服"

# 启动服务
openclaw dingtalk-cs start

# 查看会话统计
openclaw dingtalk-cs stats
```

## 配置示例
```yaml
dingtalk:
  agent_id: "123456"
  app_key: "xxxxx"
  app_secret: "xxxxx"
  
  # 机器人配置
  robot:
    webhook: "https://oapi.dingtalk.com/robot/send?access_token=xxx"
    
  # 知识库
  knowledge_base:
    - category: "产品咨询"
      questions:
        - q: "价格多少"
          a: "我们的产品定价..."
  
  # 工单配置
  ticket:
    auto_assign: true
    sla_hours: 24
```

## 依赖
- 钉钉开放平台应用
- Node.js v18+
- OpenClaw v2.0+

## 优势
- 🏢 企业级稳定性
- 🤖 AI 智能客服
- 📊 完整数据统计
- 🔗 钉钉生态集成

## 技术支持
- 文档：https://openclaw.cn/docs/dingtalk-cs
- 工单：support@openclaw.cn
- 社群：添加微信 openclaw_helper
