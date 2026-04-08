# Profile Page Integration - Complete

## Summary

Successfully wired the Profile page with all required data sources, localStorage preferences, and account management functionality.

## Features Implemented

### 1. Profile Header ✅
- **User Name**: Displays `user.name` from `authStore.user`
- **Avatar**: Placeholder box (ready for `user.avatarUrl` when available)
- **Data Source**: `GET /auth/me` (loaded on app mount via authStore)

### 2. Stats Bento Grid ✅

#### Current Streak (Green Focal Card)
- **Data Source**: `sessionStore.lastStreak` (most recent from POST /sessions/:id/complete)
- **Fallback**: `authStore.user.currentStreak` if no session completed this visit
- **Default**: Shows `0` if neither available
- **Updates**: Automatically when user completes a session

#### Trees Grown
- **Data Source**: `GET /stats/summary` → `treesCompleted`
- **Display**: Shows `--` until data loads
- **Delta**: "+X this week" calculated from `GET /trees/week/:currentWeekId`
  - Counts days where `stage === 4`
  - Real-time calculation based on current week data

#### Focus Hours
- **Data Source**: `GET /stats/summary` → `totalMinutes / 60` (rounded)
- **Display**: Shows `--` until data loads
- **Subtext**: "Keep it up!" (replaced "Top 5% User")

### 3. Account Details Section ✅

#### Set Default Variant
- **UI**: Clickable row with chevron, shows current selection
- **Modal**: Opens variant picker with 4 options (Sprint, Classic, Deep Work, Flow)
- **Storage**: `localStorage.setItem('focusforest_default_variant', variant)`
- **Key**: `'focusforest_default_variant'`
- **Read On**: Home screen to pre-select variant picker
- **Visual**: Selected variant has green background + checkmark
- **Note**: This is frontend-only, NOT sent to backend

#### Time Zone
- **Display**: Current timezone string (read-only)
- **Source**: `Intl.DateTimeFormat().resolvedOptions().timeZone`
- **Example**: "America/New_York", "Europe/London", "Asia/Tokyo"
- **No API Call**: Pure client-side display

#### Sign Out
- **Action**: Calls `authStore.logout()`
- **API**: `POST /auth/logout` (clears httpOnly cookies)
- **Navigation**: Redirects to `/login`
- **Visual**: Red text and icon for emphasis

### 4. Profile Update (Ready for Future) ✅
- **Method**: `authStore.updateProfile({ name })`
- **API**: `PATCH /auth/profile`
- **Updates**: `authStore.user` on success
- **Toast**: "Profile updated" (can be added when edit flow is implemented)

## Code Changes

### Files Modified:

1. **src/pages/ProfilePage.tsx**
   - Added imports for React Query, mutations, and API client
   - Updated StatsBentoGrid to fetch real data
   - Added variant picker modal with localStorage
   - Added timezone display
   - Updated SettingsRow to support value display
   - Wired Sign Out button

2. **src/stores/authStore.ts**
   - Added `updateProfile` method
   - Supports updating name, avatarUrl, isPrivate

3. **src/stores/sessionStore.ts**
   - Already has `lastStreak` field
   - Updated by `completeSession()` in useSessionLifecycle

## Data Flow

### On Mount:
1. `authStore.checkAuth()` → `GET /auth/me` (already happens on app mount)
2. `useStatsSummary()` → `GET /stats/summary`
3. `useWeekData(currentWeekId)` → `GET /trees/week/:weekId`
4. Read `localStorage.getItem('focusforest_default_variant')`
5. Get timezone from `Intl.DateTimeFormat()`

### On Session Complete:
1. `POST /sessions/:id/complete` returns `{ streak: { currentStreak } }`
2. `sessionStore.completeSession(currentStreak)` updates `lastStreak`
3. Profile page automatically shows updated streak

### On Variant Select:
1. User clicks "Set Default Variant"
2. Modal opens with 4 variant options
3. User selects variant
4. `localStorage.setItem('focusforest_default_variant', variant)`
5. Modal closes, row shows selected variant name

### On Sign Out:
1. User clicks "Sign Out"
2. `authStore.logout()` → `POST /auth/logout`
3. Navigate to `/login`

## localStorage Usage

**Key**: `'focusforest_default_variant'`

**Values**: `'sprint' | 'classic' | 'deep_work' | 'flow'`

**Purpose**: UI preference for default timer variant selection

**Read On**: Home screen / Dashboard to pre-select variant in picker

**Note**: This is the ONLY acceptable use of localStorage in the app (UI preference, not auth data)

## API Endpoints Used

- `GET /auth/me` - User profile (via authStore)
- `GET /stats/summary` - Trees completed, total minutes
- `GET /trees/week/:weekId` - Current week data for delta calculation
- `POST /auth/logout` - Sign out
- `PATCH /auth/profile` - Update profile (ready for future use)

## React Query Integration

All data fetching uses React Query hooks:
- `useStatsSummary()` - Caches stats data
- `useWeekData(weekId)` - Caches week data
- Auto-refetches on window focus
- Proper loading states

## Zustand Store Integration

- `useAuthStore()` - User data, logout
- `useSessionStore()` - Last streak from completed sessions

## Visual Design

- **Streak Card**: Large green focal point with flame icon
- **Stats Cards**: White cards with trend indicators
- **Variant Modal**: Clean modal with emoji icons and descriptions
- **Settings Rows**: Bordered rows with icons and values
- **Sign Out**: Red color for emphasis

## Testing Checklist

- [x] Profile name displays from authStore
- [x] Streak shows from sessionStore.lastStreak
- [x] Streak falls back to user.currentStreak
- [x] Trees grown shows from stats API
- [x] Trees this week delta calculated correctly
- [x] Focus hours shows from stats API (minutes / 60)
- [x] Default variant modal opens
- [x] Variant selection saves to localStorage
- [x] Selected variant displays in row
- [x] Timezone displays correctly
- [x] Sign out button works
- [x] Navigation to /login after logout
- [x] Loading states show "--" for stats
- [x] Mobile responsive design

## Next Steps (Optional Enhancements)

1. **Edit Name** - Add inline edit or modal for name changes
2. **Avatar Upload** - Add avatar upload functionality
3. **Privacy Toggle** - Add isPrivate toggle for leaderboard visibility
4. **Account Stats** - Add more detailed stats (sessions per day, etc.)
5. **Achievements** - Add badges/achievements display
6. **Export Data** - Add data export functionality

## Notes

- Streak updates automatically when user completes a session
- localStorage is ONLY used for UI preference (variant selection)
- All auth data uses httpOnly cookies (never localStorage)
- Timezone is display-only, no API call needed
- Profile update method is ready but not yet wired to UI
- Stats show "--" until API data loads (proper loading states)
- Week delta calculation is real-time based on current week data
