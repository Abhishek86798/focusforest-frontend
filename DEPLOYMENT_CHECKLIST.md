# FocusForest Frontend - Deployment Checklist

## Pre-Deployment Verification

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console errors in development
- [ ] All features tested locally
- [ ] Build completes successfully (`npm run build`)
- [ ] Production preview works (`npm run preview`)

### Configuration
- [ ] `.env.development` exists with correct values
- [ ] `.env.production` exists with correct backend URL
- [ ] `vite.config.ts` has build configuration
- [ ] `.gitignore` allows environment template files
- [ ] API client uses environment variables
- [ ] `public/_redirects` exists for Netlify SPA routing
- [ ] `vercel.json` exists in project root for Vercel SPA routing
- [ ] BrowserRouter is used (not HashRouter)
- [ ] ProtectedRoute uses Outlet pattern
- [ ] 404 NotFoundPage exists

### Backend Integration
- [ ] Backend is accessible at production URL
- [ ] CORS is configured for production domain
- [ ] Backend sets cookies with correct flags (Secure, SameSite)
- [ ] All API endpoints are working
- [ ] Authentication flow works end-to-end

## Deployment Steps

### 1. Build
```bash
npm run build
```
- [ ] Build completes without errors
- [ ] `dist/` directory is created
- [ ] `dist/index.html` exists
- [ ] Chunk files are created (vendor, query, main)

### 2. Deploy to Hosting

#### Netlify
- [ ] Repository connected
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Deploy triggered

#### Vercel
- [ ] Repository imported
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Deploy triggered

#### Other Platforms
- [ ] `dist/` contents uploaded
- [ ] SPA routing fallback configured
- [ ] HTTPS enabled
- [ ] Domain configured

### Post-Deployment Configuration
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Routing fallback working (all routes serve index.html)
- [ ] Backend CORS updated with production domain
- [ ] Test direct URL navigation (e.g., /dashboard, /profile)
- [ ] Test browser back/forward buttons
- [ ] Test page refresh on protected routes

## Post-Deployment Testing

### Authentication
- [ ] Signup creates new account
- [ ] Login works with credentials
- [ ] Logout clears session
- [ ] 401 redirects to login
- [ ] Protected routes require auth

### Core Features
- [ ] Dashboard loads correctly
- [ ] Today's tree displays
- [ ] Week view shows data
- [ ] Session history displays
- [ ] Stats cards show data

### Timer Functionality
- [ ] Variant picker opens
- [ ] Timer starts correctly
- [ ] Timer counts down
- [ ] Session completes successfully
- [ ] Task tracking works
- [ ] Abandon session works

### Calendar
- [ ] Calendar page loads
- [ ] Heatmap displays correctly
- [ ] Monthly efforts show data
- [ ] Stats cards display
- [ ] Day detail panel works

### Groups
- [ ] Groups list displays
- [ ] Create group works
- [ ] Join group with code works
- [ ] Leave group works
- [ ] Members table shows data
- [ ] Group stats display
- [ ] Week view shows data

### Leaderboard
- [ ] Solo leaderboard displays
- [ ] Groups leaderboard displays
- [ ] Pagination works
- [ ] Current user highlighted
- [ ] Load more works

### Profile
- [ ] Profile page loads
- [ ] User name displays
- [ ] Streak shows correctly
- [ ] Trees grown displays
- [ ] Focus hours displays
- [ ] Variant picker works
- [ ] Timezone displays
- [ ] Sign out works

### Error Handling
- [ ] 401 redirects to login
- [ ] Network errors logged
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Empty states display

### Mobile Responsiveness
- [ ] Mobile layout works
- [ ] Bottom navigation works
- [ ] Touch interactions work
- [ ] Modals display correctly
- [ ] Forms are usable

### Performance
- [ ] Initial load < 3 seconds
- [ ] Page transitions smooth
- [ ] No layout shifts
- [ ] Images load properly
- [ ] Animations smooth

## Monitoring Setup

### Error Tracking
- [ ] Sentry configured (optional)
- [ ] Error logging working
- [ ] 401 errors tracked
- [ ] Network errors tracked

### Analytics
- [ ] Google Analytics configured (optional)
- [ ] Page views tracked
- [ ] User events tracked
- [ ] Conversion tracking setup

### Performance
- [ ] Lighthouse score checked
- [ ] Core Web Vitals measured
- [ ] Bundle size monitored
- [ ] Load time acceptable

## Rollback Plan

### If Issues Occur
1. [ ] Identify the issue
2. [ ] Check error logs
3. [ ] Revert to previous commit
4. [ ] Rebuild: `npm run build`
5. [ ] Redeploy
6. [ ] Verify fix

### Emergency Contacts
- Backend team: [Contact info]
- DevOps: [Contact info]
- Project lead: [Contact info]

## Documentation

- [ ] README.md is up to date
- [ ] DEPLOYMENT_GUIDE.md is complete
- [ ] API documentation is current
- [ ] Environment variables documented
- [ ] Known issues documented

## Security

- [ ] HTTPS enabled
- [ ] Cookies use Secure flag
- [ ] CORS properly configured
- [ ] No secrets in code
- [ ] Dependencies up to date
- [ ] No known vulnerabilities

## Compliance

- [ ] Privacy policy linked (if required)
- [ ] Terms of service linked (if required)
- [ ] Cookie consent implemented (if required)
- [ ] GDPR compliance (if applicable)

## Final Checks

- [ ] All checklist items completed
- [ ] Team notified of deployment
- [ ] Monitoring active
- [ ] Backup plan ready
- [ ] Documentation updated
- [ ] Success criteria met

## Success Criteria

Deployment is successful when:
- ✅ All features work in production
- ✅ No critical errors
- ✅ Performance is acceptable
- ✅ Authentication works
- ✅ API integration works
- ✅ Mobile experience is good
- ✅ Error handling works
- ✅ Monitoring is active

## Notes

Date deployed: _______________
Deployed by: _______________
Version/Commit: _______________
Issues encountered: _______________
Resolution: _______________

---

**Status**: [ ] Ready to Deploy | [ ] Deployed | [ ] Verified

**Sign-off**: _______________
