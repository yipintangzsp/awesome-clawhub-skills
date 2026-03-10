#!/usr/bin/env node

const { OpenAI } = require('openai');
const fs = require('fs');

class APIDocGenerator {
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

  async generateDocs(code, options = {}) {
    const { format = 'markdown', includeExamples = true } = options;

    const prompt = `Generate comprehensive API documentation from this code.

Code:
${code}

Requirements:
- Format: ${format === 'openapi' ? 'OpenAPI 3.0 YAML' : 'Markdown'}
- ${includeExamples ? 'Include request/response examples' : 'Basic documentation'}
- Document all endpoints with methods
- Include parameter descriptions and types
- Add authentication requirements
- Include error codes and responses
- Add rate limiting info if applicable

Return complete documentation ready for publishing.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 4000
    });

    return completion.choices[0].message.content;
  }

  async execute(input, options = {}) {
    const { userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 12);
      if (!payment.verified) throw new Error('Payment required: ¥12/次 or ¥119/月');
    }

    const code = fs.existsSync(input) ? fs.readFileSync(input, 'utf-8') : input;
    const docs = await this.generateDocs(code, options);

    return { success: true, docs, cost: '¥12 (one-time) or ¥119/month' };
  }
}

if (require.main === module) {
  const generator = new APIDocGenerator();
  const input = process.argv.slice(2)[0];
  if (!input) { console.error('Usage: node index.js <file-or-code>'); process.exit(1); }

  generator.execute(input).then(r => {
    console.log('✅ API docs generated!\n');
    console.log(r.docs);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = APIDocGenerator;
