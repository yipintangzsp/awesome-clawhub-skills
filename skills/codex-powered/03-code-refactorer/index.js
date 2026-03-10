#!/usr/bin/env node

const { OpenAI } = require('openai');
const fs = require('fs');

class CodeRefactorer {
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

  async refactor(code, language = 'python', strategy = 'clean-code') {
    const strategies = {
      'clean-code': 'Apply clean code principles: meaningful names, small functions, single responsibility',
      'design-patterns': 'Identify and apply appropriate design patterns (Factory, Strategy, Observer, etc.)',
      'microservices': 'Restructure for microservices architecture with clear boundaries',
      'functional': 'Convert to functional programming style with immutability',
      'oop': 'Improve object-oriented design with proper encapsulation and inheritance'
    };

    const prompt = `Refactor this ${language} code using ${strategy} approach.
Strategy: ${strategies[strategy] || strategy}

Requirements:
- Preserve all existing functionality
- Improve code structure and readability
- Apply appropriate design patterns
- Add comprehensive comments
- Include refactoring summary

Code to refactor:
${code}

Return: 1) Summary of changes 2) Refactored code`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    return completion.choices[0].message.content;
  }

  async execute(input, options = {}) {
    const { language = 'python', strategy = 'clean-code', userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 19);
      if (!payment.verified) throw new Error('Payment required: ¥19/次 or ¥199/月');
    }

    const code = fs.existsSync(input) ? fs.readFileSync(input, 'utf-8') : input;
    const result = await this.refactor(code, language, strategy);

    return { success: true, result, cost: '¥19 (one-time) or ¥199/month' };
  }
}

if (require.main === module) {
  const refactorer = new CodeRefactorer();
  const input = process.argv.slice(2)[0];
  if (!input) { console.error('Usage: node index.js <file-or-code>'); process.exit(1); }

  refactorer.execute(input).then(r => {
    console.log('✅ Code refactored!\n');
    console.log(r.result);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = CodeRefactorer;
