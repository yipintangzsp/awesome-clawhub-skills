#!/usr/bin/env node
/**
 * WeCom Callback Server for OpenClaw
 * 接收企业微信消息并转发到 OpenClaw，实现双向通信
 */

const http = require('http');
const crypto = require('crypto');
const axios = require('axios');
const xml2js = require('xml2js');

const PORT = process.env.WECOM_CALLBACK_PORT || 18790;
const TOKEN = process.env.WECOM_TOKEN || 'openclaw2026';
const ENCODING_AES_KEY = process.env.WECOM_ENCODING_AES_KEY || '';
const CORP_ID = process.env.WECOM_CORP_ID || '';
const AGENT_ID = process.env.WECOM_AGENT_ID || '';
const CORP_SECRET = process.env.WECOM_CORP_SECRET || '';
const OPENCLAW_GATEWAY = 'http://127.0.0.1:18789';

let accessToken = null;
let tokenExpires = 0;

// SHA1 verification
function verifySignature(token, timestamp, nonce, echostr) {
  const arr = [token, timestamp, nonce].sort();
  const hash = crypto.createHash('sha1').update(arr.join('')).digest('hex');
  return hash;
}

// Parse XML
function parseXML(xml) {
  return new Promise((resolve, reject) => {
    xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
      if (err) reject(err);
      else resolve(result.xml);
    });
  });
}

// Get WeCom access token
async function getAccessToken() {
  if (accessToken && Date.now() < tokenExpires) {
    return accessToken;
  }
  
  if (!CORP_ID || !CORP_SECRET) {
    console.log('⚠️  WECOM_CORP_ID or WECOM_CORP_SECRET not set');
    return null;
  }
  
  try {
    const res = await axios.get(
      `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${CORP_ID}&corpsecret=${CORP_SECRET}`
    );
    if (res.data.errcode === 0) {
      accessToken = res.data.access_token;
      tokenExpires = Date.now() + 7200000; // 2 hours
      console.log('✅ Got WeCom access token');
      return accessToken;
    }
  } catch (e) {
    console.log('❌ Failed to get access token:', e.message);
  }
  return null;
}

// Send message back to WeCom
async function sendToWeCom(toUser, content) {
  const token = await getAccessToken();
  if (!token) return false;
  
  try {
    await axios.post(
      `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${token}`,
      {
        touser: toUser,
        msgtype: 'text',
        agentid: parseInt(AGENT_ID) || 1000001,
        text: { content }
      }
    );
    console.log('✅ Sent reply to WeCom:', toUser);
    return true;
  } catch (e) {
    console.log('❌ Failed to send to WeCom:', e.response?.data || e.message);
    return false;
  }
}

// Forward message to OpenClaw and get response
async function forwardToOpenClaw(userId, content) {
  try {
    // Send to OpenClaw via message tool
    const res = await axios.post(
      `${OPENCLAW_GATEWAY}/api/message`,
      {
        action: 'send',
        target: `wecom:${userId}`,
        message: content,
        channel: 'wecom'
      },
      { timeout: 30000 }
    );
    return res.data.response || '消息已收到';
  } catch (e) {
    console.log('❌ Failed to forward to OpenClaw:', e.message);
    return '消息已收到，正在处理...';
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // GET - verification
  if (req.method === 'GET') {
    const msgSignature = url.searchParams.get('msg_signature');
    const timestamp = url.searchParams.get('timestamp');
    const nonce = url.searchParams.get('nonce');
    const echostr = url.searchParams.get('echostr');
    
    const signature = verifySignature(TOKEN, timestamp, nonce, echostr);
    
    if (signature === msgSignature) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(echostr);
      console.log('✅ WeCom verification successful');
    } else {
      res.writeHead(403);
      res.end('Invalid signature');
      console.log('❌ WeCom verification failed');
    }
    return;
  }
  
  // POST - incoming message
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const data = await parseXML(body);
        console.log('📨 WeCom message:', JSON.stringify(data, null, 2));
        
        const fromUser = data.FromUserName;
        const toUser = data.ToUserName;
        const content = data.Content;
        const msgType = data.MsgType;
        
        if (msgType === 'text' && content) {
          // Send "received" acknowledgment immediately
          res.writeHead(200, { 'Content-Type': 'application/xml' });
          res.end('<xml><returncode>0</returncode><returnmsg>ok</returnmsg></xml>');
          
          // Forward to OpenClaw and get response
          console.log(`📤 Forwarding to OpenClaw: ${fromUser} - ${content}`);
          const response = await forwardToOpenClaw(fromUser, content);
          
          // Send reply back to WeCom
          if (response) {
            await sendToWeCom(fromUser, response);
          }
        } else {
          res.writeHead(200, { 'Content-Type': 'application/xml' });
          res.end('<xml><returncode>0</returncode><returnmsg>ok</returnmsg></xml>');
        }
      } catch (e) {
        console.log('❌ Error processing message:', e.message);
        res.writeHead(500);
        res.end('Error');
      }
    });
    return;
  }
  
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log('');
  console.log('🦞 ═══════════════════════════════════════════════════════════');
  console.log('🦞  WeCom Callback Server Started');
  console.log('🦞 ═══════════════════════════════════════════════════════════');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Callback URL: https://coupons-providing-mating-encouraged.trycloudflare.com/wecom/callback`);
  console.log(`🔑 Token: ${TOKEN}`);
  console.log('');
  console.log('📋 在企业微信后台配置：');
  console.log(`   URL: https://coupons-providing-mating-encouraged.trycloudflare.com/wecom/callback`);
  console.log(`   Token: ${TOKEN}`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});
