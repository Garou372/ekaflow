# Sprint 12 Implementation Plan

This plan breaks Sprint 12 into small milestones that follow the current architecture and stay within the existing feature/service/hook structure.

## Milestone 1: Stabilize authentication and route access

- Goal
  - Ensure authentication state, protected routing, and session refresh behave consistently across the app.

- Files to modify
  - [apps/web/src/app/router.tsx](apps/web/src/app/router.tsx)
  - [apps/web/src/app/providers.tsx](apps/web/src/app/providers.tsx)
  - [apps/web/src/hooks/useAuth.ts](apps/web/src/hooks/useAuth.ts)
  - [apps/web/src/services/auth.service.ts](apps/web/src/services/auth.service.ts)
  - [apps/web/src/components/common/ProtectedRoute.tsx](apps/web/src/components/common/ProtectedRoute.tsx)

- Dependencies
  - Supabase Auth
  - Current app layout and route structure
  - Query client and toast providers

- Expected outcome
  - Users are routed correctly based on authentication state, and auth-related edge cases do not break the app shell.

## Milestone 2: Complete workspace and member lifecycle flows

- Goal
  - Make workspace creation, switching, and membership invitation/acceptance reliable and aligned with the current schema.

- Files to modify
  - [apps/web/src/services/workspace.service.ts](apps/web/src/services/workspace.service.ts)
  - [apps/web/src/hooks/useWorkspace.tsx](apps/web/src/hooks/useWorkspace.tsx)
  - [apps/web/src/features/team/pages/TeamPage.tsx](apps/web/src/features/team/pages/TeamPage.tsx)
  - [apps/web/src/features/team/pages/InviteMemberModal.tsx](apps/web/src/features/team/pages/InviteMemberModal.tsx)
  - [apps/web/src/features/team/pages/AcceptInvitePage.tsx](apps/web/src/features/team/pages/AcceptInvitePage.tsx)
  - [supabase/migrations/20260629000004_sprint11_workspaces_subscriptions.sql](supabase/migrations/20260629000004_sprint11_workspaces_subscriptions.sql)

- Dependencies
  - Workspaces and workspace_members tables
  - Auth state and current user context
  - Team-related UI components

- Expected outcome
  - Workspace selection, creation, and member invitation flows work end to end without schema or permission mismatches.

## Milestone 3: Harden subscription and usage enforcement

- Goal
  - Make plan limits and usage tracking consistent across the app so protected actions behave predictably.

- Files to modify
  - [apps/web/src/services/subscription.service.ts](apps/web/src/services/subscription.service.ts)
  - [apps/web/src/hooks/useSubscription.tsx](apps/web/src/hooks/useSubscription.tsx)
  - [apps/web/src/services/usage.service.ts](apps/web/src/services/usage.service.ts)
  - [apps/web/src/components/common/UsageLimitGuard.tsx](apps/web/src/components/common/UsageLimitGuard.tsx)

- Dependencies
  - subscriptions table
  - usage_metrics table
  - Existing feature hooks for clients, projects, invoices, and proposals

- Expected outcome
  - Users are correctly allowed or blocked from actions based on plan limits and current monthly usage.

## Milestone 4: Finish portal and invite access experience

- Goal
  - Ensure portal and invite-based entry points are accessible and behave correctly for authenticated and unauthenticated users.

- Files to modify
  - [apps/web/src/services/portal.service.ts](apps/web/src/services/portal.service.ts)
  - [apps/web/src/features/portal/pages/PortalDashboardPage.tsx](apps/web/src/features/portal/pages/PortalDashboardPage.tsx)
  - [apps/web/src/features/portal/components/PortalProposalView.tsx](apps/web/src/features/portal/components/PortalProposalView.tsx)
  - [apps/web/src/features/team/pages/AcceptInvitePage.tsx](apps/web/src/features/team/pages/AcceptInvitePage.tsx)

- Dependencies
  - Portal token handling
  - Auth flow and route configuration
  - Portal-related UI and proposal/invoice data

- Expected outcome
  - Portal access and invite acceptance flows work reliably with clear handling for invalid, expired, or already-used tokens.

## Milestone 5: Wire automation, notifications, and audit trail end to end

- Goal
  - Ensure that audited business actions produce safe automation outputs and notifications without breaking the main workflows.

- Files to modify
  - [apps/web/src/services/audit.service.ts](apps/web/src/services/audit.service.ts)
  - [apps/web/src/services/automation.service.ts](apps/web/src/services/automation.service.ts)
  - [apps/web/src/services/notification.service.ts](apps/web/src/services/notification.service.ts)
  - [apps/web/src/hooks/useNotifications.ts](apps/web/src/hooks/useNotifications.ts)
  - [apps/web/src/services/invoice.service.ts](apps/web/src/services/invoice.service.ts)

- Dependencies
  - audit_logs table
  - automation_rules table
  - notifications table
  - Existing invoice and business action flows

- Expected outcome
  - Key actions emit audit logs, trigger automation rules safely, and create notifications without causing runtime failures.

## Milestone 6: Tighten core workflow integrity for clients, projects, proposals, and invoices

- Goal
  - Keep the main business flows consistent by aligning CRUD behavior, status transitions, and related UI state.

- Files to modify
  - [apps/web/src/services/client.service.ts](apps/web/src/services/client.service.ts)
  - [apps/web/src/hooks/useClients.ts](apps/web/src/hooks/useClients.ts)
  - [apps/web/src/services/project.service.ts](apps/web/src/services/project.service.ts)
  - [apps/web/src/hooks/useProjects.ts](apps/web/src/hooks/useProjects.ts)
  - [apps/web/src/services/proposal.service.ts](apps/web/src/services/proposal.service.ts)
  - [apps/web/src/hooks/useProposals.ts](apps/web/src/hooks/useProposals.ts)
  - [apps/web/src/services/invoice.service.ts](apps/web/src/services/invoice.service.ts)
  - [apps/web/src/hooks/useInvoices.ts](apps/web/src/hooks/useInvoices.ts)
  - [apps/web/src/features/invoices/types/invoice.ts](apps/web/src/features/invoices/types/invoice.ts)
  - [apps/web/src/features/invoices/utils/overdueDetection.ts](apps/web/src/features/invoices/utils/overdueDetection.ts)

- Dependencies
  - Existing client, project, proposal, and invoice domain models
  - Supabase tables for those entities
  - Invoice lifecycle rules and overdue logic

- Expected outcome
  - Core business records remain consistent across create, edit, delete, and status change operations.

## Milestone 7: Improve AI, follow-up, and admin scaffolding without changing the product direction

- Goal
  - Make the existing AI, follow-up, and admin modules less fragile by aligning them with the same service and hook patterns used elsewhere in the app.

- Files to modify
  - [apps/web/src/hooks/useAIAssistant.ts](apps/web/src/hooks/useAIAssistant.ts)
  - [apps/web/src/hooks/useAIService.ts](apps/web/src/hooks/useAIService.ts)
  - [apps/web/src/services/ai.service.ts](apps/web/src/services/ai.service.ts)
  - [apps/web/src/services/ai/AIFactory.ts](apps/web/src/services/ai/AIFactory.ts)
  - [apps/web/src/services/ai/MockAIProvider.ts](apps/web/src/services/ai/MockAIProvider.ts)
  - [apps/web/src/features/followup/pages/FollowUpPage.tsx](apps/web/src/features/followup/pages/FollowUpPage.tsx)
  - [apps/web/src/features/followup/utils/followUpEngine.tsx](apps/web/src/features/followup/utils/followUpEngine.tsx)
  - [apps/web/src/features/admin/pages/AdminPage.tsx](apps/web/src/features/admin/pages/AdminPage.tsx)

- Dependencies
  - Existing AI and follow-up UI modules
  - Current service abstractions and mocked providers
  - Admin page data sources

- Expected outcome
  - AI and follow-up flows no longer rely on brittle assumptions, and the admin experience remains stable under the current implementation model.

## Milestone 8: Integration validation and release readiness

- Goal
  - Validate the end-to-end experience for Sprint 12 and ensure the app remains stable across auth, workspaces, billing, portal, and workflow features.

- Files to modify
  - Documentation and handoff notes only, if required
  - No product feature files are expected to change unless validation reveals a defect

- Dependencies
  - All previously completed milestones
  - Local environment and Supabase-backed test data

- Expected outcome
  - Sprint 12 is ready for implementation handoff, with clear evidence that the major paths work together without regressions.
