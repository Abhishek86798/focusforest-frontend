# FocusForest - Error Handling & Toast Notifications Guide

## Overview

The FocusForest app now has comprehensive error handling, loading states, and toast notifications to provide a production-quality user experience.

## Toast Notification System

### Setup

We use `react-hot-toast` for toast notifications throughout the app.

**Installation**:
```bash
npm install react-hot-toast
```

**Configuration** (`src/main.tsx`):
```tsx
import { Toaster } from 'react-hot-toast';

<Toaster 
  position="top-right"
  toastOptions={{
    duration: 3000,
    style: {
      fontFamily: "'Space Grotesk', sans-serif",
      fontWeight: 600,
      fontSize: '14px',
    },
    success: {
      style: {
        background: '#006D37',
        color: '#FAFAFA',
      },
    },
    error: {
      style: {
        background: '#DC2626',
        color: '#FAFAFA',
      },
    },
  }}
/>
```

### Usage Convention

Import toast in any component:
```tsx
import toast from 'react-hot-toast';
```

**Three types of toasts**:

1. **Success** (green) - For successful actions:
   ```tsx
   toast.success('Profile updated');
   toast.success('Group created! Share the invite code.');
   toast.success(`Joined ${groupName}!`);
   ```

2. **Error** (red) - For errors:
   ```tsx
   toast.error('Server error. Try again in a moment.');
   toast.error('Connection error. Check your internet.');
   ```

3. **Info** (neutral) - For informational messages:
   ```tsx
   toast('Logged out');
   toast('Session abandoned');
   ```

### Current Toast Implementations

| Action | Toast Message | Type |
|--------|---------------|------|
| Create Group | "Group created! Share the invite code." | Success |
| Join Group | "Joined {groupName}!" | Success |
| Logout | "Logged out" | Info |
| Update Profile | "Profile updated" | Success |
| Abandon Session | "Session abandoned" | Info |
| Server Error (500) | "Server error. Try again in a moment." | Error |
| Network Error | "Connection error. Check your internet." | Error |

## Loading States

### PageLoader Component

**File**: `src/components/PageLoader.tsx`

Full-page centered loading state with FocusForest logo (green square) and pulse animation.

**Usage**:
```tsx
import PageLoader from '../components/PageLoader';

if (isLoading) {
  return <PageLoader />;
}
```

**Current Implementations**:
- `App.tsx` - While checking authentication on app load
- `ProtectedRoute.tsx` - While verifying auth for protected routes

**Design**:
- Green square (80x80px) with rounded corners
- Pulse animation (scale + opacity)
- Centered on light gray background
- Matches app design system

## Error Handling

### 1. Global Error Boundary

**File**: `src/App.tsx`

Catches any React errors that occur anywhere in the component tree.

**Implementation**:
```tsx
import { ErrorBoundary } from 'react-error-boundary';

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <Routes>...</Routes>
</ErrorBoundary>
```

**Error Fallback UI**:
- White card with black border and shadow
- "Something went wrong" heading
- "The app encountered an unexpected error" message
- "Reload App" button that navigates to `/`

### 2. Query Error Boundary

**File**: `src/components/QueryErrorBoundary.tsx`

Handles React Query errors for page-level data fetching.

**Features**:
- Shows error UI with retry button
- Calls `queryClient.refetchQueries()` on retry
- Ignores 401 errors (handled by Axios interceptor)
- Can be used to wrap individual pages or sections

**Usage**:
```tsx
import QueryErrorBoundary from '../components/QueryErrorBoundary';

<QueryErrorBoundary error={error} resetError={reset}>
  {/* Page content */}
</QueryErrorBoundary>
```

**Design**:
- White card with black border and shadow
- Red error icon in circle
- "Something Went Wrong" heading
- "Try Again" button (green)

### 3. Axios Interceptor (Global API Errors)

**File**: `src/api/client.ts`

Handles all API errors globally before they reach components.

**Error Handling**:

1. **401 Unauthorized**:
   - Clears auth state
   - Redirects to `/login`
   - Exception: Does NOT redirect for `/auth/login` or `/auth/signup` requests

2. **500 Server Error**:
   - Shows toast: "Server error. Try again in a moment."

3. **Network Error** (no response):
   - Logs to console
   - Shows toast: "Connection error. Check your internet."

**Implementation**:
```tsx
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 401
    if (error.response?.status === 401) {
      // Clear auth and redirect
    }
    
    // Handle 500
    if (error.response?.status === 500) {
      toast.error('Server error. Try again in a moment.');
    }
    
    // Handle network errors
    if (!error.response) {
      toast.error('Connection error. Check your internet.');
    }
    
    return Promise.reject(error);
  }
);
```

### 4. React Query Error Handling

All `useQuery` hooks should handle errors appropriately:

**Pattern**:
```tsx
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['key'],
  queryFn: fetchData,
});

if (isError) {
  return <QueryErrorBoundary error={error} />;
}

if (isLoading) {
  return <PageLoader />;
}

// Render data
```

**Current Implementations**:
- All hooks in `src/hooks/useForestData.ts` return error states
- Pages can check `isError` and show appropriate UI
- Global interceptor handles 401 and 500 errors automatically

### 5. Mutation Error Handling

For mutations (POST, PUT, DELETE), handle errors in `onError`:

**Pattern**:
```tsx
const mutation = useMutation({
  mutationFn: apiCall,
  onSuccess: (data) => {
    toast.success('Action completed!');
    // Invalidate queries, navigate, etc.
  },
  onError: (error: any) => {
    const code = error?.response?.data?.error?.code;
    
    if (code === 'SPECIFIC_ERROR') {
      // Handle specific error
    } else {
      toast.error('Action failed. Please try again.');
    }
  },
});
```

**Current Implementations**:
- `GroupsPage.tsx` - Create/Join group mutations
- `useSessionLifecycle.ts` - Session start/complete/abandon
- `authStore.ts` - Login/Signup/Logout/UpdateProfile

## Error Codes

### Authentication Errors
- `401` - Unauthorized (handled by interceptor)
- `INVALID_CREDENTIALS` - Wrong email/password
- `USER_NOT_FOUND` - User doesn't exist

### Group Errors
- `INVALID_INVITE_CODE` - Invalid 6-digit code
- `ALREADY_MEMBER` - User already in group
- `GROUP_FULL` - Group has 5 members (max)

### Session Errors
- `DUPLICATE_SESSION` - Session already started (treated as success)
- `SESSION_TOO_SHORT` - Must complete 80% of focus time
- `SESSION_NOT_ACTIVE` - Session already ended

### Server Errors
- `500` - Internal server error (shows toast)
- Network error - No response from server (shows toast)

## Best Practices

### 1. Always Show Loading States
```tsx
if (isLoading) return <PageLoader />;
```

### 2. Handle Errors Gracefully
```tsx
if (isError) return <QueryErrorBoundary error={error} />;
```

### 3. Provide User Feedback
```tsx
toast.success('Action completed!');
toast.error('Action failed');
toast('Informational message');
```

### 4. Don't Show Errors for 401
The global interceptor handles 401 errors automatically. Don't show additional error UI.

### 5. Use Specific Error Messages
```tsx
if (code === 'INVALID_INVITE_CODE') {
  setError('Invalid invite code. Check with your group admin.');
}
```

### 6. Invalidate Queries After Mutations
```tsx
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['key'] });
  toast.success('Success!');
}
```

### 7. Clear Errors on Retry
```tsx
const handleRetry = () => {
  setError(null);
  mutation.mutate(data);
};
```

## Testing Error Handling

### Manual Testing Checklist

1. **Network Errors**:
   - Disconnect internet
   - Try any action
   - Should see: "Connection error. Check your internet."

2. **401 Errors**:
   - Clear cookies
   - Try to access protected route
   - Should redirect to `/login`

3. **500 Errors**:
   - Trigger server error (if possible)
   - Should see: "Server error. Try again in a moment."

4. **Loading States**:
   - Slow down network (DevTools)
   - Should see PageLoader on all pages

5. **Error Boundaries**:
   - Trigger React error (throw in component)
   - Should see error fallback UI

6. **Toast Notifications**:
   - Create group → "Group created!"
   - Join group → "Joined {name}!"
   - Logout → "Logged out"
   - Update profile → "Profile updated"
   - Abandon session → "Session abandoned"

## Future Enhancements

- [ ] Add retry logic for failed requests
- [ ] Implement exponential backoff
- [ ] Add offline detection and queue
- [ ] Show loading skeletons instead of full-page loader
- [ ] Add error tracking (Sentry)
- [ ] Implement toast queue for multiple toasts
- [ ] Add undo functionality for certain actions
- [ ] Show network status indicator

## Summary

✅ Toast notification system with react-hot-toast  
✅ PageLoader component for loading states  
✅ QueryErrorBoundary for React Query errors  
✅ Global ErrorBoundary for React errors  
✅ Axios interceptor for API errors  
✅ Specific error handling for mutations  
✅ User-friendly error messages  
✅ Consistent design system  

The app now provides a production-quality user experience with comprehensive error handling and user feedback.
