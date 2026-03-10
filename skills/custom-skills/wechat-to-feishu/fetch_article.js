#!/usr/bin/env node
/**
 * 公众号文章抓取并上传到飞书
 * 使用 Puppeteer 抓取 + Feishu Doc API
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const https = require('https');

// 解析命令行参数
const args = process.argv.slice(2);
let articleUrl = '';
let docToken = '';
let customTitle = '';

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--url' && args[i + 1]) {
        articleUrl = args[++i];
    } else if (args[i] === '--doc-token' && args[i + 1]) {
        docToken = args[++i];
    } else if (args[i] === '--title' && args[i + 1]) {
        customTitle = args[++i];
    }
}

if (!articleUrl || !docToken) {
    console.error('❌ 用法：node fetch_article.js --url <文章 URL> --doc-token <飞书文档 token> [--title <自定义标题>]');
    process.exit(1);
}

(async () => {
    let browser;
    try {
        console.log('🌐 启动浏览器...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1 WeChat/7.0.18');
        
        console.log(`📥 抓取：${articleUrl}`);
        await page.goto(articleUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // 等待内容加载
        await page.waitForSelector('#js_content, .rich_media_content', { timeout: 10000 });
        
        // 提取文章内容
        const articleData = await page.evaluate((customTitle) => {
            const titleEl = document.querySelector('#activity-name, h1, .rich_media_title');
            const contentEl = document.querySelector('#js_content, .rich_media_content');
            const authorEl = document.querySelector('.rich_media_meta_nickname, .profile_nickname');
            const dateEl = document.querySelector('.rich_media_meta_text, em[id*="publish_time"]');
            
            return {
                title: customTitle || (titleEl ? titleEl.textContent.trim() : '未命名文章'),
                author: authorEl ? authorEl.textContent.trim() : '',
                publishDate: dateEl ? dateEl.textContent.trim() : '',
                content: contentEl ? contentEl.innerHTML : '',
                url: window.location.href
            };
        }, customTitle);
        
        await browser.close();
        
        console.log(`📝 标题：${articleData.title}`);
        if (articleData.author) console.log(`✍️  作者：${articleData.author}`);
        
        // 构建 Markdown 内容
        let markdown = `# ${articleData.title}\n\n`;
        if (articleData.author) markdown += `**作者**: ${articleData.author}  \n`;
        if (articleData.publishDate) markdown += `**发布时间**: ${articleData.publishDate}  \n`;
        markdown += `**原文链接**: ${articleData.url}\n\n`;
        markdown += `---\n\n`;
        markdown += `> ⚠️  以下为抓取的内容，格式可能有所变化\n\n`;
        
        // 简单转换 HTML 到 Markdown（简化版）
        let contentText = articleData.content
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<p[^>]*>/gi, '\n')
            .replace(/<\/p>/gi, '\n')
            .replace(/<strong[^>]*>/gi, '**')
            .replace(/<\/strong>/gi, '**')
            .replace(/<img[^>]*src="([^"]*)"[^>]*>/gi, '\n![图片]($1)\n')
            .replace(/<[^>]+>/g, '')
            .trim();
        
        markdown += contentText;
        
        // 保存到本地缓存
        const cacheDir = path.join(__dirname, 'cache');
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
        const safeTitle = articleData.title.replace(/[\/\\:*?"<>|]/g, '_');
        const cacheFile = path.join(cacheDir, `${safeTitle}.md`);
        fs.writeFileSync(cacheFile, markdown);
        console.log(`💾 已缓存到：${cacheFile}`);
        
        // 上传到飞书（使用 feishu_doc 工具）
        console.log('📤 上传到飞书...');
        
        // 这里调用 feishu_doc API 创建/更新文档
        // 实际使用时需要通过 OpenClaw 的 feishu_doc 工具
        const { execSync } = require('child_process');
        try {
            // 使用 openclaw 的 feishu_doc 工具
            const escapedContent = markdown.replace(/'/g, "'\"'\"'");
            execSync(`openclaw feishu_doc write --doc_token "${docToken}" --content '${escapedContent}'`, {
                stdio: 'inherit'
            });
            console.log('✅ 成功上传到飞书文档！');
        } catch (error) {
            console.log('⚠️  飞书上传失败，但本地缓存已保存');
            console.log('   请手动使用：openclaw feishu_doc write --doc_token <token> --content <内容>');
        }
        
    } catch (error) {
        if (browser) await browser.close();
        console.error('❌ 抓取失败:', error.message);
        process.exit(1);
    }
})();
