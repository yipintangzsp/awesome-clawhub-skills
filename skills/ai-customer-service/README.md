# ai-customer-service

AI 客服（¥199/月）

## 分类
AI/客服

## 价格
¥199/月

## 安装

```bash
clawhub install ai-customer-service
```

## 使用

```bash
ai-customer-service [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/ai-customer-service.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 19,
  "knowledge_base": "path/to/kb",
  "response_language": "zh-CN",
  "escalation_rules": "complex"
}
```

## 功能

- 智能问答
- 问题自动分类
- 多轮对话
- 人工转接
- SkillPay 集成

## 许可证
MIT
