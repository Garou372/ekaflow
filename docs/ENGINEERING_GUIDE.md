# EkaFlow Engineering Architecture

Version: 1.0
Status: Final
Owner: Engineering (Claude)
Stack: React + Vite + TypeScript + Supabase + TailwindCSS + shadcn/ui

---

# 1. Folder Structure

```
ekaflow/
├── public/
│   └── favicon.ico
│
├── src/
│   ├── app/                        # App bootstrap
│   │   ├── App.tsx                 # Root component, router setup
│   │   ├── router.tsx              # All route definitions
│   │   └── providers.tsx           # QueryClient, Auth, Toast providers
│   │
│   ├── features/                   # Feature-based modules (core of the app)
│   │   │
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── SignupForm.tsx
│   │   │   │   └── ForgotPasswordForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── auth.schema.ts
│   │   │   └── pages/
│   │   │       ├── LoginPage.tsx
│   │   │       ├── SignupPage.tsx
│   │   │       └── ForgotPasswordPage.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── components/
│   │   │   │   ├── RevenueCard.tsx
│   │   │   │   ├── PendingProposalsCard.tsx
│   │   │   │   ├── PendingInvoicesCard.tsx
│   │   │   │   ├── RecentActivity.tsx
│   │   │   │   └── QuickActions.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useDashboard.ts
│   │   │   ├── services/
│   │   │   │   └── dashboard.service.ts
│   │   │   └── pages/
│   │   │       └── DashboardPage.tsx
│   │   │
│   │   ├── clients/
│   │   │   ├── components/
│   │   │   │   ├── ClientForm.tsx
│   │   │   │   ├── ClientTable.tsx
│   │   │   │   ├── ClientCard.tsx
│   │   │   │   └── ClientSearch.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useClients.ts
│   │   │   │   └── useClient.ts
│   │   │   ├── services/
│   │   │   │   └── clients.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── client.schema.ts
│   │   │   └── pages/
│   │   │       ├── ClientsPage.tsx
│   │   │       └── ClientDetailPage.tsx
│   │   │
│   │   ├── engagements/
│   │   │   ├── components/
│   │   │   │   ├── EngagementForm.tsx
│   │   │   │   └── EngagementCard.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useEngagements.ts
│   │   │   ├── services/
│   │   │   │   └── engagements.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── engagement.schema.ts
│   │   │   └── pages/
│   │   │       └── EngagementDetailPage.tsx
│   │   │
│   │   ├── proposals/
│   │   │   ├── components/
│   │   │   │   ├── ProposalForm.tsx
│   │   │   │   ├── ProposalPreview.tsx
│   │   │   │   ├── ProposalTable.tsx
│   │   │   │   ├── LineItemsEditor.tsx
│   │   │   │   └── ProposalStatusBadge.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProposals.ts
│   │   │   │   └── useProposal.ts
│   │   │   ├── services/
│   │   │   │   └── proposals.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── proposal.schema.ts
│   │   │   ├── utils/
│   │   │   │   └── proposal.pdf.ts
│   │   │   └── pages/
│   │   │       ├── ProposalsPage.tsx
│   │   │       ├── CreateProposalPage.tsx
│   │   │       └── ProposalDetailPage.tsx
│   │   │
│   │   ├── contracts/
│   │   │   ├── components/
│   │   │   │   ├── ContractPreview.tsx
│   │   │   │   ├── ContractTable.tsx
│   │   │   │   ├── ContractStatusBadge.tsx
│   │   │   │   └── UploadSignedContract.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useContracts.ts
│   │   │   │   └── useContract.ts
│   │   │   ├── services/
│   │   │   │   └── contracts.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── contract.schema.ts
│   │   │   ├── utils/
│   │   │   │   ├── contract.template.ts
│   │   │   │   └── contract.pdf.ts
│   │   │   └── pages/
│   │   │       ├── ContractsPage.tsx
│   │   │       └── ContractDetailPage.tsx
│   │   │
│   │   ├── invoices/
│   │   │   ├── components/
│   │   │   │   ├── InvoiceForm.tsx
│   │   │   │   ├── InvoicePreview.tsx
│   │   │   │   ├── InvoiceTable.tsx
│   │   │   │   ├── InvoiceStatusBadge.tsx
│   │   │   │   ├── GSTCalculator.tsx
│   │   │   │   └── InvoiceLineItems.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useInvoices.ts
│   │   │   │   └── useInvoice.ts
│   │   │   ├── services/
│   │   │   │   └── invoices.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── invoice.schema.ts
│   │   │   ├── utils/
│   │   │   │   ├── invoice.pdf.ts
│   │   │   │   └── gst.calculator.ts
│   │   │   └── pages/
│   │   │       ├── InvoicesPage.tsx
│   │   │       ├── CreateInvoicePage.tsx
│   │   │       └── InvoiceDetailPage.tsx
│   │   │
│   │   ├── payments/
│   │   │   ├── components/
│   │   │   │   ├── RecordPaymentModal.tsx
│   │   │   │   ├── PaymentTable.tsx
│   │   │   │   └── PaymentStatusBadge.tsx
│   │   │   ├── hooks/
│   │   │   │   └── usePayments.ts
│   │   │   ├── services/
│   │   │   │   └── payments.service.ts
│   │   │   ├── schemas/
│   │   │   │   └── payment.schema.ts
│   │   │   └── pages/
│   │   │       └── PaymentsPage.tsx
│   │   │
│   │   └── settings/
│   │       ├── components/
│   │       │   ├── BusinessInfoForm.tsx
│   │       │   ├── LogoUpload.tsx
│   │       │   └── InvoicePreferences.tsx
│   │       ├── hooks/
│   │       │   └── useSettings.ts
│   │       ├── services/
│   │       │   └── settings.service.ts
│   │       ├── schemas/
│   │       │   └── settings.schema.ts
│   │       └── pages/
│   │           └── SettingsPage.tsx
│   │
│   ├── components/                 # Shared, reusable UI components
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       # Sidebar + Topbar wrapper
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   └── AuthLayout.tsx      # Centered layout for login/signup
│   │   ├── ui/                     # shadcn/ui components (auto-generated)
│   │   └── shared/
│   │       ├── EmptyState.tsx
│   │       ├── ErrorState.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── PageHeader.tsx
│   │       ├── StatusBadge.tsx
│   │       └── LoadingSpinner.tsx
│   │
│   ├── hooks/                      # Global shared hooks
│   │   ├── useCurrentUser.ts
│   │   └── useToast.ts
│   │
│   ├── lib/                        # Core library setup
│   │   ├── supabase.ts             # Supabase client initialization
│   │   ├── query-client.ts         # TanStack Query client config
│   │   └── utils.ts                # cn() and other utilities
│   │
│   ├── types/                      # Global TypeScript types
│   │   ├── database.types.ts       # Auto-generated from Supabase
│   │   ├── api.types.ts            # API response/request shapes
│   │   └── enums.ts                # Status enums, payment methods
│   │
│   ├── constants/                  # App-wide constants
│   │   ├── routes.ts               # Route path constants
│   │   ├── query-keys.ts           # TanStack Query key factory
│   │   └── app.constants.ts        # GST rates, currencies, defaults
│   │
│   └── styles/
│       └── globals.css             # Tailwind base + shadcn variables
│
├── .env.local                      # Local environment variables
├── .env.example                    # Template for env vars
├── .eslintrc.json
├── .prettierrc
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

### Folder Responsibilities

| Folder               | Purpose                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| `app/`               | App entry point, router, providers                                             |
| `features/`          | Self-contained feature modules — each owns its pages, hooks, services, schemas |
| `components/layout/` | App shell — sidebar, topbar, auth layout                                       |
| `components/ui/`     | shadcn/ui generated components — never modify directly                         |
| `components/shared/` | Reusable UI atoms used across features                                         |
| `hooks/`             | Hooks shared across more than one feature                                      |
| `lib/`               | Third-party client setup — Supabase, QueryClient                               |
| `types/`             | TypeScript type definitions                                                    |
| `constants/`         | Route paths, query keys, app-level constants                                   |

---

# 2. Database Schema

## Overview

All tables use UUID primary keys. Every business table includes audit fields and soft delete support. Supabase Auth manages the `auth.users` table — our `profiles` table extends it.

---

## Table: profiles

Extends Supabase Auth. Created automatically on user signup via a database trigger.

| Column     | Type        | Constraints             | Notes                 |
| ---------- | ----------- | ----------------------- | --------------------- |
| id         | uuid        | PK, FK → auth.users.id  | Matches auth user ID  |
| full_name  | text        | NOT NULL                |                       |
| email      | text        | NOT NULL, UNIQUE        |                       |
| avatar_url | text        | NULLABLE                | Supabase Storage path |
| created_at | timestamptz | NOT NULL, DEFAULT now() |                       |
| updated_at | timestamptz | NOT NULL, DEFAULT now() |                       |

---

## Table: settings

One row per user. Created on signup via trigger alongside profile.

| Column           | Type         | Constraints                                          | Notes                          |
| ---------------- | ------------ | ---------------------------------------------------- | ------------------------------ |
| id               | uuid         | PK, DEFAULT gen_random_uuid()                        |                                |
| user_id          | uuid         | NOT NULL, UNIQUE, FK → profiles.id ON DELETE CASCADE |                                |
| business_name    | text         | NULLABLE                                             |                                |
| gstin            | text         | NULLABLE                                             |                                |
| address          | text         | NULLABLE                                             |                                |
| phone            | text         | NULLABLE                                             |                                |
| logo_url         | text         | NULLABLE                                             | Storage path                   |
| default_currency | text         | NOT NULL, DEFAULT 'INR'                              |                                |
| default_gst_rate | numeric(5,2) | NOT NULL, DEFAULT 18.00                              |                                |
| invoice_prefix   | text         | NOT NULL, DEFAULT 'INV'                              |                                |
| invoice_counter  | integer      | NOT NULL, DEFAULT 1                                  | Auto-increment invoice numbers |
| created_at       | timestamptz  | NOT NULL, DEFAULT now()                              |                                |
| updated_at       | timestamptz  | NOT NULL, DEFAULT now()                              |                                |

---

## Table: clients

| Column          | Type        | Constraints                                  | Notes               |
| --------------- | ----------- | -------------------------------------------- | ------------------- |
| id              | uuid        | PK, DEFAULT gen_random_uuid()                |                     |
| user_id         | uuid        | NOT NULL, FK → profiles.id ON DELETE CASCADE | Ownership           |
| name            | text        | NOT NULL                                     |                     |
| email           | text        | NOT NULL                                     |                     |
| phone           | text        | NULLABLE                                     |                     |
| company         | text        | NULLABLE                                     |                     |
| gstin           | text        | NULLABLE                                     | Client's GST number |
| billing_address | text        | NULLABLE                                     |                     |
| notes           | text        | NULLABLE                                     |                     |
| deleted_at      | timestamptz | NULLABLE                                     | Soft delete         |
| created_at      | timestamptz | NOT NULL, DEFAULT now()                      |                     |
| updated_at      | timestamptz | NOT NULL, DEFAULT now()                      |                     |

**Indexes:** `user_id`, `email`, `deleted_at`
**Constraint:** UNIQUE on `(user_id, email)` — no duplicate client emails per user

---

## Table: engagements

Central business entity. One engagement = one project.

| Column      | Type        | Constraints                                  | Notes                       |
| ----------- | ----------- | -------------------------------------------- | --------------------------- |
| id          | uuid        | PK, DEFAULT gen_random_uuid()                |                             |
| user_id     | uuid        | NOT NULL, FK → profiles.id ON DELETE CASCADE |                             |
| client_id   | uuid        | NOT NULL, FK → clients.id ON DELETE CASCADE  |                             |
| title       | text        | NOT NULL                                     | Project name                |
| description | text        | NULLABLE                                     |                             |
| status      | text        | NOT NULL, DEFAULT 'active'                   | active, completed, archived |
| deleted_at  | timestamptz | NULLABLE                                     |                             |
| created_at  | timestamptz | NOT NULL, DEFAULT now()                      |                             |
| updated_at  | timestamptz | NOT NULL, DEFAULT now()                      |                             |

**Indexes:** `user_id`, `client_id`, `status`, `deleted_at`

---

## Table: proposals

| Column          | Type          | Constraints                                     | Notes                                     |
| --------------- | ------------- | ----------------------------------------------- | ----------------------------------------- |
| id              | uuid          | PK, DEFAULT gen_random_uuid()                   |                                           |
| user_id         | uuid          | NOT NULL, FK → profiles.id ON DELETE CASCADE    |                                           |
| engagement_id   | uuid          | NOT NULL, FK → engagements.id ON DELETE CASCADE |                                           |
| title           | text          | NOT NULL                                        |                                           |
| scope           | text          | NULLABLE                                        | Scope of work                             |
| line_items      | jsonb         | NOT NULL, DEFAULT '[]'                          | Array of {description, qty, rate, amount} |
| subtotal        | numeric(12,2) | NOT NULL, DEFAULT 0                             |                                           |
| discount_type   | text          | NULLABLE                                        | 'percent' or 'fixed'                      |
| discount_value  | numeric(10,2) | NULLABLE, DEFAULT 0                             |                                           |
| discount_amount | numeric(10,2) | NULLABLE, DEFAULT 0                             |                                           |
| gst_rate        | numeric(5,2)  | NULLABLE, DEFAULT 0                             |                                           |
| gst_amount      | numeric(10,2) | NULLABLE, DEFAULT 0                             |                                           |
| total           | numeric(12,2) | NOT NULL, DEFAULT 0                             |                                           |
| currency        | text          | NOT NULL, DEFAULT 'INR'                         |                                           |
| terms           | text          | NULLABLE                                        |                                           |
| notes           | text          | NULLABLE                                        |                                           |
| valid_until     | date          | NULLABLE                                        | Expiry date                               |
| status          | text          | NOT NULL, DEFAULT 'draft'                       | draft, sent, accepted, rejected, expired  |
| pdf_url         | text          | NULLABLE                                        | Storage path                              |
| sent_at         | timestamptz   | NULLABLE                                        |                                           |
| accepted_at     | timestamptz   | NULLABLE                                        |                                           |
| rejected_at     | timestamptz   | NULLABLE                                        |                                           |
| deleted_at      | timestamptz   | NULLABLE                                        |                                           |
| created_at      | timestamptz   | NOT NULL, DEFAULT now()                         |                                           |
| updated_at      | timestamptz   | NOT NULL, DEFAULT now()                         |                                           |

**Indexes:** `user_id`, `engagement_id`, `status`, `deleted_at`

---

## Table: contracts

One contract per engagement (1:1 relationship with engagement).

| Column         | Type        | Constraints                                             | Notes                              |
| -------------- | ----------- | ------------------------------------------------------- | ---------------------------------- |
| id             | uuid        | PK, DEFAULT gen_random_uuid()                           |                                    |
| user_id        | uuid        | NOT NULL, FK → profiles.id ON DELETE CASCADE            |                                    |
| engagement_id  | uuid        | NOT NULL, UNIQUE, FK → engagements.id ON DELETE CASCADE | 1:1 with engagement                |
| proposal_id    | uuid        | NOT NULL, FK → proposals.id                             | Source proposal                    |
| content        | text        | NOT NULL                                                | Contract body text                 |
| status         | text        | NOT NULL, DEFAULT 'draft'                               | draft, generated, signed, archived |
| pdf_url        | text        | NULLABLE                                                | Generated contract PDF             |
| signed_pdf_url | text        | NULLABLE                                                | Uploaded signed copy               |
| generated_at   | timestamptz | NULLABLE                                                |                                    |
| signed_at      | timestamptz | NULLABLE                                                |                                    |
| deleted_at     | timestamptz | NULLABLE                                                |                                    |
| created_at     | timestamptz | NOT NULL, DEFAULT now()                                 |                                    |
| updated_at     | timestamptz | NOT NULL, DEFAULT now()                                 |                                    |

**Indexes:** `user_id`, `engagement_id`, `status`

---

## Table: invoices

Multiple invoices can exist per engagement (advance, milestone, final).

| Column          | Type          | Constraints                                     | Notes                                 |
| --------------- | ------------- | ----------------------------------------------- | ------------------------------------- |
| id              | uuid          | PK, DEFAULT gen_random_uuid()                   |                                       |
| user_id         | uuid          | NOT NULL, FK → profiles.id ON DELETE CASCADE    |                                       |
| engagement_id   | uuid          | NOT NULL, FK → engagements.id ON DELETE CASCADE |                                       |
| invoice_number  | text          | NOT NULL                                        | e.g. INV-2025-0012                    |
| line_items      | jsonb         | NOT NULL, DEFAULT '[]'                          | Same shape as proposal line_items     |
| subtotal        | numeric(12,2) | NOT NULL, DEFAULT 0                             |                                       |
| discount_type   | text          | NULLABLE                                        |                                       |
| discount_value  | numeric(10,2) | NULLABLE, DEFAULT 0                             |                                       |
| discount_amount | numeric(10,2) | NULLABLE, DEFAULT 0                             |                                       |
| gst_type        | text          | NULLABLE                                        | 'domestic', 'export_lut', 'none'      |
| gst_rate        | numeric(5,2)  | NULLABLE, DEFAULT 0                             |                                       |
| gst_amount      | numeric(10,2) | NULLABLE, DEFAULT 0                             |                                       |
| tds_rate        | numeric(5,2)  | NULLABLE, DEFAULT 0                             |                                       |
| tds_amount      | numeric(10,2) | NULLABLE, DEFAULT 0                             |                                       |
| total           | numeric(12,2) | NOT NULL, DEFAULT 0                             | After GST, after TDS                  |
| currency        | text          | NOT NULL, DEFAULT 'INR'                         |                                       |
| issue_date      | date          | NOT NULL                                        |                                       |
| due_date        | date          | NOT NULL                                        |                                       |
| notes           | text          | NULLABLE                                        |                                       |
| status          | text          | NOT NULL, DEFAULT 'draft'                       | draft, sent, paid, overdue, cancelled |
| pdf_url         | text          | NULLABLE                                        |                                       |
| sent_at         | timestamptz   | NULLABLE                                        |                                       |
| paid_at         | timestamptz   | NULLABLE                                        |                                       |
| deleted_at      | timestamptz   | NULLABLE                                        |                                       |
| created_at      | timestamptz   | NOT NULL, DEFAULT now()                         |                                       |
| updated_at      | timestamptz   | NOT NULL, DEFAULT now()                         |                                       |

**Indexes:** `user_id`, `engagement_id`, `status`, `invoice_number`, `due_date`, `deleted_at`
**Constraint:** UNIQUE on `(user_id, invoice_number)`

---

## Table: payments

| Column           | Type          | Constraints                                  | Notes                            |
| ---------------- | ------------- | -------------------------------------------- | -------------------------------- |
| id               | uuid          | PK, DEFAULT gen_random_uuid()                |                                  |
| user_id          | uuid          | NOT NULL, FK → profiles.id ON DELETE CASCADE |                                  |
| invoice_id       | uuid          | NOT NULL, FK → invoices.id ON DELETE CASCADE |                                  |
| amount           | numeric(12,2) | NOT NULL                                     |                                  |
| method           | text          | NOT NULL                                     | upi, bank_transfer, cash, cheque |
| reference_number | text          | NULLABLE                                     | UTR / transaction ID             |
| payment_date     | date          | NOT NULL                                     |                                  |
| notes            | text          | NULLABLE                                     |                                  |
| status           | text          | NOT NULL, DEFAULT 'completed'                | pending, completed               |
| deleted_at       | timestamptz   | NULLABLE                                     |                                  |
| created_at       | timestamptz   | NOT NULL, DEFAULT now()                      |                                  |
| updated_at       | timestamptz   | NOT NULL, DEFAULT now()                      |                                  |

**Indexes:** `user_id`, `invoice_id`, `status`, `payment_date`

---

## Relationship Diagram

```
auth.users
    │
    │ (trigger creates on signup)
    ▼
profiles (1)
    │
    ├──── settings (1:1)
    │
    └──── clients (1:N)
               │
               └──── engagements (1:N)
                          │
                          ├──── proposals (1:1 per engagement, but editable)
                          │
                          ├──── contracts (1:1 per engagement)
                          │
                          └──── invoices (1:N)
                                     │
                                     └──── payments (1:N)
```

---

## Cascade Rules

| Parent Deleted | Child Action                             |
| -------------- | ---------------------------------------- |
| auth.users     | CASCADE → profiles                       |
| profiles       | CASCADE → clients, settings              |
| clients        | CASCADE → engagements                    |
| engagements    | CASCADE → proposals, contracts, invoices |
| invoices       | CASCADE → payments                       |

Soft delete preferred. CASCADE hard delete only on account deletion.

---

# 3. Row Level Security (RLS)

RLS must be enabled on ALL tables. No table is accessible without a valid JWT.

## Strategy

Every policy follows a single rule:

```
auth.uid() = user_id
```

---

## profiles

| Policy                       | Operation | Rule                            |
| ---------------------------- | --------- | ------------------------------- |
| Users can read own profile   | SELECT    | `auth.uid() = id`               |
| Users can update own profile | UPDATE    | `auth.uid() = id`               |
| Profiles created by trigger  | INSERT    | Handled by DB trigger, not user |

---

## settings

| Policy                      | Operation | Rule                   |
| --------------------------- | --------- | ---------------------- |
| Read own settings           | SELECT    | `auth.uid() = user_id` |
| Update own settings         | UPDATE    | `auth.uid() = user_id` |
| Settings created by trigger | INSERT    | Handled by DB trigger  |

---

## clients

| Policy             | Operation | Rule                                          |
| ------------------ | --------- | --------------------------------------------- |
| Read own clients   | SELECT    | `auth.uid() = user_id AND deleted_at IS NULL` |
| Create client      | INSERT    | `auth.uid() = user_id`                        |
| Update own client  | UPDATE    | `auth.uid() = user_id`                        |
| Soft delete client | UPDATE    | `auth.uid() = user_id` (sets deleted_at)      |

---

## engagements

| Policy                | Operation | Rule                                          |
| --------------------- | --------- | --------------------------------------------- |
| Read own engagements  | SELECT    | `auth.uid() = user_id AND deleted_at IS NULL` |
| Create engagement     | INSERT    | `auth.uid() = user_id`                        |
| Update own engagement | UPDATE    | `auth.uid() = user_id`                        |
| Soft delete           | UPDATE    | `auth.uid() = user_id`                        |

---

## proposals

| Policy              | Operation | Rule                                          |
| ------------------- | --------- | --------------------------------------------- |
| Read own proposals  | SELECT    | `auth.uid() = user_id AND deleted_at IS NULL` |
| Create proposal     | INSERT    | `auth.uid() = user_id`                        |
| Update own proposal | UPDATE    | `auth.uid() = user_id`                        |
| Soft delete         | UPDATE    | `auth.uid() = user_id`                        |

---

## contracts

Same pattern as proposals.

---

## invoices

Same pattern as proposals.

---

## payments

Same pattern as proposals.

---

## Important RLS Notes

- RLS is enabled via Supabase dashboard per table — it must be explicitly turned ON.
- Anon key is safe to expose in frontend because RLS blocks cross-user access.
- Service role key is NEVER used in frontend — only in server-side functions if needed.
- `deleted_at IS NULL` filter must be in every SELECT policy to respect soft deletes.

---

# 4. Supabase Storage

## Buckets

| Bucket          | Visibility | Purpose                               |
| --------------- | ---------- | ------------------------------------- |
| `logos`         | Private    | Business logos uploaded in Settings   |
| `proposal-pdfs` | Private    | Generated proposal PDFs               |
| `contract-pdfs` | Private    | Generated + uploaded signed contracts |
| `invoice-pdfs`  | Private    | Generated invoice PDFs                |

All buckets are private. No public access.

---

## Folder Hierarchy

```
logos/
  └── {user_id}/logo.{ext}

proposal-pdfs/
  └── {user_id}/{proposal_id}/proposal-{timestamp}.pdf

contract-pdfs/
  └── {user_id}/{engagement_id}/contract-generated.pdf
  └── {user_id}/{engagement_id}/contract-signed.pdf

invoice-pdfs/
  └── {user_id}/{invoice_id}/invoice-{invoice_number}.pdf
```

Using `user_id` as the top-level folder enforces ownership at the storage path level.

---

## File Naming Conventions

| File               | Naming Pattern                                        |
| ------------------ | ----------------------------------------------------- |
| Logo               | `{user_id}/logo.png`                                  |
| Proposal PDF       | `{user_id}/{proposal_id}/proposal-{timestamp}.pdf`    |
| Contract Generated | `{user_id}/{engagement_id}/contract-generated.pdf`    |
| Contract Signed    | `{user_id}/{engagement_id}/contract-signed.pdf`       |
| Invoice PDF        | `{user_id}/{invoice_id}/invoice-{invoice_number}.pdf` |

---

## Access Rules

- All file reads require a signed URL with expiry.
- Signed URLs expire in 60 minutes for downloads.
- Files are never served via public URL.
- Storage paths are saved in the database (`pdf_url`, `logo_url` columns).

---

## Signed URL Strategy

```
Upload Flow:
1. Generate PDF in browser (jsPDF)
2. Upload blob to Supabase Storage
3. Save storage path to database column
4. Return path to frontend

Download Flow:
1. Read storage path from database
2. Request signed URL from Supabase (60 min expiry)
3. Redirect user to signed URL
4. URL expires automatically
```

---

## Storage RLS Policies

Storage policies mirror database RLS — users can only access files inside their own `{user_id}/` folder prefix.

---

# 5. Authentication Engineering

## Provider

Supabase Auth — Email + Password.

## Session Flow

```
User visits app
      │
      ▼
supabase.auth.getSession()
      │
      ├── Session exists → restore user → render app
      │
      └── No session → redirect to /login
```

## Login Flow

```
/login page
      │
      ▼
User submits email + password
      │
      ▼
supabase.auth.signInWithPassword()
      │
      ├── Success → JWT stored in localStorage by Supabase SDK
      │          → redirect to /dashboard
      │
      └── Error → Show error toast → stay on /login
```

## Signup Flow

```
/signup page
      │
      ▼
User submits name + email + password
      │
      ▼
supabase.auth.signUp()
      │
      ▼
DB Trigger fires:
  → Insert row into profiles
  → Insert row into settings (with defaults)
      │
      ▼
Email verification sent
      │
      ▼
User verifies email → can login
```

## DB Trigger on Signup

A Supabase database trigger on `auth.users` INSERT must:

1. Create a `profiles` row with the new user's id and email.
2. Create a `settings` row with default values for that user.

This is defined in Supabase SQL editor — not in application code.

## Protected Routes

```
router.tsx defines two route groups:

Public Routes (no auth required):
  /login
  /signup
  /forgot-password

Protected Routes (auth required):
  /* everything else
  Wrapped in <ProtectedRoute> component
  ProtectedRoute checks session → redirects to /login if none
```

## Session Management

- Supabase SDK handles token refresh automatically.
- `supabase.auth.onAuthStateChange()` listener in `providers.tsx` keeps React state in sync.
- On logout: `supabase.auth.signOut()` clears session → redirect to /login.
- Session is stored in localStorage by Supabase SDK — no manual token management.

## User Bootstrap

After login, `useCurrentUser` hook:

1. Reads `auth.uid()` from session.
2. Fetches `profiles` row.
3. Fetches `settings` row.
4. Makes user + settings available app-wide via React Context.

---

# 6. State Management

## Strategy

No global state library (no Redux, no Zustand). State is divided by concern.

| Concern                                     | Tool                  | Location            |
| ------------------------------------------- | --------------------- | ------------------- |
| Server data (clients, proposals, invoices…) | TanStack Query        | Feature hooks       |
| Form data                                   | React Hook Form + Zod | Feature components  |
| Auth state (current user, session)          | React Context         | `app/providers.tsx` |
| UI state (modal open, active tab…)          | useState / useReducer | Component level     |

---

## TanStack Query

Used for ALL server data fetching and mutation.

```
Query Key Factory (constants/query-keys.ts):

clients.all          → ['clients']
clients.detail(id)   → ['clients', id]
proposals.all        → ['proposals']
proposals.detail(id) → ['proposals', id]
invoices.all         → ['invoices']
...
```

Rules:

- Every feature has its own hooks (`useClients`, `useProposals`, etc.)
- Hooks wrap `useQuery` and `useMutation`
- On mutation success → `queryClient.invalidateQueries()` for relevant keys
- Stale time: 5 minutes for list queries, 2 minutes for detail queries
- Error handling via `onError` callbacks in mutation hooks

---

## React Hook Form + Zod

Used for ALL forms.

```
Schema defined in feature/schemas/entity.schema.ts
Form registered in feature/components/EntityForm.tsx
Validation runs on submit (mode: 'onSubmit')
Error messages displayed below each field
```

---

## Auth Context

```
AuthContext provides:
  - currentUser: Profile | null
  - settings: Settings | null
  - isLoading: boolean
  - isAuthenticated: boolean
  - logout: () => void
```

Available everywhere via `useCurrentUser()` hook.

---

## Local UI State

Modals, tabs, toggles — all managed with `useState` at component level. Never lifted to global state unless two sibling components need it.

---

# 7. API Layer

## Architecture

There is no separate backend server. The API layer is the Supabase client — abstracted through service files.

```
Component / Hook
      │
      ▼
Feature Service (features/clients/services/clients.service.ts)
      │
      ▼
Supabase Client (lib/supabase.ts)
      │
      ▼
Supabase PostgreSQL
```

---

## Service File Pattern

Each feature has one service file. Each service exports async functions.

```
clients.service.ts exports:
  getClients(userId)
  getClient(id)
  createClient(data)
  updateClient(id, data)
  deleteClient(id)       ← soft delete (sets deleted_at)
```

Services return typed data or throw errors. They never return raw Supabase response objects.

---

## Error Handling

```
Every service function:
  try {
    const { data, error } = await supabase.from(...)...
    if (error) throw new AppError(error.message, error.code)
    return data
  } catch (err) {
    throw err   ← propagates to TanStack Query onError
  }
```

TanStack Query `onError` callback shows error toast to user.

User never sees raw database errors — only friendly messages.

---

## Loading Strategy

- TanStack Query provides `isLoading`, `isFetching`, `isError` states.
- Every list page shows skeleton loaders while `isLoading` is true.
- Every form submit button shows spinner while mutation `isPending` is true.
- Never block UI without showing loading feedback.

---

## Retry Strategy

TanStack Query defaults: retry 3 times on failure, with exponential backoff.

For mutations (create, update, delete): retry = 0 (no auto-retry on write operations — user must manually retry to avoid duplicate records).

---

## Caching

| Query           | Stale Time | Cache Time |
| --------------- | ---------- | ---------- |
| clients list    | 5 min      | 10 min     |
| client detail   | 2 min      | 5 min      |
| proposals list  | 5 min      | 10 min     |
| dashboard stats | 1 min      | 5 min      |
| settings        | 10 min     | 30 min     |

After any mutation, relevant query keys are invalidated immediately.

---

# 8. Environment Variables

## Variables

```
# .env.local (development)
# .env.production (production — set in Vercel dashboard)

# Supabase
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Resend (for email sending — used in Supabase Edge Function)
RESEND_API_KEY=re_xxxx

# App
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=EkaFlow
```

## Rules

- `VITE_` prefix required for variables used in the React frontend (Vite exposes these).
- `RESEND_API_KEY` has NO `VITE_` prefix — it is only used server-side in a Supabase Edge Function.
- Service Role Key is NEVER added to any environment file — only used in Supabase dashboard.
- `.env.local` is in `.gitignore` — never committed.
- `.env.example` is committed with placeholder values for team reference.

## Secret Management

| Secret            | Where Stored                            |
| ----------------- | --------------------------------------- |
| Supabase URL      | Vercel env vars + .env.local            |
| Supabase Anon Key | Vercel env vars + .env.local            |
| Resend API Key    | Supabase Edge Function secrets          |
| Service Role Key  | Supabase dashboard only — never in code |

---

# 9. Deployment Pipeline

## Local Development

```
1. Clone repo
2. Copy .env.example → .env.local
3. Fill in Supabase URL + Anon Key
4. npm install
5. npm run dev
6. App runs at localhost:5173
```

## Supabase Setup (one-time)

```
1. Create Supabase project (free tier)
2. Run SQL migrations in Supabase SQL Editor:
   - Create all tables
   - Enable RLS on all tables
   - Add RLS policies
   - Add signup trigger (profiles + settings)
   - Create storage buckets
   - Add storage policies
3. Copy URL + Anon Key to .env.local
```

## Vercel Deployment

```
1. Push code to GitHub (main branch)
2. Connect GitHub repo to Vercel
3. Add environment variables in Vercel dashboard:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_APP_URL (production URL)
4. Vercel auto-deploys on every push to main
```

## Branch Strategy

```
main          → production (auto-deploy to Vercel)
dev           → staging / preview
feature/*     → feature development
fix/*         → bug fixes

PRs always merge into dev first.
dev merges into main for releases.
```

## Preview Deployments

Vercel creates a preview URL for every PR automatically. Use these for review before merging.

---

# 10. Engineering Standards

## Naming Conventions

| Item             | Convention                   | Example              |
| ---------------- | ---------------------------- | -------------------- |
| Components       | PascalCase                   | `ClientForm.tsx`     |
| Hooks            | camelCase, `use` prefix      | `useClients.ts`      |
| Services         | camelCase, `.service` suffix | `clients.service.ts` |
| Schemas          | camelCase, `.schema` suffix  | `client.schema.ts`   |
| Pages            | PascalCase, `Page` suffix    | `ClientsPage.tsx`    |
| Folders          | kebab-case                   | `features/clients/`  |
| Constants        | SCREAMING_SNAKE_CASE         | `DEFAULT_GST_RATE`   |
| Types/Interfaces | PascalCase                   | `Client`, `Proposal` |
| Enums            | PascalCase                   | `ProposalStatus`     |

---

## Component Conventions

- One component per file.
- Props interface defined at top of file, named `{ComponentName}Props`.
- No inline styles — Tailwind classes only.
- No business logic inside UI components.
- All text must use design system typography classes.
- Every interactive element must have accessible `aria-` attributes where needed.

---

## File Conventions

- Every feature folder has: `components/`, `hooks/`, `services/`, `schemas/`, `pages/`.
- Index files (`index.ts`) only for exporting — never contain logic.
- Service files are pure functions — no React imports.
- Schema files export Zod schemas and inferred TypeScript types.

---

## Commit Strategy

```
Format: type(scope): message

Types:
  feat     → new feature
  fix      → bug fix
  refactor → code change, no feature or fix
  style    → formatting, no logic change
  docs     → documentation
  chore    → tooling, deps

Examples:
  feat(clients): add client search filter
  fix(invoices): correct GST calculation for exports
  refactor(proposals): extract line items to separate component
  chore: update dependencies
```

---

## Import Rules

```
Import order (enforced by ESLint):
1. React
2. External libraries (react-router, tanstack, etc.)
3. Internal absolute imports (@/features/..., @/components/..., @/lib/...)
4. Relative imports (./ComponentName)

Use absolute imports with @ alias configured in vite.config.ts and tsconfig.json.
```

---

## Error Handling Standards

- Every async operation must be wrapped in try/catch.
- User-facing errors must show a toast notification — never raw error messages.
- Console errors allowed in development only.
- 404 → redirect to relevant list page.
- Auth error (401) → redirect to /login.
- All forms show field-level validation errors via Zod + React Hook Form.

---

## Performance Standards

- Dashboard must load in under 2 seconds.
- No unnecessary re-renders — memoize expensive computations with `useMemo`.
- Images (logos) must be compressed before upload.
- PDF generation runs client-side (jsPDF) — no server round-trip.
- TanStack Query caching prevents duplicate API calls.
- Code splitting via React Router lazy loading for each page.

```
Lazy loading example:
const ClientsPage = lazy(() => import('@/features/clients/pages/ClientsPage'))
```

---

## Accessibility Standards

- All form inputs must have associated `<label>` elements.
- All icon-only buttons must have `aria-label`.
- Color must never be the only indicator of state — always pair with text or icon.
- Focus must be visible on all interactive elements.
- Modal dialogs must trap focus while open.
- Use semantic HTML: `<main>`, `<nav>`, `<section>`, `<article>`.

---

## Logging

- Development: `console.log` allowed, must be removed before merge to `main`.
- Production: No `console.log`. Errors logged to console only — no external logging service in MVP.
- Future: Sentry or LogRocket for production error tracking.

---

## Code Organization Golden Rules

1. Business logic lives in services and hooks — never in components.
2. Components only render — they call hooks, display data, handle user events.
3. Hooks orchestrate logic — they call services, manage state, handle side effects.
4. Services talk to Supabase — they are pure async functions with no React.
5. Schemas define shape and validation — shared between frontend forms and type system.
6. One feature = one folder. Features do not import from each other.
7. Shared code goes in `components/shared/`, `hooks/`, or `lib/` — not inside a feature.

---

# Summary

| Area           | Decision                                             |
| -------------- | ---------------------------------------------------- |
| Architecture   | Feature-based, layered                               |
| Database       | PostgreSQL via Supabase, UUID PKs, soft deletes      |
| Auth           | Supabase Auth, JWT, protected routes                 |
| RLS            | `auth.uid() = user_id` on every table                |
| Storage        | 4 private buckets, signed URLs, path-based ownership |
| State          | TanStack Query + RHF + Context + useState            |
| Error Handling | Try/catch in services, toast for users               |
| Deployment     | Vercel (frontend) + Supabase (backend)               |
| Budget         | $0 — all free tiers                                  |

---

_Engineering Architecture v1.0 — Claude (Engineering Lead)_
_Blueprint is final. Implementation follows this document._
