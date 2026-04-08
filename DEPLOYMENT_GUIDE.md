# FocusForest Frontend - Deployment Guide

## Overview

The FocusForest frontend is now deployment-ready with environment-aware configuration that works in both development and production environments.

## Routing Configuration

### SPA Routing Setup
The app uses React Router v6 with BrowserRouter for clean URLs (no hash). All routes are configured to work correctly in production with proper fallback handling.

### Route Structure
```
Public Routes:
  /login          - Login page
  /signup         - Signup page

Protected Routes (require authentication):
  /               - Redirects to /dashboard
  /dashboard      - Main dashboard
  /session        - Active focus session
  /calendar       - Calendar view
  /stats          - Statistics dashboard
  /groups         - Groups management
  /leaderboard    - Leaderboard rankings
  /profile        - User profile
  /zen            - Zen mode (immersive timer)

Fallback:
  *               - 404 Not Found page
```

### Protected Route Implementation
- Uses `<Outlet />` pattern for nested protected routes
- Calls `checkAuth()` once on mount using ref flag
- Shows loading screen while checking authentication
- Redirects to `/login` if not authenticated
- Renders nested routes if authenticated

### SPA Fallback Configuration

#### Netlify
The `public/_redirects` file is automatically copied to `dist/` during build:
```
/*    /index.html    200
```

#### Vercel
The `vercel.json` file in project root configures rewrites:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Other Platforms
Configure your hosting to serve `index.html` for all routes (SPA fallback).

## Environment Configuration

### Development Environment
- **File**: `.env.development`
- **API Base URL**: `/api/v1` (uses Vite proxy)
- **Proxy Target**: `https://focusforest-backend.onrender.com`
- **Cookie Handling**: Proxy strips Secure flag and forces SameSite=Lax for local development

### Production Environment
- **File**: `.env.production`
- **API Base URL**: `https://focusforest-backend.onrender.com/api/v1` (direct backend URL)
- **Cookie Handling**: Backend must set appropriate cookie flags for production domain

## Files Created/Modified

### New Files:
1. **`.env.development`** - Development environment variables
2. **`.env.production`** - Production environment variables
3. **`DEPLOYMENT_GUIDE.md`** - This file

### Modified Files:
1. **`src/api/client.ts`**
   - Updated to use `import.meta.env.VITE_API_BASE_URL`
   - Added global response interceptor for 401 handling
   - Added network error handling
   - Auto-redirects to /login on 401 (except for auth requests)

2. **`vite.config.ts`**
   - Added build configuration with code splitting
   - Configured manual chunks for vendor and query libraries
   - Disabled sourcemaps for production
   - Output directory: `dist`

3. **`.gitignore`**
   - Updated to allow `.env.development` and `.env.production`
   - Still ignores `.env` and `.env.local` files

## Build Configuration

### Code Splitting
The build is configured to split code into optimized chunks:
- **vendor**: React, React DOM, React Router DOM
- **query**: React Query
- **main**: Application code

This improves:
- Initial load time
- Caching efficiency
- Bundle size optimization

### Build Output
- **Directory**: `dist/`
- **Sourcemaps**: Disabled for production
- **Minification**: Enabled by default

## Global Error Handling

### 401 Unauthorized
- Automatically clears auth state
- Redirects to `/login`
- Exception: Does NOT redirect for `/auth/login` or `/auth/signup` requests

### Network Errors
- Logs connection errors to console
- Can be extended with toast notifications
- Helps debug connectivity issues

## Development Workflow

### Running Development Server
```bash
npm run dev
```
- Uses `.env.development`
- API calls go through Vite proxy at `/api/v1`
- Proxy forwards to `https://focusforest-backend.onrender.com`
- Cookies work correctly with localhost

### Building for Production
```bash
npm run build
```
- Uses `.env.production`
- Creates optimized bundle in `dist/`
- API calls go directly to `https://focusforest-backend.onrender.com/api/v1`
- No proxy involved

### Preview Production Build
```bash
npm run preview
```
- Serves the production build locally
- Uses production environment variables
- Good for testing before deployment

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Verify Build Output
- Check `dist/` directory exists
- Verify `index.html` is present
- Check chunk files are created

### 3. Deploy to Hosting Platform

#### Option A: Netlify
1. Connect your Git repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Environment variables: Automatically uses `.env.production`

#### Option B: Vercel
1. Import your Git repository
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variables: Automatically uses `.env.production`

#### Option C: Static Hosting (AWS S3, GitHub Pages, etc.)
1. Build the app: `npm run build`
2. Upload contents of `dist/` directory
3. Configure routing to serve `index.html` for all routes (SPA)

### 4. Configure Backend CORS
Ensure your backend allows requests from your production domain:
```javascript
// Backend CORS configuration example
cors({
  origin: 'https://your-frontend-domain.com',
  credentials: true
})
```

### 5. Configure Backend Cookies
For production, backend should set cookies with:
- `Secure: true` (HTTPS only)
- `SameSite: None` or `Lax` (depending on your setup)
- `HttpOnly: true` (security)

## Environment Variables

### Available Variables
- `VITE_API_BASE_URL` - Base URL for API requests

### Adding New Variables
1. Add to `.env.development` and `.env.production`
2. Prefix with `VITE_` (required by Vite)
3. Access via `import.meta.env.VITE_YOUR_VAR`
4. TypeScript types can be added to `src/vite-env.d.ts`

## Troubleshooting

### Issue: API calls fail in production
**Solution**: Check that `VITE_API_BASE_URL` in `.env.production` is correct

### Issue: 401 redirects not working
**Solution**: Verify the interceptor is properly imported and configured in `src/api/client.ts`

### Issue: Cookies not working in production
**Solution**: 
- Ensure backend sets `Secure: true` for HTTPS
- Check CORS configuration allows credentials
- Verify `withCredentials: true` in API client

### Issue: Build fails
**Solution**:
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors: `npm run build`
- Verify all imports are correct

### Issue: Routing doesn't work after deployment
**Solution**: Configure your hosting platform to serve `index.html` for all routes (SPA fallback)

## Performance Optimization

### Current Optimizations
- Code splitting (vendor, query, main chunks)
- Tree shaking (unused code removal)
- Minification
- No sourcemaps in production

### Future Optimizations
- Lazy loading routes
- Image optimization
- Service worker for offline support
- CDN for static assets

## Security Considerations

### Current Security Measures
- HttpOnly cookies for authentication
- CORS with credentials
- No sensitive data in localStorage
- 401 auto-logout

### Recommendations
- Use HTTPS in production (required for Secure cookies)
- Implement Content Security Policy (CSP)
- Add rate limiting on backend
- Regular dependency updates

## Monitoring

### Recommended Tools
- **Sentry**: Error tracking
- **Google Analytics**: User analytics
- **Lighthouse**: Performance monitoring
- **LogRocket**: Session replay

### Key Metrics to Monitor
- Page load time
- API response times
- Error rates
- User engagement

## Rollback Procedure

If issues occur after deployment:
1. Revert to previous Git commit
2. Rebuild: `npm run build`
3. Redeploy
4. Verify functionality

## Support

For issues or questions:
- Check this guide first
- Review `docs/API_ERROR_HANDLING.md`
- Check `docs/FRONTEND_INTEGRATION_GUIDE.md`
- Review backend API documentation

## Checklist Before Deployment

- [ ] All tests pass
- [ ] Build completes without errors
- [ ] Environment variables are correct
- [ ] Backend CORS is configured
- [ ] Backend cookies are configured for production
- [ ] Routing fallback is configured on hosting platform
- [ ] HTTPS is enabled
- [ ] Error monitoring is set up
- [ ] Performance is acceptable
- [ ] All features work in production preview

## Post-Deployment Verification

After deployment, verify:
1. Login/Signup works
2. Dashboard loads correctly
3. Timer functionality works
4. Groups features work
5. Leaderboard displays
6. Profile page loads
7. Calendar displays
8. Session history shows
9. Logout works
10. 401 redirects work

## Notes

- The Vite proxy is ONLY used in development
- Production builds connect directly to the backend
- Environment files are committed to the repository (no secrets)
- The only localStorage usage is for UI preferences (variant selection)
- All authentication uses httpOnly cookies
