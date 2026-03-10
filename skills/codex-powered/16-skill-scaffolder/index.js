#!/usr/bin/env node

const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

class SkillScaffolder {
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

  async generateSkillStructure(name, options = {}) {
    const { type = 'cli', price = 9, language = 'javascript' } = options;

    const prompt = `Create a complete OpenClaw Skill structure for: ${name}

Requirements:
- Type: ${type} (cli/api/chatbot)
- Language: ${language}
- Price: ¥${price}/次
- Include SkillPay integration
- Follow OpenClaw skill conventions

Generate these files:
1. SKILL.md - Skill documentation
2. index.js - Main implementation
3. package.json - Dependencies

Return each file with clear separators.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    return completion.choices[0].message.content;
  }

  async execute(name, options = {}) {
    const { outputDir, userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 19);
      if (!payment.verified) throw new Error('Payment required: ¥19/次 or ¥199/月');
    }

    const structure = await this.generateSkillStructure(name, options);
    
    if (outputDir) {
      const skillDir = path.join(outputDir, name.toLowerCase().replace(/\s+/g, '-'));
      fs.mkdirSync(skillDir, { recursive: true });
      
      const files = structure.split('---').filter(f => f.trim());
      for (const file of files) {
        const match = file.match(/###?\s*(\S+)\s*\n([\s\S]*)/);
        if (match) {
          const [, filename, content] = match;
          fs.writeFileSync(path.join(skillDir, filename), content.trim());
        }
      }
    }

    return { success: true, structure, cost: '¥19 (one-time) or ¥199/month' };
  }
}

if (require.main === module) {
  const scaffolder = new SkillScaffolder();
  const name = process.argv[2];
  const outputDir = process.argv.find((_, i) => process.argv[i-1] === '--output') || './skills';

  if (!name) { console.error('Usage: node index.js "skill name" [--output dir]'); process.exit(1); }

  scaffolder.execute(name, { outputDir }).then(r => {
    console.log('✅ Skill scaffolded!\n');
    console.log(r.structure);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = SkillScaffolder;
