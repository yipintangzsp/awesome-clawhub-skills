# enterprise-ai-assistant

企业 AI 助手（¥299/月）

## 分类
AI/企业级

## 价格
¥299/月

## 安装

```bash
clawhub install enterprise-ai-assistant
```

## 使用

```bash
enterprise-ai-assistant [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/enterprise-ai-assistant.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 29,
  "features": ["文档处理", "数据分析", "会议助手", "客服支持"],
  "user_limit": 50
}
```

## 功能

- 智能文档处理
- 数据分析报告
- 会议纪要生成
- 多轮对话支持
- SkillPay 集成

## 许可证
MIT
