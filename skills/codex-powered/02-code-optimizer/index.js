#!/usr/bin/env node

/**
 * Code Optimizer - Codex-Powered Skill
 * Analyzes and optimizes existing code for performance and best practices
 */

const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

class CodeOptimizer {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.CODEX_API_KEY || process.env.OPENAI_API_KEY
    });
    this.skillpayKey = process.env.SKILLPAY_API_KEY;
  }

  async verifyPayment(userId, amount) {
    const response = await fetch('https://api.skillpay.com/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.skillpayKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ user_id: userId, amount })
    });
    return response.json();
  }

  async analyzeCode(code, language = 'python') {
    const prompt = `Analyze this ${language} code for:
1. Performance bottlenecks
2. Code smells and anti-patterns
3. Memory inefficiencies
4. Better algorithms or data structures
5. Security vulnerabilities
6. Maintainability issues

Code:
${code}

Provide detailed analysis with specific line references.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 3000
    });

    return completion.choices[0].message.content;
  }

  async optimizeCode(code, language = 'python', focus = 'performance') {
    const prompt = `Optimize this ${language} code for ${focus}.
Requirements:
- Maintain exact same functionality
- Improve performance/memory usage
- Follow language-specific best practices
- Add comments explaining optimizations
- Include before/after complexity analysis

Original code:
${code}

Return ONLY the optimized code with brief explanation header.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 4000
    });

    return completion.choices[0].message.content;
  }

  async execute(input, options = {}) {
    const { language = 'python', focus = 'performance', userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 15);
      if (!payment.verified) {
        throw new Error('Payment required: ¥15/次 or ¥149/月 subscription');
      }
    }

    let code;
    if (fs.existsSync(input)) {
      code = fs.readFileSync(input, 'utf-8');
    } else {
      code = input;
    }

    const analysis = await this.analyzeCode(code, language);
    const optimized = await this.optimizeCode(code, language, focus);

    return {
      success: true,
      original: code,
      optimized,
      analysis,
      cost: '¥15 (one-time) or ¥149/month'
    };
  }
}

// CLI interface
if (require.main === module) {
  const optimizer = new CodeOptimizer();
  const args = process.argv.slice(2);
  const input = args[0];
  
  if (!input) {
    console.error('Usage: node index.js <file-or-code>');
    process.exit(1);
  }

  optimizer.execute(input)
    .then(result => {
      console.log('✅ Code optimized successfully!');
      console.log('\n--- Analysis ---\n');
      console.log(result.analysis);
      console.log('\n--- Optimized Code ---\n');
      console.log(result.optimized);
      console.log(`\n💰 Cost: ${result.cost}`);
    })
    .catch(err => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = CodeOptimizer;
