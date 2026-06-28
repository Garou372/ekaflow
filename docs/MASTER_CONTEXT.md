# EkaFlow — Master Context v1.0

## Project Name

EkaFlow

---

# Vision

EkaFlow is a modern SaaS platform built for Indian freelancers, solo consultants, and small agencies.

Its goal is to simplify the complete client workflow from the first proposal to the final payment.

Instead of using multiple tools for proposals, contracts, invoices, and payment tracking, users should be able to manage everything from one clean workspace.

Core workflow:

Proposal
→ Contract
→ Invoice
→ Payment

---

# Problem Statement

Today freelancers typically use:

- Word / Google Docs for proposals
- PDF editors for contracts
- Excel for invoices
- WhatsApp for follow-ups
- UPI screenshots for payment confirmation

This creates:

- scattered documents
- inconsistent branding
- missed payments
- manual work
- poor client experience

EkaFlow solves this by creating one connected workflow.

---

# Target Users

Primary

- Indian Freelancers
- Solo Consultants
- Small Agencies (1–10 people)

Examples

- UI/UX Designers
- Developers
- Marketing Consultants
- Content Writers
- Video Editors
- SEO Freelancers
- Branding Agencies

---

# Product Philosophy

Simple.

Fast.

Professional.

Every feature must directly help a freelancer get paid faster.

If a feature does not improve the Proposal → Payment workflow, it does not belong in the MVP.

---

# MVP Scope

The MVP includes only these modules:

1. Authentication
2. Dashboard
3. Clients
4. Proposal Builder
5. Contract Generator
6. Invoice Generator
7. Payment Tracking
8. Settings

No additional modules.

---

# Core Workflow

Signup

↓

Create Client

↓

Create Proposal

↓

Send Proposal

↓

Proposal Accepted

↓

Generate Contract

↓

Upload Signed Contract

↓

Generate Invoice

↓

Share Payment Link

↓

Record Payment

↓

Completed

---

# MVP Features

Authentication

- Email & Password
- Login
- Signup
- Forgot Password

Dashboard

- Revenue
- Pending Proposals
- Pending Invoices
- Recent Activity

Clients

- Create
- Edit
- Delete
- Search

Proposal

- Create
- Edit
- Save Draft
- Preview
- Generate PDF
- Send via Email

Contract

- Generate from Template
- Download PDF
- Upload Signed Copy

Invoice

- GST Invoice
- PDF Export
- Due Date
- Status

Payments

- Record Payment
- Payment Status
- Razorpay Integration (later phase)

Settings

- Business Details
- Logo
- GSTIN
- Invoice Preferences

---

# Out of Scope (Not in MVP)

Do NOT build:

- CRM
- Project Management
- Time Tracking
- Expense Tracking
- Accounting
- GST Filing
- Multi-user Team
- Roles & Permissions
- AI Proposal Generator
- Mobile App
- Calendar
- Chat
- Notifications Engine
- Integrations
- Analytics Dashboard
- Client Portal

These are future roadmap items.

---

# Tech Stack

Frontend

- React
- Vite
- TypeScript
- TailwindCSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query

Backend

- Supabase

Database

- PostgreSQL (Supabase)

Authentication

- Supabase Auth

Storage

- Supabase Storage

Email

- Resend

PDF

- jsPDF

Payments

- Razorpay (after MVP)

Hosting

- Vercel

Budget

$0

---

# Design Philosophy

Minimal.

Clean.

Professional.

Fast.

The interface should feel modern without unnecessary complexity.

Brand

Background

White

Primary Color

#4F46E5

Typography

Inter

Spacing

Generous whitespace

Rounded corners

Soft shadows

Responsive

Desktop first

Mobile friendly

---

# Architecture Principles

Everything revolves around one business workflow:

Client

↓

Proposal

↓

Contract

↓

Invoice

↓

Payment

Every module should connect to this workflow.

Avoid duplicate data.

Keep relationships simple.

Design database for future scalability without overengineering.

---

# Development Principles

1. MVP first

2. No feature creep

3. Reusable components

4. Clean folder structure

5. Type safety

6. Accessibility

7. Responsive design

8. Consistent UI

9. Small commits

10. Documentation before implementation

---

# Team Roles

ChatGPT

Responsible for:

- Product Architecture
- Information Architecture
- Database Design
- API Design
- System Design
- Security
- Technical Decisions

Gemini

Responsible for:

- Design System
- UI/UX
- Screen Layouts
- User Experience
- Component Design

Claude

Responsible for:

- Engineering
- Folder Structure
- Supabase
- React Implementation
- Deployment
- Performance

---

# Success Criteria

A freelancer should be able to:

1. Create a client.

2. Create a proposal.

3. Send proposal.

4. Generate contract.

5. Upload signed contract.

6. Generate invoice.

7. Record payment.

Without leaving EkaFlow.

If this workflow feels effortless, the MVP is successful.

---

# Golden Rule

Whenever there is uncertainty, choose the simpler solution.

Do not optimize for future enterprise features.

Optimize for shipping a useful MVP for Indian freelancers.
