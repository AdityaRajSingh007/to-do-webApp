# Frontend Integration Guide

This document explains how to connect your existing frontend to the Cyberpunk To-Do backend.

## Authentication Flow

The backend works as a secure proxy that trusts Firebase for identity but manages its own user/data relationships.

### 1. After Firebase Authentication on Frontend

Once a user logs in via Firebase on the frontend, you need to synchronize the user with the backend:

```javascript
// After successful Firebase login
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const idToken = await userCredential.user.getIdToken();

// Sync with backend
const response = await fetch('http://localhost:5000/api/auth/sync', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  }
});

const userData = await response.json();
```

### 2. Making Authenticated Requests

For all subsequent requests to the backend, include the Firebase ID token in the Authorization header:

```javascript
// Include Firebase ID token in all requests
const response = await fetch('http://localhost:5000/api/boards/some-board-id', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${idToken}`
  }
});
```

## API Endpoints

### Authentication
- `POST /api/auth/sync` - Synchronize user after Firebase login

### Boards
- `GET /api/boards/:id` - Get board details with grouped tasks by status

### Tasks
- `POST /api/todos` - Create a new task
- `PUT /api/todos/:id` - Update a task
- `DELETE /api/todos/:id` - Delete a task
- `PATCH /api/todos/:id/move` - Move task between columns

## Integration Examples

### Creating a Task
```javascript
const createTask = async (boardId, taskData) => {
  const idToken = await getCurrentUser().getIdToken();
  
  const response = await fetch('http://localhost:5000/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      boardId,
      title: taskData.title,
      description: taskData.description,
      status: taskData.status,
      priority: taskData.priority,
      subtasks: taskData.subtasks
    })
  });
  
  return response.json();
};
```

### Moving a Task (Drag & Drop)
```javascript
const moveTask = async (taskId, newStatus, newPosition) => {
  const idToken = await getCurrentUser().getIdToken();
  
  const response = await fetch(`http://localhost:5000/api/todos/${taskId}/move`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      boardId: currentBoardId, // Include the board ID
      status: newStatus,
      position: newPosition
    })
  });
  
  return response.json();
};
```

### Getting Board with Tasks
```javascript
const getBoardWithTasks = async (boardId) => {
  const idToken = await getCurrentUser().getIdToken();
  
  const response = await fetch(`http://localhost:5000/api/boards/${boardId}`, {
    headers: {
      'Authorization': `Bearer ${idToken}`
    }
  });
  
  return response.json();
};
```

## Error Handling

All API responses follow this format:
```javascript
{
  "success": true/false,
  "message": "Description of what happened",
  "data": { /* response data */ } // optional
}
```

Handle errors appropriately:
```javascript
const response = await fetch(url, options);
const result = await response.json();

if (!result.success) {
  console.error('API Error:', result.message);
  // Handle error appropriately
}
```

## Environment Configuration

In your frontend's environment file, add:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Then use it in your API calls:
```javascript
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
const response = await fetch(`${API_BASE}/api/endpoint`);