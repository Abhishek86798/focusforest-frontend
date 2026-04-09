# Cookie Authentication Fix - RESTART REQUIRED

## What Was Fixed

Updated the Vite proxy configuration to properly handle Supabase cookies in local development.

### Changes Made:

1. **`vite.config.ts`** - Improved cookie rewriting:
   - Removes `Secure` flag (required for http://localhost)
   - Removes `SameSite=Strict` (too restrictive for development)
   - Adds `SameSite=Lax` (works with localhost)
   - Removes domain restrictions
   - Better logging with emoji indicators

2. **`src/api/client.ts`** - Enhanced debugging:
   - Now logs ALL requests with cookie information
   - Shows actual cookie values (not just count)
   - Helps verify if cookies are being sent

## CRITICAL: You Must Restart Vite

The Vite dev server needs to be restarted for the proxy changes to take effect.

### How to Restart:

1. **Stop the current dev server:**
   - Press `Ctrl+C` in the terminal running `npm run dev`

2. **Start it again:**
   ```bash
   npm run dev
   ```

3. **Clear your browser cookies:**
   - DevTools → Application → Cookies → http://localhost:5173
   - Right-click → Clear

4. **Refresh the page and try logging in again**

## What You Should See After Restart

### In the Terminal (Vite):
```
🍪 Original cookies from backend: ['sb-access-token=...; Secure; SameSite=Strict', ...]
🍪 Rewritten cookie: sb-access-token=...; SameSite=Lax
```

### In the Browser Console:
```
🔐 API Request: { method: 'POST', url: '/auth/login', hasCookies: false, cookies: '(none)' }
✅ Auth response received. Cookies: sb-access-token=...; sb-refresh-token=...
🔐 API Request: { method: 'GET', url: '/auth/me', hasCookies: true, cookies: 'sb-access-token=...; sb-refresh-token=...' }
✅ Auth check successful: test@focusforest.com
```

### In DevTools → Application → Cookies:
You should see:
- `sb-access-token` with attributes: `HttpOnly`, `SameSite=Lax`, `Path=/`
- `sb-refresh-token` with attributes: `HttpOnly`, `SameSite=Lax`, `Path=/`

## If It Still Doesn't Work

### Check 1: Verify cookies are stored
DevTools → Application → Cookies → http://localhost:5173

If you DON'T see the cookies there, the browser is rejecting them.

### Check 2: Verify cookies are sent
DevTools → Network → Click on GET /auth/me → Headers → Request Headers

Look for: `Cookie: sb-access-token=...; sb-refresh-token=...`

If you DON'T see the Cookie header, the cookies aren't being sent.

### Check 3: Backend Issue
If cookies are stored but not sent, or if the rewriting isn't working, the issue might be on the backend.

The backend should ideally:
- Detect localhost requests
- Set cookies WITHOUT `Secure` flag for localhost
- Use `SameSite=Lax` for localhost

## Why This Happens

The backend is setting cookies with the `Secure` flag, which means they only work over HTTPS. In local development (http://localhost), browsers will reject or not send these cookies.

The Vite proxy tries to rewrite the cookies to remove the `Secure` flag, but this only works if:
1. The proxy is properly configured (✅ fixed)
2. The dev server is restarted (⚠️ YOU NEED TO DO THIS)
3. Old cookies are cleared (⚠️ YOU NEED TO DO THIS)

## Production Note

This issue ONLY affects local development. In production (deployed to Netlify/Vercel with HTTPS), the `Secure` cookies will work perfectly without any proxy rewriting.

---

**ACTION REQUIRED:** Restart your dev server now!
