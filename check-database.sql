-- Check database schema
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check enum types
SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role');

-- Check if users table exists and its structure
SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'users';

-- Check existing users
SELECT id, email, role, status FROM users LIMIT 5;