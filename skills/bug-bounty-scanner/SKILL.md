# bug-bounty-scanner - 漏洞扫描器

## 描述
自动化漏洞扫描工具，支持 Web 应用、API、智能合约的常见漏洞检测。生成专业报告，辅助 Bug Bounty 提交。

## 定价
- **按次收费**: ¥49/次
- 每次扫描最多 10 个目标
- 包含漏洞报告生成

## 用法
```bash
# 扫描 Web 应用
/bug-bounty-scanner --target https://example.com --type web

# 扫描 API
/bug-bounty-scanner --target https://api.example.com --type api

# 扫描智能合约
/bug-bounty-scanner --target 0x... --type contract

# 生成报告
/bug-bounty-scanner --report --format markdown
```

## 技能目录
`~/.openclaw/workspace/skills/bug-bounty-scanner/`

## 作者
张 sir

## 版本
1.0.0
