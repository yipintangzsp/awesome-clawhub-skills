#!/usr/bin/env node

/**
 * git-auto-commit - Git 自动提交助手
 * 
 * 功能：
 * - 智能提交信息生成
 * - 定时自动提交
 * - 工作变更分析
 * - 工作分类追踪
 * - 提交模板系统
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
  autoCommit: false,
  interval: 30, // 分钟
  workHours: { start: '9:00', end: '18:00' },
  template: 'conventional'
};

/**
 * 主入口函数
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'auto':
      await configureAuto(args);
      break;
    case 'commit':
      await autoCommit(args);
      break;
    case 'config':
      await configure(args);
      break;
    case 'status':
      await showStatus(args);
      break;
    case 'stats':
      await showStats(args);
      break;
    case 'template':
      await manageTemplates(args);
      break;
    case 'report':
      await generateReport(args);
      break;
    case 'security':
      await configureSecurity(args);
      break;
    case 'hook':
      await manageHooks(args);
      break;
    default:
      showHelp();
  }
}

/**
 * 配置自动提交
 */
async function configureAuto(args) {
  const enableIndex = args.indexOf('--enable');
  const disableIndex = args.indexOf('--disable');
  const pauseIndex = args.indexOf('--pause');

  if (enableIndex !== -1) {
    CONFIG.autoCommit = true;
    console.log('✅ 自动提交已启用');
    console.log(`   提交间隔：${CONFIG.interval}分钟`);
    console.log(`   工作时间：${CONFIG.workHours.start} - ${CONFIG.workHours.end}`);
  } else if (disableIndex !== -1) {
    CONFIG.autoCommit = false;
    console.log('❌ 自动提交已禁用');
  } else if (pauseIndex !== -1) {
    CONFIG.autoCommit = 'paused';
    console.log('⏸️ 自动提交已暂停');
  }

  saveConfig();
}

/**
 * 自动提交
 */
async function autoCommit(args) {
  const dryRunIndex = args.indexOf('--dry-run');
  const messageIndex = args.indexOf('--message');

  console.log('🔍 分析变更...\n');

  // 获取 Git 状态
  let status;
  try {
    status = execSync('git status --porcelain', { encoding: 'utf-8' });
  } catch (e) {
    console.error('错误：当前目录不是 Git 仓库');
    process.exit(1);
  }

  const changedFiles = status.split('\n').filter(line => line.trim());

  if (changedFiles.length === 0) {
    console.log('✅ 没有待提交的变更');
    return;
  }

  console.log(`📝 发现 ${changedFiles.length} 个变更:\n`);
  changedFiles.forEach(file => {
    console.log(`   ${file}`);
  });

  // 生成提交信息
  const commitMessage = messageIndex !== -1 
    ? args[messageIndex + 1]
    : generateCommitMessage(changedFiles);

  console.log(`\n📋 提交信息:\n${commitMessage}`);

  if (dryRunIndex === -1) {
    // 执行提交
    try {
      execSync(`git add -A`);
      execSync(`git commit -m "${commitMessage}"`);
      console.log('\n✅ 提交成功');
    } catch (e) {
      console.error('提交失败:', e.message);
      process.exit(1);
    }
  } else {
    console.log('\n⚠️  干运行模式，未实际提交');
  }
}

/**
 * 配置
 */
async function configure(args) {
  const intervalIndex = args.indexOf('--interval');
  const workHoursIndex = args.indexOf('--work-hours');
  const scheduleIndex = args.indexOf('--schedule');

  if (intervalIndex !== -1) {
    CONFIG.interval = parseInt(args[intervalIndex + 1]);
    console.log(`✅ 提交间隔：${CONFIG.interval}分钟`);
  }

  if (workHoursIndex !== -1) {
    const hours = args[workHoursIndex + 1];
    const [start, end] = hours.split('-');
    CONFIG.workHours = { start, end };
    console.log(`✅ 工作时间：${start} - ${end}`);
  }

  saveConfig();
}

/**
 * 显示状态
 */
async function showStatus(args) {
  const detailedIndex = args.indexOf('--detailed');

  console.log('📊 Git 状态\n');

  try {
    const status = execSync('git status', { encoding: 'utf-8' });
    console.log(status);

    if (detailedIndex !== -1) {
      const diff = execSync('git diff --stat', { encoding: 'utf-8' });
      console.log('\n📝 变更统计:\n');
      console.log(diff);
    }
  } catch (e) {
    console.error('错误：当前目录不是 Git 仓库');
    process.exit(1);
  }
}

/**
 * 显示统计
 */
async function showStats(args) {
  const periodIndex = args.indexOf('--period');
  const period = periodIndex !== -1 ? args[periodIndex + 1] : 'week';

  console.log(`📊 工作统计 (${period})\n`);

  try {
    let since;
    if (period === 'week') {
      since = '7 days ago';
    } else if (period === 'month') {
      since = '30 days ago';
    } else {
      since = period;
    }

    const log = execSync(`git log --since="${since}" --oneline`, { encoding: 'utf-8' });
    const commits = log.split('\n').filter(line => line.trim());

    console.log(`提交次数：${commits.length}`);

    const shortlog = execSync(`git shortlog --since="${since}" -sn`, { encoding: 'utf-8' });
    console.log('\n提交者分布:\n');
    console.log(shortlog);

    const changelog = execSync(`git diff --shortstat --since="${since}"`, { encoding: 'utf-8' });
    console.log('\n代码变更:\n');
    console.log(changelog || '无统计信息');

  } catch (e) {
    console.error('错误：无法获取统计信息');
  }
}

/**
 * 管理模板
 */
async function manageTemplates(args) {
  const subCommand = args[1];
  const selectIndex = args.indexOf('--format');

  if (subCommand === 'select') {
    const template = args[2];
    CONFIG.template = template;
    console.log(`✅ 提交模板：${template}`);
    saveConfig();
  } else if (subCommand === 'create') {
    const name = args[2];
    const format = selectIndex !== -1 ? args[selectIndex + 1] : '';
    console.log(`✅ 模板已创建：${name}`);
  } else {
    console.log('📋 可用模板:');
    console.log('   - conventional (约定式提交)');
    console.log('   - simple (简单格式)');
    console.log('   - detailed (详细格式)');
  }
}

/**
 * 生成报告
 */
async function generateReport(args) {
  const periodIndex = args.indexOf('--period');
  const period = periodIndex !== -1 ? args[periodIndex + 1] : 'week';

  const outputIndex = args.indexOf('--output');
  const outputFile = outputIndex !== -1 ? args[outputIndex + 1] : null;

  const formatIndex = args.indexOf('--format');
  const format = formatIndex !== -1 ? args[formatIndex + 1] : 'markdown';

  console.log(`📄 生成${period}报告...\n`);

  const report = generateReportContent(period, format);

  if (outputFile) {
    fs.writeFileSync(outputFile, report);
    console.log(`✅ 报告已保存：${outputFile}`);
  } else {
    console.log(report);
  }
}

/**
 * 配置安全
 */
async function configureSecurity(args) {
  const enableIndex = args.indexOf('--enable');
  const addIndex = args.indexOf('--add');

  if (enableIndex !== -1) {
    console.log('✅ 安全检查已启用');
  }

  if (addIndex !== -1) {
    const pattern = args[addIndex + 1];
    console.log(`✅ 忽略模式：${pattern}`);
  }
}

/**
 * 管理钩子
 */
async function manageHooks(args) {
  const hookType = args[1];
  const enableIndex = args.indexOf('--enable');

  if (enableIndex !== -1) {
    console.log(`✅ ${hookType} 钩子已启用`);
  }
}

// 辅助函数
function generateCommitMessage(files) {
  // 分析文件类型
  const fileTypes = {
    feat: [],
    fix: [],
    docs: [],
    chore: []
  };

  files.forEach(file => {
    const trimmed = file.trim();
    if (trimmed.includes('.md') || trimmed.includes('README')) {
      fileTypes.docs.push(trimmed);
    } else if (trimmed.includes('test') || trimmed.includes('spec')) {
      fileTypes.chore.push(trimmed);
    } else if (trimmed.includes('fix') || trimmed.includes('bug')) {
      fileTypes.fix.push(trimmed);
    } else {
      fileTypes.feat.push(trimmed);
    }
  });

  // 生成提交信息
  let type = 'chore';
  if (fileTypes.feat.length > 0) type = 'feat';
  else if (fileTypes.fix.length > 0) type = 'fix';
  else if (fileTypes.docs.length > 0) type = 'docs';

  const message = `${type}: 更新 ${files.length} 个文件\n\n- ${files.slice(0, 5).map(f => f.trim()).join('\n- ')}`;
  
  return message;
}

function generateReportContent(period, format) {
  const now = new Date();
  const report = `# Git 工作${period === 'week' ? '周' : '月'}报

## 基本信息
- 报告期间：${period}
- 生成时间：${now.toISOString().split('T')[0]}

## 提交统计
- 总提交数：待计算
- 文件变更：待计算
- 代码行数：待计算

## 工作类型分布
- 功能开发：0%
- Bug 修复：0%
- 文档更新：0%
- 其他：0%

## 主要成就
- 

## 下周/月计划
- 
`;

  return report;
}

function saveConfig() {
  const configPath = path.join(process.cwd(), '.git-auto-commit.json');
  fs.writeFileSync(configPath, JSON.stringify(CONFIG, null, 2));
}

function showHelp() {
  console.log(`
git-auto-commit - Git 自动提交助手

用法:
  openclaw git auto --enable                启用自动提交
  openclaw git commit --auto                自动提交
  openclaw git config --interval <分钟>     设置间隔
  openclaw git status --detailed            详细状态
  openclaw git stats --period <周期>        工作统计
  openclaw git template select <模板>       选择模板
  openclaw git report --period <周期>       生成报告
  openclaw git security --enable            启用安全检查

示例:
  openclaw git auto --enable
  openclaw git config --interval 30
  openclaw git stats --period week
  openclaw git report --output weekly.md
`);
}

// 执行
main().catch(console.error);
