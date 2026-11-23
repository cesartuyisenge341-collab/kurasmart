-- KuraSmart Database User Setup Script
-- Run this in phpMyAdmin SQL Editor to create a dedicated database user
-- This replaces using the root user (least privilege principle)

-- Create dedicated user for KuraSmart app
-- Username: kurasmart_user
-- Password: KuraSmart@2024secure (CHANGE THIS IN PRODUCTION)
CREATE USER IF NOT EXISTS 'kurasmart_user'@'localhost' IDENTIFIED BY 'KuraSmart@2024secure';

-- Grant privileges to kurasmart_user on kurasmart database only
-- These permissions allow the app to read, write, and manage data
GRANT SELECT, INSERT, UPDATE, DELETE ON kurasmart.* TO 'kurasmart_user'@'localhost';

-- Additional privileges needed for common operations
GRANT TRIGGER ON kurasmart.* TO 'kurasmart_user'@'localhost';
GRANT EXECUTE ON kurasmart.* TO 'kurasmart_user'@'localhost';

-- Flush privileges to apply immediately
FLUSH PRIVILEGES;

-- Verify the user was created
SELECT user, host FROM mysql.user WHERE user = 'kurasmart_user';

-- Optional: Verify the grants
SHOW GRANTS FOR 'kurasmart_user'@'localhost';

-- Security reminder:
-- ✅ Created dedicated user (not root)
-- ✅ Limited to kurasmart database only
-- ✅ Cannot create/drop databases or other users
-- ⚠️ IMPORTANT: Change the password 'KuraSmart@2024secure' in .env and this script for production!
-- ⚠️ IMPORTANT: Update the password to a strong, unique value
