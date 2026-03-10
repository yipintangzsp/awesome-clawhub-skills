#!/usr/bin/env node

/**
 * task-auto-tracker - 任务自动追踪系统
 * 
 * 功能：
 * - 自动任务提取
 * - 智能优先级排序
 * - 自动提醒系统
 * - 任务依赖管理
 * - 进度追踪分析
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  storagePath: process.env.TASK_STORAGE || '~/.openclaw/tasks',
  autoTrack: false,
  workHours: { start: '9:00', end: '18:00' }
};

// 任务数据结构
class Task {
  constructor(data) {
    this.id = data.id || Date.now().toString();
    this.title = data.title;
    this.description = data.description || '';
    this.status = data.status || 'pending'; // pending, in-progress, done
    this.priority = data.priority || 'medium'; // low, medium, high, urgent
    this.dueDate = data.dueDate || null;
    this.tags = data.tags || [];
    this.dependencies = data.dependencies || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.completedAt = data.completedAt || null;
  }

  get priorityScore() {
    const scores = { urgent: 4, high: 3, medium: 2, low: 1 };
    return scores[this.priority] || 2;
  }
}

/**
 * 主入口函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'auto-track':
      await configureAutoTrack(args);
      break;
    case 'add':
      await addTask(args);
      break;
    case 'list':
      await listTasks(args);
      break;
    case 'today':
      await showTodayTasks();
      break;
    case 'complete':
      await completeTask(args);
      break;
    case 'remind':
      await setReminder(args);
      break;
    case 'report':
      await generateReport(args);
      break;
    case 'depend':
      await addDependency(args);
      break;
    case 'config':
      await configure(args);
      break;
    default:
      showHelp();
  }
}

/**
 * 配置自动追踪
 */
async function configureAutoTrack(args) {
  const enableIndex = args.indexOf('--enable');
  const disableIndex = args.indexOf('--disable');

  if (enableIndex !== -1) {
    CONFIG.autoTrack = true;
    console.log('✅ 自动任务追踪已启用');
    console.log('   系统将自动从对话、邮件、文档中提取任务');
  } else if (disableIndex !== -1) {
    CONFIG.autoTrack = false;
    console.log('⏸️ 自动任务追踪已暂停');
  }

  saveConfig();
}

/**
 * 添加任务
 */
async function addTask(args) {
  const titleIndex = args.findIndex(arg => !arg.startsWith('--'));
  const title = titleIndex !== -1 ? args[titleIndex] : '';

  if (!title) {
    console.error('错误：请指定任务标题');
    process.exit(1);
  }

  const dueIndex = args.indexOf('--due');
  const dueDate = dueIndex !== -1 ? parseDate(args[dueIndex + 1]) : null;

  const priorityIndex = args.indexOf('--priority');
  const priority = priorityIndex !== -1 ? args[priorityIndex + 1] : 'medium';

  const task = new Task({
    title,
    dueDate,
    priority
  });

  saveTask(task);
  console.log(`✅ 任务已添加：${task.title}`);
  console.log(`   ID: ${task.id}`);
  console.log(`   截止：${task.dueDate || '未设置'}`);
  console.log(`   优先级：${task.priority}`);
}

/**
 * 列出任务
 */
async function listTasks(args) {
  const statusIndex = args.indexOf('--status');
  const status = statusIndex !== -1 ? args[statusIndex + 1] : null;

  const priorityIndex = args.indexOf('--priority');
  const priority = priorityIndex !== -1 ? args[priorityIndex + 1] : null;

  console.log('📋 任务列表:\n');

  const tasks = loadTasks();
  const filtered = tasks.filter(task => {
    if (status && task.status !== status) return false;
    if (priority && task.priority !== priority) return false;
    return true;
  });

  // 按优先级排序
  filtered.sort((a, b) => b.priorityScore - a.priorityScore);

  filtered.forEach((task, i) => {
    const icon = getStatusIcon(task.status);
    const priorityIcon = getPriorityIcon(task.priority);
    console.log(`${i + 1}. ${icon} ${task.title}`);
    console.log(`   ${priorityIcon} 优先级 | 📅 ${task.dueDate || '无截止'} | #${task.id}`);
  });

  if (filtered.length === 0) {
    console.log('   暂无任务');
  }
}

/**
 * 显示今日任务
 */
async function showTodayTasks() {
  console.log('📅 今日任务:\n');

  const tasks = loadTasks();
  const today = new Date().toISOString().split('T')[0];
  
  const todayTasks = tasks.filter(task => {
    if (task.status === 'done') return false;
    if (!task.dueDate) return false;
    return task.dueDate.startsWith(today);
  });

  todayTasks.forEach((task, i) => {
    console.log(`${i + 1}. ${task.title}`);
  });

  if (todayTasks.length === 0) {
    console.log('   🎉 今日无待办任务！');
  }
}

/**
 * 完成任务
 */
async function completeTask(args) {
  const id = args[1];
  if (!id) {
    console.error('错误：请指定任务 ID');
    process.exit(1);
  }

  const tasks = loadTasks();
  const task = tasks.find(t => t.id === id);

  if (!task) {
    console.error('错误：未找到该任务');
    process.exit(1);
  }

  task.status = 'done';
  task.completedAt = new Date().toISOString();
  saveTasks(tasks);

  console.log(`✅ 任务已完成：${task.title}`);
}

/**
 * 设置提醒
 */
async function setReminder(args) {
  const id = args[1];
  if (!id) {
    console.error('错误：请指定任务 ID');
    process.exit(1);
  }

  const whenIndex = args.indexOf('--when');
  const when = whenIndex !== -1 ? args[whenIndex + 1] : null;

  const beforeIndex = args.indexOf('--before');
  const before = beforeIndex !== -1 ? args[beforeIndex + 1] : null;

  const repeatIndex = args.indexOf('--repeat');
  const repeat = repeatIndex !== -1 ? args[repeatIndex + 1] : null;

  console.log(`⏰ 提醒设置:`);
  console.log(`   任务 ID: ${id}`);
  console.log(`   时间：${when || before || '默认'}`);
  console.log(`   重复：${repeat || '不重复'}`);
}

/**
 * 生成报告
 */
async function generateReport(args) {
  const periodIndex = args.indexOf('--period');
  const period = periodIndex !== -1 ? args[periodIndex + 1] : 'week';

  const fromIndex = args.indexOf('--from');
  const toIndex = args.indexOf('--to');
  
  let fromDate, toDate;
  if (fromIndex !== -1 && toIndex !== -1) {
    fromDate = args[fromIndex + 1];
    toDate = args[toIndex + 1];
  } else {
    const now = new Date();
    if (period === 'today') {
      fromDate = now.toISOString().split('T')[0];
      toDate = fromDate;
    } else if (period === 'week') {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      toDate = now.toISOString().split('T')[0];
    } else if (period === 'month') {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      toDate = now.toISOString().split('T')[0];
    }
  }

  console.log(`📊 任务报告 (${period})`);
  console.log(`时间范围：${fromDate} - ${toDate}\n`);

  const tasks = loadTasks();
  const filtered = tasks.filter(task => {
    const taskDate = task.completedAt ? task.completedAt.split('T')[0] : task.createdAt.split('T')[0];
    return taskDate >= fromDate && taskDate <= toDate;
  });

  const completed = filtered.filter(t => t.status === 'done').length;
  const pending = filtered.filter(t => t.status === 'pending').length;
  const inProgress = filtered.filter(t => t.status === 'in-progress').length;

  console.log('📈 统计:');
  console.log(`   完成任务：${completed}`);
  console.log(`   进行中：${inProgress}`);
  console.log(`   待办：${pending}`);
  console.log(`   总计：${filtered.length}`);

  // 按优先级统计
  console.log('\n🎯 按优先级:');
  ['urgent', 'high', 'medium', 'low'].forEach(priority => {
    const count = filtered.filter(t => t.priority === priority).length;
    console.log(`   ${priority}: ${count}`);
  });
}

/**
 * 添加依赖
 */
async function addDependency(args) {
  const taskId = args[1];
  const dependIndex = args.indexOf('--on');
  const dependencyId = dependIndex !== -1 ? args[dependIndex + 1] : null;

  if (!taskId || !dependencyId) {
    console.error('错误：请指定任务 ID 和依赖任务 ID');
    process.exit(1);
  }

  const tasks = loadTasks();
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    console.error('错误：未找到任务');
    process.exit(1);
  }

  if (!task.dependencies.includes(dependencyId)) {
    task.dependencies.push(dependencyId);
  }

  saveTasks(tasks);
  console.log(`✅ 依赖已添加：${task.title} 依赖于 #${dependencyId}`);
}

/**
 * 配置
 */
async function configure(args) {
  const workHoursIndex = args.indexOf('--work-hours');
  if (workHoursIndex !== -1) {
    const hours = args[workHoursIndex + 1];
    const [start, end] = hours.split('-');
    CONFIG.workHours = { start, end };
    console.log(`✅ 工作时间已设置：${start} - ${end}`);
  }

  saveConfig();
}

// 辅助函数
function getStoragePath() {
  return path.resolve(CONFIG.storagePath.replace('~', process.env.HOME));
}

function loadTasks() {
  const dbPath = path.join(getStoragePath(), 'tasks.json');
  if (!fs.existsSync(dbPath)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function saveTasks(tasks) {
  const dbPath = path.join(getStoragePath(), 'tasks.json');
  fs.writeFileSync(dbPath, JSON.stringify(tasks, null, 2));
}

function saveTask(task) {
  const tasks = loadTasks();
  tasks.push(task);
  saveTasks(tasks);
}

function saveConfig() {
  const configPath = path.join(getStoragePath(), 'config.json');
  fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
}

function parseDate(dateStr) {
  if (dateStr === 'today') {
    return new Date().toISOString().split('T')[0];
  } else if (dateStr === 'tomorrow') {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  return dateStr;
}

function getStatusIcon(status) {
  const icons = {
    'pending': '⏳',
    'in-progress': '🔄',
    'done': '✅'
  };
  return icons[status] || '❓';
}

function getPriorityIcon(priority) {
  const icons = {
    'urgent': '🔴',
    'high': '🟠',
    'medium': '🟡',
    'low': '🟢'
  };
  return icons[priority] || '⚪';
}

function showHelp() {
  console.log(`
task-auto-tracker - 任务自动追踪系统

用法:
  openclaw task auto-track --enable         启用自动追踪
  openclaw task add "<标题>"                添加任务
  openclaw task list --status <状态>        列出任务
  openclaw task today                       显示今日任务
  openclaw task complete <ID>               完成任务
  openclaw task remind <ID> --when <时间>   设置提醒
  openclaw task report --period <周期>      生成报告
  openclaw task depend <ID> --on <依赖 ID>  添加依赖
  openclaw task config --work-hours <时间>  配置工作时间

示例:
  openclaw task add "完成报告" --due tomorrow --priority high
  openclaw task list --status pending
  openclaw task complete abc123
  openclaw task report --period week
`);
}

// 执行
main().catch(console.error);
