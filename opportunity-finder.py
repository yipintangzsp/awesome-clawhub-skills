#!/usr/bin/env python3
"""
opportunity-finder.py - 市场机会发现工具
功能：发现市场空白、生成差异化建议、创建对标 Skill 方案
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from collections import defaultdict
import re

class OpportunityFinder:
    def __init__(self, data_dir, timestamp):
        self.data_dir = Path(data_dir)
        self.timestamp = timestamp
        self.skills = []
        self.categories = defaultdict(list)
        self.opportunities = []
        self.skill_templates = []
    
    def load_data(self):
        """加载市场分析报告和技能数据"""
        print(f"[*] 加载数据...")
        
        # 加载所有 JSON 数据
        pattern_files = list(self.data_dir.glob(f"*_{self.timestamp}.json"))
        
        for file_path in pattern_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    json_start = content.find('[')
                    json_end = content.rfind(']') + 1
                    if json_start >= 0 and json_end > json_start:
                        data = json.loads(content[json_start:json_end])
                        if isinstance(data, list):
                            self.skills.extend(data)
            except Exception as e:
                pass
        
        # 去重
        seen = set()
        unique_skills = []
        for skill in self.skills:
            skill_id = skill.get('slug', skill.get('name', ''))
            if skill_id and skill_id not in seen:
                seen.add(skill_id)
                unique_skills.append(skill)
        
        self.skills = unique_skills
        print(f"[*] 加载 {len(self.skills)} 个技能")
    
    def categorize_skills(self):
        """按类别分类"""
        category_keywords = {
            'AI/ML': ['ai', 'ml', 'machine learning', 'llm', 'gpt', 'chatbot', 'nlp', '图像', '语音'],
            '电商': ['ecommerce', 'amazon', 'shopify', '跨境', '电商', 'aliexpress', 'alibaba'],
            '加密货币': ['crypto', 'blockchain', 'defi', 'nft', 'web3', '交易', '钱包'],
            '营销': ['marketing', 'seo', 'social', '广告', '营销', '内容'],
            '生产力': ['productivity', 'automation', 'workflow', '效率', '时间管理'],
            '数据分析': ['data', 'analytics', 'visualization', '分析', '报表'],
            '内容创作': ['content', 'writing', 'video', 'image', '创作', '设计'],
            '工具': ['tool', 'utility', 'converter', 'generator', '格式'],
            '通讯': ['message', 'chat', 'telegram', 'discord', '飞书', '微信'],
            '金融': ['finance', '投资', '理财', '股票', '基金'],
        }
        
        for skill in self.skills:
            name = skill.get('name', '').lower()
            desc = skill.get('description', '').lower()
            tags = skill.get('tags', [])
            text = f"{name} {desc} {' '.join(tags)}"
            
            categorized = False
            for category, keywords in category_keywords.items():
                if any(kw in text for kw in keywords):
                    self.categories[category].append(skill)
                    categorized = True
                    break
            
            if not categorized:
                self.categories['其他'].append(skill)
    
    def find_gaps(self):
        """发现市场空白"""
        print("\n[*] 分析市场空白...")
        
        # 定义潜在机会领域
        opportunity_areas = [
            {
                'name': 'AI + 垂直行业',
                'description': 'AI 技术在特定行业的深度应用',
                'keywords': ['ai', '行业', '垂直', '专业'],
                'competition_level': '中',
                'potential': '高'
            },
            {
                'name': '自动化工作流',
                'description': '跨平台自动化任务流程',
                'keywords': ['automation', 'workflow', '自动', '流程'],
                'competition_level': '中',
                'potential': '高'
            },
            {
                'name': '数据可视化',
                'description': '复杂数据的直观展示',
                'keywords': ['data', 'visualization', '图表', '仪表板'],
                'competition_level': '低',
                'potential': '中高'
            },
            {
                'name': '跨境电商工具',
                'description': '服务于跨境电商卖家的工具',
                'keywords': ['跨境', '电商', 'amazon', 'shopify'],
                'competition_level': '中',
                'potential': '高'
            },
            {
                'name': '社交媒体管理',
                'description': '多平台内容发布和分析',
                'keywords': ['social', '媒体', '发布', '多平台'],
                'competition_level': '中',
                'potential': '中高'
            },
            {
                'name': '个人知识管理',
                'description': '个人知识库和学习系统',
                'keywords': ['knowledge', '笔记', '学习', '管理'],
                'competition_level': '低',
                'potential': '中'
            },
            {
                'name': 'API 集成工具',
                'description': '连接不同服务的 API 集成',
                'keywords': ['api', '集成', '连接', 'webhook'],
                'competition_level': '低',
                'potential': '高'
            },
            {
                'name': '内容本地化',
                'description': '多语言内容翻译和适配',
                'keywords': ['翻译', '本地化', '多语言', 'localization'],
                'competition_level': '低',
                'potential': '中高'
            },
        ]
        
        # 分析每个领域的竞争程度
        for area in opportunity_areas:
            competition_count = 0
            for skill in self.skills:
                text = f"{skill.get('name', '')} {skill.get('description', '')}".lower()
                if any(kw.lower() in text for kw in area['keywords']):
                    competition_count += 1
            
            area['current_competition'] = competition_count
            area['gap_score'] = self._calculate_gap_score(area)
        
        # 按机会分数排序
        self.opportunities = sorted(opportunity_areas, key=lambda x: -x['gap_score'])
        
        print(f"发现 {len(self.opportunities)} 个机会领域")
        for i, opp in enumerate(self.opportunities[:5], 1):
            print(f"  {i}. {opp['name']} - 竞争：{opp['current_competition']} 个技能 - 潜力：{opp['potential']}")
    
    def _calculate_gap_score(self, area):
        """计算机会分数（0-100）"""
        base_score = 50
        
        # 竞争少加分
        if area['current_competition'] == 0:
            base_score += 30
        elif area['current_competition'] < 5:
            base_score += 20
        elif area['current_competition'] < 10:
            base_score += 10
        
        # 潜力高加分
        if area['potential'] == '高':
            base_score += 20
        elif area['potential'] == '中高':
            base_score += 15
        elif area['potential'] == '中':
            base_score += 10
        
        # 竞争程度调整
        if area['competition_level'] == '低':
            base_score += 10
        elif area['competition_level'] == '中':
            base_score += 5
        
        return min(base_score, 100)
    
    def generate_skill_templates(self):
        """为高机会领域生成 Skill 模板"""
        print("\n[*] 生成 Skill 模板...")
        
        templates = [
            {
                'name': 'ai-industry-analyst',
                'title': 'AI 行业分析师',
                'category': 'AI/ML',
                'description': '深度分析特定行业趋势、竞争格局和机会点',
                'features': [
                    '行业报告自动生成',
                    '竞品动态监控',
                    '市场机会识别',
                    '趋势预测分析'
                ],
                'pricing_suggestion': '¥39/月 或 ¥399/年',
                'target_audience': '行业研究员、投资分析师、企业战略部门',
                'differentiation': '专注于垂直行业深度分析，而非通用 AI 对话'
            },
            {
                'name': 'cross-border-toolkit',
                'title': '跨境电商工具箱',
                'category': '电商',
                'description': '一站式跨境电商运营工具集合',
                'features': [
                    '多平台Listing优化',
                    '自动定价建议',
                    '物流成本计算',
                    '税务合规检查'
                ],
                'pricing_suggestion': '¥99/月',
                'target_audience': '亚马逊、Shopify 跨境电商卖家',
                'differentiation': '整合多个工具功能，降低使用成本'
            },
            {
                'name': 'social-auto-publisher',
                'title': '社交媒体自动发布器',
                'category': '营销',
                'description': '一键发布内容到多个社交平台',
                'features': [
                    '多平台同步发布',
                    '最佳发布时间建议',
                    '内容格式自动适配',
                    '发布效果分析'
                ],
                'pricing_suggestion': '¥49/月',
                'target_audience': '内容创作者、品牌营销人员',
                'differentiation': '支持国内海外全平台，智能内容适配'
            },
            {
                'name': 'data-dashboard-builder',
                'title': '数据仪表板构建器',
                'category': '数据分析',
                'description': '无需代码创建专业数据可视化仪表板',
                'features': [
                    '拖拽式仪表板设计',
                    '多数据源连接',
                    '自动图表推荐',
                    '实时数据更新'
                ],
                'pricing_suggestion': '¥69/月 或 ¥599/年',
                'target_audience': '数据分析师、业务运营人员',
                'differentiation': '零代码门槛，快速搭建专业仪表板'
            },
            {
                'name': 'api-connector-hub',
                'title': 'API 集成中心',
                'category': '工具',
                'description': '连接和自动化不同服务的 API',
                'features': [
                    '预置 100+ 常用 API 连接器',
                    '可视化工作流设计',
                    '自动错误处理和重试',
                    '执行日志和监控'
                ],
                'pricing_suggestion': '¥79/月',
                'target_audience': '开发者、自动化爱好者、小企业',
                'differentiation': '比 Zapier 更便宜，比自己开发更简单'
            },
        ]
        
        # 根据市场数据优化模板
        for template in templates:
            # 检查同类竞争
            category_skills = [s for s in self.skills 
                             if template['category'].lower() in 
                             f"{s.get('name', '')} {s.get('description', '')}".lower()]
            
            template['competition_count'] = len(category_skills)
            template['avg_price'] = sum(s.get('price', 0) for s in category_skills) / max(len(category_skills), 1)
            
            # 差异化建议
            if template['competition_count'] > 10:
                template['strategy'] = '价格战或功能差异化'
            elif template['competition_count'] > 5:
                template['strategy'] = '功能优化 + 精准定位'
            else:
                template['strategy'] = '快速占领市场，建立品牌'
        
        self.skill_templates = templates
        
        for t in templates[:3]:
            print(f"  ✓ {t['title']} - 竞争：{t['competition_count']} - 建议：{t['strategy']}")
    
    def generate_differentiation_report(self):
        """生成差异化策略报告"""
        report_file = self.data_dir / f"differentiation_strategy_{self.timestamp}.md"
        
        print(f"\n[*] 生成差异化策略报告...")
        
        report = f"""# 市场机会与差异化策略报告

**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**分析基础**: {len(self.skills)} 个竞品技能

---

## 1. 市场空白机会

| 排名 | 机会领域 | 当前竞争 | 潜力 | 机会分数 |
|------|---------|---------|------|---------|
"""
        for i, opp in enumerate(self.opportunities[:8], 1):
            report += f"| {i} | {opp['name']} | {opp['current_competition']} 个技能 | {opp['potential']} | {opp['gap_score']:.0f} |\n"
        
        report += f"""
### 重点推荐机会

"""
        for opp in self.opportunities[:3]:
            report += f"""#### {opp['name']}
- **描述**: {opp['description']}
- **竞争程度**: {opp['current_competition']} 个现有技能
- **市场潜力**: {opp['potential']}
- **进入策略**: 快速开发 MVP，建立先发优势

"""
        
        report += f"""
---

## 2. Skill 开发模板

"""
        for t in self.skill_templates:
            report += f"""### {t['title']} (`{t['name']}`)

**类别**: {t['category']}

**核心价值**: {t['description']}

**目标用户**: {t['target_audience']}

**核心功能**:
"""
            for feature in t['features']:
                report += f"- {feature}\n"
            
            report += f"""
**定价建议**: {t['pricing_suggestion']}

**竞争分析**:
- 同类技能数量：{t['competition_count']}
- 市场平均价格：¥{t['avg_price']:.0f}
- 竞争策略：{t['strategy']}

**差异化要点**: {t['differentiation']}

---

"""
        
        report += f"""
---

## 3. 行动建议

### 短期（1-2 周）
1. 选择 1-2 个高机会分数领域
2. 开发 MVP 版本
3. 发布到 ClawHub 测试市场反应

### 中期（1-2 月）
1. 根据用户反馈迭代优化
2. 建立付费用户群
3. 扩展相关技能形成产品矩阵

### 长期（3-6 月）
1. 打造品牌认知
2. 建立订阅收入流
3. 考虑团队协作扩展

---

## 4. 风险提示

⚠️ **市场风险**: 热门领域可能快速涌入竞争者
⚠️ **技术风险**: 依赖第三方 API 的服务存在稳定性风险
⚠️ **定价风险**: 过低定价影响盈利，过高影响获客

**建议**: 快速迭代，小步快跑，根据数据调整策略

---

*报告由 opportunity-finder.py 自动生成*
"""
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"✓ 报告已保存：{report_file}")
        return report_file
    
    def create_skill_scaffold(self, template_name):
        """为指定模板创建 Skill 脚手架"""
        template = next((t for t in self.skill_templates if t['name'] == template_name), None)
        if not template:
            print(f"✗ 未找到模板：{template_name}")
            return None
        
        scaffold_dir = self.data_dir / f"skill-scaffold-{template_name}"
        scaffold_dir.mkdir(parents=True, exist_ok=True)
        
        # 创建 SKILL.md
        skill_md = f"""# {template['title']}

{template['description']}

## 功能特性

"""
        for feature in template['features']:
            skill_md += f"- {feature}\n"
        
        skill_md += f"""
## 目标用户

{template['target_audience']}

## 定价策略

{template['pricing_suggestion']}

## 差异化优势

{template['differentiation']}

## 开发计划

- [ ] 核心功能开发
- [ ] 用户界面设计
- [ ] 测试和优化
- [ ] 文档编写
- [ ] 发布到 ClawHub

---

*由 opportunity-finder.py 生成*
"""
        
        (scaffold_dir / 'SKILL.md').write_text(skill_md, encoding='utf-8')
        
        # 创建 README.md
        readme = f"""# {template['title']}

## 简介

{template['description']}

## 安装

```bash
clawhub install {template['name']}
```

## 使用

（待开发）

## 定价

{template['pricing_suggestion']}

## 开发状态

🚧 开发中

---

*由 opportunity-finder.py 生成*
"""
        
        (scaffold_dir / 'README.md').write_text(readme, encoding='utf-8')
        
        print(f"✓ 脚手架已创建：{scaffold_dir}")
        return scaffold_dir

def main():
    if len(sys.argv) < 3:
        print("用法：python opportunity-finder.py <data_dir> <timestamp>")
        sys.exit(1)
    
    data_dir = sys.argv[1]
    timestamp = sys.argv[2]
    
    finder = OpportunityFinder(data_dir, timestamp)
    finder.load_data()
    finder.categorize_skills()
    finder.find_gaps()
    finder.generate_skill_templates()
    finder.generate_differentiation_report()
    
    # 为前 3 个模板创建脚手架
    for template in finder.skill_templates[:3]:
        finder.create_skill_scaffold(template['name'])
    
    print("\n✓ 机会发现完成!")
    print(f"\n输出文件:")
    print(f"  - 差异化策略报告：{data_dir}/differentiation_strategy_{timestamp}.md")
    print(f"  - Skill 脚手架：{data_dir}/skill-scaffold-*/")

if __name__ == '__main__':
    main()
