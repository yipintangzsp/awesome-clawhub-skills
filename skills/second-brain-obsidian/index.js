#!/usr/bin/env node

/**
 * obsidian-second-brain - AI 第二大脑核心技能
 * 
 * 功能：
 * - 自动双向链接生成
 * - 智能标签推荐
 * - 知识图谱可视化
 * - MOC 自动生成
 * - 每日笔记模板
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  vaultPath: process.env.OBSIDIAN_VAULT || '~/ObsidianVault',
  autoLink: true,
  smartTags: true,
  graphOutput: './graph.png',
  mocDir: './MOCs'
};

/**
 * 主入口函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'config':
      await configure(args);
      break;
    case 'analyze':
      await analyzeVault();
      break;
    case 'auto-link':
      await generateAutoLinks(args);
      break;
    case 'tags':
      await generateSmartTags(args);
      break;
    case 'graph':
      await generateKnowledgeGraph(args);
      break;
    case 'moc':
      await generateMOC(args);
      break;
    case 'template':
      await setupTemplates(args);
      break;
    default:
      showHelp();
  }
}

/**
 * 配置 Obsidian 仓库路径
 */
async function configure(args) {
  const vaultIndex = args.indexOf('--vault');
  if (vaultIndex === -1) {
    console.error('错误：请指定 --vault 路径');
    process.exit(1);
  }
  
  const vaultPath = args[vaultIndex + 1];
  if (!fs.existsSync(vaultPath)) {
    console.error(`错误：仓库路径不存在：${vaultPath}`);
    process.exit(1);
  }

  CONFIG.vaultPath = vaultPath;
  saveConfig();
  console.log(`✅ 已配置 Obsidian 仓库：${vaultPath}`);
}

/**
 * 分析现有笔记
 */
async function analyzeVault() {
  console.log('🔍 正在分析笔记仓库...');
  
  const notes = getAllNotes();
  const stats = {
    totalNotes: notes.length,
    totalLinks: 0,
    orphanedNotes: 0,
    avgLinksPerNote: 0
  };

  notes.forEach(note => {
    const links = extractLinks(note.content);
    stats.totalLinks += links.length;
    if (links.length === 0) stats.orphanedNotes++;
  });

  stats.avgLinksPerNote = stats.totalLinks / stats.totalNotes;

  console.log('\n📊 分析结果：');
  console.log(`   总笔记数：${stats.totalNotes}`);
  console.log(`   总链接数：${stats.totalLinks}`);
  console.log(`   孤立笔记：${stats.orphanedNotes}`);
  console.log(`   平均每篇链接：${stats.avgLinksPerNote.toFixed(2)}`);
}

/**
 * 生成自动双向链接
 */
async function generateAutoLinks(args) {
  const enableIndex = args.indexOf('--enable');
  const shouldEnable = enableIndex !== -1;

  console.log('🔗 正在生成自动链接...');
  
  const notes = getAllNotes();
  const concepts = extractConcepts(notes);
  let linkCount = 0;

  notes.forEach(note => {
    const newLinks = findLinkOpportunities(note.content, concepts);
    if (newLinks.length > 0 && shouldEnable) {
      note.content = applyLinks(note.content, newLinks);
      saveNote(note);
      linkCount += newLinks.length;
    }
  });

  console.log(`✅ 已创建 ${linkCount} 个新链接`);
}

/**
 * 生成智能标签
 */
async function generateSmartTags(args) {
  console.log('🏷️ 正在生成智能标签...');
  
  const notes = getAllNotes();
  let tagCount = 0;

  notes.forEach(note => {
    const suggestedTags = suggestTags(note.content);
    if (suggestedTags.length > 0) {
      note.content = addTags(note.content, suggestedTags);
      saveNote(note);
      tagCount += suggestedTags.length;
    }
  });

  console.log(`✅ 已添加 ${tagCount} 个标签`);
}

/**
 * 生成知识图谱
 */
async function generateKnowledgeGraph(args) {
  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : CONFIG.graphOutput;

  console.log('📊 正在生成知识图谱...');
  
  const notes = getAllNotes();
  const graph = buildGraph(notes);
  
  // 生成 Graphviz DOT 格式
  const dot = generateDot(graph);
  fs.writeFileSync(outputFile.replace('.png', '.dot'), dot);
  
  console.log(`✅ 知识图谱已生成：${outputFile}`);
  console.log('   提示：使用 Graphviz 转换 .dot 文件为图片');
}

/**
 * 生成 MOC（Map of Content）
 */
async function generateMOC(args) {
  const topicIndex = args.indexOf('--topic');
  const topic = topicIndex !== -1 ? args[topicIndex + 1] : 'General';

  console.log(`🗂️ 正在生成 MOC：${topic}...`);
  
  const notes = getAllNotes();
  const relatedNotes = findRelatedNotes(notes, topic);
  const moc = buildMOC(topic, relatedNotes);

  const mocPath = path.join(CONFIG.mocDir, `${topic}-MOC.md`);
  fs.writeFileSync(mocPath, moc);
  
  console.log(`✅ MOC 已创建：${mocPath}`);
}

/**
 * 设置笔记模板
 */
async function setupTemplates(args) {
  const typeIndex = args.indexOf('--daily');
  const isDaily = typeIndex !== -1;

  const templateDir = path.join(CONFIG.vaultPath, 'Templates');
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }

  if (isDaily) {
    const dailyTemplate = `---
date: {{date}}
tags: [daily-note]
---

# {{date:YYYY-MM-DD}}

## 📝 今日重点
- 

## 📚 学习笔记
- 

## 💡 灵感想法
- 

## ✅ 完成情况
- [ ] 

## 🔄 明日计划
- 
`;
    fs.writeFileSync(path.join(templateDir, 'Daily-Note.md'), dailyTemplate);
    console.log('✅ 每日笔记模板已创建');
  }
}

// 辅助函数
function getAllNotes() {
  const notes = [];
  const vaultPath = path.resolve(CONFIG.vaultPath.replace('~', process.env.HOME));
  
  function scanDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && !file.startsWith('.')) {
        scanDir(filePath);
      } else if (file.endsWith('.md')) {
        const content = fs.readFileSync(filePath, 'utf-8');
        notes.push({ path: filePath, content });
      }
    });
  }
  
  scanDir(vaultPath);
  return notes;
}

function extractLinks(content) {
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  return links;
}

function extractConcepts(notes) {
  const conceptMap = new Map();
  const conceptRegex = /\b([A-Z][a-zA-Z]+(?:\s[A-Z][a-zA-Z]+)*)\b/g;
  
  notes.forEach(note => {
    const matches = note.content.match(conceptRegex) || [];
    matches.forEach(concept => {
      if (concept.length > 3) {
        conceptMap.set(concept, (conceptMap.get(concept) || 0) + 1);
      }
    });
  });
  
  return Array.from(conceptMap.entries())
    .filter(([_, count]) => count >= 2)
    .map(([concept]) => concept);
}

function findLinkOpportunities(content, concepts) {
  const opportunities = [];
  concepts.forEach(concept => {
    const regex = new RegExp(`\\b${concept}\\b`, 'g');
    if (content.match(regex) && !content.includes(`[[${concept}]]`)) {
      opportunities.push(concept);
    }
  });
  return opportunities;
}

function applyLinks(content, links) {
  links.forEach(link => {
    const regex = new RegExp(`\\b${link}\\b`, 'g');
    content = content.replace(regex, `[[${link}]]`);
  });
  return content;
}

function suggestTags(content) {
  // 简化的标签推荐逻辑
  const tagMap = {
    'AI': ['#人工智能', '#技术'],
    '项目': ['#工作', '#项目'],
    '学习': ['#学习', '#成长'],
    '想法': ['#灵感', '#思考']
  };
  
  const tags = [];
  Object.keys(tagMap).forEach(keyword => {
    if (content.includes(keyword)) {
      tags.push(...tagMap[keyword]);
    }
  });
  
  return [...new Set(tags)].slice(0, 5);
}

function addTags(content, tags) {
  if (content.startsWith('---')) {
    const frontmatterEnd = content.indexOf('---', 3);
    const frontmatter = content.substring(3, frontmatterEnd);
    const rest = content.substring(frontmatterEnd + 3);
    return `---\n${frontmatter}tags: ${JSON.stringify(tags)}\n---\n${rest}`;
  }
  return `---\ntags: ${JSON.stringify(tags)}\n---\n\n${content}`;
}

function buildGraph(notes) {
  const nodes = notes.map(note => ({
    id: path.basename(note.path, '.md'),
    path: note.path
  }));
  
  const edges = [];
  notes.forEach(note => {
    const links = extractLinks(note.content);
    links.forEach(link => {
      edges.push({
        source: path.basename(note.path, '.md'),
        target: link
      });
    });
  });
  
  return { nodes, edges };
}

function generateDot(graph) {
  let dot = 'digraph KnowledgeGraph {\n';
  dot += '  rankdir=LR;\n';
  dot += '  node [shape=box, style=filled, fillcolor=lightblue];\n\n';
  
  graph.nodes.forEach(node => {
    dot += `  "${node.id}";\n`;
  });
  
  dot += '\n';
  
  graph.edges.forEach(edge => {
    dot += `  "${edge.source}" -> "${edge.target}";\n`;
  });
  
  dot += '}\n';
  return dot;
}

function findRelatedNotes(notes, topic) {
  return notes.filter(note => 
    note.content.toLowerCase().includes(topic.toLowerCase())
  );
}

function buildMOC(topic, notes) {
  let moc = `# ${topic} MOC\n\n`;
  moc += `> 自动生成于 ${new Date().toISOString().split('T')[0]}\n\n`;
  moc += `## 相关笔记 (${notes.length}篇)\n\n`;
  
  notes.forEach(note => {
    const title = path.basename(note.path, '.md');
    moc += `- [[${title}]]\n`;
  });
  
  return moc;
}

function saveNote(note) {
  fs.writeFileSync(note.path, note.content, 'utf-8');
}

function saveConfig() {
  const configPath = path.join(CONFIG.vaultPath.replace('~', process.env.HOME), '.openclaw-config.json');
  fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
}

function showHelp() {
  console.log(`
obsidian-second-brain - AI 第二大脑核心技能

用法:
  openclaw obsidian config --vault <路径>     配置仓库路径
  openclaw obsidian analyze                   分析现有笔记
  openclaw obsidian auto-link --enable        启用自动链接
  openclaw obsidian tags                      生成智能标签
  openclaw obsidian graph --output <文件>     生成知识图谱
  openclaw obsidian moc --topic <主题>        创建 MOC
  openclaw obsidian template --daily          设置每日模板

示例:
  openclaw obsidian config --vault ~/Documents/Obsidian
  openclaw obsidian analyze
  openclaw obsidian graph --output brain.png
`);
}

// 执行
main().catch(console.error);
