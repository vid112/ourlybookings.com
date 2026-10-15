# Admin dashboard

Separate Next.js application for protected operations. The `proxy.ts` gate redirects unauthenticated requests to `/login`; all sensitive writes still require NestJS authentication and role checks.

The current UI establishes every required administration surface. Profile CRUD, publish gating, media signatures, leads, reports and analytics already have API endpoints; follow-on UI forms can consume them without changing the public frontend.
