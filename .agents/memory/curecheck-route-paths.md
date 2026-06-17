---
name: CureCheck API route paths
description: Express route path conventions and lib/brand tsconfig fix needed for codegen
---

## Rule: Route paths must NOT include /api/ prefix

`app.use("/api", router)` in `artifacts/api-server/src/app.ts` strips the `/api` prefix before passing to the router.

**Correct:**
```ts
router.post("/claim-checker", ...)    // accessible at /api/claim-checker
router.get("/health-news", ...)       // accessible at /api/health-news
```

**Wrong (causes 404):**
```ts
router.post("/api/claim-checker", ...)  // would need /api/api/claim-checker
router.get("/api/health-news", ...)     // causes 404 silently
```

**Why:** The proxy in artifact.toml passes full paths like `/api/health-news` to port 8080. Express then matches against `app.use("/api", router)` which strips `/api`, leaving `/health-news` for sub-routes.

## lib/brand tsconfig fix for codegen

`pnpm --filter @workspace/api-spec run codegen` runs `typecheck:libs` at the end. If `lib/brand` fails, codegen fails entirely.

Fix needed in `lib/brand/tsconfig.json`:
```json
{
  "compilerOptions": {
    "types": ["react"]  // NOT ["node", "react"] — brand has no @types/node
  }
}
```
Also requires `@types/react` in `lib/brand/package.json` devDependencies.

**Why:** lib/brand is a JSX component library. It needs `@types/react` explicitly since it's a composite lib (not an artifact that inherits from root).

## Orval mutate wrapper

Orval-generated mutation hooks require `{ data: InputType }` wrapper:
```ts
mutate({ data: { concern, symptoms } })  // correct
mutate({ concern, symptoms })             // TS error: 'concern' not in {data: DoctorPrepInput}
```
