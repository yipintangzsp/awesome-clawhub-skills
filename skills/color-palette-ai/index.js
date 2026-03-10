#!/usr/bin/env node
/** 配色方案 AI **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/color-palette-ai.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'color-palette-ai', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function color_palette_ai(style = 'warm') {
  const palettes = {
    warm: { name: '温暖', colors: ['#FF6B6B', '#FFE66D', '#FF8C42', '#F7FFF7', '#4ECDC4'] },
    cool: { name: '冷静', colors: ['#2C3E50', '#3498DB', '#5DADE2', '#AED6F1', '#D4E6F1'] },
    nature: { name: '自然', colors: ['#2D5016', '#4A7023', '#8FBC8F', '#F5F5DC', '#8B4513'] },
    pastel: { name: '柔和', colors: ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#E2F0CB'] },
    dark: { name: '暗黑', colors: ['#1A1A2E', '#16213E', '#0F3460', '#E94560', '#533483'] }
  };
  const p = palettes[style] || palettes.warm;
  return { success: true, style, ...p, count: p.colors.length };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  if (args.includes('--help') || args.length === 0) {
    console.log(`用法：color-palette-ai [选项]
功能：配色方案 AI
价格：¥3/次

选项:
  --help     显示帮助信息
  --style    风格 (warm/cool/nature/pastel/dark, 默认 warm)

示例:
  color-palette-ai --style cool
`);
    return;
  }
  
  const price = config.price_per_call || 3, userId = process.env.USER || 'unknown';
  const style = args.find(a => a.startsWith('--style='))?.split('=')[1] || 'warm';
  
  console.log(`🎨 配色方案 AI\n💰 费用：¥${price}\n`);
  
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { 
    console.error('❌ 收费失败'); 
    console.log(`💳 ${chargeResult.payment_url}`); 
    process.exit(1); 
  }
  
  console.log('✅ 收费成功\n🔄 正在生成...\n');
  const result = color_palette_ai(style);
  
  console.log('━━━ 配色方案 ━━━');
  console.log(`🎨 风格：${result.name}\n`);
  result.colors.forEach((c, i) => console.log(`${i + 1}. ${c}`));
  console.log('\n━━━ 结束 ━━━');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
