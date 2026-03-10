# water-reminder-bot

喝水提醒机器人（¥1/次）

## 分类
每日工具

## 价格
¥1/次

## 安装

```bash
clawhub install water-reminder-bot
```

## 使用

```bash
water-reminder-bot [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/water-reminder-bot.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 1
}
```

## 功能

- 自动收费验证
- SkillPay 集成
- 错误处理
- 详细日志

## 许可证
MIT
