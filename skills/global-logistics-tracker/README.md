# global-logistics-tracker

全球物流追踪（¥99/月）

## 分类
电商/物流

## 价格
¥99/月

## 安装

```bash
clawhub install global-logistics-tracker
```

## 使用

```bash
global-logistics-tracker [选项]
```

## 配置

1. 创建配置文件 `~/.openclaw/workspace/config/global-logistics-tracker.json`
2. 添加 SkillPay API Key:
```json
{
  "skillpay_api_key": "your_api_key_here",
  "price_per_call": 9,
  "carriers": ["DHL", "FedEx", "UPS", "USPS"],
  "notification_enabled": true
}
```

## 功能

- 全球物流追踪
- 实时状态更新
- 延误预警
- 签收通知
- SkillPay 集成

## 许可证
MIT
