# cross-border-tax-calculator

跨境电商税务计算（¥179/月）

## 分类
电商/税务

## 价格
¥179/月

## 安装

```bash
clawhub install cross-border-tax-calculator
```

## 使用

```bash
cross-border-tax-calculator [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/cross-border-tax-calculator.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 17,
  "countries": ["US", "EU", "UK", "JP"],
  "business_type": "B2C"
}
```

## 功能

- 增值税计算
- 关税估算
- 税务合规检查
- 申报提醒
- SkillPay 集成

## 许可证
MIT
