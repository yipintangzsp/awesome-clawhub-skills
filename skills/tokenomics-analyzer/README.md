# tokenomics-analyzer

代币经济分析（¥199/月）

## 分类
Web3/代币经济

## 价格
¥199/月

## 安装

```bash
clawhub install tokenomics-analyzer
```

## 使用

```bash
tokenomics-analyzer [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/tokenomics-analyzer.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 19,
  "tracked_tokens": ["ETH", "SOL", "AVAX"],
  "analysis_depth": "comprehensive"
}
```

## 功能

- 代币分配分析
- 释放时间表
- 通胀模型评估
- 持有者分布
- SkillPay 集成

## 许可证
MIT
