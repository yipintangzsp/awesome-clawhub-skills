# qq-group-manager - QQ 群管理 Skill

## 描述
基于 OneBot/CQHTTP 的 QQ 群管理机器人，支持自动入群欢迎、关键词回复、群规管理、签到打卡、群活跃统计、违规检测等功能。适合社群运营、粉丝群管理、兴趣群维护等场景。

## 定价
- **基础版**: ¥99/月（5 个群，10000 消息/月）
- **专业版**: ¥299/月（20 个群，100000 消息/月）
- **企业版**: ¥799/月（无限群，自定义配额）
- **部署费**: ¥499（一次性）

## 功能特性
- ✅ 自动入群欢迎
- ✅ 关键词自动回复
- ✅ AI 智能对话
- ✅ 签到打卡系统
- ✅ 群活跃统计
- ✅ 违规检测（广告/敏感词）
- ✅ 群规自动执行
- ✅ 定时群公告

## 用法
```bash
# 安装技能
openclaw skills install openclaw-china-qq-group-manager

# 配置 OneBot
openclaw qq-group-manager config --ws-url ws://127.0.0.1:8080

# 启动服务
openclaw qq-group-manager start

# 查看群统计
openclaw qq-group-manager stats --group 123456
```

## 配置示例
```yaml
qq:
  # OneBot 配置
  ws_url: "ws://127.0.0.1:8080"
  
  # 群管理
  groups:
    - group_id: 123456
      welcome_message: "欢迎新人！"
      enable_signin: true
  
  # 关键词回复
  keywords:
    - trigger: "群规"
      response: "本群规则：..."
```

## 依赖
- OneBot/CQHTTP v11+
- Node.js v18+
- OpenClaw v2.0+

## 优势
- 💬 QQ 生态完整支持
- 🤖 智能群管理
- 📊 详细群数据统计
- 🎯 社群运营利器

## 技术支持
- 文档：https://openclaw.cn/docs/qq-group-manager
- 工单：support@openclaw.cn
- 社群：添加微信 openclaw_helper
