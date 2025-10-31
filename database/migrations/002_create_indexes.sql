-- Receipt Manager Database Schema
-- Migration 002: Create Indexes for Performance

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Receipts indexes
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_purchase_date ON receipts(purchase_date);
CREATE INDEX IF NOT EXISTS idx_receipts_store_cnpj ON receipts(store_cnpj);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_normalized_name ON products(normalized_name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

-- Receipt Items indexes
CREATE INDEX IF NOT EXISTS idx_receipt_items_receipt_id ON receipt_items(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_items_product_id ON receipt_items(product_id);

-- Price History indexes
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_price_history_store_cnpj ON price_history(store_cnpj);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_receipts_user_date ON receipts(user_id, purchase_date DESC);
CREATE INDEX IF NOT EXISTS idx_price_history_product_date ON price_history(product_id, recorded_at DESC);

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Indexes created successfully!';
END $$;
