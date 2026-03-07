---
name: daily-news-pay
description: 每日新闻摘要生成器（SkillPay 收费版）。自动抓取指定新闻源，AI 总结 5 条要闻，发送到飞书/Telegram。按次收费或包月订阅。
metadata: {"openclaw":{"requires":{"bins":["curl"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Daily News Pay - 收费版日报生成器 🦞📰💰

基于 SkillPay 的按次收费新闻摘要工具。

## 使用方式

```bash
# 生成今日日报（收费）
daily-news-pay --sources tech,finance --channel feishu

# 查看余额
daily-news-pay --balance

# 充值
daily-news-pay --topup
```

## SkillPay 集成

在技能执行前调用 SkillPay 计费接口：

```javascript
const response = await fetch('https://api.skillpay.me/billing/charge', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_SKILLPAY_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: userId,
    skill_id: 'daily-news-pay',
    amount: 0.5,  // 每次 ¥0.5
    currency: 'CNY'
  })
});

const result = await response.json();

if (result.success) {
  // ✅ 收费成功，执行技能逻辑
  await generateNews();
} else {
  // 💳 余额不足，返回支付链接
  return `余额不足，请充值：${result.payment_url}`;
}
```

## 配置

在 `~/.openclaw/workspace/config/daily-news-pay.json` 配置：

```json
{
  "skillpay_api_key": "YOUR_API_KEY",
  "price_per_call": 0.5,
  "monthly_subscription": 9.9,
  "news_sources": ["36kr", "hackernews", "techcrunch"],
  "channel": "feishu",
  "channel_id": "your_channel_id"
}
```

## 发布到 ClawHub

```bash
cd /Users/admin/.openclaw/workspace/skills/daily-news-pay
clawhub publish
```
