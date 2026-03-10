# Crypto Payroll System - 加密薪资系统

## 概述

为企业提供加密货币薪资发放解决方案，支持多币种、自动汇率转换和合规报表。

## 服务内容包括

- 员工钱包管理
- 薪资计算与发放
- 实时汇率转换
- 税务报表生成
- 合规审计支持

## 定价

- 月费：¥599/月
- 支持按员工数量定制价格

## 使用方法

```bash
crypto-payroll-system --employees <员工数> --tokens <代币列表>
```

## 配置

在 `~/.openclaw/workspace/config/crypto-payroll-system.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 599
}
```
