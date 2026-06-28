# USER FLOW v1.0

Project: EkaFlow

Version: 1.0

Owner: Product Architecture (ChatGPT)

Status: Draft

---

# Purpose

This document defines the complete user journey for the EkaFlow MVP.

It explains every important interaction from signup to receiving payment.

---

# Primary User

Indian Freelancer / Consultant

Goal:

Get paid faster by managing the complete client workflow in one place.

---

# Complete Workflow

```
Signup
↓

Dashboard
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

Share Invoice

↓

Record Payment

↓

Completed
```

---

# FLOW 1

User Registration

Landing Page

↓

Click "Get Started"

↓

Signup

↓

Verify Email

↓

Login

↓

Dashboard

Success:

User enters application.

---

# FLOW 2

Create Client

Dashboard

↓

Click

New Client

↓

Fill Form

↓

Save

↓

Client Created

↓

Redirect

Client Details

---

Required Fields

Name

Email

Company (optional)

Phone (optional)

GSTIN (optional)

Billing Address (optional)

---

Validation

Name required

Valid email

Duplicate email warning

---

# FLOW 3

Create Proposal

Dashboard

↓

New Proposal

↓

Select Client

↓

Enter Project Details

↓

Add Line Items

↓

Review Pricing

↓

Add Terms

↓

Preview

↓

Save Draft

OR

Generate PDF

OR

Send Email

---

Proposal Status

Draft

↓

Sent

↓

Accepted

OR

Rejected

---

Validation

Client required

Minimum one line item

Amount > 0

---

# FLOW 4

Generate Contract

Proposal Accepted

↓

Generate Contract

↓

Select Template

↓

Auto Fill Details

↓

Preview

↓

Generate PDF

↓

Download

↓

Upload Signed Copy

↓

Status = Signed

---

Validation

Proposal must be Accepted

---

# FLOW 5

Generate Invoice

Contract Signed

↓

Create Invoice

↓

Review Client

↓

Review Items

↓

GST

↓

Due Date

↓

Generate PDF

↓

Send Invoice

↓

Invoice Status = Sent

---

Validation

Signed contract required

Invoice number auto-generated

---

# FLOW 6

Receive Payment

Invoice Sent

↓

Client Pays

↓

Click

Record Payment

↓

Enter

Amount

Method

Reference Number

↓

Save

↓

Invoice Status

Paid

↓

Dashboard Updates

Revenue

Pending Invoices

Payment History

---

Payment Methods

UPI

Bank Transfer

Cash

Cheque

Razorpay (future)

---

# Dashboard Flow

Login

↓

Dashboard

↓

User Can

Create Client

OR

Create Proposal

OR

View Invoices

OR

Check Payments

OR

Open Settings

---

# Settings Flow

Dashboard

↓

Settings

↓

Business Details

↓

Upload Logo

↓

GSTIN

↓

Invoice Prefix

↓

Save

---

# Error Flows

Login Failed

↓

Show Error

↓

Retry

---

Proposal Send Failed

↓

Retry

↓

Save Draft

---

Invoice Generation Failed

↓

Retry

---

Upload Failed

↓

Retry

---

# Success States

Client Created

Proposal Saved

Proposal Sent

Contract Generated

Contract Uploaded

Invoice Generated

Payment Recorded

---

# Navigation Rules

Dashboard is the home screen.

Clients can have multiple engagements.

Each engagement can have:

Proposal

↓

Contract

↓

Invoice

↓

Payment

Navigation always follows this order.

---

# Exit Points

Logout

Session Expired

Browser Closed

---

# MVP Complete

If the user can:

Create Client

↓

Create Proposal

↓

Generate Contract

↓

Generate Invoice

↓

Record Payment

without confusion,

the user flow is successful.
