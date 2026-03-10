# nft-floor-alert-pro

NFT 地板价警报专业版（¥79/月）

## 分类
加密货币/NFT 交易

## 价格
¥79/月

## 安装

```bash
clawhub install nft-floor-alert-pro
```

## 使用

```bash
nft-floor-alert-pro [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/nft-floor-alert-pro.json`
2. 添加配置:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 79,
  "collections": ["bored-ape", "cryptopunks"],
  "platforms": ["opensea", "blur", "looksrare"],
  "alert_threshold": 5
}
```

## 功能

- OpenSea/Blur/LooksRare 多平台比价
- 实时地板价监控
- 7 天价格走势分析
- 稀有度智能评估
- 买入/卖出信号提示
- Telegram/飞书警报推送

## 许可证
MIT
