# Direct Backend Connection - Configuration Updated

## Changes Made

Updated the frontend to connect directly to the deployed backend instead of using the Vite proxy.

### 1. Updated `.env.development`

**Before:**
```
VITE_API_BASE_URL=/api/v1
```

**After:**
```
VITE_API_BASE_URL=https://focusforest-backend.onrender.com/api/v1
```

### 2. Fixed `src/api/client.ts`

**Before:**
```typescript
const apiClient = axios.create({
  baseURL: '/api/v1',  // ❌ Hardcoded, ignores environment variable
  withCredentials: true,
  ...
});
```

**After:**
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,  // ✅ Uses environment variable
  withCredentials: true,
  ...
});
```

## Why This Change

### Problem:
- Backend is deployed on Render.com
- You want to test against the live backend
- Vite proxy was adding unnecessary complexity
- Cookie issues with proxy rewriting

### Solution:
- Connect directly to deployed backend
- Let the backend handle CORS and cookies
- Simpler configuration
- Matches production setup

## Important Notes

### CORS Configuration

The backend MUST have CORS configured to allow requests from `http://localhost:5173`:

```javascript
// Backend CORS config (example)
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-domain.com'
  ],
  credentials: true
}));
```

### Cookie Configuration

The backend MUST set cookies with these attributes for localhost:

```javascript
// Backend cookie config (example)
res.cookie('sb-access-token', token, {
  httpOnly: true,
  secure: false,  // ❌ Must be false for http://localhost
  sameSite: 'lax', // ✅ Must be 'lax' for cross-origin
  maxAge: 3600000,
  path: '/',
});
```

**OR** the backend should detect localhost and adjust:

```javascript
const isLocalhost = req.headers.origin?.includes('localhost');

res.cookie('sb-access-token', token, {
  httpOnly: true,
  secure: !isLocalhost,  // Only secure in production
  sameSite: isLocalhost ? 'lax' : 'strict',
  maxAge: 3600000,
  path: '/',
});
```

## Testing Steps

### Step 1: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Step 2: Clear Browser Cookies
DevTools → Application → Cookies → http://localhost:5173 → Clear

### Step 3: Check Console Logs

You should see:
```
🌐 API Request: POST /auth/login
   baseURL: https://focusforest-backend.onrender.com/api/v1
   Full URL: https://focusforest-backend.onrender.com/api/v1/auth/login
   withCredentials: true
```

### Step 4: Check Network Tab

**Request URL should be:**
```
https://focusforest-backend.onrender.com/api/v1/auth/login
```

**NOT:**
```
http://localhost:5173/api/v1/auth/login
```

### Step 5: Check Response Headers

**Should see:**
- `Set-Cookie` headers from backend
- `Access-Control-Allow-Origin: http://localhost:5173`
- `Access-Control-Allow-Credentials: true`

## Troubleshooting

### Issue 1: CORS Error
```
Access to XMLHttpRequest at 'https://...' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solution:** Backend needs to add `http://localhost:5173` to allowed origins

### Issue 2: Cookies Not Set
**Symptoms:** Login succeeds but cookies not in Application tab

**Possible causes:**
1. Backend setting `Secure` flag (won't work with http://localhost)
2. Backend setting `SameSite=Strict` (too restrictive for cross-origin)
3. Backend not setting `Access-Control-Allow-Credentials: true`

**Solution:** Backend must set cookies with:
- `secure: false` (for localhost)
- `sameSite: 'lax'` (for cross-origin)
- CORS must have `credentials: true`

### Issue 3: 500 Internal Server Error
**Symptoms:** All requests return 500

**Possible causes:**
1. Backend environment variables missing
2. Supabase project paused (free tier)
3. Backend code error
4. Database connection issue

**Solution:** Check backend logs on Render.com dashboard

### Issue 4: Network Error
**Symptoms:** Request fails with no response

**Possible causes:**
1. Backend is down
2. No internet connection
3. Firewall blocking requests

**Solution:** 
1. Check if backend is running: Visit https://focusforest-backend.onrender.com/api/v1/health
2. Check internet connection
3. Try in Incognito mode

## Vite Proxy (No Longer Used)

The Vite proxy configuration in `vite.config.ts` is now **ignored** because we're using an absolute URL.

If you want to use the proxy again:
1. Change `.env.development` back to `/api/v1`
2. Ensure `vite.config.ts` has proxy for `/api/v1`
3. Restart dev server

## Production Configuration

`.env.production` should also use the deployed backend:

```
VITE_API_BASE_URL=https://focusforest-backend.onrender.com/api/v1
```

Or if you have a custom domain:
```
VITE_API_BASE_URL=https://api.focusforest.com/v1
```

## Summary

- ✅ Frontend now connects directly to deployed backend
- ✅ No Vite proxy complexity
- ✅ Matches production setup
- ✅ Easier to debug (direct requests)
- ⚠️ Backend must handle CORS and cookies correctly

**Next step:** Restart dev server and test login. If you get CORS errors or cookie issues, the backend configuration needs to be updated.
