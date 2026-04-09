# Cookie Authentication - Debug Instructions

## Debug Logging Added

I've added comprehensive debug logging to help you pinpoint exactly where the cookie flow is breaking.

## Step-by-Step Debugging Process

### STEP 1: Restart Vite Dev Server (CRITICAL!)

```bash
# Stop current server (Ctrl+C)
npm run dev
```

The proxy configuration changes require a server restart.

### STEP 2: Clear All Browser Cookies

1. Open DevTools (F12)
2. Go to Application tab
3. Expand Cookies → http://localhost:5173
4. Right-click → Clear
5. Refresh the page

### STEP 3: Open Console and Network Tab

1. Open DevTools (F12)
2. Go to Console tab (keep it open)
3. Also open Network tab (in a separate panel if possible)
4. In Network tab, filter by "Fetch/XHR"

### STEP 4: Attempt Login

1. Go to /login page
2. Enter credentials: `test@focusforest.com` / `password`
3. Click "Enter the forest"
4. Watch BOTH the Console and Network tabs

## What to Look For

### In the CONSOLE (Browser DevTools)

You should see a detailed flow like this:

```
╔═══════════════════════════════════════════════════════╗
║  🔐 LOGIN FLOW - Starting                            ║
╚═══════════════════════════════════════════════════════╝
📧 Email: test@focusforest.com

📤 Step 1: Sending POST /auth/login...

🌐 API Request: POST /auth/login
   withCredentials: true
   ℹ️  Note: HttpOnly cookies are sent automatically by browser
   ℹ️  You cannot see them in document.cookie (security feature)

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
   ℹ️  Note: HttpOnly cookies are sent automatically by browser
   ℹ️  You cannot see them in document.cookie (security feature)
```

Then you'll see EITHER:

#### SUCCESS Case:
```
╔═══════════════════════════════════════════════════════╗
║  ✅ COOKIE VERIFICATION SUCCESSFUL                   ║
╚═══════════════════════════════════════════════════════╝
   Status: 200
   User: test@focusforest.com
   🎉 Cookies are working! Session will persist.

   Next steps:
   1. Check DevTools → Application → Cookies
   2. You should see: sb-access-token and sb-refresh-token
   3. Both should have: HttpOnly ✓, SameSite: Lax, Path: /
```

#### FAILURE Case:
```
╔═══════════════════════════════════════════════════════╗
║  ❌ COOKIE VERIFICATION FAILED                       ║
╚═══════════════════════════════════════════════════════╝
   Status: 401
   Error: { error: { code: 'UNAUTHORIZED', message: '...' } }

   🔴 PROBLEM DETECTED: Cookies are NOT being sent!

   Debugging steps:
   [Detailed instructions will be shown]
```

### In the TERMINAL (Vite Dev Server)

You should see the proxy intercepting the login response:

```
═══════════════════════════════════════════════════════
🍪 VITE PROXY - Cookie Response Detected
═══════════════════════════════════════════════════════
📍 URL: /api/v1/auth/login
📊 Status: 200

🔴 RAW Set-Cookie Headers from Backend:
   [0] sb-access-token=eyJhbG...; Max-Age=3600; Path=/; Expires=...; HttpOnly; Secure; SameSite=Strict
   [1] sb-refresh-token=k7lcn5...; Max-Age=604800; Path=/; Expires=...; HttpOnly; Secure; SameSite=Strict

🟢 REWRITTEN Cookie [0]:
   sb-access-token=eyJhbG...; Max-Age=3600; Path=/; Expires=...; HttpOnly; SameSite=Lax
   ✏️  Changes made:
      - Removed: Secure flag
      - Changed: SameSite=Strict → SameSite=Lax

🟢 REWRITTEN Cookie [1]:
   sb-refresh-token=k7lcn5...; Max-Age=604800; Path=/; Expires=...; HttpOnly; SameSite=Lax
   ✏️  Changes made:
      - Removed: Secure flag
      - Changed: SameSite=Strict → SameSite=Lax

✅ Cookies rewritten and sent to browser
═══════════════════════════════════════════════════════
```

### In the NETWORK TAB (Browser DevTools)

#### 1. Check POST /auth/login Response

Click on the `POST /auth/login` request → Headers tab → Response Headers

**What you SHOULD see:**
```
Set-Cookie: sb-access-token=...; Max-Age=3600; Path=/; HttpOnly; SameSite=Lax
Set-Cookie: sb-refresh-token=...; Max-Age=604800; Path=/; HttpOnly; SameSite=Lax
```

**What you should NOT see:**
- `Secure` flag (should be removed by proxy)
- `SameSite=Strict` (should be changed to Lax)
- `Domain=` attribute (should be removed)

**If you DON'T see Set-Cookie headers:**
- Backend is not setting cookies
- Check backend logs
- Verify backend is using Supabase auth correctly

#### 2. Check GET /auth/me Request (Verification)

Click on the `GET /auth/me` request (the one that happens ~200ms after login) → Headers tab → Request Headers

**What you SHOULD see:**
```
Cookie: sb-access-token=...; sb-refresh-token=...
```

**If you DON'T see the Cookie header:**
- Cookies were NOT stored by the browser
- Go to Application tab → Cookies to check if they exist
- If they exist but aren't sent: Browser security issue
- If they don't exist: Browser rejected them (check attributes)

#### 3. Check Application → Cookies

Go to: Application tab → Cookies → http://localhost:5173

**What you SHOULD see:**

| Name | Value | HttpOnly | SameSite | Path | Secure |
|------|-------|----------|----------|------|--------|
| sb-access-token | (long JWT) | ✓ | Lax | / | (empty) |
| sb-refresh-token | (token) | ✓ | Lax | / | (empty) |

**If cookies are NOT there:**
- Browser rejected them
- Check terminal for proxy rewriting logs
- Verify Secure flag was removed
- Verify SameSite is Lax (not Strict)

**If cookies ARE there but not sent:**
- Browser security settings
- Try Incognito mode
- Check for browser extensions blocking cookies

## Diagnostic Decision Tree

### Scenario A: No proxy logs in terminal
**Problem:** Vite proxy is not intercepting responses
**Solution:** 
1. Verify you restarted the dev server
2. Check vite.config.ts was saved
3. Try `npm run dev` again

### Scenario B: Proxy logs show cookies, but not in Application tab
**Problem:** Browser is rejecting the cookies
**Possible causes:**
1. Secure flag not removed (check terminal logs)
2. SameSite=Strict not changed to Lax (check terminal logs)
3. Domain attribute not removed (check terminal logs)
4. Browser security settings too strict

**Solution:**
1. Verify terminal shows "Removed: Secure flag"
2. Verify terminal shows "Changed: SameSite=Strict → SameSite=Lax"
3. Try in Incognito mode
4. Try a different browser

### Scenario C: Cookies in Application tab, but not sent with requests
**Problem:** Browser is not sending stored cookies
**Possible causes:**
1. Path mismatch (should be `/`)
2. Domain mismatch (should be empty or localhost)
3. SameSite too strict (should be Lax)
4. Browser extension blocking cookies

**Solution:**
1. Check cookie attributes in Application tab
2. Verify Path is `/`
3. Verify Domain is empty or localhost
4. Verify SameSite is Lax
5. Disable browser extensions
6. Try Incognito mode

### Scenario D: Cookies sent, but backend returns 401
**Problem:** Backend is not accepting the cookies
**Possible causes:**
1. Token expired
2. Backend expects different cookie format
3. Backend CORS configuration issue

**Solution:**
1. Check backend logs
2. Verify backend is configured for localhost origin
3. Check token expiration time
4. Verify backend cookie parsing

## Quick Test Commands

Run these in the browser console AFTER login:

### Test 1: Check if cookies exist (won't show HttpOnly)
```javascript
console.log('document.cookie:', document.cookie);
// Expected: Empty or other non-HttpOnly cookies
// HttpOnly cookies won't show here (correct!)
```

### Test 2: Manual /auth/me test
```javascript
fetch('/api/v1/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(data => console.log('✅ Success:', data))
  .catch(err => console.error('❌ Failed:', err));
```

### Test 3: Check auth store state
```javascript
// This won't work in console, but you can add it to your code
console.log('Auth store:', useAuthStore.getState());
```

## Expected Timeline

1. **T+0ms:** User clicks login button
2. **T+50ms:** POST /auth/login sent
3. **T+200ms:** POST /auth/login response received
4. **T+200ms:** Vite proxy rewrites cookies
5. **T+200ms:** Browser stores cookies
6. **T+200ms:** User set in auth store
7. **T+400ms:** GET /auth/me sent (with cookies)
8. **T+600ms:** GET /auth/me response received
9. **T+600ms:** Verification complete

If any step fails, the detailed logs will show you exactly where.

## What to Report

If it still doesn't work after following these steps, report:

1. **Console output** - Copy the entire login flow from console
2. **Terminal output** - Copy the Vite proxy logs
3. **Network tab** - Screenshot of POST /auth/login Response Headers
4. **Network tab** - Screenshot of GET /auth/me Request Headers
5. **Application tab** - Screenshot of Cookies section
6. **Which scenario** - A, B, C, or D from the decision tree above

This will help identify the exact point of failure.
