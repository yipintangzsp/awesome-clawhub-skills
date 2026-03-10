#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
ChatGPT 自动注册脚本
功能：批量生成临时邮箱并注册 ChatGPT 账号
"""

import argparse
import sqlite3
import random
import string
import time
import json
import os
import sys
from datetime import datetime
from pathlib import Path

# 第三方库（需要安装）
try:
    from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
    import yaml
except ImportError as e:
    print(f"缺少依赖：{e}")
    print("请运行：pip install playwright pyyaml")
    print("然后运行：playwright install")
    sys.exit(1)


class ChatGPTRegistrer:
    """ChatGPT 自动注册器"""
    
    def __init__(self, domain: str, db_path: str = "credentials.db", config_path: str = None):
        self.domain = domain
        self.db_path = db_path
        self.config_path = config_path or str(Path.home() / ".freemail" / "freemail_config.yaml")
        self.config = self._load_config()
        self._init_database()
        
    def _load_config(self) -> dict:
        """加载配置文件"""
        try:
            with open(self.config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        except FileNotFoundError:
            print(f"警告：配置文件未找到 {self.config_path}，使用默认配置")
            return {"domain": self.domain, "main_email": ""}
    
    def _init_database(self):
        """初始化 SQLite 数据库"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # 创建账号表
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
        
        # 创建索引
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_status ON accounts(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_quota ON accounts(remaining_quota)')
        
        conn.commit()
        conn.close()
        print(f"数据库已初始化：{self.db_path}")
    
    def generate_email(self) -> str:
        """生成随机临时邮箱地址"""
        # 生成随机用户名
        username = ''.join(random.choices(
            string.ascii_lowercase + string.digits, 
            k=12
        ))
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        email = f"{username}{timestamp}@{self.domain}"
        return email
    
    def generate_password(self, length: int = 16) -> str:
        """生成随机密码"""
        chars = string.ascii_letters + string.digits + "!@#$%^&*"
        return ''.join(random.choices(chars, k=length))
    
    def register_account(self, browser, email: str, password: str) -> bool:
        """注册单个 ChatGPT 账号"""
        try:
            context = browser.new_context(
                viewport={"width": 1920, "height": 1080},
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            page = context.new_page()
            
            # 访问 ChatGPT 注册页面
            print(f"  访问注册页面...")
            page.goto("https://chat.openai.com/signup", timeout=60000)
            time.sleep(3)
            
            # 尝试点击"Sign up with email"（页面可能变化）
            try:
                page.click('button:has-text("Sign up with email")', timeout=10000)
                time.sleep(2)
            except:
                print("  注意：可能已是邮箱注册页面")
            
            # 填写邮箱
            print(f"  填写邮箱：{email}")
            email_input = page.locator('input[type="email"]')
            if email_input.count() > 0:
                email_input.first.fill(email)
                page.click('button:has-text("Continue")', timeout=10000)
                time.sleep(2)
            
            # 填写密码
            print("  填写密码...")
            password_input = page.locator('input[type="password"]')
            if password_input.count() > 0:
                password_input.first.fill(password)
                page.click('button:has-text("Continue")', timeout=10000)
                time.sleep(2)
            
            # 同意条款
            try:
                page.click('input[type="checkbox"]', timeout=5000)
                page.click('button:has-text("Continue")', timeout=10000)
                time.sleep(2)
            except:
                print("  注意：可能无需同意条款")
            
            # 检查是否需要邮箱验证
            page_content = page.content()
            if "verify your email" in page_content.lower() or "verification" in page_content.lower():
                print("  ✓ 需要邮箱验证，等待验证码...")
                # 这里需要与 verify-forwarder.py 配合
                # 暂时保存待验证状态
                return self._save_pending_account(email, password, "pending_verification")
            else:
                print("  ✓ 注册可能成功")
                return self._save_account(email, password, "active")
            
        except PlaywrightTimeout as e:
            print(f"  ✗ 注册超时：{e}")
            return False
        except Exception as e:
            print(f"  ✗ 注册失败：{e}")
            return False
        finally:
            context.close()
    
    def _save_account(self, email: str, password: str, status: str = "active") -> bool:
        """保存账号到数据库"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO accounts (email, password, status, created_at)
                VALUES (?, ?, ?, ?)
            ''', (email, password, status, datetime.now()))
            
            conn.commit()
            conn.close()
            print(f"  ✓ 账号已保存：{email}")
            return True
        except Exception as e:
            print(f"  ✗ 保存账号失败：{e}")
            return False
    
    def _save_pending_account(self, email: str, password: str, status: str) -> bool:
        """保存待验证账号"""
        return self._save_account(email, password, status)
    
    def register_batch(self, count: int = 10, headless: bool = False):
        """批量注册账号"""
        print(f"\n开始批量注册 {count} 个 ChatGPT 账号")
        print(f"域名：@{self.domain}")
        print(f"数据库：{self.db_path}")
        print("-" * 60)
        
        success_count = 0
        failed_count = 0
        
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(
                headless=headless,
                args=[
                    '--disable-blink-features=AutomationControlled',
                    '--no-sandbox',
                    '--disable-dev-shm-usage'
                ]
            )
            
            # 注入反检测脚本
            browser.new_context().add_init_script("""
                Object.defineProperty(navigator, 'webdriver', {get: () => undefined});
            """)
            
            for i in range(count):
                print(f"\n[{i+1}/{count}] 注册第 {i+1} 个账号")
                
                email = self.generate_email()
                password = self.generate_password()
                
                success = self.register_account(browser, email, password)
                
                if success:
                    success_count += 1
                else:
                    failed_count += 1
                
                # 随机延迟，避免被检测
                delay = random.uniform(5, 15)
                print(f"  等待 {delay:.1f} 秒...")
                time.sleep(delay)
            
            browser.close()
        
        print("\n" + "=" * 60)
        print(f"注册完成！")
        print(f"成功：{success_count} 个")
        print(f"失败：{failed_count} 个")
        print(f"成功率：{success_count/count*100:.1f}%")
        print("=" * 60)
        
        return success_count
    
    def list_accounts(self, status: str = None):
        """列出账号"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if status:
            cursor.execute('SELECT * FROM accounts WHERE status = ?', (status,))
        else:
            cursor.execute('SELECT * FROM accounts')
        
        accounts = cursor.fetchall()
        conn.close()
        
        print(f"\n账号列表 (共 {len(accounts)} 个):")
        print("-" * 100)
        print(f"{'ID':<5} {'邮箱':<40} {'状态':<15} {'剩余额度':<10} {'使用次数':<10}")
        print("-" * 100)
        
        for acc in accounts:
            print(f"{acc[0]:<5} {acc[1]:<40} {acc[7]:<15} {acc[6]:<10.2f} {acc[5]:<10}")
        
        return accounts
    
    def export_accounts(self, output_file: str = "accounts.json"):
        """导出账号"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM accounts')
        accounts = [dict(row) for row in cursor.fetchall()]
        
        conn.close()
        
        # 移除敏感信息（可选）
        for acc in accounts:
            # 可以选择是否导出密码
            pass
        
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(accounts, f, indent=2, ensure_ascii=False)
        
        print(f"账号已导出到：{output_file}")
        return accounts


def main():
    parser = argparse.ArgumentParser(
        description='ChatGPT 自动注册脚本',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python3 auto-register-chatgpt.py --count 10 --domain yourdomain.com
  python3 auto-register-chatgpt.py --list
  python3 auto-register-chatgpt.py --export accounts.json
        """
    )
    
    parser.add_argument('--count', type=int, default=10,
                        help='注册账号数量 (默认：10)')
    parser.add_argument('--domain', type=str, required=False,
                        help='邮箱域名 (从配置文件读取)')
    parser.add_argument('--db', type=str, default='credentials.db',
                        help='数据库文件路径 (默认：credentials.db)')
    parser.add_argument('--config', type=str,
                        help='配置文件路径')
    parser.add_argument('--list', action='store_true',
                        help='列出所有账号')
    parser.add_argument('--status', type=str,
                        help='筛选账号状态 (active, pending, etc.)')
    parser.add_argument('--export', type=str,
                        help='导出账号到 JSON 文件')
    parser.add_argument('--headless', action='store_true',
                        help='无头模式运行浏览器')
    parser.add_argument('--test', action='store_true',
                        help='测试模式（只注册 1 个）')
    
    args = parser.parse_args()
    
    # 测试模式
    if args.test:
        args.count = 1
        args.headless = False
    
    # 获取域名
    domain = args.domain
    if not domain:
        config_path = args.config or str(Path.home() / ".freemail" / "freemail_config.yaml")
        try:
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
                domain = config.get('domain')
        except:
            print("错误：未指定域名且配置文件未找到")
            print("请使用 --domain 参数指定域名")
            sys.exit(1)
    
    if not domain:
        print("错误：无法获取域名")
        sys.exit(1)
    
    # 创建注册器
    registrer = ChatGPTRegistrer(
        domain=domain,
        db_path=args.db,
        config_path=args.config
    )
    
    # 执行操作
    if args.list:
        registrer.list_accounts(status=args.status)
    elif args.export:
        registrer.export_accounts(args.export)
    else:
        registrer.register_batch(count=args.count, headless=args.headless)


if __name__ == "__main__":
    main()
