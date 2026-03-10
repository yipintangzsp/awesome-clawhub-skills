#!/usr/bin/env node

const { OpenAI } = require('openai');

class EmailTemplateGenerator {
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

  async generateTemplate(purpose, options = {}) {
    const { tone = 'professional', language = 'en', length = 'medium' } = options;

    const tones = {
      professional: 'Formal, business-appropriate language',
      friendly: 'Warm, conversational, approachable',
      marketing: 'Persuasive, engaging, call-to-action focused',
      apologetic: 'Sincere, empathetic, solution-oriented',
      urgent: 'Direct, clear, time-sensitive'
    };

    const prompt = `Generate an email template for: ${purpose}

Requirements:
- Tone: ${tones[tone] || tone}
- Language: ${language === 'zh' ? 'Chinese' : 'English'}
- Length: ${length}
- Include subject line options (3 variations)
- Add placeholder variables like [Name], [Company]
- Include clear call-to-action
- Add signature template

Return complete email template with subject lines.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 2000
    });

    return completion.choices[0].message.content;
  }

  async execute(purpose, options = {}) {
    const { userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 4);
      if (!payment.verified) throw new Error('Payment required: ¥4/次 or ¥39/月');
    }

    const template = await this.generateTemplate(purpose, options);
    return { success: true, template, cost: '¥4 (one-time) or ¥39/month' };
  }
}

if (require.main === module) {
  const generator = new EmailTemplateGenerator();
  const purpose = process.argv.slice(2).join(' ');
  if (!purpose) { console.error('Usage: node index.js "email purpose"'); process.exit(1); }

  generator.execute(purpose).then(r => {
    console.log('✅ Email template generated!\n');
    console.log(r.template);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = EmailTemplateGenerator;
