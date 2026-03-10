#!/usr/bin/env python3
"""
demo-competitor-system.py - 竞争情报监控系统演示
功能：使用模拟数据演示系统功能，无需等待 API 数据
"""

import json
import os
from datetime import datetime
from pathlib import Path

# 模拟 ClawHub 技能数据
MOCK_SKILLS = [
    {"name": "AI 文案生成器", "slug": "ai-copy-generator", "downloads": 5200, "installs": 4800, "price": 29, "pricing_model": "subscription", "description": "AI 驱动的广告文案自动生成", "tags": ["ai", "marketing", "content"]},
    {"name": "亚马逊选品助手", "slug": "amazon-niche-finder", "downloads": 3800, "installs": 3500, "price": 129, "pricing_model": "subscription", "description": "亚马逊蓝海市场发现工具", "tags": ["ecommerce", "amazon", "data"]},
    {"name": "加密货币价格提醒", "slug": "crypto-price-alert", "downloads": 2900, "installs": 2700, "price": 0, "pricing_model": "free", "description": "实时加密货币价格监控", "tags": ["crypto", "blockchain", "alert"]},
    {"name": "社交媒体自动发布", "slug": "social-auto-post", "downloads": 2100, "installs": 1900, "price": 49, "pricing_model": "subscription", "description": "多平台内容自动发布工具", "tags": ["social", "marketing", "automation"]},
    {"name": "数据可视化仪表板", "slug": "data-dashboard-builder", "downloads": 1800, "installs": 1600, "price": 69, "pricing_model": "subscription", "description": "零代码创建数据仪表板", "tags": ["data", "visualization", "tool"]},
    {"name": "AI 客服机器人", "slug": "ai-customer-service", "downloads": 1500, "installs": 1400, "price": 99, "pricing_model": "subscription", "description": "24/7 智能客服系统", "tags": ["ai", "customer-service", "chatbot"]},
    {"name": "跨境电商税务计算", "slug": "cross-border-tax", "downloads": 1200, "installs": 1100, "price": 399, "pricing_model": "subscription", "description": "多国 VAT 自动核算", "tags": ["ecommerce", "tax", "compliance"]},
    {"name": "SEO 关键词优化", "slug": "seo-keyword-optimizer", "downloads": 980, "installs": 900, "price": 59, "pricing_model": "subscription", "description": "AI 智能 SEO 关键词挖掘", "tags": ["seo", "marketing", "ai"]},
    {"name": "视频字幕生成器", "slug": "video-subtitle-gen", "downloads": 850, "installs": 780, "price": 19, "pricing_model": "subscription", "description": "AI 自动生成视频字幕", "tags": ["video", "ai", "content"]},
    {"name": "邮件营销自动化", "slug": "email-marketing-auto", "downloads": 720, "installs": 650, "price": 79, "pricing_model": "subscription", "description": "智能邮件营销工作流", "tags": ["marketing", "email", "automation"]},
    {"name": "区块链钱包监控", "slug": "blockchain-wallet-monitor", "downloads": 650, "installs": 600, "price": 0, "pricing_model": "free", "description": "多链钱包资产追踪", "tags": ["blockchain", "crypto", "tool"]},
    {"name": "AI 图片生成器", "slug": "ai-image-generator", "downloads": 580, "installs": 520, "price": 39, "pricing_model": "subscription", "description": "文本到图像 AI 生成", "tags": ["ai", "image", "content"]},
    {"name": "竞品价格监控", "slug": "competitor-price-monitor", "downloads": 520, "installs": 480, "price": 199, "pricing_model": "subscription", "description": "竞品价格实时追踪", "tags": ["ecommerce", "competitor", "data"]},
    {"name": "日程管理助手", "slug": "schedule-assistant", "downloads": 480, "installs": 440, "price": 0, "pricing_model": "free", "description": "智能日程优化建议", "tags": ["productivity", "calendar", "ai"]},
    {"name": "API 文档生成器", "slug": "api-doc-generator", "downloads": 420, "installs": 380, "price": 19, "pricing_model": "subscription", "description": "自动 API 文档生成", "tags": ["tool", "api", "documentation"]},
]

def create_mock_data(data_dir):
    """创建模拟数据文件"""
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    
    # 保存 JSON 数据
    json_file = data_dir / f"skills_downloads_{timestamp}.json"
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(MOCK_SKILLS, f, ensure_ascii=False, indent=2)
    
    print(f"✓ 创建模拟数据：{json_file}")
    return timestamp

def run_demo():
    """运行演示"""
    print("=" * 60)
    print("  ClawHub 竞争情报监控系统 - 演示模式")
    print("=" * 60)
    print()
    
    data_dir = Path("/Users/admin/.openclaw/workspace/competitor-data")
    data_dir.mkdir(exist_ok=True)
    
    # 创建模拟数据
    timestamp = create_mock_data(data_dir)
    
    # 运行市场分析
    print("\n[1/2] 运行市场分析...")
    os.system(f"cd /Users/admin/.openclaw/workspace && python3 market-analyzer.py ./competitor-data {timestamp}")
    
    # 运行机会发现
    print("\n[2/2] 运行机会发现...")
    os.system(f"cd /Users/admin/.openclaw/workspace && python3 opportunity-finder.py ./competitor-data {timestamp}")
    
    # 显示结果
    print("\n" + "=" * 60)
    print("  演示完成！")
    print("=" * 60)
    print("\n📄 生成的报告:")
    
    for report in sorted(data_dir.glob(f"*_{timestamp}.md")):
        print(f"  - {report.name}")
    
    print("\n📊 查看报告:")
    print(f"  cat {data_dir}/market_analysis_{timestamp}.md")
    print(f"  cat {data_dir}/differentiation_strategy_{timestamp}.md")
    
    print("\n🎯 下一步:")
    print("  1. 查看生成的市场分析报告")
    print("  2. 查看差异化策略建议")
    print("  3. 使用 Skill 脚手架开始开发")
    print("  4. 运行 ./setup-competitor-monitor.sh 安装正式版本")

if __name__ == '__main__':
    run_demo()
