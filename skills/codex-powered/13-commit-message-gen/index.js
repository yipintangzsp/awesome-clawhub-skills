#!/usr/bin/env node

const { OpenAI } = require('openai');
const { execSync } = require('child_process');

class CommitMessageGenerator {
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

  async getGitDiff() {
    try {
      return execSync('git diff --cached', { encoding: 'utf-8' });
    } catch {
      throw new Error('Not a git repository or no staged changes');
    }
  }

  async generateMessage(diff, options = {}) {
    const { language = 'en', conventional = true } = options;

    const prompt = `Generate a Git commit message for these changes.

Diff:
${diff}

Requirements:
- Language: ${language === 'zh' ? 'Chinese' : 'English'}
- ${conventional ? 'Follow Conventional Commits spec (feat/fix/docs/style/refactor/test/chore)' : 'Standard commit message'}
- Keep subject line under 50 characters
- Add detailed body if changes are complex
- Reference issues if applicable
- Be specific about what changed

Return only the commit message.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 500
    });

    return completion.choices[0].message.content.trim();
  }

  async execute(diffInput, options = {}) {
    const { userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 3);
      if (!payment.verified) throw new Error('Payment required: ¥3/次 or ¥29/月');
    }

    const diff = diffInput || await this.getGitDiff();
    const message = await this.generateMessage(diff, options);

    return { success: true, message, diff, cost: '¥3 (one-time) or ¥29/month' };
  }
}

if (require.main === module) {
  const generator = new CommitMessageGenerator();
  const input = process.argv.slice(2)[0];

  generator.execute(input).then(r => {
    console.log('✅ Commit message generated!\n');
    console.log(r.message);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = CommitMessageGenerator;
