# Chat API

Nest.js backend for the chat application.

## Local Development

```bash
npm install
cp .env.example .env
npm run start:dev
```

The default `MONGODB_URI` from `.env.example` expects MongoDB from the root `docker-compose.yml` to be available on `localhost:27017`.

## Docker Compose

From the repository root:

```bash
docker compose up -d
```

The API is available at `http://localhost:5000`, and the health endpoint is `http://localhost:5000/health`.
