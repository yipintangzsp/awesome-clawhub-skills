# Bug Bounty Scanner 🐛

自动化漏洞扫描工具，帮助你发现安全漏洞，提高 Bug Bounty 收益。

## 功能特性

- 🌐 **Web 扫描**: XSS, SQL 注入，CSRF, SSRF 等
- 🔌 **API 扫描**: 认证绕过，越权访问，数据泄露
- 📜 **合约扫描**: 重入攻击，溢出，权限漏洞
- 📊 **报告生成**: 专业格式，可直接提交
- 🎯 **误报过滤**: AI 辅助验证，减少误报

## 支持的漏洞类型

### Web 应用
- XSS (反射型/存储型/DOM 型)
- SQL 注入
- CSRF
- SSRF
- 文件上传漏洞
- 目录遍历
- 敏感信息泄露

### API
- 认证绕过
- 水平/垂直越权
- 速率限制缺失
- 数据泄露
- 注入漏洞

### 智能合约
- 重入攻击
- 整数溢出
- 权限控制问题
- 逻辑漏洞

## 使用示例

### 扫描 Web 应用
```
/bug-bounty-scanner --target https://target.com --type web --depth 3
```

### 扫描 API
```
/bug-bounty-scanner --target https://api.target.com --type api --auth "Bearer xxx"
```

### 生成报告
```
/bug-bounty-scanner --scan-id xxx --report --format markdown
```

## 输出报告格式

```markdown
# 漏洞扫描报告

## 概览
- 扫描目标：https://example.com
- 扫描时间：2026-03-09
- 发现漏洞：5 个 (高危 2, 中危 2, 低危 1)

## 高危漏洞

### 1. SQL 注入
- **位置**: /api/users?id=
- **描述**: 参数未正确过滤，可执行 SQL 注入
- **复现步骤**: ...
- **建议修复**: 使用参数化查询
```

## 定价说明

- ¥49/次：单次扫描 + 报告生成
- ¥399/月：无限次扫描 + 优先支持
- 企业定制：联系 @张 sir

## 免责声明

⚠️ 仅用于授权的安全测试
⚠️ 未经授权的扫描可能违法
⚠️ 使用者承担全部责任

## 支持

联系 @张 sir
