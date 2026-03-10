# AI Security Audit - AI 安全审计

## 概述

提供全面的 AI 系统安全审计服务，识别潜在安全风险并提供修复建议。

## 服务内容包括

- 模型对抗攻击测试
- 数据泄露风险评估
- API 安全审计
- 访问控制检查
- 合规性评估（等保/GDPR）

## 定价

- 月费：¥599/月
- 支持按审计深度定制价格

## 使用方法

```bash
ai-security-audit --system <系统名称> --scope <审计范围>
```

## 配置

在 `~/.openclaw/workspace/config/ai-security-audit.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 599
}
```
