# defi-yield-aggregator

DeFi 收益聚合器（¥249/月）

## 分类
Web3/DeFi

## 价格
¥249/月

## 安装

```bash
clawhub install defi-yield-aggregator
```

## 使用

```bash
defi-yield-aggregator [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/defi-yield-aggregator.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 24,
  "protocols": ["Aave", "Compound", "Uniswap", "Curve"],
  "min_apy": 5
}
```

## 功能

- 多协议收益对比
- 自动复投策略
- 风险评估
- Gas 费优化
- SkillPay 集成

## 许可证
MIT
