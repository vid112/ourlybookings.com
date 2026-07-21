# NestJS API

Versioned REST API for public content, leads, first-party analytics, content reports, authentication, admin CRUD and signed Cloudinary uploads.

## Security defaults

- Strict DTO validation with unknown fields rejected.
- Helmet headers, CORS allowlist and global rate limiting.
- Short-lived JWT access token plus rotated refresh token in HttpOnly cookies.
- Argon2 password and refresh-token hashing.
- Private verification and consent records are never returned by public controllers.
- Cloudinary API secret remains server-side; browsers receive a short-lived signed upload payload only.

Run `pnpm prisma:generate`, `pnpm prisma:migrate`, `pnpm prisma:seed`, then `pnpm dev`.
