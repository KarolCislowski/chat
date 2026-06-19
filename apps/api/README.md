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

## Authentication

User accounts and user profiles are stored separately:

- `UserAccount`: email, password hash, refresh token hashes, role, creation date
- `UserProfile`: account id, display name, avatar URL, status message, online status

Available endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /users/me`
- `PATCH /users/me/profile`

Protected endpoints require an `Authorization: Bearer <accessToken>` header.
