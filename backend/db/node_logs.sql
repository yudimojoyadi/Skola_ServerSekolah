CREATE TABLE IF NOT EXISTS node_logs (
  id SERIAL PRIMARY KEY,
  node_id UUID,
  qr_code TEXT,
  status TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);