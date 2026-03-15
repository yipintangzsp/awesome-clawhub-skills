# OpenClaw 全指令速查手册

_来源：AI 生成 | 适用版本：2026.3.x_

---

## 🚀 快速安装与核心 CLI

```bash
# 一键安装
curl -fsSL openclaw.ai/install.sh | bash

# 安装守护进程
openclaw onboard --install-daemon

# 深度诊断
openclaw doctor --deep --yes

# 查看日志
openclaw logs --follow

# 重启网关
openclaw gateway restart

# 打开控制面板
openclaw dashboard
```

---

## ⚙️ 基础配置

### openclaw.json 核心配置

```json
{
  "identity": {
    "name": "OpenClaw",
    "emoji": "🦞"
  },
  "agent": {
    "model": {
      "primary": "anthropic/claude-sonnet-4-6"
    },
    "heartbeat": {
      "every": "30m",
      "target": "last"
    }
  },
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "..."
    }
  }
}
```

**支持回退链 fallbacks**：遇速率限制自动切换模型

**修改配置后**：
```bash
openclaw config validate
openclaw gateway restart
```

---

## 📁 工作区文件

路径：`~/.openclaw/workspace/`

| 文件 | 作用 | 加载时机 |
|------|------|---------|
| `AGENTS.md` | 操作指令、优先级、工作流规则 | 每次会话 |
| `SOUL.md` | 性格、语气、价值观、行为约束 | 每次会话 |
| `USER.md` | 用户称呼、偏好、风格 | 每次会话 |
| `TOOLS.md` | 本地工具说明与使用约定 | 每次会话 |
| `HEARTBEAT.md` | 心跳检查清单 | 仅心跳时 |
| `MEMORY.md` | 长期精选记忆与事实 | 仅主 DM |

---

## 💬 高频交互指令

### 会话管理
| 指令 | 作用 |
|------|------|
| `/status` | 模型、上下文、队列、API 用量 |
| `/new [model]` | 全新会话，清空上下文 |
| `/compact` | 总结上下文，释放 Token |
| `/stop` | 中止当前任务，清空队列 |

### 模型控制
| 指令 | 作用 |
|------|------|
| `/reasoning low\|high\|adaptive` | 推理深度调节 |
| `/model [id]` | 运行时切换模型 |
| `/fast` | 快速模式开关 |

### 子 Agent 管理
```bash
/subagents spawn
/subagents list
/subagents kill
```

### 自然语言停止
也有效：`"stop openclaw"` / `"请停止"`

---

## 🧠 记忆与定时

### 记忆系统
- 达 **40k tokens** 自动总结写入每日日志
- 向量检索支持多语言
- 心跳默认 **30 分钟**
- 返回 `HEARTBEAT_OK` 则静默不打扰

### 定时任务
- Cron 在 `cron/jobs.json` 定义
- 指向隔离会话，不干扰对话

---

## 🔒 安全底线

| 配置 | 说明 |
|------|------|
| **私聊** | 开启 `pairing` 配对认证 |
| **群组** | 用 `allowlist` 白名单 |
| **敏感指令** | `/config` `/debug` 仅 Owner 可调用 |
| **工作区插件** | 默认不自动加载，须显式信任 |
| **技能审查** | 警惕 `curl|bash`、`base64`、零宽 Unicode |

---

## 🔧 排障万能公式

```bash
# 解决 80% 问题
openclaw doctor --deep --yes

# 上下文满
/compact

# 通道掉线
channels status --probe

# 无响应
openclaw logs --follow

# 更新
sudo npm i -g openclaw@latest && openclaw gateway restart
```

---

*最后更新：2026-03-15*
