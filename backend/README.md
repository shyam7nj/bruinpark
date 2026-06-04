# BruinPark — Backend

The BruinPark API: a Node.js + Express server that handles authentication, parking posts,
message requests, and permit verification. It persists data in MongoDB via Mongoose and
stores uploaded permit screenshots on the local file system.

> For full project setup (Google OAuth credentials, MongoDB, environment variables, and the
> architecture diagrams), see the [root README](../README.md). This file documents the
> backend in isolation.

## Tech Stack

- **Node.js + Express 5** — REST API (runs on port `3001`)
- **MongoDB + Mongoose** — data layer
- **Passport.js + passport-google-oauth20** — Google OAuth 2.0 login
- **express-session + connect-mongo** — sessions stored in MongoDB
- **Multer** — multipart file uploads for permit screenshots

## Prerequisites

- Node.js v18 or higher and npm
- A MongoDB instance (local `mongodb://localhost:27017` or a MongoDB Atlas cluster)
- Google OAuth 2.0 credentials (see the [root README](../README.md))

## Environment Variables

Create a `.env` file in this folder:

```env
GOOGLE_CLIENT_ID=<client ID>
GOOGLE_CLIENT_SECRET=<client secret>
MONGO_URI=<mongo connection string>
SESSION_SECRET=<any long random string>
CLIENT_URI=http://localhost:5173
```

## Running Locally

```bash
cd backend
npm install
npm run dev
```

The server starts on `http://localhost:3001` and connects to MongoDB on startup.
`npm start` and `npm run dev` both run `node index.js`.

## Project Structure

```
backend/
    config/
        passport.js       Google OAuth strategy + session serialization
    middleware/
        requireAuth.js    Rejects unauthenticated requests (401)
        requireAdmin.js   Rejects non-admin users (403)
    models/
        User.js           Account + verification status
        Post.js           Parking post + weekly schedule
        MessageRequest.js Message request between two users about a post
    routes/
        auth.js           Google login, /me, logout
        posts.js          CRUD for parking posts
        messages.js       Send / list / accept / reject message requests
        verify.js         Permit upload + admin review
    uploads/              Stored permit screenshots (gitignored)
    index.js              App entry: middleware, sessions, route mounting
```

## API Overview

All `/api/*` routes require an authenticated session; verification review routes
additionally require an admin account.

| Method & Path                     | Auth   | Description                              |
| --------------------------------- | ------ | --------------------------------------- |
| `GET /auth/google`                | —      | Start Google OAuth login                |
| `GET /auth/google/callback`       | —      | OAuth callback (redirects to client)    |
| `GET /auth/me`                    | —      | Current user, or 401 if not logged in   |
| `POST /auth/logout`               | —      | End the session                         |
| `GET /api/posts`                  | User   | List posts (optional structure filter)  |
| `GET /api/posts/mine`             | User   | List the current user's posts           |
| `POST /api/posts`                 | User   | Create a post                           |
| `PATCH /api/posts/:id`            | User   | Update an owned post                    |
| `DELETE /api/posts/:id`           | User   | Delete an owned post                    |
| `POST /api/messages`              | User   | Send a message request                  |
| `GET /api/messages/incoming`      | User   | Requests received                       |
| `GET /api/messages/outgoing`      | User   | Requests sent                           |
| `PATCH /api/messages/:id/accept`  | User   | Accept a received request               |
| `PATCH /api/messages/:id/reject`  | User   | Reject a received request               |
| `POST /api/verify/submit`         | User   | Upload a permit screenshot              |
| `GET /api/verify/pending`         | Admin  | List users awaiting review              |
| `GET /api/verify/file/:filename`  | Admin  | View an uploaded screenshot             |
| `PATCH /api/verify/:userId/approve` | Admin | Approve a user's verification          |
| `PATCH /api/verify/:userId/reject`  | Admin | Reject a user's verification           |

## Authentication & Sessions

Login is delegated to Google OAuth 2.0. The Passport strategy in `config/passport.js`
rejects any email that is not `@ucla.edu` or `@g.ucla.edu`, creates the user record on first
login, and stores the user id in a session cookie. Sessions are persisted in MongoDB via
`connect-mongo`, so they survive server restarts.
