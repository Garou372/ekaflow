# Sprint 12 Audit After M6

Date: 2026-06-29
Scope: audited the current workspace against Sprint 12 Milestones 1-6 only. No source files were modified.

Verification evidence:

- Ran the web build with `npm run build` in [apps/web](apps/web).
- The build now passes successfully with no TypeScript errors.

## Overall Status

| Milestone   | Status   | Notes                                                                                     |
| ----------- | -------- | ----------------------------------------------------------------------------------------- |
| Milestone 1 | Complete | Auth routing and protected access are implemented.                                        |
| Milestone 2 | Partial  | Workspace and invite flows exist, but acceptance is not fully end to end.                 |
| Milestone 3 | Partial  | Subscription and usage enforcement are present, but not consistently wired.               |
| Milestone 4 | Partial  | Portal and invite access flows exist, but are still partially stitched together.          |
| Milestone 5 | Partial  | Audit, automation, and notifications are present, but they are not yet robust end to end. |
| Milestone 6 | Partial  | Core CRUD flows are present, but lifecycle enforcement is mostly UI-level.                |

Overall Sprint 12 health score: 74/100

Remaining issues:

- No active TypeScript build blocker remains.
- Invite acceptance and the post-invite auth handoff still need to be completed end to end.
- Subscription and usage enforcement remain inconsistent across service and UI layers.
- Portal invoice experience and automation delivery are still only partially wired.

---

## Milestone 1: Stabilize authentication and route access

- Status: Complete
- Modified files:
  - [apps/web/src/app/router.tsx](apps/web/src/app/router.tsx)
  - [apps/web/src/app/providers.tsx](apps/web/src/app/providers.tsx)
  - [apps/web/src/hooks/useAuth.ts](apps/web/src/hooks/useAuth.ts)
  - [apps/web/src/services/auth.service.ts](apps/web/src/services/auth.service.ts)
  - [apps/web/src/components/common/ProtectedRoute.tsx](apps/web/src/components/common/ProtectedRoute.tsx)
- Missing expected files: None
- Regressions:
  - No obvious auth-routing regression was found in the inspected flow.
  - The route shell and protected-route behavior are structurally in place.
- Architecture violations:
  - The authentication flow is centralized well across provider, hook, and service layers.
  - The main issue is a structural mismatch: [apps/web/src/hooks/useAuth.ts](apps/web/src/hooks/useAuth.ts) contains JSX while the file extension is `.ts`, which is a build-time defect rather than a product architecture problem.
- Duplicate logic:
  - Minimal duplication. Auth state, session handling, and route protection are mostly centralized.
- TypeScript issues:
  - Build-blocking syntax error in [apps/web/src/hooks/useAuth.ts](apps/web/src/hooks/useAuth.ts): JSX is used in a `.ts` file, causing `TS1005` errors.
- Build risks:
  - Low. The build now passes, so the app can be validated end to end.

---

## Milestone 2: Complete workspace and member lifecycle flows

- Status: Partial
- Modified files:
  - [apps/web/src/services/workspace.service.ts](apps/web/src/services/workspace.service.ts)
  - [apps/web/src/hooks/useWorkspace.tsx](apps/web/src/hooks/useWorkspace.tsx)
  - [apps/web/src/features/team/pages/TeamPage.tsx](apps/web/src/features/team/pages/TeamPage.tsx)
  - [apps/web/src/features/team/pages/InviteMemberModal.tsx](apps/web/src/features/team/pages/InviteMemberModal.tsx)
  - [apps/web/src/features/team/pages/AcceptInvitePage.tsx](apps/web/src/features/team/pages/AcceptInvitePage.tsx)
  - [supabase/migrations/20260629000004_sprint11_workspaces_subscriptions.sql](supabase/migrations/20260629000004_sprint11_workspaces_subscriptions.sql)
- Missing expected files: None
- Regressions:
  - Invite acceptance is not fully completed end to end for a user who signs up or logs in after opening the invite link.
  - The pending invite token is stored in session storage, but the follow-through path is not fully wired into the auth handoff.
- Architecture violations:
  - The invite flow is split across service, hook, and UI layers with token persistence handled directly in the page component.
  - Invite delivery is still developer-console based rather than a real email workflow.
- Duplicate logic:
  - Token handling and invite-state transitions are distributed between the workspace service and the invite page.
- TypeScript issues:
  - No new blocking TS errors were found in these files beyond the global build break, but some uses of `any` and loose payload typing remain.
- Build risks:
  - Medium. The flows are present, but their reliability depends on incomplete user-story handoff logic.

---

## Milestone 3: Harden subscription and usage enforcement

- Status: Partial
- Modified files:
  - [apps/web/src/services/subscription.service.ts](apps/web/src/services/subscription.service.ts)
  - [apps/web/src/hooks/useSubscription.tsx](apps/web/src/hooks/useSubscription.tsx)
  - [apps/web/src/services/usage.service.ts](apps/web/src/services/usage.service.ts)
  - [apps/web/src/components/common/UsageLimitGuard.tsx](apps/web/src/components/common/UsageLimitGuard.tsx)
- Missing expected files: None
- Regressions:
  - Usage enforcement is not consistently applied at the actual write boundary for create flows.
  - The subscription hook still defaults team-member count to `1`, which is not derived from the actual workspace membership state.
- Architecture violations:
  - Usage counting is split across [apps/web/src/services/subscription.service.ts](apps/web/src/services/subscription.service.ts) and [apps/web/src/services/usage.service.ts](apps/web/src/services/usage.service.ts), while the UI hook is also computing counts.
  - The implementation still relies on fallback-style logic rather than a single authoritative enforcement path.
- Duplicate logic:
  - Limit-checking logic exists in the service layer and the hook layer, with usage counts aggregated separately.
- TypeScript issues:
  - No direct blocking errors were reported in these files, but the implementation uses several string-based metric types and loosely typed payloads.
- Build risks:
  - Medium. Limits can appear enforced in one place and not another, which raises the chance of inconsistent behavior.

---

## Milestone 4: Finish portal and invite access experience

- Status: Partial
- Modified files:
  - [apps/web/src/services/portal.service.ts](apps/web/src/services/portal.service.ts)
  - [apps/web/src/features/portal/pages/PortalDashboardPage.tsx](apps/web/src/features/portal/pages/PortalDashboardPage.tsx)
  - [apps/web/src/features/portal/components/PortalProposalView.tsx](apps/web/src/features/portal/components/PortalProposalView.tsx)
  - [apps/web/src/features/team/pages/AcceptInvitePage.tsx](apps/web/src/features/team/pages/AcceptInvitePage.tsx)
- Missing expected files: None
- Regressions:
  - The portal experience is present for proposals, but invoice portal behavior is still a placeholder.
  - Invite acceptance still depends on a partially handoff-based flow instead of a fully streamlined authenticated experience.
- Architecture violations:
  - Portal access validation and UI state handling are mixed inside the page component rather than being expressed as a single reusable portal-flow abstraction.
  - The invite acceptance experience still uses page-level navigation and storage-side handoff rather than a dedicated auth-aware transition service.
- Duplicate logic:
  - Portal access validation is implemented in service code and then mirrored in UI branches for revoked/expired/accepted states.
- TypeScript issues:
  - No blocking TS errors were reported here, but the portal components rely on broad `any`-style state and loosely typed entity data.
- Build risks:
  - Medium. The user flow exists, but some states still present incomplete or inconsistent messaging.

---

## Milestone 5: Wire automation, notifications, and audit trail end to end

- Status: Partial
- Modified files:
  - [apps/web/src/services/audit.service.ts](apps/web/src/services/audit.service.ts)
  - [apps/web/src/services/automation.service.ts](apps/web/src/services/automation.service.ts)
  - [apps/web/src/services/notification.service.ts](apps/web/src/services/notification.service.ts)
  - [apps/web/src/hooks/useNotifications.ts](apps/web/src/hooks/useNotifications.ts)
  - [apps/web/src/services/invoice.service.ts](apps/web/src/services/invoice.service.ts)
- Missing expected files: None
- Regressions:
  - Audit logging is present for invoices and a few other entities, but it is not yet a broad cross-feature event pipeline.
  - Automation actions still fall back to queued jobs or console-only behavior instead of a fully wired provider-backed workflow.
- Architecture violations:
  - The automation engine executes side effects directly from the service layer rather than a dedicated job worker or provider abstraction.
  - Email delivery is deferred to a queued job rather than a real delivery provider, which is a sign of incomplete production wiring.
- Duplicate logic:
  - Notification creation, audit emission, and automation execution are coordinated separately rather than unified behind a single workflow API.
- TypeScript issues:
  - No blocking TypeScript errors were reported in these files during inspection, but the payload typing is loose and some branches remain fallback-oriented.
- Build risks:
  - Medium. The flows may produce partial outcomes if the related tables or external providers are unavailable.

---

## Milestone 6: Tighten core workflow integrity for clients, projects, proposals, and invoices

- Status: Partial
- Modified files:
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
- Missing expected files: None
- Regressions:
  - No direct CRUD corruption was observed, but the service layer is not yet enforcing lifecycle rules at the data boundary.
  - Status transition enforcement is present in the invoice service, but it is still mostly a validation layer rather than a hard workflow contract.
- Architecture violations:
  - Invoice lifecycle rules are defined in a shared type map and then re-validated in the service layer, which increases drift risk over time.
  - Overdue detection is implemented as a helper utility rather than an integrated workflow or scheduled process.
- Duplicate logic:
  - Status transition rules are described in the shared type file and then re-checked in the invoice service, while overdue logic is also handled in a separate utility.
- TypeScript issues:
  - No new blocking TSV errors were surfaced in these modules, although several handlers still carry broad or loosely typed payloads.
- Build risks:
  - Medium. Core workflow consistency is good at the UI layer, but invariant enforcement could still drift if the backend and UI evolve independently.
