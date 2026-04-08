# Session Lifecycle Integration Guide

## Overview

The session lifecycle manages the complete flow from starting a focus session to completing or abandoning it. This guide shows how to integrate the session lifecycle into your timer components.

## Architecture

### Store: `src/stores/sessionStore.ts`

Manages session state using Zustand:

```typescript
interface SessionState {
  // Timer settings
  selectedVariant: SessionVariant;
  customFocusMinutes: number;
  customBreakMinutes: number;
  alwaysUseVariant: boolean;
  
  // Task tracking
  taskText: string | null;
  
  // Active session
  sessionId: string | null;           // From /sessions/start
  clientSessionId: string | null;     // Generated before API call
  focusMinutes: number;
  isRunning: boolean;
  
  // Pomodoro tracking
  sessionCount: number;               // 0-3, resets after 4
  
  // Last streak
  lastStreak: number | null;
}
```

### Hook: `src/hooks/useSessionLifecycle.ts`

Provides three main functions:
- `startSession()` - Initiates a new focus session
- `completeSession(taskStatus)` - Marks session as done
- `abandonSession()` - Cancels active session

### API: `src/api/index.ts`

Session API methods:
- `sessionApi.start(body)` - POST /sessions/start
- `sessionApi.complete(sessionId, taskStatus)` - POST /sessions/:id/complete
- `sessionApi.abandon(sessionId)` - POST /sessions/:id/abandon

---

## Usage Examples

### 1. Starting a Session

When user clicks "Focus" or "Start" button:

```typescript
import { useSessionLifecycle } from '../hooks/useSessionLifecycle';
import { useSessionStore } from '../stores/sessionStore';

function TimerComponent() {
  const { startSession } = useSessionLifecycle();
  const { selectedVariant, taskText } = useSessionStore();

  const handleStart = async () => {
    const result = await startSession();
    
    if (!result.success) {
      // Show error toast
      toast.error(result.error);
    }
    // On success, user is automatically navigated to /session
  };

  return (
    <button onClick={handleStart}>
      Start Focus Session
    </button>
  );
}
```

**What happens:**
1. Generates `clientSessionId = crypto.randomUUID()`
2. Calls `POST /sessions/start` with variant, focusMinutes, taskText
3. Stores returned `sessionId` in sessionStore
4. Navigates to `/session` (active timer screen)
5. If 409 DUPLICATE_SESSION, treats as success and continues

---

### 2. Completing a Session

When timer reaches 00:00 or user clicks complete:

```typescript
import { useState } from 'react';
import { useSessionLifecycle } from '../hooks/useSessionLifecycle';
import { useSessionStore } from '../stores/sessionStore';

function SessionCompletePopup() {
  const { completeSession } = useSessionLifecycle();
  const { taskText } = useSessionStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async (taskStatus: 'completed' | 'carried' | 'none') => {
    setIsSubmitting(true);
    
    const result = await completeSession(taskStatus);
    
    if (!result.success) {
      if (result.code === 'SESSION_TOO_SHORT') {
        toast.error('Complete at least 80% of your focus time to count this session');
      } else if (result.code === 'SESSION_NOT_ACTIVE') {
        // Already handled, user navigated home
      } else {
        toast.error(result.error);
      }
    } else {
      // Success! Show tree growth animation
      toast.success(`Tree grew to stage ${result.tree.stage}!`);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="popup">
      <h2>Session Complete! 🎉</h2>
      
      {taskText ? (
        <>
          <p>Your task: <strong>{taskText}</strong></p>
          <button onClick={() => handleComplete('completed')} disabled={isSubmitting}>
            ✅ Done (Complete)
          </button>
          <button onClick={() => handleComplete('carried')} disabled={isSubmitting}>
            ↩️ Carry Forward
          </button>
        </>
      ) : (
        <p>Nice work!</p>
      )}
    </div>
  );
}
```

**What happens:**
1. Shows popup with Done/Carry Forward buttons
2. Calls `POST /sessions/:id/complete` with taskStatus
3. Receives `{ tree, streak }` response
4. Updates sessionStore with new streak
5. If 'carried', keeps taskText for next session
6. If 'completed', clears taskText
7. Invalidates React Query caches for trees and sessions
8. Navigates to `/` (home)

**Error Handling:**
- `SESSION_TOO_SHORT` - User completed before 80% elapsed
- `SESSION_NOT_ACTIVE` - Session already ended, navigate home silently

---

### 3. Abandoning a Session

When user clicks "Abandon Session" link:

```typescript
import { useSessionLifecycle } from '../hooks/useSessionLifecycle';

function ActiveTimerScreen() {
  const { abandonSession } = useSessionLifecycle();

  const handleAbandon = async () => {
    const result = await abandonSession();
    
    if (result.cancelled) {
      // User clicked "Cancel" in confirm dialog
      return;
    }
    
    if (!result.success) {
      toast.error(result.error);
    }
    // On success, user is automatically navigated to /
  };

  return (
    <button onClick={handleAbandon} className="text-red-500">
      Abandon Session
    </button>
  );
}
```

**What happens:**
1. Shows confirm dialog: "End session early? Your progress will be lost."
2. If confirmed, calls `POST /sessions/:id/abandon`
3. Clears sessionStore (sessionId, clientSessionId, isRunning)
4. Does NOT increment sessionCount (pomodoro progress lost)
5. Invalidates React Query cache for trees
6. Navigates to `/` (home)

---

## Complete Integration Example

Here's a full timer component with all lifecycle methods:

```typescript
import { useState, useEffect } from 'react';
import { useSessionLifecycle } from '../hooks/useSessionLifecycle';
import { useSessionStore } from '../stores/sessionStore';

function TimerPage() {
  const { startSession, completeSession, abandonSession } = useSessionLifecycle();
  const { 
    sessionId, 
    isRunning, 
    focusMinutes, 
    taskText,
    setRunning 
  } = useSessionStore();

  const [timeLeft, setTimeLeft] = useState(focusMinutes * 60);
  const [showCompletePopup, setShowCompletePopup] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          setShowCompletePopup(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, setRunning]);

  // Start session
  const handleStart = async () => {
    if (!sessionId) {
      // First time starting
      await startSession();
    } else {
      // Resume existing session
      setRunning(true);
    }
  };

  // Pause session
  const handlePause = () => {
    setRunning(false);
  };

  // Complete session
  const handleComplete = async (taskStatus: 'completed' | 'carried' | 'none') => {
    setShowCompletePopup(false);
    await completeSession(taskStatus);
  };

  // Abandon session
  const handleAbandon = async () => {
    await abandonSession();
  };

  return (
    <div>
      <h1>Focus Timer</h1>
      
      {/* Timer display */}
      <div className="timer">
        {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
      </div>

      {/* Controls */}
      {!sessionId ? (
        <button onClick={handleStart}>Start Session</button>
      ) : (
        <>
          {isRunning ? (
            <button onClick={handlePause}>Pause</button>
          ) : (
            <button onClick={handleStart}>Resume</button>
          )}
          <button onClick={handleAbandon}>Abandon Session</button>
        </>
      )}

      {/* Complete popup */}
      {showCompletePopup && (
        <div className="popup">
          <h2>Session Complete! 🎉</h2>
          {taskText ? (
            <>
              <p>Task: {taskText}</p>
              <button onClick={() => handleComplete('completed')}>
                ✅ Done
              </button>
              <button onClick={() => handleComplete('carried')}>
                ↩️ Carry Forward
              </button>
            </>
          ) : (
            <button onClick={() => handleComplete('none')}>
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## State Flow Diagram

```
┌─────────────────┐
│   Home Screen   │
│  (No session)   │
└────────┬────────┘
         │
         │ User clicks "Start"
         │ startSession()
         ▼
┌─────────────────┐
│ Generate UUID   │
│ clientSessionId │
└────────┬────────┘
         │
         │ POST /sessions/start
         ▼
┌─────────────────┐
│  Store sessionId│
│  Navigate /session
└────────┬────────┘
         │
         │ Timer counts down
         ▼
┌─────────────────┐
│  Timer = 00:00  │
│  Show popup     │
└────────┬────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         │ Done            │ Carry Forward   │ Abandon
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ completeSession │ │ completeSession │ │ abandonSession  │
│ ('completed')   │ │ ('carried')     │ │                 │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         │ Clear taskText    │ Keep taskText     │ Clear all
         │                   │                   │
         └───────────────────┴───────────────────┘
                             │
                             │ Navigate /
                             ▼
                    ┌─────────────────┐
                    │   Home Screen   │
                    │ (Ready for next)│
                    └─────────────────┘
```

---

## Error Handling Reference

| Error Code | HTTP Status | Handling |
|------------|-------------|----------|
| `DUPLICATE_SESSION` | 409 | Treat as success, continue to /session |
| `SESSION_TOO_SHORT` | 400 | Show: "Complete at least 80% of your focus time" |
| `SESSION_NOT_ACTIVE` | 400 | Navigate home silently |
| `UNAUTHORIZED` | 401 | Redirect to /login |
| Network error | - | Show: "Connection error, please try again" |

---

## Testing Checklist

- [ ] Start session generates unique clientSessionId
- [ ] Start session navigates to /session
- [ ] Duplicate session (409) is handled gracefully
- [ ] Timer countdown works correctly
- [ ] Complete popup shows at 00:00
- [ ] Done button clears taskText
- [ ] Carry Forward keeps taskText for next session
- [ ] Abandon shows confirm dialog
- [ ] Abandon clears session state
- [ ] SESSION_TOO_SHORT error shows proper message
- [ ] Tree and streak update after completion
- [ ] React Query caches invalidate correctly
- [ ] sessionCount increments (0→1→2→3→0)

---

## Best Practices

1. **Always generate clientSessionId before API call** - This prevents duplicate submissions
2. **Handle 409 DUPLICATE_SESSION gracefully** - Treat as success, don't show error
3. **Show confirm dialog for abandon** - Prevent accidental session loss
4. **Keep taskText on 'carried' status** - User wants to continue the task
5. **Invalidate queries after completion** - Ensure UI shows latest data
6. **Navigate automatically** - Don't require user to manually go back
7. **Handle SESSION_NOT_ACTIVE silently** - Session already ended, just navigate home
