# Architecture and route map

## Trust boundaries

The public Next.js application renders crawlable content and never imports database, JWT, SMTP or Cloudinary secrets. The admin application is separately deployed and sends authenticated requests to the NestJS API. The API owns validation, role checks, persistence, audit events and signed uploads. PostgreSQL stores structured records; Cloudinary stores production media.

## Public routes

- `/` premium homepage and location search.
- `/profiles` and `/profiles/[slug]` profile directory and details.
- `/india`, `/india/[stateSlug]`, `/india/[stateSlug]/[citySlug]` complete India hierarchy.
- `/services`, `/gallery`, `/rates`, `/about`, `/blog`, `/contact` public content.
- `/post-ad` advertisement intake; no direct publishing.
- `/terms`, `/privacy`, `/content-policy`, `/disclaimer`, `/report-content`, `/anti-trafficking`, `/consent-takedown`, `/18-plus` legal and safety controls.

## Publishing gate

A profile remains draft until the API has an approved adult-verification record, active publication consent, at least one licensed media relationship and at least one location. Publishing, deletion and safety actions belong in the audit trail.

## Media workflow

1. An authenticated admin requests a constrained signature.
2. The browser uploads directly to Cloudinary.
3. The API verifies the Cloudinary response signature.
4. The API stores only media metadata and Cloudinary identifiers.
5. Profile-media relationships control use and prevent unsafe deletion.

The Cloudinary API secret is never sent to either Next.js application.
