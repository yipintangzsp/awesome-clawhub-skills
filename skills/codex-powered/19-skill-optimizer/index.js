#!/usr/bin/env node

const { OpenAI } = require('openai');
const fs = require('fs');

class SkillOptimizer {
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

  async optimizeSkill(skillPath, options = {}) {
    const { focus = 'performance' } = options;

    const files = {
      code: fs.readFileSync(`${skillPath}/index.js`, 'utf-8'),
      package: fs.readFileSync(`${skillPath}/package.json`, 'utf-8')
    };

    const prompt = `Optimize this OpenClaw Skill for ${focus}.

Current Code:
${files.code}

package.json:
${files.package}

Requirements:
- Focus: ${focus} (performance/readability/maintainability/size)
- Maintain all existing functionality
- Apply best practices for Node.js
- Optimize SkillPay integration if present
- Reduce dependencies if possible
- Add performance improvements
- Include optimization summary

Return: 1) Summary of optimizations 2) Optimized code`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    return completion.choices[0].message.content;
  }

  async execute(skillPath, options = {}) {
    const { userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 19);
      if (!payment.verified) throw new Error('Payment required: ¥19/次 or ¥199/月');
    }

    const result = await this.optimizeSkill(skillPath, options);
    return { success: true, result, cost: '¥19 (one-time) or ¥199/month' };
  }
}

if (require.main === module) {
  const optimizer = new SkillOptimizer();
  const skillPath = process.argv.slice(2)[0];
  if (!skillPath) { console.error('Usage: node index.js <skill-path>'); process.exit(1); }

  optimizer.execute(skillPath).then(r => {
    console.log('✅ Skill optimized!\n');
    console.log(r.result);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = SkillOptimizer;
