#!/usr/bin/env node

/**
 * Code Generator - Codex-Powered Skill
 * Generates production-ready code from natural language descriptions
 */

const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

class CodeGenerator {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.CODEX_API_KEY || process.env.OPENAI_API_KEY
    });
    this.skillpayKey = process.env.SKILLPAY_API_KEY;
  }

  async verifyPayment(userId, amount) {
    // SkillPay payment verification
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

  async generateCode(prompt, language = 'python', options = {}) {
    const systemPrompt = `You are an expert ${language.toUpperCase()} developer.
Generate production-ready, well-documented code.
Include:
- Complete implementation with error handling
- Type hints/annotations where applicable
- Docstrings/comments explaining logic
- Example usage
- Edge case handling

Language: ${language}
Style: Clean, maintainable, following best practices`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4000
    });

    return {
      code: completion.choices[0].message.content,
      language,
      timestamp: new Date().toISOString()
    };
  }

  async saveCode(code, filename, outputDir = './output') {
    const fullPath = path.join(process.cwd(), outputDir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    const filePath = path.join(fullPath, filename);
    fs.writeFileSync(filePath, code);
    return filePath;
  }

  async execute(description, options = {}) {
    const { language = 'python', output = 'output', userId } = options;
    
    // Verify payment
    if (userId) {
      const payment = await this.verifyPayment(userId, 9);
      if (!payment.verified) {
        throw new Error('Payment required: ¥9/次 or ¥99/月 subscription');
      }
    }

    const result = await this.generateCode(description, language);
    const ext = this.getFileExtension(language);
    const filename = `generated_${Date.now()}${ext}`;
    const filePath = await this.saveCode(result.code, filename, output);

    return {
      success: true,
      code: result.code,
      filePath,
      language,
      cost: '¥9 (one-time) or ¥99/month'
    };
  }

  getFileExtension(language) {
    const extensions = {
      python: '.py',
      javascript: '.js',
      typescript: '.ts',
      go: '.go',
      rust: '.rs',
      java: '.java',
      cpp: '.cpp'
    };
    return extensions[language.toLowerCase()] || '.txt';
  }
}

// CLI interface
if (require.main === module) {
  const generator = new CodeGenerator();
  const args = process.argv.slice(2);
  const description = args.join(' ');
  
  if (!description) {
    console.error('Usage: node index.js "description of code to generate"');
    process.exit(1);
  }

  generator.execute(description)
    .then(result => {
      console.log('✅ Code generated successfully!');
      console.log(`📁 Saved to: ${result.filePath}`);
      console.log(`💰 Cost: ${result.cost}`);
      console.log('\n--- Generated Code ---\n');
      console.log(result.code);
    })
    .catch(err => {
      console.error('❌ Error:', err.message);
      process.exit(1);
    });
}

module.exports = CodeGenerator;
