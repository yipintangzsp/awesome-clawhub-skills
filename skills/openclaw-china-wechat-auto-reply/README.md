# 🦞 微信自动回复 Skill - 完整文档

## 📖 产品概述

**wechat-auto-reply** 是 OpenClaw China 推出的微信个人号自动化解决方案，帮助内容创作者、电商卖家、社群运营者实现 24 小时智能客服，大幅提升响应效率和用户满意度。

### 核心价值
- ⏰ **24 小时在线**：不再错过任何客户咨询
- 🤖 **AI 智能回复**：基于大模型的上下文理解，回复更自然
- 📊 **数据驱动**：消息统计帮助优化话术和运营策略
- 💰 **降本增效**：1 个技能 = 0.5 个客服人力，月省¥3000+

---

## 🚀 快速开始

### 前置条件
1. 已安装 OpenClaw v2.0+
2. Windows 电脑（微信自动化需要 Windows 环境）
3. 微信 PC 版 v3.9.10+
4. 稳定的网络环境

### 安装步骤

```bash
# 1. 安装技能
openclaw skills install openclaw-china-wechat-auto-reply

# 2. 初始化配置
openclaw wechat-auto-reply init

# 3. 编辑配置文件 ~/.openclaw/wechat-config.yaml
# 4. 启动服务
openclaw wechat-auto-reply start

# 5. 查看日志
openclaw wechat-auto-reply logs --follow
```

---

## ⚙️ 配置详解

### 基础配置
```yaml
wechat:
  # 绑定的手机号（用于识别账号）
  phone: "13800138000"
  
  # 自动回复开关
  auto_reply: true
  
  # AI 模型选择
  ai_model: "qwen-plus"  # 可选：qwen-plus, gpt-4, glm-4
  
  # 回复延迟（秒），避免被封
  reply_delay:
    min: 1
    max: 3
  
  # 每小时最大回复数
  rate_limit: 60
```

### 关键词回复
```yaml
keywords:
  # 精确匹配
  - trigger: "价格表"
    response: "这是我们的最新价格表：\nhttps://example.com/price.pdf"
    exact: true
  
  # 模糊匹配
  - trigger: "怎么买"
    response: "购买流程：1.私信我 2.确认需求 3.付款发货"
    exact: false
  
  # 多触发词
  - trigger: ["下单", "购买", "怎么买"]
    response: "感谢关注！请告诉我您需要的产品~"
```

### AI 智能回复
```yaml
ai_reply:
  enabled: true
  
  # 系统人设
  system_prompt: |
    你是一名专业的电商客服，语气友好、回复简洁。
    不要承诺做不到的事情，遇到不确定的问题引导用户联系人工客服。
  
  # 知识库（RAG）
  knowledge_base:
    - path: ./knowledge/products.md
    - path: ./knowledge/faq.md
  
  # 触发条件（满足任一即使用 AI）
  triggers:
    - contains_question: true  # 包含问号
    - min_length: 10  # 消息长度>10 字
    - not_keyword_match: true  # 未匹配关键词
```

### 群聊管理
```yaml
groups:
  # 欢迎语
  welcome_message: |
    🎉 欢迎 @{user} 加入群聊！
    
    本群主要交流 AI 工具和跨境电商话题。
    群规：禁止广告、禁止政治、文明交流。
    
    有任何问题可以@群主或管理员。
  
  # 入群审核（需要管理员确认）
  require_verify: true
  verify_admins: ["admin1", "admin2"]
  
  # 自动踢人规则
  auto_kick:
    - contains_ad: true  # 包含广告
    - contains_politics: true  # 敏感话题
    - spam_detection: true  # 刷屏检测
  
  # 定时群公告
  scheduled_announcements:
    - time: "09:00"
      content: "大家早上好！今日话题：AI 工具推荐"
    - time: "20:00"
      content: "晚安提醒：明天继续交流~"
```

### 定时任务
```yaml
scheduled_tasks:
  # 每日早报
  - name: "daily_news"
    cron: "0 8 * * *"
    type: "broadcast"
    content: "fetch_from_rss"
    rss_url: "https://example.com/feed.xml"
  
  # 每周活动提醒
  - name: "weekly_event"
    cron: "0 10 * * 1"
    type: "group_message"
    group_id: "xxxxx"
    content: "本周六晚 8 点直播，不见不散！"
```

---

## 📊 数据统计

### 查看统计
```bash
# 今日统计
openclaw wechat-auto-reply stats --today

# 本周统计
openclaw wechat-auto-reply stats --week

# 导出报表
openclaw wechat-auto-reply stats --export --format csv
```

### 统计指标
- 总消息数（接收/发送）
- 自动回复数（关键词/AI）
- 活跃用户数
- 群聊消息数
- 高峰时段分析
- 热门关键词 TOP10

---

## 🔧 高级功能

### 多账号管理（企业版）
```yaml
accounts:
  - phone: "13800138000"
    role: "primary"
    max_messages_per_hour: 60
  
  - phone: "13900139000"
    role: "backup"
    max_messages_per_hour: 60
  
  # 负载均衡
  load_balance:
    strategy: "round_robin"  # 或 least_loaded
```

### API 接口
```bash
# 手动发送消息
curl -X POST http://localhost:3000/api/send \
  -H "Content-Type: application/json" \
  -d '{"to": "user_id", "message": "Hello"}'

# 获取聊天记录
curl http://localhost:3000/api/history?user_id=xxx&limit=50
```

### Webhook 集成
```yaml
webhooks:
  # 新消息通知
  on_message:
    url: "https://your-server.com/webhook"
    events: ["new_message", "keyword_match", "ai_reply"]
  
  # 异常告警
  on_error:
    url: "https://your-server.com/alert"
    events: ["login_failed", "rate_limit_exceeded"]
```

---

## ⚠️ 风险提示

### 封号风险
微信官方不允许使用自动化工具，存在封号风险。建议：
1. **养号**：新号使用 30 天以上再开启自动化
2. **限流**：每小时回复<60 条，每天<500 条
3. **拟人化**：设置随机延迟，避免秒回
4. **内容**：避免敏感词、营销词、政治内容
5. **设备**：固定设备登录，避免频繁切换

### 合规建议
- 个人号仅用于客服，不要用于大规模营销
- 企业用户优先使用企业微信（官方支持 API）
- 保留人工客服入口，重要问题人工处理
- 遵守《网络安全法》和平台规则

---

## 💬 常见问题

**Q: 需要一直开着电脑吗？**
A: 是的，微信自动化需要在 Windows 上运行微信客户端。建议使用云服务器或旧电脑 24 小时挂机。

**Q: 支持 Mac 吗？**
A: 不支持。微信 PC 版只有 Windows 版本有自动化框架支持。

**Q: 会被封号吗？**
A: 有风险。按照上述合规建议操作可大幅降低风险，但无法 100% 保证。

**Q: 能发朋友圈吗？**
A: 当前版本不支持。后续版本可能加入朋友圈自动发布功能。

**Q: 支持视频号吗？**
A: 不支持。视频号需要单独的自动化方案。

---

## 📞 技术支持

- **文档中心**: https://openclaw.cn/docs/wechat-auto-reply
- **工单系统**: support@openclaw.cn
- **微信社群**: 添加 openclaw_helper 进群
- **付费咨询**: ¥500/小时（可抵扣部署费）

---

## 📝 更新日志

### v1.2.0 (2026-03)
- ✨ 新增 AI 智能回复（RAG 知识库）
- ✨ 新增群聊欢迎语自定义
- 🐛 修复关键词匹配 bug
- 🐛 修复定时任务时区问题

### v1.1.0 (2026-02)
- ✨ 新增多账号支持（企业版）
- ✨ 新增数据统计导出
- 🐛 修复消息发送失败问题

### v1.0.0 (2026-01)
- 🎉 首次发布

---

*最后更新：2026-03-09*
*维护者：OpenClaw China Team*
