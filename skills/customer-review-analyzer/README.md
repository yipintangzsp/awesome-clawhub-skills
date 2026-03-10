# customer-review-analyzer

客户评论分析（¥99/月）

## 分类
电商/评论分析

## 价格
¥99/月

## 安装

```bash
clawhub install customer-review-analyzer
```

## 使用

```bash
customer-review-analyzer [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/customer-review-analyzer.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 9,
  "sources": ["Amazon", "Shopify", "Etsy"],
  "analysis_depth": "sentiment"
}
```

## 功能

- 评论情感分析
- 问题自动识别
- 改进建议
- 竞品评论对比
- SkillPay 集成

## 许可证
MIT
