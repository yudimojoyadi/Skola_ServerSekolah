CREATE TABLE IF NOT EXISTS students (
  id SERIAL PRIMARY KEY,
  nama TEXT,
  kelas TEXT,
  qr_code TEXT UNIQUE
);