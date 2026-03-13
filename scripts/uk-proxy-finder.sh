#!/bin/bash
# UK Proxy Finder and Tester
# Fetches free proxies, filters for UK, tests availability, outputs results

set -e

PROXY_FILE="/tmp/proxies_raw.txt"
UK_PROXY_FILE="/tmp/uk_proxies.txt"
RESULTS_FILE="/tmp/uk_proxy_results.json"

echo "🔍 Fetching proxy lists..."

# Fetch proxy lists from GitHub
curl -sS "https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt" > "$PROXY_FILE" 2>/dev/null || true
curl -sS "https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/all/data.txt" >> "$PROXY_FILE" 2>/dev/null || true

echo "📋 Processing proxies..."

# Extract HTTP proxies (format: IP:PORT)
grep -E '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+$' "$PROXY_FILE" | sort -u > "$UK_PROXY_FILE"

TOTAL=$(wc -l < "$UK_PROXY_FILE")
echo "Found $TOTAL total proxies"

# Test proxies and check UK location
echo "🧪 Testing proxies for UK location..."

WORKING_UK_PROXIES=()
TESTED=0
MAX_TEST=50  # Test max 50 proxies to avoid timeout

while IFS= read -r proxy; do
    [ $TESTED -ge $MAX_TEST ] && break
    
    IP=$(echo "$proxy" | cut -d: -f1)
    PORT=$(echo "$proxy" | cut -d: -f2)
    
    # Quick connectivity test with timeout
    if timeout 3 bash -c "echo > /dev/tcp/$IP/$PORT" 2>/dev/null; then
        # Check location using ipapi.co (free, no key needed)
        COUNTRY=$(curl -sS --connect-timeout 2 "http://ipapi.co/$IP/country_code/" 2>/dev/null || echo "")
        
        if [ "$COUNTRY" = "GB" ]; then
            echo "✅ UK Found: $proxy"
            WORKING_UK_PROXIES+=("$proxy")
        fi
    fi
    
    TESTED=$((TESTED + 1))
    
    # Progress indicator
    if [ $((TESTED % 10)) -eq 0 ]; then
        echo "  Tested: $TESTED / $MAX_TEST, UK found: ${#WORKING_UK_PROXIES[@]}"
    fi
done < "$UK_PROXY_FILE"

echo ""
echo "📊 Results:"
echo "  Total tested: $TESTED"
echo "  UK proxies found: ${#WORKING_UK_PROXIES[@]}"

# Output results
if [ ${#WORKING_UK_PROXIES[@]} -gt 0 ]; then
    echo ""
    echo "🇬🇧 Working UK Proxies:"
    for p in "${WORKING_UK_PROXIES[@]}"; do
        echo "  - $p"
    done
else
    echo "⚠️ No working UK proxies found in this batch"
    echo "💡 Try again later - free proxies change frequently"
fi

# Clean up
rm -f "$PROXY_FILE" "$UK_PROXY_FILE"
