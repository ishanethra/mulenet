CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  occupation TEXT,
  account_type TEXT,
  customer_category TEXT,
  opened_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS model_runs (
  id BIGSERIAL PRIMARY KEY,
  status TEXT NOT NULL,
  original_features INTEGER NOT NULL,
  remaining_features INTEGER NOT NULL,
  selected_features JSONB NOT NULL DEFAULT '[]',
  metrics JSONB NOT NULL DEFAULT '{}',
  cleaning_report JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS account_risk_scores (
  id BIGSERIAL PRIMARY KEY,
  account_id TEXT NOT NULL REFERENCES accounts(id),
  probability NUMERIC(8, 6) NOT NULL,
  risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
  risk_category TEXT NOT NULL,
  fraud_dna JSONB NOT NULL,
  top_reasons JSONB NOT NULL DEFAULT '[]',
  emerging_mule_risk JSONB NOT NULL DEFAULT '{}',
  scored_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id BIGSERIAL PRIMARY KEY,
  source_account TEXT NOT NULL,
  target_account TEXT NOT NULL,
  amount NUMERIC(18, 2) NOT NULL,
  currency CHAR(3) NOT NULL DEFAULT 'INR',
  occurred_at TIMESTAMPTZ NOT NULL,
  channel TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS aml_cases (
  id BIGSERIAL PRIMARY KEY,
  account_id TEXT NOT NULL,
  analyst TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT,
  notes TEXT,
  history JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source_account);
CREATE INDEX IF NOT EXISTS idx_transactions_target ON transactions(target_account);
CREATE INDEX IF NOT EXISTS idx_account_risk_scores_account ON account_risk_scores(account_id);
