#!/bin/sh
# OpenClaw Workspace Auto Backup
# Run this daily to backup workspace to GitHub

cd /Users/admin/.openclaw/workspace

git add .
git commit -m "workspace backup $(date +%Y-%m-%d)" || true
git push origin main

if [ $? -eq 0 ]; then
    echo "BACKUP_OK"
else
    echo "BACKUP_FAILED"
fi
