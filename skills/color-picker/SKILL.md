---
name: color-picker
description: 配色方案生成器，为设计项目生成协调的颜色搭配。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Color Picker - 配色方案生成器

为设计项目生成协调的颜色搭配方案，支持多种配色模式。

## 使用方式

```bash
# 互补色
color-picker "#3498db" complementary

# 类似色
color-picker "#e74c3c" analogous

# 三色搭配
color-picker "#2ecc71" triadic

# 单色渐变
color-picker "#9b59b6" monochromatic
```

## 功能特点

- 🎨 多种配色方案
- 🌈 协调颜色推荐
- 📱 设计友好
- 💰 SkillPay 收费集成（¥1/次）

## 支持方案

| 方案 | 说明 |
|------|------|
| complementary | 互补色（对比强） |
| analogous | 类似色（和谐） |
| triadic | 三色搭配（丰富） |
| monochromatic | 单色渐变（简约） |

## 配置

在 `~/.openclaw/workspace/config/color-picker.json` 配置 SkillPay API Key。
