# EkaFlow Data Model

Version: 1.0

Status: Draft

Owner: Product Architecture

---

# Purpose

The Data Model defines the core business entities of EkaFlow and the relationships between them.

This document represents the business domain.

It does NOT define database tables.

It defines how the business works.

The database schema will be derived from this document.

---

# Core Business Domain

EkaFlow manages one complete client lifecycle.

The lifecycle begins with a Client and ends with a Payment.

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

Every module exists to support this workflow.

---

# Core Entities

The MVP contains seven primary entities.

User

Client

Engagement

Proposal

Contract

Invoice

Payment

---

# Entity Ownership

User

Owns

↓

Clients

A User can never access another user's Clients.

---

Client

Owns

↓

Engagements

A Client may have multiple projects.

---

Engagement

Owns

↓

Proposal

Contract

Invoice(s)

The Engagement is the central business entity.

---

Invoice

Owns

↓

Payments

Payments never exist without an Invoice.

---

# Relationship Diagram

User

1

↓

N

Clients

1

↓

N

Engagements

1

↓

1

Proposal

1

↓

1

Contract

1

↓

N

Invoices

1

↓

N

Payments

---

# User

Represents

Freelancer

Consultant

Agency

Responsibilities

Own business

Own clients

Own documents

Own invoices

Own payments

---

# Client

Represents

Customer

Company

Organization

Stores

Business Information

Contact Information

Billing Information

A Client may return for future work.

Therefore

Client

≠

Project

---

# Engagement

Definition

One Engagement equals one business project.

Examples

Website Development

Brand Identity

SEO Campaign

App Design

Maintenance Contract

Everything generated during the project belongs here.

---

# Proposal

Purpose

Pitch the work.

Contains

Scope

Pricing

Timeline

Terms

Status

Draft

↓

Sent

↓

Accepted

OR

Rejected

OR

Expired

Only Accepted proposals continue.

---

# Contract

Created after Proposal Acceptance.

Contains

Legal Terms

Client Information

Project Information

Signatures

Status

Draft

↓

Generated

↓

Signed

↓

Archived

---

# Invoice

Created after Contract.

Contains

Invoice Number

Items

GST

Discount

Totals

Status

Draft

↓

Sent

↓

Paid

OR

Overdue

One Engagement may contain multiple invoices.

Example

40% Advance

40% Mid

20% Final

---

# Payment

Represents money received.

Attributes

Amount

Method

Reference

Date

Notes

Status

Pending

↓

Completed

Future

Partial Payments

Refunds

---

# Entity Lifecycle

Client Created

↓

Engagement Created

↓

Proposal Created

↓

Proposal Accepted

↓

Contract Generated

↓

Contract Signed

↓

Invoice Generated

↓

Payment Recorded

↓

Engagement Completed

---

# Ownership Rules

Every Client belongs to exactly one User.

Every Engagement belongs to exactly one Client.

Every Proposal belongs to exactly one Engagement.

Every Contract belongs to exactly one Engagement.

Every Invoice belongs to exactly one Engagement.

Every Payment belongs to exactly one Invoice.

No entity can exist without its parent.

---

# Delete Rules

Deleting a User

↓

Deletes all owned resources.

Deleting a Client

↓

Deletes all Engagements.

Deleting an Engagement

↓

Deletes

Proposal

Contract

Invoices

Payments

Soft Delete preferred.

Hard Delete should be avoided.

---

# Status Flow

Proposal

Draft

↓

Sent

↓

Accepted

Rejected

Expired

---

Contract

Draft

↓

Generated

↓

Signed

Archived

---

Invoice

Draft

↓

Sent

↓

Paid

Overdue

Cancelled

---

Payment

Pending

↓

Completed

---

# Business Rules

A Proposal cannot exist without a Client.

A Contract cannot exist before Proposal Acceptance.

An Invoice cannot exist before Contract creation.

A Payment cannot exist without an Invoice.

Completed Engagements become read-only.

---

# Future Expansion

The Data Model supports future additions without redesign.

Examples

Recurring Projects

Milestone Billing

Subscription Invoices

Client Portal

Multiple Team Members

Recurring Payments

Analytics

Since Engagement acts as the central business entity,
future modules can connect without changing existing relationships.

---

# Golden Rule

The Engagement is the heart of EkaFlow.

Every business document must belong to one Engagement.

This keeps the data model simple, scalable, and maintainable.
