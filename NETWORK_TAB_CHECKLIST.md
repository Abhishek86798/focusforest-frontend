# Network Tab - What to Look For

## Quick Reference: Debugging Cookie Flow in Network Tab

### Step 1: Filter Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Click "Fetch/XHR" filter
4. Clear existing requests (🚫 icon)
5. Attempt login

### Step 2: Check POST /auth/login

Click on `POST /auth/login` request

#### General Tab
- **Status Code:** Should be `200 OK`
- **Request URL:** `http://localhost:5173/api/v1/auth/login`

#### Headers Tab → Response Headers

**✅ CORRECT - What you SHOULD see:**
```
Set-Cookie: sb-access-token=eyJhbGciOiJFUzI1NiIsImtpZCI6Ijh...; Max-Age=3600; Path=/; Expires=Wed, 08 Apr 2026 19:42:10 GMT; HttpOnly; SameSite=Lax
Set-Cookie: sb-refresh-token=k7lcn5yheeex; Max-Age=604800; Path=/; Expires=Wed, 15 Apr 2026 18:42:10 GMT; HttpOnly; SameSite=Lax
```

**Key attributes to verify:**
- ✅ `HttpOnly` - Present (security feature)
- ✅ `SameSite=Lax` - NOT Strict (required for localhost)
- ✅ `Path=/` - Present
- ❌ `Secure` - Should be ABSENT (removed by proxy)
- ❌ `Domain=` - Should be ABSENT (removed by proxy)

**❌ WRONG - What indicates a problem:**
```
Set-Cookie: sb-access-token=...; Secure; SameSite=Strict
```
- If you see `Secure` flag: Proxy didn't rewrite it
- If you see `SameSite=Strict`: Proxy didn't change it
- If you see `Domain=`: Proxy didn't remove it

**🔴 MISSING - Backend not setting cookies:**
```
(No Set-Cookie headers at all)
```
- Backend authentication failed
- Backend not configured correctly
- Check backend logs

#### Headers Tab → Request Headers

**Should include:**
```
Content-Type: application/json
```

**Should NOT include:**
```
Cookie: (anything)
```
- This is the first request, no cookies should be sent yet

#### Response Tab

**Should show:**
```json
{
  "user": {
    "id": "546c28d1-ed3d-4d14-8b0d-9f996b5c1555",
    "email": "test@focusforest.com",
    "name": "Test User",
    ...
  }
}
```

### Step 3: Check GET /auth/me (Verification Request)

This happens ~200ms after login. Click on `GET /auth/me` request.

#### General Tab
- **Status Code:** Should be `200 OK` (if cookies work) or `401 Unauthorized` (if cookies don't work)
- **Request URL:** `http://localhost:5173/api/v1/auth/me`

#### Headers Tab → Request Headers

**✅ CORRECT - Cookies are being sent:**
```
Cookie: sb-access-token=eyJhbGciOiJFUzI1NiIsImtpZCI6Ijh...; sb-refresh-token=k7lcn5yheeex
```

**This is the CRITICAL check!**
- If you see the Cookie header with both tokens: ✅ Cookies are working!
- The browser successfully stored and is sending the cookies

**❌ WRONG - Cookies are NOT being sent:**
```
(No Cookie header at all)
```

**This means:**
1. Cookies were not stored by the browser, OR
2. Cookies were stored but browser is not sending them

**Next step:** Check Application → Cookies to see if they exist

#### Response Tab

**If Status 200 (Success):**
```json
{
  "id": "546c28d1-ed3d-4d14-8b0d-9f996b5c1555",
  "email": "test@focusforest.com",
  "name": "Test User",
  ...
}
```

**If Status 401 (Failure):**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### Step 4: Check Application → Cookies

Go to: Application tab → Cookies → http://localhost:5173

#### ✅ SUCCESS - Cookies are stored correctly

| Name | Value | Domain | Path | Expires | Size | HttpOnly | Secure | SameSite |
|------|-------|--------|------|---------|------|----------|--------|----------|
| sb-access-token | eyJhbGciOiJFUzI1NiIsImtpZCI6Ijh... | localhost | / | (future date) | ~500 | ✓ | | Lax |
| sb-refresh-token | k7lcn5yheeex | localhost | / | (future date) | ~20 | ✓ | | Lax |

**Verify:**
- ✅ Both cookies present
- ✅ Domain: `localhost` (or empty)
- ✅ Path: `/`
- ✅ HttpOnly: ✓ (checked)
- ✅ Secure: (empty/unchecked)
- ✅ SameSite: `Lax`

#### ❌ FAILURE - Cookies are NOT stored

**Scenario A: No cookies at all**
- Browser rejected them
- Check terminal for proxy rewriting logs
- Verify Secure flag was removed
- Verify SameSite was changed to Lax

**Scenario B: Cookies present but with wrong attributes**

| Issue | Cause | Solution |
|-------|-------|----------|
| Secure: ✓ | Proxy didn't remove it | Restart dev server |
| SameSite: Strict | Proxy didn't change it | Restart dev server |
| Domain: (wrong) | Proxy didn't rewrite it | Check cookieDomainRewrite config |
| Path: (not /) | Proxy didn't rewrite it | Check cookiePathRewrite config |

## Diagnostic Flow Chart

```
Login Button Clicked
        ↓
POST /auth/login sent
        ↓
    ┌───────────────────────────────┐
    │ Check Response Headers        │
    │ Are Set-Cookie headers there? │
    └───────────────────────────────┘
            ↓                    ↓
          YES                   NO
            ↓                    ↓
    ┌───────────────┐    ┌──────────────────┐
    │ Check cookies │    │ Backend problem  │
    │ attributes    │    │ Check backend    │
    └───────────────┘    │ logs             │
            ↓            └──────────────────┘
    ┌───────────────────────────────┐
    │ Secure flag removed?          │
    │ SameSite changed to Lax?      │
    └───────────────────────────────┘
            ↓                    ↓
          YES                   NO
            ↓                    ↓
    ┌───────────────┐    ┌──────────────────┐
    │ Check         │    │ Proxy problem    │
    │ Application   │    │ Restart dev      │
    │ → Cookies     │    │ server           │
    └───────────────┘    └──────────────────┘
            ↓
    ┌───────────────────────────────┐
    │ Are cookies stored?           │
    └───────────────────────────────┘
            ↓                    ↓
          YES                   NO
            ↓                    ↓
    ┌───────────────┐    ┌──────────────────┐
    │ Check GET     │    │ Browser rejected │
    │ /auth/me      │    │ Check attributes │
    │ Request       │    │ Try Incognito    │
    └───────────────┘    └──────────────────┘
            ↓
    ┌───────────────────────────────┐
    │ Cookie header present?        │
    └───────────────────────────────┘
            ↓                    ↓
          YES                   NO
            ↓                    ↓
    ┌───────────────┐    ┌──────────────────┐
    │ Check         │    │ Browser not      │
    │ response      │    │ sending cookies  │
    │ status        │    │ Check SameSite   │
    └───────────────┘    └──────────────────┘
            ↓
    ┌───────────────────────────────┐
    │ Status 200 or 401?            │
    └───────────────────────────────┘
            ↓                    ↓
          200                   401
            ↓                    ↓
    ┌───────────────┐    ┌──────────────────┐
    │ ✅ SUCCESS!   │    │ Backend problem  │
    │ Cookies work  │    │ Check backend    │
    └───────────────┘    │ cookie parsing   │
                         └──────────────────┘
```

## Quick Checklist

Use this checklist while debugging:

### POST /auth/login Response
- [ ] Status: 200 OK
- [ ] Response Headers contain Set-Cookie
- [ ] Set-Cookie has HttpOnly
- [ ] Set-Cookie has SameSite=Lax (NOT Strict)
- [ ] Set-Cookie does NOT have Secure
- [ ] Set-Cookie does NOT have Domain
- [ ] Response body contains user object

### Application → Cookies
- [ ] sb-access-token is present
- [ ] sb-refresh-token is present
- [ ] Both have HttpOnly checked
- [ ] Both have SameSite: Lax
- [ ] Both have Path: /
- [ ] Both have Secure: (empty/unchecked)
- [ ] Domain is localhost or empty

### GET /auth/me Request
- [ ] Request Headers contain Cookie
- [ ] Cookie includes sb-access-token
- [ ] Cookie includes sb-refresh-token
- [ ] Status: 200 OK
- [ ] Response body contains user object

## Common Patterns

### Pattern 1: Everything works ✅
```
POST /auth/login
  Response: 200
  Set-Cookie: sb-access-token=...; HttpOnly; SameSite=Lax
  Set-Cookie: sb-refresh-token=...; HttpOnly; SameSite=Lax

Application → Cookies
  ✓ sb-access-token (HttpOnly, SameSite: Lax)
  ✓ sb-refresh-token (HttpOnly, SameSite: Lax)

GET /auth/me
  Request: Cookie: sb-access-token=...; sb-refresh-token=...
  Response: 200 { user: {...} }
```

### Pattern 2: Proxy not rewriting ❌
```
POST /auth/login
  Response: 200
  Set-Cookie: sb-access-token=...; HttpOnly; Secure; SameSite=Strict
  ⚠️  Still has Secure and SameSite=Strict

Application → Cookies
  (empty - browser rejected cookies)

Solution: Restart dev server
```

### Pattern 3: Cookies stored but not sent ❌
```
POST /auth/login
  Response: 200
  Set-Cookie: sb-access-token=...; HttpOnly; SameSite=Lax

Application → Cookies
  ✓ sb-access-token (HttpOnly, SameSite: Lax)
  ✓ sb-refresh-token (HttpOnly, SameSite: Lax)

GET /auth/me
  Request: (No Cookie header)
  Response: 401

Solution: Check SameSite, try Incognito mode
```

### Pattern 4: Backend not setting cookies ❌
```
POST /auth/login
  Response: 200
  (No Set-Cookie headers)

Application → Cookies
  (empty)

Solution: Check backend configuration
```

## Summary

The Network tab tells you:
1. **POST /auth/login Response Headers** → Did backend set cookies? Were they rewritten?
2. **Application → Cookies** → Did browser store them? Are attributes correct?
3. **GET /auth/me Request Headers** → Is browser sending them?
4. **GET /auth/me Response** → Does backend accept them?

Follow the flow in order to pinpoint the exact failure point.
