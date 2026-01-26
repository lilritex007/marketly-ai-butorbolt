# Backend Testing Guide

## Quick Start Testing

### 1. Start Backend Server

```bash
npm run server
```

Expected output:
```
🚀 UNAS Proxy Server running on port 3001
📦 Cache TTL: 300 seconds
🔗 UNAS API URL: https://www.marketly.hu/api/product-feed
```

### 2. Test Health Endpoint

```bash
curl http://localhost:3001/health
```

Expected:
```json
{
  "status": "ok",
  "timestamp": "2026-01-25T13:00:00.000Z"
}
```

### 3. Test UNAS Products Endpoint

```bash
curl http://localhost:3001/api/unas/products
```

Expected (successful):
```json
{
  "products": [...],
  "cached": false,
  "lastUpdated": "2026-01-25T13:00:00.000Z",
  "count": 150
}
```

Expected (with error/stale cache):
```json
{
  "products": [...],
  "cached": true,
  "stale": true,
  "error": "Connection timeout",
  "lastUpdated": "2026-01-25T12:55:00.000Z"
}
```

### 4. Test Cache

```bash
# Get cache info
curl http://localhost:3001/api/cache/info

# Clear cache
curl -X POST http://localhost:3001/api/cache/clear

# Force refresh (bypass cache)
curl http://localhost:3001/api/unas/products?refresh=true
```

## Frontend Testing

### 1. Start Full Application

```bash
npm run dev:full
```

This starts both backend (port 3001) and frontend (port 3000).

### 2. Test in Browser

1. Open http://localhost:3000
2. Check browser console (F12) for:
   - `Fetching products from UNAS...`
   - `Loaded X products from UNAS`
3. Verify top bar shows "Frissítve: most" or time
4. Click "UNAS Frissítés" button
5. Watch spinner animation and data reload

### 3. Test Error Handling

**Simulate Backend Down:**
1. Stop backend server (Ctrl+C)
2. Refresh frontend page
3. Should show error in top bar
4. Products remain (fallback to last known data)

**Simulate Auth Error:**
1. Set wrong credentials in .env
2. Restart backend
3. Check console for 401 error
4. Verify graceful degradation

## Test Scenarios

### ✅ Happy Path
- [ ] Backend starts without errors
- [ ] Health check responds
- [ ] UNAS products load successfully
- [ ] Products display in UI
- [ ] Manual refresh works
- [ ] Cache updates correctly

### ⚠️ Error Scenarios
- [ ] UNAS API unreachable → Serves stale cache
- [ ] Auth failure (401) → Error message shown
- [ ] Timeout (slow response) → Timeout error
- [ ] Invalid data format → Parser error shown
- [ ] Empty response → "No products" message

### 🔄 Cache Scenarios
- [ ] First load → Cache miss, API call
- [ ] Second load (within 5min) → Cache hit
- [ ] After 5min → Cache expired, new API call
- [ ] Manual refresh → Bypass cache

### 📊 Data Format Tests
- [ ] JSON feed → Parses correctly
- [ ] XML feed → Parses correctly
- [ ] CSV feed → Parses correctly
- [ ] Unknown format → Error message

## Common Issues & Solutions

### Issue: "ECONNREFUSED" Error

**Symptom:** Cannot connect to backend

**Solution:**
```bash
# Check if backend is running
curl http://localhost:3001/health

# If not, start it
npm run server
```

### Issue: "UNAS_API_URL not configured"

**Symptom:** Backend starts but crashes on first request

**Solution:**
```bash
# Create .env file from example
cp .env.example .env

# Edit .env and add your UNAS credentials
```

### Issue: CORS Error in Browser

**Symptom:** "Access to fetch blocked by CORS policy"

**Solution:**
- Ensure backend is running
- Check FRONTEND_URL in .env matches your frontend URL
- Restart backend after .env changes

### Issue: "401 Unauthorized"

**Symptom:** Auth failure from UNAS

**Solution:**
- Verify UNAS_USERNAME and UNAS_PASSWORD in .env
- Test credentials manually with curl
- Check UNAS API documentation for correct format

## Performance Testing

### Load Test Script

```bash
# Install hey (HTTP load testing tool)
# Windows: scoop install hey
# Mac: brew install hey

# Test 100 requests
hey -n 100 -c 10 http://localhost:3001/api/unas/products
```

Expected results:
- Response time < 200ms (cached)
- Response time < 2000ms (fresh API call)
- 0% error rate

### Memory Test

Monitor backend memory usage:
```bash
# Linux/Mac
top -p $(pgrep -f "node server/index.js")

# Windows
# Use Task Manager or Process Explorer
```

Should stay under 100MB for normal operation.

## Automated Testing (Future)

Create test files:

```javascript
// tests/backend.test.js
import { fetchUnasProducts } from '../src/services/unasApi.js';

describe('UNAS API Integration', () => {
  test('fetches products successfully', async () => {
    const result = await fetchUnasProducts();
    expect(result.products).toBeDefined();
    expect(Array.isArray(result.products)).toBe(true);
  });
  
  test('handles cache correctly', async () => {
    const first = await fetchUnasProducts();
    const second = await fetchUnasProducts();
    expect(second.cached).toBe(true);
  });
});
```

## Monitoring Checklist

For production:
- [ ] Set up error logging (Sentry, LogRocket)
- [ ] Monitor API response times
- [ ] Track cache hit rate
- [ ] Alert on auth failures
- [ ] Monitor memory/CPU usage
- [ ] Log UNAS API availability

## Success Criteria

All tests pass:
✅ Backend starts and responds to health check
✅ UNAS products load and display
✅ Cache works (hit after 1st request)
✅ Manual refresh bypasses cache
✅ Error handling graceful (stale cache on failure)
✅ Auto-refresh every 5 minutes
✅ Frontend UI shows loading states
✅ No console errors in normal operation

---

**Last Updated:** 2026-01-25
**Status:** Implementation Complete ✅
