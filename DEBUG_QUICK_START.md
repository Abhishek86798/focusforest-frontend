# Debug Quick Start - Cookie Auth

## 🚀 Quick Start (Do This Now!)

### 1. Restart Dev Server
```bash
# Press Ctrl+C to stop
npm run dev
```

### 2. Clear Cookies
DevTools (F12) → Application → Cookies → http://localhost:5173 → Right-click → Clear

### 3. Open Console & Network
- Console tab (for flow logs)
- Network tab (for HTTP inspection)

### 4. Login
- Email: `test@focusforest.com`
- Password: `password`

## 📊 What to Watch

### Terminal (Vite Server)
Look for:
```
═══════════════════════════════════════════════════════
🍪 VITE PROXY - Cookie Response Detected
═══════════════════════════════════════════════════════
```

**If you DON'T see this:** Proxy not working → Restart server again

**If you DO see this:** Check if it shows:
- ✅ "Removed: Secure flag"
- ✅ "Changed: SameSite=Strict → SameSite=Lax"

### Browser Console
Look for:
```
╔═══════════════════════════════════════════════════════╗
║  ✅ COOKIE VERIFICATION SUCCESSFUL                   ║
╚═══════════════════════════════════════════════════════╝
```

**If you see ✅ SUCCESS:** Cookies are working! You're done!

**If you see ❌ FAILED:** Follow the debugging steps printed in console

### Network Tab
1. Click on `POST /auth/login`
2. Headers → Response Headers
3. Look for: `Set-Cookie: sb-access-token=...; HttpOnly; SameSite=Lax`
4. Should NOT see: `Secure` flag

### Application Tab
1. Go to: Cookies → http://localhost:5173
2. Should see:
   - `sb-access-token` (HttpOnly ✓, SameSite: Lax)
   - `sb-refresh-token` (HttpOnly ✓, SameSite: Lax)

## 🔍 Quick Diagnosis

| What You See | Problem | Solution |
|--------------|---------|----------|
| No terminal logs | Proxy not working | Restart dev server |
| Terminal logs, no cookies in Application | Browser rejected | Check attributes in terminal |
| Cookies in Application, console shows ❌ | Browser not sending | Check Network tab Cookie header |
| Console shows ✅ | Working! | You're done! |

## 📋 Success Checklist

- [ ] Terminal shows proxy logs
- [ ] Terminal shows "Removed: Secure flag"
- [ ] Terminal shows "Changed: SameSite=Strict → SameSite=Lax"
- [ ] Console shows "COOKIE VERIFICATION SUCCESSFUL"
- [ ] Application → Cookies shows both tokens
- [ ] Network → GET /auth/me has Cookie header
- [ ] Can navigate to /dashboard
- [ ] Page refresh stays logged in

## 🆘 If It Fails

The console will print detailed debugging steps. Follow them!

Or check these docs:
- `DEBUG_LOGGING_COMPLETE.md` - Full explanation
- `COOKIE_DEBUG_INSTRUCTIONS.md` - Step-by-step guide
- `NETWORK_TAB_CHECKLIST.md` - Network tab reference

## 📸 What to Screenshot If Reporting Issue

1. Full console output (from login attempt)
2. Full terminal output (Vite proxy logs)
3. Network → POST /auth/login → Response Headers
4. Network → GET /auth/me → Request Headers
5. Application → Cookies

---

**TL;DR:** Restart server, clear cookies, login, check console for ✅ or ❌
