# Frontend Architecture

The web app is a Next.js 15 application using React 19, MUI, Zustand, and Socket.IO client.

## Route Files

Files in `apps/web/app/` should stay thin. They should read route params when needed and render feature components. UI implementation belongs under `apps/web/components/`.

Example:

```text
apps/web/app/guilds/[guildId]/page.tsx
apps/web/components/guild/application/guild-details-page.tsx
```

## Feature Folder Shape

Feature components follow this structure:

```text
components/[feature]/
  application/     Hooks and page-level orchestration
  domain/          Pure helpers and presentation rules
  infrastructure/  External adapters when needed
  ui/              Presentational components
```

Shared portal primitives live in:

```text
components/shared/
  domain/portal-theme.ts
  ui/
```

## State

Zustand stores live in `apps/web/stores/`:

- `auth-store.ts`: account, profile, tokens, auth actions.
- `chat-store.ts`: active channel, messages, socket lifecycle output, unread counters, system notices, typing indicators.
- `guild-store.ts`: guild lists, join requests, appearance state.
- `language-store.ts`: current UI language and translations.
- `user-store.ts`: visible users and presence state.

The Socket.IO client object is intentionally kept outside Zustand state in `chat-store.ts`. Zustand stores observable UI state; the socket is an infrastructure handle with mutable lifecycle and listeners.

## Styling

The portal uses MUI with local `sx` styling. Reusable portal styles should be promoted into shared UI primitives when they repeat:

- `PortalPanel`
- `PortalTextField`
- `SectionHeader`
- `portal-theme.ts`

Avoid turning every one-off visual into a shared abstraction. Promote only repeated patterns.
