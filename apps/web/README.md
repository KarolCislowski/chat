# Dworven Shaft Web

Next.js client for the Dworven Shaft social hub.

## Features

- Realtime social chat over Socket.IO
- Channel views for open chat, global chat, guild chat, and whisper conversations
- Unread indicators for inactive rooms and the main Social navigation item
- Persistent websocket connection across portal pages
- User profiles with bundled avatar selection
- Guild creation, join requests, member management, and appearance customization
- Portal shell with shared header, language selector, account menu, and localized 404 page
- English, Polish, and Swedish UI dictionaries
- Dark MUI theme with custom dialogs, menus, alerts, scrollbars, and chat accents

## Tech

- Next.js 15 app router
- React 19
- MUI
- Zustand
- Socket.IO client
- TypeScript

## Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

The web app runs at `http://localhost:3000`.

The default `.env.example` points at the API on `http://localhost:5000`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Scripts

```bash
npm run dev        # Start Next.js on port 3000
npm run typecheck  # Run TypeScript without emitting files
npm run build      # Build the production app
npm run start      # Serve the production build on port 3000
```

## Structure

Feature UI lives outside `app/`. Route files should stay thin and delegate to feature components.

```text
app/
  auth/
  guilds/
  profile/
  page.tsx
components/
  auth/
  chat/
  guild/
  profile/
  shared/
stores/
  auth-store.ts
  chat-store.ts
  guild-store.ts
  language-store.ts
  user-store.ts
i18n/
lib/
public/assets/
```

Feature folders follow the same layering convention where useful:

```text
components/[feature]/
  application/     page-level orchestration and hooks
  domain/          pure state/appearance helpers
  infrastructure/  integration-specific helpers when needed
  ui/              reusable visual components
```

## Accessibility Notes

The current UI includes named icon controls, labeled form fields, readable picker labels, selected-state semantics for visual pickers, and a chat timeline exposed as a polite log region. When adding controls, avoid nested interactive elements and prefer explicit accessible names over visual-only symbols.

## Docker Compose

From the repository root:

```bash
docker compose up -d
```

The web app is available at `http://localhost:3000`.
