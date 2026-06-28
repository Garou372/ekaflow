# EkaFlow API Specification

Version: 1.0

Owner: Product Architecture

Status: Draft

---

# Purpose

This document defines how the frontend communicates with the backend.

It specifies:

- Resources
- Endpoints
- Request format
- Response format
- Permissions

No implementation details.

---

# API Principles

- REST API
- JSON Request/Response
- Authenticated endpoints require JWT
- Every user accesses only their own data
- Resource-oriented URLs
- Consistent response format

---

# Base URL

/api/v1

---

# Authentication

## POST /auth/signup

Create a new account.

Request

{
email
password
name
}

Response

{
user
token
}

---

## POST /auth/login

Request

{
email
password
}

Response

{
user
token
}

---

## POST /auth/logout

Logout current user.

---

## POST /auth/forgot-password

Request

{
email
}

---

# Clients

## GET /clients

Returns all clients.

---

## GET /clients/:id

Returns one client.

---

## POST /clients

Create client.

---

## PATCH /clients/:id

Update client.

---

## DELETE /clients/:id

Delete client.

---

# Engagements

## GET /engagements

List engagements.

---

## POST /engagements

Create engagement.

---

## GET /engagements/:id

View engagement.

---

## PATCH /engagements/:id

Update engagement.

---

## DELETE /engagements/:id

Delete engagement.

---

# Proposals

## GET /proposals

List proposals.

---

## POST /proposals

Create proposal.

---

## GET /proposals/:id

View proposal.

---

## PATCH /proposals/:id

Edit proposal.

---

## DELETE /proposals/:id

Delete proposal.

---

## POST /proposals/:id/send

Email proposal.

---

## POST /proposals/:id/pdf

Generate PDF.

---

# Contracts

## GET /contracts

List contracts.

---

## POST /contracts

Generate contract.

---

## GET /contracts/:id

View contract.

---

## POST /contracts/:id/upload

Upload signed contract.

---

# Invoices

## GET /invoices

List invoices.

---

## POST /invoices

Create invoice.

---

## GET /invoices/:id

Invoice details.

---

## POST /invoices/:id/pdf

Generate invoice PDF.

---

## POST /invoices/:id/send

Email invoice.

---

# Payments

## GET /payments

List payments.

---

## POST /payments

Record payment.

---

## PATCH /payments/:id

Update payment.

---

## DELETE /payments/:id

Delete payment.

---

# Dashboard

## GET /dashboard

Returns

Revenue

Pending invoices

Pending proposals

Recent activity

---

# Settings

## GET /settings

User settings.

---

## PATCH /settings

Update settings.

---

# Standard Success Response

{
success: true,
data: {}
}

---

# Standard Error Response

{
success: false,
message: "",
errors: []
}

---

# Authorization Rules

Every resource belongs to one user.

Users cannot access another user's:

Clients

Engagements

Proposals

Contracts

Invoices

Payments

---

# Status Codes

200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

500 Internal Server Error

---

# Versioning

Current

v1

Future

v2
