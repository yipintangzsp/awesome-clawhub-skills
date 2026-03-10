#!/usr/bin/env node

const { OpenAI } = require('openai');

class PythonAutomation {
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
    const { libraries = [], async = false } = options;

    const prompt = `Generate a Python automation script for: ${task}

Requirements:
- Use Python 3.9+
- ${libraries.length > 0 ? `Libraries: ${libraries.join(', ')}` : 'Choose appropriate libraries'}
- ${async ? 'Use async/await for I/O operations' : 'Synchronous is fine'}
- Include error handling and logging
- Add type hints
- Include requirements.txt dependencies
- Add usage examples in docstring

Return complete script with all imports and a main() function.`;

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
  const generator = new PythonAutomation();
  const task = process.argv.slice(2).join(' ');
  if (!task) { console.error('Usage: node index.js "task description"'); process.exit(1); }

  generator.execute(task).then(r => {
    console.log('✅ Python script generated!\n');
    console.log(r.script);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = PythonAutomation;
