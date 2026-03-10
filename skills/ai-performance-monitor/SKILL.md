---
name: ai-performance-monitor
description: AI 性能监控服务 | 实时监控 | 异常告警 | 性能分析 | 系统稳定性神器
tags: [性能监控，AI 运维，实时监控，异常告警，系统稳定性，APM，可观测性]
metadata: {"openclaw":{"requires":{"bins":["node"]},"install":[{"id":"node","kind":"node","package":"node-fetch","label":"Install node-fetch"}]}}
---

# ai-performance-monitor - AI 智能性能监控系统

**痛点**：AI 服务性能波动难发现，故障响应慢，瓶颈定位难，用户体验受影响
**价值**：7×24 实时监控 AI 系统，秒级告警，故障定位效率提升 10 倍

## 用户评价
> "凌晨 3 点模型延迟突增，系统自动告警并定位到 GPU 过载，10 分钟就解决了！" - @运维工程师  
> "性能趋势分析太有用了，提前发现容量瓶颈，避免了多次潜在故障" - @SRE 主管  
> "比某 APM 便宜太多，专为 AI 系统设计，指标更贴合业务" - @技术总监

## 使用方式

```bash
# 基础用法
ai-performance-monitor --endpoint <API 端点> --metrics <监控指标>

# 高级用法
ai-performance-monitor --endpoint https://api.example.com --metrics latency,throughput,error --alert slack
```

## 功能特点

- ⚡ **实时性能监控** - 延迟/吞吐量/错误率/资源利用率，多维度实时监控
- 📈 **智能指标可视化** - 自动识别关键指标，生成直观图表和趋势分析
- 🔔 **异常自动告警** - AI 检测异常模式，短信/邮件/钉钉多通道告警
- 📋 **性能报告生成** - 日报/周报/月报自动发送，性能趋势一目了然
- 🔍 **根因分析定位** - 故障自动分析根因，给出修复建议

## 适用场景

- 🤖 **AI 服务监控** - LLM/CV/NLP 等 AI 服务性能实时监控
- ☁️ **云服务监控** - API 网关/微服务/容器性能监控
- 📱 **应用性能** - Web/App 端到端性能监控
- 🏢 **企业运维** - IT 系统统一监控平台

## 定价策略

| 套餐 | 价格 | 适合人群 |
|------|------|----------|
| 体验版 | ¥99/次 | 单次监控 |
| 月卡 | ¥399/月 | 中小企业 |
| 年卡 | ¥3,599/年 | 长期用户（省 25%） |
| 企业版 | ¥1,599/月 | 大型集团/ unlimited |

## 配置

在 `~/.openclaw/workspace/config/ai-performance-monitor.json` 配置 SkillPay API Key。

## 热门标签

#性能监控 #AI 运维 #实时监控 #异常告警 #系统稳定性 #APM #可观测性 #SRE #故障定位 #AI 工具
