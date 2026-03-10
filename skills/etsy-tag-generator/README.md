# Etsy Tag Generator - Etsy 标签生成器

🏷️ 让买家更容易找到你

## Etsy 标签规则

- **最多 13 个标签**
- **每个标签最多 20 字符**
- **可用多词组**（如"silver ring"算 1 个标签）
- **不能重复**标题中已用的单词

## 标签类型策略

| 类型 | 数量 | 示例 |
|------|------|------|
| 宽泛词 | 2-3 | jewelry, ring, gift |
| 长尾词 | 4-5 | sterling silver ring, handmade jewelry |
| 风格 | 2-3 | boho, minimalist, vintage |
| 用途 | 2-3 | engagement ring, birthday gift |
| 材质 | 2-3 | silver, gold plated |

## 热门标签示例

```
珠宝类：
handmade jewelry, silver ring, gift for her, 
sterling silver, boho jewelry, minimalist ring,
engagement ring, birthday gift, anniversary gift,
custom jewelry, personalized ring, women ring, stackable ring
```

## 定价

- **单次使用**: ¥5
- **套餐**: 10 次¥40（省¥10）
- **免费试用**: 前 3 次免费

## 示例

```bash
# 生成标签
/etsy-tag-generator --title "Handmade Silver Ring" --category jewelry

# 优化标签
/etsy-tag-generator --action optimize --tags "ring,silver,handmade"

# 竞品分析
/etsy-tag-generator --action competitor --url "etsy.com/listing/123456"
```

## 最佳实践

✅ 用满 13 个标签
✅ 研究竞品标签
✅ 跟随季节趋势
✅ 定期更新标签
❌ 不要堆砌关键词
❌ 不要用无关标签

---
**SkillPay 收费 Skill** | 版本 1.0.0
