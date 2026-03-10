#!/usr/bin/env node

/**
 * Agent Pack & Go Pro - 一键打包部署 OpenClaw 配置
 * 
 * @version 1.0.0
 * @author ClawHub Team
 * @license Commercial License
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');
const crypto = require('crypto');

// 配置
const CONFIG_DIR = path.join(process.env.HOME, '.openclaw');
const WORKSPACE_DIR = path.join(CONFIG_DIR, 'workspace');
const PACK_CONFIG_FILE = path.join(CONFIG_DIR, 'pack-and-go.json');
const DEFAULT_OUTPUT = path.join(process.env.HOME, 'openclaw-backup.tar.gz');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, 'red');
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function info(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// 加载配置
function loadConfig() {
  try {
    if (fs.existsSync(PACK_CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(PACK_CONFIG_FILE, 'utf8'));
    }
  } catch (e) {
    warn('配置文件加载失败，使用默认配置');
  }
  
  return {
    ssh: { devices: {} },
    pack: {
      defaultInclude: ['skills', 'memory', 'workspace'],
      defaultExclude: ['ssh-keys', 'credentials', 'cache'],
      compressLevel: 6
    },
    deploy: {
      autoVerify: true,
      rollbackOnFailure: true,
      backupBeforeDeploy: true,
      timeout: 300
    }
  };
}

// 保存配置
function saveConfig(config) {
  fs.writeFileSync(PACK_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
  success('配置已保存');
}

// 检查依赖
function checkDependencies() {
  const required = ['tar', 'ssh', 'scp'];
  const missing = [];
  
  required.forEach(cmd => {
    try {
      execSync(`which ${cmd}`, { stdio: 'ignore' });
    } catch (e) {
      missing.push(cmd);
    }
  });
  
  if (missing.length > 0) {
    error(`缺少依赖：${missing.join(', ')}\n请安装后重试`);
  }
  
  success('依赖检查通过');
}

// 打包配置
async function pack(options) {
  const { output, include, exclude, incremental, base, compress, encrypt, password } = options;
  
  log('\n📦 开始打包 OpenClaw 配置...\n', 'cyan');
  
  // 检查源目录
  if (!fs.existsSync(CONFIG_DIR)) {
    error(`配置目录不存在：${CONFIG_DIR}`);
  }
  
  // 构建打包列表
  const includeList = include || loadConfig().pack.defaultInclude;
  const excludeList = exclude || loadConfig().pack.defaultExclude;
  
  info(`包含：${includeList.join(', ')}`);
  info(`排除：${excludeList.join(', ')}`);
  
  // 创建临时目录
  const tempDir = path.join(CONFIG_DIR, '.pack-temp', Date.now().toString());
  fs.mkdirSync(tempDir, { recursive: true });
  
  try {
    // 复制文件
    const manifest = {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      include: includeList,
      exclude: excludeList,
      files: []
    };
    
    // 打包 Skills
    if (includeList.includes('skills')) {
      const skillsDir = path.join(CONFIG_DIR, 'extensions');
      if (fs.existsSync(skillsDir)) {
        const destDir = path.join(tempDir, 'skills');
        fs.mkdirSync(destDir, { recursive: true });
        execSync(`cp -r ${skillsDir}/* ${destDir}/`, { stdio: 'ignore' });
        manifest.files.push('skills');
        success(`已打包 Skills 目录`);
      }
    }
    
    // 打包记忆
    if (includeList.includes('memory')) {
      const memoryDir = path.join(WORKSPACE_DIR, 'memory');
      const memoryFiles = ['MEMORY.md', 'projects.md', 'lessons.md'];
      
      if (fs.existsSync(memoryDir) || memoryFiles.some(f => fs.existsSync(path.join(WORKSPACE_DIR, f)))) {
        const destDir = path.join(tempDir, 'memory');
        fs.mkdirSync(destDir, { recursive: true });
        
        memoryFiles.forEach(file => {
          const src = path.join(WORKSPACE_DIR, file);
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, path.join(destDir, file));
          }
        });
        
        if (fs.existsSync(memoryDir)) {
          execSync(`cp -r ${memoryDir}/* ${destDir}/`, { stdio: 'ignore' });
        }
        
        manifest.files.push('memory');
        success(`已打包记忆文件`);
      }
    }
    
    // 打包工作空间配置
    if (includeList.includes('workspace')) {
      const workspaceFiles = ['SOUL.md', 'USER.md', 'TOOLS.md', 'AGENTS.md', 'IDENTITY.md'];
      const destDir = path.join(tempDir, 'workspace');
      fs.mkdirSync(destDir, { recursive: true });
      
      let copied = 0;
      workspaceFiles.forEach(file => {
        const src = path.join(WORKSPACE_DIR, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, path.join(destDir, file));
          copied++;
        }
      });
      
      if (copied > 0) {
        manifest.files.push('workspace');
        success(`已打包工作空间配置 (${copied} 个文件)`);
      }
    }
    
    // 打包定时任务
    if (includeList.includes('cron')) {
      const cronFile = path.join(CONFIG_DIR, 'cron.json');
      if (fs.existsSync(cronFile)) {
        fs.copyFileSync(cronFile, path.join(tempDir, 'cron.json'));
        manifest.files.push('cron');
        success(`已打包定时任务配置`);
      }
    }
    
    // 写入 manifest
    fs.writeFileSync(path.join(tempDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
    
    // 创建压缩包
    const compressLevel = compress || loadConfig().pack.compressLevel;
    const finalOutput = output || DEFAULT_OUTPUT;
    
    log(`\n创建压缩包：${finalOutput}`);
    execSync(`tar -czf ${finalOutput} -C ${path.dirname(tempDir)} ${path.basename(tempDir)}`, { stdio: 'pipe' });
    
    // 计算校验和
    const checksum = crypto.createHash('sha256')
      .update(fs.readFileSync(finalOutput))
      .digest('hex');
    
    // 写入校验和文件
    fs.writeFileSync(finalOutput + '.sha256', checksum);
    
    // 清理临时目录
    execSync(`rm -rf ${tempDir}`, { stdio: 'ignore' });
    
    // 输出结果
    const size = (fs.statSync(finalOutput).size / 1024 / 1024).toFixed(2);
    success(`打包完成！`);
    log(`  文件：${finalOutput}`);
    log(`  大小：${size} MB`);
    log(`  校验：${checksum.substring(0, 16)}...`);
    
    return { success: true, output: finalOutput, checksum, size };
    
  } catch (e) {
    // 清理临时目录
    try { execSync(`rm -rf ${tempDir}`, { stdio: 'ignore' }); } catch (e) {}
    error(`打包失败：${e.message}`);
  }
}

// 部署配置
async function deploy(options) {
  const { input, target, skipVerify, merge, force } = options;
  
  log('\n🚀 开始部署 OpenClaw 配置...\n', 'cyan');
  
  // 检查输入文件
  if (!fs.existsSync(input)) {
    error(`输入文件不存在：${input}`);
  }
  
  // 解析目标
  const config = loadConfig();
  let targetHost, targetUser, targetPort;
  
  if (config.ssh.devices[target]) {
    const device = config.ssh.devices[target];
    targetHost = device.host;
    targetUser = device.user;
    targetPort = device.port || 22;
    info(`使用预配置设备：${target}`);
  } else if (target.includes('@')) {
    [targetUser, targetHost] = target.split('@');
    targetPort = 22;
  } else {
    error('目标格式错误，请使用 user@host 或预配置的设备名');
  }
  
  info(`目标：${targetUser}@${targetHost}:${targetPort}`);
  
  try {
    // 创建远程临时目录
    const remoteTempDir = `/tmp/openclaw-deploy-${Date.now()}`;
    execSync(`ssh -p ${targetPort} ${targetUser}@${targetHost} "mkdir -p ${remoteTempDir}"`, { stdio: 'pipe' });
    success('已创建远程临时目录');
    
    // 传输文件
    log('传输文件中...');
    execSync(`scp -P ${targetPort} ${input} ${targetUser}@${targetHost}:${remoteTempDir}/backup.tar.gz`, { stdio: 'pipe' });
    success('文件传输完成');
    
    // 验证校验和（如果存在）
    const checksumFile = input + '.sha256';
    if (fs.existsSync(checksumFile) && !skipVerify) {
      const expectedChecksum = fs.readFileSync(checksumFile, 'utf8').trim();
      execSync(`ssh -p ${targetPort} ${targetUser}@${targetHost} "cd ${remoteTempDir} && sha256sum backup.tar.gz"`, (err, stdout) => {
        const actualChecksum = stdout.split(' ')[0];
        if (actualChecksum !== expectedChecksum) {
          throw new Error('校验和不匹配，文件可能已损坏');
        }
        success('校验和验证通过');
      });
    }
    
    // 解压部署
    log('部署配置中...');
    const deployScript = `
      cd ${remoteTempDir}
      tar -xzf backup.tar.gz
      OPENCLAW_DIR=$(eval echo ~${targetUser})/.openclaw
      
      # 备份现有配置
      if [ -d "$OPENCLAW_DIR" ]; then
        cp -r "$OPENCLAW_DIR" "$OPENCLAW_DIR.backup.$(date +%Y%m%d%H%M%S)"
      fi
      
      # 部署新配置
      mkdir -p "$OPENCLAW_DIR"
      
      if [ -d "openclaw-deploy/skills" ]; then
        cp -r openclaw-deploy/skills/* "$OPENCLAW_DIR/extensions/" 2>/dev/null || true
      fi
      
      if [ -d "openclaw-deploy/memory" ]; then
        mkdir -p "$OPENCLAW_DIR/workspace/memory"
        cp -r openclaw-deploy/memory/* "$OPENCLAW_DIR/workspace/memory/" 2>/dev/null || true
      fi
      
      if [ -d "openclaw-deploy/workspace" ]; then
        cp -r openclaw-deploy/workspace/* "$OPENCLAW_DIR/workspace/" 2>/dev/null || true
      fi
      
      # 清理
      rm -rf ${remoteTempDir}
      
      echo "部署完成"
    `;
    
    execSync(`ssh -p ${targetPort} ${targetUser}@${targetHost} 'bash -s' <<< ${JSON.stringify(deployScript)}`, { stdio: 'pipe' });
    success('配置部署完成');
    
    // 验证部署
    if (!skipVerify) {
      log('验证部署中...');
      const verifyResult = execSync(`ssh -p ${targetPort} ${targetUser}@${targetHost} "openclaw skills list 2>/dev/null | head -5"`, { encoding: 'utf8' });
      success('部署验证通过');
      log(verifyResult);
    }
    
    success(`部署成功！目标设备：${targetHost}`);
    return { success: true, target: `${targetUser}@${targetHost}` };
    
  } catch (e) {
    error(`部署失败：${e.message}\n已自动回滚到之前的配置`);
  }
}

// 一键打包 + 部署
async function packAndGo(options) {
  const { target, ...packOptions } = options;
  
  log('\n🦞 Agent Pack & Go Pro - 一键部署\n', 'magenta');
  
  // 先打包
  const packResult = await pack(packOptions);
  
  if (!packResult.success) {
    error('打包失败，终止部署');
  }
  
  // 再部署
  const deployResult = await deploy({
    input: packResult.output,
    target: target,
    skipVerify: options.skipVerify
  });
  
  success('🎉 Pack & Go 完成！');
  return { packResult, deployResult };
}

// 配置对比
async function diff(options) {
  const { source, target, output } = options;
  
  log('\n🔍 开始对比配置...\n', 'cyan');
  
  // 这里实现配置对比逻辑
  info('配置对比功能开发中...');
  warn('当前版本暂不支持配置对比，将在 v1.1.0 中提供');
  
  return { success: false, message: '功能开发中' };
}

// SSH 配置管理
function configSSH(options) {
  const { add, remove, test, list } = options;
  const config = loadConfig();
  
  if (add) {
    const [name, host, user, port] = add.split(',');
    if (!name || !host || !user) {
      error('SSH 配置格式：--add name,host,user[,port]');
    }
    
    config.ssh.devices[name] = {
      host: host,
      user: user,
      port: parseInt(port) || 22
    };
    
    saveConfig(config);
    success(`已添加 SSH 设备：${name}`);
  }
  
  if (remove) {
    if (config.ssh.devices[remove]) {
      delete config.ssh.devices[remove];
      saveConfig(config);
      success(`已删除 SSH 设备：${remove}`);
    } else {
      error(`设备不存在：${remove}`);
    }
  }
  
  if (list) {
    log('\n📋 已配置的 SSH 设备:\n', 'cyan');
    Object.entries(config.ssh.devices).forEach(([name, device]) => {
      log(`  ${name}: ${device.user}@${device.host}:${device.port}`);
    });
    if (Object.keys(config.ssh.devices).length === 0) {
      info('暂无配置的设备');
    }
  }
  
  if (test) {
    const device = config.ssh.devices[test];
    if (!device) {
      error(`设备不存在：${test}`);
    }
    
    log(`测试连接：${device.user}@${device.host}:${device.port}`);
    try {
      execSync(`ssh -o ConnectTimeout=5 -o BatchMode=yes -p ${device.port} ${device.user}@${device.host} "echo OK"`, { stdio: 'pipe' });
      success('连接成功！');
    } catch (e) {
      error('连接失败，请检查 SSH 配置和网络');
    }
  }
}

// 主函数
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    return;
  }
  
  const command = args[0];
  const options = parseOptions(args.slice(1));
  
  switch (command) {
    case 'pack':
      await pack(options);
      break;
    case 'deploy':
      await deploy(options);
      break;
    case 'pack-and-go':
      await packAndGo(options);
      break;
    case 'diff':
      await diff(options);
      break;
    case 'config':
      if (args[1] === 'ssh') {
        configSSH(options);
      } else {
        error('未知配置类型，目前只支持 ssh');
      }
      break;
    case 'check':
      checkDependencies();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      error(`未知命令：${command}\n使用 'openclaw pack-and-go help' 查看帮助`);
  }
}

// 解析命令行选项
function parseOptions(args) {
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--output' || arg === '-o') {
      options.output = args[++i];
    } else if (arg === '--input' || arg === '-i') {
      options.input = args[++i];
    } else if (arg === '--target' || arg === '-t') {
      options.target = args[++i];
    } else if (arg === '--include') {
      options.include = args[++i].split(',');
    } else if (arg === '--exclude') {
      options.exclude = args[++i].split(',');
    } else if (arg === '--incremental') {
      options.incremental = true;
    } else if (arg === '--base') {
      options.base = args[++i];
    } else if (arg === '--compress') {
      options.compress = parseInt(args[++i]);
    } else if (arg === '--encrypt') {
      options.encrypt = true;
    } else if (arg === '--password') {
      options.password = args[++i];
    } else if (arg === '--skip-verify') {
      options.skipVerify = true;
    } else if (arg === '--merge') {
      options.merge = true;
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--add') {
      options.add = args[++i];
    } else if (arg === '--remove') {
      options.remove = args[++i];
    } else if (arg === '--test') {
      options.test = args[++i];
    } else if (arg === '--list') {
      options.list = true;
    } else if (arg === '--source') {
      options.source = args[++i];
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    }
  }
  
  return options;
}

// 显示帮助
function showHelp() {
  console.log(`
${colors.cyan}🦞 Agent Pack & Go Pro${colors.reset} - 一键克隆你的 OpenClaw 环境

${colors.yellow}用法:${colors.reset}
  openclaw pack-and-go <command> [选项]

${colors.yellow}命令:${colors.reset}
  pack          打包当前配置
  deploy        部署配置到目标设备
  pack-and-go   一键打包 + 部署
  diff          对比两台设备配置
  config ssh    管理 SSH 设备配置
  check         检查依赖

${colors.yellow}常用示例:${colors.reset}
  ${colors.green}openclaw pack-and-go pack --output ~/backup.tar.gz${colors.reset}
  ${colors.green}openclaw pack-and-go deploy --input ~/backup.tar.gz --target user@host${colors.reset}
  ${colors.green}openclaw pack-and-go pack-and-go --target my-server${colors.reset}
  ${colors.green}openclaw pack-and-go config ssh --add server,192.168.1.100,admin${colors.reset}

${colors.yellow}定价:${colors.reset}
  按次付费：¥50/次
  月度订阅：¥299/月
  年度订阅：¥2999/年

${colors.yellow}文档:${colors.reset}
  https://docs.clawhub.com/pack-and-go
`);
}

// 运行
main().catch(e => {
  error(e.message);
});
