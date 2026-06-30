# Setup

## Requirements

- Node.js compatible with the app dependencies.
- npm.
- Docker, if running MongoDB locally through Docker Compose.

## Start Infrastructure

From the repository root:

```bash
docker compose up -d mongodb mongo-express
```

## Start API

```bash
cd apps/api
npm install
cp .env.example .env
npm run start:dev
```

API:

- `http://localhost:5000`
- Swagger: `http://localhost:5000/docs`
- Health: `http://localhost:5000/health`

## Start Web

```bash
cd apps/web
npm install
cp .env.example .env
npm run dev
```

Web:

- `http://localhost:3000`

## Full Docker Compose

From the repository root:

```bash
docker compose up -d
```
