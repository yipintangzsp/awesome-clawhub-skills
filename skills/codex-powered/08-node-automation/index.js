#!/usr/bin/env node

const { OpenAI } = require('openai');

class NodeAutomation {
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

  async generateScript(task, options = {}) {
    const { esModules = true, cli = false } = options;

    const prompt = `Generate a Node.js automation script for: ${task}

Requirements:
- Node.js 18+
- ${esModules ? 'Use ES modules (import/export)' : 'Use CommonJS (require/module.exports)'}
- ${cli ? 'Make it a CLI tool with commander/args parsing' : 'Standard script'}
- Include error handling
- Add JSDoc comments
- Include package.json with dependencies
- Add usage examples

Return complete code with all files needed.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    return completion.choices[0].message.content;
  }

  async execute(task, options = {}) {
    const { userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 10);
      if (!payment.verified) throw new Error('Payment required: ¥10/次 or ¥99/月');
    }

    const script = await this.generateScript(task, options);
    return { success: true, script, cost: '¥10 (one-time) or ¥99/month' };
  }
}

if (require.main === module) {
  const generator = new NodeAutomation();
  const task = process.argv.slice(2).join(' ');
  if (!task) { console.error('Usage: node index.js "task description"'); process.exit(1); }

  generator.execute(task).then(r => {
    console.log('✅ Node.js script generated!\n');
    console.log(r.script);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = NodeAutomation;
