# Sardar Ji Food Corner

Simple Vite + React frontend for Sardar Ji Food Corner, connected directly to Supabase.

## Final Project Structure

```text
.
|-- src
|-- public
|-- supabase
|   `-- migrations
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
5. Deploy

## Notes

- The app is a static frontend. No Express server is required for deployment.
- Product and order data come directly from Supabase.
- `vercel.json` is intentionally minimal and only exists to support React Router deep links on Vercel.
- Google Maps is optional. Without an API key, tracking still shows location details and a map link.
