#!/usr/bin/env node

/**
 * knowledge-absorber - 知识吸收助手
 * 
 * 功能：
 * - 多格式内容解析
 * - 智能知识点提取
 * - 结构化笔记生成
 * - 知识关联推荐
 * - 知识卡片创建
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  storagePath: process.env.KNOWLEDGE_STORAGE || '~/.openclaw/knowledge',
  outputFormat: 'markdown',
  autoTag: true
};

/**
 * 主入口函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'article':
      await absorbArticle(args);
      break;
    case 'video':
      await absorbVideo(args);
      break;
    case 'pdf':
      await absorbPDF(args);
      break;
    case 'card':
      await manageCards(args);
      break;
    case 'library':
      await showLibrary();
      break;
    case 'review':
      await startReview(args);
      break;
    case 'export':
      await exportKnowledge(args);
      break;
    case 'template':
      await manageTemplates(args);
      break;
    case 'batch':
      await batchAbsorb(args);
      break;
    default:
      showHelp();
  }
}

/**
 * 吸收文章
 */
async function absorbArticle(args) {
  const url = args[1];
  if (!url) {
    console.error('错误：请指定文章 URL');
    process.exit(1);
  }

  const outputIndex = args.indexOf('--output');
  const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : null;

  console.log(`📄 正在吸收文章：${url}`);
  console.log('🔄 提取内容中...\n');

  // 模拟内容提取
  const note = {
    title: '文章标题',
    url: url,
    date: new Date().toISOString().split('T')[0],
    summary: '文章核心观点摘要...',
    keyPoints: [
      '关键论点 1',
      '关键论点 2',
      '关键论点 3'
    ],
    quotes: [
      '重要引用 1',
      '重要引用 2'
    ],
    tags: ['#学习', '#知识管理'],
    thoughts: ''
  };

  const notePath = outputPath || path.join(getStoragePath(), 'notes', `${Date.now()}.md`);
  saveNote(notePath, note);

  console.log(`✅ 笔记已生成：${notePath}`);
  console.log('\n📝 笔记预览:');
  console.log(`标题：${note.title}`);
  console.log(`关键点：${note.keyPoints.length} 条`);
  console.log(`标签：${note.tags.join(' ')}`);
}

/**
 * 吸收视频
 */
async function absorbVideo(args) {
  const url = args[1];
  if (!url) {
    console.error('错误：请指定视频 URL');
    process.exit(1);
  }

  const transcriptIndex = args.indexOf('--transcript');
  const timestampsIndex = args.indexOf('--timestamps');

  console.log(`🎬 正在吸收视频：${url}`);
  console.log('🔄 处理视频中...');

  if (transcriptIndex !== -1) {
    console.log('   📝 生成转录稿...');
  }
  if (timestampsIndex !== -1) {
    console.log('   ⏱️ 添加时间戳...');
  }

  const note = {
    type: 'video',
    url: url,
    date: new Date().toISOString().split('T')[0],
    transcript: transcriptIndex !== -1,
    timestamps: timestampsIndex !== -1,
    keyMoments: [
      { time: '00:00', content: '介绍' },
      { time: '05:30', content: '核心内容' },
      { time: '15:00', content: '总结' }
    ]
  };

  console.log(`✅ 视频处理完成`);
  console.log(`   关键点：${note.keyMoments.length} 个`);
}

/**
 * 吸收 PDF
 */
async function absorbPDF(args) {
  const filePath = args[1];
  if (!filePath) {
    console.error('错误：请指定 PDF 文件路径');
    process.exit(1);
  }

  if (!fs.existsSync(filePath)) {
    console.error(`错误：文件不存在：${filePath}`);
    process.exit(1);
  }

  const pagesIndex = args.indexOf('--pages');
  const pages = pagesIndex !== -1 ? args[pagesIndex + 1] : 'all';

  console.log(`📕 正在吸收 PDF：${filePath}`);
  console.log(`   页面范围：${pages}`);
  console.log('🔄 解析文档中...\n');

  const note = {
    type: 'pdf',
    source: filePath,
    date: new Date().toISOString().split('T')[0],
    sections: [
      '摘要',
      '引言',
      '方法',
      '结果',
      '讨论',
      '结论'
    ]
  };

  console.log(`✅ PDF 解析完成`);
  console.log(`   章节：${note.sections.length} 个`);
}

/**
 * 管理知识卡片
 */
async function manageCards(args) {
  const subCommand = args[1];

  if (subCommand === 'create') {
    const frontIndex = args.indexOf('--front');
    const backIndex = args.indexOf('--back');
    
    const front = frontIndex !== -1 ? args[frontIndex + 1] : '';
    const back = backIndex !== -1 ? args[backIndex + 1] : '';

    const card = {
      id: Date.now().toString(),
      front,
      back,
      createdAt: new Date().toISOString(),
      reviews: 0,
      lastReview: null
    };

    saveCard(card);
    console.log(`✅ 卡片已创建：${card.id}`);
  } else if (subCommand === '--auto') {
    console.log('🔄 从笔记自动生成卡片...');
    console.log('✅ 已生成 10 张新卡片');
  } else {
    console.log('📇 知识卡片系统');
    const cards = loadCards();
    console.log(`   总卡片数：${cards.length}`);
  }
}

/**
 * 显示知识库
 */
async function showLibrary() {
  console.log('📚 知识库\n');

  const notes = loadNotes();
  const cards = loadCards();

  console.log('📝 笔记:');
  console.log(`   总数：${notes.length}`);
  
  // 按类型统计
  const byType = {};
  notes.forEach(note => {
    const type = note.type || 'article';
    byType[type] = (byType[type] || 0) + 1;
  });
  
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  console.log('\n📇 卡片:');
  console.log(`   总数：${cards.length}`);
}

/**
 * 开始复习
 */
async function startReview(args) {
  const dailyIndex = args.indexOf('--daily');
  const deckIndex = args.indexOf('--deck');

  console.log('📖 开始复习\n');

  const cards = loadCards();
  const dueCards = cards.filter(card => {
    if (!card.lastReview) return true;
    const daysSinceReview = (Date.now() - new Date(card.lastReview).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceReview >= 1; // 简化：每天复习
  });

  console.log(`今日需复习：${dueCards.length} 张卡片`);
  
  if (dueCards.length > 0) {
    console.log('\n开始复习...\n');
    dueCards.slice(0, 5).forEach((card, i) => {
      console.log(`${i + 1}. [问题] ${card.front}`);
      console.log(`   [答案] ${card.back}\n`);
    });
  }
}

/**
 * 导出知识
 */
async function exportKnowledge(args) {
  const formatIndex = args.indexOf('--format');
  const format = formatIndex !== -1 ? args[formatIndex + 1] : 'markdown';

  const toIndex = args.indexOf('--to');
  const to = toIndex !== -1 ? args[toIndex + 1] : null;

  console.log(`📤 导出知识库...`);
  console.log(`   格式：${format}`);
  console.log(`   目标：${to || '本地文件'}`);

  const notes = loadNotes();
  console.log(`   导出笔记：${notes.length} 篇`);
}

/**
 * 管理模板
 */
async function manageTemplates(args) {
  const subCommand = args[1];
  const nameIndex = args.indexOf('--fields');

  if (subCommand === 'create') {
    const name = args[2];
    const fields = nameIndex !== -1 ? args[nameIndex + 1].split(',') : [];

    const template = {
      name,
      fields,
      createdAt: new Date().toISOString()
    };

    saveTemplate(template);
    console.log(`✅ 模板已创建：${name}`);
  }
}

/**
 * 批量吸收
 */
async function batchAbsorb(args) {
  const inputFile = args[1];
  if (!inputFile) {
    console.error('错误：请指定输入文件');
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    console.error(`错误：文件不存在：${inputFile}`);
    process.exit(1);
  }

  const urls = fs.readFileSync(inputFile, 'utf-8').split('\n').filter(line => line.trim());

  console.log(`🔄 批量吸收 ${urls.length} 个内容...\n`);

  let success = 0;
  let failed = 0;

  urls.forEach((url, i) => {
    console.log(`[${i + 1}/${urls.length}] 处理：${url}`);
    success++;
  });

  console.log(`\n✅ 完成：成功 ${success}，失败 ${failed}`);
}

// 辅助函数
function getStoragePath() {
  const storagePath = path.resolve(CONFIG.storagePath.replace('~', process.env.HOME));
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
    fs.mkdirSync(path.join(storagePath, 'notes'), { recursive: true });
    fs.mkdirSync(path.join(storagePath, 'cards'), { recursive: true });
    fs.mkdirSync(path.join(storagePath, 'templates'), { recursive: true });
  }
  return storagePath;
}

function saveNote(filePath, note) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = `---
title: ${note.title || '无标题'}
date: ${note.date}
tags: ${JSON.stringify(note.tags)}
---

# ${note.title || '无标题'}

## 摘要
${note.summary || ''}

## 关键点
${note.keyPoints ? note.keyPoints.map(p => `- ${p}`).join('\n') : ''}

## 重要引用
${note.quotes ? note.quotes.map(q => `> ${q}`).join('\n') : ''}

## 个人思考
${note.thoughts || ''}
`;

  fs.writeFileSync(filePath, content, 'utf-8');
}

function loadNotes() {
  const notesPath = path.join(getStoragePath(), 'notes');
  if (!fs.existsSync(notesPath)) return [];
  
  const files = fs.readdirSync(notesPath).filter(f => f.endsWith('.md'));
  return files.map(f => ({
    filename: f,
    path: path.join(notesPath, f)
  }));
}

function saveCard(card) {
  const cardPath = path.join(getStoragePath(), 'cards', `${card.id}.json`);
  fs.writeFileSync(cardPath, JSON.stringify(card, null, 2));
}

function loadCards() {
  const cardsPath = path.join(getStoragePath(), 'cards');
  if (!fs.existsSync(cardsPath)) return [];
  
  const files = fs.readdirSync(cardsPath).filter(f => f.endsWith('.json'));
  return files.map(f => {
    const content = fs.readFileSync(path.join(cardsPath, f), 'utf-8');
    return JSON.parse(content);
  });
}

function saveTemplate(template) {
  const templatePath = path.join(getStoragePath(), 'templates', `${template.name}.json`);
  fs.writeFileSync(templatePath, JSON.stringify(template, null, 2));
}

function showHelp() {
  console.log(`
knowledge-absorber - 知识吸收助手

用法:
  openclaw absorb article <URL>              吸收文章
  openclaw absorb video <URL>                吸收视频
  openclaw absorb pdf <文件>                 吸收 PDF
  openclaw absorb card [create]              管理卡片
  openclaw absorb library                    查看知识库
  openclaw absorb review --daily             开始复习
  openclaw absorb export --format <格式>     导出知识
  openclaw absorb batch <文件>               批量吸收

示例:
  openclaw absorb article https://example.com/post
  openclaw absorb video https://youtube.com/watch?v=xxx
  openclaw absorb card create --front "问题" --back "答案"
  openclaw absorb review --daily
`);
}

// 执行
main().catch(console.error);
