# feishu-automation - 飞书自动化 Skill

## 描述
基于飞书开放平台的自动化技能，支持多维表格自动化、机器人消息推送、审批流程、日历管理、文档协作等功能。利用 OpenClaw 已有的飞书集成能力，实现更强大的自动化场景。

## 定价
- **个人版**: ¥199/月（1000 次自动化/月）
- **团队版**: ¥499/月（10000 次自动化/月）
- **企业版**: ¥1299/月（无限次）
- **部署费**: ¥1499（一次性）

## 功能特性
- ✅ 多维表格自动化触发
- ✅ 飞书机器人消息推送
- ✅ 审批流程自动化
- ✅ 日历事件管理
- ✅ 文档自动创建/更新
- ✅ 群组机器人
- ✅ 消息卡片自定义
- ✅ 跨应用集成

## 用法
```bash
# 安装技能
openclaw skills install openclaw-china-feishu-automation

# 配置飞书应用
openclaw feishu-automation config --app-id APP_ID --app-secret APP_SECRET

# 创建自动化流程
openclaw feishu-automation create-flow --name "日报提醒"

# 启动服务
openclaw feishu-automation start

# 查看执行日志
openclaw feishu-automation logs
```

## 配置示例
```yaml
feishu:
  app_id: "cli_a1b2c3d4"
  app_secret: "xxxxx"
  verification_token: "xxxxx"
  
  # 机器人配置
  bot:
    webhook: "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
    
  # 自动化流程
  flows:
    - name: "日报提醒"
      trigger: "schedule"
      cron: "0 18 * * 1-5"
      action: "send_message"
```

## 依赖
- 飞书开放平台应用
- Node.js v18+
- OpenClaw v2.0+

## 优势
- 📊 多维表格深度集成
- 🤖 丰富的消息卡片
- 🔗 飞书全家桶打通
- 📱 移动端完美支持

## 技术支持
- 文档：https://openclaw.cn/docs/feishu-automation
- 工单：support@openclaw.cn
- 社群：添加微信 openclaw_helper
