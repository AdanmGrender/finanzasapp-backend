-- FinanzasApp - Schema para PostgreSQL local
-- Ejecutar: psql -U postgres -d finanzasapp -f schema.sql

-- Crear la base de datos (ejecutar primero por separado):
-- CREATE DATABASE finanzasapp;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabla de usuarios (reemplaza auth.users de Supabase)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Perfil del usuario con salario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  salary DECIMAL DEFAULT 0,
  currency TEXT DEFAULT 'UYU',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ingresos mensuales
CREATE TABLE IF NOT EXISTS incomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  concept TEXT NOT NULL,
  amount DECIMAL DEFAULT 0,
  date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos fijos mensuales
CREATE TABLE IF NOT EXISTS fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  concept TEXT NOT NULL,
  amount DECIMAL DEFAULT 0,
  date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gastos diarios/variables
CREATE TABLE IF NOT EXISTS daily_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INT NOT NULL,
  day DATE NOT NULL,
  concept TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_incomes_user_period ON incomes(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_fixed_expenses_user_period ON fixed_expenses(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_daily_expenses_user_period ON daily_expenses(user_id, year, month);

-- Funcion para crear perfil automaticamente al registrar usuario
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
DROP TRIGGER IF EXISTS on_user_created ON users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_user();
