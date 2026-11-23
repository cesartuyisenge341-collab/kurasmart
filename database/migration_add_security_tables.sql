-- ============================================================================
-- KuraSmart Security Tables Migration
-- Phase 1.6: Rate Limiting & Error Logging
-- ============================================================================

-- Add tables for rate limiting and audit logging
-- Run this after the initial kurasmart.sql schema

-- ============================================================================
-- TABLE: auth_attempts (Rate Limiting & Brute Force Prevention)
-- ============================================================================
CREATE TABLE IF NOT EXISTS auth_attempts (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  ip_address VARCHAR(45) NOT NULL,  -- Supports IPv4 and IPv6
  endpoint VARCHAR(50) NOT NULL,    -- /auth/login or /auth/register
  status ENUM('success', 'failed', 'blocked') DEFAULT 'failed',
  reason VARCHAR(255),              -- Why it failed
  user_agent VARCHAR(255),
  attempted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email_ip (email, ip_address),
  INDEX idx_attempted_at (attempted_at DESC),
  INDEX idx_status (status),
  INDEX idx_endpoint (endpoint)
);

-- ============================================================================
-- TABLE: api_error_logs (Audit & Error Logging)
-- ============================================================================
CREATE TABLE IF NOT EXISTS api_error_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  endpoint VARCHAR(255) NOT NULL,  -- e.g., /auth/login.php
  http_method VARCHAR(10),         -- GET, POST, PUT, DELETE
  http_status INT,                 -- 200, 400, 401, 422, 500, etc.
  ip_address VARCHAR(45),
  user_id INT,                     -- NULL if before auth
  error_message TEXT,
  error_code VARCHAR(50),
  stack_trace TEXT,                -- For 5xx errors
  request_data JSON,               -- Sanitized (no passwords)
  user_agent VARCHAR(255),
  occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_endpoint (endpoint),
  INDEX idx_occurred_at (occurred_at DESC),
  INDEX idx_http_status (http_status),
  INDEX idx_user_id (user_id)
);

-- ============================================================================
-- TABLE: auth_tokens (Session & Token Management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS auth_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  token_type ENUM('bearer', 'refresh') DEFAULT 'bearer',
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT 0,
  ip_address VARCHAR(45),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at),
  INDEX idx_is_revoked (is_revoked)
);

-- ============================================================================
-- Stored Procedure: Check Rate Limit
-- Usage: CALL check_rate_limit('user@example.com', '192.168.1.1', @is_limited, @attempts);
-- ============================================================================
DELIMITER //

DROP PROCEDURE IF EXISTS check_rate_limit//

CREATE PROCEDURE check_rate_limit(
  IN p_email VARCHAR(100),
  IN p_ip_address VARCHAR(45),
  OUT p_is_limited BOOLEAN,
  OUT p_attempt_count INT
)
BEGIN
  DECLARE v_attempt_count INT;
  DECLARE v_oldest_attempt_time DATETIME;
  
  -- Count failed attempts in the last 15 minutes
  SELECT COUNT(*) INTO v_attempt_count
  FROM auth_attempts
  WHERE email = p_email 
    AND ip_address = p_ip_address
    AND status = 'failed'
    AND attempted_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE);
  
  -- If 5 or more failed attempts, block for 15 minutes
  IF v_attempt_count >= 5 THEN
    SET p_is_limited = TRUE;
  ELSE
    SET p_is_limited = FALSE;
  END IF;
  
  SET p_attempt_count = v_attempt_count;
END//

DELIMITER ;

-- ============================================================================
-- Stored Procedure: Log Auth Attempt
-- Usage: CALL log_auth_attempt('user@example.com', '192.168.1.1', '/auth/login', 'success', NULL);
-- ============================================================================
DELIMITER //

DROP PROCEDURE IF EXISTS log_auth_attempt//

CREATE PROCEDURE log_auth_attempt(
  IN p_email VARCHAR(100),
  IN p_ip_address VARCHAR(45),
  IN p_endpoint VARCHAR(50),
  IN p_status VARCHAR(20),
  IN p_reason VARCHAR(255),
  IN p_user_agent VARCHAR(255)
)
BEGIN
  INSERT INTO auth_attempts (email, ip_address, endpoint, status, reason, user_agent, attempted_at)
  VALUES (p_email, p_ip_address, p_endpoint, p_status, p_reason, p_user_agent, NOW());
END//

DELIMITER ;

-- ============================================================================
-- Stored Procedure: Cleanup Old Logs
-- Keep only last 30 days
-- Usage: CALL cleanup_old_logs();
-- ============================================================================
DELIMITER //

DROP PROCEDURE IF EXISTS cleanup_old_logs//

CREATE PROCEDURE cleanup_old_logs()
BEGIN
  -- Delete auth attempts older than 30 days
  DELETE FROM auth_attempts
  WHERE attempted_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
  
  -- Delete error logs older than 30 days
  DELETE FROM api_error_logs
  WHERE occurred_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
  
  -- Delete expired tokens
  DELETE FROM auth_tokens
  WHERE expires_at < NOW() OR is_revoked = TRUE;
END//

DELIMITER ;

-- ============================================================================
-- Initial Data: Create Cleanup Event (runs daily at 2 AM)
-- ============================================================================
CREATE EVENT IF NOT EXISTS cleanup_logs_daily
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  CALL cleanup_old_logs();
