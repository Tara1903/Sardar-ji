# Sardar Ji Food Corner

Simple Vite + React frontend for Sardar Ji Food Corner, connected directly to Supabase.

## Final Project Structure

```text
.
|-- android
|-- assets
|-- src
|-- public
|-- supabase
|   `-- migrations
|-- tools
|-- index.html
|-- package.json
|-- vite.config.js
|-- vercel.json
|-- .env.example
`-- README.md
```

## Important

- Deploy from: repository root
- Vercel root directory: `.`
- Build command: `npm run build`
- Output directory: `dist`

## Local Setup

1. Copy `.env.example` to `.env`
2. Add your Supabase values:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Optional: `VITE_GOOGLE_MAPS_API_KEY`
3. Open a terminal in the project root
4. Run `npm install`
5. Run `npm run dev`

The app will open on `http://localhost:5173`.

## Scripts

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run android:sync`
- `npm run android:build:debug`
- `npm run android:build:release`
- `npm run android:open`

## Android App

The project is configured with Capacitor using:

- app name: `Sardar Ji Food Corner`
- app id: `com.sardarjifood.app`
- web directory: `dist`

Helpful notes:

- `npm run android:build:debug` builds the web app, syncs Capacitor, and generates a debug APK.
- `npm run android:build:release` builds a signed release APK and AAB for distribution.
- The current debug APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`.
- The signed release APK is created at `android/app/build/outputs/apk/release/app-release.apk`.
- The signed release AAB is created at `android/app/build/outputs/bundle/release/app-release.aab`.
- The debug build script prefers Android Studio's bundled JBR and `%LOCALAPPDATA%\\Android\\Sdk`, then falls back to `tools/android-sdk` and `tools/jdk21` if needed.
- `android/local.properties` points Android Studio to the local SDK path.

## Android Release Signing

Local release signing is configured through:

- `android/release-keystore.properties`
- `android/sardar-ji-food-corner-release.jks`

Important:

- Back up both files somewhere safe before reinstalling Windows or moving machines.
- Without the same keystore, future Play Store updates for `com.sardarjifood.app` cannot be published as updates.

## Supabase

The frontend uses only browser-safe environment variables:

- `import.meta.env.VITE_SUPABASE_URL`
- `import.meta.env.VITE_SUPABASE_ANON_KEY`

No service role key is exposed in the frontend.

## Database Notes

The Supabase SQL files are stored in:

- `supabase/migrations/20260403_init_sardar_ji_food_corner.sql`
- `supabase/migrations/20260403_vercel_static_security_patch.sql`

These define the menu, orders, referrals, tracking, storage, and security rules used by the app.

## Vercel Deployment

1. Push the repository to GitHub
2. Import the repository into Vercel
3. Set the root directory to the repository root
4. Add environment variables if you want to override the included public Supabase browser config:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - Optional: `VITE_GOOGLE_MAPS_API_KEY`
5. Add secure payment variables for Razorpay:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
6. Deploy

## Notes

- The app is a static frontend with lightweight Vercel `/api` functions for secure Razorpay order creation and payment verification.
- Product and order data come directly from Supabase.
- `vercel.json` is intentionally minimal and only exists to support React Router deep links on Vercel.
- Google Maps is optional. Without an API key, tracking still shows location details and a map link.
- The active storefront offer is `₹499+ Order = FREE Delivery + FREE Mango Juice 🥭`.
- Razorpay uses the official order-first flow: create the order on the server, open Checkout in the browser, then verify the payment signature on the server before the order or subscription is finalized.
