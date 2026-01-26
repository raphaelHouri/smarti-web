This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Book/Payments integration (ported from my-app)

Required environment variables:

```
# Firebase Admin (GCP Service Account)
GCS_PROJECT_ID=
GCS_CLIENT_EMAIL=
GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Google Cloud Storage
GCS_BUCKET_NAME=

# CloudConvert
CLOUDCONVERT_API_KEY=

# Public base URL of this app (no trailing slash)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Payments (Yaad)
YAAD_TOKEN=

# iCount invoicing (optional)
ICOUNT_CID=
ICOUNT_USER=
ICOUNT_PASS=

# Mailgun
MAILGUM_TOKEN=api:key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Store Auto-Login (optional)
# Credentials for automatic login when ?store=android or ?store=ios query parameter is present
ANDROID_STORE_EMAIL=
ANDROID_STORE_PASSWORD=
IOS_STORE_EMAIL=
IOS_STORE_PASSWORD=

# Node envs
NEXT_ENV=development
```

Assets required in `public/`:

- `template.docx` (DOCX template used by the converter)
- `template.zip` (optional cache; will be created if missing)

APIs added under `app/api/`:

- `book/convert` – generate DOCX, convert to PDF, upload to GCS
- `book/generate` – orchestration endpoint to trigger convert and update Firestore
- `pay` – build Yaad checkout URL and redirect
- `pay/success` – Yaad callback handler; stores doc, calls iCount, emails link
- `email` – test email endpoint
- `html` – success page HTML

## Getting Started Linguify

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
