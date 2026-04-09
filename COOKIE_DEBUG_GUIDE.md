# Cookie Authentication Debug Guide

## The Problem

You're experiencing an issue where:
1. Login succeeds (POST /auth/login returns 200)
2. Cookies are set (`sb-access-token` and `sb-refresh-token`)
3. But subsequent requests to `/auth/me` return 401
4. You get logged out immediately

## Root Cause

The backend is setting cookies with the `Secure` flag, which means they only work over HTTPS. In local development (http://localhost:5173), browsers will **reject** or **not send** these cookies.

## Why `document.cookie` Shows Nothing

The cookies have the `HttpOnly` flag, which means JavaScript cannot read them with `document.cookie`. This is **correct** for security - it prevents XSS attacks from stealing your session token.

However, even though you can't see them in JavaScript, the browser should still send them with requests if they're properly set.

## Debugging Steps

### Step 1: Check if cookies are actually stored

1. Open DevTools → Application tab → Cookies → http://localhost:5173
2. Look for `sb-access-token` and `sb-refresh-token`
3. Check their attributes:
   - ✅ Should have: `HttpOnly`, `SameSite=Lax`, `Path=/`
   - ❌ Should NOT have: `Secure` (in development)

### Step 2: Check if cookies are being sent

1. Open DevTools → Network tab
2. Log in
3. Look at the next request (GET /auth/me)
4. Click on it → Headers tab → Request Headers
5. Look for `Cookie: sb-access-token=...`

**If you DON'T see the Cookie header:**
- The cookies weren't stored properly
- The Vite proxy isn't rewriting them correctly
- The browser is rejecting them due to the Secure flag

### Step 3: Verify Vite proxy is running

The console should show:
```
🍪 Original cookies from backend: ['sb-access-token=...; Secure; SameSite=Strict', ...]
🍪 Rewritten cookie: sb-access-token=...; SameSite=Lax
```

If you don't see these logs, the proxy isn't intercepting the response.

## Solutions

### Solution 1: Restart Vite Dev Server (Recommended)

The Vite config was just updated. You MUST restart the dev server:

```bash
# Stop the current dev server (Ctrl+C)
npm run dev
```

Then try logging in again.

### Solution 2: Clear All Cookies

Sometimes old cookies interfere:

1. DevTools → Application → Cookies → http://localhost:5173
2. Right-click → Clear
3. Refresh the page
4. Try logging in again

### Solution 3: Use Chrome Incognito/Private Window

This ensures no old cookies or cache:

1. Open a new Incognito/Private window
2. Go to http://localhost:5173
3. Try logging in

### Solution 4: Check Backend Cookie Settings

The backend might need to be configured differently for development. The backend should:

**For Development (localhost):**
```javascript
// Backend should detect if request is from localhost
const isLocalhost = req.headers.origin?.includes('localhost');

res.cookie('sb-access-token', token, {
  httpOnly: true,
  secure: !isLocalhost, // Only use Secure in production
  sameSite: isLocalhost ? 'lax' : 'strict',
  maxAge: 3600000,
  path: '/',
});
```

**For Production (HTTPS):**
```javascript
res.cookie('sb-access-token', token, {
  httpOnly: true,
  secure: true, // Always use Secure in production
  sameSite: 'strict',
  maxAge: 3600000,
  path: '/',
});
```

### Solution 5: Alternative - Use Authorization Header (Not Recommended)

If cookies continue to fail, you could switch to Authorization headers, but this is less secure:

1. Backend returns token in response body
2. Frontend stores in memory (not localStorage!)
3. Frontend sends in Authorization header

But this loses the security benefits of httpOnly cookies.

## Expected Behavior After Fix

### 1. Login Flow
```
POST /auth/login
  Response Headers:
    Set-Cookie: sb-access-token=...; HttpOnly; SameSite=Lax; Path=/
    Set-Cookie: sb-refresh-token=...; HttpOnly; SameSite=Lax; Path=/
  
  Browser stores cookies ✅
```

### 2. Subsequent Requests
```
GET /auth/me
  Request Headers:
    Cookie: sb-access-token=...; sb-refresh-token=...
  
  Response: 200 { "id": "...", "email": "...", ... } ✅
```

### 3. Console Logs
```
🔐 API Request: { method: 'POST', url: '/auth/login', hasCookies: false, cookies: '(none)' }
🍪 Original cookies from backend: ['sb-access-token=...; Secure; SameSite=Strict', ...]
🍪 Rewritten cookie: sb-access-token=...; SameSite=Lax
✅ Auth response received. Cookies: sb-access-token=...; sb-refresh-token=...
✅ Auth check successful: test@focusforest.com

🔐 API Request: { method: 'GET', url: '/auth/me', hasCookies: true, cookies: 'sb-access-token=...; sb-refresh-token=...' }
✅ Auth check successful: test@focusforest.com
```

## Quick Test

Run this in the browser console after logging in:

```javascript
// This will show nothing because cookies are HttpOnly (correct!)
console.log('document.cookie:', document.cookie);

// But this should work and return your user data
fetch('/api/v1/auth/me', { 
  credentials: 'include' 
})
  .then(r => r.json())
  .then(data => console.log('User data:', data))
  .catch(err => console.error('Error:', err));
```

If the fetch succeeds, cookies are working. If it fails with 401, cookies aren't being sent.

## Still Not Working?

If you've tried all the above and it still doesn't work, the issue is likely on the backend. The backend needs to:

1. Detect localhost requests
2. Set cookies without the `Secure` flag for localhost
3. Use `SameSite=Lax` instead of `SameSite=Strict` for localhost

Contact the backend developer to implement this.

## Alternative: Test in Production

If the backend can't be changed, you can test the full flow in production where HTTPS is available:

1. Deploy the frontend to Netlify/Vercel
2. The backend's `Secure` cookies will work over HTTPS
3. Everything should work as expected

The cookie issue only affects local development with http://localhost.
