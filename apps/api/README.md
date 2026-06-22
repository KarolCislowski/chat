# Dworven Shaft API

NestJS backend for the Dworven Shaft social hub.

## Features

- JWT registration, login, refresh-token rotation, and logout
- User accounts and public profiles stored separately
- Realtime Socket.IO chat namespace at `/chat`
- Global, guild, whisper, and aggregate open-chat history
- Realtime user presence with multi-socket tracking
- Guild creation, membership limit, role management, join requests, and invite codes
- Guild appearance persistence for theme color, emblem, and hero background
- MongoDB message retention limits and 30-day expiry

## Tech

- NestJS 11
- Mongoose and MongoDB
- Socket.IO
- `@nestjs/jwt`
- bcrypt
- class-validator / class-transformer
- TypeScript

## Local Development

```bash
npm install
cp .env.example .env
npm run start:dev
```

The API runs at `http://localhost:5000`.

The default `MONGODB_URI` from `.env.example` expects MongoDB to be available on `localhost:27017`. From the repository root you can start MongoDB with:

```bash
docker compose up -d mongodb mongo-express
```

## Environment

```env
PORT=5000
WEB_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://chat_api:chat_api_password@localhost:27017/chat
JWT_SECRET=dev-only-change-me
JWT_ACCESS_TOKEN_TTL=15m
JWT_REFRESH_TOKEN_TTL=7d
BCRYPT_ROUNDS=12
```

Use a strong `JWT_SECRET` outside local development.

## Scripts

```bash
npm run start:dev  # Start API with nodemon and ts-node
npm run typecheck  # Run TypeScript without emitting files
npm run build      # Compile to dist/
npm run start      # Run compiled dist/main.js
```

## HTTP API

Public:

- `GET /`
- `GET /health`
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

Authenticated endpoints require:

```http
Authorization: Bearer <accessToken>
```

Auth and users:

- `POST /auth/logout`
- `GET /users/me`
- `PATCH /users/me/profile`
- `GET /users`
- `GET /users/:accountId`

Messages:

- `GET /messages/open`
- `GET /messages/global`
- `GET /messages/guild/:guildId`
- `GET /messages/whisper/:recipientId`

Guilds:

- `GET /guilds/mine`
- `GET /guilds/available`
- `GET /guilds/:guildId`
- `POST /guilds`
- `PATCH /guilds/:guildId/appearance`
- `POST /guilds/join`
- `POST /guilds/:guildId/invites`
- `POST /guilds/:guildId/members`
- `PATCH /guilds/:guildId/members/:userId/role`
- `DELETE /guilds/:guildId/members/:userId`
- `GET /guilds/:guildId/join-requests`
- `POST /guilds/:guildId/join-requests`
- `POST /guilds/:guildId/join-requests/:requestId/accept`

## Websocket API

Namespace:

```text
/chat
```

Authentication:

- Preferred: Socket.IO `auth.token`
- Fallback: `Authorization: Bearer <accessToken>` header

Client event:

- `message:create`

Payload:

```ts
{
  channelType?: "global" | "guild" | "whisper";
  guildId?: string;
  recipientId?: string;
  content: string;
}
```

Server events:

- `message:created`
- `presence:changed`
- `chat:error`

## Data Model

Authentication:

- `UserAccount`: email, password hash, refresh token hashes, role, timestamps
- `UserProfile`: account id, display name, avatar URL, status message, online status, UI language

Chat:

- `Message`: sender, channel type, optional guild/recipient/conversation IDs, content, created/edited/deleted timestamps

Guilds:

- `Guild`: name, slug, owner, members, invite codes, theme color, emblem, background, creation date
- `GuildMembership`: user, guild, role, join date
- `GuildJoinRequest`: user, guild, status, decision metadata

## Message Retention

The API keeps chat lightweight:

- Global: 200 messages
- Each guild channel: 200 messages
- Each whisper conversation: 100 messages
- Open chat feed: latest 200 visible messages
- Message max age: 30 days

MongoDB also has a TTL index on `Message.createdAt`.

## Docker Compose

From the repository root:

```bash
docker compose up -d
```

The API is available at `http://localhost:5000`, and mongo-express is available at `http://localhost:8081`.
