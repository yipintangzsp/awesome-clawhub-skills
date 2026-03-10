# International Shipping Opt - 国际物流优化

## 概述

优化跨境物流方案，降低运输成本，提升配送时效。

## 服务内容包括

- 多承运商比价
- 物流路线优化
- 关税计算
- 时效追踪
- 异常处理

## 定价

- 月费：¥499/月
- 支持按发货量定制价格

## 使用方法

```bash
international-shipping-opt --routes <物流路线> --volume <货量>
```

## 配置

在 `~/.openclaw/workspace/config/international-shipping-opt.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 499
}
```
