# ai-hr-recruiter

AI 招聘官（¥179/月）

## 分类
AI/HR

## 价格
¥179/月

## 安装

```bash
clawhub install ai-hr-recruiter
```

## 使用

```bash
ai-hr-recruiter [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/ai-hr-recruiter.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 17,
  "job_requirements": "path/to/requirements",
  "screening_criteria": ["experience", "skills", "education"]
}
```

## 功能

- 简历智能筛选
- 候选人匹配评分
- 面试问题生成
- 招聘流程管理
- SkillPay 集成

## 许可证
MIT
