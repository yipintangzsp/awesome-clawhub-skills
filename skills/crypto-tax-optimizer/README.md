# crypto-tax-optimizer

加密货币税务优化（¥129/月）

## 分类
加密货币/税务管理

## 价格
¥129/月

## 安装

```bash
clawhub install crypto-tax-optimizer
```

## 使用

```bash
crypto-tax-optimizer [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/crypto-tax-optimizer.json`
2. 添加配置:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 129,
  "exchanges": ["binance", "coinbase", "okx"],
  "tax_country": "CN",
  "fiscal_year": 2024
}
```

## 功能

- 多交易所交易数据导入
- FIFO/LIFO/HIFO 成本核算
- 自动盈亏计算
- 税务优化建议
- 合规报告生成
- 支持多国税务规则

## 许可证
MIT
