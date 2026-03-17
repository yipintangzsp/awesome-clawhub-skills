# 八爪鱼 RPA Webhook 调用技能

## 触发条件
用户提及：八爪鱼、RPA、bazhuayu、运行机器人、执行采集

## 配置项
在 `config.json` 中设置：
```json
{
  "webhookUrl": "https://api-rpa.bazhuayu.com/api/v1/bots/webhooks/xxx/invoke",
  "signatureKey": "your-signature-key",
  "defaultParams": {}
}
```

## 使用方法
1. 在八爪鱼 RPA 控制台创建 Webhook 触发器
2. 获取 Webhook URL 和签名密钥
3. 配置到 config.json
4. 发送指令："帮我运行小红书数据采集"

## 执行流程
1. 解析用户意图，提取参数
2. 构造 Webhook 请求（带签名验证）
3. 调用八爪鱼 RPA
4. 返回执行结果

## 示例指令
- "帮我采集这 10 个小红书博主的最新数据"
- "运行小红书数据采集的 RPA 应用"
- "执行八爪鱼机器人"
