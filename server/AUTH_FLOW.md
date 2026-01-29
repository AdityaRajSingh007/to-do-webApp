# Authentication Flow Testing

This document outlines how to test the authentication flow of the Cyberpunk To-Do backend.

## Flow Overview

1. User authenticates with Firebase on the frontend
2. Frontend gets Firebase ID token
3. Frontend sends token to backend via `/api/auth/sync`
4. Backend verifies token with Firebase Admin SDK
5. Backend creates/updates user in MongoDB
6. All subsequent requests include Firebase token in headers

## Step-by-Step Test Process

### 1. Get a Firebase ID Token

First, you need to authenticate with Firebase and get an ID token. This typically happens on the frontend, but for testing purposes you can simulate this.

### 2. Test the Auth Sync Endpoint

After obtaining a valid Firebase ID token, make a POST request to sync the user:

```bash
curl -X POST http://localhost:5000/api/auth/sync \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "message": "User authenticated and synced successfully",
  "user": {
    "id": "...",
    "firebaseUid": "...",
    "email": "...",
    "createdAt": "..."
  }
}
```

### 3. Test Protected Endpoints

Once authenticated, you can access protected endpoints using the same token:

```bash
curl -X GET http://localhost:5000/api/boards/SOME_BOARD_ID \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

### 4. Error Cases to Test

#### Invalid Token
```bash
curl -X POST http://localhost:5000/api/auth/sync \
  -H "Authorization: Bearer INVALID_TOKEN" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": false,
  "message": "Invalid or expired token."
}
```

#### Missing Token
```bash
curl -X POST http://localhost:5000/api/auth/sync \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

## Integration with Frontend

The frontend should implement this flow:

```javascript
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// After Firebase authentication
const auth = getAuth();
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await userCredential.user.getIdToken();

// Sync with backend
const syncResponse = await fetch('http://localhost:5000/api/auth/sync', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  }
});

if (syncResponse.ok) {
  const userData = await syncResponse.json();
  // User is now synced with backend
  // Store the token for future requests
  localStorage.setItem('firebaseIdToken', idToken);
}
```

## Token Refresh

Firebase ID tokens expire after 1 hour. Implement token refresh in your frontend:

```javascript
// Before each API call, ensure token is fresh
const getValidIdToken = async () => {
  const currentUser = getAuth().currentUser;
  if (currentUser) {
    // Force refresh to get a new token
    const token = await currentUser.getIdToken(true);
    return token;
  }
  throw new Error('No authenticated user');
};
```

## Security Notes

- Never expose Firebase private keys in frontend code
- Always validate Firebase tokens on the backend
- Tokens should be transmitted over HTTPS in production
- Store tokens securely on the frontend (preferably in memory vs localStorage if possible)