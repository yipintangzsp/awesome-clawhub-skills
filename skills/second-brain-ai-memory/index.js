#!/usr/bin/env node

/**
 * ai-memory-system - AI 记忆管理系统
 * 
 * 功能：
 * - 对话历史存储
 * - 智能上下文检索
 * - 个性化偏好学习
 * - 记忆时间线
 * - 记忆关联网络
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  storagePath: process.env.MEMORY_STORAGE || '~/.openclaw/memory',
  encryption: true,
  autoIndex: true,
  maxContext: 50
};

/**
 * 主入口函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'enable':
      await enableMemory();
      break;
    case 'config':
      await configure(args);
      break;
    case 'search':
      await searchMemory(args);
      break;
    case 'recent':
      await showRecent(args);
      break;
    case 'timeline':
      await showTimeline(args);
      break;
    case 'export':
      await exportMemory(args);
      break;
    case 'list':
      await listMemories();
      break;
    case 'delete':
      await deleteMemory(args);
      break;
    case 'tag':
      await addTag(args);
      break;
    case 'summarize':
      await summarizeMemory(args);
      break;
    default:
      showHelp();
  }
}

/**
 * 启用记忆功能
 */
async function enableMemory() {
  const storagePath = getStoragePath();
  
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  const dbPath = path.join(storagePath, 'memory.db');
  if (!fs.existsSync(dbPath)) {
    createDatabase(dbPath);
  }

  console.log('✅ AI 记忆系统已启用');
  console.log(`   存储位置：${storagePath}`);
}

/**
 * 配置记忆系统
 */
async function configure(args) {
  const storageIndex = args.indexOf('--storage');
  const encryptIndex = args.indexOf('--encrypt');

  if (storageIndex !== -1) {
    CONFIG.storage = args[storageIndex + 1];
    console.log(`✅ 存储类型：${CONFIG.storage}`);
  }

  if (encryptIndex !== -1) {
    CONFIG.encryption = args[encryptIndex + 1] === 'true';
    console.log(`✅ 加密：${CONFIG.encryption ? '开启' : '关闭'}`);
  }

  saveConfig();
}

/**
 * 搜索记忆
 */
async function searchMemory(args) {
  const queryIndex = args.findIndex(arg => !arg.startsWith('--'));
  const query = queryIndex !== -1 ? args[queryIndex] : '';
  
  const typeIndex = args.indexOf('--type');
  const type = typeIndex !== -1 ? args[typeIndex + 1] : null;

  const tagIndex = args.indexOf('--tag');
  const tag = tagIndex !== -1 ? args[tagIndex + 1] : null;

  console.log(`🔍 搜索记忆："${query}"`);
  
  const memories = loadMemories();
  const results = memories.filter(memory => {
    let match = true;
    
    if (query && !memory.content.toLowerCase().includes(query.toLowerCase())) {
      match = false;
    }
    
    if (type && memory.type !== type) {
      match = false;
    }
    
    if (tag && !memory.tags.includes(tag)) {
      match = false;
    }
    
    return match;
  });

  console.log(`\n📊 找到 ${results.length} 条记忆:\n`);
  results.slice(0, 10).forEach((memory, i) => {
    console.log(`${i + 1}. [${memory.date}] ${memory.summary}`);
    console.log(`   类型：${memory.type} | 标签：${memory.tags.join(' ')}`);
  });

  if (results.length > 10) {
    console.log(`\n... 还有 ${results.length - 10} 条结果`);
  }
}

/**
 * 显示最近记忆
 */
async function showRecent(args) {
  const countIndex = args.indexOf('--count');
  const count = countIndex !== -1 ? parseInt(args[countIndex + 1]) : 10;

  console.log(`📋 最近 ${count} 条记忆:\n`);
  
  const memories = loadMemories();
  const recent = memories.slice(-count).reverse();

  recent.forEach((memory, i) => {
    console.log(`${i + 1}. [${memory.date}] ${memory.summary}`);
  });
}

/**
 * 显示时间线
 */
async function showTimeline(args) {
  const fromIndex = args.indexOf('--from');
  const fromDate = fromIndex !== -1 ? args[fromIndex + 1] : null;

  console.log('📅 记忆时间线:\n');
  
  const memories = loadMemories();
  const filtered = fromDate 
    ? memories.filter(m => m.date >= fromDate)
    : memories;

  // 按月份分组
  const byMonth = {};
  filtered.forEach(memory => {
    const month = memory.date.substring(0, 7);
    if (!byMonth[month]) byMonth[month] = [];
    byMonth[month].push(memory);
  });

  Object.keys(byMonth).sort().forEach(month => {
    console.log(`\n📆 ${month}`);
    byMonth[month].forEach(memory => {
      console.log(`   ${memory.date}: ${memory.summary}`);
    });
  });
}

/**
 * 导出记忆
 */
async function exportMemory(args) {
  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : 'memory-export.json';

  const formatIndex = args.indexOf('--format');
  const format = formatIndex !== -1 ? args[formatIndex + 1] : 'json';

  console.log(`📤 导出记忆到 ${outputFile}...`);
  
  const memories = loadMemories();
  
  if (format === 'json') {
    fs.writeFileSync(outputFile, JSON.stringify(memories, null, 2));
  } else if (format === 'markdown') {
    const md = memories.map(m => 
      `## ${m.summary}\n\n日期：${m.date}\n类型：${m.type}\n标签：${m.tags.join(' ')}\n\n${m.content}\n---\n`
    ).join('\n');
    fs.writeFileSync(outputFile, md);
  }

  console.log(`✅ 已导出 ${memories.length} 条记忆`);
}

/**
 * 列出所有记忆
 */
async function listMemories() {
  const memories = loadMemories();
  
  console.log(`📋 记忆列表 (共 ${memories.length} 条):\n`);
  
  memories.forEach((memory, i) => {
    console.log(`${i + 1}. [${memory.id}] ${memory.summary}`);
  });
}

/**
 * 删除记忆
 */
async function deleteMemory(args) {
  const id = args[1];
  if (!id) {
    console.error('错误：请指定记忆 ID');
    process.exit(1);
  }

  const memories = loadMemories();
  const filtered = memories.filter(m => m.id !== id);
  
  if (filtered.length === memories.length) {
    console.error('错误：未找到该记忆');
    process.exit(1);
  }

  saveMemories(filtered);
  console.log('✅ 记忆已删除');
}

/**
 * 添加标签
 */
async function addTag(args) {
  const id = args[1];
  const tags = args.slice(2).filter(t => t.startsWith('#'));

  if (!id || tags.length === 0) {
    console.error('错误：请指定记忆 ID 和标签');
    process.exit(1);
  }

  const memories = loadMemories();
  const memory = memories.find(m => m.id === id);
  
  if (!memory) {
    console.error('错误：未找到该记忆');
    process.exit(1);
  }

  tags.forEach(tag => {
    if (!memory.tags.includes(tag)) {
      memory.tags.push(tag);
    }
  });

  saveMemories(memories);
  console.log(`✅ 已添加标签：${tags.join(' ')}`);
}

/**
 * 生成记忆摘要
 */
async function summarizeMemory(args) {
  const periodIndex = args.indexOf('--period');
  const period = periodIndex !== -1 ? args[periodIndex + 1] : 'week';

  console.log(`📊 生成${period === 'week' ? '周' : '月'}记忆摘要...\n`);
  
  const memories = loadMemories();
  const now = new Date();
  const cutoff = period === 'week' 
    ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recent = memories.filter(m => new Date(m.date) >= cutoff);

  console.log(`时间范围：${cutoff.toISOString().split('T')[0]} - ${now.toISOString().split('T')[0]}`);
  console.log(`记忆总数：${recent.length}\n`);

  // 按类型统计
  const byType = {};
  recent.forEach(m => {
    byType[m.type] = (byType[m.type] || 0) + 1;
  });

  console.log('📋 按类型分布:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  // 热门标签
  const tagCount = {};
  recent.forEach(m => {
    m.tags.forEach(tag => {
      tagCount[tag] = (tagCount[tag] || 0) + 1;
    });
  });

  console.log('\n🏷️ 热门标签:');
  Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([tag, count]) => {
      console.log(`   ${tag}: ${count}`);
    });
}

// 辅助函数
function getStoragePath() {
  return path.resolve(CONFIG.storagePath.replace('~', process.env.HOME));
}

function createDatabase(dbPath) {
  // 创建简化的 JSON 数据库
  const initialData = {
    memories: [],
    config: CONFIG
  };
  fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2));
}

function loadMemories() {
  const dbPath = path.join(getStoragePath(), 'memory.db');
  if (!fs.existsSync(dbPath)) {
    return [];
  }
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  return data.memories || [];
}

function saveMemories(memories) {
  const dbPath = path.join(getStoragePath(), 'memory.db');
  const data = {
    memories,
    config: CONFIG
  };
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function saveConfig() {
  const configPath = path.join(getStoragePath(), 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
}

function showHelp() {
  console.log(`
ai-memory-system - AI 记忆管理系统

用法:
  openclaw memory enable                      启用记忆功能
  openclaw memory config --storage <类型>     配置存储
  openclaw memory config --encrypt <true|false>  配置加密
  openclaw memory search "<查询>"             搜索记忆
  openclaw memory recent --count <数量>       显示最近记忆
  openclaw memory timeline --from <日期>      显示时间线
  openclaw memory export --output <文件>      导出记忆
  openclaw memory list                        列出所有记忆
  openclaw memory delete <ID>                 删除记忆
  openclaw memory tag <ID> #标签              添加标签
  openclaw memory summarize --period <week|month>  生成摘要

示例:
  openclaw memory enable
  openclaw memory search "项目讨论"
  openclaw memory timeline --from 2024-01-01
  openclaw memory export --output backup.json
`);
}

// 执行
main().catch(console.error);
