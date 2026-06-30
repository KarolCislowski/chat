# Backend Architecture

The API is a NestJS 11 application with MongoDB through Mongoose.

## Modules

- `AuthModule`: registration, login, refresh-token rotation, logout, JWT guard.
- `UsersModule`: account profile loading, profile updates, user discovery.
- `MessagesModule`: HTTP message history and Socket.IO realtime gateway.
- `GuildsModule`: guild creation, memberships, roles, join requests, invites, appearance.

## HTTP API

The API exposes REST endpoints documented in Swagger:

```text
http://localhost:5000/docs
```

Authenticated endpoints use:

```http
Authorization: Bearer <accessToken>
```

## Validation

`main.ts` enables a global `ValidationPipe` with:

- `transform: true`
- `whitelist: true`

DTOs use `class-validator` and Swagger decorators.

## Persistence

MongoDB collections are represented by Mongoose schemas under each feature folder. The most important aggregates are:

- `UserAccount`
- `UserProfile`
- `Message`
- `Guild`
- `GuildMembership`
- `GuildJoinRequest`

## Realtime Boundary

The Socket.IO gateway is `apps/api/src/messages/messages.gateway.ts`. It authenticates sockets with JWT access tokens, joins user and guild rooms, and broadcasts realtime chat events.
