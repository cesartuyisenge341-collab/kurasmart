-- KuraSmart Database Schema for XAMPP MySQL
-- Simple, professional, and user-friendly
-- Run this in phpMyAdmin

-- Create Database
CREATE DATABASE IF NOT EXISTS kurasmart;
USE kurasmart;

-- ============================================================================
-- TABLE 1: users (Parents/Caregivers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  language ENUM('en', 'rw', 'fr') DEFAULT 'en',
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- TABLE 2: children (Baby Profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS children (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('male', 'female', 'other') DEFAULT 'male',
  photo_url VARCHAR(255),
  birth_weight_kg DECIMAL(4, 2),
  birth_length_cm DECIMAL(5, 1),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);

-- ============================================================================
-- TABLE 3: caregivers (Caregiver Sharing)
-- ============================================================================
CREATE TABLE IF NOT EXISTS caregivers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  caregiver_user_id INT NOT NULL,
  role ENUM('owner', 'caregiver', 'viewer') DEFAULT 'caregiver',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (caregiver_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_access (child_id, caregiver_user_id),
  INDEX idx_caregiver_user_id (caregiver_user_id)
);

-- ============================================================================
-- TABLE 4: devices (IoT Sensors - ESP32)
-- ============================================================================
CREATE TABLE IF NOT EXISTS devices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  child_id INT,
  api_key VARCHAR(100),
  firmware_version VARCHAR(20),
  is_active BOOLEAN DEFAULT 1,
  last_seen TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE SET NULL,
  INDEX idx_device_id (device_id),
  INDEX idx_user_id (user_id),
  INDEX idx_last_seen (last_seen)
);

-- ============================================================================
-- TABLE 5: sensor_readings (Real-time Temperature, Humidity, Motion)
-- ============================================================================
CREATE TABLE IF NOT EXISTS sensor_readings (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  device_id VARCHAR(50) NOT NULL,
  child_id INT NOT NULL,
  temperature_c DECIMAL(4, 1),
  humidity_pct DECIMAL(4, 1),
  motion BOOLEAN DEFAULT 0,
  comfort_score INT CHECK (comfort_score >= 0 AND comfort_score <= 100),
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  INDEX idx_child_recorded (child_id, recorded_at DESC),
  INDEX idx_device_recorded (device_id, recorded_at DESC),
  INDEX idx_recorded_at (recorded_at DESC)
);

-- ============================================================================
-- TABLE 6: growth_records (Height, Weight Tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS growth_records (
  id INT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  measured_on DATE NOT NULL,
  weight_kg DECIMAL(5, 2),
  height_cm DECIMAL(5, 1),
  head_circ_cm DECIMAL(4, 1),
  note TEXT,
  recorded_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (recorded_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_child_date (child_id, measured_on DESC),
  INDEX idx_measured_on (measured_on DESC)
);

-- ============================================================================
-- TABLE 7: care_log (Feeding, Sleep, Diaper Activities)
-- ============================================================================
CREATE TABLE IF NOT EXISTS care_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  child_id INT NOT NULL,
  logged_by INT NOT NULL,
  entry_type ENUM('feeding', 'sleep_start', 'sleep_end', 'diaper', 'mood', 'note') NOT NULL,
  logged_at TIMESTAMP NOT NULL,
  value VARCHAR(100),
  note TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE,
  FOREIGN KEY (logged_by) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_child_time (child_id, logged_at DESC),
  INDEX idx_logged_at (logged_at DESC)
);

-- ============================================================================
-- TABLE 8: user_settings (App Preferences)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  temp_unit ENUM('C', 'F') DEFAULT 'C',
  weight_unit ENUM('kg', 'lb') DEFAULT 'kg',
  height_unit ENUM('cm', 'in') DEFAULT 'cm',
  push_enabled BOOLEAN DEFAULT 1,
  theme ENUM('light', 'dark') DEFAULT 'light',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- ============================================================================
-- Create Views for Easy Data Retrieval
-- ============================================================================

-- View: User with their child count
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id,
  u.full_name,
  u.email,
  COUNT(DISTINCT c.id) as total_children,
  COUNT(DISTINCT d.id) as total_devices,
  u.created_at
FROM users u
LEFT JOIN children c ON u.id = c.user_id
LEFT JOIN devices d ON u.id = d.user_id
GROUP BY u.id;

-- View: Child with latest sensor data
CREATE OR REPLACE VIEW child_latest_sensors AS
SELECT 
  c.id,
  c.name,
  c.user_id,
  sr.temperature_c,
  sr.humidity_pct,
  sr.motion,
  sr.comfort_score,
  sr.recorded_at
FROM children c
LEFT JOIN (
  SELECT device_id, child_id, temperature_c, humidity_pct, motion, comfort_score, recorded_at
  FROM sensor_readings
  WHERE recorded_at = (
    SELECT MAX(recorded_at) FROM sensor_readings sr2 WHERE sr2.child_id = sensor_readings.child_id
  )
) sr ON c.id = sr.child_id;

-- View: Child with latest growth record
CREATE OR REPLACE VIEW child_latest_growth AS
SELECT 
  c.id,
  c.name,
  c.user_id,
  gr.weight_kg,
  gr.height_cm,
  gr.head_circ_cm,
  gr.measured_on
FROM children c
LEFT JOIN growth_records gr ON c.id = gr.child_id
WHERE gr.id = (
  SELECT MAX(id) FROM growth_records gr2 WHERE gr2.child_id = c.id
);

-- ============================================================================
-- Insert Sample Data (Optional)
-- ============================================================================

-- Test user (password: password123)
INSERT INTO users (full_name, email, password_hash, phone, language) 
VALUES ('John Doe', 'john@kurasmart.com', SHA2('password123', 256), '+250788123456', 'en')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- Test child
INSERT INTO children (user_id, name, date_of_birth, gender, birth_weight_kg, birth_length_cm)
VALUES (1, 'Baby John', '2024-01-15', 'male', 3.5, 50.0)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Test device
INSERT INTO devices (device_id, user_id, child_id, api_key, firmware_version)
VALUES ('ESP32-001', 1, 1, 'test_api_key_123', '1.0.0')
ON DUPLICATE KEY UPDATE api_key = VALUES(api_key);

-- Test user settings
INSERT INTO user_settings (user_id, temp_unit, weight_unit)
VALUES (1, 'C', 'kg')
ON DUPLICATE KEY UPDATE temp_unit = VALUES(temp_unit);

-- ============================================================================
-- Queries for Common Operations
-- ============================================================================

-- Get all users
-- SELECT * FROM users WHERE is_active = 1;

-- Get user's children with latest sensor data
-- SELECT c.*, sr.temperature_c, sr.humidity_pct, sr.comfort_score, sr.recorded_at
-- FROM children c
-- LEFT JOIN sensor_readings sr ON c.id = sr.child_id
-- WHERE c.user_id = 1
-- ORDER BY c.created_at DESC;

-- Get latest sensor readings for a child
-- SELECT * FROM sensor_readings
-- WHERE child_id = 1
-- ORDER BY recorded_at DESC
-- LIMIT 50;

-- Get child growth history
-- SELECT * FROM growth_records
-- WHERE child_id = 1
-- ORDER BY measured_on DESC;

-- Get care log activities for a child
-- SELECT * FROM care_log
-- WHERE child_id = 1
-- ORDER BY logged_at DESC
-- LIMIT 100;

-- ============================================================================
-- End of Schema
-- ============================================================================
