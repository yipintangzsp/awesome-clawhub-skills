---
name: calorie-counter
description: 卡路里计算器，根据身体数据计算 BMR、TDEE 和减脂/增肌建议。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Calorie Counter - 卡路里计算器

根据身体数据计算基础代谢 (BMR)、每日消耗 (TDEE) 和饮食建议。

## 使用方式

```bash
# 参数：体重 kg 身高 cm 年龄 性别 [活动水平]
calorie-counter 70 175 30 male moderate

# 活动水平：sedentary|light|moderate|active|very
```

## 功能特点

- 🔥 BMR/TDEE 计算
- 📊 减脂/增肌建议
- 🏃 活动水平调整
- 💰 SkillPay 收费集成（¥1/次）

## 输出内容

| 项目 | 说明 |
|------|------|
| BMR | 基础代谢率 |
| TDEE | 每日总消耗 |
| 减脂 | 推荐摄入 |
| 增肌 | 推荐摄入 |

## 配置

在 `~/.openclaw/workspace/config/calorie-counter.json` 配置 SkillPay API Key。
