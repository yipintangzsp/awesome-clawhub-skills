# AI Performance Monitor - AI 性能监控

## 概述

实时监控 AI 系统性能指标，及时发现并解决性能问题。

## 服务内容包括

- 响应时间监控
- 吞吐量统计
- 错误率追踪
- 资源使用监控
- 自定义告警规则

## 定价

- 月费：¥399/月
- 支持按监控节点数定制价格

## 使用方法

```bash
ai-performance-monitor --endpoint <API 端点> --metrics <监控指标>
```

## 配置

在 `~/.openclaw/workspace/config/ai-performance-monitor.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 399
}
```
