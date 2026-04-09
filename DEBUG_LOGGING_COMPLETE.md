# Debug Logging - Complete Setup

## What Was Added

I've added comprehensive debug logging to help you pinpoint exactly where the cookie authentication flow is breaking.

## Files Modified

### 1. `vite.config.ts`
- **Enhanced proxy logging** with detailed before/after cookie rewriting
- Shows RAW cookies from backend
- Shows REWRITTEN cookies sent to browser
- Lists all changes made (Secure removed, SameSite changed, etc.)
- Formatted with clear visual separators

### 2. `src/stores/authStore.ts`
- **Comprehensive login flow logging** with step-by-step progress
- Shows each stage: Request → Response → Store Update → Cookie Verification
- Automatic cookie verification 200ms after login
- Detailed success/failure messages
- Troubleshooting guide printed to console on failure

### 3. `src/api/client.ts`
- **Improved request logging** for auth endpoints
- Shows withCredentials status
- Reminds that HttpOnly cookies are invisible to JavaScript

## How to Use

### Step 1: Restart Dev Server (REQUIRED!)
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Clear Browser Cookies
1. DevTools (F12) → Application → Cookies → http://localhost:5173
2. Right-click → Clear

### Step 3: Open Console and Network Tabs
1. Console tab - for detailed flow logging
2. Network tab - for HTTP request/response inspection
3. Keep both visible if possible

### Step 4: Attempt Login
1. Go to /login
2. Enter: `test@focusforest.com` / `password`
3. Click "Enter the forest"
4. Watch the logs

## What You'll See

### In the BROWSER CONSOLE

#### Successful Login Flow:
```
╔═══════════════════════════════════════════════════════╗
║  🔐 LOGIN FLOW - Starting                            ║
╚═══════════════════════════════════════════════════════╝
📧 Email: test@focusforest.com

📤 Step 1: Sending POST /auth/login...

🌐 API Request: POST /auth/login
   withCredentials: true

✅ Step 1 Complete: Login request succeeded
   Status: 200
   User: test@focusforest.com

💾 Step 2: Setting user in auth store...
✅ Step 2 Complete: User set in store

🔍 Step 3: Verifying cookie persistence...
   Waiting 200ms for cookies to be stored...
   Attempting GET /auth/me to verify cookies...

🌐 API Request: GET /auth/me
   withCredentials: true

╔═══════════════════════════════════════════════════════╗
║  ✅ COOKIE VERIFICATION SUCCESSFUL                   ║
╚═══════════════════════════════════════════════════════╝
   Status: 200
   User: test@focusforest.com
   🎉 Cookies are working! Session will persist.

╔═══════════════════════════════════════════════════════╗
║  🔐 LOGIN FLOW - Complete                            ║
╚═══════════════════════════════════════════════════════╝
```

#### Failed Cookie Verification:
```
╔═══════════════════════════════════════════════════════╗
║  ❌ COOKIE VERIFICATION FAILED                       ║
╚═══════════════════════════════════════════════════════╝
   Status: 401
   Error: { error: { code: 'UNAUTHORIZED', ... } }

   🔴 PROBLEM DETECTED: Cookies are NOT being sent!

   Debugging steps:
   1. Check the terminal for Vite proxy logs
      - Look for "VITE PROXY - Cookie Response Detected"
      - Verify cookies were rewritten (Secure removed, SameSite=Lax)

   2. Check DevTools → Application → Cookies → http://localhost:5173
      - Are sb-access-token and sb-refresh-token present?
      - If YES but verification failed: Browser is not sending them
      - If NO: Browser rejected the cookies (check attributes)

   3. Check DevTools → Network → GET /auth/me
      - Click on the request → Headers tab
      - Look at Request Headers
      - Is there a "Cookie:" header?
      - If NO: Cookies are not being sent by browser

   4. Check the POST /auth/login response
      - Network tab → POST /auth/login → Headers tab
      - Look at Response Headers
      - Should see "Set-Cookie:" headers
      - If NO: Backend is not setting cookies

   ⚠️  Common causes:
      - Vite dev server not restarted after config changes
      - Old cookies interfering (clear all cookies)
      - Browser security settings blocking cookies
      - Incognito mode with strict cookie settings
```

### In the TERMINAL (Vite Dev Server)

#### When Login Response is Received:
```
═══════════════════════════════════════════════════════
🍪 VITE PROXY - Cookie Response Detected
═══════════════════════════════════════════════════════
📍 URL: /api/v1/auth/login
📊 Status: 200

🔴 RAW Set-Cookie Headers from Backend:
   [0] sb-access-token=eyJhbGciOiJFUzI1NiIsImtpZCI6Ijh...; Max-Age=3600; Path=/; Expires=Wed, 08 Apr 2026 19:42:10 GMT; HttpOnly; Secure; SameSite=Strict
   [1] sb-refresh-token=k7lcn5yheeex; Max-Age=604800; Path=/; Expires=Wed, 15 Apr 2026 18:42:10 GMT; HttpOnly; Secure; SameSite=Strict

🟢 REWRITTEN Cookie [0]:
   sb-access-token=eyJhbGciOiJFUzI1NiIsImtpZCI6Ijh...; Max-Age=3600; Path=/; Expires=Wed, 08 Apr 2026 19:42:10 GMT; HttpOnly; SameSite=Lax
   ✏️  Changes made:
      - Removed: Secure flag
      - Changed: SameSite=Strict → SameSite=Lax

🟢 REWRITTEN Cookie [1]:
   sb-refresh-token=k7lcn5yheeex; Max-Age=604800; Path=/; Expires=Wed, 15 Apr 2026 18:42:10 GMT; HttpOnly; SameSite=Lax
   ✏️  Changes made:
      - Removed: Secure flag
      - Changed: SameSite=Strict → SameSite=Lax

✅ Cookies rewritten and sent to browser
═══════════════════════════════════════════════════════
```

## Diagnostic Scenarios

### Scenario 1: No Terminal Logs
**Symptom:** No proxy logs appear in terminal when you login

**Diagnosis:** Vite proxy is not intercepting responses

**Solution:**
1. Verify you restarted the dev server
2. Check vite.config.ts was saved correctly
3. Try stopping and starting again: `npm run dev`

### Scenario 2: Terminal Shows Cookies, Console Shows Failure
**Symptom:** 
- Terminal shows cookies were rewritten ✅
- Console shows "COOKIE VERIFICATION FAILED" ❌

**Diagnosis:** Cookies were rewritten but not stored by browser

**Next Steps:**
1. Check DevTools → Application → Cookies
2. If cookies are NOT there: Browser rejected them
   - Verify Secure flag was removed (check terminal)
   - Verify SameSite was changed to Lax (check terminal)
   - Try Incognito mode
3. If cookies ARE there: Browser is not sending them
   - Check Network tab → GET /auth/me → Request Headers
   - Should see Cookie header
   - If missing: SameSite or Path issue

### Scenario 3: Console Shows Success
**Symptom:** Console shows "COOKIE VERIFICATION SUCCESSFUL" ✅

**Diagnosis:** Everything is working!

**Verify:**
1. Navigate to /dashboard (should work)
2. Refresh page (should stay logged in)
3. Open new tab (should be logged in)

### Scenario 4: No Cookies in Terminal
**Symptom:** Terminal shows no proxy logs at all

**Diagnosis:** Backend is not setting cookies

**Solution:**
1. Check backend logs
2. Verify backend authentication is working
3. Check backend Supabase configuration

## Network Tab Reference

See `NETWORK_TAB_CHECKLIST.md` for detailed Network tab inspection guide.

### Quick Checks:

1. **POST /auth/login → Response Headers**
   - Should have: `Set-Cookie: sb-access-token=...; HttpOnly; SameSite=Lax`
   - Should NOT have: `Secure` flag

2. **Application → Cookies**
   - Should show: `sb-access-token` and `sb-refresh-token`
   - Both with: HttpOnly ✓, SameSite: Lax, Path: /

3. **GET /auth/me → Request Headers**
   - Should have: `Cookie: sb-access-token=...; sb-refresh-token=...`

## Success Criteria

✅ Terminal shows proxy rewriting cookies  
✅ Console shows "COOKIE VERIFICATION SUCCESSFUL"  
✅ Application → Cookies shows both tokens  
✅ Network → GET /auth/me includes Cookie header  
✅ GET /auth/me returns 200  
✅ User stays logged in  
✅ Page refresh maintains authentication  

## Failure Points to Check

If verification fails, the logs will tell you exactly which step failed:

1. **No terminal logs** → Proxy not working (restart server)
2. **Terminal logs but no cookies in Application** → Browser rejected (check attributes)
3. **Cookies in Application but no Cookie header** → Browser not sending (check SameSite)
4. **Cookie header but 401 response** → Backend issue (check backend logs)

## What to Report

If it still doesn't work, provide:

1. **Full console output** from login attempt
2. **Full terminal output** from Vite proxy
3. **Screenshot** of Network tab → POST /auth/login → Response Headers
4. **Screenshot** of Network tab → GET /auth/me → Request Headers
5. **Screenshot** of Application → Cookies
6. **Which scenario** matches your situation (1, 2, 3, or 4)

This will pinpoint the exact failure point.

## Additional Resources

- `COOKIE_DEBUG_INSTRUCTIONS.md` - Step-by-step debugging process
- `NETWORK_TAB_CHECKLIST.md` - Detailed Network tab inspection guide
- `COOKIE_AUTH_FINAL_FIX.md` - Complete fix documentation

## Summary

The debug logging is now comprehensive and will show you:
- ✅ Exactly what cookies the backend sends
- ✅ Exactly how the proxy rewrites them
- ✅ Whether the browser stores them
- ✅ Whether the browser sends them
- ✅ Whether the backend accepts them

**Next step:** Restart your dev server and attempt login. The logs will tell you exactly what's happening at each step!
