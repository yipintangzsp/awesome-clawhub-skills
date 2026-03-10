# Multi Currency Pricing - 多货币定价

## 概述

为跨境电商提供智能多货币定价系统，实时汇率转换和动态定价策略。

## 服务内容包括

- 实时汇率同步
- 动态定价调整
- 利润空间保护
- 区域差异化定价
- 价格竞争力分析

## 定价

- 月费：¥399/月
- 支持按 SKU 数量定制价格

## 使用方法

```bash
multi-currency-pricing --base-currency <基础货币> --target-currencies <目标货币>
```

## 配置

在 `~/.openclaw/workspace/config/multi-currency-pricing.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 399
}
```
