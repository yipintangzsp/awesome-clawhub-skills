# 🦞 QQ 群管理 Skill - 完整文档

## 📖 产品概述

**qq-group-manager** 是 OpenClaw China 专为 QQ 群打造的智能管理机器人，基于 OneBot 标准，提供入群欢迎、关键词回复、签到打卡、活跃统计、违规检测等完整社群管理功能。

### 核心价值
- 🎉 **自动欢迎**：新人入群自动欢迎，提升归属感
- 📋 **智能管理**：自动检测广告、敏感词，维护群秩序
- 📊 **数据分析**：群活跃统计，帮助优化运营策略
- 🎮 **互动玩法**：签到、打卡、小游戏，提升群活跃

---

## 🚀 快速开始

### 前置条件
1. 已安装 OneBot/CQHTTP（https://github.com/botuniverse/onebot）
2. QQ 账号已登录 OneBot
3. 目标 QQ 群已添加机器人为管理员

### 安装 OneBot

```bash
# 使用 Docker 快速部署
docker run -d --name onebot \
  -p 8080:8080 \
  -v ./onebot:/app/config \
  -v ./onebot/data:/app/data \
  ghcr.io/botuniverse/onebot-gocq:latest

# 或使用 go-cqhttp
# 下载：https://github.com/Mrs4s/go-cqhttp/releases
# 配置后运行 ./go-cqhttp
```

### 安装步骤

```bash
# 1. 安装技能
openclaw skills install openclaw-china-qq-group-manager

# 2. 初始化配置
openclaw qq-group-manager init

# 3. 编辑配置文件 ~/.openclaw/qq-config.yaml
# 4. 测试连接
openclaw qq-group-manager test

# 5. 启动服务
openclaw qq-group-manager start
```

---

## ⚙️ 配置详解

### 基础配置
```yaml
qq:
  # OneBot WebSocket 地址
  ws_url: "ws://127.0.0.1:8080"
  
  # 反向 HTTP 地址（可选）
  http_url: "http://127.0.0.1:5700"
  
  # 管理员 QQ 号
  admins:
    - 123456789
    - 987654321
```

### 群管理配置
```yaml
groups:
  - group_id: 123456
    name: "AI 交流群"
    
    # 入群欢迎
    welcome:
      enabled: true
      message: |
        🎉 欢迎 @{nickname} 加入本群！
        
        本群主要交流 AI 工具和跨境电商话题。
        
        📌 群规：
        1. 禁止广告
        2. 禁止政治敏感话题
        3. 文明交流，禁止人身攻击
        
        有任何问题可以@管理员。
      
      # 需要审核
      require_verify: false
    
    # 签到打卡
    signin:
      enabled: true
      reward:
        min: 1
        max: 10
      streak_bonus: true  # 连续签到奖励
    
    # 群规执行
    rules:
      - name: "禁止广告"
        keywords: ["加微信", "私信", "兼职", "刷单"]
        action: "kick"
        warning: "⚠️ 禁止发布广告，违者将移出群聊"
      
      - name: "禁止敏感词"
        keywords: ["政治", "色情", "暴力"]
        action: "ban"
        warning: "⚠️ 禁止发布敏感内容"
      
      - name: "文明交流"
        detect_insult: true
        action: "warn"
        warning: "⚠️ 请文明交流，禁止人身攻击"
    
    # 刷屏检测
    spam_detection:
      enabled: true
      max_messages: 10  # 1 分钟内最多 10 条
      action: "mute"
      mute_duration: 60  # 禁言 60 分钟
    
    # 定时公告
    announcements:
      - schedule: "0 9 * * *"
        message: "大家早上好！新的一天开始了~"
      
      - schedule: "0 22 * * *"
        message: "晚安提醒：早点休息，明天见！"
  
  - group_id: 789012
    name: "电商交流群"
    # 类似配置...
```

### 关键词回复
```yaml
keywords:
  # 精确匹配
  - trigger: "群规"
    response: |
      📋 本群规则：
      
      1. 禁止发布任何形式的广告
      2. 禁止讨论政治敏感话题
      3. 禁止人身攻击和辱骂
      4. 禁止刷屏和恶意@
      
      违反规则将被警告或移出群聊。
    scope: "all"  # all/group/private
  
  # 模糊匹配
  - trigger: "怎么加入"
    response: "直接邀请进群即可，或者加管理员微信：xxx"
    match_type: "contains"
  
  # 多触发词
  - trigger: ["价格", "多少钱", "收费"]
    response: |
      💰 我们的服务定价：
      
      - 基础版：¥99/月
      - 专业版：¥299/月
      - 企业版：¥799/月
      
      如需详细报价，请联系管理员。
  
  # 正则匹配
  - trigger: "^签到 (.*)$"
    response: "签到成功！{random(1,10)} 积分"
    match_type: "regex"
```

### AI 智能对话
```yaml
ai_chat:
  enabled: true
  
  # 触发条件
  trigger:
    - mention_bot: true  # 被@时触发
    - keyword: ["机器人", "AI", "小助手"]
  
  # AI 配置
  model: "qwen-plus"
  system_prompt: |
    你是 QQ 群智能助手，语气活泼、友好、幽默。
    回答简洁有趣，不要长篇大论。
    遇到不懂的问题可以卖萌或转移话题。
  
  # 上下文
  context:
    enabled: true
    max_turns: 5
  
  # 敏感词过滤
  filter:
    enabled: true
    action: "ignore"  # ignore/warn/block
```

### 签到系统
```yaml
signin:
  # 基础配置
  enabled: true
  
  # 奖励配置
  reward:
    min: 1
    max: 10
    special_dates:
      "2026-01-01": 100  # 元旦特殊奖励
  
  # 连续签到
  streak:
    enabled: true
    bonuses:
      7: 50    # 连续 7 天奖励 50 积分
      30: 300  # 连续 30 天奖励 300 积分
      100: 1000
  
  # 积分商城
  shop:
    - name: "群头衔"
      price: 100
      type: "title"
    
    - name: "禁言解除卡"
      price: 50
      type: "unmute"
    
    - name: "红包"
      price: 200
      type: "red_packet"
  
  # 排行榜
  leaderboard:
    enabled: true
    schedule: "0 20 * * *"  # 每天 20:00 发送
    top_n: 10
```

### 活跃统计
```yaml
analytics:
  # 统计周期
  periods: ["daily", "weekly", "monthly"]
  
  # 统计指标
  metrics:
    - message_count  # 消息数
    - active_members  # 活跃成员
    - peak_hour  # 高峰时段
    - top_speakers  # 活跃用户
  
  # 自动报告
  reports:
    - type: "weekly"
      schedule: "0 10 * * 1"  # 每周一 10:00
      recipients: ["admins"]
      content: |
        📊 上周群活跃报告
        
        总消息数：{{total_messages}}
        活跃成员：{{active_members}} 人
        新增成员：{{new_members}} 人
        移出成员：{{removed_members}} 人
        
        活跃 TOP3:
        {{#each top_speakers}}
        {{index}}. {{name}}: {{count}} 条
        {{/each}}
```

### 违规处理
```yaml
moderation:
  # 广告检测
  ad_detection:
    enabled: true
    patterns:
      - "加微信"
      - "QQ:"
      - "私信我"
      - "兼职"
      - "刷单"
      - "http://.*\.com"  # 外链
    
    action: "kick"
    warning: "⚠️ 禁止发布广告，已移出群聊"
  
  # 敏感词检测
  sensitive_words:
    enabled: true
    wordlist: "./config/sensitive_words.txt"
    action: "ban"
  
  # 刷屏检测
  spam_detection:
    enabled: true
    window: 60  # 秒
    threshold: 10  # 条消息
    action: "mute"
    duration: 60  # 分钟
  
  # 恶意@检测
  mention_spam:
    enabled: true
    threshold: 5  # 一次@超过 5 人
    action: "warn"
  
  # 图片审核
  image_audit:
    enabled: true
    api: "https://api.example.com/audit"
    action: "recall"
```

---

## 📊 数据统计

### 查看统计
```bash
# 今日群统计
openclaw qq-group-manager stats --today

# 指定群统计
openclaw qq-group-manager stats --group 123456

# 成员活跃排行
openclaw qq-group-manager leaderboard --group 123456

# 导出报表
openclaw qq-group-manager stats --export --format excel
```

### 统计指标
- 消息总数/日增
- 活跃成员数
- 新增/移出成员
- 签到人数
- 违规处理次数
- 活跃时段分布

---

## 🔧 高级功能

### 插件系统
```yaml
plugins:
  # 小游戏
  - name: "guess_number"
    enabled: true
    trigger: "猜数字"
  
  # 点歌
  - name: "music"
    enabled: true
    trigger: "点歌"
  
  # 天气查询
  - name: "weather"
    enabled: true
    trigger: "天气"
  
  # 翻译
  - name: "translate"
    enabled: true
    trigger: "翻译"
```

### API 接口
```bash
# 发送群消息
curl -X POST http://localhost:3004/api/send/group \
  -H "Content-Type: application/json" \
  -d '{
    "group_id": 123456,
    "message": "Hello"
  }'

# 获取成员列表
curl http://localhost:3004/api/group/123456/members

# 禁言成员
curl -X POST http://localhost:3004/api/group/123456/mute \
  -d '{"user_id": 789, "duration": 600}'
```

### Webhook 回调
```yaml
webhooks:
  on_message:
    url: "https://your-server.com/qq/message"
  
  on_join:
    url: "https://your-server.com/qq/join"
  
  on_leave:
    url: "https://your-server.com/qq/leave"
```

---

## 💬 常见问题

**Q: OneBot 是什么？**
A: OneBot 是 QQ 机器人标准，go-cqhttp 是常用实现。它模拟 QQ 客户端，让机器人可以收发 QQ 消息。

**Q: 会被封号吗？**
A: 有理论风险。建议：1. 使用小号 2. 不要频繁操作 3. 避免敏感内容。

**Q: 支持 QQ 频道吗？**
A: 当前版本仅支持 QQ 群，频道支持在开发中。

**Q: 可以自定义插件吗？**
A: 可以。参考文档编写插件，放到 plugins 目录即可。

**Q: 支持多 QQ 号吗？**
A: 支持。配置多个 OneBot 实例即可。

---

## 📞 技术支持

- **文档中心**: https://openclaw.cn/docs/qq-group-manager
- **工单系统**: support@openclaw.cn
- **微信社群**: 添加 openclaw_helper 进群
- **付费咨询**: ¥400/小时（可抵扣部署费）

---

## 📝 更新日志

### v1.2.0 (2026-03)
- ✨ 新增 AI 智能对话
- ✨ 新增积分商城
- 🐛 修复签到 bug

### v1.1.0 (2026-02)
- ✨ 新增违规检测
- ✨ 新增活跃统计
- 🐛 修复欢迎语问题

### v1.0.0 (2026-01)
- 🎉 首次发布

---

*最后更新：2026-03-09*
*维护者：OpenClaw China Team*
