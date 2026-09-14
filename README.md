<p align="center">
  <img src="docs/assets/banner.png" alt="Barnsley Web Builder — Offline Business Directory" width="100%" />
</p>

<h1 align="center">Barnsley Offline Business Directory</h1>

<p align="center">
  <strong>A working prospecting tool for the established, well-reviewed Barnsley businesses that trade without a website of their own.</strong>
</p>

<p align="center">
  <a href="https://lin4cre.github.io/Barnsley-Web-Builder/"><strong>Launch the directory →</strong></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white" alt="TypeScript strict" />
  <img src="https://img.shields.io/badge/React-19-087ea4?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/WCAG-2.2%20AA-0f766e?logo=accessibility&logoColor=white" alt="WCAG 2.2 AA" />
  <img src="https://img.shields.io/badge/tests-67%20passing-16a34a?logo=vitest&logoColor=white" alt="Tests" />
  <img src="https://img.shields.io/badge/licence-Apache--2.0-blue" alt="Licence" />
</p>

---

## What this is

Across Barnsley and the surrounding South Yorkshire districts, a lot of genuinely
well-regarded businesses — butchers, MOT garages, joiners, market traders, groomers —
still run entirely on word of mouth, footfall, and a Facebook page. Their diaries are
full, which is exactly why they have never needed a website. It is also why they miss
after-hours enquiries, and why people new to the area never find them.

This tool turns that observation into a working list you can actually use:

- **22 curated Barnsley businesses** with no website, across **14 areas** and 7 sectors
- Filter by suburb, sector, reputation, outreach stage and rating
- Track an outreach pipeline with private notes, stored in your browser
- Generate a tailored proposal, cold email and phone script for any business
- Produce a website build brief in Markdown you can hand to a developer
- Export the whole list, or just your selection, to CSV

> **On the data:** directory entries are research notes compiled from publicly
> available information. Ratings and review counts are a snapshot taken when each
> entry was added and will drift. Check details with the business before you contact
> anyone. This is a starting point for research, not a verified commercial database.

---

## Quick start

```bash
git clone https://github.com/LIN4CRE/Barnsley-Web-Builder.git
cd Barnsley-Web-Builder
npm install
npm run dev
```

Then open <http://localhost:3000>.

### AI features (optional)

Everything works without a key. With one, the pitch, research and brief generators
call Google Gemini; without one they fall back to locally generated templates, and
the UI labels them as such.

```bash
cp .env.example .env
# add your key from https://aistudio.google.com/apikey
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Express + Vite dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run build:pages` | Build configured for GitHub Pages subpath |
| `npm start` | Serve the production build (`NODE_ENV=production`) |
| `npm run verify` | typecheck → lint → test → build (run this before pushing) |
| `npm test` | Vitest suite |
| `npm run lint` | ESLint (type-aware + jsx-a11y) |

---

## Architecture

```
src/
├── components/     Presentational components; modals built on a shared accessible primitive
├── hooks/          Stateful domain logic (useBusinesses owns the directory)
├── lib/            Pure, unit-tested modules  (filters, csv, schema, storage, api, fallback)
├── data/           The curated directory (businesses.ts) — the source of truth
├── types.ts        Shared domain types
└── index.css       Tailwind v4 theme tokens + self-hosted @font-face
server.ts           Express: /api/*, security headers, rate limiting, static serving
```

Dependency direction is one-way: `components → hooks → lib → types`. Nothing in
`lib/` imports React, which is why the filtering, CSV and validation logic is
unit-testable without rendering anything.

### Two deployment targets

| | Server build | Static build (GitHub Pages) |
| --- | --- | --- |
| Served by | Express | GitHub Pages CDN |
| `/api/*` | Live, Gemini-backed | Does not exist |
| AI features | Real generation | Local templates, clearly labelled |
| Directory, filters, pipeline, CSV | Full support | Full support |

The static build is not a degraded mode — it is fully usable offline. When a
generation call cannot reach a server, the client falls back to the deterministic
template in `src/lib/fallback.ts` and marks the result `source: 'template'`, and the
UI says so rather than passing template output off as AI output.

---

## What a full audit changed

The repository was audited end to end (brand, UX, UI, SEO, performance,
accessibility, security, technical debt) and the findings were fixed. The
significant ones:

### Correctness

- **Added businesses are now persisted.** Previously, anything you added through
  *Add Business* or the AI scanner lived only in React state and disappeared on
  refresh — only outreach status and notes were saved.
- **AI features work for records you add.** The server looked businesses up by id in
  its own static array, so every user-added record returned `404 Business not found`
  and *Research & Brief* was a dead button for it. The client now sends the full
  record, validated against the same schema used for AI output.
- **CSV export no longer corrupts data.** It used a `data:` URI with `encodeURI()`,
  which leaves `#`, `&`, `+` and `=` unescaped, breaks on newlines in notes, and hits
  browser URL-length limits. Replaced with RFC 4180 quoting and a Blob download.
- **Metrics are derived, not hardcoded.** Cards claimed "Across 8 Barnsley boroughs",
  "100% reachable" and "100% no website" next to numbers computed from the data.
  Every figure now comes from `computeMetrics()`.
- **A leaked `setInterval` in the research modal** was only cleared on the success and
  error paths. Closing the modal mid-request left it running and setting state on an
  unmounted component.

### Performance

| | Before | After |
| --- | --- | --- |
| Initial JS (gzip) | 222.8 kB | **116.5 kB** (−48%) |
| Chunks | 1 | 4 initial + 2 lazy |
| Recharts | In the entry bundle | Lazy chunk, loaded on demand |
| Fonts | Google Fonts (render-blocking, third-party) | Self-hosted subset, 60 kB |
| `Outfit` display font | Downloaded but never applied | Applied |

`font-display` was used in 11 places but produced no CSS at all, because no
`--font-display` token existed in the theme — so the display font was downloaded and
then ignored. It is now defined in `@theme` in `index.css`.

### Accessibility (WCAG 2.2 AA target)

- New `Modal` primitive: `role="dialog"`, `aria-modal`, labelled *and* described,
  focus moved in on open, **focus trapped**, Escape to close, focus restored to the
  trigger on close, and background scroll locked. All four modals use it.
- Every dialog previously had none of the above.
- Skip link, `<main>` landmark, real `<caption>`/`scope` on the data table, labels on
  every input (a placeholder is not a label), `aria-pressed` on toggles,
  `aria-live` result counts, and an `sr-only` data table beside every chart.
- Visible focus indicators, `prefers-reduced-motion`, and `forced-colors` support.

### Security

- `Strict-Transport-Security`, `Content-Security-Policy` (strict in production),
  `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`, `Cross-Origin-Opener-Policy`, `X-DNS-Prefetch-Control`.
- `X-Powered-By` removed; JSON bodies capped at 128 kB; rate limiting on AI routes.
- Unknown `/api/*` routes return a JSON 404 instead of the SPA's HTML with a 200.
- Model output and user input are validated and length-capped before use.
- Missing API key returns `503`, not `500` — it is a configuration fault, not a crash.

### Reliability

- Error boundary, so a render fault shows a recoverable message instead of a blank page.
- `localStorage` access is namespaced, versioned, migrates the old unversioned keys,
  and degrades to a no-op when storage is unavailable or full.
- **67 unit tests** covering filtering, sorting, CSV escaping, input validation and
  modal keyboard behaviour.
- TypeScript `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals`. ESLint with
  type-aware rules and `jsx-a11y`. CI runs all of it on every push.

---

## Testing

```bash
npm test              # 67 tests
npm run test:coverage
npm run verify        # typecheck + lint + test + build
```

---

## Deployment

### GitHub Pages (current)

`.github/workflows/deploy.yml` builds with `VITE_BASE=/Barnsley-Web-Builder/` and
publishes `dist/`. A copy of `index.html` is emitted as `404.html` so deep links
resolve. The AI scanner is disabled in this mode and says why.

### Self-hosted / Docker

```bash
npm ci
npm run build
NODE_ENV=production GEMINI_API_KEY=… npm start
```

Set `NODE_ENV=production` — it enables the strict CSP, HSTS and rate limiting, and
serves `dist/` rather than the Vite dev middleware.

---

## Privacy

Outreach status and private notes are stored **only in your browser's local storage**.
They are never uploaded. Clearing your browser data removes them, so use the CSV
export to keep a backup. See [PRIVACY.md](PRIVACY.md).

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). In short: run `npm run verify` before
pushing, keep new logic in `lib/` as pure functions with tests, and do not add a
dependency without a reason.

To report a security issue, follow [SECURITY.md](SECURITY.md) rather than opening a
public issue.

---

## Licence

Apache-2.0 — see [LICENSE](LICENSE).

The bundled business data is compiled from public sources and is provided for
research purposes. Verify it before relying on it.
