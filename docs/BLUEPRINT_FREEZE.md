# EkaFlow Security Architecture

Version: 1.0

Status: Draft

Owner: Product Architecture

---

# Purpose

This document defines the security principles, authentication flow,
authorization rules, storage security, and data protection strategy for EkaFlow.

Security is designed using the principle:

"Every user owns only their own data."

---

# Security Principles

EkaFlow follows these principles:

• Authentication before access

• Authorization on every request

• Private user data

• Principle of Least Privilege

• Secure by Default

• No public business data

---

# Authentication

Provider

Supabase Auth

Method

Email + Password

Future

Google Login

GitHub Login

OTP Login

---

# Login Flow

Landing Page

↓

Login

↓

Supabase Authentication

↓

JWT Session Created

↓

Session Stored

↓

Protected Routes Enabled

↓

Dashboard

---

# Session Management

Supabase manages:

Access Token

Refresh Token

Session Expiration

Automatic Refresh

The frontend should never manually manage JWT tokens.

---

# Authorization

Every request must verify:

1.

Authenticated User

2.

Resource Ownership

Example

User A

↓

Owns Client A

Cannot access

User B Client

---

# Row Level Security (RLS)

RLS must be enabled on every table.

Tables

Users

Clients

Engagements

Proposals

Contracts

Invoices

Payments

Settings

Storage Metadata

---

# RLS Rule

Simple Rule

Only allow access where

resource.user_id == auth.uid()

No exceptions.

---

# Storage Security

Storage Buckets

proposal-pdfs

contract-pdfs

invoice-pdfs

logos

Visibility

Private

Files are never public.

---

# File Access Flow

Generate PDF

↓

Upload to Storage

↓

Store File Path

↓

Authenticated Request

↓

Temporary Signed URL

↓

Download

Never expose direct storage paths.

---

# API Security

Every API request must:

Validate JWT

↓

Validate Ownership

↓

Validate Input

↓

Perform Operation

↓

Return Response

No endpoint should trust client input.

---

# Input Validation

Frontend

React Hook Form

-

Zod

Backend

Validate again

Never trust frontend validation.

---

# Password Policy

Minimum

8 Characters

Recommended

12+

Passwords are hashed by Supabase.

Passwords are never stored by EkaFlow.

---

# Secrets

Never expose

Service Role Key

Resend API Key

Razorpay Secret

Environment Variables

Database Password

Only publish

Supabase URL

Supabase Anon Key

---

# HTTPS

Production

HTTPS Only

HTTP

Development Only

---

# Rate Limiting

MVP

Handled by Supabase

Future

Per-IP

Per-User

Per-Endpoint

---

# Error Messages

Do not expose

Database Errors

SQL Errors

Stack Traces

Internal IDs

Users should only see friendly messages.

Example

❌ Invalid credentials

Instead of

❌ SQL Exception...

---

# Audit Fields

Every business table contains

created_at

updated_at

created_by

Future

last_login

last_activity

deleted_at

---

# Soft Delete

Preferred

Records should be archived before permanent deletion.

Hard delete only when necessary.

---

# Data Ownership

Every entity belongs to one User.

User

↓

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

Ownership is inherited through the hierarchy.

---

# Security Checklist

Authentication

✓

Authorization

✓

Private Storage

✓

RLS Enabled

✓

HTTPS

✓

Environment Variables

✓

Input Validation

✓

Output Sanitization

✓

Audit Fields

✓

Soft Delete

✓

---

# Future Security

Two-Factor Authentication

Login History

Device Management

Activity Logs

Session Revocation

API Keys

Client Portal Permissions

---

# Golden Rule

Never trust the client.

Always validate on the server.

Every request must verify:

Authentication

-

Authorization

-

Ownership

before performing any action.
