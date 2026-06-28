# EkaFlow Database Architecture

Version: 1.0

Status: Draft

Owner: Product Architecture

---

# Purpose

This document defines the logical database architecture of EkaFlow.

It specifies:

- Core entities
- Relationships
- Ownership
- Foreign key strategy
- Naming conventions
- Indexing strategy
- Soft delete policy

This document does NOT contain SQL.

The SQL implementation will be defined in DATABASE_SCHEMA.md.

---

# Database Philosophy

The database is designed around one business workflow.

Client

↓

Engagement

↓

Proposal

↓

Contract

↓

Invoice

↓

Payment

Every record must belong to a User.

No orphan records are allowed.

---

# Core Tables

The MVP consists of the following logical entities:

- users
- clients
- engagements
- proposals
- contracts
- invoices
- payments
- settings

---

# Relationship Overview

User (1)

↓

Clients (N)

↓

Engagements (N)

↓

Proposal (1)

↓

Contract (1)

↓

Invoices (N)

↓

Payments (N)

---

# Ownership Rules

User owns Clients.

Client owns Engagements.

Engagement owns:

- Proposal
- Contract
- Invoice(s)

Invoice owns Payment(s).

Ownership is inherited.

Every child record ultimately belongs to one User.

---

# Foreign Key Strategy

clients.user_id
→ users.id

engagements.client_id
→ clients.id

proposals.engagement_id
→ engagements.id

contracts.engagement_id
→ engagements.id

invoices.engagement_id
→ engagements.id

payments.invoice_id
→ invoices.id

Every relationship uses UUID.

---

# Primary Keys

Every table uses

id UUID

generated automatically.

Sequential numeric IDs are not used internally.

User-facing values like invoice numbers are generated separately.

---

# Naming Conventions

Tables

Plural

Example

clients

engagements

Columns

snake_case

Examples

created_at

updated_at

invoice_number

Foreign Keys

entity_id

Examples

client_id

invoice_id

engagement_id

---

# Timestamp Strategy

Every business table contains:

created_at

updated_at

Future:

deleted_at

last_modified_by

---

# Soft Delete Strategy

Preferred.

Records should not be permanently deleted.

Instead:

deleted_at timestamp

Future cleanup jobs may permanently remove archived records.

---

# Index Strategy

Indexes should exist on:

user_id

client_id

engagement_id

invoice_id

status

created_at

invoice_number

email

This ensures fast filtering and dashboard queries.

---

# Status Fields

Proposal

Draft

Sent

Accepted

Rejected

Expired

Contract

Draft

Generated

Signed

Archived

Invoice

Draft

Sent

Paid

Overdue

Cancelled

Payment

Pending

Completed

---

# File References

Business tables store only:

file_path

or

storage_key

Never binary files.

PDFs remain inside Supabase Storage.

---

# Data Integrity Rules

A Proposal cannot exist without an Engagement.

A Contract cannot exist without a Proposal.

An Invoice cannot exist without an Engagement.

A Payment cannot exist without an Invoice.

Every foreign key must be valid.

---

# Future Expansion

Architecture supports:

Recurring invoices

Milestone payments

Subscriptions

Client portal

Team members

Notifications

without redesigning the database.

---

# Golden Rules

One User owns everything.

One Client can have many Engagements.

One Engagement represents one project.

Every document belongs to an Engagement.

Payments belong only to Invoices.

No orphan data.

Use UUIDs everywhere.

Business logic belongs in the application layer, not inside the database.
