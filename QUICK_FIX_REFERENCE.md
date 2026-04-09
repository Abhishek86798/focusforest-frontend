# Quick Fix Reference - Cookie Auth

## What Was Fixed

| Issue | Solution |
|-------|----------|
| 1. Race condition - `/auth/me` fires before login | Added `isInitialized` flag to gate auth checks |
| 2. Cookies not persisting | Fixed Vite proxy with `cookieDomainRewrite` and proper rewriting |
| 3. Credentials not sent | Already correct - `withCredentials: true` ✅ |
| 4. Auth flow broken | Login now sets user immediately, proper async handling |

## Files Changed

1. `vite.config.ts` - Added `cookieDomainRewrite`, `cookiePathRewrite`, improved cookie rewriting
2. `src/stores/authStore.ts` - Added `isInitialized`, improved login/logout flow
3. `src/components/ProtectedRoute.tsx` - Changed from `isLoading` to `isInitialized`
4. `src/api/client.ts` - Improved logging, verified `withCredentials: true`

## Critical Actions Required

### 1. Restart Dev Server (MUST DO!)
```bash
# Press Ctrl+C to stop
npm run dev
```

### 2. Clear Browser Cookies (MUST DO!)
DevTools (F12) → Application → Cookies → http://localhost:5173 → Right-click → Clear

### 3. Test Login
- Email: `test@focusforest.com`
- Password: `password`

## Expected Console Output

### Before Login:
```
🔍 Running initial auth check...
🔐 API Request: { method: 'GET', url: '/auth/me', withCredentials: true }
ℹ️ Not authenticated (expected when not logged in)
```

### During Login:
```
🔐 Attempting login...
🔐 API Request: { method: 'POST', url: '/auth/login', withCredentials: true }
🍪 Original cookies from backend: ['sb-access-token=...; Secure; SameSite=Strict', ...]
🍪 Rewritten cookie: sb-access-token=...; SameSite=Lax; Path=/
✅ Auth response received
✅ Login successful: test@focusforest.com
✅ Cookie verification successful - /auth/me works
```

### After Login (Page Refresh):
```
🔍 Running initial auth check...
🔐 API Request: { method: 'GET', url: '/auth/me', withCredentials: true }
✅ Auth check successful: test@focusforest.com
```

## Verify Cookies in DevTools

Application → Cookies → http://localhost:5173

Should see:
- `sb-access-token`: HttpOnly ✓, SameSite: Lax, Path: /, Secure: (empty)
- `sb-refresh-token`: HttpOnly ✓, SameSite: Lax, Path: /, Secure: (empty)

## Key Changes Explained

### Vite Config
```typescript
// OLD: No domain/path rewriting
configure: (proxy) => { ... }

// NEW: Proper domain/path rewriting
cookieDomainRewrite: { '*': 'localhost' },
cookiePathRewrite: { '*': '/' },
configure: (proxy) => {
  // Removes Secure, changes SameSite=Strict to Lax
}
```

### Auth Store
```typescript
// OLD: Module-level flag, isLoading
let authCheckComplete = false;
isLoading: boolean;

// NEW: Store-level flag, isInitialized
isInitialized: boolean; // Tracks if auth check is done

// Login now sets isInitialized: true immediately
```

### Protected Route
```typescript
// OLD: Check isLoading
if (isLoading) return <PageLoader />;

// NEW: Check isInitialized
if (!isInitialized) return <PageLoader />;
```

## Success Checklist

- [ ] Dev server restarted
- [ ] Browser cookies cleared
- [ ] Login succeeds
- [ ] Cookies visible in DevTools
- [ ] Page refresh maintains login
- [ ] No immediate logout
- [ ] Console shows cookie rewriting logs

## If Still Not Working

1. **Check terminal** - Should see cookie rewriting logs
2. **Check DevTools → Application → Cookies** - Should see both tokens
3. **Check Network tab** - Request Headers should include Cookie
4. **Try Incognito window** - Eliminates cache issues
5. **Check backend** - Might need to configure for localhost

## Production Note

This fix is for LOCAL DEVELOPMENT only. In production (HTTPS), the backend's Secure cookies work correctly without any proxy rewriting.

---

**TL;DR:** Restart dev server, clear cookies, login again. Should work now!
