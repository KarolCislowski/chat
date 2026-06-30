# Troubleshooting

## `.next` Wants to Enter Git

If Next.js build artifacts appear in Git status, check whether the files were already tracked. `.gitignore` only prevents new untracked files from being added automatically.

## Missing `.next-build/types`

If `apps/web` typecheck complains about missing generated Next type files, run:

```bash
cd apps/web
npm run build
npm run typecheck
```

## Socket Unauthorized

Check:

- web has a valid access token,
- API `JWT_SECRET` matches the token issuer,
- `AppShell` has hydrated auth state before connecting,
- Socket.IO auth sends `auth.token`.

## Nest Dependency Resolution

If Nest cannot resolve `JwtService` inside a module, import the module that provides it. For guards used in feature modules, ensure the relevant auth/JWT module is in that module's imports.

## MongoDB Connection

Check:

- `MONGODB_URI` in `apps/api/.env`,
- Docker service is running,
- credentials match `docker/mongo` init configuration.
