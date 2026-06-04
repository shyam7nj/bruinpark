# BruinPark — Frontend

The BruinPark client: a React single-page app built with Vite. It renders the UI,
authenticates users via the backend's Google OAuth flow, and talks to the Express REST API
over `fetch` with session cookies.

> For full project setup (Google OAuth credentials, MongoDB, environment variables, and the
> architecture diagrams), see the [root README](../README.md). This file documents the
> frontend in isolation.

## Tech Stack

- **React 19** with **Vite** (dev server + build tooling)
- **Plain CSS** modules per page (`src/styles/`)
- **ESLint** for linting
- Lightweight path-based routing (no router library) — `src/App.jsx` renders a page based on
  `window.location.pathname`

## Prerequisites

- Node.js v18 or higher and npm
- The backend API running on `http://localhost:3001` (see the [root README](../README.md))

## Running Locally

```bash
cd frontend
npm install
npm run dev
```

The app starts on `http://localhost:5173`. Sign in with a UCLA Google account.

### Available Scripts

| Script            | Description                                  |
| ----------------- | -------------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR           |
| `npm run build`   | Produce a production build in `dist/`        |
| `npm run preview` | Serve the production build locally           |
| `npm run lint`    | Run ESLint across the project                |

## Backend Connection

The API base URL is defined in [`src/api/client.js`](src/api/client.js) as
`http://localhost:3001`. All requests are sent with `credentials: 'include'` so the
session cookie is passed to the backend. If you change the backend port, update it there.

## Project Structure

```
frontend/src/
    api/          API helpers, one file per resource (auth, posts, messages, verify)
    components/   Reusable UI primitives (Button, Card, Badge, Navbar, AppLayout, ...)
    hooks/        Custom hooks (useCurrentUser)
    pages/        Top-level views routed by App.jsx
    styles/       Global and per-page CSS
    utils/        Shared helpers (label formatting)
    App.jsx       Path-based routing entry point
    main.jsx      React root render
```

### Pages

| Path             | Component       | Purpose                                            |
| ---------------- | --------------- | -------------------------------------------------- |
| `/`              | `Home`          | Landing page and UCLA Google sign-in               |
| `/dashboard`     | `Dashboard`     | User's posts, message requests, verification status|
| `/create-post`   | `CreatePost`    | Create or edit a parking post                      |
| `/browse-posts`  | `BrowsePosts`   | Browse and filter posts, send message requests     |
| `/verify`        | `Verify`        | Upload a permit screenshot for verification        |
| `/admin/verify`  | `AdminVerify`   | Admin-only queue to approve/reject verifications   |
| `/login-failed`  | `LoginFailed`   | Shown when a non-UCLA account is rejected          |
