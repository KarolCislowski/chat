# Scripts

Run package scripts from the app directory. The repository root does not define a shared npm workspace script.

## Web

```bash
cd apps/web
npm run dev
npm run typecheck
npm run build
npm run start
```

## API

```bash
cd apps/api
npm run start:dev
npm run typecheck
npm run build
npm run start
```

## Common Verification

Before finishing feature work, run:

```bash
cd apps/web && npm run typecheck && npm run build
cd apps/api && npm run typecheck && npm run build
```

Run only the affected app when the change is isolated.
