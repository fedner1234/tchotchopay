-- TchotchoPay — Supabase SQL migration
-- Adds Lithic card columns to the users table
-- Run this in the Supabase SQL Editor at:
-- https://supabase.com/dashboard/project/YOUR_PROJECT_REF/sql/new

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS lithic_account_token TEXT,
  ADD COLUMN IF NOT EXISTS lithic_card_token     TEXT;

-- Optional: index for fast lookups (rarely needed since we look up by user id)
-- CREATE INDEX IF NOT EXISTS idx_users_lithic_card ON users (lithic_card_token);
