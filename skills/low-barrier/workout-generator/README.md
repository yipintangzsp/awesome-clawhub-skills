# workout-generator

健身计划生成（¥3/次）

## 分类
每日工具

## 价格
¥3/次

## 安装

```bash
clawhub install workout-generator
```

## 使用

```bash
workout-generator [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/workout-generator.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 3
}
```

## 功能

- 自动收费验证
- SkillPay 集成
- 错误处理
- 详细日志

## 许可证
MIT
