# web3-portfolio-tracker

Web3 组合追踪（¥129/月）

## 分类
Web3/组合管理

## 价格
¥129/月

## 安装

```bash
clawhub install web3-portfolio-tracker
```

## 使用

```bash
web3-portfolio-tracker [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/web3-portfolio-tracker.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 12,
  "wallets": ["0x..."],
  "chains": ["Ethereum", "Solana", "Arbitrum"]
}
```

## 功能

- 多链资产汇总
- 收益追踪
- PnL 分析
- 资产配置建议
- SkillPay 集成

## 许可证
MIT
