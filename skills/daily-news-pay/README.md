# Daily News Pay 🦞📰💰

**每日新闻摘要生成器（SkillPay 收费版）**

## 功能

- 📰 自动抓取指定新闻源（36Kr、HackerNews 等）
- 🤖 AI 总结成 5 条要闻
- 📮 发送到飞书/Telegram
- 💰 SkillPay 按次收费（¥0.5/次）或包月（¥9.9/月）

## 安装

```bash
# 本地安装依赖
cd /Users/admin/.openclaw/workspace/skills/daily-news-pay
npm install

# 或者通过 clawhub 安装（发布后）
clawhub install daily-news-pay
```

## 配置

创建配置文件 `~/.openclaw/workspace/config/daily-news-pay.json`：

```json
{
  "skillpay_api_key": "YOUR_SKILLPAY_API_KEY",
  "price_per_call": 0.5,
  "monthly_subscription": 9.9,
  "news_sources": ["36kr", "hackernews", "techcrunch"],
  "channel": "feishu",
  "channel_id": "your_channel_id"
}
```

## 使用

```bash
# 生成今日日报（收费 ¥0.5）
node index.js

# 或
./index.js

# 查看余额
./index.js --balance

# 充值
./index.js --topup
```

## 发布到 ClawHub

```bash
cd /Users/admin/.openclaw/workspace/skills/daily-news-pay
clawhub publish
```

## 收入分成

- 95% 归你
- 5% 平台费
- 实时提现到钱包

## 待办

- [ ] 接入 SkillPay 真实 API
- [ ] 支持更多新闻源
- [ ] 飞书/Telegram 消息发送
- [ ] 用户余额查询
- [ ] 订阅管理

---

**让 AI 为你赚钱！** 🚀
