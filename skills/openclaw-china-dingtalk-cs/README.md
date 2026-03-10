# 🦞 钉钉客服 Skill - 完整文档

## 📖 产品概述

**dingtalk-cs** 是 OpenClaw China 专为钉钉打造的智能客服系统，提供群机器人、工作通知、工单管理、知识库等完整客服解决方案，帮助企业提升客户服务效率。

### 核心价值
- 🤖 **AI 智能客服**：7x24 小时自动回复，解决 80% 常见问题
- 📋 **工单系统**：复杂问题自动转工单，跟踪处理进度
- 📚 **知识库**：FAQ 自动匹配，持续学习优化
- 📊 **数据分析**：会话质量、响应时间、满意度统计

---

## 🚀 快速开始

### 前置条件
1. 已注册钉钉账号（https://www.dingtalk.com）
2. 创建钉钉企业内部应用
3. 获取应用凭证（AgentId、AppKey、AppSecret）

### 创建钉钉应用

1. 访问钉钉开放平台：https://open.dingtalk.com
2. 进入「应用开发」→「企业内部开发」→「创建应用」
3. 填写应用信息，获取：
   - AgentId
   - AppKey
   - AppSecret
4. 配置应用权限（通讯录、消息发送等）
5. 发布应用

### 安装步骤

```bash
# 1. 安装技能
openclaw skills install openclaw-china-dingtalk-cs

# 2. 初始化配置
openclaw dingtalk-cs init

# 3. 编辑配置文件 ~/.openclaw/dingtalk-config.yaml
# 4. 测试连接
openclaw dingtalk-cs test

# 5. 启动服务
openclaw dingtalk-cs start
```

---

## ⚙️ 配置详解

### 基础配置
```yaml
dingtalk:
  # 应用凭证
  agent_id: "123456"
  app_key: "dingxxxxx"
  app_secret: "xxxxx"
  
  # 机器人 Webhook（群内添加机器人获取）
  robot_webhook: "https://oapi.dingtalk.com/robot/send?access_token=xxx"
  
  # 回调配置
  callback:
    token: "your_token"
    encoding_aes_key: "your_aes_key"
```

### 智能对话配置
```yaml
chatbot:
  # 关键词回复
  keywords:
    - trigger: ["你好", "您好", "hello", "hi"]
      response: "您好！我是智能客服助手，有什么可以帮您？"
    
    - trigger: ["价格", "多少钱", "收费"]
      response: |
        我们的产品定价如下：
        
        💰 基础版：¥199/月
        💰 专业版：¥599/月
        💰 企业版：¥1999/月
        
        如需详细报价，请联系销售顾问。
    
    - trigger: ["客服", "人工", "转人工"]
      response: "正在为您转接人工客服，请稍候...\n\n工作时间：9:00-21:00"
      action: "transfer_to_human"
  
  # AI 智能回复
  ai_reply:
    enabled: true
    model: "qwen-plus"
    system_prompt: |
      你是企业智能客服，回答专业、准确、友好。
      遇到不确定的问题，引导用户提供更多信息或转人工客服。
      不要编造信息，不要承诺做不到的事情。
    
    # 置信度阈值（低于此值转人工）
    confidence_threshold: 0.7
    
    # 敏感词过滤
    sensitive_words:
      - "政治"
      - "色情"
      - "暴力"
  
  # 上下文管理
  context:
    enabled: true
    max_turns: 10  # 保留 10 轮对话
    timeout: 1800  # 30 分钟超时
```

### 知识库管理
```yaml
knowledge_base:
  # FAQ 库
  faq:
    - category: "产品咨询"
      questions:
        - q: "你们有什么产品"
          a: "我们提供企业自动化解决方案，包括微信/钉钉/飞书机器人、智能客服、工作流程自动化等。"
        
        - q: "如何购买"
          a: "购买流程：1.联系销售 2.确认需求 3.签订合同 4.部署上线 5.售后服务"
        
        - q: "支持退款吗"
          a: "支持 7 天无理由退款。产品使用 7 天内如不满意，可全额退款。"
    
    - category: "技术支持"
      questions:
        - q: "怎么安装"
          a: "安装步骤：1.安装 OpenClaw 2.安装技能 3.配置凭证 4.启动服务。详细文档见：https://openclaw.cn/docs"
        
        - q: "报错了怎么办"
          a: "请先查看日志定位错误，然后：1.搜索常见问题 2.查看文档 3.提交工单 4.联系技术支持"
    
    - category: " billing"
      questions:
        - q: "如何开发票"
          a: "登录后台→财务管理→发票申请，填写开票信息，电子发票 1-3 个工作日发送到邮箱。"
        
        - q: "支持对公转账吗"
          a: "支持。对公转账账号：xxx 银行 xxx 支行 xxx 公司 xxx 账号。"
  
  # 智能匹配
  matching:
    algorithm: "hybrid"  # hybrid/bm25/embedding
    threshold: 0.6  # 匹配阈值
    max_results: 3  # 返回 TOP3 结果
  
  # 知识库来源
  sources:
    - type: "yaml"
      path: "./knowledge/faq.yaml"
    
    - type: "markdown"
      path: "./knowledge/docs/"
    
    - type: "api"
      url: "https://your-wiki.com/api/faq"
```

### 工单系统
```yaml
ticket:
  # 自动创建工单规则
  auto_create:
    - trigger: "keyword"
      keywords: ["投诉", "举报", "严重问题"]
      priority: "high"
    
    - trigger: "ai_detect"
      sentiment: "negative"
      confidence: 0.8
      priority: "medium"
    
    - trigger: "human_request"
      keywords: ["转人工", "人工客服"]
      priority: "normal"
  
  # 工单分配
  assignment:
    strategy: "round_robin"  # round_robin/least_loaded/skill_based
    
    # 按技能组分配
    skill_groups:
      - name: "技术支持"
        keywords: ["安装", "报错", "技术"]
        agents: ["tech1", "tech2", "tech3"]
      
      - name: "销售咨询"
        keywords: ["价格", "购买", "合同"]
        agents: ["sales1", "sales2"]
      
      - name: "财务问题"
        keywords: ["发票", "退款", "账单"]
        agents: ["finance1"]
  
  # SLA 配置
  sla:
    response_time:
      high: 1      # 高优先级 1 小时响应
      medium: 4    # 中优先级 4 小时响应
      normal: 24   # 普通优先级 24 小时响应
    
    resolution_time:
      high: 24
      medium: 72
      normal: 168
  
  # 工单通知
  notifications:
    on_create:
      notify: ["assignee", "manager"]
      message: "📋 新工单已分配给您"
    
    on_approaching_sla:
      before_minutes: 30
      notify: ["assignee", "manager"]
      message: "⚠️ 工单即将超时"
    
    on_resolve:
      notify: ["requester"]
      message: "✅ 您的工单已解决"
```

### 工作通知
```yaml
work_notifications:
  # 定时推送
  scheduled:
    - name: "daily_report"
      cron: "0 18 * * 1-5"
      recipients: ["all"]
      content: |
        ## 📊 客服日报
        
        今日接待：{{today_sessions}} 人
        解决率：{{resolution_rate}}%
        平均响应：{{avg_response_time}} 秒
        满意度：{{satisfaction}}%
  
  # 事件通知
  events:
    - trigger: "ticket_created"
      condition: "priority == 'high'"
      notify: ["manager_group"]
      message: "🚨 高优先级工单：{{ticket_id}}"
    
    - trigger: "sla_breach"
      notify: ["manager_group", "assignee"]
      message: "❌ 工单 SLA 已超时：{{ticket_id}}"
```

### 会话分配
```yaml
session:
  # 客服排班
  shifts:
    - name: "早班"
      time: "09:00-18:00"
      days: [1, 2, 3, 4, 5]
      agents: ["agent1", "agent2", "agent3"]
    
    - name: "晚班"
      time: "18:00-21:00"
      days: [1, 2, 3, 4, 5]
      agents: ["agent4", "agent5"]
    
    - name: "周末班"
      time: "10:00-18:00"
      days: [6, 0]
      agents: ["agent6"]
  
  # 负载均衡
  load_balance:
    enabled: true
    max_concurrent: 5  # 每人最多 5 个并发会话
    strategy: "least_loaded"
  
  # 离线消息
  offline:
    enabled: true
    message: "客服当前不在线，请留言，我们会在工作时间回复您。"
    auto_create_ticket: true
```

---

## 📊 数据统计

### 查看统计
```bash
# 今日会话统计
openclaw dingtalk-cs stats --today

# 客服绩效
openclaw dingtalk-cs stats --agents

# 工单统计
openclaw dingtalk-cs stats --tickets

# 导出报表
openclaw dingtalk-cs stats --export --format excel
```

### 统计指标
- 会话总数/人工会话数
- 平均响应时间
- 问题解决率
- 客户满意度
- 工单数量/处理时长
- 客服工作量排名

---

## 🔧 高级功能

### Webhook 回调
```yaml
webhooks:
  # 接收消息
  on_message:
    url: "https://your-server.com/dingtalk/message"
    events: ["text", "image", "voice"]
  
  # 工单事件
  on_ticket:
    url: "https://your-server.com/dingtalk/ticket"
    events: ["create", "assign", "resolve", "close"]
  
  # 会话事件
  on_session:
    url: "https://your-server.com/dingtalk/session"
    events: ["start", "transfer", "end"]
```

### API 接口
```bash
# 发送消息
curl -X POST http://localhost:3003/api/send \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "zhangsan",
    "msg_type": "text",
    "content": "Hello"
  }'

# 创建工单
curl -X POST http://localhost:3003/api/tickets \
  -d '{
    "title": "问题反馈",
    "content": "详细描述...",
    "priority": "normal",
    "requester": "user123"
  }'

# 获取会话历史
curl http://localhost:3003/api/sessions/{session_id}/messages
```

### 多渠道集成
```yaml
integrations:
  # 钉钉 → 微信
  to_wechat:
    enabled: true
    events: ["ticket", "session"]
  
  # 钉钉 → 飞书
  to_feishu:
    enabled: true
    events: ["notification"]
  
  # 钉钉 → 企业微信
  to_wecom:
    enabled: true
    events: ["message", "ticket"]
```

---

## 💬 常见问题

**Q: 钉钉和个人版有什么区别？**
A: 钉钉是企业办公平台，提供完整 API 和客服能力。个人钉钉功能受限。

**Q: 支持外部客户吗？**
A: 支持。钉钉可以添加外部联系人为好友，进行客户服务。

**Q: AI 回复准确吗？**
A: 基于大模型，准确率约 80%。建议配置知识库和人工兜底。

**Q: 工单系统复杂吗？**
A: 开箱即用，也支持自定义流程、字段、权限。

**Q: 可以集成 CRM 吗？**
A: 可以。通过 Webhook 和 API 可以对接 Salesforce、纷享销客等 CRM。

---

## 📞 技术支持

- **文档中心**: https://openclaw.cn/docs/dingtalk-cs
- **工单系统**: support@openclaw.cn
- **微信社群**: 添加 openclaw_helper 进群
- **付费咨询**: ¥800/小时（可抵扣部署费）

---

## 📝 更新日志

### v1.3.0 (2026-03)
- ✨ 新增工单自动分配
- ✨ 新增 SLA 超时告警
- 🐛 修复 AI 回复问题

### v1.2.0 (2026-02)
- ✨ 新增知识库管理
- ✨ 新增客服排班
- 🐛 修复会话分配 bug

### v1.1.0 (2026-01)
- ✨ 新增 AI 智能对话
- ✨ 新增工作通知
- 🐛 修复机器人消息问题

### v1.0.0 (2025-12)
- 🎉 首次发布

---

*最后更新：2026-03-09*
*维护者：OpenClaw China Team*
