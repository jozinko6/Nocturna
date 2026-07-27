#!/bin/bash
set -e

BASE_URL="${1:-http://localhost:3000}"
FAILURES=0

echo "Nocturna Smoke Tests"
echo "Base URL: $BASE_URL"
echo "==================="

check_endpoint() {
  local name="$1"
  local method="${2:-GET}"
  local url="$3"
  local expected_status="${4:-200}"

  status=$(curl -s -o /dev/null -w "%{http_code}" -X "$method" "$BASE_URL$url")
  if [ "$status" = "$expected_status" ]; then
    echo "  ✓ $name ($status)"
  else
    echo "  ✗ $name (expected $expected_status, got $status)"
    FAILURES=$((FAILURES + 1))
  fi
}

echo ""
echo "Endpoints:"
check_endpoint "Home page" GET "/"
check_endpoint "Login page" GET "/login"
check_endpoint "Register page" GET "/register"
check_endpoint "Liveness" GET "/api/health/liveness" 200
check_endpoint "Readiness" GET "/api/health/readiness" 200

echo ""
echo "Security Headers:"
HEADERS=$(curl -s -I "$BASE_URL/")
check_header() {
  local name="$1"
  local expected="$2"
  if echo "$HEADERS" | grep -qi "$expected"; then
    echo "  ✓ $name"
  else
    echo "  ✗ $name (missing)"
    FAILURES=$((FAILURES + 1))
  fi
}

check_header "X-Frame-Options" "X-Frame-Options: DENY"
check_header "X-Content-Type-Options" "X-Content-Type-Options: nosniff"
check_header "Strict-Transport-Security" "Strict-Transport-Security"
check_header "Content-Security-Policy" "Content-Security-Policy"

echo ""
echo "Static Assets:"
check_endpoint "Manifest" GET "/manifest.json"
check_endpoint "Favicon" GET "/favicon.ico"

echo ""
echo "Performance:"
TOTAL_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$BASE_URL/")
echo "  Home page load time: ${TOTAL_TIME}s"
if (( $(echo "$TOTAL_TIME > 3.0" | bc -l 2>/dev/null || echo 0) )); then
  echo "  ✗ Load time exceeds 3s threshold"
  FAILURES=$((FAILURES + 1))
else
  echo "  ✓ Load time within threshold"
fi

echo ""
echo "==================="
if [ $FAILURES -gt 0 ]; then
  echo "FAILED: $FAILURES check(s) failed"
  exit 1
else
  echo "PASSED: All checks passed"
fi
