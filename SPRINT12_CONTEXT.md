# Sprint 12 Context

## 1. Current implementation status

The workspace already contains a broad set of features and infrastructure for a modern freelancer workflow platform. The current app includes:

- Authentication and protected routing
- Client management with CRM-style fields
- Project management
- Proposal and invoice workflows
- Billing and subscription concepts
- Workspace membership and subscription-related tables
- Notifications, automation, audit, and feedback infrastructure
- Portal, team invite, follow-up, goals, and AI-related UI modules

The implementation is partially complete in several areas. Some flows are wired end-to-end, while others rely on placeholders, mock providers, or scaffolding that still needs hardening.

## 2. Sprint 12 objectives

There is no formal Sprint 12 backlog file in the repository. Based on the existing implementation, Sprint 12 should focus on completing and hardening the functionality already introduced in the following areas:

- Workspace-aware application behavior and membership flows
- Subscription and usage-limit enforcement
- Team/invite/portal-related flows
- Automation and notification pathways that are already scaffolded
- AI and follow-up-oriented modules where UI exists but service integration may be incomplete

The implementation should stay within the existing architecture and avoid introducing a new platform structure.

## 3. Existing business logic

The current codebase already encodes several business rules:

- Invoice lifecycle states: draft, sent, paid, overdue, cancelled
- Proposal lifecycle states: draft, sent, accepted, rejected
- Client priorities and follow-up tracking
- Subscription plan limits for clients, projects, invoices, proposals, AI usage, team members, portal access, and automation access
- Notification creation and read/unread state
- Audit logging for invoice create/update/delete actions
- Usage metrics tracking for monthly limits

## 4. Missing functionality

The repository contains clear signs of unfinished or partial implementation. These areas are the most relevant for Sprint 12 planning:

- Some modules are present in the UI but are not fully connected to production-ready services
- AI-related providers are currently mock-based rather than production-backed
- Email delivery appears to be mock-based rather than integrated with a real provider
- Admin reporting uses a view and mocked values in places
- Usage accounting and subscription enforcement are present but may still rely on fallback logic
- Workspace/member flows are scaffolded but should be validated against the actual Supabase schema and RLS rules
- Portal and invite acceptance flows require correct token handling and auth state management

## 5. Constraints

Any Sprint 12 work must respect the current constraints:

- Do not redesign the app structure
- Keep the feature-based organization intact
- Use the existing hooks, services, and context providers where possible
- Respect the current Supabase schema and migration conventions
- Preserve existing naming and type patterns
- Avoid introducing architecture that conflicts with the current React Query + Supabase model
- Keep the implementation aligned with the documented product intent for a freelancer workflow product

## 6. Edge cases

The implementation should account for these edge cases:

- User is not authenticated but visits a protected route
- Subscription record does not yet exist for a new user
- Subscription is inactive or past due
- Invoice or proposal creation exceeds plan limits
- Invite token is invalid, expired, or already accepted
- Workspace member invitation is sent to an email that is already associated with another account
- Notification creation fails or the notification table is unavailable
- Usage metric upsert logic needs to handle missing rows and repeated writes safely
- Invoice status transitions must stay within the supported state graph
- Overdue invoice detection should run on invoices that are still in a sent state

## 7. Acceptance criteria

Sprint 12 should be considered complete when the following are true:

- Core workflows remain intact: auth, clients, projects, proposals, invoices, and settings
- Workspace-related flows work consistently with the current Supabase schema
- Subscription and usage-limit checks are applied without breaking the main user journey
- Team invite and portal access flows are usable under the current auth model
- Automation and notification flows do not crash when rules or tables are missing or incomplete
- UI remains consistent with the existing design system and component conventions
- Any new behavior or bug fix is covered by the same service/hook pattern already present in the codebase
