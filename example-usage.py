#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
ChatGPT 无限额度系统 - 使用示例
演示如何使用账号池进行 ChatGPT 调用
"""

import sqlite3
import random
import time
from datetime import datetime, timedelta
from typing import Optional, Dict
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("请安装依赖：pip install playwright")
    print("然后运行：playwright install")
    import sys
    sys.exit(1)


class ChatGPTPool:
    """ChatGPT 账号池管理器"""
    
    def __init__(self, db_path: str = "credentials.db"):
        self.db_path = db_path
        self._init_database()
        
    def _init_database(self):
        """初始化数据库（如果不存在）"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS accounts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_used TIMESTAMP,
                usage_count INTEGER DEFAULT 0,
                remaining_quota REAL DEFAULT 1.0,
                status TEXT DEFAULT 'active',
                notes TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def get_available_account(self) -> Optional[Dict]:
        """获取可用账号"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # 选择活跃且额度充足的账号
        cursor.execute('''
            SELECT * FROM accounts 
            WHERE status = 'active' AND remaining_quota > 0.2
            ORDER BY remaining_quota DESC, last_used ASC
            LIMIT 1
        ''')
        
        account = cursor.fetchone()
        conn.close()
        
        if account:
            return dict(account)
        return None
    
    def update_account_usage(self, email: str, tokens_used: int = 1):
        """更新账号使用记录"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 减少剩余额度（简化模型：每次使用减少 0.01）
        quota_decrease = 0.01 * tokens_used
        
        cursor.execute('''
            UPDATE accounts 
            SET remaining_quota = MAX(0, remaining_quota - ?),
                last_used = ?,
                usage_count = usage_count + 1
            WHERE email = ?
        ''', (quota_decrease, datetime.now(), email))
        
        # 检查是否需要切换到冷却状态
        cursor.execute('''
            UPDATE accounts 
            SET status = 'cooling'
            WHERE email = ? AND remaining_quota <= 0.2
        ''', (email,))
        
        conn.commit()
        conn.close()
    
    def chat(self, message: str, headless: bool = True) -> Optional[str]:
        """使用账号池发送 ChatGPT 消息"""
        
        # 获取可用账号
        account = self.get_available_account()
        
        if not account:
            print("警告：没有可用账号")
            print("请运行：python3 auto-register-chatgpt.py --count 10")
            return None
        
        print(f"使用账号：{account['email']}")
        print(f"剩余额度：{account['remaining_quota']:.2%}")
        
        try:
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=headless)
                context = browser.new_context()
                page = context.new_page()
                
                # 登录 ChatGPT
                page.goto("https://chat.openai.com", timeout=60000)
                time.sleep(3)
                
                # 检查是否已登录
                if "log in" in page.content().lower():
                    print("需要登录...")
                    # 这里实现登录逻辑
                    # 由于登录流程复杂，建议使用 API 方式
                    pass
                
                # 发送消息
                page.fill('textarea[placeholder="Send a message"]', message)
                page.click('button:has-text("Send")')
                
                # 等待回复
                time.sleep(5)
                
                # 获取回复
                response = page.locator('article').last.inner_text()
                
                # 更新使用记录
                self.update_account_usage(account['email'])
                
                browser.close()
                
                return response
                
        except Exception as e:
            print(f"调用失败：{e}")
            # 标记账号为可能需要验证
            self.update_account_status(account['email'], 'needs_verification')
            return None
    
    def update_account_status(self, email: str, status: str):
        """更新账号状态"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            UPDATE accounts SET status = ? WHERE email = ?
        ''', (status, email))
        
        conn.commit()
        conn.close()
    
    def get_stats(self) -> Dict:
        """获取账号池统计"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        stats = {}
        
        # 总数
        cursor.execute('SELECT COUNT(*) FROM accounts')
        stats['total'] = cursor.fetchone()[0]
        
        # 按状态统计
        cursor.execute('''
            SELECT status, COUNT(*) 
            FROM accounts 
            GROUP BY status
        ''')
        stats['by_status'] = {row[0]: row[1] for row in cursor.fetchall()}
        
        # 平均额度
        cursor.execute('SELECT AVG(remaining_quota) FROM accounts')
        stats['avg_quota'] = cursor.fetchone()[0] or 0
        
        # 总使用次数
        cursor.execute('SELECT SUM(usage_count) FROM accounts')
        stats['total_usage'] = cursor.fetchone()[0] or 0
        
        conn.close()
        
        return stats
    
    def rotate_accounts(self):
        """轮换账号（冷却账号恢复）"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 将冷却超过 24 小时的账号恢复为活跃
        cursor.execute('''
            UPDATE accounts 
            SET status = 'active'
            WHERE status = 'cooling' 
            AND last_used < datetime('now', '-1 day')
        ''')
        
        updated = cursor.rowcount
        conn.commit()
        conn.close()
        
        if updated > 0:
            print(f"已恢复 {updated} 个账号")
        
        return updated


def main():
    """使用示例"""
    print("=" * 60)
    print("ChatGPT 无限额度系统 - 使用示例")
    print("=" * 60)
    
    # 创建账号池
    pool = ChatGPTPool("credentials.db")
    
    # 查看统计
    print("\n账号池统计:")
    stats = pool.get_stats()
    print(f"  总账号数：{stats['total']}")
    print(f"  按状态：{stats['by_status']}")
    print(f"  平均额度：{stats['avg_quota']:.2%}")
    print(f"  总使用次数：{stats['total_usage']}")
    
    # 轮换账号
    print("\n检查账号轮换...")
    pool.rotate_accounts()
    
    # 示例调用（需要实际账号）
    print("\n示例调用:")
    print("  pool.chat('你好，请介绍一下自己')")
    print("\n注意：实际使用需要先注册账号")
    print("运行：python3 auto-register-chatgpt.py --count 10")


if __name__ == "__main__":
    main()
