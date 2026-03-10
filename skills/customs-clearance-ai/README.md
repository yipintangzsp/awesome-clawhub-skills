# Customs Clearance AI - 清关 AI 助手

## 概述

利用 AI 技术自动化清关申报流程，降低清关风险，提升通关效率。

## 服务内容包括

- HS 编码智能匹配
- 关税自动计算
- 申报单生成
- 合规性检查
- 清关进度追踪

## 定价

- 月费：¥399/月
- 支持按申报次数定制价格

## 使用方法

```bash
customs-clearance-ai --country <目标国家> --category <商品类别>
```

## 配置

在 `~/.openclaw/workspace/config/customs-clearance-ai.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 399
}
```
