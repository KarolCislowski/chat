# 0001: Websocket Chat

## Status

Accepted.

## Context

The chat experience needs realtime delivery for messages, presence, and typing indicators. Polling would add latency and unnecessary API traffic.

## Decision

Use Socket.IO through the NestJS websocket gateway under the `/chat` namespace.

## Consequences

- The web app keeps one persistent socket connection while authenticated.
- HTTP endpoints remain responsible for loading persisted history.
- Socket events remain responsible for transient realtime updates.
- Socket auth must be refreshed through the normal auth flow when access tokens expire.
