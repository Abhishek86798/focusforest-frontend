import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useSessionStore } from '../stores/sessionStore';
import { useAuthStore } from '../stores/authStore';
import { sessionApi } from '../api';
import { getErrorCode } from '../lib/apiError';

/**
 * Session Lifecycle Hook
 * Manages the complete flow: start → complete/abandon → cleanup
 */
export function useSessionLifecycle() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionStore = useSessionStore();
  const checkAuth = useAuthStore(state => state.checkAuth);

  /**
   * START SESSION
   * 1. Generate clientSessionId
   * 2. Call POST /sessions/start
   * 3. Store sessionId
   * 4. Navigate to /session
   */
  const startSession = async () => {
    try {
      // Generate client session ID BEFORE API call
      const clientSessionId = crypto.randomUUID();
      
      const { selectedVariant, focusMinutes, taskText } = sessionStore;
      
      // Call API
      const response = await sessionApi.start({
        variant: selectedVariant,
        focusMinutes,
        taskText: taskText || undefined,
        clientSessionId,
      });

      // Store session IDs
      sessionStore.startSession(response.sessionId, clientSessionId, focusMinutes);

      // Navigate to active timer screen
      navigate('/session');

      return { success: true, sessionId: response.sessionId };
    } catch (error: any) {
      const code = getErrorCode(error);
      
      // If duplicate session, treat as success (already started)
      if (code === 'DUPLICATE_SESSION' || error.response?.status === 409) {
        console.warn('Session already started, continuing...');
        navigate('/session');
        return { success: true, isDuplicate: true };
      }

      console.error('Failed to start session:', error);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Failed to start session' 
      };
    }
  };

  /**
   * COMPLETE SESSION
   * 1. Show popup with Done/Carry Forward buttons
   * 2. Call POST /sessions/:id/complete
   * 3. Update tree and streak
   * 4. Invalidate queries
   * 5. Handle carried tasks
   */
  const completeSession = async (taskStatus: 'completed' | 'carried' | 'none') => {
    const { sessionId } = sessionStore;

    if (!sessionId) {
      console.error('No active session to complete');
      return { success: false, error: 'No active session' };
    }

    try {
      // Call API
      const response = await sessionApi.complete(sessionId, taskStatus);

      // Update streak in store
      sessionStore.completeSession(response.streak.currentStreak);

      // If task was carried forward, keep it for next session
      if (taskStatus === 'carried') {
        // taskText is already in store, keep it
      } else if (taskStatus === 'completed') {
        // Clear completed task
        sessionStore.setTaskText(null);
      }

      // Refresh data
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['trees', 'today'] }),
        queryClient.invalidateQueries({ queryKey: ['sessions'] }),
        checkAuth(), // Refresh user data including streak
      ]);

      // Navigate back to home
      navigate('/');

      return { 
        success: true, 
        tree: response.tree, 
        streak: response.streak 
      };
    } catch (error: any) {
      const code = getErrorCode(error);

      // Handle specific errors
      if (code === 'SESSION_TOO_SHORT' || error.response?.data?.error?.code === 'SESSION_TOO_SHORT') {
        return {
          success: false,
          error: 'Complete at least 80% of your focus time to count this session',
          code: 'SESSION_TOO_SHORT',
        };
      }

      if (code === 'SESSION_NOT_ACTIVE' || error.response?.data?.error?.code === 'SESSION_NOT_ACTIVE') {
        // Session already ended, navigate home silently
        sessionStore.abandonSession();
        navigate('/');
        return { success: false, error: 'Session already ended', code: 'SESSION_NOT_ACTIVE' };
      }

      console.error('Failed to complete session:', error);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Failed to complete session' 
      };
    }
  };

  /**
   * ABANDON SESSION
   * 1. Show confirm dialog
   * 2. Call POST /sessions/:id/abandon
   * 3. Navigate to home
   * 4. Invalidate queries
   */
  const abandonSession = async (skipConfirm = true) => {
    const { sessionId } = sessionStore;

    if (!sessionId) {
      console.error('No active session to abandon');
      return { success: false, error: 'No active session' };
    }

    // NOTE: Confirmation dialogs must be handled by the calling UI component
    // (e.g. AbandonSessionModal) before invoking this hook.
    // The skipConfirm param is kept for API compatibility but confirm() is removed.
    void skipConfirm;

    try {
      // Call API
      await sessionApi.abandon(sessionId);

      // Clear session state
      sessionStore.abandonSession();

      // Show toast
      toast('Session abandoned');

      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['trees', 'today'] });

      // Navigate back to home
      navigate('/');

      return { success: true };
    } catch (error: any) {
      const code = getErrorCode(error);

      // If session not active, just navigate home
      if (code === 'SESSION_NOT_ACTIVE' || error.response?.data?.error?.code === 'SESSION_NOT_ACTIVE') {
        sessionStore.abandonSession();
        navigate('/');
        return { success: true };
      }

      console.error('Failed to abandon session:', error);
      return { 
        success: false, 
        error: error.response?.data?.error?.message || 'Failed to abandon session' 
      };
    }
  };

  return {
    startSession,
    completeSession,
    abandonSession,
  };
}
