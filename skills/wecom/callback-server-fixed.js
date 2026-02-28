#!/usr/bin/env node
/**
 * WeCom Callback Server for OpenClaw
 * 修复版 - 正确响应企业微信验证
 */

const http = require('http');
const crypto = require('crypto');

const PORT = process.env.WECOM_CALLBACK_PORT || 18790;
const TOKEN = process.env.WECOM_TOKEN || 'openclaw2026';

// SHA1 verification for WeCom
function verifySignature(token, timestamp, nonce, echostr) {
  const arr = [token, timestamp, nonce].sort();
  const hash = crypto.createHash('sha1').update(arr.join('')).digest('hex');
  return hash;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  console.log(`[${new Date().toISOString()}] ${req.method} ${url.pathname}`);
  console.log('Query params:', Object.fromEntries(url.searchParams));
  
  // GET request - verification from WeCom
  if (req.method === 'GET' && url.pathname === '/wecom/callback') {
    const msgSignature = url.searchParams.get('msg_signature');
    const timestamp = url.searchParams.get('timestamp');
    const nonce = url.searchParams.get('nonce');
    const echostr = url.searchParams.get('echostr');
    
    console.log('Verification request:', { msgSignature, timestamp, nonce, echostr: echostr ? 'present' : 'missing' });
    
    const signature = verifySignature(TOKEN, timestamp, nonce, echostr);
    console.log('Expected signature:', signature);
    console.log('Match:', signature === msgSignature);
    
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
  
  // POST request - incoming message
  if (req.method === 'POST' && url.pathname === '/wecom/callback') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      console.log('📨 Received message:', body.substring(0, 200));
      
      // Acknowledge immediately
      res.writeHead(200, { 'Content-Type': 'application/xml' });
      res.end('<xml><returncode>0</returncode><returnmsg>ok</returnmsg></xml>');
    });
    return;
  }
  
  // 404 for other paths
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🦞 ═══════════════════════════════════════════════════════════');
  console.log('🦞  WeCom Callback Server Started (FIXED)');
  console.log('🦞 ═══════════════════════════════════════════════════════════');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌐 Listening on: 0.0.0.0:${PORT}`);
  console.log(`🔑 Token: ${TOKEN}`);
  console.log('');
  console.log('✅ Server ready for WeCom verification');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
});
