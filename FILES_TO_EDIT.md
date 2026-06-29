# Files to Edit for Sprint 12

This list identifies the primary files that are likely to be required for Sprint 12 implementation work. The focus is on files that already participate in the current workspace, subscription, team, portal, automation, and notification flows.

## 1. Core application routing and app shell

| File path                             | Purpose                                                                   | Dependencies                                         | Claude should modify it? |
| ------------------------------------- | ------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------------ |
| apps/web/src/app/router.tsx           | Route registration for protected, auth, portal, and invite paths          | App layout components, feature pages, ProtectedRoute | Yes                      |
| apps/web/src/app/providers.tsx        | Global providers such as query client, toast, workspace, and subscription | Hooks and context providers                          | Possibly                 |
| apps/web/src/layouts/AppLayout.tsx    | Main app shell and navigation context                                     | Shared components and route-aware UI                 | Read only                |
| apps/web/src/layouts/PortalLayout.tsx | Portal-specific layout                                                    | Portal pages and shared UI                           | Read only                |

## 2. Authentication and session state

| File path                                         | Purpose                                               | Dependencies                           | Claude should modify it? |
| ------------------------------------------------- | ----------------------------------------------------- | -------------------------------------- | ------------------------ |
| apps/web/src/lib/supabase.ts                      | Supabase client initialization                        | Environment variables and app services | Read only                |
| apps/web/src/services/auth.service.ts             | Auth service methods for login, signup, logout, OAuth | Supabase auth APIs                     | Possibly                 |
| apps/web/src/hooks/useAuth.ts                     | Session and auth state management                     | Auth service and query client          | Possibly                 |
| apps/web/src/components/common/ProtectedRoute.tsx | Protected route guard for authenticated users         | useAuth and router                     | Read only                |

## 3. Workspace and membership

| File path                                                                | Purpose                                                                  | Dependencies                                     | Claude should modify it? |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------ | ------------------------ |
| apps/web/src/services/workspace.service.ts                               | Workspace CRUD and member invite logic                                   | Supabase workspaces and workspace_members tables | Yes                      |
| apps/web/src/hooks/useWorkspace.tsx                                      | Workspace context and active workspace selection                         | Workspace service and auth                       | Yes                      |
| apps/web/src/features/team/pages/TeamPage.tsx                            | Team/member management UI                                                | Workspace hooks and team components              | Yes                      |
| apps/web/src/features/team/pages/InviteMemberModal.tsx                   | Invite modal and invite submission                                       | Workspace service                                | Yes                      |
| apps/web/src/features/team/pages/AcceptInvitePage.tsx                    | Invite acceptance page                                                   | Workspace service and auth state                 | Yes                      |
| supabase/migrations/20260629000004_sprint11_workspaces_subscriptions.sql | Workspace, membership, subscription, billing, usage, and feedback schema | Supabase deployment                              | Possibly                 |

## 4. Subscription, usage, and billing

| File path                                           | Purpose                                           | Dependencies                                    | Claude should modify it? |
| --------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------- | ------------------------ |
| apps/web/src/services/subscription.service.ts       | Plan limits, usage enforcement, and billing logic | Supabase subscriptions and usage_metrics tables | Yes                      |
| apps/web/src/hooks/useSubscription.tsx              | Subscription context and plan-gating UI           | Subscription service and other feature hooks    | Yes                      |
| apps/web/src/services/usage.service.ts              | Monthly usage metric helpers                      | Supabase usage_metrics table                    | Possibly                 |
| apps/web/src/components/common/UsageLimitGuard.tsx  | UI guard for feature limits                       | useSubscription                                 | Read only                |
| apps/web/src/features/billing/pages/BillingPage.tsx | Billing-related UI                                | Subscription and billing services               | Read only                |

## 5. Notifications, automation, and audit

| File path                                     | Purpose                                       | Dependencies                                    | Claude should modify it? |
| --------------------------------------------- | --------------------------------------------- | ----------------------------------------------- | ------------------------ |
| apps/web/src/services/notification.service.ts | Notification CRUD                             | Supabase notifications table                    | Possibly                 |
| apps/web/src/hooks/useNotifications.ts        | Notification state and polling                | Notification service                            | Possibly                 |
| apps/web/src/services/automation.service.ts   | Rule evaluation and action execution          | Notification service, Supabase automation_rules | Yes                      |
| apps/web/src/services/audit.service.ts        | Audit log emission and automation integration | Supabase audit_logs, automation engine          | Yes                      |
| apps/web/src/services/job.service.ts          | Job queue abstraction                         | Supabase job_queue table                        | Read only                |

## 6. Portal and client-facing flow

| File path                                                      | Purpose                                | Dependencies                            | Claude should modify it? |
| -------------------------------------------------------------- | -------------------------------------- | --------------------------------------- | ------------------------ |
| apps/web/src/services/portal.service.ts                        | Portal token and portal access service | Supabase portal_tokens and auth         | Yes                      |
| apps/web/src/features/portal/pages/PortalDashboardPage.tsx     | Client portal UI                       | Portal service and related feature data | Yes                      |
| apps/web/src/features/portal/types/portal.ts                   | Portal types                           | Portal service                          | Read only                |
| apps/web/src/features/portal/components/PortalProposalView.tsx | Portal proposal display                | Portal data and proposal types          | Read only                |

## 7. AI and follow-up modules

| File path                                                | Purpose                         | Dependencies                         | Claude should modify it? |
| -------------------------------------------------------- | ------------------------------- | ------------------------------------ | ------------------------ |
| apps/web/src/hooks/useAIAssistant.ts                     | AI assistant state and behavior | AI service and UI                    | Possibly                 |
| apps/web/src/hooks/useAIService.ts                       | AI service entry point          | AI provider factory                  | Possibly                 |
| apps/web/src/services/ai.service.ts                      | AI service abstraction          | AI provider factory                  | Possibly                 |
| apps/web/src/services/ai/AIFactory.ts                    | Provider selection              | AI provider implementations          | Possibly                 |
| apps/web/src/services/ai/MockAIProvider.ts               | Mock provider implementation    | No external provider                 | Possibly                 |
| apps/web/src/features/ai/pages/AIAssistantPage.tsx       | AI assistant page               | Assistant components and hooks       | Read only                |
| apps/web/src/features/ai/components/AIAssistantPanel.tsx | Assistant UI                    | AI hook                              | Read only                |
| apps/web/src/features/followup/pages/FollowUpPage.tsx    | Follow-up management UI         | Follow-up engine and client data     | Possibly                 |
| apps/web/src/features/followup/utils/followUpEngine.tsx  | Follow-up business logic        | Client/proposal/invoice domain types | Possibly                 |

## 8. Core business workflows

| File path                                                | Purpose                                   | Dependencies                              | Claude should modify it? |
| -------------------------------------------------------- | ----------------------------------------- | ----------------------------------------- | ------------------------ |
| apps/web/src/services/client.service.ts                  | Client CRUD and CRM helper actions        | Supabase clients table                    | Possibly                 |
| apps/web/src/hooks/useClients.ts                         | Client query and mutation state           | Client service and toast feedback         | Possibly                 |
| apps/web/src/services/project.service.ts                 | Project CRUD                              | Supabase projects table                   | Possibly                 |
| apps/web/src/hooks/useProjects.ts                        | Project query and mutation state          | Project service                           | Possibly                 |
| apps/web/src/services/proposal.service.ts                | Proposal CRUD                             | Supabase proposals table                  | Possibly                 |
| apps/web/src/hooks/useProposals.ts                       | Proposal query and mutation state         | Proposal service                          | Possibly                 |
| apps/web/src/services/invoice.service.ts                 | Invoice CRUD and audit logging            | Supabase invoices table and audit service | Yes                      |
| apps/web/src/hooks/useInvoices.ts                        | Invoice query and mutation state          | Invoice service                           | Yes                      |
| apps/web/src/features/invoices/types/invoice.ts          | Invoice status model and transition rules | Invoice UI and service                    | Read only                |
| apps/web/src/features/invoices/utils/overdueDetection.ts | Overdue status logic                      | Invoice status types                      | Read only                |
