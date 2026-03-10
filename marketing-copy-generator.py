#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SkillPay 营销文案生成器
自动生成多平台营销文案，支持 A/B 测试版本

功能:
- 读取 Skill 配置和特性
- 生成 Twitter/小红书/知乎风格文案
- 自动添加热门话题标签
- 生成 A/B 测试版本
- 支持批量生成

使用:
python marketing-copy-generator.py --skill skill-001 --platforms all --variants 3
"""

import json
import random
import argparse
import os
from datetime import datetime
from typing import List, Dict, Optional
import hashlib

# 配置路径
CONFIG_PATH = os.path.join(os.path.dirname(__file__), 'config.json')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'generated_copies')

# 平台文案模板库
PLATFORM_TEMPLATES = {
    'twitter': {
        'max_length': 280,
        'style': '简洁直接',
        'templates': [
            "🚀 {skill_name} 上线啦！\n\n{key_benefit}\n\n限时优惠：{offer}\n\n👉 {link}\n\n{hashtags}",
            "还在为{pain_point}烦恼？\n\n{skill_name} 帮你解决！\n\n✅ {feature_1}\n✅ {feature_2}\n✅ {feature_3}\n\n立即体验：{link}\n\n{hashtags}",
            "🔥 热门 Skill 推荐：{skill_name}\n\n{social_proof}\n\n现在入手仅需 {price}\n\n{link}\n\n{hashtags}",
            "【限时特惠】{skill_name}\n\n原价 {original_price} → 现价 {price}\n\n{urgency}\n\n立即抢购：{link}\n\n{hashtags}",
        ],
        'hashtags': {
            'ai': ['#AI', '#人工智能', '#自动化'],
            'productivity': ['#效率工具', '#生产力', '#职场'],
            'money': ['#被动收入', '#副业', '#赚钱'],
            'tech': ['#科技', '#创新', '#数字化'],
        }
    },
    'xiaohongshu': {
        'max_length': 1000,
        'style': '种草分享',
        'templates': [
            "✨ 发现一个超好用的 Skill！\n\n📌 {skill_name}\n\n💡 使用体验：\n{detailed_benefit}\n\n🎁 粉丝福利：{offer}\n\n🔗 链接放评论啦～\n\n{hashtags}",
            "姐妹们！这个 Skill 真的绝了😭\n\n{skill_name} 帮我解决了{pain_point}\n\n💰 价格：{price}\n⏰ 耗时：{time_saved}\n📈 效果：{result}\n\n真心推荐！冲！\n\n{hashtags}",
            "📚 自我提升必备工具\n\n今天给大家安利 {skill_name}\n\n✔️ 适合人群：{target_audience}\n✔️ 核心功能：{features}\n✔️ 性价比：{value_proposition}\n\n学生党/上班族都适用！\n\n{hashtags}",
            "💰 靠这个 Skill 我实现了被动收入\n\n{skill_name} 真的太香了\n\n📊 数据说话：\n{metrics}\n\n想了解的宝子评论区见～\n\n{hashtags}",
        ],
        'hashtags': {
            'ai': ['#AI 工具', '#人工智能', '#科技改变生活'],
            'productivity': ['#效率提升', '#职场干货', '#自我提升'],
            'money': ['#副业赚钱', '#被动收入', '#财务自由'],
            'tech': ['#黑科技', '#数码好物', '#工具推荐'],
        }
    },
    'zhihu': {
        'max_length': 2000,
        'style': '专业分析',
        'templates': [
            "如何评价 {skill_name} 这个工具？\n\n作为一个深度用户，我来分享一下使用体验：\n\n## 核心功能\n{feature_analysis}\n\n## 适用场景\n{use_cases}\n\n## 性价比分析\n{price_analysis}\n\n## 总结\n{conclusion}\n\n感兴趣的朋友可以试试：{link}\n\n{hashtags}",
            "有哪些提升工作效率的 AI 工具推荐？\n\n必须安利 {skill_name}！\n\n### 为什么推荐？\n{reasons}\n\n### 实际效果\n{case_study}\n\n### 价格对比\n{comparison}\n\n### 购买建议\n{recommendation}\n\n链接：{link}\n\n{hashtags}",
            "【深度测评】{skill_name} 值不值得买？\n\n花了{test_period}深度体验，结论如下：\n\n**优点**：\n{pros}\n\n**不足**：\n{cons}\n\n**适合人群**：\n{target_users}\n\n**购买建议**：{verdict}\n\n传送门：{link}\n\n{hashtags}",
        ],
        'hashtags': {
            'ai': ['人工智能', 'AI 应用', '自动化工具'],
            'productivity': ['工作效率', '职场技能', '时间管理'],
            'money': ['副业', '被动收入', '投资理财'],
            'tech': ['科技产品', '数字工具', '效率软件'],
        }
    }
}

# 文案变体生成器
VARIANT_MODIFIERS = {
    'emoji': ['🚀', '🔥', '✨', '💡', '🎯', '💰', '⚡', '📈', '✅', '🎁'],
    'urgency': ['限时优惠！', '仅剩 3 天！', '前 100 名特惠！', '今日截止！', '手慢无！'],
    'social_proof': ['已有 1000+ 用户', '好评率 98%', '复购率 85%', '行业领先', '口碑爆棚'],
    'benefit_focus': ['节省时间', '提升效率', '增加收入', '降低成本', '简化流程'],
}


class MarketingCopyGenerator:
    """营销文案生成器"""
    
    def __init__(self, config_path: str = CONFIG_PATH):
        self.config = self._load_config(config_path)
        self.output_dir = OUTPUT_DIR
        os.makedirs(self.output_dir, exist_ok=True)
    
    def _load_config(self, path: str) -> Dict:
        """加载配置文件"""
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {
            'skillpay': {'api_key': '', 'skill_ids': []},
            'platforms': {},
            'tracking': {}
        }
    
    def _get_skill_info(self, skill_id: str) -> Dict:
        """获取 Skill 信息（模拟，实际应调用 API）"""
        # TODO: 集成 SkillPay API
        skill_database = {
            'skill-001': {
                'name': 'AI 文案生成器',
                'price': '¥29/月',
                'original_price': '¥99/月',
                'key_benefit': '10 秒生成高转化营销文案',
                'pain_point': '写文案花费大量时间',
                'features': ['多平台适配', 'AI 智能优化', 'A/B 测试'],
                'target_audience': '内容创作者/电商运营/营销人员',
                'time_saved': '每天 2 小时',
                'result': '文案效率提升 10 倍',
            },
            'skill-002': {
                'name': '跨境电商选品助手',
                'price': '¥49/月',
                'original_price': '¥199/月',
                'key_benefit': '数据驱动选品，降低风险',
                'pain_point': '选品靠感觉，容易踩坑',
                'features': ['竞品分析', '利润计算', '趋势预测'],
                'target_audience': '跨境电商卖家/亚马逊运营',
                'time_saved': '每周 10 小时',
                'result': '选品成功率提升 60%',
            },
        }
        return skill_database.get(skill_id, {
            'name': '新 Skill',
            'price': '¥29/月',
            'original_price': '¥99/月',
            'key_benefit': '提升效率',
            'pain_point': '工作效率低',
            'features': ['功能 1', '功能 2', '功能 3'],
            'target_audience': '职场人士',
            'time_saved': '每天 1 小时',
            'result': '效率翻倍',
        })
    
    def _generate_hashtags(self, platform: str, categories: List[str]) -> str:
        """生成话题标签"""
        if platform not in PLATFORM_TEMPLATES:
            return ''
        
        hashtags = []
        for category in categories:
            if category in PLATFORM_TEMPLATES[platform]['hashtags']:
                hashtags.extend(PLATFORM_TEMPLATES[platform]['hashtags'][category])
        
        # 去重并限制数量
        hashtags = list(dict.fromkeys(hashtags))[:5]
        
        if platform == 'twitter':
            return ' '.join(hashtags)
        elif platform == 'xiaohongshu':
            return ' '.join(hashtags)
        elif platform == 'zhihu':
            return '  '.join(hashtags)
        return ' '.join(hashtags)
    
    def _fill_template(self, template: str, skill_info: Dict, link: str) -> str:
        """填充模板"""
        # 动态生成一些内容
        fill_data = {
            'skill_name': skill_info.get('name', 'Skill'),
            'key_benefit': skill_info.get('key_benefit', '提升效率'),
            'offer': '限时 7 折优惠',
            'link': link or 'https://skillpay.example.com',
            'pain_point': skill_info.get('pain_point', '效率低下'),
            'feature_1': skill_info.get('features', ['功能 1'])[0] if skill_info.get('features') else '功能 1',
            'feature_2': skill_info.get('features', ['功能 1', '功能 2'])[1] if len(skill_info.get('features', [])) > 1 else '功能 2',
            'feature_3': skill_info.get('features', ['功能 1', '功能 2', '功能 3'])[2] if len(skill_info.get('features', [])) > 2 else '功能 3',
            'social_proof': random.choice(VARIANT_MODIFIERS['social_proof']),
            'price': skill_info.get('price', '¥29/月'),
            'original_price': skill_info.get('original_price', '¥99/月'),
            'urgency': random.choice(VARIANT_MODIFIERS['urgency']),
            'detailed_benefit': f"使用{skill_info.get('name', 'Skill')}后，{skill_info.get('result', '效果显著')}",
            'time_saved': skill_info.get('time_saved', '节省时间'),
            'result': skill_info.get('result', '效果提升'),
            'target_audience': skill_info.get('target_audience', '所有人'),
            'features': '、'.join(skill_info.get('features', ['功能 1', '功能 2'])),
            'value_proposition': '性价比超高',
            'metrics': 'ROI 提升 300%',
            'feature_analysis': '详细功能分析内容...',
            'use_cases': '适用场景描述...',
            'price_analysis': '性价比分析...',
            'conclusion': '值得推荐',
            'reasons': '推荐理由...',
            'case_study': '实际案例...',
            'comparison': '价格对比...',
            'recommendation': '购买建议...',
            'test_period': '两周',
            'pros': '优点 1、优点 2、优点 3',
            'cons': '暂无明显不足',
            'target_users': '目标用户...',
            'verdict': '推荐购买',
        }
        
        # 填充模板
        result = template
        for key, value in fill_data.items():
            result = result.replace(f'{{{key}}}', str(value))
        
        return result
    
    def _truncate_to_limit(self, text: str, max_length: int) -> str:
        """截断到平台限制长度"""
        if len(text) <= max_length:
            return text
        
        # 智能截断，保持完整性
        truncated = text[:max_length - 3]
        last_newline = truncated.rfind('\n')
        if last_newline > max_length * 0.7:
            return truncated[:last_newline] + '...'
        
        return truncated + '...'
    
    def generate_copy(self, skill_id: str, platform: str, link: str = '', 
                     variant: int = 0) -> Dict:
        """生成单个文案"""
        if platform not in PLATFORM_TEMPLATES:
            raise ValueError(f'不支持的平台：{platform}')
        
        skill_info = self._get_skill_info(skill_id)
        templates = PLATFORM_TEMPLATES[platform]['templates']
        max_length = PLATFORM_TEMPLATES[platform]['max_length']
        
        # 选择模板
        template = templates[variant % len(templates)]
        
        # 填充模板
        copy = self._fill_template(template, skill_info, link)
        
        # 添加变体修饰
        if variant > 0:
            emoji = random.choice(VARIANT_MODIFIERS['emoji'])
            copy = f"{emoji} {copy}"
        
        # 生成话题标签
        categories = ['ai', 'productivity', 'money', 'tech']
        hashtags = self._generate_hashtags(platform, categories)
        copy = copy.replace('{hashtags}', hashtags)
        
        # 截断到限制长度
        copy = self._truncate_to_limit(copy, max_length)
        
        return {
            'skill_id': skill_id,
            'platform': platform,
            'variant': variant,
            'copy': copy,
            'length': len(copy),
            'timestamp': datetime.now().isoformat(),
            'copy_id': hashlib.md5(f"{skill_id}{platform}{variant}{datetime.now()}".encode()).hexdigest()[:8]
        }
    
    def generate_batch(self, skill_id: str, platforms: List[str], 
                      variants_per_platform: int = 3, link: str = '') -> List[Dict]:
        """批量生成文案"""
        results = []
        
        for platform in platforms:
            for variant in range(variants_per_platform):
                copy_data = self.generate_copy(skill_id, platform, link, variant)
                results.append(copy_data)
                print(f"✓ 已生成 {platform} 文案 #{variant + 1} (长度：{copy_data['length']})")
        
        return results
    
    def save_copies(self, copies: List[Dict], filename: str = '') -> str:
        """保存文案到文件"""
        if not filename:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"copies_{timestamp}.json"
        
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(copies, f, ensure_ascii=False, indent=2)
        
        print(f"✓ 文案已保存到：{filepath}")
        return filepath
    
    def display_copies(self, copies: List[Dict]):
        """显示生成的文案"""
        print("\n" + "="*60)
        print("生成的营销文案")
        print("="*60 + "\n")
        
        for copy_data in copies:
            print(f"【{copy_data['platform']}】变体 #{copy_data['variant'] + 1}")
            print(f"ID: {copy_data['copy_id']} | 长度：{copy_data['length']}")
            print("-" * 60)
            print(copy_data['copy'])
            print("\n" + "-" * 60 + "\n")


def main():
    parser = argparse.ArgumentParser(description='SkillPay 营销文案生成器')
    parser.add_argument('--skill', type=str, required=True, help='Skill ID')
    parser.add_argument('--platforms', type=str, nargs='+', 
                       default=['twitter', 'xiaohongshu', 'zhihu'],
                       help='目标平台')
    parser.add_argument('--variants', type=int, default=3, 
                       help='每个平台的变体数量')
    parser.add_argument('--link', type=str, default='', 
                       help='推广链接')
    parser.add_argument('--output', type=str, default='', 
                       help='输出文件名')
    parser.add_argument('--quiet', action='store_true', 
                       help='静默模式')
    
    args = parser.parse_args()
    
    # 处理平台参数
    if 'all' in args.platforms:
        platforms = ['twitter', 'xiaohongshu', 'zhihu']
    else:
        platforms = args.platforms
    
    # 创建生成器
    generator = MarketingCopyGenerator()
    
    # 生成文案
    print(f"开始为 Skill {args.skill} 生成营销文案...")
    print(f"目标平台：{', '.join(platforms)}")
    print(f"每个平台变体数：{args.variants}\n")
    
    copies = generator.generate_batch(
        skill_id=args.skill,
        platforms=platforms,
        variants_per_platform=args.variants,
        link=args.link
    )
    
    # 保存文案
    generator.save_copies(copies, args.output)
    
    # 显示文案
    if not args.quiet:
        generator.display_copies(copies)
    
    print(f"\n✓ 完成！共生成 {len(copies)} 条文案")
    print(f"输出目录：{generator.output_dir}")


if __name__ == '__main__':
    main()
