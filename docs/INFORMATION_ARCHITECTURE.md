# Information Architecture v1.0

Project: EkaFlow

Version: 1.0

Owner: Product Architecture (ChatGPT)

Status: Draft

---

# Purpose

This document defines the complete screen hierarchy, navigation structure, and page responsibilities for the EkaFlow MVP.

Every screen in the MVP is listed here.

No implementation details.

No UI design.

Only product architecture.

---

# Application Structure

```
Public

│

├── Landing Page
├── Login
├── Signup
└── Forgot Password


↓

Authenticated Application


Dashboard

│

├── Clients

├── Proposals

├── Contracts

├── Invoices

├── Payments

└── Settings
```

---

# Public Screens

## Landing Page

Purpose

Marketing website.

Goals

- Explain product
- Collect signups
- Redirect to Login

Actions

- Get Started
- Login

---

## Login

Purpose

Authenticate user.

Actions

- Login
- Forgot Password
- Signup

---

## Signup

Purpose

Create new account.

Actions

- Register
- Verify Email

---

## Forgot Password

Purpose

Reset password.

---

# Authenticated Application

After login user lands on Dashboard.

---

# Sidebar Navigation

```
🏠 Dashboard

👥 Clients

📄 Proposals

📝 Contracts

🧾 Invoices

💳 Payments

⚙️ Settings
```

Sidebar remains visible on desktop.

Collapsible on smaller screens.

---

# Dashboard

Purpose

Business overview.

Widgets

- Revenue This Month
- Pending Proposals
- Pending Invoices
- Pending Payments
- Recent Activity

Quick Actions

- New Client
- New Proposal
- New Invoice

---

# Clients Module

## Clients List

Purpose

View all clients.

Actions

- Search
- Filter
- Add Client

Columns

- Name
- Company
- Email
- Active Projects

---

## Client Details

Sections

Profile

Contact

Proposals

Invoices

Payments

Actions

- Edit
- Delete

---

# Proposal Module

## Proposal List

Purpose

Manage proposals.

Filters

- Draft
- Sent
- Accepted
- Rejected

Actions

- Create Proposal

---

## Create Proposal

Sections

1.

Client

2.

Project Information

3.

Line Items

4.

Terms

5.

Preview

Actions

- Save Draft

- Generate PDF

- Send Email

---

## Proposal Details

Purpose

View proposal.

Actions

- Edit

- Duplicate

- Download PDF

- Send Again

- Convert to Contract

---

# Contract Module

## Contract List

View all contracts.

Status

Draft

Sent

Signed

---

## Contract Details

Sections

Template

Generated PDF

Signed Copy

Actions

Generate PDF

Upload Signed Copy

---

# Invoice Module

## Invoice List

Status

Draft

Sent

Paid

Overdue

---

## Create Invoice

Sections

Client

Items

GST

Discount

Due Date

Notes

Actions

Preview

Download PDF

Send Email

---

## Invoice Details

View invoice.

Actions

Record Payment

Download PDF

---

# Payments Module

## Payment List

Shows all recorded payments.

Columns

Invoice

Client

Amount

Method

Status

---

## Payment Details

Fields

Reference Number

Method

Date

Notes

Actions

Edit

Delete

---

# Settings

Business Information

Company Name

Logo

GSTIN

Address

Email

Phone

Invoice Settings

Default Currency

Default GST

Invoice Prefix

Profile

Change Password

Logout

---

# Navigation Rules

Dashboard

↓

Clients

↓

Proposal

↓

Contract

↓

Invoice

↓

Payment

Every document must always belong to one Client.

No orphan records.

---

# Global Components

Top Navigation

Sidebar

Breadcrumb

Search

Notifications (future)

Profile Menu

Toast Messages

Confirmation Dialog

Loader

Empty State

Error State

---

# MVP Boundaries

Included

Authentication

Dashboard

Clients

Proposal

Contract

Invoice

Payments

Settings

Excluded

CRM

Projects

Tasks

Calendar

Expenses

GST Filing

AI

Team Members

Client Portal

Time Tracking

Mobile App

---

# Success Flow

Signup

↓

Create Client

↓

Create Proposal

↓

Proposal Accepted

↓

Generate Contract

↓

Upload Signed Contract

↓

Generate Invoice

↓

Receive Payment

↓

Completed

---

Status

Draft v1

Architecture Owner

ChatGPT
