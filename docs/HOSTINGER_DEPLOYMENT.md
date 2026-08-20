# Hostinger deployment

Ourly Bookings is a monorepo with three independent server applications. Deploy each application as its own Hostinger Node.js Web App from the same GitHub repository and branch.

| Hostname | Root directory | Framework | Build command | Start command |
| --- | --- | --- | --- | --- |
| `ourlybookings.com` | `frontend` | Next.js | `pnpm build` | `pnpm start` |
| `api.ourlybookings.com` | `api` | NestJS | `pnpm build` | `pnpm start:prod` |
| `admin.ourlybookings.com` | `admin` | Next.js | `pnpm build` | `pnpm start` |

Use Node.js 22.x and pnpm 11.22.0 for all three apps. Do not deploy the repository root as one Next.js application.

## Public frontend variables

- `NEXT_PUBLIC_SITE_URL=https://ourlybookings.com`
- `NEXT_PUBLIC_API_URL=https://api.ourlybookings.com/api/v1`
- `NEXT_PUBLIC_ADMIN_URL=https://admin.ourlybookings.com`
- Public contact, Turnstile site key, and payment values from `.env.example`

## Admin variables

- `NEXT_PUBLIC_API_URL=https://api.ourlybookings.com/api/v1`

## API variables

- `NODE_ENV=production`
- `PORT=3000`
- `DATABASE_URL` from the production PostgreSQL provider
- `FRONTEND_URL=https://ourlybookings.com`
- `ADMIN_URL=https://admin.ourlybookings.com`
- `COOKIE_DOMAIN=.ourlybookings.com`
- Unique production values for `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `COOKIE_SECRET`
- SMTP variables for email OTP
- All three Cloudinary variables for production media uploads
- `TURNSTILE_SECRET_KEY` when Turnstile is enabled

The API production start command runs `prisma migrate deploy` before starting NestJS. The build command only compiles the application and does not mutate the database. Seed the production database once after the first successful migration.
