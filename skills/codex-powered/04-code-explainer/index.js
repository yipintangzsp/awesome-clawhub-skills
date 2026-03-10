#!/usr/bin/env node

const { OpenAI } = require('openai');
const fs = require('fs');

class CodeExplainer {
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

  async explain(code, language = 'python', detailLevel = 'intermediate') {
    const levels = {
      beginner: 'Explain like I\'m new to programming, avoid jargon',
      intermediate: 'Explain with technical details, assume basic programming knowledge',
      advanced: 'Deep dive into algorithms, complexity, and implementation details'
    };

    const prompt = `Explain this ${language} code at ${detailLevel} level.
Level guidance: ${levels[detailLevel]}

Include:
- Overall purpose and functionality
- Line-by-line explanation
- Key algorithms and data structures used
- Time and space complexity
- Potential edge cases
- Suggestions for improvement

Code:
${code}

Format with clear sections and code references.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 4000
    });

    return completion.choices[0].message.content;
  }

  async execute(input, options = {}) {
    const { language = 'python', detailLevel = 'intermediate', userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 5);
      if (!payment.verified) throw new Error('Payment required: ¥5/次 or ¥49/月');
    }

    const code = fs.existsSync(input) ? fs.readFileSync(input, 'utf-8') : input;
    const explanation = await this.explain(code, language, detailLevel);

    return { success: true, explanation, cost: '¥5 (one-time) or ¥49/month' };
  }
}

if (require.main === module) {
  const explainer = new CodeExplainer();
  const input = process.argv.slice(2)[0];
  if (!input) { console.error('Usage: node index.js <file-or-code>'); process.exit(1); }

  explainer.execute(input).then(r => {
    console.log('✅ Code explained!\n');
    console.log(r.explanation);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = CodeExplainer;
