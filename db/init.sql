CREATE TABLE IF NOT EXISTS facts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fact_text  TEXT NOT NULL,
  source_url VARCHAR,
  fetched_at TIMESTAMP DEFAULT now()
);
