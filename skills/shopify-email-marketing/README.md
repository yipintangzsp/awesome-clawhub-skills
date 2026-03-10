# shopify-email-marketing

Shopify 邮件营销（¥129/月）

## 分类
电商/邮件营销

## 价格
¥129/月

## 安装

```bash
clawhub install shopify-email-marketing
```

## 使用

```bash
shopify-email-marketing [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/shopify-email-marketing.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 12,
  "shopify_store": "your-store.myshopify.com",
  "email_templates": ["welcome", "abandoned_cart", "post_purchase"]
}
```

## 功能

- 自动化邮件序列
- 弃购挽回
- 客户分群
- A/B 测试
- SkillPay 集成

## 许可证
MIT
