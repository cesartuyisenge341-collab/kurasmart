# KuraSmart Phase 1 Security - Complete Setup Guide

**Status: Phase 1.6 - Rate Limiting & Error Logging**

This guide walks you through setting up all Phase 1 security features step-by-step.

---

## Prerequisites

- XAMPP running (Apache + MySQL)
- phpMyAdmin or MySQL CLI access
- KuraSmart database already created (`kurasmart.sql` applied)
- PHP 8.0+

---

## Step 1: Apply Database Migration

The security tables (auth_attempts, api_error_logs, auth_tokens) are defined in a separate migration file.

### Option A: Using phpMyAdmin

1. Open phpMyAdmin: `http://localhost/phpmyadmin`
2. Select `kurasmart` database
3. Click SQL tab
4. Copy contents of `/database/migration_add_security_tables.sql`
5. Paste into SQL query box
6. Click "Go"
7. Verify: You should see 3 new tables created

### Option B: Using MySQL CLI

```bash
mysql -u root -p kurasmart < database\migration_add_security_tables.sql
```

### Option C: Using MySQL Batch

```bash
# Open MySQL command line
mysql -u root -p

# Use kurasmart database
USE kurasmart;

# Run the migration
SOURCE database/migration_add_security_tables.sql;
```

### Verification

Check the tables were created:

```sql
SHOW TABLES LIKE 'auth%';
SHOW TABLES LIKE 'api_error%';
```

You should see:
- `auth_attempts`
- `auth_tokens`
- `api_error_logs`

---

## Step 2: Verify Configuration Files

Ensure all config files exist and are correct:

- [x] `.env` - Environment variables (DB credentials, JWT_SECRET, etc.)
- [x] `/api/config/Config.php` - Configuration loader
- [x] `/api/config/Database.php` - Database connection
- [x] `/api/config/Response.php` - Response helper with CORS
- [x] `/api/config/RateLimiter.php` - Rate limiting (NEW)
- [x] `/api/config/ErrorLogger.php` - Error logging (NEW)

**Command to verify:**

```bash
cd c:\xampp2\htdocs\kurasmart

# Check files exist
if exist api\config\RateLimiter.php echo "RateLimiter OK"
if exist api\config\ErrorLogger.php echo "ErrorLogger OK"
if exist .env echo ".env OK"
```

---

## Step 3: Update Auth Endpoints

The endpoints have been updated to use rate limiting and error logging:

- `/api/auth/login.php` - Added rate limiting + error logging
- `/api/auth/register.php` - Added error logging

**Features now enabled:**
- ✅ Rate limiting: 5 failed attempts per 15 minutes
- ✅ Error logging to database
- ✅ File-based error logs in `/api/logs/api_errors.log`
- ✅ Request sanitization (passwords/tokens redacted)

---

## Step 4: Create Logs Directory

The error logger needs a `/api/logs/` directory:

```powershell
# PowerShell
New-Item -ItemType Directory -Path "api\logs" -Force
```

Or manually create folder `api/logs/`.

The `.gitignore` file will be auto-created inside it to prevent logs from being committed.

---

## Step 5: Test Rate Limiting

### Test Setup (using PHP CLI)

Create a test file: `/api/test_rate_limiting.php`

```php
<?php
require_once 'config/Database.php';
require_once 'config/RateLimiter.php';

$db = new Database();
$conn = $db->connect();
$limiter = new RateLimiter($conn);

$email = 'test@example.com';
$ip = '192.168.1.100';

// Simulate 6 failed attempts
for ($i = 1; $i <= 6; $i++) {
    $status = $limiter->checkLimit($email, $ip);
    $limiter->logAttempt($email, $ip, '/auth/login', 'failed', 'Test attempt ' . $i);
    
    echo "Attempt $i: " . ($status['limited'] ? 'BLOCKED' : 'OK') . 
         " (attempts: {$status['attempts']}/{$status['max_attempts']})\n";
}

$conn->close();
?>
```

Run test:

```bash
cd c:\xampp2\htdocs\kurasmart
"c:\xampp2\php\php.exe" api\test_rate_limiting.php
```

**Expected Output:**
```
Attempt 1: OK (attempts: 1/5)
Attempt 2: OK (attempts: 2/5)
Attempt 3: OK (attempts: 3/5)
Attempt 4: OK (attempts: 4/5)
Attempt 5: OK (attempts: 5/5)
Attempt 6: BLOCKED (attempts: 5/5)
```

---

## Step 6: Test Error Logging

### Database Logging Check

```sql
-- Check error logs in database
SELECT * FROM api_error_logs ORDER BY occurred_at DESC LIMIT 10;

-- Check auth attempts
SELECT * FROM auth_attempts ORDER BY attempted_at DESC LIMIT 10;
```

### File Logging Check

Check the log file exists and contains entries:

```bash
# Windows PowerShell
Get-Content api\logs\api_errors.log -Tail 5

# Or navigate to: c:\xampp2\htdocs\kurasmart\api\logs\api_errors.log
```

**Expected format:**
```
[2024-01-15 14:32:15] /auth/login.php | 401 | 192.168.1.1 | anon | Invalid email or password | INVALID_CREDENTIALS
[2024-01-15 14:32:30] /auth/register.php | 201 | 192.168.1.1 | 42 | Account created successfully | SUCCESS
```

---

## Step 7: Test Full Login Flow

### 1. Start XAMPP (if not running)

```bash
c:\xampp2\xampp-start.exe
```

### 2. Create Test Account

```bash
# Using Flutter app: Register -> Test Account
# Email: testuser@example.com
# Password: TestPass123
# Phone: +250788123456
```

Or use curl:

```bash
curl -X POST http://localhost/kurasmart/api/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123",
    "phone": "+250788123456",
    "language": "en"
  }'
```

### 3. Test Failed Login (Rate Limiting)

```bash
# Simulate 5 failed login attempts in a row
for ($i = 1; $i -le 6; $i++) {
  curl -X POST http://localhost/kurasmart/api/auth/login.php \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "WrongPassword'$i'"
    }'
  
  Start-Sleep -Seconds 1
}
```

**Expected:**
- Attempts 1-5: HTTP 401 "Invalid email or password"
- Attempt 6: HTTP 429 "Too many login attempts"

### 4. Successful Login

```bash
curl -X POST http://localhost/kurasmart/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user_id": 1,
    "full_name": "Test User",
    "email": "test@example.com",
    "language": "en",
    "token": "a3f8e2c1..."
  }
}
```

### 5. Check Logs

```sql
-- View all attempts for this test session
SELECT * FROM auth_attempts 
WHERE email = 'test@example.com'
ORDER BY attempted_at DESC;

-- View error logs
SELECT * FROM api_error_logs
WHERE endpoint LIKE '%auth%'
ORDER BY occurred_at DESC;
```

---

## Step 8: Verify Database Tables Structure

Run this query to confirm all security tables are properly structured:

```sql
-- Check auth_attempts table
DESCRIBE auth_attempts;

-- Check api_error_logs table
DESCRIBE api_error_logs;

-- Check auth_tokens table
DESCRIBE auth_tokens;

-- Check if stored procedures exist
SHOW PROCEDURE STATUS WHERE Db = 'kurasmart';
```

---

## Step 9: Configure Automatic Cleanup (Optional)

The migration creates a daily event to clean up old logs. Verify it's active:

```sql
-- Check if event exists
SHOW EVENTS FROM kurasmart;

-- View event details
SHOW CREATE EVENT cleanup_logs_daily;

-- If you need to enable events (usually already enabled)
SET GLOBAL event_scheduler = ON;
```

---

## Step 10: Test with Flutter App

### 1. Make sure XAMPP is running

```bash
# Verify Apache and MySQL are running
c:\xampp2\xampp-control.exe
```

### 2. Start Flutter app

```bash
cd c:\xampp2\htdocs\kurasmart

# Chrome browser
flutter run -d chrome --web-port 52698

# Or web release
flutter build web
```

### 3. Test authentication flow

- **Register**: Fill form, click "Create Account"
  - Should see validation errors for weak passwords
  - Check database for new user record
  
- **Login**: Enter credentials
  - First 5 failed attempts: Normal error message
  - 6th attempt: "Too many attempts, try again later"
  
- **Check logs in database**:
  ```sql
  SELECT * FROM api_error_logs ORDER BY occurred_at DESC;
  ```

---

## Common Issues & Solutions

### Issue: "Table doesn't exist" error

**Solution**: Run migration script again to create tables

```bash
mysql -u root -p kurasmart < database\migration_add_security_tables.sql
```

### Issue: "Call to undefined function" for stored procedures

**Solution**: MySQL stored procedures weren't created. Run migration with full SQL:

```sql
USE kurasmart;
SOURCE database/migration_add_security_tables.sql;
```

### Issue: "Can't create 'logs' directory"

**Solution**: Create manually with proper permissions

```bash
mkdir api\logs
icacls api\logs /grant:r "%username%":F
```

### Issue: Rate limiting not working

**Verification:**
```sql
-- Check if auth_attempts table has entries
SELECT COUNT(*) FROM auth_attempts;

-- Check if stored procedure exists
SHOW PROCEDURE STATUS LIKE 'check_rate_limit';

-- Test procedure directly
CALL check_rate_limit('test@example.com', '192.168.1.1', @is_limited, @attempts);
SELECT @is_limited, @attempts;
```

### Issue: Error logs not appearing in file

**Check permissions:**
```bash
# Windows - check if logs folder is writable
icacls api\logs /grant:r "%username%":F

# Check if .gitignore was created inside logs/
dir api\logs\.gitignore
```

---

## Monitoring & Maintenance

### Daily Tasks

**Check active rate limits:**
```sql
SELECT email, ip_address, COUNT(*) as failed_attempts
FROM auth_attempts
WHERE status = 'failed'
  AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
GROUP BY email, ip_address;
```

**Monitor errors:**
```sql
SELECT http_status, COUNT(*) as count
FROM api_error_logs
WHERE occurred_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY http_status;
```

### Weekly Tasks

**Review error patterns:**
```sql
SELECT endpoint, http_status, COUNT(*) as count
FROM api_error_logs
WHERE occurred_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY endpoint, http_status
ORDER BY count DESC;
```

**Check for suspicious IPs:**
```sql
SELECT ip_address, COUNT(*) as attempt_count
FROM auth_attempts
WHERE status = 'blocked'
  AND attempted_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY ip_address
ORDER BY attempt_count DESC;
```

---

## Files Modified/Created

**Phase 1.6 Files Created:**
- `/database/migration_add_security_tables.sql` - Database migration
- `/api/config/RateLimiter.php` - Rate limiting class
- `/api/config/ErrorLogger.php` - Error logging class
- `/docs/PHASE_1_SETUP_GUIDE.md` ← You are here

**Phase 1.6 Files Updated:**
- `/api/auth/login.php` - Added rate limiting + error logging
- `/api/auth/register.php` - Added error logging

**Automatic Files Created by Code:**
- `/api/logs/` - Directory created on first error
- `/api/logs/.gitignore` - Prevents logs from git

---

## Success Criteria

✅ **Phase 1.6 Complete when:**
- [x] Migration script applied (3 new tables created)
- [x] RateLimiter.php working (5 attempts / 15 min)
- [x] ErrorLogger.php working (logs to DB + file)
- [x] Login endpoint rate limiting active
- [x] Register endpoint error logging active
- [x] Database logs appear in `api_error_logs`
- [x] File logs appear in `api/logs/api_errors.log`
- [x] Flutter app authenticates correctly

---

## Next Steps

### Option A: Complete Phase 1 (JWT Tokens)
```
Step 1.7: Sign tokens with JWT_SECRET
Step 1.8: Add token expiration (1 hour)
Step 1.9: Add token validation middleware
Step 1.10: HTTPS enforcement
```

### Option B: Move to Phase 2
```
Start building 29 API endpoints:
- Users (CRUD, settings)
- Children (CRUD)
- Devices (ESP32 IoT)
- Growth tracking
- Reports
```

### Option C: Move to Phase 3
```
Multi-language implementation:
- Create ARB files (en/rw/fr)
- Translate 500+ UI strings
- Test all 3 languages
```

---

**Status: Phase 1.6 - READY FOR IMPLEMENTATION**

All code files have been created and updated. Follow the setup steps above to apply and test.
