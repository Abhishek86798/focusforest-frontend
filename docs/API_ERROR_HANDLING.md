# API Error Handling Guide

## Backend Error Format

All API errors from the FocusForest backend follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

## Frontend Error Utilities

Located in `src/lib/apiError.ts`:

### `getErrorCode(error: unknown): string`

Extracts the error code from an Axios error response.

```typescript
import { getErrorCode } from '@/lib/apiError';

try {
  await apiClient.post('/auth/login', { email, password });
} catch (error) {
  const code = getErrorCode(error);
  // code will be 'INVALID_CREDENTIALS', 'UNKNOWN_ERROR', etc.
}
```

### `getErrorMessage(error: unknown): string`

Extracts the human-readable error message.

```typescript
import { getErrorMessage } from '@/lib/apiError';

try {
  await apiClient.post('/auth/signup', data);
} catch (error) {
  const message = getErrorMessage(error);
  setErrorMessage(message); // Display to user
}
```

### `getApiError(error: unknown): { code: string; message: string }`

Extracts both code and message in one call.

```typescript
import { getApiError } from '@/lib/apiError';

try {
  await apiClient.post('/sessions', sessionData);
} catch (error) {
  const { code, message } = getApiError(error);
  
  if (code === 'DUPLICATE_SESSION') {
    // Handle duplicate
  } else {
    showToast(message);
  }
}
```

## Common Error Codes

### Authentication
- `INVALID_CREDENTIALS` - Wrong email/password
- `EMAIL_ALREADY_EXISTS` - Signup with existing email
- `UNAUTHORIZED` - Not logged in
- `SESSION_EXPIRED` - Session timeout

### Sessions
- `DUPLICATE_SESSION` - Same clientSessionId submitted twice
- `INVALID_VARIANT` - Unknown timer variant
- `INVALID_DURATION` - Focus minutes out of range

### Trees
- `TREE_NOT_FOUND` - Requested tree doesn't exist
- `TREE_ALREADY_FINALIZED` - Cannot modify finalized tree

### Groups
- `GROUP_NOT_FOUND` - Invalid group ID
- `INVALID_INVITE_CODE` - Wrong invite code
- `ALREADY_MEMBER` - User already in group

## Usage Examples

### Login Page

```typescript
const onSubmit = async (data: FormData) => {
  try {
    await login(data.email, data.password);
    navigate('/');
  } catch (error) {
    const code = getErrorCode(error);
    
    if (code === 'INVALID_CREDENTIALS') {
      setError('Invalid email or password');
    } else {
      setError(getErrorMessage(error));
    }
  }
};
```

### Session Submission

```typescript
const sessionMutation = useMutation({
  mutationFn: sessionApi.create,
  onError: (error) => {
    const { code, message } = getApiError(error);
    
    if (code === 'DUPLICATE_SESSION') {
      console.warn('Session already logged');
    } else {
      toast.error(message);
    }
  }
});
```

## Best Practices

1. **Always use the error utilities** - Don't manually parse error responses
2. **Handle specific error codes** - Check for known codes before showing generic messages
3. **Show user-friendly messages** - Use `getErrorMessage()` for display
4. **Log error codes** - Use `getErrorCode()` for debugging and analytics
5. **Fallback gracefully** - Always handle `UNKNOWN_ERROR` case
