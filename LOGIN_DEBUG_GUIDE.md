# Login Authentication Debug Guide

## Current Status
Based on the network tab screenshot, you're seeing a 401 error on the `/me` endpoint. This is **expected behavior** when you're not logged in.

## How Authentication Works

### 1. Initial Page Load (Not Logged In)
```
App.tsx mounts → authStore.checkAuth() → GET /auth/me → 401 (expected)
→ isLoading: false, user: null → Redirects to /login
```

### 2. Login Flow
```
User enters credentials → POST /auth/login → 200 + Set-Cookie header
→ authStore.user = response.data.user → Navigate to /
```

### 3. Subsequent Page Loads (Logged In)
```
App.tsx mounts → authStore.checkAuth() → GET /auth/me → 200 (with cookie)
→ isLoading: false, user: {...} → Shows protected routes
```

## Debugging Steps

### Step 1: Check if you're on the login page
- If you see the 401 on `/me` and you're on `/login`, this is **normal**
- The app is checking if you're already logged in before showing the login form

### Step 2: Try logging in
1. Open the Network tab in DevTools
2. Filter by "Fetch/XHR"
3. Enter your credentials and click "Enter the forest"
4. Look for the `POST /auth/login` request

**Expected response:**
- Status: 200
- Response body: `{ "user": { "id": "...", "email": "...", ... } }`
- Response headers: `Set-Cookie: session=...`

### Step 3: Check if cookies are being set
After successful login, check:
1. Open DevTools → Application tab → Cookies → http://localhost:5173
2. You should see a cookie named `session` or similar
3. If no cookie appears, the proxy might not be rewriting cookies correctly

### Step 4: Check console logs
The `src/api/client.ts` has extensive logging. Check the console for:
```
API Request: { method: 'POST', url: '/auth/login', ... }
Auth response received. Cookies after response: ...
```

## Common Issues & Solutions

### Issue 1: 401 on /me (when not logged in)
**Status:** ✅ This is normal
**Solution:** Just log in - the 401 is expected

### Issue 2: Login succeeds but still shows 401 on next /me call
**Cause:** Cookies not persisting
**Debug:**
1. Check Application → Cookies in DevTools
2. Check console for "Cookies after response"
3. Verify `withCredentials: true` in axios config

**Solution:** The Vite proxy should handle this. If not:
- Restart the dev server: `npm run dev`
- Clear browser cookies and try again
- Check if backend is setting httpOnly cookies correctly

### Issue 3: Cookies set but not sent with requests
**Cause:** SameSite or Domain mismatch
**Debug:**
1. Check cookie attributes in Application tab
2. Should be: `SameSite=Lax; Path=/; HttpOnly`
3. Should NOT have: `Secure` (in development)

**Solution:** The Vite proxy config already handles this

### Issue 4: CORS errors
**Cause:** Backend not allowing credentials
**Solution:** Backend must have:
```javascript
cors({
  origin: 'http://localhost:5173',
  credentials: true
})
```

## Testing the Full Flow

### Test 1: Fresh Login
1. Clear all cookies (Application → Clear site data)
2. Refresh page → Should see 401 on /me → Redirects to /login
3. Enter credentials → POST /auth/login → 200
4. Should navigate to / → GET /me → 200 (with user data)

### Test 2: Persistent Session
1. After successful login, refresh the page
2. Should see GET /me → 200 (cookie sent automatically)
3. Should NOT redirect to /login

### Test 3: Logout
1. Click logout button
2. POST /auth/logout → 200
3. Cookie should be cleared
4. Next GET /me → 401
5. Redirects to /login

## Current Configuration

### API Client (`src/api/client.ts`)
- ✅ `withCredentials: true` - Sends cookies with requests
- ✅ Global error interceptor - Handles 401/500 errors
- ✅ Extensive logging - Check console for details

### Auth Store (`src/stores/authStore.ts`)
- ✅ `checkAuth()` - Called once on mount
- ✅ `login()` - Sets user from response
- ✅ Module-level flag - Prevents duplicate calls

### Vite Proxy (`vite.config.ts`)
- ✅ Proxies `/api/*` to backend
- ✅ Removes `Secure` flag for local development
- ✅ Forces `SameSite=Lax`
- ✅ Removes domain restrictions

## What You Should See in Network Tab

### When Not Logged In:
```
GET /api/v1/auth/me → 401 (expected)
```

### During Login:
```
POST /api/v1/auth/login → 200
  Response Headers:
    Set-Cookie: session=...; HttpOnly; SameSite=Lax; Path=/
  Response Body:
    { "user": { "id": "...", "email": "...", ... } }
```

### After Login:
```
GET /api/v1/auth/me → 200
  Request Headers:
    Cookie: session=...
  Response Body:
    { "id": "...", "email": "...", ... }
```

## Next Steps

1. **If you're on the login page:** Just log in - the 401 is expected
2. **If login fails:** Check the console logs and network response
3. **If cookies aren't persisting:** Restart dev server and clear cookies
4. **If still having issues:** Share the console logs and network tab details

## Quick Test Command

Run this in the browser console after logging in:
```javascript
// Check if user is in store
console.log('User in store:', useAuthStore.getState().user);

// Check cookies
console.log('All cookies:', document.cookie);

// Test /me endpoint manually
fetch('/api/v1/auth/me', { credentials: 'include' })
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

This should help you verify the authentication flow is working correctly.
