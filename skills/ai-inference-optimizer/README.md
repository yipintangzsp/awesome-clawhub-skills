# AI Inference Optimizer - AI 推理优化

## 概述

优化 AI 模型推理性能，降低延迟，提升吞吐量，减少资源消耗。

## 服务内容包括

- 模型量化（INT8/FP16）
- 算子融合优化
- 批处理策略优化
- 推理引擎选择建议
- 性能基准测试

## 定价

- 月费：¥499/月
- 支持按优化次数定制价格

## 使用方法

```bash
ai-inference-optimizer --model <模型路径> --target <cpu|gpu|edge>
```

## 配置

在 `~/.openclaw/workspace/config/ai-inference-optimizer.json` 中配置：

```json
{
  "skillpay_api_key": "your_api_key",
  "price_per_month": 499
}
```
