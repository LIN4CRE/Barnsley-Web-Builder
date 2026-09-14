# Security Policy

## Supported versions

| Version | Supported |
| --- | --- |
| `main` (latest) | ✅ |
| Tagged releases | ✅ for the most recent tag |
| Older commits | ❌ |

## Reporting a vulnerability

**Please do not open a public GitHub issue for a security vulnerability.**

Use GitHub's private reporting instead:

1. Go to <https://github.com/LIN4CRE/Barnsley-Web-Builder/security/advisories>
2. Select **Report a vulnerability**
3. Include: what you observed, steps to reproduce, affected file/commit, and the
   impact you believe it has.

You should get an acknowledgement within 7 days. If the report is accepted, a fix
and advisory will follow; if it is declined, you will get a written explanation.

Please do not run intrusive scans, exploit a live deployment, or access data that
is not yours while researching a report.

## Security posture

Measures currently in place in `server.ts` and the deployment pipeline:

| Control | Implementation |
| --- | --- |
| Transport security | HSTS (`max-age=31536000; includeSubDomains`) when served over HTTPS |
| Content Security Policy | Strict `default-src 'self'` in production; relaxed only for the dev server's HMR |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Clickjacking | `X-Frame-Options: DENY` and `frame-ancestors 'none'` |
| Referrer leakage | `Referrer-Policy: strict-origin-when-cross-origin` |
| Feature policy | `Permissions-Policy` denies camera, microphone, geolocation, payment |
| Cross-origin isolation | `Cross-Origin-Opener-Policy` / `Cross-Origin-Resource-Policy: same-origin` |
| Fingerprinting | `x-powered-by` disabled |
| Request size | JSON bodies capped at 128 kB |
| Rate limiting | 20 requests/minute per IP on `/api/*` (production only) |
| Input validation | All request bodies validated and length-capped before use |
| Model output | Parsed, schema-checked and clamped before it reaches the client |
| Secrets | `.env` is gitignored; only `.env.example` with placeholders is committed |
| Dependencies | Dependabot + `npm audit` on every CI run |

### Known limitations

These are deliberate and documented rather than overlooked:

- **Rate limiting is in-memory and per-process.** Behind a load balancer or on a
  platform running multiple instances, put a shared store (or platform-native rate
  limiting) in front of `/api/*`.
- **There is no authentication.** The app holds no accounts and stores user data in
  the browser only, so there is nothing to authenticate against. If you add
  server-side persistence, add authentication and authorisation at the same time.
- **The bundled business data is public research data.** Do not add private or
  special-category personal data to `src/data/businesses.ts`.

## Handling a leaked API key

If a `GEMINI_API_KEY` is ever exposed:

1. Revoke it immediately in Google AI Studio.
2. Remove it from the shell history, `.env`, and any committed file.
3. Rotate: generate a new key and set it in the deployment environment only.
4. Assume any key pasted into a chat, issue, or log is compromised and revoke it
   even if you believe it was private.
