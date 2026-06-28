# EkaFlow - Product Requirements Document (PRD)

Version: 1.0

Status: Draft

Owner: Product Architecture

---

# 1. Product Overview

EkaFlow is an all-in-one workflow platform for Indian freelancers, solo consultants and small agencies.

The product simplifies the complete client lifecycle:

Client

↓

Proposal

↓

Contract

↓

Invoice

↓

Payment

The objective is to replace multiple disconnected tools with one simple workflow.

---

# 2. Problem Statement

Today's freelancers usually use:

Google Docs

↓

PDF

↓

Excel

↓

WhatsApp

↓

UPI Screenshot

Everything is disconnected.

Documents become difficult to manage.

Payments get delayed.

Invoices are inconsistent.

Follow-up becomes manual.

---

# 3. Product Goal

Help freelancers

Create professional documents faster.

Reduce manual work.

Track payments.

Improve client experience.

---

# 4. Target Users

Primary

• Freelancers

• Solo Consultants

• Small Agencies

Industries

• Designers

• Developers

• Writers

• Video Editors

• Marketing Consultants

• SEO

• Branding

---

# 5. MVP Scope

Included

✅ Authentication

✅ Dashboard

✅ Clients

✅ Proposal Builder

✅ Contract Generator

✅ Invoice Generator

✅ Payment Tracking

✅ Settings

Excluded

❌ CRM

❌ Project Management

❌ Time Tracking

❌ Expenses

❌ Accounting

❌ GST Filing

❌ Team Members

❌ AI

❌ Mobile App

---

# 6. Functional Requirements

## Authentication

User can

Create account

Login

Logout

Reset password

Business Rules

Email must be unique.

Password minimum 8 characters.

---

## Dashboard

User should see

Monthly Revenue

Pending Invoices

Pending Proposals

Recent Activity

Quick Actions

---

## Clients

User can

Create Client

Edit Client

Delete Client

Search Client

View Client Details

---

Required Fields

Name

Email

Optional

Phone

Company

GSTIN

Address

Notes

---

## Proposal Builder

User can

Create Proposal

Edit Proposal

Duplicate Proposal

Delete Proposal

Preview Proposal

Generate PDF

Email Proposal

Save Draft

Statuses

Draft

Sent

Accepted

Rejected

Expired

---

Proposal Sections

Client

Project

Line Items

Pricing

Terms

Notes

Signature

---

## Contract

User can

Generate Contract

Download PDF

Upload Signed Copy

View Contract

Statuses

Draft

Generated

Signed

---

## Invoice

User can

Create Invoice

Generate GST Invoice

Preview

Download PDF

Email Invoice

Statuses

Draft

Sent

Paid

Overdue

---

Invoice Fields

Invoice Number

Issue Date

Due Date

Items

GST

Discount

Notes

---

## Payments

User can

Record Payment

Update Payment

Delete Payment

Methods

UPI

Bank Transfer

Cash

Cheque

---

## Settings

Business Name

Logo

GSTIN

Business Address

Default Currency

Invoice Prefix

Email

Password

---

# 7. Non Functional Requirements

Application should

Load quickly

Be mobile responsive

Work on modern browsers

Use reusable components

Be secure

Be scalable

---

# 8. Performance

Dashboard

< 2 sec

Proposal Creation

Instant

PDF Generation

< 5 sec

---

# 9. Security

Supabase Authentication

Row Level Security

User data isolation

Secure Storage

No public documents

---

# 10. Success Metrics

User creates first proposal

under 5 minutes.

User generates invoice

under 2 minutes.

Payment recorded

under 30 seconds.

---

# 11. Acceptance Criteria

MVP is successful when a freelancer can

Create Client

↓

Create Proposal

↓

Generate Contract

↓

Upload Signed Contract

↓

Generate Invoice

↓

Record Payment

without needing any external software.

---

# 12. Future Roadmap

Phase 2

Payment Gateway

Client Portal

Proposal Templates

Email Tracking

Invoice Reminders

Recurring Invoices

Analytics

Phase 3

CRM

Projects

Tasks

Time Tracking

Expenses

GST Filing

AI Assistant

Mobile App
