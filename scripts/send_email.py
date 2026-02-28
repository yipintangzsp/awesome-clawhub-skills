#!/usr/bin/env python3
"""
OpenClaw Top 50 Report Email Sender
Send email via Gmail SMTP
"""

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from dotenv import load_dotenv

load_dotenv()

def send_top50_report(to_email, subject, content):
    """Send email via Gmail SMTP"""
    
    gmail_email = os.getenv('GMAIL_EMAIL')
    gmail_password = os.getenv('GMAIL_APP_PASSWORD')
    
    if not gmail_email or not gmail_password:
        print("❌ Error: GMAIL_EMAIL or GMAIL_APP_PASSWORD not configured")
        print("Please set these in ~/.openclaw/workspace/.env")
        return False
    
    msg = MIMEMultipart()
    msg['From'] = gmail_email
    msg['To'] = to_email
    msg['Subject'] = subject
    
    msg.attach(MIMEText(content, 'plain', 'utf-8'))
    
    try:
        server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        server.login(gmail_email, gmail_password)
        server.send_message(msg)
        server.quit()
        print(f"✅ Email sent successfully to {to_email}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        return False

if __name__ == '__main__':
    # Test email
    to_email = "zsp779245070@gmail.com"
    subject = "🦞 OpenClaw Top 50 使用报告 - 2026 年 2 月"
    content = """
OpenClaw Top 50 使用报告

详见飞书消息或等待完整报告...
    """
    send_top50_report(to_email, subject, content)
