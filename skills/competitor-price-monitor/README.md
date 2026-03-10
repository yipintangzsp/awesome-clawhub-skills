# competitor-price-monitor

竞品价格监控（¥129/月）

## 分类
电商/竞品分析

## 价格
¥129/月

## 安装

```bash
clawhub install competitor-price-monitor
```

## 使用

```bash
competitor-price-monitor [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/competitor-price-monitor.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 12,
  "competitors": ["amazon.com", "ebay.com"],
  "tracked_products": ["ASIN123", "SKU456"],
  "alert_threshold": 10
}
```

## 功能

- 竞品价格监控
- 价格历史追踪
- 调价建议
- 促销警报
- SkillPay 集成

## 许可证
MIT
