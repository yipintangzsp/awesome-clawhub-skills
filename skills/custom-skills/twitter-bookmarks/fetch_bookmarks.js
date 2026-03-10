#!/usr/bin/env node
/**
 * Twitter 书签获取脚本
 * 使用 6551 API + SQLite 存储
 */

const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
let apiKey = '';
let apiSecret = '';
let username = '';
let dbPath = './bookmarks.db';
let outputDir = './reports';

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--api-key' && args[i + 1]) {
        apiKey = args[++i];
    } else if (args[i] === '--api-secret' && args[i + 1]) {
        apiSecret = args[++i];
    } else if (args[i] === '--username' && args[i + 1]) {
        username = args[++i];
    } else if (args[i] === '--db-path' && args[i + 1]) {
        dbPath = args[++i];
    } else if (args[i] === '--output-dir' && args[i + 1]) {
        outputDir = args[++i];
    }
}

if (!apiKey || !apiSecret || !username) {
    console.error('❌ 用法：node fetch_bookmarks.js --api-key <key> --api-secret <secret> --username <用户名>');
    process.exit(1);
}

// 初始化数据库
function initDatabase(dbPath) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                reject(err);
                return;
            }
            
            db.serialize(() => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS bookmarks (
                        id TEXT PRIMARY KEY,
                        tweet_text TEXT,
                        author_name TEXT,
                        author_username TEXT,
                        created_at INTEGER,
                        bookmarked_at INTEGER,
                        tweet_url TEXT,
                        media_count INTEGER DEFAULT 0
                    )
                `);
                db.run('CREATE INDEX IF NOT EXISTS idx_bookmarked_at ON bookmarks(bookmarked_at)');
                resolve(db);
            });
        });
    });
}

// 调用 6551 API 获取书签
function fetchBookmarks(apiKey, apiSecret, username) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({
            username: username,
            count: 100,
            cursor: null
        });
        
        const options = {
            hostname: 'api.6551.io',
            port: 443,
            path: '/v1/twitter/bookmarks',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
                'X-API-Secret': apiSecret,
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve(result);
                } catch (e) {
                    reject(new Error('API 响应解析失败：' + data));
                }
            });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

// 保存书签到数据库
function saveBookmarks(db, bookmarks) {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR IGNORE INTO bookmarks 
            (id, tweet_text, author_name, author_username, created_at, bookmarked_at, tweet_url, media_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        let saved = 0;
        let skipped = 0;
        
        bookmarks.forEach(tweet => {
            stmt.run([
                tweet.id,
                tweet.text,
                tweet.author_name,
                tweet.author_username,
                tweet.created_at,
                Date.now(),
                `https://twitter.com/${tweet.author_username}/status/${tweet.id}`,
                tweet.media_count || 0
            ], function(err) {
                if (err) {
                    skipped++;
                } else {
                    saved++;
                }
            });
        });
        
        stmt.finalize((err) => {
            if (err) reject(err);
            else resolve({ saved, skipped });
        });
    });
}

// 生成每日报告
function generateDailyReport(db, outputDir) {
    return new Promise((resolve, reject) => {
        const today = new Date();
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
        
        db.all(
            'SELECT * FROM bookmarks WHERE bookmarked_at >= ? ORDER BY bookmarked_at DESC',
            [todayStart],
            (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                const dateStr = today.toISOString().split('T')[0];
                let markdown = `# Twitter 书签日报 - ${dateStr}\n\n`;
                markdown += `> 生成时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n\n`;
                markdown += `**今日新增书签**: ${rows.length} 条\n\n`;
                markdown += `---\n\n`;
                
                if (rows.length === 0) {
                    markdown += `*今日没有新增书签*\n`;
                } else {
                    rows.forEach((row, index) => {
                        markdown += `### ${index + 1}. ${row.author_name} (@${row.author_username})\n\n`;
                        markdown += `${row.tweet_text}\n\n`;
                        markdown += `[查看推文](${row.tweet_url})\n\n`;
                        markdown += `---\n\n`;
                    });
                }
                
                const reportPath = path.join(outputDir, `daily_${dateStr}.md`);
                fs.writeFileSync(reportPath, markdown);
                resolve({ reportPath, count: rows.length });
            }
        );
    });
}

// 主函数
(async () => {
    try {
        console.log('📚 初始化数据库...');
        const db = await initDatabase(dbPath);
        console.log(`💾 数据库：${dbPath}`);
        
        console.log('🌐 获取书签...');
        const apiResponse = await fetchBookmarks(apiKey, apiSecret, username);
        
        if (!apiResponse.success || !apiResponse.data) {
            throw new Error('API 请求失败：' + (apiResponse.message || '未知错误'));
        }
        
        const bookmarks = apiResponse.data.bookmarks || [];
        console.log(`📥 获取到 ${bookmarks.length} 条书签`);
        
        if (bookmarks.length === 0) {
            console.log('✨ 没有新书签');
            db.close();
            return;
        }
        
        console.log('💾 保存到数据库...');
        const saveResult = await saveBookmarks(db, bookmarks);
        console.log(`✅ 新增：${saveResult.saved}, 跳过：${saveResult.skipped}`);
        
        console.log('📝 生成每日报告...');
        const reportResult = await generateDailyReport(db, outputDir);
        console.log(`📄 报告：${reportResult.reportPath}`);
        console.log(`📊 今日新增：${reportResult.count} 条`);
        
        // 输出最新书签到 stdout
        console.log('\n📌 最新书签：');
        bookmarks.slice(0, 5).forEach((tweet, i) => {
            console.log(`  ${i + 1}. ${tweet.author_username}: ${tweet.text.substring(0, 50)}...`);
        });
        
        db.close();
        
    } catch (error) {
        console.error('❌ 错误:', error.message);
        process.exit(1);
    }
})();
