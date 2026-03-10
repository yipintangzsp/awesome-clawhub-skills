#!/bin/bash
# Quick Proxy Port Checker

PROXY_FILE="/tmp/proxies_https.txt"
count=0
open=0

echo "Checking proxy ports..."
while IFS= read -r proxy; do
    [ -z "$proxy" ] && continue
    [ $count -ge 30 ] && break
    
    count=$((count + 1))
    ip=$(echo "$proxy" | cut -d: -f1)
    port=$(echo "$proxy" | cut -d: -f2)
    
    # Quick port check with nc
    if nc -z -w 2 "$ip" "$port" 2>/dev/null; then
        open=$((open + 1))
        echo "✅ OPEN: $proxy"
    else
        echo "❌ CLOSED: $proxy"
    fi
done < "$PROXY_FILE"

echo ""
echo "Total: $count, Open ports: $open"
