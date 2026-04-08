# FocusForest - Routing Guide

## Overview

FocusForest uses React Router v6 with BrowserRouter for clean, production-ready URLs. The routing is configured to work seamlessly in both development and production environments.

## Route Structure

### Public Routes
These routes are accessible without authentication:

- `/login` - User login page
- `/signup` - User registration page

If a user is already authenticated and tries to access these routes, they are redirected to `/`.

### Protected Routes
These routes require authentication and are wrapped in the `<ProtectedRoute>` component:

- `/` - Redirects to `/dashboard`
- `/dashboard` - Main dashboard with today's tree and week view
- `/session` - Active focus session (immersive timer)
- `/calendar` - Calendar view with heatmap and monthly efforts
- `/stats` - Statistics dashboard
- `/groups` - Groups management (list, join, leave, members)
- `/leaderboard` - Solo and group leaderboards
- `/profile` - User profile with stats and settings
- `/zen` - Zen mode (full-screen immersive experience)

### Fallback Route
- `*` - 404 Not Found page with "Go Home" button

## Protected Route Implementation

The `ProtectedRoute` component uses the Outlet pattern for nested routes:

```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<Navigate to="/dashboard" replace />} />
  <Route path="/dashboard" element={<DashboardPage />} />
  {/* ... other protected routes */}
</Route>
```

### Authentication Flow

1. **On Mount**: `checkAuth()` is called once using a ref flag to prevent multiple calls
2. **Loading State**: Shows a loading spinner while checking authentication
3. **Not Authenticated**: Redirects to `/login` with `replace` flag
4. **Authenticated**: Renders `<Outlet />` which displays the nested route

### Key Features

- **Single Auth Check**: Uses `useRef` to ensure `checkAuth()` is only called once
- **Loading Screen**: Displays while authentication status is being verified
- **Automatic Redirect**: Unauthenticated users are sent to `/login`
- **Nested Routes**: All protected routes are children of `<ProtectedRoute>`

## SPA Routing Configuration

### Why SPA Routing Matters

Single Page Applications (SPAs) handle routing on the client side. When a user navigates to `/dashboard` directly (not through a link), the server needs to serve `index.html` so React Router can handle the route.

### Netlify Configuration

File: `public/_redirects`

```
/*    /index.html    200
```

This file is automatically copied to `dist/` during the build process. It tells Netlify to serve `index.html` for all routes with a 200 status code (not a redirect).

### Vercel Configuration

File: `vercel.json` (project root)

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configures Vercel to rewrite all routes to `index.html` while preserving the URL.

### Other Hosting Platforms

For other platforms (AWS S3, GitHub Pages, etc.), configure your server to:
1. Serve `index.html` for all routes
2. Preserve the original URL (don't redirect)
3. Return 200 status code (not 404)

## Router Type: BrowserRouter

The app uses `BrowserRouter` (not `HashRouter`) for clean URLs:

✅ **Good**: `https://focusforest.com/dashboard`  
❌ **Bad**: `https://focusforest.com/#/dashboard`

BrowserRouter is configured in `src/main.tsx`:

```tsx
<BrowserRouter>
  <App />
</BrowserRouter>
```

## Development vs Production

### Development
- Vite dev server handles routing automatically
- No special configuration needed
- Hot module replacement works with all routes

### Production
- Static files are served from `dist/`
- Server must be configured to serve `index.html` for all routes
- `_redirects` (Netlify) or `vercel.json` (Vercel) handles this

## Testing Routing

### Local Testing

1. **Development Server**:
   ```bash
   npm run dev
   ```
   Navigate to different routes and refresh the page.

2. **Production Preview**:
   ```bash
   npm run build
   npm run preview
   ```
   Test that direct URL navigation works.

### Production Testing

After deployment, test:
1. Direct URL navigation (type `/dashboard` in address bar)
2. Browser back/forward buttons
3. Page refresh on protected routes
4. 404 page for invalid routes
5. Login redirect for unauthenticated access

## Common Issues

### Issue: 404 on Page Refresh
**Cause**: Server is not configured to serve `index.html` for all routes  
**Solution**: Add `_redirects` (Netlify) or `vercel.json` (Vercel)

### Issue: Hash in URLs (#/dashboard)
**Cause**: Using `HashRouter` instead of `BrowserRouter`  
**Solution**: Verify `BrowserRouter` is used in `src/main.tsx`

### Issue: Infinite Redirect Loop
**Cause**: Protected route redirects to login, which redirects back  
**Solution**: Check `ProtectedRoute` logic and auth state

### Issue: Auth Check Runs Multiple Times
**Cause**: `useEffect` without proper dependency management  
**Solution**: Use `useRef` flag to ensure single execution

## Route Navigation

### Programmatic Navigation

```tsx
import { useNavigate } from 'react-router-dom';

function MyComponent() {
  const navigate = useNavigate();
  
  // Navigate to dashboard
  navigate('/dashboard');
  
  // Navigate with replace (no history entry)
  navigate('/login', { replace: true });
  
  // Go back
  navigate(-1);
}
```

### Link Navigation

```tsx
import { Link } from 'react-router-dom';

<Link to="/dashboard">Go to Dashboard</Link>
```

### Navigate Component

```tsx
import { Navigate } from 'react-router-dom';

// Redirect
<Navigate to="/dashboard" replace />
```

## Security Considerations

1. **Protected Routes**: All sensitive routes are wrapped in `<ProtectedRoute>`
2. **Auth Check**: Authentication is verified on every app load
3. **Token Storage**: Uses httpOnly cookies (not localStorage)
4. **Redirect on 401**: Global interceptor redirects to login on unauthorized requests

## Performance

- **Code Splitting**: Routes can be lazy-loaded for better performance
- **Prefetching**: React Query caches data for faster navigation
- **No Hash**: BrowserRouter provides cleaner URLs and better SEO

## Future Enhancements

- [ ] Lazy load routes with `React.lazy()` and `Suspense`
- [ ] Add route-level loading states
- [ ] Implement breadcrumb navigation
- [ ] Add route transition animations
- [ ] Create route guards for specific permissions

## Summary

✅ BrowserRouter for clean URLs  
✅ Protected routes with Outlet pattern  
✅ Single auth check with ref flag  
✅ SPA routing configured for Netlify and Vercel  
✅ 404 page for invalid routes  
✅ Proper loading and redirect states  

The routing is production-ready and follows React Router v6 best practices.
