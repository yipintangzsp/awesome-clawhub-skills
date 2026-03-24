#!/bin/bash
# Fast UK Proxy Finder - Parallel testing
set -e

WORKSPACE="/Users/admin/.openclaw/workspace"
mkdir -p "$WORKSPACE/tmp"

echo "=== Fast UK Proxy Finder ==="
echo "Started: $(date)"

# Fetch proxy list
echo "Fetching proxy list..."
curl -sL --max-time 30 "https://api.openproxylist.xyz/http.txt" > "$WORKSPACE/tmp/proxies_raw.txt" 2>/dev/null || {
    echo "Failed to fetch proxy list"
    exit 1
}

TOTAL=$(wc -l < "$WORKSPACE/tmp/proxies_raw.txt")
echo "Fetched $TOTAL proxies"

# Take first 50 for quick testing
head -50 "$WORKSPACE/tmp/proxies_raw.txt" > "$WORKSPACE/tmp/proxies_sample.txt"

# Test function
test_proxy() {
    local proxy=$1
    local timeout=5
    
    # Quick connectivity test
    local response=$(curl -s --max-time $timeout -x "$proxy" "https://httpbin.org/ip" 2>/dev/null)
    if [[ -n "$response" ]] && echo "$response" | grep -q "origin"; then
        local apparent_ip=$(echo "$response" | grep -oE "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+" | head -1)
        if [[ -n "$apparent_ip" ]]; then
            # Check country
            local country=$(curl -s --max-time $timeout "https://ipapi.co/$apparent_ip/country/" 2>/dev/null || echo "")
            if [[ "$country" == "GB" ]]; then
                echo "UK:$proxy:$apparent_ip"
            fi
        fi
    fi
}

export -f test_proxy

echo "Testing proxies (parallel)..."
# Run tests in parallel (max 10 concurrent)
cat "$WORKSPACE/tmp/proxies_sample.txt" | xargs -P 10 -I {} bash -c 'test_proxy "$@"' _ {} > "$WORKSPACE/tmp/results.txt" 2>/dev/null || true

# Process results
UK_COUNT=$(grep -c "^UK:" "$WORKSPACE/tmp/results.txt" 2>/dev/null || echo "0")
echo "Found $UK_COUNT UK proxies"

# Generate report
REPORT="🇬🇧 英国免费代理节点更新 $(date +%Y-%m-%d %H:%M)

✅ 测试完成
📊 扫描数量: 50
🎯 可用英国节点: $UK_COUNT

"

if [[ $UK_COUNT -gt 0 ]]; then
    REPORT+="📋 可用节点列表:
"
    grep "^UK:" "$WORKSPACE/tmp/results.txt" | while IFS=':' read -r status proxy ip; do
        REPORT+="• $proxy
"
    done
else
    REPORT+="⚠️ 本次扫描未找到可用的英国代理节点
可能原因:
- 网络延迟较高
- 代理节点已失效
- 需要增加扫描数量

建议: 稍后重试或联系管理员
"
fi

REPORT+="
🔄 下次更新: 明日 08:00
---
自动代理节点更新服务"

echo ""
echo "$REPORT"

# Save report
echo "$REPORT" > "$WORKSPACE/tmp/uk_proxy_report.txt"

# Check for WeCom webhook
if [[ -n "$WECOM_WEBHOOK_URL" ]]; then
    echo ""
    echo "Sending to WeCom..."
    # URL encode the report
    ENCODED_REPORT=$(python3 -c "import urllib.parse,json; print(json.dumps({'msgtype':'text','text':{'content':'''$(echo "$REPORT" | sed "s/'/'\\\\''/g")'''}}))" 2>/dev/null || echo "")
    
    if [[ -n "$ENCODED_REPORT" ]]; then
        curl -s -X POST "$WECOM_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "$ENCODED_REPORT" \
            --max-time 10 && echo "✓ Sent to WeCom" || echo "✗ Failed to send"
    else
        # Fallback: simple text send
        curl -s -X POST "$WECOM_WEBHOOK_URL" \
            -H "Content-Type: application/json" \
            -d "{\"msgtype\":\"text\",\"text\":{\"content\":\"UK Proxy Update: Found $UK_COUNT working proxies. Check workspace/tmp/uk_proxy_report.txt for details.\"}}" \
            --max-time 10 || echo "Failed to send to WeCom"
    fi
else
    echo ""
    echo "⚠️ WeCom webhook not configured (WECOM_WEBHOOK_URL not set)"
    echo "Report saved to: $WORKSPACE/tmp/uk_proxy_report.txt"
fi

echo ""
echo "Completed: $(date)"
