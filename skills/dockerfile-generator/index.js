#!/usr/bin/env node
/** Dockerfile Generator - Dockerfile 生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/dockerfile-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'dockerfile-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateDockerfile(language, port) {
  const templates = {
    node: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE ${port}
USER node
CMD ["node", "index.js"]`,
    python: `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE ${port}
CMD ["python", "app.py"]`,
    go: `FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o main .
FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/main .
EXPOSE ${port}
CMD ["./main"]`,
    java: `FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE ${port}
ENTRYPOINT ["java","-jar","app.jar"]`
  };
  const dockerfile = templates[language] || templates.node;
  const tips = ['使用多阶段构建减小镜像体积', '定期更新基础镜像', '使用 .dockerignore 排除不必要文件'];
  return { dockerfile, language, port, tips };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const language = args.find(a => a.startsWith('--language='))?.split('=')[1] || 'node';
  const port = args.find(a => a.startsWith('--port='))?.split('=')[1] || '3000';
  const price = config.price_per_call || 19, userId = process.env.USER || 'unknown';
  console.log(`🐳 Dockerfile Generator\n📦 语言：${language}\n🔌 端口：${port}\n💰 费用：¥${price}\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🐳 正在生成 Dockerfile...\n');
  const result = generateDockerfile(language, port);
  console.log(`━━━ Dockerfile ━━━\n${result.dockerfile}`);
  console.log(`\n━━━ 优化建议 ━━━`);
  result.tips.forEach(tip => console.log(`• ${tip}`));
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
