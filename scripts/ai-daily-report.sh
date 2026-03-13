#!/bin/bash
# AI 圈日报生成脚本
# 每天早 8 点执行

RECIPIENT="heil16070@gmail.com"
DATE=$(date +%Y-%m-%d)
SUBJECT="AI 圈日报 - $DATE"

# 生成日报内容（通过 OpenClaw）
CONTENT=$(openclaw ask "
生成一份 AI 圈日报，包含以下内容：
1. 过去 24 小时 AI 圈重要新闻（OpenAI/DeepMind/Anthropic/Meta/DeepSeek/Qwen 等）
2. 大神观点（@karpathy @sama @elonmusk 等）
3. 重要链接汇总

格式要求：
- 简洁明了
- 每条带链接
- 总长度控制在 1000 字以内
")

# 发送邮件
gog send --to "$RECIPIENT" --subject "$SUBJECT" --body "$CONTENT"

echo "日报已发送到 $RECIPIENT"
