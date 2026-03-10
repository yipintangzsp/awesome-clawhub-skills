# cross-chain-bridge-monitor

跨链桥监控（¥129/月）

## 分类
Web3/跨链

## 价格
¥129/月

## 安装

```bash
clawhub install cross-chain-bridge-monitor
```

## 使用

```bash
cross-chain-bridge-monitor [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/cross-chain-bridge-monitor.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 12,
  "bridges": ["Stargate", "Hop", "Synapse", "Across"],
  "chains": ["Ethereum", "Arbitrum", "Optimism", "Polygon"]
}
```

## 功能

- 跨链桥流动性监控
- 费率对比
- 安全风险评估
- 交易速度分析
- SkillPay 集成

## 许可证
MIT
