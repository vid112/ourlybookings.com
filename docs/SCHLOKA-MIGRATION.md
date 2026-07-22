# Authorized Schloka migration

The importer moves the owner-authorized India state/city hierarchy and listing data into the
Ourly database. It does not generate images. Source CDN URLs and the source profile URL are kept
as provenance records.

Only run this after the operator has confirmed that they control the source website, hold the
publication rights for its media, and have valid adult publication consent for every listing.
Profiles with a missing age, an age below 18, or no source image are skipped.

```powershell
$env:SCHLOKA_IMPORT_AUTHORIZED="true"
$env:SCHLOKA_IMPORT_PUBLISH_CONFIRMED="true"
corepack pnpm import:schloka -- --cities=mumbai,delhi --max-profiles-per-city=2 --publish
```

If a city listing is temporarily returning an error, bootstrap it from an existing detail URL.
The importer also follows same-city related listing links found on that page:

```powershell
corepack pnpm import:schloka -- --profile-urls=https://schloka.com/call-girl/mumbai/example-profile --max-profiles-per-city=5 --publish
```

Import the location hierarchy without profiles:

```powershell
$env:SCHLOKA_IMPORT_AUTHORIZED="true"
corepack pnpm import:schloka -- --locations-only
```

The importer is idempotent: locations, profiles, services, media, verification evidence and SEO
metadata are updated through stable keys. Network requests happen before short database
transactions. Re-running is safe; temporary source errors are logged and skipped.

For production independence, configure Cloudinary and add a separate approved media-copy job.
Until then, the website renders the authorized `cdn.schloka.com` image URLs stored in the database.
