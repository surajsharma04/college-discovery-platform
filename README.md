# College Discovery Platform

Campus Compass is a full-stack college discovery and decision platform built with a split frontend and backend architecture.

## Overview

- `frontend/`: Next.js 16, React 19, Tailwind CSS 4
- `backend/`: Express, TypeScript, Prisma, PostgreSQL
- Auth: DB-backed `httpOnly` cookie session

Core features:

- college listing, dropdown filters, and pagination
- college detail pages with courses, placements, reviews, and cutoffs
- 2 to 3 college comparison
- exam-rank-based predictor
- Q&A discussion with answers, moderation, cooldowns, and soft delete
- login plus saved colleges and saved comparisons

## Repository Structure

```text
college-discovery-platform/
  frontend/
    src/
      app/
      components/
      lib/
      types/
  backend/
    prisma/
    src/
      lib/
      middleware/
      routes/
```

## Tech Stack

Frontend:

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- local reusable UI primitives

Backend:

- Node.js
- Express 4
- TypeScript
- Prisma
- PostgreSQL
- Zod
- bcryptjs

## Prerequisites

- Node.js 20+
- npm
- PostgreSQL

## Environment Setup

### Backend

Create `backend/.env` from `backend/.env.example`.

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/college_discovery?schema=public"
PORT=4000
CORS_ORIGIN="http://localhost:3000"
NODE_ENV="development"
```

Notes:

- use `NODE_ENV=production` in deployment
- in production the auth cookie is sent with `SameSite=None` and `Secure=true`

### Frontend

Create `frontend/.env.local` from `frontend/.env.example`.

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:4000/api"
```

## Install Dependencies

Backend:

```bash
cd backend
npm install
```

Frontend:

```bash
cd frontend
npm install
```

## Database Setup

Run these from `backend/`:

```bash
npm run db:generate
npm run db:migrate:dev
npm run db:seed
```

The schema includes DB-backed sessions, saved comparisons, placement history, normalized reviews, revision tables, and soft-delete support.

## Run Locally

Backend:

```bash
cd backend
npm run dev
```

Backend URL: `http://localhost:4000`

Frontend:

```bash
cd frontend
npm run dev
```

Frontend URL: `http://localhost:3000`

Useful backend endpoints:

- `GET /api/health`
- `GET /api/ready`
- `GET /api/status`

## Scripts

Backend:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run db:generate`
- `npm run db:migrate:dev`
- `npm run db:migrate:deploy`
- `npm run db:seed`

Frontend:

- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`

## Product Features

### Discover

- dropdown-based college selection
- filter by state, course, fees, rating, and placement
- sorting and pagination

### College Detail

- overview, fees, and basic info
- courses
- placements
- reviews
- cutoffs

### Compare

- select 2 to 3 colleges from a dropdown picker
- compare fees, placement rate, rating, and location
- save comparison

### Predictor

- input exam and rank
- receive cutoff-driven college matches
- includes confidence band and explanation

### Discussion

- list questions
- ask questions
- post answers
- edit and delete own content
- moderation and cooldown controls

### Saved

- save colleges
- save comparisons
- remove saved items

## Architecture

### Frontend Responsibilities

- routing, rendering, layout, and shared UI
- cookie-session-aware auth state
- discover, compare, predictor, discussion, and saved flows
- API consumption and response rendering

Important frontend files:

- `frontend/src/app/layout.tsx`
- `frontend/src/app/page.tsx`
- `frontend/src/components/top-nav.tsx`
- `frontend/src/components/auth-provider.tsx`
- `frontend/src/lib/api-client.ts`

### Backend Responsibilities

- API contract
- auth and session management
- validation and moderation
- persistence and query logic
- readiness and request logging

Important backend files:

- `backend/src/index.ts`
- `backend/src/routes/auth.routes.ts`
- `backend/src/routes/colleges.routes.ts`
- `backend/src/routes/compare.routes.ts`
- `backend/src/routes/predictor.routes.ts`
- `backend/src/routes/questions.routes.ts`
- `backend/src/routes/saved.routes.ts`
- `backend/prisma/schema.prisma`

## Authentication

Auth is cookie-session based.

Current flow:

1. Login or register creates a `UserSession`.
2. The raw token is stored only in the browser cookie.
3. The backend stores only a hash of the token.
4. Protected routes resolve the active session from the cookie.
5. Logout revokes the session and clears the cookie.

Important behavior:

- frontend requests must send credentials
- no token storage in `localStorage`
- protected routes do not rely on bearer tokens

## API Summary

Base local API URL:

```text
http://localhost:4000/api
```

### Conventions

- protected routes require the session cookie
- most non-500 errors include `requestId`
- 500 responses include both `requestId` and `errorId`
- rate-limited responses can include `Retry-After` and `x-ratelimit-*` headers

### Main Endpoints

Health and status:

- `GET /health`
- `GET /ready`
- `GET /status`

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/logout`

Colleges:

- `GET /colleges`
- `GET /colleges/:id`

Compare:

- `GET /compare/options`
- `POST /compare`

Predictor:

- `POST /predictor`

Discussion:

- `GET /questions`
- `POST /questions`
- `PATCH /questions/:id`
- `DELETE /questions/:id`
- `POST /questions/:id/answers`
- `PATCH /questions/answers/:answerId`
- `DELETE /questions/answers/:answerId`

Saved:

- `GET /saved/colleges`
- `POST /saved/colleges`
- `DELETE /saved/colleges/:collegeId`
- `GET /saved/comparisons`
- `POST /saved/comparisons`
- `DELETE /saved/comparisons/:id`

## Seed Data

The seed data is intended to provide:

- realistic search and filter coverage
- multiple states and college types
- exam cutoff variety for predictor logic
- enough placements and reviews to make detail pages useful

Current built-in catalog notes:

- the app includes a built-in fallback catalog with 140 colleges across 28 Indian states
- the built-in catalog covers IITs, NITs, IIITs, state colleges, and private colleges
- if PostgreSQL is unavailable, read-only college browsing falls back to the local catalog so the main product pages still render
- for deployment, seed the database so auth, saved items, and discussion features work against persistent college records

## Verification

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run lint
npx tsc --noEmit
```

## Known Constraints

- rate limiting is currently in-memory and best suited for local development or a single backend instance
- there is no route-level automated test suite yet
- frontend build and deployment behavior should be validated in the target environment after env configuration

## Deployment Notes

Recommended split:

- frontend: Vercel
- backend: Render or another Node host
- database: PostgreSQL

Production checklist:

1. Set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend API URL.
2. Set backend `CORS_ORIGIN` to the deployed frontend URL.
3. Set `NODE_ENV=production`.
4. Use secure production database credentials.
5. Run `npm run db:migrate:deploy` during deployment.
6. Run `npm run db:seed` after migrations so compare, predictor, saved items, and detail pages use DB-backed college records.
7. Ensure cookies are sent over HTTPS.
