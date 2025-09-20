# my-lib

A TypeScript library template using **pnpm**, **tsdown**, **ESLint**, **Prettier**, and **Vitest**.

## Quick start

```bash
pnpm i
pnpm build
pnpm test
```

## Scripts

- `pnpm build` — bundle with tsdown (ESM + CJS + d.ts, sourcemaps)
- `pnpm test` — run unit tests with Vitest
- `pnpm lint` / `pnpm lint:fix` — ESLint
- `pnpm format` / `pnpm format:write` — Prettier
- `pnpm typecheck` — TypeScript type check w/o emit

## Publish

This template sets `prepack` to build & test before publishing.

```bash
pnpm publish --access public
```

## Notes

- tsdown infers `target` from `engines.node`. Update `engines.node` if needed.
- Add peer deps to `external` in `tsdown.config.ts` for libraries.
