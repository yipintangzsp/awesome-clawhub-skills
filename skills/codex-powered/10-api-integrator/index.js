#!/usr/bin/env node

const { OpenAI } = require('openai');

class APIIntegrator {
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

  async generateIntegration(apis, task, options = {}) {
    const { language = 'javascript', auth = 'api-key' } = options;

    const prompt = `Generate API integration code for:
APIs: ${apis}
Task: ${task}

Requirements:
- Language: ${language}
- Authentication: ${auth}
- Include rate limiting
- Add comprehensive error handling
- Implement retry logic with exponential backoff
- Add request/response logging
- Include environment variable setup
- Add TypeScript types if applicable

Return complete integration module with usage examples.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    return completion.choices[0].message.content;
  }

  async execute(apis, task, options = {}) {
    const { userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 15);
      if (!payment.verified) throw new Error('Payment required: ¥15/次 or ¥149/月');
    }

    const code = await this.generateIntegration(apis, task, options);
    return { success: true, code, cost: '¥15 (one-time) or ¥149/month' };
  }
}

if (require.main === module) {
  const integrator = new APIIntegrator();
  const args = process.argv.slice(2);
  if (args.length < 2) { console.error('Usage: node index.js "apis" "task"'); process.exit(1); }

  integrator.execute(args[0], args[1]).then(r => {
    console.log('✅ API integration generated!\n');
    console.log(r.code);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = APIIntegrator;
