---
name: uuid-generator
description: UUID 生成器，生成符合 RFC 4122 标准的唯一标识符。
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# UUID Generator - UUID 生成器

生成符合 RFC 4122 标准的唯一标识符，支持批量生成。

## 使用方式

```bash
# 生成 1 个 UUID
uuid-generator

# 生成 5 个 UUID
uuid-generator 5

# 生成 10 个 UUID
uuid-generator 10
```

## 功能特点

- 🆔 标准 UUID v4
- 🔢 批量生成
- ⚡ 即时生成
- 💰 SkillPay 收费集成（¥0.5/次）

## 示例输出

```
1. 550e8400-e29b-41d4-a716-446655440000
2. 6ba7b810-9dad-11d1-80b4-00c04fd430c8
3. 6ba7b811-9dad-11d1-80b4-00c04fd430c8
```

## 配置

在 `~/.openclaw/workspace/config/uuid-generator.json` 配置 SkillPay API Key。
