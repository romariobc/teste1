-- Receipt Manager Sample Data
-- Seed 001: Sample data for development and testing

-- Note: This is optional and should only be run in development environment
-- Password for all users: "password123" (hashed with bcrypt)

-- Sample User
INSERT INTO users (email, password_hash, name) VALUES
('demo@receiptmanager.com', '$2b$10$rKjZGvF0f6Rf3mE.KqYz9OqK8vE5bJ.5JdZ8YxQXK7yF0Y8fJ5Y7K', 'Demo User')
ON CONFLICT (email) DO NOTHING;

-- Note: More sample data can be added here if needed
-- For now keeping it minimal as this is just for testing database connection

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ Sample data inserted successfully!';
    RAISE NOTICE 'ℹ️  Demo user: demo@receiptmanager.com / password: password123';
END $$;
