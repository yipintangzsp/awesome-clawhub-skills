#!/usr/bin/env node

const { OpenAI } = require('openai');

class CronScheduler {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.CODEX_API_KEY || process.env.OPENAI_API_KEY });
    this.skillpayKey = process.env.SKILLPAY_API_KEY;
  }

  async verifyPayment(userId, amount) {
    const response = await fetch('https://api.skillpay.com/verify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.skillpayKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, amount })
    });
    return response.json();
  }

  async generateCronTask(schedule, task, options = {}) {
    const { language = 'bash', nodeCron = false } = options;

    const prompt = `Generate a cron scheduled task for:
Schedule: ${schedule}
Task: ${task}

Requirements:
- Language: ${language}
- ${nodeCron ? 'Use node-cron library for Node.js' : 'Standard cron + script'}
- Include logging
- Add error handling and retry logic
- Include setup instructions
- Add monitoring/health check

Return: 1) Cron expression explanation 2) Complete script 3) Installation instructions`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 3000
    });

    return completion.choices[0].message.content;
  }

  async execute(schedule, task, options = {}) {
    const { userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 8);
      if (!payment.verified) throw new Error('Payment required: ¥8/次 or ¥79/月');
    }

    const result = await this.generateCronTask(schedule, task, options);
    return { success: true, result, cost: '¥8 (one-time) or ¥79/month' };
  }
}

if (require.main === module) {
  const scheduler = new CronScheduler();
  const args = process.argv.slice(2);
  if (args.length < 2) { console.error('Usage: node index.js "schedule" "task"'); process.exit(1); }

  scheduler.execute(args[0], args[1]).then(r => {
    console.log('✅ Cron task generated!\n');
    console.log(r.result);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = CronScheduler;
