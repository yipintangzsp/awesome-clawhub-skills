#!/usr/bin/env node

const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

class ReadmeGenerator {
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

  async analyzeProject(projectPath) {
    const files = [];
    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) walk(fullPath);
        else if (entry.isFile() && /\.(js|ts|py|go|rs|md|json|yaml|yml)$/.test(entry.name)) {
          files.push({ path: fullPath, name: entry.name });
        }
      }
    };
    walk(projectPath);
    return files.slice(0, 20);
  }

  async generateReadme(projectPath, options = {}) {
    const { language = 'en', sections = ['intro', 'install', 'usage', 'api', 'contributing'] } = options;
    
    const files = await this.analyzeProject(projectPath);
    const fileTree = files.map(f => f.path.replace(projectPath, '.')).join('\n');

    const prompt = `Generate a professional README.md for this project.

Project structure:
${fileTree}

Requirements:
- Language: ${language === 'zh' ? 'Chinese' : 'English'}
- Sections: ${sections.join(', ')}
- Include badges for build status, version, license
- Add installation instructions
- Include usage examples with code blocks
- Add API documentation if applicable
- Include contributing guidelines
- Add license section

Return complete Markdown content.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    return completion.choices[0].message.content;
  }

  async execute(projectPath, options = {}) {
    const { userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 6);
      if (!payment.verified) throw new Error('Payment required: ¥6/次 or ¥59/月');
    }

    const readme = await this.generateReadme(projectPath, options);
    return { success: true, readme, cost: '¥6 (one-time) or ¥59/month' };
  }
}

if (require.main === module) {
  const generator = new ReadmeGenerator();
  const projectPath = process.argv.slice(2)[0] || '.';

  generator.execute(projectPath).then(r => {
    console.log('✅ README generated!\n');
    console.log(r.readme);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = ReadmeGenerator;
