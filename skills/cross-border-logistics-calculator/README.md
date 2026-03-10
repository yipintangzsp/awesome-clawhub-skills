# Cross-Border Logistics Calculator - 跨境物流计算器

📦 精准计算，成本可控

## 物流方式对比

| 方式 | 时效 | 价格 | 适用 |
|------|------|------|------|
| 邮政小包 | 7-20 天 | $ | <2kg 小件 |
| 专线 | 5-12 天 | $$ | 2-10kg |
| 快递 | 3-7 天 | $$$$ | 急件/高值 |
| 海运 | 25-40 天 | $ | 大宗货物 |
| 空运 | 7-15 天 | $$$ | 中等批量 |

## 体积重计算

```
体积重 (kg) = 长 (cm) × 宽 (cm) × 高 (cm) ÷ 5000
计费重 = max(实际重，体积重)
```

## 关税计算

```
关税 = CIF 价值 × 关税税率
CIF = 货值 + 运费 + 保险

美国：$800 以下免税
欧盟：€150 以下免 VAT（新规则已变）
英国：£135 以下简化征收
```

## 定价

- **单次计算**: ¥5
- **套餐**: 20 次¥80（省¥20）
- **免费试用**: 前 3 次免费

## 示例

```bash
# 计算运费
/cross-border-logistics-calculator --weight 0.5 --from CN --to US --method express

# 计算关税
/cross-border-logistics-calculator --action duty --value 100 --category electronics --to US

# 对比方案
/cross-border-logistics-calculator --action compare --weight 1.0 --from CN --to UK
```

## 隐藏费用提醒

⚠️ 注意：
- 燃油附加费 (5-15%)
- 偏远地区附加费
- 超长/超重附加费
- 清关手续费
- 旺季附加费

---
**SkillPay 收费 Skill** | 版本 1.0.0
