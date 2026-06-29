# Sprint 12 Dependency Map

This document summarizes the existing relationships between the main application layers and the data sources that matter for Sprint 12.

## 1. Authentication and routing

### Key relationships

- The router depends on the auth guard and the app/auth layouts.
- The auth guard depends on the auth hook.
- The auth hook depends on the auth service.
- The auth service depends on the Supabase client.

### Relevant files

- apps/web/src/app/router.tsx
- apps/web/src/components/common/ProtectedRoute.tsx
- apps/web/src/hooks/useAuth.ts
- apps/web/src/services/auth.service.ts
- apps/web/src/lib/supabase.ts

### Related data

- Supabase Auth session and user state
- Auth callback route handling

## 2. Workspace and membership flow

### Key relationships

- The workspace provider depends on the workspace service and auth state.
- The workspace service reads and writes workspace and workspace_members data.
- Team pages depend on the workspace service and the current user context.
- Invite acceptance depends on the member token and auth state.

### Relevant files

- apps/web/src/hooks/useWorkspace.tsx
- apps/web/src/services/workspace.service.ts
- apps/web/src/features/team/pages/TeamPage.tsx
- apps/web/src/features/team/pages/InviteMemberModal.tsx
- apps/web/src/features/team/pages/AcceptInvitePage.tsx

### Related tables

- workspaces
- workspace_members

## 3. Subscription, usage, and gating

### Key relationships

- The subscription provider depends on the subscription service, client/project/invoice/proposal hooks, and toast feedback.
- The subscription service reads plan and usage information from Supabase.
- Usage-related actions are used to enforce monthly limits.
- Feature pages use the usage limit guard to block or allow actions.

### Relevant files

- apps/web/src/hooks/useSubscription.tsx
- apps/web/src/services/subscription.service.ts
- apps/web/src/services/usage.service.ts
- apps/web/src/components/common/UsageLimitGuard.tsx

### Related tables

- subscriptions
- usage_metrics
- billing_history
- feedback

## 4. Core business entities

### Clients

- Client pages depend on the client hook and client service.
- Client service reads and writes the clients table.
- Invoices and follow-up logic may depend on client data.

### Projects

- Projects depend on the project hook and project service.
- Projects are used by invoices and workspace-related workflows.

### Proposals

- Proposal pages depend on the proposal hook and proposal service.
- Proposal state helps drive invoice and follow-up flows.

### Invoices

- Invoice pages depend on the invoice hook and invoice service.
- Invoice service writes to the invoices table and emits audit logs.
- Invoice status changes drive overdue and payment-related behavior.

### Related files

- apps/web/src/services/client.service.ts
- apps/web/src/hooks/useClients.ts
- apps/web/src/services/project.service.ts
- apps/web/src/hooks/useProjects.ts
- apps/web/src/services/proposal.service.ts
- apps/web/src/hooks/useProposals.ts
- apps/web/src/services/invoice.service.ts
- apps/web/src/hooks/useInvoices.ts

### Related tables

- clients
- projects
- proposals
- invoices

## 5. Notifications, automation, and audit

### Key relationships

- The audit service logs changes and then emits an event into the automation engine.
- The automation engine evaluates rules and creates notifications or job actions.
- The notification service persists notification records.
- UI hooks poll or mutate notification state.

### Relevant files

- apps/web/src/services/audit.service.ts
- apps/web/src/services/automation.service.ts
- apps/web/src/services/notification.service.ts
- apps/web/src/hooks/useNotifications.ts

### Related tables

- audit_logs
- automation_rules
- notifications
- job_queue

## 6. Portal flow

### Key relationships

- Portal pages depend on the portal service.
- Portal service depends on Supabase tables for portal tokens and related entities.
- Portal views may reference proposal or invoice data depending on the token context.

### Relevant files

- apps/web/src/services/portal.service.ts
- apps/web/src/features/portal/pages/PortalDashboardPage.tsx
- apps/web/src/features/portal/components/PortalProposalView.tsx

### Related tables

- portal_tokens

## 7. AI and follow-up support

### Key relationships

- AI UI pages depend on hooks built around AI service abstractions.
- AI services use provider factories and a mock provider in the current implementation.
- Follow-up logic depends on client, proposal, and invoice data already available in the app.

### Relevant files

- apps/web/src/hooks/useAIAssistant.ts
- apps/web/src/hooks/useAIService.ts
- apps/web/src/services/ai.service.ts
- apps/web/src/services/ai/AIFactory.ts
- apps/web/src/services/ai/MockAIProvider.ts
- apps/web/src/features/followup/pages/FollowUpPage.tsx
- apps/web/src/features/followup/utils/followUpEngine.tsx

## 8. External APIs and runtime dependencies

Sprint 12 work should expect these runtime dependencies:

- Supabase Auth for identity and session management
- Supabase Postgres for data persistence
- Supabase Row-Level Security for data access rules
- Browser-based routing through React Router
- TanStack Query for server-state synchronization
- UI feedback via toast and loading states

## 9. Implementation guidance for another AI

When implementing Sprint 12, preserve this dependency chain:

1. UI page or feature component
2. Hook or local state
3. Service module
4. Supabase table or RPC
5. Optional audit/automation/notification emission

This preserves the existing architecture and makes it easier to reason about each change without creating parallel data paths.
