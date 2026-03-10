# Global Payment Gateway - 全球支付网关

## 概述

为跨境电商提供全球支付解决方案，支持多种支付方式和货币。

## 服务内容包括

- 多支付方式集成
- 多货币结算
- 风险控制
- 合规认证
- 交易数据分析

## 定价

- 月费：¥699/月
- 支持按交易额定制价格

## 使用方法

```bash
global-payment-gateway --regions <目标区域> --methods <支付方式>
```

## 配置

在 `~/.openclaw/workspace/config/global-payment-gateway.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 699
}
```
