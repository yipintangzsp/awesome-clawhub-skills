# Cross-Border Logistics Calculator - 跨境物流计算器

## Description
跨境物流费用计算工具，支持多种物流方式（邮政、专线、快递）的运费和关税估算。帮助卖家精准计算物流成本，优化定价策略。

## Usage
```bash
# 计算运费
/cross-border-logistics-calculator --weight 0.5 --from "CN" --to "US" --method "express"

# 计算关税
/cross-border-logistics-calculator --action "duty" --value 100 --category "electronics" --to "US"

# 对比物流方式
/cross-border-logistics-calculator --action "compare" --weight 1.0 --from "CN" --to "UK"
```

### 参数说明
- `--weight`: 包裹重量 (kg)
- `--from`: 发货国家代码 (CN, US, UK 等)
- `--to`: 目的国家代码
- `--method`: 物流方式 (postal, line, express, sea, air)
- `--value`: 申报价值 (USD)
- `--category`: 产品类别
- `--action`: 操作类型 (shipping, duty, compare)

## Pricing
- **价格**: ¥5/次
- **计费方式**: 按次收费
- **免费试用**: 前 3 次免费

## Features
- ✅ 多物流商比价
- ✅ 关税估算
- ✅ 时效预估
- ✅ 体积重计算
- ✅ 隐藏费用提示
- ✅ 最优方案推荐
