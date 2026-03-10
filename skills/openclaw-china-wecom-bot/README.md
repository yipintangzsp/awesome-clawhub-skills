# 🦞 企业微信机器人 Skill - 完整文档

## 📖 产品概述

**wecom-bot** 是 OpenClaw China 专为企业微信打造的自动化机器人开发框架，提供官方 API 支持，无封号风险，适合企业客服、内部办公自动化、客户管理等场景。

### 核心价值
- 🛡️ **官方 API**：零封号风险，稳定可靠
- 🏢 **企业级功能**：审批、汇报、打卡自动化
- 📈 **客户管理**：集成企业微信 CRM，精细化运营
- 🔗 **生态集成**：无缝对接钉钉、飞书、Slack

---

## 🚀 快速开始

### 前置条件
1. 已注册企业微信（https://work.weixin.qq.com）
2. 完成企业认证（需营业执照）
3. 创建自建应用并获取凭证

### 获取配置凭证

1. 登录企业微信管理后台
2. 进入「应用管理」→「自建」→「创建应用」
3. 记录以下信息：
   - 企业 ID（corp_id）
   - 应用 AgentID（agent_id）
   - 应用 Secret（agent_secret）
   - 通讯录管理 Secret（用于读取成员）

### 安装步骤

```bash
# 1. 安装技能
openclaw skills install openclaw-china-wecom-bot

# 2. 初始化配置
openclaw wecom-bot init

# 3. 编辑配置文件 ~/.openclaw/wecom-config.yaml
# 4. 测试连接
openclaw wecom-bot test

# 5. 启动服务
openclaw wecom-bot start
```

---

## ⚙️ 配置详解

### 基础配置
```yaml
wecom:
  # 企业 ID
  corp_id: "ww1234567890"
  
  # 企业 Secret（管理后台获取）
  corp_secret: "xxxxxxxxxxxx"
  
  # 应用配置
  agent_id: 1000001
  agent_secret: "yyyyyyyyyyyy"
  
  # 通讯录 Secret（读取成员用）
  contact_secret: "zzzzzzzzzzzz"
  
  # 回调配置（接收消息）
  callback:
    token: "your_token"
    encoding_aes_key: "your_aes_key"
```

### 群聊机器人
```yaml
chatbots:
  - name: "客服小助手"
    # 机器人 Webhook（群聊内添加机器人获取）
    webhook: "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
    
    # 关键词回复
    keywords:
      - trigger: ["你好", "您好", "hello"]
        response: "您好！我是客服助手，有什么可以帮您？"
      
      - trigger: "价格"
        response: |
          我们的产品定价如下：
          - 基础版：¥199/月
          - 专业版：¥599/月
          - 企业版：面议
          
          如需详细报价，请联系销售。
    
    # AI 智能回复
    ai_reply:
      enabled: true
      model: "qwen-plus"
      system_prompt: |
        你是企业客服助手，回答专业、简洁、友好。
        遇到无法回答的问题，引导用户联系人工客服。
    
    # 入群欢迎
    on_join:
      enabled: true
      message: |
        🎉 欢迎 @{user} 加入！
        
        我是本群智能助手，可以回答常见问题。
        输入「帮助」查看功能列表。
```

### 应用消息推送
```yaml
app_messages:
  # 日报推送
  - name: "daily_report"
    type: "textcard"
    recipients:
      type: "all"  # 或指定部门/成员
      department_ids: [1, 2, 3]
      user_ids: ["zhangsan", "lisi"]
    
    schedule: "0 18 * * *"  # 每天 18:00
    
    content:
      title: "每日工作日报"
      description: "请填写今日工作内容"
      url: "https://your-company.com/report"
      button: "填写日报"
  
  # 会议提醒
  - name: "meeting_reminder"
    type: "markdown"
    schedule: "0 9 * * 1-5"  # 工作日 9:00
    
    content:
      content: |
        ## 📅 今日会议提醒
        
        **10:00** - 产品评审会（会议室 A）
        **14:00** - 客户拜访（外出）
        **16:00** - 团队周会（线上）
        
        请准时参加！
```

### 审批自动化
```yaml
approval:
  # 自动审批规则
  auto_approve:
    - template_name: "请假申请"
      conditions:
        - field: "days"
          operator: "<="
          value: 1
        - field: "type"
          operator: "=="
          value: "年假"
      action: "approve"
      approver: "auto"
  
  # 审批通知
  notifications:
    on_submit:
      notify: ["direct_manager"]
      message: "您有一条新的审批申请待处理"
    
    on_approve:
      notify: ["applicant"]
      message: "您的申请已获批"
    
    on_reject:
      notify: ["applicant"]
      message: "您的申请未通过，请联系审批人"
```

### 客户联系
```yaml
customer:
  # 客户标签自动打标
  auto_tag:
    - keyword: "咨询价格"
      tag: "价格敏感"
    - keyword: "已购买"
      tag: "已成交"
    - keyword: "投诉"
      tag: "需跟进"
  
  # 客户群发
  broadcast:
    - name: "新品上架"
      schedule: "0 10 * * 5"  # 每周五 10:00
      content:
        type: "text"
        text: "🎉 新品上架！本周限时 8 折..."
      recipients:
        tags: ["潜在客户", "价格敏感"]
  
  # 客户欢迎语
  welcome_message: |
    您好！欢迎关注我们的企业微信~
    
    📌 回复「1」查看产品介绍
    📌 回复「2」联系人工客服
    📌 回复「3」查看订单状态
    
    工作时间：9:00-21:00
```

### 打卡/汇报自动化
```yaml
attendance:
  # 自动打卡（需员工授权）
  auto_checkin:
    enabled: true
    time: "0 9 * * 1-5"  # 工作日 9:00
    location:
      latitude: 39.9042
      longitude: 116.4074
      address: "北京市朝阳区 xxx"
  
  # 日报自动汇总
  daily_report_summary:
    schedule: "0 20 * * 1-5"
    recipients: ["manager_group"]
    template: |
      ## 📊 {{date}} 日报汇总
      
      {{#each reports}}
      **{{name}}**:
      {{content}}
      
      {{/each}}
      
      应提交：{{total}} 人
      已提交：{{submitted}} 人
      未提交：{{missing}} 人
```

---

## 📊 数据统计

### 查看统计
```bash
# 今日消息统计
openclaw wecom-bot stats --today

# 应用使用分析
openclaw wecom-bot stats --app

# 导出报表
openclaw wecom-bot stats --export --format excel
```

### 统计指标
- 消息发送量/接收量
- 活跃用户数
- 机器人回复数（关键词/AI）
- 审批处理量
- 客户新增数
- 群发消息触达率

---

## 🔧 高级功能

### Webhook 回调
```yaml
webhooks:
  # 接收消息回调
  on_message:
    url: "https://your-server.com/wecom/message"
    events: ["text", "image", "voice", "event"]
  
  # 审批事件
  on_approval:
    url: "https://your-server.com/wecom/approval"
    events: ["submit", "approve", "reject"]
  
  # 客户事件
  on_customer:
    url: "https://your-server.com/wecom/customer"
    events: ["add_external_contact", "del_external_contact"]
```

### 自定义应用
```yaml
custom_apps:
  - name: "数据看板"
    type: "web"
    url: "https://your-dashboard.com"
    visible_ranges:
      department_ids: [1, 2]
      user_ids: ["admin"]
  
  - name: "AI 助手"
    type: "web"
    url: "https://your-ai-app.com"
    home_page: true
```

### API 接口
```bash
# 发送应用消息
curl -X POST http://localhost:3001/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "zhangsan",
    "type": "text",
    "content": "Hello"
  }'

# 获取成员列表
curl http://localhost:3001/api/users?department_id=1

# 创建客户标签
curl -X POST http://localhost:3001/api/tags \
  -d '{"name": "VIP 客户"}'
```

---

## 🔐 权限管理

### 应用权限
```yaml
permissions:
  # 通讯录读取
  contact_read: true
  
  # 消息发送
  message_send: true
  
  # 审批管理
  approval_manage: true
  
  # 客户联系
  customer_contact: true
  
  # 打卡管理
  attendance_manage: false
```

### 成员权限
```yaml
member_permissions:
  - user_id: "zhangsan"
    roles: ["admin", "manager"]
    allowed_apps: ["all"]
  
  - user_id: "lisi"
    roles: ["employee"]
    allowed_apps: ["daily_report", "attendance"]
```

---

## 💬 常见问题

**Q: 企业微信和个人微信有什么区别？**
A: 企业微信是官方为企业打造的办公工具，提供完整 API，无封号风险。个人微信是社交工具，自动化存在封号风险。

**Q: 需要企业认证吗？**
A: 是的，使用高级功能（如客户联系、审批）需要完成企业认证（提交营业执照）。

**Q: 消息有限制吗？**
A: 有。单个应用每天最多发送 5000 条消息，企业版可提升配额。

**Q: 支持外部微信群吗？**
A: 支持。企业微信可以添加微信用户为好友，拉入外部群。

**Q: 可以集成钉钉/飞书吗？**
A: 可以。OpenClaw 提供跨平台集成方案，实现消息互通。

---

## 📞 技术支持

- **文档中心**: https://openclaw.cn/docs/wecom-bot
- **工单系统**: support@openclaw.cn
- **微信社群**: 添加 openclaw_helper 进群
- **付费咨询**: ¥800/小时（可抵扣部署费）

---

## 📝 更新日志

### v1.3.0 (2026-03)
- ✨ 新增审批自动化
- ✨ 新增客户标签自动打标
- 🐛 修复消息回调问题

### v1.2.0 (2026-02)
- ✨ 新增打卡自动化
- ✨ 新增日报汇总
- 🐛 修复权限验证 bug

### v1.1.0 (2026-01)
- ✨ 新增 AI 智能回复
- ✨ 新增应用消息模板
- 🐛 修复群聊机器人问题

### v1.0.0 (2025-12)
- 🎉 首次发布

---

*最后更新：2026-03-09*
*维护者：OpenClaw China Team*
