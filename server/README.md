# Cyberpunk To-Do Backend

A secure Node.js/Express backend for the Cyberpunk To-Do application with Firebase authentication and MongoDB data storage.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (using Mongoose)
- **Auth**: Firebase Admin SDK (JWT Verification)
- **Environment**: Dotenv

## Architecture

The backend serves as a secure proxy that trusts Firebase for Identity but manages its own User/Data relationships in MongoDB.

### Key Components

1. **Auth Middleware** (`src/middleware/authMiddleware.js`)
   - Intercepts all requests
   - Extracts `Authorization: Bearer <token>`
   - Uses `admin.auth().verifyIdToken(token)` to validate
   - Attaches the decoded user (specifically `uid`) to `req.user`

2. **Database Schemas** (Mongoose)
   - **User**: `firebaseUid` (Indexed, Unique), `email`, `createdAt`
   - **Board**: `userId` (Indexed), `title`, `columns` (Array of Strings)
   - **Task**: `boardId` (Ref to Board), `title`, `description`, `status`, `priority`, `position`, `subtasks`

## API Endpoints

### Authentication
- `POST /api/auth/sync` - Idempotent auth sync endpoint (called after frontend login)

### Boards
- `GET /api/boards/:id` - Get board details with grouped tasks by status

### Tasks
- `POST /api/todos` - Create a new task
- `PUT /api/todos/:id` - Update a task
- `DELETE /api/todos/:id` - Delete a task
- `PATCH /api/todos/:id/move` - Move task between columns with fractional indexing

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/cyberpunk-todo

# Firebase
FIREBASE_SERVICE_ACCOUNT=./serviceAccountKey.json

# Server
PORT=5000
NODE_ENV=development

# Client URL
CLIENT_URL=http://localhost:3000
```

## Firebase Setup

1. Go to Firebase Console > Project Settings > Service Accounts
2. Generate a new private key
3. Copy the `private_key` and `client_email` values
4. Add them to your `.env` file as `FIREBASE_PRIVATE_KEY` and `FIREBASE_CLIENT_EMAIL`

## Installation

```bash
npm install
```

## Usage

```bash
# Development
npm run dev

# Production
npm start
```

## Fractional Indexing

Tasks use fractional indexing for drag-and-drop functionality:
- Each task has a `position` number
- When moving tasks, new positions are calculated to maintain order
- This allows for smooth insertion between existing items