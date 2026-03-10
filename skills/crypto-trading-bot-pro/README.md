# crypto-trading-bot-pro

加密货币交易机器人（¥199/月）

## 分类
Web3/交易

## 价格
¥199/月

## 安装

```bash
clawhub install crypto-trading-bot-pro
```

## 使用

```bash
crypto-trading-bot-pro [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/crypto-trading-bot-pro.json`
2. 添加 SkillPay API Key 和交易所配置:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 19,
  "exchange_api_key": "your_exchange_key",
  "exchange_secret": "your_exchange_secret",
  "trading_pairs": ["BTC/USDT", "ETH/USDT"],
  "strategy": "grid"
}
```

## 功能

- 自动化网格交易
- 止盈止损设置
- 实时行情监控
- 交易记录追踪
- SkillPay 集成

## 许可证
MIT
