# BookIt — Booking Web App

A full-stack booking application built with Next.js (App Router), Firebase Firestore, Resend email, and Tailwind CSS.

## Features

- **Booking form** — name, email, date, and message
- **Firebase Firestore** — stores all bookings with status tracking
- **Admin dashboard** — password-protected; approve or reject bookings
- **Email notifications** — admin gets notified on new bookings; users get notified on status changes
- **Responsive UI** — clean design with Tailwind CSS

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout with nav & footer
│   ├── page.tsx                # Home — booking form
│   ├── globals.css             # Tailwind imports
│   ├── booking-success/
│   │   └── page.tsx            # Success confirmation page
│   ├── admin/
│   │   └── page.tsx            # Admin dashboard (password-protected)
│   └── api/
│       └── bookings/
│           ├── route.ts        # POST (create) & GET (list) bookings
│           └── [id]/
│               └── route.ts    # PATCH (update status)
├── components/
│   └── BookingForm.tsx         # Client-side booking form component
└── lib/
    ├── firebase.ts             # Firebase client SDK config
    ├── firebase-admin.ts       # Firebase Admin SDK config
    ├── email.ts                # Resend email helpers
    └── types.ts                # TypeScript types
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project
2. Enable **Firestore Database** (start in test mode for development)
3. Go to **Project Settings > General** and copy your web app config values
4. Go to **Project Settings > Service Accounts** and click **Generate New Private Key** to download the JSON file

### 3. Set Up Resend

1. Sign up at [resend.com](https://resend.com/)
2. Get your API key from the dashboard
3. For development, emails are sent from `onboarding@resend.dev` (Resend's sandbox). To use a custom domain, verify it in the Resend dashboard.

### 4. Configure Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.local.example .env.local
```

Fill in all the values in `.env.local`:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web app config (6 values) |
| `FIREBASE_PROJECT_ID` | Same as the public one |
| `FIREBASE_CLIENT_EMAIL` | From the service account JSON |
| `FIREBASE_PRIVATE_KEY` | From the service account JSON (keep the quotes) |
| `RESEND_API_KEY` | Your Resend API key |
| `ADMIN_EMAIL` | Email that receives new booking notifications |
| `ADMIN_PASSWORD` | Password for the admin dashboard |
| `NEXT_PUBLIC_APP_URL` | Your app URL (`http://localhost:3000` for dev) |

### 5. Create Firestore Index

Firestore needs a composite index for the bookings query. On first run, if you see an index error in the console, click the link in the error message to create it automatically. The index needed is:

- Collection: `bookings`
- Fields: `createdAt` (Descending)

### 6. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the booking form.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## API Routes

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/bookings` | Create a new booking | None |
| `GET` | `/api/bookings` | List all bookings | `x-admin-password` header |
| `PATCH` | `/api/bookings/:id` | Update booking status | `x-admin-password` header |

## Deployment

This app is ready to deploy on [Vercel](https://vercel.com/):

1. Push to GitHub
2. Import the repo in Vercel
3. Add all environment variables from `.env.local` to the Vercel project settings
4. Deploy

Remember to update `NEXT_PUBLIC_APP_URL` to your production URL.
