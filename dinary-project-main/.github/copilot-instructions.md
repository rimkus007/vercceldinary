# Copilot Instructions for Dinary Project

This guide provides essential context for AI coding agents working in the Dinary monorepo. Follow these conventions and workflows to be immediately productive.

## Architecture Overview

- **Monorepo Structure**: Contains multiple apps:
  - `dinarus` (main wallet frontend, Next.js 14)
  - `dinarus-backend` (NestJS API server)
  - `dinaruspro-frontend` (Next.js, pro client)
  - `Dashboard` (admin dashboard, Next.js)
- **Frontend**: Next.js 14 (App Router, TypeScript, Tailwind CSS)
- **Backend**: NestJS (TypeScript), Prisma ORM, organized by domain modules (e.g., wallet, users, merchants)
- **Database**: Supabase (Postgres) for most apps; Prisma for backend
- **State Management**: React Context, some usage of Zustand (optionally)

## Key Workflows

- **Install dependencies**: `npm install` in each app folder
- **Start development server**:
  - Frontend: `npm run dev` (Next.js)
  - Backend: `npm run start:dev` (NestJS)
- **Build for production**:
  - Frontend: `npm run build` then `npm run start`
  - Backend: `npm run start:prod`
- **Testing** (backend):
  - Unit: `npm run test`
  - E2E: `npm run test:e2e`
  - Coverage: `npm run test:cov`
- **Environment Variables**: Store secrets in `.env.local` (see README for required keys, e.g., Supabase)

## Project-Specific Patterns

- **Routing**: Next.js App Router, file-based routing in `app/` directories
- **Component Organization**: Modular, grouped by feature in `components/` and `contexts/`
- **Admin Dashboard**: Uses Supabase for auth/data, Chart.js for analytics, Lucide Icons for UI
- **Gamification**: Points, rewards, missions, and badges are core features (see `rewards`, `missions`, `gamification` modules)
- **Prisma Migrations**: Backend DB schema in `prisma/schema.prisma`, migrations in `prisma/migrations/`
- **API Structure**: NestJS modules (e.g., `src/wallet/`, `src/users/`), controllers for endpoints, services for business logic

## Integration Points

- **Supabase**: Used for auth and data in frontend/admin
- **Prisma**: Used for backend DB access
- **External APIs**: Payment, QR code, notifications (see respective service files)

## Conventions & Tips

- **TypeScript everywhere**: Strict types, shared types in `types/` folders
- **Tailwind CSS**: For all styling, utility-first
- **React Context**: For global state (auth, dashboard)
- **Testing**: Use Jest (NestJS default) for backend
- **Env files**: Never commit secrets; document required keys in README
- **Contribution**: Open PRs/issues per app, follow modular structure

## Example: Adding a Wallet Feature

- Backend: Add service/controller in `dinarus-backend/src/wallet/`
- Frontend: Add page/component in `dinarus/app/wallet/`
- Update types in `types/wallet.ts`
- Document endpoints and usage in README

---

For more details, see the individual `README.md` files in each app folder.
