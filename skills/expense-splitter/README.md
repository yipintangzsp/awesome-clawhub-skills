# expense-splitter

费用分摊器（¥2/次）

## 分类
生活便利

## 价格
¥2/次

## 安装

```bash
clawhub install expense-splitter
```

## 使用

```bash
expense-splitter [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/expense-splitter.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 2
}
```

## 功能

- 自动收费验证
- SkillPay 集成
- 错误处理
- 详细日志

## 许可证
MIT
