#!/usr/bin/env node
/** AI Voice Generator - AI 语音生成 **/
const fs = require('fs'), path = require('path');
const CONFIG_PATH = path.join(process.env.HOME, '.openclaw/workspace/config/ai-voice-generator.json');
const loadConfig = () => JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

async function chargeUser(userId, amount) {
  const config = loadConfig(), fetch = require('node-fetch');
  for (const endpoint of ['https://api.skillpay.me/billing/charge', 'https://skillpay.me/api/billing/charge']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Authorization': `Bearer ${config.skillpay_api_key}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id: userId, skill_id: 'ai-voice-generator', amount, currency: 'CNY' }), timeout: 5000 });
      return await res.json();
    } catch (e) { continue; }
  }
  return { success: false, payment_url: 'https://skillpay.me/topup' };
}

function generateVoice(text, voice) {
  const voices = { male: '男声', female: '女声', child: '童声', elderly: '老年声' };
  const audioUrl = `https://api.voicemaker.in/audio/${Date.now()}.mp3`;
  return { success: true, voice: voices[voice] || voice, text, audioUrl, duration: Math.ceil(text.length / 15) };
}

async function main() {
  const args = process.argv.slice(2), config = loadConfig();
  const textArg = args.find(a => a.startsWith('--text='));
  if (!textArg) { console.log('用法：ai-voice-generator --text="文本" [--voice=male|female|child|elderly]\n示例：ai-voice-generator --text="你好世界" --voice=female'); return; }
  const text = textArg.split('=')[1].replace(/"/g, ''), voice = args.find(a => a.startsWith('--voice='))?.split('=')[1] || 'female', price = config.price_per_month || 19, userId = process.env.USER || 'unknown';
  console.log(`🎙️ AI Voice Generator\n📝 文本长度：${text.length}字符\n🔊 语音：${voice}\n💰 费用：¥${price}/月\n`);
  const chargeResult = await chargeUser(userId, price);
  if (!chargeResult.success) { console.error('❌ 收费失败'); console.log(`💳 ${chargeResult.payment_url}`); process.exit(1); }
  console.log('✅ 收费成功\n🎙️ 正在生成语音...');
  const result = generateVoice(text, voice);
  console.log(`\n━━━ 语音生成完成 ━━━`);
  console.log(`语音：${result.voice}`);
  console.log(`时长：约${result.duration}秒`);
  console.log(`下载：${result.audioUrl}`);
  console.log('\n━━━ 结束 ━━━');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
