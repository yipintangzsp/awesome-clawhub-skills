---
name: email-validator
description: 邮箱验证工具，检查邮箱格式、域名有效性，识别临时邮箱。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# Email Validator - 邮箱验证工具

验证邮箱地址的有效性，检查格式、域名和临时邮箱。

## 使用方式

```bash
# 验证邮箱
email-validator "test@gmail.com"

# 批量验证（如支持）
email-validator "a@test.com,b@test.com" --batch
```

## 功能特点

- ✉️ 格式验证
- 🌐 域名检查
- ⚠️ 临时邮箱识别
- 💰 SkillPay 收费集成（¥0.5/次）

## 验证项目

| 项目 | 说明 |
|------|------|
| 格式 | 是否符合标准 |
| 域名 | 是否存在 |
| 服务商 | 主流/自定义 |
| 临时邮箱 | 是否 disposable |

## 配置

在 `~/.openclaw/workspace/config/email-validator.json` 配置 SkillPay API Key。
