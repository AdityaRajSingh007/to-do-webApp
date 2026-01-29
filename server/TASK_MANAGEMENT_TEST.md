# Task Management Functionality Testing

This document outlines how to test the task management functionality of the Cyberpunk To-Do backend.

## API Endpoints Overview

### Board Endpoints
- `GET /api/boards/:id` - Retrieve a board with all tasks grouped by status

### Task Endpoints
- `POST /api/todos` - Create a new task
- `PUT /api/todos/:id` - Update an existing task
- `DELETE /api/todos/:id` - Delete a task
- `PATCH /api/todos/:id/move` - Move task between columns with fractional indexing

## Testing Process

### 1. Prerequisites
- A valid Firebase ID token
- A user synchronized with the backend (via `/api/auth/sync`)
- A board created in the system

### 2. Create a Task

```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": "BOARD_ID_HERE",
    "title": "Implement authentication system",
    "description": "Create login and signup functionality",
    "status": "PENDING",
    "priority": "CRIT",
    "subtasks": [
      {
        "title": "Create login form",
        "isCompleted": false
      },
      {
        "title": "Create signup form",
        "isCompleted": false
      }
    ]
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Task created successfully",
  "task": {
    "_id": "...",
    "boardId": "BOARD_ID_HERE",
    "title": "Implement authentication system",
    "description": "Create login and signup functionality",
    "status": "PENDING",
    "priority": "CRIT",
    "position": 1000,
    "subtasks": [...],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### 3. Move a Task (Drag & Drop Simulation)

```bash
curl -X PATCH http://localhost:5000/api/todos/TASK_ID_HERE/move \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": "BOARD_ID_HERE",
    "status": "IN_PROGRESS",
    "position": 1500.5
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Task moved successfully",
  "task": {
    "_id": "TASK_ID_HERE",
    "status": "IN_PROGRESS",
    "position": 1500.5,
    ...
  }
}
```

### 4. Update a Task

```bash
curl -X PUT http://localhost:5000/api/todos/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Implement improved authentication system",
    "priority": "CRIT",
    "subtasks": [
      {
        "title": "Create login form",
        "isCompleted": true
      },
      {
        "title": "Create signup form",
        "isCompleted": false
      },
      {
        "title": "Add forgot password",
        "isCompleted": false
      }
    ]
  }'
```

### 5. Get Board with Tasks

```bash
curl -X GET http://localhost:5000/api/boards/BOARD_ID_HERE \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "board": {
    "_id": "BOARD_ID_HERE",
    "userId": "...",
    "title": "Project Alpha",
    "columns": ["PENDING", "IN_PROGRESS", "DONE"],
    ...
  },
  "tasks": {
    "PENDING": [
      {
        "_id": "...",
        "title": "Task 1",
        "position": 1000,
        ...
      }
    ],
    "IN_PROGRESS": [
      {
        "_id": "...",
        "title": "Task 2",
        "position": 1500.5,
        ...
      }
    ],
    "DONE": []
  }
}
```

### 6. Delete a Task

```bash
curl -X DELETE http://localhost:5000/api/todos/TASK_ID_HERE \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"
```

Expected response:
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

## Fractional Indexing Explained

The system uses fractional indexing for smooth drag-and-drop functionality:

- Each task has a `position` property (number)
- When moving a task, calculate a new position between adjacent tasks
- For example, if moving between tasks at positions 1000 and 2000, use 1500
- This allows for precise ordering without constantly shifting other tasks

## Error Cases to Test

### Unauthorized Access
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{...}'
```

Expected response:
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Invalid Board ID
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "boardId": "INVALID_BOARD_ID",
    ...
  }'
```

Expected response:
```json
{
  "success": false,
  "message": "Board not found"
}
```

### Non-existent Task
```bash
curl -X PUT http://localhost:5000/api/todos/NONEXISTENT_TASK_ID \
  -H "Authorization: Bearer VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

Expected response:
```json
{
  "success": false,
  "message": "Task not found"
}
```

## Integration with Frontend

The frontend should handle these flows:

```javascript
// Create task
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
      ...taskData
    })
  });
  
  return response.json();
};

// Move task (for drag and drop)
const moveTask = async (taskId, boardId, newStatus, newPosition) => {
  const idToken = await getCurrentUser().getIdToken();
  
  const response = await fetch(`http://localhost:5000/api/todos/${taskId}/move`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({
      boardId,
      status: newStatus,
      position: newPosition
    })
  });
  
  return response.json();
};

// Get board with tasks
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

## Data Validation

The API validates data on each request:

- `title` is required for tasks
- `boardId` must be a valid board belonging to the user
- `status` must be one of: "PENDING", "IN_PROGRESS", "DONE"
- `priority` must be one of: "LOW", "MED", "CRIT"
- `position` must be a number