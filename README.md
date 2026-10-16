# Callistbot (Calist)

AI-assisted meeting preparation and workspace dashboard for professionals who want briefs, calendar context, and an in-app assistant in one place.

## Overview

Calist is a full-stack TypeScript application: a React single-page UI served by an Express API with a JSON file store. Users authenticate with email/password or demo OAuth flows, manage profiles, schedule meetings, sync calendar integrations (simulated), and optionally enhance briefs and chat answers with Google Gemini when `GEMINI_API_KEY` is set.

The repository also includes markdown articles under the repo root documenting product and engineering notes related to the meeting agent.

## Features

- Email registration and login with salted PBKDF2 password hashing
- Demo OAuth sign-in (Google / Microsoft) for quick workspace access
- User profile editing (bio, timezone, meeting preferences, profile photo)
- Dashboard with today / upcoming / recent meeting filters and search
- Meeting scheduler with participants, reminders, and auto-generated prep briefs
- Meeting details, notes, and cancellation
- In-app notifications for schedule and calendar events
- Google Calendar and Microsoft Outlook integration toggles with manual sync
- AI assistant tab (Gemini-backed when configured; local fallbacks otherwise)
- Contact habits view with mock attendee intelligence data
- Full-project ZIP export from the header menu

## Tech stack

| Layer | Technologies |
|-------|----------------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, Lucide icons, Motion |
| Backend | Express 4, Node.js (ES modules via `tsx`) |
| AI | `@google/genai` (Gemini) |
| Persistence | Local JSON file (`data/calist_store.json`) |
| Language | TypeScript 7 |

## Prerequisites

- **Node.js** 20 or newer (LTS recommended)
- **npm** 9+ (bundled with Node)
- Optional: **Gemini API key** for AI briefs and chat

## Getting started

```bash
git clone https://github.com/vonmiller1/callistbot.git
cd callistbot
npm install
cp .env.example .env
```

Edit `.env` and set variable **names** only in your local copy (never commit secrets):

| Variable | Purpose |
|----------|---------|
| `GEMINI_API_KEY` | Enables Gemini models for `/api/chat` and meeting brief enhancement |
| `APP_URL` | Public base URL when deployed (OAuth / self-links) |
| `PORT` | HTTP port (default `3000`) |
| `NODE_ENV` | Set to `production` for static `dist` serving |

## Running locally

Development (Vite middleware + API on one port):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Production-style run after building the client:

```bash
npm run build
NODE_ENV=production npm start
```

Other scripts:

| Script | Description |
|--------|-------------|
| `npm run build` | Vite production build to `dist/` |
| `npm run preview` | Preview production build (Vite only) |
| `npm run lint` | TypeScript check (`tsc --noEmit`) |
| `npm run clean` | Remove `dist/` and `server.js` |

### Demo account

Seeded data includes **alex.rivera@calist.ai** with password **Password123!** (development/demo only).

## Testing

Type checking (not executed in CI for this repo by default):

```bash
npm run lint
```

There is no separate automated test suite in this repository.

## Project structure

```
├── server.ts              # Express API, auth, meetings, Vite dev middleware
├── App.tsx                # Root React application
├── main.tsx               # Client entry
├── api.ts                 # Browser API client (localStorage session token)
├── db.ts                  # JSON database and session store
├── types.ts               # Shared TypeScript interfaces
├── *Modal.tsx, Dashboard.tsx, …  # UI components (repo root)
├── mockWorkspace.ts       # Sample contacts and fixtures
├── simpleRepoFiles.ts     # Client-side ZIP fallback manifest
├── zipExporter.ts         # ZIP download helper
├── article*.md            # Engineering / product write-ups
├── index.html             # HTML shell
├── vite.config.ts         # Vite + Tailwind
├── package.json
└── data/                  # Created at runtime (gitignored if present)
```

## Configuration

- Secrets and ports: see `.env.example`
- Meeting and user data persist under `data/calist_store.json` relative to the process working directory
- JSON request body limit is 15 MB (profile picture uploads)

## Deployment

1. Set `NODE_ENV=production`, `PORT`, and optionally `GEMINI_API_KEY` on the host.
2. Run `npm install`, `npm run build`, then `npm start`.
3. Serve HTTPS in front of the Node process; store secrets in the platform's secret manager, not in the repo.

No Dockerfile or GitHub Actions workflow is included in this repository.

## Contributing

1. Fork the repository and create a feature branch from `main`.
2. Keep commits focused; use imperative messages (e.g. `fix(auth): …`, `docs(readme): …`).
3. Open a pull request with a short description of behavior and any API changes.

## License

Source files include SPDX `Apache-2.0` headers where noted. If a root `LICENSE` file is added later, it governs; otherwise refer to the SPDX identifiers in individual files.
