# github-bounty-hunter - GitHub 赏金猎人

## 描述
自动扫描 GitHub Bounty 项目，匹配你的技能栈，生成定制化投标方案。支持按技术栈、奖金范围、难度筛选。

## 定价
- **按次收费**: ¥29/次
- 每次扫描最多 50 个 Bounty 项目
- 包含投标模板生成

## 用法
```bash
# 扫描所有 Bounty
/github-bounty-hunter

# 按技术栈筛选
/github-bounty-hunter --stack javascript,python --min-bounty 500

# 生成投标模板
/github-bounty-hunter --issue-url https://github.com/xxx/yyy/issues/123 --bid-template
```

## 技能目录
`~/.openclaw/workspace/skills/github-bounty-hunter/`

## 作者
张 sir

## 版本
1.0.0
