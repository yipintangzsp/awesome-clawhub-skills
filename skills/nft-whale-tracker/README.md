# nft-whale-tracker

NFT 巨鲸追踪（¥149/月）

## 分类
Web3/NFT

## 价格
¥149/月

## 安装

```bash
clawhub install nft-whale-tracker
```

## 使用

```bash
nft-whale-tracker [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/nft-whale-tracker.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 14,
  "whale_threshold": 10000,
  "tracked_collections": ["BAYC", "Azuki", "Pudgy Penguins"]
}
```

## 功能

- 巨鲸钱包监控
- 大额交易警报
- 收藏趋势分析
- 链上数据追踪
- SkillPay 集成

## 许可证
MIT
