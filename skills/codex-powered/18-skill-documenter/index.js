#!/usr/bin/env node

const { OpenAI } = require('openai');
const fs = require('fs');

class SkillDocumenter {
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

  async generateDocumentation(skillPath, options = {}) {
    const { language = 'en', format = 'markdown' } = options;

    const files = {
      code: fs.readFileSync(`${skillPath}/index.js`, 'utf-8'),
      skill: fs.readFileSync(`${skillPath}/SKILL.md`, 'utf-8'),
      package: fs.readFileSync(`${skillPath}/package.json`, 'utf-8')
    };

    const prompt = `Generate comprehensive documentation for this OpenClaw Skill.

Skill Code:
${files.code}

SKILL.md:
${files.skill}

package.json:
${files.package}

Requirements:
- Language: ${language === 'zh' ? 'Chinese' : 'English'}
- Format: ${format}
- Include:
  - Overview and features
  - Installation instructions
  - Configuration options
  - Usage examples with code
  - API reference
  - Troubleshooting guide
  - FAQ section

Return complete documentation.`;

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
      const payment = await this.verifyPayment(userId, 10);
      if (!payment.verified) throw new Error('Payment required: ¥10/次 or ¥99/月');
    }

    const docs = await this.generateDocumentation(skillPath, options);
    return { success: true, docs, cost: '¥10 (one-time) or ¥99/month' };
  }
}

if (require.main === module) {
  const documenter = new SkillDocumenter();
  const skillPath = process.argv.slice(2)[0];
  if (!skillPath) { console.error('Usage: node index.js <skill-path>'); process.exit(1); }

  documenter.execute(skillPath).then(r => {
    console.log('✅ Documentation generated!\n');
    console.log(r.docs);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = SkillDocumenter;
