CREATE TABLE IF NOT EXISTS nodes (
  id UUID PRIMARY KEY,
  name TEXT,
  type TEXT,
  last_heartbeat TIMESTAMP
);