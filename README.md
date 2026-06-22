# Dworven Shaft

Dworven Shaft is a realtime fantasy social hub built as two separate apps:

- `apps/web` - Next.js web client with the portal UI, chat, profiles, guild management, localization, and accessibility-focused controls.
- `apps/api` - NestJS API with MongoDB persistence, JWT authentication, Socket.IO chat, guild membership, and user presence.

The project currently supports global chat, guild chat, private whisper conversations, an aggregate open-chat feed, user profiles with bundled avatars, guild appearance customization, join requests, and realtime online/offline updates.

## Stack

- Frontend: Next.js 15, React 19, MUI, Zustand, Socket.IO client
- Backend: NestJS 11, Mongoose, MongoDB, Socket.IO, JWT, bcrypt
- Infrastructure: Docker Compose with MongoDB and mongo-express

## Repository Layout

```text
apps/
  api/   NestJS backend
  web/   Next.js frontend
docker/
  mongo/ MongoDB init scripts
```

The repository root does not define a shared npm workspace script. Run package commands from `apps/web` or `apps/api`.

## Quick Start With Docker

From the repository root:

```bash
docker compose up -d
```

Services:

- Web app: `http://localhost:3000`
- API: `http://localhost:5000`
- API health: `http://localhost:5000/health`
- mongo-express: `http://localhost:8081`

## Local Development

Start MongoDB with Docker, then run each app locally:

```bash
docker compose up -d mongodb mongo-express
```

API:

```bash
cd apps/api
npm install
cp .env.example .env
npm run start:dev
```

Web:

```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```

## Verification

Run these from the relevant app directory:

```bash
npm run typecheck
npm run build
```

## Documentation

- [Web README](apps/web/README.md)
- [API README](apps/api/README.md)
