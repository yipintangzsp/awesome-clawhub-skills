#!/usr/bin/env python3
"""
引流文章发布提醒系统 - Python 版本
功能：自动检查文章、发送飞书/邮件提醒、设置复盘提醒
"""

import os
import csv
import json
import subprocess
from datetime import datetime, timedelta
from pathlib import Path

# 配置
WORKSPACE = Path("/Users/admin/.openclaw/workspace")
PENDING_DIR = WORKSPACE / "pending-posts"
TRACKING_FILE = PENDING_DIR / "发布追踪表 - 完整版.csv"
FEISHU_WEBHOOK = os.getenv("FEISHU_WEBHOOK", "")
EMAIL_RECIPIENT = os.getenv("EMAIL_RECIPIENT", "zhangsir@example.com")

# 最佳发布时间
BEST_PUBLISH_TIMES = {
    "知乎": ["20:00", "21:00", "22:00"],
    "小红书": ["12:30", "20:00"],
    "Twitter": ["09:00", "21:00"],
    "Reddit": ["21:00", "22:00", "23:00"]
}


def check_articles():
    """检查待发布文章"""
    print("📊 检查待发布文章...\n")
    
    platforms = {
        "知乎": PENDING_DIR / "zhihu",
        "小红书": PENDING_DIR / "xiaohongshu",
        "Twitter": PENDING_DIR / "twitter",
        "Reddit": PENDING_DIR / "reddit"
    }
    
    total = 0
    stats = {}
    
    for platform, dir_path in platforms.items():
        if dir_path.exists():
            files = list(dir_path.glob("*.md")) + list(dir_path.glob("*.txt"))
            # 排除指南类文件
            files = [f for f in files if not f.name.startswith("openclaw")]
            count = len(files)
            stats[platform] = count
            total += count
            print(f"  {platform}: {count} 篇")
    
    print(f"\n总计：{total} 篇")
    return total, stats


def get_publish_plan(date_str=None):
    """获取指定日期的发布计划"""
    if date_str is None:
        date_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
    
    target_date = datetime.strptime(date_str, "%Y-%m-%d")
    weekday = target_date.strftime("%A")
    
    # 从配置文件中读取发布计划
    config_file = PENDING_DIR / "发布提醒配置.md"
    if not config_file.exists():
        return []
    
    plans = []
    with open(config_file, 'r', encoding='utf-8') as f:
        content = f.read()
        
        # 简单解析 Markdown 表格
        lines = content.split('\n')
        in_table = False
        for line in lines:
            if date_str in line and '|' in line:
                # 解析表格行
                parts = [p.strip() for p in line.split('|') if p.strip()]
                if len(parts) >= 4:
                    plans.append({
                        "time": parts[0],
                        "platform": parts[1],
                        "file": parts[2],
                        "title": parts[3] if len(parts) > 3 else ""
                    })
    
    return plans


def send_feishu_message(title, content):
    """发送飞书消息"""
    if not FEISHU_WEBHOOK:
        print("⚠️  FEISHU_WEBHOOK 未设置，跳过飞书通知")
        return False
    
    payload = {
        "msg_type": "interactive",
        "card": {
            "header": {
                "title": {
                    "tag": "plain_text",
                    "content": title
                }
            },
            "elements": [
                {
                    "tag": "markdown",
                    "content": content
                }
            ]
        }
    }
    
    try:
        import requests
        response = requests.post(FEISHU_WEBHOOK, json=payload)
        if response.status_code == 200:
            print("✅ 飞书通知已发送")
            return True
        else:
            print(f"❌ 飞书发送失败：{response.text}")
            return False
    except Exception as e:
        print(f"❌ 发送失败：{e}")
        return False


def send_email_reminder(subject, body):
    """发送邮件提醒"""
    # 使用系统邮件命令或 SMTP
    try:
        # 方法 1: 使用 mail 命令
        subprocess.run(
            ["mail", "-s", subject, EMAIL_RECIPIENT],
            input=body.encode('utf-8'),
            check=True
        )
        print("✅ 邮件已发送")
        return True
    except FileNotFoundError:
        print("⚠️  mail 命令不可用，尝试其他方法...")
    except Exception as e:
        print(f"❌ 邮件发送失败：{e}")
    
    return False


def generate_reminder_message(plans):
    """生成提醒消息"""
    if not plans:
        return "暂无发布计划"
    
    message = "📢 **发布提醒**\n\n"
    for plan in plans:
        message += f"⏰ {plan.get('time', 'TBD')}\n"
        message += f"📍 {plan.get('platform', 'Unknown')}\n"
        message += f"📝 {plan.get('title', 'No title')}\n"
        message += f"📄 文件：{plan.get('file', 'Unknown')}\n"
        message += "\n"
    
    message += "\n请按时发布！"
    return message


def setup_review_reminders(file_name, publish_time):
    """设置复盘提醒"""
    try:
        publish_dt = datetime.strptime(publish_time, "%Y-%m-%d %H:%M")
        review_24h = publish_dt + timedelta(hours=24)
        review_7d = publish_dt + timedelta(days=7)
        
        print(f"\n📊 复盘提醒设置:")
        print(f"  24 小时复盘：{review_24h.strftime('%Y-%m-%d %H:%M')}")
        print(f"  7 天复盘：{review_7d.strftime('%Y-%m-%d %H:%M')}")
        
        # 生成 cron 配置
        cron_24h = f"0 {review_24h.hour} {review_24h.day} {review_24h.month} * echo '24h 复盘：{file_name}'"
        cron_7d = f"0 {review_7d.hour} {review_7d.day} {review_7d.month} * echo '7d 复盘：{file_name}'"
        
        print(f"\n  Cron 配置:")
        print(f"    {cron_24h}")
        print(f"    {cron_7d}")
        
        return {
            "24h": review_24h,
            "7d": review_7d
        }
    except Exception as e:
        print(f"❌ 设置失败：{e}")
        return None


def update_tracking_file(platform, file_name, title, publish_time, link=""):
    """更新追踪表"""
    if not TRACKING_FILE.exists():
        print(f"❌ 追踪表不存在：{TRACKING_FILE}")
        return False
    
    try:
        # 读取 CSV
        rows = []
        with open(TRACKING_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                if row['文件名'] == file_name:
                    row['发布时间'] = publish_time
                    row['发布链接'] = link
                    row['状态'] = '已发布'
                rows.append(row)
        
        # 写回 CSV
        with open(TRACKING_FILE, 'w', encoding='utf-8', newline='') as f:
            fieldnames = rows[0].keys()
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        
        print(f"✅ 追踪表已更新：{file_name}")
        return True
    except Exception as e:
        print(f"❌ 更新失败：{e}")
        return False


def generate_cron_config():
    """生成 cron 配置文件"""
    cron_config = """# 引流文章发布提醒系统 - Cron 配置
# 使用方法：crontab /path/to/publish-cron.conf

# 每天 19:00 发送次日发布计划
0 19 * * * cd /Users/admin/.openclaw/workspace/pending-posts && ./scripts/publish-reminder.sh reminder >> /tmp/publish-reminder.log 2>&1

# 每天 10:00 发送 24 小时复盘提醒
0 10 * * * cd /Users/admin/.openclaw/workspace/pending-posts && ./scripts/publish-reminder.sh review --daily >> /tmp/review-reminder.log 2>&1

# 每周一 09:00 发送周计划
0 9 * * 1 cd /Users/admin/.openclaw/workspace/pending-posts && ./scripts/publish-reminder.sh reminder --weekly >> /tmp/weekly-plan.log 2>&1

# 每周一 15:00 发送周报复盘提醒
0 15 * * 1 cd /Users/admin/.openclaw/workspace/pending-posts && ./scripts/publish-reminder.sh review --weekly >> /tmp/weekly-review.log 2>&1
"""
    
    cron_file = PENDING_DIR / "scripts" / "publish-cron.conf"
    with open(cron_file, 'w', encoding='utf-8') as f:
        f.write(cron_config)
    
    print(f"✅ Cron 配置已生成：{cron_file}")
    print("\n安装方法:")
    print(f"  crontab {cron_file}")
    
    return cron_file


def main():
    """主函数"""
    import sys
    
    print("=" * 60)
    print("🚀 引流文章发布提醒系统")
    print("=" * 60)
    print()
    
    if len(sys.argv) > 1:
        command = sys.argv[1]
    else:
        command = "check"
    
    if command == "check":
        check_articles()
    
    elif command == "reminder":
        date = sys.argv[2] if len(sys.argv) > 2 else None
        plans = get_publish_plan(date)
        message = generate_reminder_message(plans)
        print(message)
        send_feishu_message("📢 发布提醒", message)
    
    elif command == "update":
        if len(sys.argv) < 5:
            print("用法：python auto-reminder.py update <platform> <file> <time> [link]")
            sys.exit(1)
        update_tracking_file(sys.argv[2], sys.argv[3], "", sys.argv[4], sys.argv[5] if len(sys.argv) > 5 else "")
    
    elif command == "review":
        if len(sys.argv) < 4:
            print("用法：python auto-reminder.py review <file> <time>")
            sys.exit(1)
        setup_review_reminders(sys.argv[2], sys.argv[3])
    
    elif command == "cron":
        generate_cron_config()
    
    elif command == "all":
        print("执行完整流程...\n")
        total, stats = check_articles()
        print()
        plans = get_publish_plan()
        message = generate_reminder_message(plans)
        print(message)
        print()
        generate_cron_config()
        print("\n✅ 流程完成")
    
    else:
        print(f"未知命令：{command}")
        print("可用命令：check, reminder, update, review, cron, all")


if __name__ == "__main__":
    main()
