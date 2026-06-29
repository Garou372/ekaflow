# EkaFlow Project Summary

## 1. Overall architecture

EkaFlow is a React + TypeScript web application for managing the freelancer client workflow from proposal to payment. The current implementation is organized as a feature-based frontend application backed by Supabase for persistence, auth, and row-level security.

The codebase is split into:

- App shell and routing in the web app
- Feature modules for business workflows
- Shared hooks and services for data access and mutations
- Supabase client and migration-based database schema
- Documentation and architecture notes for product and engineering direction

The app follows a conventional layered approach:

1. UI layer: pages and components
2. State layer: React Query hooks and local component state
3. Service layer: Supabase-backed helpers
4. Data layer: Supabase tables and migrations
5. Supporting layer: utilities, audit, automation, notifications, and subscriptions

## 2. Folder structure

```text
apps/web/src/
  app/                 # App bootstrap, providers, router
  components/          # Shared UI components
  features/            # Feature modules (auth, clients, invoices, projects, etc.)
  hooks/               # Reusable hooks around queries and mutations
  layouts/             # Layout wrappers for auth/app/portal routes
  lib/                 # Supabase and query client setup
  services/            # API/service abstractions for Supabase
  styles/              # Global CSS and design tokens
  types/               # Shared TypeScript types
  utils/               # Utility functions

docs/                  # Product and architecture documentation
supabase/migrations/   # Database schema changes and rollout scripts
packages/              # Workspace package scaffolding
```

## 3. Tech stack

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS
- Framer Motion
- Lucide React
- Zod and React Hook Form (used in form validation and data handling)

### Backend/data

- Supabase
- Postgres via Supabase
- Row-level security policies
- Auth via Supabase Auth

### Tooling

- ESLint
- Vite build pipeline
- TypeScript compiler

## 4. Authentication flow

Authentication is handled through Supabase Auth.

Current flow:

1. The app initializes a Supabase client in the web app.
2. The auth hook loads the current session and user on startup.
3. Auth state changes are subscribed to via the Supabase auth listener.
4. Protected routes require an active session.
5. Login, signup, and OAuth login are routed through auth services.
6. Logout clears the client session and query cache.

Relevant files:

- apps/web/src/lib/supabase.ts
- apps/web/src/services/auth.service.ts
- apps/web/src/hooks/useAuth.ts
- apps/web/src/features/auth/pages/LoginPage.tsx
- apps/web/src/features/auth/pages/SignupPage.tsx
- apps/web/src/features/auth/pages/AuthCallbackPage.tsx

## 5. Data flow

The app uses a service-driven flow:

1. Pages and components call hooks.
2. Hooks run React Query mutations/queries.
3. Hooks delegate to service modules.
4. Service modules call Supabase methods.
5. Data is returned and normalized into app-facing types.
6. Query invalidation and toast feedback keep the UI synchronized.

Typical data path example:

- Client page -> useClients -> client.service -> Supabase clients table
- Invoice page -> useInvoices -> invoice.service -> Supabase invoices table
- Proposal page -> useProposals -> proposal.service -> Supabase proposals table

## 6. State management

State is managed through a combination of:

- React component state for UI state
- TanStack Query for server state and async data caching
- Context providers for cross-cutting concerns such as workspace and subscription state

Notable providers and hooks:

- WorkspaceProvider and useWorkspaceContext
- SubscriptionProvider and useSubscription
- Toast provider for feedback
- Auth hook for current user/session

## 7. Coding conventions

The codebase follows a few consistent patterns:

- Feature-based folder organization
- Hooks own query and mutation behavior
- Services are thin wrappers over Supabase operations
- Types are defined close to the domain they represent
- UI components are kept focused and reusable
- Shared business logic is extracted into utilities where possible
- Error handling is explicit and often surfaced through toast feedback
- Query invalidation is used to keep data fresh

Important conventions to preserve for Sprint 12:

- Keep changes inside the existing feature/service/hook structure
- Prefer extending existing services and hooks over introducing a new data layer
- Preserve existing naming patterns and Supabase field mapping conventions
- Keep domain types aligned with the database schema and current UI expectations
