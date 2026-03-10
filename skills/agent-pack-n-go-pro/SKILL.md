# Agent Pack & Go Pro - SkillPay 收费技能

## 描述
一键打包你的 OpenClaw 配置（SSH 连接、记忆文件、Skills、定时任务），安全传输到目标设备并自动部署验证。支持多设备同步、增量备份、配置对比。

**适用场景：**
- 多设备工作环境切换
- 团队协作配置分发
- 客户交付标准化环境
- 灾备恢复快速重建

## 定价
- **按次付费**: ¥50/次（单次打包 + 部署）
- **月度订阅**: ¥299/月（无限次打包 + 优先支持）
- **年度订阅**: ¥2999/年（省¥589 + 专属配置顾问）

## 用法

### 基础命令
```bash
# 打包当前配置
openclaw pack --output ~/openclaw-backup-20260309.tar.gz

# 部署到目标设备
openclaw deploy --input ~/openclaw-backup-20260309.tar.gz --target user@192.168.1.100

# 一键打包 + 部署（推荐）
openclaw pack-and-go --target user@192.168.1.100
```

### 高级选项
```bash
# 选择性打包（只打包 Skills 和记忆）
openclaw pack --include skills,memory --exclude ssh-keys

# 增量备份（只传输变更部分）
openclaw pack --incremental --base ~/previous-backup.tar.gz

# 配置对比（查看两台设备差异）
openclaw diff --source device-a --target device-b
```

### 定时任务集成
```bash
# 添加每日自动备份
openclaw cron add "0 2 * * *" "pack-and-go --target backup-server"

# 查看定时任务
openclaw cron list
```

## 安全特性
- ✅ SSH 密钥加密传输
- ✅ 配置文件脱敏处理
- ✅ 传输完整性校验（SHA256）
- ✅ 部署前环境预检
- ✅ 回滚机制（部署失败自动恢复）

## 技术支持
- 订阅用户专属微信群
- 48 小时内响应
- 远程协助部署（企业版）

## 版本历史
- v1.0.0 (2026-03-09) - 初始发布
