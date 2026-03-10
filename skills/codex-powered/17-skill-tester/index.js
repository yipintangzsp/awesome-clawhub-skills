#!/usr/bin/env node

const { OpenAI } = require('openai');
const fs = require('fs');

class SkillTester {
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

  async generateTests(skillPath, options = {}) {
    const { framework = 'jest', includeIntegration = true } = options;

    const skillCode = fs.readFileSync(skillPath, 'utf-8');
    const skillMd = fs.readFileSync(skillPath.replace('index.js', 'SKILL.md'), 'utf-8');

    const prompt = `Generate comprehensive tests for this OpenClaw Skill.

Skill Code:
${skillCode}

Skill Documentation:
${skillMd}

Requirements:
- Framework: ${framework}
- ${includeIntegration ? 'Include integration tests for SkillPay' : 'Unit tests only'}
- Test all public methods
- Mock external APIs
- Test error handling
- Include edge cases
- Aim for 90%+ coverage

Return complete test file with setup and mocks.`;

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
      const payment = await this.verifyPayment(userId, 15);
      if (!payment.verified) throw new Error('Payment required: ¥15/次 or ¥149/月');
    }

    const tests = await this.generateTests(skillPath, options);
    return { success: true, tests, cost: '¥15 (one-time) or ¥149/month' };
  }
}

if (require.main === module) {
  const tester = new SkillTester();
  const skillPath = process.argv.slice(2)[0];
  if (!skillPath) { console.error('Usage: node index.js <skill-path>'); process.exit(1); }

  tester.execute(skillPath).then(r => {
    console.log('✅ Skill tests generated!\n');
    console.log(r.tests);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = SkillTester;
