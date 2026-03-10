#!/usr/bin/env node

const { OpenAI } = require('openai');
const fs = require('fs');

class CodeTester {
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

  async generateTests(code, language = 'python', framework = 'pytest') {
    const frameworks = {
      python: { pytest: 'pytest', unittest: 'unittest' },
      javascript: { jest: 'Jest', mocha: 'Mocha' },
      java: { junit: 'JUnit', testng: 'TestNG' },
      go: { testing: 'testing package', ginkgo: 'Ginkgo' }
    };

    const prompt = `Generate comprehensive tests for this ${language} code using ${framework}.

Requirements:
- Test all public functions/methods
- Include edge cases and boundary conditions
- Test error handling
- Add mock data where needed
- Aim for 90%+ coverage
- Include both positive and negative test cases

Code to test:
${code}

Return complete test file with imports and setup.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    return completion.choices[0].message.content;
  }

  async execute(input, options = {}) {
    const { language = 'python', framework = 'pytest', userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 12);
      if (!payment.verified) throw new Error('Payment required: ¥12/次 or ¥129/月');
    }

    const code = fs.existsSync(input) ? fs.readFileSync(input, 'utf-8') : input;
    const tests = await this.generateTests(code, language, framework);

    return { success: true, tests, cost: '¥12 (one-time) or ¥129/month' };
  }
}

if (require.main === module) {
  const tester = new CodeTester();
  const input = process.argv.slice(2)[0];
  if (!input) { console.error('Usage: node index.js <file-or-code>'); process.exit(1); }

  tester.execute(input).then(r => {
    console.log('✅ Tests generated!\n');
    console.log(r.tests);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = CodeTester;
