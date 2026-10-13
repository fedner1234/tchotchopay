-- ============================================================
-- TchotchoPay — Agent Cash Load Network Tables
-- Run this in Supabase SQL Editor
-- ============================================================

-- ── 1. Agent Floats ─────────────────────────────────────────
-- One row per approved agent. Tracks their pre-funded float balance.
CREATE TABLE IF NOT EXISTS agent_floats (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id        uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name   text NOT NULL,
  business_type   text NOT NULL,           -- 'barbershop' | 'restaurant' | 'grocery' | 'other'
  address         text NOT NULL,
  city            text NOT NULL,
  state           text NOT NULL,
  zip             text NOT NULL,
  float_balance   numeric(12,2) DEFAULT 0.00 NOT NULL,
  total_loaded    numeric(12,2) DEFAULT 0.00 NOT NULL,  -- lifetime volume
  total_earned    numeric(12,2) DEFAULT 0.00 NOT NULL,  -- lifetime commissions earned
  commission_rate numeric(5,4) DEFAULT 0.0100 NOT NULL, -- 1% default
  status          text DEFAULT 'pending' NOT NULL,       -- 'pending' | 'active' | 'suspended'
  approved_at     timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  UNIQUE(agent_id)
);

-- ── 2. Agent Loads ──────────────────────────────────────────
-- Every cash load transaction an agent performs.
CREATE TABLE IF NOT EXISTS agent_loads (
  id                        uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id                  uuid NOT NULL REFERENCES users(id),
  customer_id               uuid NOT NULL REFERENCES users(id),
  customer_phone            text NOT NULL,
  amount_usd                numeric(10,2) NOT NULL,
  amount_usdc               numeric(10,2) NOT NULL,
  commission_earned         numeric(10,4) DEFAULT 0,     -- agent's cut
  agent_float_before        numeric(12,2) NOT NULL,
  agent_float_after         numeric(12,2) NOT NULL,
  customer_balance_before   numeric(12,2) NOT NULL,
  customer_balance_after    numeric(12,2) NOT NULL,
  status                    text DEFAULT 'completed' NOT NULL,
  created_at                timestamptz DEFAULT now()
);

-- ── 3. Agent Float Top-ups ──────────────────────────────────
-- When an agent sends ACH to TchotchoPay to replenish their float.
CREATE TABLE IF NOT EXISTS agent_topups (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id        uuid NOT NULL REFERENCES users(id),
  amount_usd      numeric(10,2) NOT NULL,
  method          text NOT NULL,            -- 'ach' | 'wire' | 'manual'
  stripe_pi_id    text,                     -- Stripe payment intent if paid by card
  float_before    numeric(12,2) NOT NULL,
  float_after     numeric(12,2) NOT NULL,
  status          text DEFAULT 'pending' NOT NULL, -- 'pending' | 'completed' | 'failed'
  created_at      timestamptz DEFAULT now(),
  completed_at    timestamptz
);

-- ── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_agent_loads_agent    ON agent_loads(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_loads_customer ON agent_loads(customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_loads_phone    ON agent_loads(customer_phone);
CREATE INDEX IF NOT EXISTS idx_agent_topups_agent   ON agent_topups(agent_id, created_at DESC);

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE agent_floats ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_loads  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_topups ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (Netlify functions use service key)
CREATE POLICY "service_role_all" ON agent_floats FOR ALL USING (true);
CREATE POLICY "service_role_all" ON agent_loads  FOR ALL USING (true);
CREATE POLICY "service_role_all" ON agent_topups FOR ALL USING (true);

-- ── Seed: insert a test agent (replace with real agent_id after signup) ──
-- INSERT INTO agent_floats (agent_id, business_name, business_type, address, city, state, zip, float_balance, status)
-- VALUES ('REPLACE-WITH-REAL-USER-UUID', 'Haitian Beauty Supply', 'grocery', '123 NW 54th St', 'Miami', 'FL', '33127', 500.00, 'active');

-- ============================================================
-- After running, check tables exist:
-- SELECT * FROM agent_floats;
-- SELECT * FROM agent_loads;
-- SELECT * FROM agent_topups;
-- ============================================================
