# alibaba-sourcing-agent

阿里巴巴采购代理（¥129/月）

## 分类
电商/采购管理

## 价格
¥129/月

## 安装

```bash
clawhub install alibaba-sourcing-agent
```

## 使用

```bash
alibaba-sourcing-agent [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/alibaba-sourcing-agent.json`
2. 添加配置:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 129,
  "product_category": "electronics",
  "min_order_quantity": 100,
  "target_price_range": [10, 50]
}
```

## 功能

- 智能供应商筛选匹配
- 自动询价与沟通
- 供应商信用评分
- 交易风险评估
- 采购成本优化建议
- MOQ 谈判策略
- 物流方案推荐

## 许可证
MIT
