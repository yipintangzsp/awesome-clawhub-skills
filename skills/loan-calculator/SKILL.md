---
name: loan-calculator
description: 贷款计算器，计算月供、总利息、还款计划，支持房贷/车贷/消费贷。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Loan Calculator - 贷款计算器

计算房贷、车贷、消费贷的月供、总利息和还款计划。

## 使用方式

```bash
# 房贷计算
loan-calculator 1000000 4.5 30

# 车贷计算
loan-calculator 200000 3.8 5

# 参数：金额 年利率% 年数
```

## 功能特点

- 🏠 房贷/车贷/消费贷
- 📊 月供/总利息
- 📅 还款计划
- 💰 SkillPay 收费集成（¥1/次）

## 输出内容

| 项目 | 说明 |
|------|------|
| 月供 | 每月还款额 |
| 总还款 | 本金 + 利息 |
| 总利息 | 利息总额 |
| 还款计划 | 分期明细 |

## 配置

在 `~/.openclaw/workspace/config/loan-calculator.json` 配置 SkillPay API Key。
