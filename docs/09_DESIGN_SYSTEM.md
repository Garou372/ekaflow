# EkaFlow Design System

Version: 1.0

Status: Approved

Owner: UI/UX (Gemini)

---

# Design Philosophy

- Modern SaaS
- Minimal
- Fast
- Professional
- White-first interface
- Desktop-first
- Mobile-friendly

---

# Brand

Primary Color

Indigo

`#4F46E5`

Background

White

Typography

Inter

UI Library

shadcn/ui

Icons

lucide-react

---

# Color Tokens

## Primary

- Primary: Indigo
- Primary Foreground: White

## Secondary

- Neutral Gray

## Semantic Colors

Success

Green

Warning

Amber

Destructive

Red

Muted

Light Gray

Border

Light Gray

Card

White

---

# Typography

Font Family

Inter

Font Scale

- xs → 12px
- sm → 14px
- base → 16px
- lg → 18px
- xl → 20px
- 2xl → 24px
- 3xl → 36px

---

# Spacing

Use Tailwind default 4px spacing scale.

Examples

- p-4
- p-6
- gap-6
- gap-8

---

# Border Radius

Small

4px

Medium

6px

Large

8px

---

# Shadows

Cards

shadow-md

Dropdowns

shadow-lg

Small Elements

shadow-sm

---

# Breakpoints

Mobile

< 768px

Tablet

768px–1024px

Desktop

> = 1024px

---

# Proposal Builder

## Desktop Layout

Split Screen

Left (40%)

Proposal Form

Right (60%)

Live PDF Preview

Preview updates in real time as fields change.

## Mobile Layout

Single Column

Form

↓

Show Preview Button

↓

Preview Modal / Preview Section

---

# Contract Builder

Desktop

Left

Editable Form

Right

Live Contract Preview

Mobile

Form First

↓

Preview

---

# Invoice Builder

Desktop

Left

Invoice Form

Right

Live Invoice Preview

Real-time calculations

- Subtotal
- GST
- Discount
- Grand Total

Mobile

Form

↓

Preview

---

# Dashboard

Quick Actions section below page title.

Buttons

- - New Client
- - New Proposal
- - New Invoice

Use Secondary button variant.

---

# Sidebar

## Top

- EkaFlow Logo
- Workspace Name
- Divider

## Middle

- Dashboard
- Clients
- Proposals
- Contracts
- Invoices
- Payments

## Bottom

- Settings
- Help
- Logout

Logout should open a confirmation modal.

---

# Empty States

Every module follows the same structure.

Includes

- Icon
- Heading
- Description
- Primary CTA

Example

No Proposals Yet

Create your first proposal to send to a client.

Button

- Create Proposal

---

# Status Badges

## Proposal

- Draft
- Sent
- Accepted
- Rejected
- Expired

## Contract

- Draft
- Generated
- Signed

## Invoice

- Draft
- Sent
- Paid
- Overdue

## Payment

- Pending
- Completed

Semantic colors should be used consistently.

---

# Responsive Rules

## Sidebar

Mobile

Hamburger Drawer

Tablet

Collapsed / Icon Only

Desktop

Always Visible

---

## Tables

Mobile

Cards or Horizontal Scroll

Tablet

Horizontal Scroll

Desktop

Full Table

---

## Forms

Mobile

Single Column

Tablet

1–2 Columns

Desktop

Two Column Layout where appropriate

---

## Live Preview

Mobile

Preview Button / Modal

Tablet

Split Layout

Desktop

Split Layout

---

# Buttons

Variants

- Primary
- Secondary
- Outline
- Ghost
- Destructive

---

# Inputs

States

- Default
- Focus
- Error
- Disabled

Validation messages displayed below inputs.

---

# Cards

White background

Rounded corners

Medium shadow

Consistent spacing

---

# Toast Notifications

Types

- Success
- Error
- Warning
- Info

Position

Top Right

---

# Loading States

Use Skeleton loaders.

Avoid spinner-only interfaces.

---

# Accessibility

- Visible focus states
- Keyboard navigation
- Semantic HTML
- Sufficient color contrast

---

# Design Tokens

## Colors

Use shadcn/ui token system.

Semantic tokens

- success
- warning
- destructive

## Radius

Base Radius

8px

## Animations

Default

200ms

Ease Out

## Z-Index

- 10
- 20
- 30
- 40
- 50

---

# MVP Notes

Dark Mode.

add some advanced animations.

 glassmorphism.

some gradients.

Prioritize speed, clarity and consistency over visual complexity.
