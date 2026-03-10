#!/usr/bin/env node

const { OpenAI } = require('openai');
const fs = require('fs');

class BashAutomation {
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
    const { complexity = 'intermediate', includeComments = true } = options;

    const prompt = `Generate a Bash script for: ${task}

Requirements:
- Complexity: ${complexity}
- Include error handling
- Add input validation
- ${includeComments ? 'Include detailed comments' : 'Minimal comments'}
- Follow Bash best practices
- Make it portable across Linux/Mac

Return complete script with shebang and usage examples.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 3000
    });

    return completion.choices[0].message.content;
  }

  async execute(task, options = {}) {
    const { userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 8);
      if (!payment.verified) throw new Error('Payment required: ¥8/次 or ¥79/月');
    }

    const script = await this.generateScript(task, options);
    return { success: true, script, cost: '¥8 (one-time) or ¥79/month' };
  }
}

if (require.main === module) {
  const generator = new BashAutomation();
  const task = process.argv.slice(2).join(' ');
  if (!task) { console.error('Usage: node index.js "task description"'); process.exit(1); }

  generator.execute(task).then(r => {
    console.log('✅ Bash script generated!\n');
    console.log(r.script);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = BashAutomation;
