# ai-legal-assistant

AI 法律助手（¥249/月）

## 分类
AI/法律

## 价格
¥249/月

## 安装

```bash
clawhub install ai-legal-assistant
```

## 使用

```bash
ai-legal-assistant [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/ai-legal-assistant.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 24,
  "jurisdiction": "CN",
  "practice_areas": ["合同", "知识产权", "劳动法"]
}
```

## 功能

- 法律文档分析
- 合同风险审查
- 法规查询
- 法律建议生成
- SkillPay 集成

## 许可证
MIT
