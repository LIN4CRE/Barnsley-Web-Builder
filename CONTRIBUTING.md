# Contributing

Thanks for taking the time to contribute. This document covers the conventions the
codebase follows so that changes are easy to review.

## Before you start

```bash
npm install
npm run verify   # typecheck + lint + test + build
```

`npm run verify` must pass before you open a pull request. CI runs the same steps.

## Ground rules

1. **Pure logic lives in `src/lib/`.** Filtering, sorting, CSV, validation and
   template generation must not import React. They are unit-tested directly, and
   keeping them pure is what makes that possible.
2. **Components present; hooks manage state.** `useBusinesses` is the single source
   of truth for directory data. Do not add a second one.
3. **Never invent facts.** This tool generates outreach material about real
   businesses. Do not add code that fabricates prices, review quotes, testimonials,
   trading hours or revenue figures. Anything unknown must be labelled "To confirm".
4. **Label template output.** If content was produced locally rather than by the
   model, mark it `source: 'template'` and let the UI say so.
5. **Accessibility is not optional.** New interactive UI needs a keyboard path, a
   visible focus state, an accessible name, and — if it is a dialog — focus
   management via the shared `Modal` component.

## Style

- TypeScript is `strict` with `noUncheckedIndexedAccess`. No `any`, no non-null
  assertions without a comment explaining why.
- Prefer `interface` for object shapes, `type` for unions.
- ESLint enforces type-aware rules and `jsx-a11y`. Run `npm run lint:fix` first,
  then fix whatever remains by hand — do not add blanket `eslint-disable` comments.
- Tailwind utility classes for styling. Add a token to `@theme` in `index.css`
  rather than hardcoding a colour.

## Adding a business to the directory

Entries go in `src/data/businesses.ts`. Requirements:

- A real, publicly identifiable Barnsley-area business with **no website**.
- `phone` is required — it is the primary call to action.
- `successProof` and `whyNoWebsite` must be specific, not generic praise.
- `estimatedLostRevenuePerMonth`, if present, must read as an estimate.

Do not add entries for businesses that do have a website.

## Adding a dependency

Ask first. The bundle is deliberately small and Recharts is already the heaviest
thing in it. If a dependency is justified, note in the PR what it adds and what it
costs in bundle size (`npm run build` prints the numbers).

## Tests

- `tests/` uses Vitest + Testing Library.
- Every bug fix should come with a test that would have failed before it.
- Test behaviour, not implementation details.

## Commit messages

Short imperative subject, then a blank line and a body explaining *why*:

```
fix: persist businesses added via the scanner

Added records were held only in React state, so they were lost on refresh.
They are now written to namespaced local storage alongside status and notes.
```

## Reporting a security issue

Do not open a public issue. See [SECURITY.md](SECURITY.md).
