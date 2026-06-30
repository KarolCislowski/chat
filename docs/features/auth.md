# Authentication

Authentication is implemented in `apps/api/src/auth` and consumed by `apps/web/stores/auth-store.ts`.

## Capabilities

- Register account and profile.
- Login with email and password.
- Refresh access tokens.
- Logout and revoke refresh tokens.
- Protect HTTP routes with `JwtAuthGuard`.
- Authenticate chat sockets with JWT access tokens.

## Token Model

- Access token: short-lived JWT used for HTTP and websocket auth.
- Refresh token: longer-lived token stored by the web client and rotated by the API.

## Web Flow

1. User submits login or registration form.
2. `auth-store` calls the API.
3. Store keeps account, profile, access token, and refresh token.
4. `AppShell` starts the persistent realtime chat connection when authenticated.

## Security Notes

- Passwords are hashed with bcrypt.
- Login form submission uses `preventDefault` so credentials do not leak into URL query params.
- Protected API routes require bearer auth.
