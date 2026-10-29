# TrackPath: Job Tracker 2.0

A calm workspace to track job applications, interviews and offers. You get one place to see where every application stands, from applied to offer.

> 🚧 Work in progress.

## Features

- **Accounts.** Sign up and sign in, with securely hashed passwords.
- **Persistent sessions.** You stay signed in across page refreshes, using an HttpOnly cookie.
- **Job applications.** Each signed-in user sees only their own applications.
- **Pages.** Home dashboard, Add Job, Pipeline, Analytics and Resume Library.
- **Light and dark theme.** Your choice is remembered.

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, TypeScript, Vite, React Router |
| Backend  | Rust, axum, Tokio |
| Database | MongoDB |
| Auth     | JWT in an HttpOnly cookie, bcrypt password hashing |
| Tooling  | pnpm workspaces, Prettier, ESLint, rustfmt |

## Project structure

```
apps/
  frontend/          React + TypeScript + Vite
    src/
      context/       Global user state (UserProvider)
      hooks/         useUser hook
      pages/         App pages
      components/    Shared UI components
  backend/           Rust (axum + MongoDB)
    src/
      routes/        URL → handler mapping
      middleware/    Auth middleware (verifies the session cookie)
      handlers/      HTTP layer: request in, response out
      services/      Business logic
      repositories/  Database access
      dto/           Request/response shapes
      security/      Password hashing, JWT, cookies
packages/
  shared/            Types shared across the apps
```

## How authentication works

1. **Sign in.** The backend checks the password and creates a short-lived JWT. It sends the token back in an **HttpOnly** cookie, so JavaScript can't read it.
2. **Every request.** The browser attaches the cookie automatically (`credentials: "include"`).
3. **Protected routes.** The auth middleware verifies the token and passes the user's ID to the handler. Missing or invalid tokens get `401`.
4. **Page load.** The frontend calls `GET /auth/me` to restore the signed-in user into its context.

## API overview

| Method | Path                 | Auth | Description |
|--------|----------------------|------|-------------|
| POST   | `/auth/signup`       | No   | Create an account |
| POST   | `/auth/signin`       | No   | Sign in and set the session cookie |
| GET    | `/auth/me`           | Yes  | Get the signed-in user |
| GET    | `/job-applications`  | Yes  | List the signed-in user's job applications |

## Getting started

### Prerequisites

- Node.js and [pnpm](https://pnpm.io/)
- [Rust](https://www.rust-lang.org/tools/install) (stable)
- A MongoDB database (local or MongoDB Atlas)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

Create a `.env` file in the repository root. It needs:

- a MongoDB connection string
- a long, random secret used to sign JWTs

Ask a maintainer for the exact variable names. `.env` is gitignored and must never be committed.

### 3. Run the backend

```bash
cd apps/backend
cargo run
```

The API runs on `http://localhost:3000`.

### 4. Run the frontend

```bash
pnpm dev
```

The app runs on `http://localhost:5173`.

## Scripts

| Command      | What it does |
|--------------|--------------|
| `pnpm dev`   | Start the frontend dev server |
| `pnpm build` | Type-check and build the frontend |
| `pnpm lint`  | Lint all packages |
| `cargo run`  | Start the backend (from `apps/backend`) |
| `cargo fmt`  | Format the backend code |

## Roadmap

- Create, update and delete job applications
- Sign out
- Resume uploads
- Analytics charts
