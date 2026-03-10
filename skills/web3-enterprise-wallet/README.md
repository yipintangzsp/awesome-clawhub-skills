# Web3 Enterprise Wallet - Web3 企业钱包

## 概述

为企业提供安全的多签名数字资产管理解决方案，支持主流区块链网络。

## 服务内容包括

- 多签钱包部署
- 审批流程配置
- 资产管理仪表盘
- 交易审计日志
- 硬件钱包集成

## 定价

- 月费：¥799/月
- 支持按钱包数量定制价格

## 使用方法

```bash
web3-enterprise-wallet --chain <区块链> --signers <签名人数>
```

## 配置

在 `~/.openclaw/workspace/config/web3-enterprise-wallet.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 799
}
```
