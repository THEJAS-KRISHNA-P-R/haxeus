-- Critical performance indexes
CREATE INDEX IF NOT EXISTS idx_products_featured
  ON products(id);

CREATE INDEX IF NOT EXISTS idx_products_name
  ON products(name);

CREATE INDEX IF NOT EXISTS idx_orders_user_id
  ON orders(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Enable pg_stat_statements to find slow queries
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
