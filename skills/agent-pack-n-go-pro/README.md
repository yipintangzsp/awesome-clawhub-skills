# Agent Pack & Go Pro

> 🦞 一键克隆你的 OpenClaw 环境到任何设备

[![SkillPay](https://img.shields.io/badge/SkillPay-收费技能-blue)](https://clawhub.com)
[![版本](https://img.shields.io/badge/版本-1.0.0-green)](https://github.com/openclaw/agent-pack-n-go)
[![许可](https://img.shields.io/badge/许可-商业许可-orange)](https://clawhub.com/license)

---

## 📖 目录

1. [功能特性](#-功能特性)
2. [快速开始](#-快速开始)
3. [详细用法](#-详细用法)
4. [配置选项](#-配置选项)
5. [安全说明](#-安全说明)
6. [故障排除](#-故障排除)
7. [定价方案](#-定价方案)
8. [常见问题](#-常见问题)

---

## ✨ 功能特性

### 核心能力

| 功能 | 描述 | 状态 |
|------|------|------|
| **SSH 连接配置** | 安全存储和管理多台设备 SSH 凭据 | ✅ |
| **配置打包** | 一键打包 Skills、记忆、定时任务、环境变量 | ✅ |
| **增量备份** | 只传输变更部分，节省带宽和时间 | ✅ |
| **自动部署** | 目标设备自动解压、配置、验证 | ✅ |
| **配置对比** | 可视化对比两台设备的配置差异 | ✅ |
| **回滚机制** | 部署失败自动恢复到之前状态 | ✅ |
| **定时任务** | 支持 cron 表达式自动备份 | ✅ |
| **多设备管理** | 同时管理多个目标设备配置 | ✅ |

### 打包内容

```
openclaw-backup/
├── skills/              # 已安装的 Skills
│   └── [skill-name]/
├── memory/              # 记忆文件
│   ├── MEMORY.md
│   ├── projects.md
│   ├── lessons.md
│   └── YYYY-MM-DD.md
├── workspace/           # 工作空间配置
│   ├── SOUL.md
│   ├── USER.md
│   ├── TOOLS.md
│   └── AGENTS.md
├── cron/                # 定时任务配置
│   └── crontab.json
├── ssh/                 # SSH 配置（可选）
│   └── config
└── manifest.json        # 备份元数据
```

---

## 🚀 快速开始

### 前置要求

- OpenClaw v2.0+
- Node.js v18+
- SSH 访问目标设备（如需部署）
- SkillPay 账户（付费功能）

### 安装

```bash
# 通过 ClawHub 安装
openclaw skills install agent-pack-n-go-pro

# 验证安装
openclaw skills list | grep agent-pack
```

### 首次使用

```bash
# 1. 配置 SSH 目标设备（可选）
openclaw pack config ssh --add my-server --host 192.168.1.100 --user admin

# 2. 打包当前配置
openclaw pack --output ~/backup.tar.gz

# 3. 部署到新设备
openclaw deploy --input ~/backup.tar.gz --target admin@my-server

# 4. 验证部署
openclaw deploy verify --target admin@my-server
```

---

## 📚 详细用法

### 打包命令 (pack)

```bash
# 基础打包
openclaw pack --output ~/backup.tar.gz

# 选择性打包
openclaw pack \
  --include skills,memory,workspace \
  --exclude ssh-keys,credentials \
  --output ~/backup.tar.gz

# 增量打包（基于之前的备份）
openclaw pack \
  --incremental \
  --base ~/previous-backup.tar.gz \
  --output ~/new-backup.tar.gz

# 压缩级别（1-9，默认 6）
openclaw pack --compress 9 --output ~/backup.tar.gz
```

### 部署命令 (deploy)

```bash
# 基础部署
openclaw deploy --input ~/backup.tar.gz --target user@host

# 部署到命名设备（需先配置）
openclaw deploy --input ~/backup.tar.gz --target my-server

# 跳过验证（加快速度）
openclaw deploy --input ~/backup.tar.gz --target user@host --skip-verify

# 保留原配置（不覆盖）
openclaw deploy --input ~/backup.tar.gz --target user@host --merge

# 强制覆盖（危险！）
openclaw deploy --input ~/backup.tar.gz --target user@host --force
```

### 一键打包 + 部署 (pack-and-go)

```bash
# 最简用法
openclaw pack-and-go --target user@host

# 带选项
openclaw pack-and-go \
  --target my-server \
  --include skills,memory \
  --verify \
  --rollback-on-failure
```

### 配置对比 (diff)

```bash
# 对比两台设备
openclaw diff --source device-a --target device-b

# 对比本地和远程
openclaw diff --source local --target user@host

# 输出详细报告
openclaw diff --source device-a --target device-b --output report.md
```

### 定时任务 (cron)

```bash
# 添加每日备份任务
openclaw cron add "0 2 * * *" "pack-and-go --target backup-server"

# 添加每周完整备份
openclaw cron add "0 3 * * 0" "pack --output ~/weekly-backup.tar.gz"

# 查看任务列表
openclaw cron list

# 删除任务
openclaw cron remove <task-id>

# 暂停/恢复任务
openclaw cron pause <task-id>
openclaw cron resume <task-id>
```

---

## ⚙️ 配置选项

### 配置文件位置

```bash
~/.openclaw/pack-and-go.json
```

### 配置示例

```json
{
  "ssh": {
    "devices": {
      "home-server": {
        "host": "192.168.1.100",
        "user": "admin",
        "port": 22,
        "key": "~/.ssh/id_ed25519"
      },
      "work-laptop": {
        "host": "work.example.com",
        "user": "zhang",
        "port": 2222
      }
    }
  },
  "pack": {
    "defaultInclude": ["skills", "memory", "workspace"],
    "defaultExclude": ["ssh-keys", "credentials", "cache"],
    "compressLevel": 6,
    "encryptBackup": true
  },
  "deploy": {
    "autoVerify": true,
    "rollbackOnFailure": true,
    "backupBeforeDeploy": true,
    "timeout": 300
  },
  "notifications": {
    "enabled": true,
    "channel": "feishu",
    "onSuccess": true,
    "onFailure": true
  }
}
```

---

## 🔒 安全说明

### 加密传输

所有备份文件支持 AES-256 加密：

```bash
# 加密打包
openclaw pack --encrypt --password "your-secure-password" --output backup.tar.gz

# 解密部署
openclaw deploy --input backup.tar.gz --decrypt --password "your-secure-password"
```

### 敏感信息处理

以下文件默认**不打包**：
- SSH 私钥（`~/.ssh/id_*`）
- API 密钥（`*.env`, `*key*`）
- 数据库凭据
- 第三方服务 token

如需包含，请显式指定：
```bash
openclaw pack --include ssh-keys --output backup.tar.gz
```

### 完整性校验

每次传输自动计算 SHA256 校验和：
```bash
# 手动验证
openclaw verify --input backup.tar.gz --checksum abc123...
```

---

## 🐛 故障排除

### 常见问题

#### 1. SSH 连接失败
```bash
# 测试 SSH 连接
ssh -i ~/.ssh/id_ed25519 user@host

# 添加 SSH 密钥到代理
ssh-add ~/.ssh/id_ed25519

# 检查 SSH 配置
openclaw pack config ssh --test my-server
```

#### 2. 打包失败
```bash
# 查看详细日志
openclaw pack --verbose --output backup.tar.gz

# 检查磁盘空间
df -h ~/.openclaw

# 排除大文件
openclaw pack --exclude cache,tmp --output backup.tar.gz
```

#### 3. 部署验证失败
```bash
# 跳过验证（不推荐）
openclaw deploy --skip-verify --input backup.tar.gz --target user@host

# 手动验证
openclaw deploy verify --target user@host --detailed
```

#### 4. 回滚触发
```bash
# 查看回滚日志
openclaw deploy logs --target user@host

# 手动回滚
openclaw deploy rollback --target user@host --to backup-20260309
```

### 获取帮助

```bash
# 查看帮助
openclaw pack --help
openclaw deploy --help

# 提交问题
openclaw support ticket --subject "Deploy failed" --logs
```

---

## 💰 定价方案

| 方案 | 价格 | 功能 | 适合人群 |
|------|------|------|----------|
| **按次付费** | ¥50/次 | 基础打包 + 部署 | 偶尔使用 |
| **月度订阅** | ¥299/月 | 无限次 + 优先支持 + 配置对比 | 频繁使用者 |
| **年度订阅** | ¥2999/年 | 月度全部 + 专属顾问 + 远程协助 | 企业用户 |

### 订阅权益对比

| 权益 | 按次 | 月度 | 年度 |
|------|------|------|------|
| 打包次数 | 1 次/付费 | 无限 | 无限 |
| 部署次数 | 1 次/付费 | 无限 | 无限 |
| 配置对比 | ❌ | ✅ | ✅ |
| 增量备份 | ❌ | ✅ | ✅ |
| 优先支持 | ❌ | ✅ | ✅ |
| 专属顾问 | ❌ | ❌ | ✅ |
| 远程协助 | ❌ | ❌ | ✅ (2 次/年) |
| SLA | - | 48h | 24h |

---

## ❓ 常见问题

### Q: 支持哪些操作系统？
A: 支持 macOS、Linux (Ubuntu/Debian/CentOS)、Windows (WSL2)。

### Q: 可以只备份部分 Skills 吗？
A: 可以，使用 `--include` 指定具体 Skill 名称：
```bash
openclaw pack --include skills:github,skills:weather --output backup.tar.gz
```

### Q: 部署失败会丢失原有配置吗？
A: 不会。默认会在部署前自动备份原配置，失败时自动回滚。

### Q: 如何取消订阅？
A: 联系 SkillPay 客服或发送邮件至 support@clawhub.com。

### Q: 支持团队协作吗？
A: 企业版支持多用户共享配置库，联系销售获取详情。

### Q: 备份文件存储在哪里？
A: 默认存储在你指定的本地路径。企业版支持自动同步到云存储（S3/OSS）。

---

## 📞 联系我们

- **官网**: https://clawhub.com/skills/agent-pack-n-go-pro
- **文档**: https://docs.clawhub.com/pack-and-go
- **支持**: support@clawhub.com
- **微信群**: 订阅后自动邀请

---

*最后更新：2026-03-09 | 版本：1.0.0*
