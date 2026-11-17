-- ============================================================
-- TchotchoPay — Supabase Data API Grants
-- RUN THIS IN SUPABASE SQL EDITOR BEFORE OCTOBER 30, 2026
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================
-- Required because Supabase stops auto-granting Data API access
-- to new public schema tables after Oct 30, 2026.
-- Your existing tables are fine — this covers any new ones
-- and ensures consistent access going forward.
-- ============================================================

-- ── TABLE: users ────────────────────────────────────────────
-- Used by: register.js, login.js, admin-users.js, agent functions

GRANT SELECT, INSERT, UPDATE
  ON public.users
  TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.users
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.users
  TO service_role;

-- ── TABLE: transactions ──────────────────────────────────────
-- Used by: stripe-deposit-webhook.js, wallet-pay.js

GRANT SELECT
  ON public.transactions
  TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.transactions
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.transactions
  TO service_role;

-- ── TABLE: agent_floats ──────────────────────────────────────
-- Used by: agent-dashboard, admin-users.js, agent-register.js

GRANT SELECT
  ON public.agent_floats
  TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.agent_floats
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.agent_floats
  TO service_role;

-- ── TABLE: agent_loads ───────────────────────────────────────
-- Used by: agent cash load transactions

GRANT SELECT
  ON public.agent_loads
  TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.agent_loads
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.agent_loads
  TO service_role;

-- ── TABLE: agent_topups ──────────────────────────────────────
-- Used by: agent float top-up flow (ACH, card, Zelle)

GRANT SELECT
  ON public.agent_topups
  TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.agent_topups
  TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.agent_topups
  TO service_role;

-- ============================================================
-- VERIFY: Run this after to confirm grants are applied
-- ============================================================
-- SELECT grantee, table_name, privilege_type
-- FROM information_schema.role_table_grants
-- WHERE table_schema = 'public'
--   AND table_name IN ('users','transactions','agent_floats','agent_loads','agent_topups')
-- ORDER BY table_name, grantee;
-- ============================================================
-- FUTURE TABLES: Any new table you create after Oct 30 must
-- include these same GRANT statements in the same migration.
-- Template for new tables:
--
-- GRANT SELECT ON public.new_table TO anon;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.new_table TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.new_table TO service_role;
-- ============================================================
