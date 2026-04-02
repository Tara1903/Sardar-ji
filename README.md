# Sardar Ji Food Corner

Production-ready multi-page food ordering platform for a local food business, built with:

- React + React Router + Framer Motion
- Node.js + Express
- Supabase Postgres + Auth + Storage
- Vercel-ready frontend + serverless API routing

## Quick Start

1. Copy `client/.env.example` to `client/.env`
2. Copy `server/.env.example` to `server/.env`
3. Fill in the Supabase keys for your project
4. Run `npm run dev`
5. Seed the demo users with `npm run seed:supabase-demo --prefix server`

Frontend: `http://localhost:5173`

Backend: `http://localhost:5000`

## Demo Accounts

- Admin: `admin@sardarji.local` / `Admin@123`
- Delivery: `delivery@sardarji.local` / `Delivery@123`
- Customer: `customer@sardarji.local` / `Customer@123`

## Root Scripts

- `npm run dev` starts client and server together
- `npm run build` builds the production client bundle
- `npm run preview` previews the Vite production bundle locally
- `npm run client:dev` starts the Vite frontend
- `npm run server:dev` starts the Express backend

## Server Scripts

- `npm run dev --prefix server` runs the API in watch mode
- `npm run seed:supabase-demo --prefix server` creates or refreshes the demo auth users

## Folder Structure

```text
.
|-- api
|-- dist
|-- client
|   |-- src
|   |   |-- api
|   |   |-- components
|   |   |-- contexts
|   |   |-- data
|   |   |-- lib
|   |   |-- pages
|   |   `-- utils
|   `-- .env.example
|-- server
|   |-- scripts
|   |-- src
|   |   |-- config
|   |   |-- controllers
|   |   |-- middleware
|   |   |-- routes
|   |   |-- services
|   |   `-- utils
|   `-- .env.example
|-- supabase
|   `-- migrations
|-- .env.example
|-- vercel.json
`-- README.md
```

## Supabase Database

The live schema is defined in `supabase/migrations/20260403_init_sardar_ji_food_corner.sql`.

### Tables

- `public.users`
- `public.categories`
- `public.products`
- `public.app_settings`
- `public.orders`
- `public.order_items`
- `public.referrals`
- `public.delivery_tracking`
- `public.order_status_history`

### Storage Buckets

- `product-images`
  Public bucket for menu images shown in the storefront
- `user-uploads`
  Private bucket for future user uploads and admin-managed documents

### Database Functions

- `fetch_products(search, category, available)`
- `place_order(user_id, address, payment_method, items, note)`
- `update_order_status(order_id, status, assigned_delivery_user_id, actor_user_id)`
- `track_delivery(order_id, delivery_user_id, latitude, longitude, eta_minutes, status_note)`
- `get_delivery_tracking(order_id)`
- `apply_referral_code(user_id, referral_code)`

### Relationships

- `products.category_id -> categories.id`
- `orders.user_id -> users.id`
- `orders.assigned_delivery_boy_id -> users.id`
- `order_items.order_id -> orders.id`
- `order_items.product_id -> products.id`
- `referrals.referrer_user_id -> users.id`
- `referrals.referred_user_id -> users.id`
- `delivery_tracking.order_id -> orders.id`
- `delivery_tracking.delivery_user_id -> users.id`
- `order_status_history.order_id -> orders.id`
- `order_status_history.changed_by -> users.id`

### Auth and Roles

Supabase Auth handles email/password accounts. The app stores the profile in `public.users` with one of these roles:

- `admin`
- `customer`
- `delivery`

The Express API validates the Supabase user at login and then issues the app JWT used by the React frontend.

### Row-Level Security

RLS is enabled on all business tables. Policies cover:

- public reads for live categories, products, and storefront settings
- own-profile access for customers
- admin-only writes for catalog and settings
- scoped order access for customer, assigned delivery partner, and admin
- secure storage access for product images and per-user uploads

## Core API Routes

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/categories`
- `POST /api/categories`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/addresses`
- `GET /api/auth/users`
- `GET /api/orders`
- `POST /api/orders`
- `PUT /api/orders/:id/status`
- `GET /api/tracking/:orderId`
- `GET /api/referral/me`
- `POST /api/referral/apply`
- `POST /api/delivery/location-update`
- `POST /api/upload/image`
- `GET /api/settings`
- `PUT /api/settings`

## Environment Variables

### Server

- `PORT`
- `CLIENT_ORIGIN`
- `ALLOWED_ORIGINS`
- `JWT_SECRET`
- `GOOGLE_MAPS_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PRODUCT_IMAGES_BUCKET`
- `SUPABASE_USER_UPLOADS_BUCKET`

### Client

- `VITE_API_URL`
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Frontend Supabase Runtime

The browser-safe Supabase client is initialized in `client/src/lib/supabase.js` and only reads:

- `import.meta.env.VITE_SUPABASE_URL`
- `import.meta.env.VITE_SUPABASE_ANON_KEY`

The service role key remains server-only and is never exposed to the browser bundle.

## Vercel Deployment

### Vercel Build Settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm ci && npm ci --prefix client && npm ci --prefix server`

### Routing

SPA refresh handling is configured in `vercel.json`:

- `/api/*` stays on the Express serverless function
- all other routes fall back to `index.html`

### Deploy Steps

1. Push the repository to GitHub
2. Import the repository into Vercel
3. Set the root directory to the repository root
4. In Vercel environment variables, add:
   - `VITE_API_URL=/api`
   - `VITE_GOOGLE_MAPS_API_KEY` if you want embedded maps
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_PRODUCT_IMAGES_BUCKET=product-images`
   - `SUPABASE_USER_UPLOADS_BUCKET=user-uploads`
   - `JWT_SECRET`
   - `CLIENT_ORIGIN`
   - `ALLOWED_ORIGINS`
5. Deploy the project
6. After the first deployment, update `CLIENT_ORIGIN` and `ALLOWED_ORIGINS` to your final Vercel domain or custom domain if needed

### Local Production Preview

1. Run `npm run build`
2. Run `npm run preview`
3. Open the local preview URL shown by Vite

## Production Notes

- The backend now uses Supabase instead of Firebase or local JSON storage.
- Product uploads go to Supabase Storage and fall back to category demo images when no image URL is saved.
- The customer registration flow only creates `customer` accounts. Admin and delivery users should be seeded or created through a controlled admin flow.
- Google Maps is optional. Without `VITE_GOOGLE_MAPS_API_KEY`, tracking falls back to coordinates plus a direct Google Maps link.
- The handling fee below the free-delivery threshold is set to `Rs 9`.
