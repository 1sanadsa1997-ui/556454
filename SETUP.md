PromoHive — Setup

Prerequisites
- Node.js 18+ and npm or pnpm
- Access to the provided Neon PostgreSQL database and Cloudinary account

Environment
- Edit .env and set secrets (already included for dev). Replace JWT_SECRET with a secure random value before production.

Install and DB
1. npm install
2. npx prisma generate
3. npx prisma migrate dev --name init
4. npm run seed

Run
- pnpm dev (or npm run dev) to start Vite dev server
- Backend server is integrated in dev environment; API routes are available under /api/*

Notes
- Admin account: first registered user or ADMIN_EMAIL in .env will be created as ADMIN by seed script.
- AdGem/Adsterra: endpoints and background job stubs are implemented; configure ADSTERRA_API_KEY and ADGEM secrets in .env.
- Cloudinary uploads: /api/uploads/cloudinary accepts base64 image in JSON and returns uploaded URL (demo signing implementation).

Security
- Replace secrets before deploying. Use a secrets manager or env injection on Hostinger.

If you want I can run the install/migrate/seed on your dev server — or you can run the four commands locally/remote as listed above.
