-- Add payment tracking columns to invoices table
ALTER TABLE "invoices"
ADD COLUMN "paid_amount" NUMERIC(12, 2) DEFAULT 0.00,
ADD COLUMN "payment_date" DATE;
