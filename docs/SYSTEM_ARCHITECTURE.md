# EkaFlow System Architecture

Version: 1.0

Status: Draft

Owner: Product Architecture

---

# Purpose

This document defines the overall technical architecture of EkaFlow.

It explains how every part of the system communicates with each other.

This document does NOT contain implementation details.

Instead, it provides a high-level blueprint that every engineer should follow.

---

# High Level Architecture

                    Browser

                        │

                        ▼

              React + Vite Application

                        │

                        ▼

            React Router + Layout System

                        │

                        ▼

              Feature Modules (Pages)

                        │

                        ▼

              UI Components (shadcn/ui)

                        │

                        ▼

              Business Logic Layer

                        │

                        ▼

              Service Layer

                        │

                        ▼

               Supabase Client SDK

              ┌──────────┼──────────┐
              ▼          ▼          ▼

        PostgreSQL   Storage     Auth

              │

              ▼

      External Services

        ├── Resend
        ├── jsPDF
        └── Razorpay (Future)

---

# Architecture Layers

EkaFlow follows a layered architecture.

Presentation Layer

↓

Business Layer

↓

Service Layer

↓

Data Layer

Every layer has one responsibility.

---

# 1. Presentation Layer

Technology

React

Responsibilities

Render UI

Handle user interaction

Display data

Collect form input

Must NOT contain business logic.

---

# 2. Business Layer

Purpose

Contains application rules.

Examples

Proposal Status

Invoice Calculation

Workflow Validation

Permissions

Business logic stays here.

---

# 3. Service Layer

Purpose

Communicates with Supabase.

Examples

Create Client

Create Proposal

Generate Invoice

Upload PDF

This layer isolates the frontend from backend implementation.

---

# 4. Data Layer

Supabase

Contains

Database

Authentication

Storage

Every database interaction passes through this layer.

---

# Application Modules

Authentication

↓

Dashboard

↓

Clients

↓

Engagements

↓

Proposals

↓

Contracts

↓

Invoices

↓

Payments

↓

Settings

Each module owns its own logic.

Modules should never directly depend on each other.

Communication happens through shared services.

---

# Request Flow

User Click

↓

React Component

↓

Feature Logic

↓

Service

↓

Supabase

↓

Database

↓

Response

↓

UI Update

---

# Authentication Flow

User Login

↓

Supabase Auth

↓

JWT Session

↓

Protected Routes

↓

Authenticated User

↓

Load Dashboard

---

# File Flow

Proposal Generated

↓

Generate PDF

↓

Upload to Storage

↓

Save File URL

↓

Display Download Link

The same flow applies to

Contracts

Invoices

---

# Email Flow

Proposal

↓

Generate PDF

↓

Attach PDF

↓

Resend API

↓

Client Email

---

# Invoice Flow

Contract Signed

↓

Generate Invoice

↓

Create PDF

↓

Email Client

↓

Payment Recorded

↓

Dashboard Updated

---

# State Management

UI State

React Hooks

Server State

TanStack Query

Form State

React Hook Form

Validation

Zod

No global state unless absolutely necessary.

---

# Error Handling

Every operation returns

Loading

↓

Success

OR

Failure

UI must always display feedback.

---

# Security Boundary

Every request is authenticated.

Every resource belongs to one user.

Supabase Row Level Security protects every table.

No client-side trust.

---

# Storage Architecture

Private Buckets

proposal-pdfs

contract-pdfs

invoice-pdfs

logos

Files are never public.

---

# External Integrations

Resend

Purpose

Email delivery

-------------

jsPDF

Purpose

PDF generation

-------------

Razorpay

Purpose

Payment collection

Phase 2

---

# Scalability Principles

Feature-based architecture.

Independent modules.

Reusable components.

Reusable services.

No duplicated business logic.

Loose coupling.

High cohesion.

---

# Future Ready

The architecture should support future additions without redesign.

Possible future modules

Client Portal

Recurring Invoices

Milestone Payments

Notifications

Analytics

Without changing the core architecture.

---

# Golden Rule

Presentation Layer never talks directly to the database.

Every request goes through the Service Layer.

This keeps the application maintainable, testable and scalable.