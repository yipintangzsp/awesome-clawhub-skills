# wechat-auto-reply - 微信自动回复 Skill

## 描述
基于 OpenClaw 的微信个人号自动回复系统，支持关键词匹配、AI 智能回复、定时消息、群聊管理等功能。通过 WeChatFerry/WxAuto 等框架接入微信，实现 24 小时智能客服。

## 定价
- **个人版**: ¥199/月
- **企业版**: ¥599/月（支持多账号、自定义知识库）
- **部署费**: ¥999（一次性）

## 功能特性
- ✅ 关键词自动回复（精确/模糊匹配）
- ✅ AI 智能对话（接入 Qwen/GPT）
- ✅ 群聊欢迎语/入群审核
- ✅ 定时消息推送
- ✅ 消息统计与分析
- ✅ 黑名单/白名单管理
- ✅ 多账号轮询（企业版）

## 用法
```bash
# 安装技能
openclaw skills install openclaw-china-wechat-auto-reply

# 配置微信账号
openclaw wechat-auto-reply config --phone 138xxxxxxx

# 启动服务
openclaw wechat-auto-reply start

# 查看状态
openclaw wechat-auto-reply status
```

## 配置示例
```yaml
wechat:
  phone: 138xxxxxxx
  auto_reply: true
  ai_model: qwen-plus
  keywords:
    - trigger: "价格"
      response: "我们的产品定价如下..."
    - trigger: "客服"
      response: "人工客服在线时间 9:00-21:00"
  groups:
    welcome_message: "欢迎加入群聊！"
    require_verify: true
```

## 依赖
- WeChatFerry v3.9+ 或 WxAuto
- Node.js v18+
- OpenClaw v2.0+

## 注意事项
⚠️ 微信个人号存在封号风险，建议：
- 新号养号 30 天以上再使用
- 设置合理的回复频率（<60 条/小时）
- 避免敏感词和营销内容
- 企业用户建议使用企业微信

## 技术支持
- 文档：https://openclaw.cn/docs/wechat-auto-reply
- 工单：support@openclaw.cn
- 社群：添加微信 openclaw_helper
