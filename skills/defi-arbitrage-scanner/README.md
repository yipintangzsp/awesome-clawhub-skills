# defi-arbitrage-scanner

DeFi 套利扫描器（¥149/月）

## 分类
加密货币/DeFi 交易

## 价格
¥149/月

## 安装

```bash
clawhub install defi-arbitrage-scanner
```

## 使用

```bash
defi-arbitrage-scanner [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/defi-arbitrage-scanner.json`
2. 添加配置:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 149,
  "dexes": ["uniswap", "sushiswap", "curve"],
  "min_profit_threshold": 0.5,
  "alert_channel": "telegram"
}
```

## 功能

- 多 DEX 实时价格扫描
- 套利机会自动识别
- 闪电贷可行性计算
-  gas 费优化建议
- 实时警报推送
- 历史套利记录

## 许可证
MIT
