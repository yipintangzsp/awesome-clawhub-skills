# dao-treasury-analyzer

DAO 财库分析（¥179/月）

## 分类
Web3/DAO

## 价格
¥179/月

## 安装

```bash
clawhub install dao-treasury-analyzer
```

## 使用

```bash
dao-treasury-analyzer [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/dao-treasury-analyzer.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 17,
  "tracked_daos": ["Uniswap", "Aave", "MakerDAO"],
  "alert_threshold": 100000
}
```

## 功能

- 财库余额监控
- 资金流向分析
- 治理提案追踪
- 健康度评分
- SkillPay 集成

## 许可证
MIT
