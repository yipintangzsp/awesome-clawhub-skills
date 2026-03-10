# 🦞 飞书自动化 Skill - 完整文档

## 📖 产品概述

**feishu-automation** 是 OpenClaw China 专为飞书打造的自动化技能，深度集成飞书开放平台，支持多维表格、机器人、审批、日历等全场景自动化，帮助企业提升协作效率。

### 核心价值
- 📊 **多维表格自动化**：数据变更自动触发流程
- 🤖 **智能机器人**：AI 驱动的消息回复与推送
- 🔗 **生态集成**：打通飞书全家桶（文档/日历/会议）
- 📱 **移动优先**：完美支持飞书移动端

---

## 🚀 快速开始

### 前置条件
1. 已注册飞书账号（https://www.feishu.cn）
2. 创建飞书开放平台应用
3. 获取应用凭证（App ID、App Secret）

### 创建飞书应用

1. 访问飞书开放平台：https://open.feishu.cn
2. 点击「创建应用」→ 选择「企业内部应用」
3. 填写应用信息，获取：
   - App ID（cli_xxx）
   - App Secret
   - Verification Token（用于回调验证）
4. 配置应用权限（根据需求勾选）
5. 发布应用

### 安装步骤

```bash
# 1. 安装技能
openclaw skills install openclaw-china-feishu-automation

# 2. 初始化配置
openclaw feishu-automation init

# 3. 编辑配置文件 ~/.openclaw/feishu-config.yaml
# 4. 测试连接
openclaw feishu-automation test

# 5. 启动服务
openclaw feishu-automation start
```

---

## ⚙️ 配置详解

### 基础配置
```yaml
feishu:
  # 应用凭证
  app_id: "cli_a1b2c3d4e5f6"
  app_secret: "xxxxxxxxxxxxxxxx"
  verification_token: "xxxxxxxxxx"
  
  # 机器人 Webhook（群内添加机器人获取）
  bot_webhook: "https://open.feishu.cn/open-apis/bot/v2/hook/xxx"
  
  # API 域名（国内/海外）
  api_base: "https://open.feishu.cn"
```

### 多维表格自动化
```yaml
bitable_automation:
  # 表格监听
  tables:
    - app_token: "bascnxxxxx"
      table_id: "tblxxxxx"
      
      # 触发条件
      triggers:
        - type: "record_created"
          action: "notify"
          webhook: "https://your-server.com/hook"
        
        - type: "record_updated"
          fields: ["状态"]
          condition: "状态 == '已完成'"
          action: "send_message"
          message: "✅ 任务已完成：{任务名称}"
        
        - type: "record_deleted"
          action: "log"
  
  # 自动更新
  auto_update:
    - schedule: "0 9 * * 1-5"
      table: "bascnxxxxx"
      action: "import_from_api"
      api_url: "https://api.example.com/data"
      mapping:
        "姓名": "name"
        "邮箱": "email"
        "部门": "department"
```

### 机器人消息推送
```yaml
bot_messages:
  # 文本消息
  - name: "welcome"
    type: "text"
    content: "欢迎加入团队！🎉"
  
  # 富文本消息
  - name: "announcement"
    type: "post"
    content:
      zh_cn:
        title: "重要通知"
        content:
          - [{"tag": "text", "text": "今天下午 3 点开会"}, {"tag": "a", "text": "查看详情", "href": "https://example.com"}]
  
  # 交互式卡片
  - name: "approval_card"
    type: "interactive"
    template: |
      {
        "config": {
          "wide_screen_mode": true
        },
        "elements": [
          {
            "tag": "div",
            "text": {
              "content": "**审批申请**\n申请人：{name}\n金额：¥{amount}",
              "tag": "lark_md"
            }
          },
          {
            "tag": "action",
            "actions": [
              {
                "tag": "button",
                "text": {"content": "同意", "tag": "plain_text"},
                "type": "primary",
                "value": {"action": "approve"}
              },
              {
                "tag": "button",
                "text": {"content": "拒绝", "tag": "plain_text"},
                "type": "default",
                "value": {"action": "reject"}
              }
            ]
          }
        ]
      }
  
  # 定时推送
  scheduled:
    - name: "daily_standup"
      cron: "0 9 * * 1-5"
      receive_type: "group"
      chat_id: "oc_xxxxx"
      message_type: "interactive"
      content: |
        ## 📅 每日站会
        
        请大家回复：
        1. 昨天做了什么
        2. 今天计划做什么
        3. 有什么阻碍
```

### 审批自动化
```yaml
approval_automation:
  # 自动审批规则
  rules:
    - name: "小额报销自动批"
      condition:
        type: "reimbursement"
        amount: "<=500"
      action: "approve"
      approver: "system"
    
    - name: "请假 1 天内自动批"
      condition:
        type: "leave"
        days: "<=1"
      action: "approve"
  
  # 审批通知
  notifications:
    on_submit:
      notify: ["direct_manager"]
      message_type: "interactive"
    
    on_approve:
      notify: ["applicant"]
      message: "✅ 您的申请已获批"
    
    on_reject:
      notify: ["applicant", "hr"]
      message: "❌ 您的申请未通过"
```

### 日历管理
```yaml
calendar:
  # 自动创建会议
  auto_schedule:
    - name: "周会"
      cron: "0 0 * * 1"  # 每周一 0 点
      calendar_id: "primary"
      event:
        summary: "团队周会"
        description: "每周例行会议"
        start_time: "10:00"
        end_time: "11:00"
        attendees: ["team@company.com"]
        reminder: 15  # 提前 15 分钟提醒
  
  # 会议提醒
  meeting_reminders:
    enabled: true
    before_minutes: [15, 5]
    message: "⏰ 会议即将开始：{meeting_title}"
```

### 文档自动化
```yaml
docs:
  # 自动创建文档
  templates:
    - name: "会议纪要"
      folder_token: "xxxxx"
      template_path: "./templates/meeting.md"
      trigger: "calendar_event_end"
      naming: "会议纪要_{date}_{title}"
  
  # 文档权限管理
  permissions:
    - folder: "xxxxx"
      role: "editor"
      users: ["team_members"]
    
    - folder: "yyyyy"
      role: "viewer"
      users: ["all_company"]
  
  # 文档内容同步
  sync:
    - source: "https://wiki.company.com/api/docs"
      target_folder: "xxxxx"
      schedule: "0 2 * * *"
```

### 群组管理
```yaml
groups:
  # 自动拉群
  auto_add:
    - trigger: "new_employee"
      groups: ["all_staff", "department_{dept}"]
      welcome_message: "欢迎新同事！"
  
  # 群公告
  announcements:
    - schedule: "0 9 * * 1"
      chat_id: "oc_xxxxx"
      content: "本周工作重点：..."
  
  # 活跃监控
  activity_monitor:
    enabled: true
    threshold: 7  # 7 天无发言
    action: "notify_admin"
    admin: "hr@company.com"
```

---

## 📊 数据统计

### 查看统计
```bash
# 今日自动化执行次数
openclaw feishu-automation stats --today

# 多维表格操作统计
openclaw feishu-automation stats --bitable

# 导出报表
openclaw feishu-automation stats --export --format excel
```

### 统计指标
- 自动化流程执行次数
- 消息发送量
- 多维表格操作数
- 审批处理量
- 日历事件数
- 文档创建/更新数

---

## 🔧 高级功能

### Webhook 回调
```yaml
webhooks:
  # 接收飞书事件
  events:
    url: "https://your-server.com/feishu/events"
    verify_token: "your_token"
    
  # 订阅事件类型
  subscriptions:
    - "message.receive"
    - "app_ticket"
    - "bitable.record.created"
    - "approval.instance"
```

### 自定义 API
```bash
# 发送消息
curl -X POST http://localhost:3002/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "oc_xxx",
    "msg_type": "text",
    "content": "Hello"
  }'

# 创建多维表格记录
curl -X POST http://localhost:3002/api/bitable/records \
  -d '{
    "app_token": "bascn_xxx",
    "table_id": "tbl_xxx",
    "fields": {"姓名": "张三", "邮箱": "zhang@example.com"}
  }'

# 获取用户信息
curl http://localhost:3002/api/users/{user_id}
```

### 跨平台集成
```yaml
integrations:
  # 飞书 → 钉钉
  to_dingtalk:
    enabled: true
    events: ["approval", "message"]
    dingtalk_webhook: "https://oapi.dingtalk.com/robot/send?access_token=xxx"
  
  # 飞书 → 企业微信
  to_wecom:
    enabled: true
    events: ["calendar", "task"]
    wecom_webhook: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
  
  # 飞书 → Slack
  to_slack:
    enabled: true
    events: ["message", "file"]
    slack_webhook: "https://hooks.slack.com/services/xxx"
```

---

## 💬 常见问题

**Q: 飞书和个人版有什么区别？**
A: 飞书是企业协作平台，提供完整开放 API。个人飞书功能受限，建议使用企业版。

**Q: 多维表格和 Excel 有什么区别？**
A: 多维表格是数据库 + 表格，支持 API、自动化、视图等，比 Excel 更强大。

**Q: 消息有限制吗？**
A: 有。机器人消息限制 1000 条/分钟，应用消息限制 2000 条/分钟。

**Q: 支持外部联系人吗？**
A: 支持。飞书可以添加微信用户，但功能有限。

**Q: 可以集成飞书商店应用吗？**
A: 可以。通过飞书开放平台 API 可以集成第三方应用。

---

## 📞 技术支持

- **文档中心**: https://openclaw.cn/docs/feishu-automation
- **工单系统**: support@openclaw.cn
- **微信社群**: 添加 openclaw_helper 进群
- **付费咨询**: ¥600/小时（可抵扣部署费）

---

## 📝 更新日志

### v1.2.0 (2026-03)
- ✨ 新增多维表格自动化触发
- ✨ 新增交互式消息卡片
- 🐛 修复审批回调问题

### v1.1.0 (2026-02)
- ✨ 新增日历自动创建会议
- ✨ 新增文档模板功能
- 🐛 修复机器人消息失败问题

### v1.0.0 (2026-01)
- 🎉 首次发布

---

*最后更新：2026-03-09*
*维护者：OpenClaw China Team*
