# SignSpeak

> **Real-Time Sign-to-Speech Engine & Accessibility Platform for Video Meetings**

SignSpeak translates American Sign Language (ASL) gestures into synthesized speech directly in Google Meet calls using on-device MediaPipe 3D joint landmark extraction and local machine learning models (< 18ms latency).

---

## Tech Stack & Architecture

- **Frontend**: React 18, Vite, Vanilla CSS design system (Warm editorial aesthetic with Fraunces & Work Sans typography).
- **Authentication**: Firebase Authentication (Google Sign-In with popup OAuth flow).
- **Database**: Neon Serverless Lakebase PostgreSQL (`@neondatabase/serverless`).
- **Serverless API / Hosting**: Cloudflare Pages / Workers Functions (`functions/api/*`).
- **Local ML & Audio**: MediaPipe 3D Hands, Web Audio API, Web Speech Synthesis.

---

## Production Setup & Deployment Guide

Follow these 10 steps to connect your Firebase and Neon database credentials:

### 1. Create a Firebase Project
1. Visit the [Firebase Console](https://console.firebase.google.com/) and create a new project (e.g. `signspeak-prod`).

### 2. Enable Google Authentication
1. In the Firebase Console, go to **Build > Authentication > Sign-in method**.
2. Click **Add new provider**, select **Google**, enable it, and save.
3. In **Settings > Authorized domains**, add `localhost` and your production Cloudflare domain (e.g., `signspeak.pages.dev` or your custom domain).

### 3. Register Web App in Firebase
1. Under **Project Overview > Project settings > General**, add a **Web app (`</>`)**.
2. Copy the generated `firebaseConfig` object keys.

### 4. Configure Frontend Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your Firebase web app keys in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:1234567890:web:abcdef
   ```

### 5. Create a Neon PostgreSQL Database
1. Go to the [Neon Console](https://console.neon.tech/) and create a new Lakebase Postgres project.
2. Copy your pooled connection string (`DATABASE_URL`).

### 6. Run Database Schema / Migrations
1. Open the **SQL Editor** in the Neon Console.
2. Copy and execute the contents of [`database/schema.sql`](./database/schema.sql).
3. This creates the `users`, `contact_messages`, and `feedback` tables with UUID keys and indexes.

### 7. Configure Server-Side Secrets for Local Development
1. Copy `.dev.vars.example` to `.dev.vars`:
   ```bash
   cp .dev.vars.example .dev.vars
   ```
2. Add your Neon database connection URL and Firebase Project ID:
   ```env
   DATABASE_URL=postgresql://neondb_owner:your_password@ep-your-id.us-east-2.aws.neon.tech/neondb?sslmode=require
   FIREBASE_PROJECT_ID=your-project
   ```

### 8. Configure Cloudflare Production Secrets
When deploying to Cloudflare Pages:
1. In the Cloudflare Dashboard, navigate to **Workers & Pages > Your Project > Settings > Environment variables**.
2. Add the following secrets:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `FIREBASE_PROJECT_ID`: Your Firebase Project ID.

### 9. Run Locally
```bash
npm install
npm run dev
```
Open `http://localhost:5173`. The local Vite server automatically handles `/api/*` endpoints with Neon and Firebase token verification.

### 10. Build & Deploy
```bash
npm run build
```
Deploy the generated `dist/` directory and `functions/` API directory directly to Cloudflare Pages.

---

## API Endpoints Reference

All API routes run as serverless edge functions:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/sync` | Verifies Firebase ID token & upserts user in Neon | Yes (`Bearer <token>`) |
| `GET` | `/api/profile` | Returns authenticated user profile and stats | Yes (`Bearer <token>`) |
| `POST` | `/api/contact` | Stores contact message in Neon (links user if logged in) | Optional |
| `POST` | `/api/feedback` | Stores community rating and feedback in Neon | Optional |

---

## Security Best Practices
- **No Client Secrets**: `DATABASE_URL` is never bundled into frontend assets and only runs on the serverless edge runtime.
- **Cryptographic Token Verification**: The server extracts identity directly from verified Firebase JWT tokens.
- **Zero Video Telemetry**: Camera frames and ASL landmark processing run 100% on the user's device.
