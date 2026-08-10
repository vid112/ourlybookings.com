# Ourly Bookings

Production-oriented India-only adult classifieds directory foundation built from the supplied SEO master specification.

## Applications

- `frontend` — public Next.js App Router website with server-rendered India, state, city and profile routes.
- `backend/api` — NestJS REST API with Prisma/PostgreSQL, authentication, leads, analytics, reporting and Cloudinary signatures.
- `backend/admin` — separate protected Next.js admin application foundation.

All included profiles and images are fictional demo content. Replace them only with licensed media for verified adults who have consented to publication.

## Local setup

1. Copy `backend/api/.env.example` to `backend/api/.env` and `frontend/.env.example` to `frontend/.env.local`; replace every secret. Cloudinary can remain blank locally because development uploads are stored in `backend/api/uploads`; configure Cloudinary before production deployment.
2. Start PostgreSQL and Redis: `docker compose up -d`.
3. Install dependencies: `pnpm install`.
4. Generate Prisma Client: `pnpm db:generate`.
5. Apply migrations: `pnpm db:migrate`.
6. Seed safe demo content: `pnpm db:seed`.
7. Run all applications: `pnpm dev`.

### Image uploads

Development uses authenticated local uploads when all three Cloudinary values are blank. Local files are ignored by Git and served from the API's `/uploads` route. When valid Cloudinary credentials are present, the same form automatically switches to signed Cloudinary uploads. Production never enables the local fallback and requires Cloudinary.

### Gmail OTP setup

Advertiser registration and password reset use email OTP. Enable 2-Step Verification on the sender Google account, create a dedicated Google App Password, and set these values in `backend/api/.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=ourlybookings@gmail.com
SMTP_PASSWORD=your-16-character-google-app-password
SMTP_FROM=ourlybookings@gmail.com
```

Never commit the App Password or use the normal Gmail account password.

Public site: <http://localhost:3000>
Admin: <http://localhost:3001>
API and Swagger: <http://localhost:4000/api/docs>

## Required launch work

- Have Indian counsel review service language, enquiry flow, privacy, intermediary obligations and applicable state/local rules.
- Configure real phone/WhatsApp only after compliance review.
- Provide Cloudinary, SMTP, production database, domain and monitoring credentials.
- Replace demo profiles with verified adult records and privately retain consent evidence.
- Run the full CI, accessibility, performance, security and content-rights checklist.

See each application README for implementation details.
