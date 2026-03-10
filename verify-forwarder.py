#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
验证码自动转发脚本
功能：监控邮箱，提取 ChatGPT 验证码，自动完成验证
"""

import argparse
import re
import time
import sqlite3
import email
import imaplib
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple

try:
    import yaml
    from playwright.sync_api import sync_playwright
except ImportError as e:
    print(f"缺少依赖：{e}")
    print("请运行：pip install pyyaml playwright")
    print("然后运行：playwright install")
    import sys
    sys.exit(1)


class VerificationForwarder:
    """验证码自动转发器"""
    
    def __init__(self, email_address: str, password: str, 
                 db_path: str = "credentials.db",
                 imap_server: str = "imap.gmail.com",
                 imap_port: int = 993):
        self.email_address = email_address
        self.password = password
        self.db_path = db_path
        self.imap_server = imap_server
        self.imap_port = imap_port
        self.seen_emails = set()  # 已处理的邮件 ID
        
    def connect_imap(self) -> imaplib.IMAP4_SSL:
        """连接 IMAP 服务器"""
        try:
            imap = imaplib.IMAP4_SSL(self.imap_server, self.imap_port)
            imap.login(self.email_address, self.password)
            imap.select('INBOX')
            print(f"✓ 已连接到 IMAP 服务器：{self.imap_server}")
            return imap
        except Exception as e:
            print(f"✗ IMAP 连接失败：{e}")
            print("提示：Gmail 需要使用应用专用密码")
            print("获取方式：Google 账号 → 安全 → 应用专用密码")
            raise
    
    def fetch_unread_emails(self, imap: imaplib.IMAP4_SSL, limit: int = 10):
        """获取未读邮件"""
        try:
            # 搜索未读邮件
            status, messages = imap.search(None, 'UNSEEN')
            email_ids = messages[0].split()
            
            if not email_ids:
                return []
            
            # 获取最新的 limit 封邮件
            email_ids = email_ids[-limit:]
            
            emails = []
            for email_id in email_ids:
                if email_id in self.seen_emails:
                    continue
                    
                status, msg_data = imap.fetch(email_id, '(RFC822)')
                if status == 'OK':
                    email_msg = email.message_from_bytes(msg_data[0][1])
                    emails.append((email_id, email_msg))
                    self.seen_emails.add(email_id)
            
            return emails
            
        except Exception as e:
            print(f"✗ 获取邮件失败：{e}")
            return []
    
    def extract_verification_code(self, email_msg) -> Optional[str]:
        """从邮件内容提取验证码"""
        # 获取邮件正文
        body = ""
        if email_msg.is_multipart():
            for part in email_msg.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))
                
                # 跳过附件
                if "attachment" in content_disposition:
                    continue
                
                if content_type == "text/plain":
                    try:
                        body = part.get_payload(decode=True).decode('utf-8', errors='ignore')
                        break
                    except:
                        pass
        else:
            try:
                body = email_msg.get_payload(decode=True).decode('utf-8', errors='ignore')
            except:
                pass
        
        if not body:
            return None
        
        # 常见验证码模式
        patterns = [
            r'\b\d{6}\b',  # 6 位数字
            r'\b\d{4}\b',  # 4 位数字
            r'[A-Z]{6}',   # 6 位大写字母
            r'verification code[:\s]+([A-Z0-9]{6})',  # 明确标注
            r'验证码[:\s]+([A-Z0-9]{6})',  # 中文标注
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, body, re.IGNORECASE)
            if matches:
                code = matches[0]
                print(f"  找到验证码：{code}")
                return code
        
        return None
    
    def is_chatgpt_email(self, email_msg) -> bool:
        """判断是否为 ChatGPT 验证邮件"""
        subject = email_msg.get('Subject', '')
        from_addr = email_msg.get('From', '')
        
        chatgpt_indicators = [
            'chat.openai.com',
            'openai',
            'chatgpt',
            'verify your email',
            'email verification',
            '确认您的邮箱'
        ]
        
        subject_lower = subject.lower()
        from_lower = from_addr.lower()
        
        for indicator in chatgpt_indicators:
            if indicator.lower() in subject_lower or indicator.lower() in from_lower:
                return True
        
        return False
    
    def update_account_status(self, email: str, status: str = "active"):
        """更新账号状态"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE accounts 
                SET status = ?, last_used = ?
                WHERE email = ?
            ''', (status, datetime.now(), email))
            
            conn.commit()
            conn.close()
            print(f"  ✓ 账号状态已更新：{email} → {status}")
            
        except Exception as e:
            print(f"  ✗ 更新账号状态失败：{e}")
    
    def auto_verify(self, email: str, code: str, headless: bool = False) -> bool:
        """自动完成邮箱验证"""
        try:
            print(f"  开始自动验证：{email}")
            
            with sync_playwright() as playwright:
                browser = playwright.chromium.launch(headless=headless)
                context = browser.new_context()
                page = context.new_page()
                
                # 访问验证链接（需要从邮件中提取，这里简化处理）
                # 实际需要从邮件中获取验证链接
                page.goto("https://chat.openai.com/auth/verify", timeout=60000)
                time.sleep(3)
                
                # 填写验证码
                try:
                    code_input = page.locator('input[autocomplete="one-time-code"]')
                    if code_input.count() > 0:
                        code_input.first.fill(code)
                        print(f"  已输入验证码：{code}")
                        
                        # 提交
                        page.click('button:has-text("Verify")', timeout=10000)
                        time.sleep(2)
                        
                        # 检查验证结果
                        page_content = page.content()
                        if "verified" in page_content.lower() or "success" in page_content.lower():
                            print(f"  ✓ 验证成功")
                            self.update_account_status(email, "active")
                            return True
                        else:
                            print(f"  ✗ 验证可能失败")
                            return False
                    else:
                        print(f"  ✗ 未找到验证码输入框")
                        return False
                        
                except Exception as e:
                    print(f"  ✗ 验证过程出错：{e}")
                    return False
                    
                finally:
                    browser.close()
                    
        except Exception as e:
            print(f"  ✗ 自动验证失败：{e}")
            return False
    
    def monitor(self, interval: int = 30, max_iterations: int = None):
        """监控邮箱"""
        print(f"\n开始监控邮箱：{self.email_address}")
        print(f"检查间隔：{interval} 秒")
        print(f"数据库：{self.db_path}")
        print("-" * 60)
        
        iteration = 0
        
        try:
            while True:
                iteration += 1
                
                # 连接 IMAP
                imap = self.connect_imap()
                
                # 获取未读邮件
                emails = self.fetch_unread_emails(imap, limit=10)
                
                if emails:
                    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] 发现 {len(emails)} 封新邮件")
                    
                    for email_id, email_msg in emails:
                        subject = email_msg.get('Subject', '无主题')
                        from_addr = email_msg.get('From', '未知')
                        
                        print(f"\n  邮件：{subject}")
                        print(f"  发件人：{from_addr}")
                        
                        # 检查是否为 ChatGPT 邮件
                        if self.is_chatgpt_email(email_msg):
                            print(f"  → ChatGPT 验证邮件")
                            
                            # 提取验证码
                            code = self.extract_verification_code(email_msg)
                            
                            if code:
                                # 尝试从收件人地址推断账号邮箱
                                # 这里简化处理，实际需要解析收件人
                                print(f"  验证码：{code}")
                                
                                # 自动验证
                                # 注意：需要知道具体是哪个账号的验证邮件
                                # 这里需要更复杂的逻辑来匹配
                                print(f"  等待手动处理或配置自动匹配...")
                            else:
                                print(f"  ✗ 未找到验证码")
                        else:
                            print(f"  → 非 ChatGPT 邮件，跳过")
                
                else:
                    if iteration % 10 == 0:
                        print(f"[{datetime.now().strftime('%H:%M:%S')}] 无新邮件...")
                
                # 断开连接
                imap.close()
                imap.logout()
                
                # 检查是否达到最大迭代次数
                if max_iterations and iteration >= max_iterations:
                    print(f"\n达到最大迭代次数 {max_iterations}，停止监控")
                    break
                
                # 等待下一次检查
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n\n监控已手动停止")
        except Exception as e:
            print(f"\n监控出错：{e}")
        finally:
            print("验证码转发服务已停止")
    
    def test_connection(self):
        """测试邮箱连接"""
        print("测试邮箱连接...")
        try:
            imap = self.connect_imap()
            imap.close()
            imap.logout()
            print("✓ 邮箱连接测试成功")
            return True
        except Exception as e:
            print(f"✗ 邮箱连接测试失败：{e}")
            return False


def main():
    parser = argparse.ArgumentParser(
        description='验证码自动转发脚本',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python3 verify-forwarder.py --email you@gmail.com --password APP_PASSWORD
  python3 verify-forwarder.py --test  # 测试连接
  python3 verify-forwarder.py --email you@gmail.com --password xxx --interval 60
        """
    )
    
    parser.add_argument('--email', type=str, required=True,
                        help='主邮箱地址')
    parser.add_argument('--password', type=str, required=True,
                        help='邮箱密码或应用专用密码')
    parser.add_argument('--db', type=str, default='credentials.db',
                        help='账号数据库路径')
    parser.add_argument('--imap-server', type=str, default='imap.gmail.com',
                        help='IMAP 服务器地址')
    parser.add_argument('--imap-port', type=int, default=993,
                        help='IMAP 服务器端口')
    parser.add_argument('--interval', type=int, default=30,
                        help='检查间隔（秒）')
    parser.add_argument('--max-iterations', type=int,
                        help='最大检查次数（不指定则无限）')
    parser.add_argument('--test', action='store_true',
                        help='测试邮箱连接')
    parser.add_argument('--headless', action='store_true',
                        help='无头模式运行浏览器')
    
    args = parser.parse_args()
    
    # 创建转发器
    forwarder = VerificationForwarder(
        email_address=args.email,
        password=args.password,
        db_path=args.db,
        imap_server=args.imap_server,
        imap_port=args.imap_port
    )
    
    # 执行操作
    if args.test:
        forwarder.test_connection()
    else:
        forwarder.monitor(
            interval=args.interval,
            max_iterations=args.max_iterations
        )


if __name__ == "__main__":
    main()
