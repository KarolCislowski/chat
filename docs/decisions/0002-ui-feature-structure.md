# 0002: UI Feature Structure

## Status

Accepted.

## Context

Next.js route files were accumulating UI. This made pages harder to scan and increased coupling between routing and presentation.

## Decision

Keep `apps/web/app/` route files thin. Move UI and feature logic into `components/[feature]` with:

- `application`
- `domain`
- `infrastructure`
- `ui`

Shared portal UI primitives live under `components/shared`.

## Consequences

- Route files should mostly pass params into feature components.
- Feature code is easier to test, refactor, and reuse.
- Shared UI should be promoted only when repetition is clear.
