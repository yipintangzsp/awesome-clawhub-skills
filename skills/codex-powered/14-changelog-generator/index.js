#!/usr/bin/env node

const { OpenAI } = require('openai');
const { execSync } = require('child_process');

class ChangelogGenerator {
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

  async getGitLog(from, to) {
    const range = from && to ? `${from}..${to}` : 'HEAD';
    try {
      return execSync(`git log ${range} --pretty=format:"%h|%s|%b"`, { encoding: 'utf-8' });
    } catch {
      throw new Error('Failed to get git log');
    }
  }

  async generateChangelog(commits, options = {}) {
    const { version = 'Unreleased', date = new Date().toISOString().split('T')[0] } = options;

    const prompt = `Generate a changelog from these Git commits.

Commits (hash|subject|body):
${commits}

Requirements:
- Follow "Keep a Changelog" format
- Group by: Added, Changed, Deprecated, Removed, Fixed, Security
- Include version and date header
- Add links to commits/issues if referenced
- Use markdown formatting
- Be concise but informative

Return complete changelog in Markdown.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 3000
    });

    return completion.choices[0].message.content;
  }

  async execute(options = {}) {
    const { from, to, userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 5);
      if (!payment.verified) throw new Error('Payment required: ¥5/次 or ¥49/月');
    }

    const commits = await this.getGitLog(from, to);
    const changelog = await this.generateChangelog(commits, options);

    return { success: true, changelog, cost: '¥5 (one-time) or ¥49/month' };
  }
}

if (require.main === module) {
  const generator = new ChangelogGenerator();
  const args = process.argv.slice(2);
  const from = args.find((_, i) => args[i-1] === '--from');
  const to = args.find((_, i) => args[i-1] === '--to');

  generator.execute({ from, to }).then(r => {
    console.log('✅ Changelog generated!\n');
    console.log(r.changelog);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = ChangelogGenerator;
