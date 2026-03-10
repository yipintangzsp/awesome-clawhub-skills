#!/bin/bash
# UK Proxy Tester - Tests proxies and reports working ones

PROXY_FILE="/tmp/proxies_test.txt"
RESULTS_FILE="/tmp/proxy_results.txt"
MAX_PROXIES=20
TIMEOUT=5

# Get fresh proxy list
echo "Fetching proxy list..."
curl -s --max-time 10 "https://api.openproxylist.xyz/http.txt" 2>/dev/null | head -100 > "$PROXY_FILE"

# Clear results
> "$RESULTS_FILE"

echo "Testing proxies..."
count=0
working=0

while IFS= read -r proxy; do
    [ -z "$proxy" ] && continue
    [ $count -ge $MAX_PROXIES ] && break
    
    count=$((count + 1))
    ip=$(echo "$proxy" | cut -d: -f1)
    port=$(echo "$proxy" | cut -d: -f2)
    
    # Test proxy by making a request through it
    response=$(curl -s --max-time $TIMEOUT --proxy "$proxy" --connect-timeout $TIMEOUT "https://httpbin.org/ip" 2>/dev/null)
    
    if [ -n "$response" ] && echo "$response" | grep -q "origin"; then
        working=$((working + 1))
        # Try to get country info
        country=$(echo "$response" | grep -oE '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' | head -1)
        echo "✅ WORKING: $proxy (exit IP: $country)" >> "$RESULTS_FILE"
        echo "  Response: $response" >> "$RESULTS_FILE"
    else
        echo "❌ FAILED: $proxy" >> "$RESULTS_FILE"
    fi
    
    echo "Tested $count/$MAX_PROXIES, Working: $working"
done < "$PROXY_FILE"

echo ""
echo "=== SUMMARY ==="
echo "Total tested: $count"
echo "Working: $working"
echo ""
echo "=== WORKING PROXIES ==="
grep "✅ WORKING" "$RESULTS_FILE"
