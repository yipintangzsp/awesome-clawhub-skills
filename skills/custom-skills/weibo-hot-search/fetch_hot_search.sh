#!/bin/bash
# 微博热搜爬虫 - 执行脚本
# 使用 playwright-scraper 爬取微博实时热搜榜

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/config.json"
OUTPUT_DIR="$SCRIPT_DIR/output"

# 读取配置
TOP_N=$(jq -r '.top_n // 50' "$CONFIG_FILE")
OUTPUT_DIR=$(jq -r '.output_dir // "./output"' "$CONFIG_FILE")
INCLUDE_SCORE=$(jq -r '.include_score // true' "$CONFIG_FILE")

# 创建输出目录
mkdir -p "$OUTPUT_DIR"

# 日期戳
DATE_STAMP=$(date +%Y-%m-%d)
OUTPUT_FILE="$OUTPUT_DIR/hot_search_${DATE_STAMP}.md"

echo "🔍 开始爬取微博热搜榜..."
echo "📊 抓取前 ${TOP_N} 条热搜"
echo ""

# 使用 Node.js + Playwright 爬取
node << 'NODE_SCRIPT'
const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    try {
        await page.goto('https://s.weibo.com/top/summary', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        // 等待热搜列表加载
        await page.waitForSelector('.tab-list li', { timeout: 10000 });
        
        // 提取热搜数据
        const hotSearchData = await page.evaluate(() => {
            const items = document.querySelectorAll('.tab-list li');
            const results = [];
            
            items.forEach((item, index) => {
                const titleEl = item.querySelector('.title');
                const hotEl = item.querySelector('.num');
                const tagEl = item.querySelector('.tag');
                
                if (titleEl) {
                    results.push({
                        rank: index + 1,
                        keyword: titleEl.textContent.trim(),
                        link: titleEl.href || '',
                        hot: hotEl ? hotEl.textContent.trim() : '',
                        tag: tagEl ? tagEl.textContent.trim() : ''
                    });
                }
            });
            
            return results;
        });
        
        await browser.close();
        
        // 输出 Markdown 格式
        const dateStamp = new Date().toISOString().split('T')[0];
        let markdown = `# 微博热搜榜 - ${dateStamp}\n\n`;
        markdown += `> 抓取时间：${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}\n\n`;
        markdown += `| 排名 | 关键词 | 热度 | 标签 | 链接 |\n`;
        markdown += `|------|--------|------|------|------|\n`;
        
        hotSearchData.forEach(item => {
            const link = item.link ? `[🔗](${item.link})` : '';
            markdown += `| ${item.rank} | ${item.keyword} | ${item.hot} | ${item.tag} | ${link} |\n`;
        });
        
        markdown += `\n---\n*数据来源：微博热搜榜 (s.weibo.com)*\n`;
        
        // 输出到文件
        const fs = require('fs');
        const path = require('path');
        const outputFile = process.env.OUTPUT_FILE || './output/hot_search_' + dateStamp + '.md';
        fs.writeFileSync(outputFile, markdown);
        
        console.log(markdown);
        console.log(`\n✅ 已保存到：${outputFile}`);
        
    } catch (error) {
        await browser.close();
        console.error('❌ 爬取失败:', error.message);
        process.exit(1);
    }
})();
NODE_SCRIPT

echo ""
echo "✅ 微博热搜爬取完成！"
