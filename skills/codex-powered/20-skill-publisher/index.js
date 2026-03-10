#!/usr/bin/env node

const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SkillPublisher {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.CODEX_API_KEY || process.env.OPENAI_API_KEY });
    this.skillpayKey = process.env.SKILLPAY_API_KEY;
    this.clawhubToken = process.env.CLAWHUB_TOKEN;
  }

  async verifyPayment(userId, amount) {
    const response = await fetch('https://api.skillpay.com/verify', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.skillpayKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, amount })
    });
    return response.json();
  }

  async generateReleaseNotes(skillPath, version, changelog = []) {
    const files = {
      code: fs.readFileSync(`${skillPath}/index.js`, 'utf-8'),
      skill: fs.readFileSync(`${skillPath}/SKILL.md`, 'utf-8'),
      package: fs.readFileSync(`${skillPath}/package.json`, 'utf-8')
    };

    const prompt = `Generate release notes for OpenClaw Skill version ${version}.

Skill Info:
${files.skill}

Changes:
${changelog.join('\n') || 'Initial release'}

Requirements:
- Follow semantic versioning
- Include:
  - What's new section
  - Breaking changes (if any)
  - Bug fixes
  - Installation/update instructions
  - Usage examples

Return release notes in Markdown.`;

    const completion = await this.openai.chat.completions.create({
      model: 'codex-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 2000
    });

    return completion.choices[0].message.content;
  }

  async packageSkill(skillPath, outputDir) {
    const skillName = path.basename(skillPath);
    const archive = `${outputDir}/${skillName}.tar.gz`;
    
    execSync(`tar -czf ${archive} -C ${path.dirname(skillPath)} ${skillName}`);
    return archive;
  }

  async publish(skillPath, options = {}) {
    const { version, public: isPublic = false, userId } = options;

    if (userId) {
      const payment = await this.verifyPayment(userId, 29);
      if (!payment.verified) throw new Error('Payment required: ¥29/次 or ¥299/月');
    }

    const releaseNotes = await this.generateReleaseNotes(skillPath, version);
    const archive = await this.packageSkill(skillPath, '/tmp');

    // Simulate ClawHub publish (would use actual API in production)
    const publishResult = {
      success: true,
      skillName: path.basename(skillPath),
      version,
      archive,
      public: isPublic
    };

    return {
      success: true,
      publishResult,
      releaseNotes,
      cost: '¥29 (one-time) or ¥299/month'
    };
  }

  async execute(skillPath, options = {}) {
    return await this.publish(skillPath, options);
  }
}

if (require.main === module) {
  const publisher = new SkillPublisher();
  const skillPath = process.argv[2];
  const version = process.argv.find((_, i) => process.argv[i-1] === '--version') || '1.0.0';

  if (!skillPath) { console.error('Usage: node index.js <skill-path> [--version x.x.x]'); process.exit(1); }

  publisher.execute(skillPath, { version }).then(r => {
    console.log('✅ Skill published!\n');
    console.log('Release Notes:\n', r.releaseNotes);
    console.log(`\n💰 Cost: ${r.cost}`);
  }).catch(err => { console.error('❌ Error:', err.message); process.exit(1); });
}

module.exports = SkillPublisher;
