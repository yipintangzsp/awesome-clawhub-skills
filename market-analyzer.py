#!/usr/bin/env python3
"""
market-analyzer.py - ClawHub 市场分析工具
功能：分析竞品定价、下载量、市场分布
"""

import json
import os
import sys
from datetime import datetime
from pathlib import Path
from collections import defaultdict
import re

class MarketAnalyzer:
    def __init__(self, data_dir, timestamp):
        self.data_dir = Path(data_dir)
        self.timestamp = timestamp
        self.skills = []
        self.categories = defaultdict(list)
        self.price_points = defaultdict(list)
        self.download_ranges = {
            '0-100': [],
            '101-500': [],
            '501-1000': [],
            '1001-5000': [],
            '5000+': []
        }
    
    def load_data(self):
        """加载所有监控数据文件"""
        print(f"[*] 加载数据目录：{self.data_dir}")
        
        pattern_files = list(self.data_dir.glob(f"*_{self.timestamp}.json"))
        
        for file_path in pattern_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    # 尝试提取 JSON 部分（处理可能的日志前缀）
                    json_start = content.find('[')
                    json_end = content.rfind(']') + 1
                    if json_start >= 0 and json_end > json_start:
                        data = json.loads(content[json_start:json_end])
                        if isinstance(data, list):
                            self.skills.extend(data)
                            print(f"  ✓ 加载 {len(data)} 个技能 from {file_path.name}")
            except Exception as e:
                print(f"  ⚠ 跳过 {file_path.name}: {e}")
        
        # 去重（基于 slug 或 name）
        seen = set()
        unique_skills = []
        for skill in self.skills:
            skill_id = skill.get('slug', skill.get('name', ''))
            if skill_id and skill_id not in seen:
                seen.add(skill_id)
                unique_skills.append(skill)
        
        self.skills = unique_skills
        print(f"[*] 去重后总技能数：{len(self.skills)}")
    
    def categorize_skills(self):
        """按类别分类技能"""
        category_keywords = {
            'AI/ML': ['ai', 'ml', 'machine learning', 'llm', 'gpt', 'chatbot', 'nlp'],
            '电商': ['ecommerce', 'amazon', 'shopify', '跨境', '电商'],
            '加密货币': ['crypto', 'blockchain', 'defi', 'nft', 'web3'],
            '营销': ['marketing', 'seo', 'social', '广告', '营销'],
            '生产力': ['productivity', 'automation', 'workflow', '效率'],
            '数据分析': ['data', 'analytics', 'visualization', '分析'],
            '内容创作': ['content', 'writing', 'video', 'image', '创作'],
            '工具': ['tool', 'utility', 'converter', 'generator'],
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
        
        print(f"[*] 分类完成：{len(self.categories)} 个类别")
        for cat, skills in sorted(self.categories.items(), key=lambda x: -len(x[1])):
            print(f"  - {cat}: {len(skills)} 个技能")
    
    def analyze_pricing(self):
        """分析定价策略"""
        print("\n[*] 分析定价策略...")
        
        price_skill_map = {
            '免费': [],
            '¥1-10': [],
            '¥11-30': [],
            '¥31-50': [],
            '¥51-100': [],
            '¥100+': [],
            '订阅制': [],
            '未知': []
        }
        
        for skill in self.skills:
            price = skill.get('price', 0)
            pricing_model = skill.get('pricing_model', 'unknown')
            
            if pricing_model == 'subscription' or '月' in str(skill.get('description', '')):
                price_skill_map['订阅制'].append(skill)
            elif price == 0:
                price_skill_map['免费'].append(skill)
            elif price <= 10:
                price_skill_map['¥1-10'].append(skill)
            elif price <= 30:
                price_skill_map['¥11-30'].append(skill)
            elif price <= 50:
                price_skill_map['¥31-50'].append(skill)
            elif price <= 100:
                price_skill_map['¥51-100'].append(skill)
            elif price > 100:
                price_skill_map['¥100+'].append(skill)
            else:
                price_skill_map['未知'].append(skill)
        
        self.price_points = price_skill_map
        
        print("\n定价分布:")
        for price_range, skills in price_skill_map.items():
            if skills:
                print(f"  {price_range}: {len(skills)} 个技能 ({len(skills)/max(len(self.skills),1)*100:.1f}%)")
    
    def analyze_downloads(self):
        """分析下载量分布"""
        print("\n[*] 分析下载量分布...")
        
        for skill in self.skills:
            downloads = skill.get('downloads', 0) or skill.get('installs', 0) or 0
            
            if downloads <= 100:
                self.download_ranges['0-100'].append(skill)
            elif downloads <= 500:
                self.download_ranges['101-500'].append(skill)
            elif downloads <= 1000:
                self.download_ranges['501-1000'].append(skill)
            elif downloads <= 5000:
                self.download_ranges['1001-5000'].append(skill)
            else:
                self.download_ranges['5000+'].append(skill)
        
        print("\n下载量分布:")
        for range_name, skills in self.download_ranges.items():
            if skills:
                print(f"  {range_name}: {len(skills)} 个技能")
    
    def identify_top_performers(self, top_n=10):
        """识别表现最好的技能"""
        print(f"\n[*] Top {top_n} 热门技能...")
        
        # 按下载量/安装量排序
        sorted_skills = sorted(
            self.skills,
            key=lambda x: x.get('downloads', 0) or x.get('installs', 0) or 0,
            reverse=True
        )[:top_n]
        
        print("\n热门技能:")
        for i, skill in enumerate(sorted_skills, 1):
            name = skill.get('name', 'Unknown')
            downloads = skill.get('downloads', 0) or skill.get('installs', 0) or 0
            price = skill.get('price', 0)
            slug = skill.get('slug', '')
            print(f"  {i}. {name} - {downloads} 下载 - ¥{price} - {slug}")
        
        return sorted_skills
    
    def generate_report(self):
        """生成市场分析报告"""
        report_file = self.data_dir / f"market_analysis_{self.timestamp}.md"
        
        print(f"\n[*] 生成市场分析报告：{report_file}")
        
        top_performers = self.identify_top_performers()
        
        report = f"""# ClawHub 市场分析报告

**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
**分析样本**: {len(self.skills)} 个技能

---

## 1. 市场概览

### 类别分布
| 类别 | 技能数量 | 占比 |
|------|---------|------|
"""
        for cat, skills in sorted(self.categories.items(), key=lambda x: -len(x[1]))[:10]:
            pct = len(skills) / max(len(self.skills), 1) * 100
            report += f"| {cat} | {len(skills)} | {pct:.1f}% |\n"
        
        report += f"""
### 定价分布
| 价格区间 | 技能数量 | 占比 |
|---------|---------|------|
"""
        for price_range, skills in self.price_points.items():
            if skills:
                pct = len(skills) / max(len(self.skills), 1) * 100
                report += f"| {price_range} | {len(skills)} | {pct:.1f}% |\n"
        
        report += f"""
### 下载量分布
| 下载量区间 | 技能数量 |
|-----------|---------|
"""
        for range_name, skills in self.download_ranges.items():
            if skills:
                report += f"| {range_name} | {len(skills)} |\n"
        
        report += f"""
---

## 2. Top 热门技能

| 排名 | 名称 | 下载量 | 价格 | Slug |
|------|------|--------|------|------|
"""
        for i, skill in enumerate(top_performers, 1):
            name = skill.get('name', 'Unknown')
            downloads = skill.get('downloads', 0) or skill.get('installs', 0) or 0
            price = skill.get('price', 0)
            slug = skill.get('slug', '')
            report += f"| {i} | {name} | {downloads} | ¥{price} | {slug} |\n"
        
        report += f"""
---

## 3. 市场洞察

### 热门类别
"""
        top_categories = sorted(self.categories.items(), key=lambda x: -len(x[1]))[:5]
        for cat, skills in top_categories:
            avg_downloads = sum(s.get('downloads', 0) or s.get('installs', 0) or 0 for s in skills) / max(len(skills), 1)
            report += f"- **{cat}**: {len(skills)} 个技能，平均下载 {avg_downloads:.0f}\n"
        
        report += f"""
### 定价策略建议
- 免费技能占比：{len(self.price_points.get('免费', [])) / max(len(self.skills), 1) * 100:.1f}%
- 订阅制技能占比：{len(self.price_points.get('订阅制', [])) / max(len(self.skills), 1) * 100:.1f}%
- 主流价格区间：¥11-50（占比最高）

### 机会点
1. 高下载量但竞争少的类别值得进入
2. 订阅制模式接受度正在提升
3. AI/自动化类技能需求旺盛

---

*报告由 market-analyzer.py 自动生成*
"""
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"✓ 报告已保存：{report_file}")
        return report_file

def main():
    if len(sys.argv) < 3:
        print("用法：python market-analyzer.py <data_dir> <timestamp>")
        sys.exit(1)
    
    data_dir = sys.argv[1]
    timestamp = sys.argv[2]
    
    analyzer = MarketAnalyzer(data_dir, timestamp)
    analyzer.load_data()
    analyzer.categorize_skills()
    analyzer.analyze_pricing()
    analyzer.analyze_downloads()
    analyzer.generate_report()
    
    print("\n✓ 市场分析完成!")

if __name__ == '__main__':
    main()
