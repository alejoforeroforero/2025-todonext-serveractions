# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment

- **Production**: https://todonext.alejoforero.com
- **Platform**: Vercel
- **Database**: Neon PostgreSQL

## Commands

```bash
npm run dev          # Start dev server with Turbopack (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
```

### Prisma Commands

```bash
npx prisma generate  # Generate Prisma Client (runs automatically on npm install)
npx prisma migrate dev --name <migration_name>  # Create and apply migration
npx prisma db push   # Push schema changes without migration
npx prisma studio    # Open Prisma Studio GUI
```

## Architecture

This is a Next.js 16 Todo app using Server Actions for data mutations.

### Key Patterns

- **Server Actions** (`src/actions/`): All data mutations use Server Actions with `'use server'` directive. Actions receive `FormData` and use `revalidatePath` for cache invalidation.
- **Authentication**: NextAuth v4 with JWT strategy, supporting Google OAuth and credentials. Session includes custom `roles` and `id` fields.
- **State Management**: Zustand stores (`src/store/Store.tsx`) manage edit mode state for todos and categories.
- **Database**: PostgreSQL with Prisma ORM. Client generated to `src/generated/prisma/`.

### Data Model

- **User**: Has roles array, todos, and categories
- **Todo**: Belongs to user, has many-to-many with categories
- **Category**: Belongs to user, has slug for URL-friendly access, many-to-many with todos

### Environment Variables Required

```
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```
