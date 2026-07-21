# Public frontend

Server-rendered Next.js App Router site for the India-only Ourly Bookings directory.

## Route model

- `/india` — all states and union territories.
- `/india/[stateSlug]` — state overview and city/profile directory.
- `/india/[stateSlug]/[citySlug]` — unique city page.
- `/profiles` and `/profiles/[slug]` — directory and profile detail.
- `/post-ad`, `/contact`, `/report-content` — working API-backed forms.
- Static brand, service, content and legal routes.

The bundled dataset is a safe build-time fallback. Production should hydrate from the authenticated NestJS publishing workflow and trigger controlled Next.js revalidation.
