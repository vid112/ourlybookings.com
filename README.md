# Ourly Bookings

Production-oriented India-only adult classifieds directory foundation built from the supplied SEO master specification.

## Applications

- `frontend` — public Next.js App Router website with server-rendered India, state, city and profile routes.
- `api` — NestJS REST API with Prisma/PostgreSQL, authentication, leads, analytics, reporting and Cloudinary signatures.
- `admin` — separate protected Next.js admin application foundation.

All included profiles and images are fictional demo content. Replace them only with licensed media for verified adults who have consented to publication.

## Local setup

1. Copy `api/.env.example` to `api/.env` and `frontend/.env.example` to `frontend/.env.local`; replace every secret. Category images are stored in PostgreSQL; Cloudinary remains optional for other media in local development.
2. Start PostgreSQL and Redis: `docker compose up -d`.
3. Install dependencies: `pnpm install`.
4. Generate Prisma Client: `pnpm db:generate`.
5. Apply migrations: `pnpm db:migrate`.
6. Seed safe demo content: `pnpm db:seed`.
7. Run all applications: `pnpm dev`.

The API reads `api/.env` first and falls back to the repository-root `.env`, so either local setup works without duplicating secrets.

### Image uploads

Category images uploaded from the admin panel are stored in PostgreSQL and served from a cache-busted public API URL, so they work in production without Cloudinary. Other media uploads use authenticated local storage in development when all Cloudinary values are blank and signed Cloudinary uploads when credentials are configured.

### Gmail OTP setup

Advertiser registration and password reset use email OTP. Enable 2-Step Verification on the sender Google account, create a dedicated Google App Password, and set these values in `api/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=ourlybookings@gmail.com
SMTP_PASSWORD=your-16-character-google-app-password
SMTP_FROM=ourlybookings@gmail.com
```

Google sign-in uses Google Identity Services. Create a Web OAuth client with the production and local frontend origins, then set the same client ID as `GOOGLE_CLIENT_ID` in the API and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in the frontend.

Never commit the App Password or use the normal Gmail account password.

Public site: <http://localhost:3000>
Admin: <http://localhost:3001>
API and Swagger: <http://localhost:4000/api/docs>

## Required launch work

- Have Indian counsel review service language, enquiry flow, privacy, intermediary obligations and applicable state/local rules.
- Configure real phone/WhatsApp only after compliance review.
- Provide SMTP, Google OAuth, production database, domain and monitoring credentials. Add Cloudinary when profile/media uploads require it.
- Replace demo profiles with verified adult records and privately retain consent evidence.
- Run the full CI, accessibility, performance, security and content-rights checklist.

See each application README for implementation details.
