# alibaba-quality-inspector

阿里巴巴质检员（¥149/月）

## 分类
电商/采购

## 价格
¥149/月

## 安装

```bash
clawhub install alibaba-quality-inspector
```

## 使用

```bash
alibaba-quality-inspector [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/alibaba-quality-inspector.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 14,
  "inspection_criteria": ["quality", "delivery", "communication"],
  "product_category": "Electronics"
}
```

## 功能

- 供应商资质审核
- 质量风险评估
- 历史交易分析
- 验货建议
- SkillPay 集成

## 许可证
MIT
