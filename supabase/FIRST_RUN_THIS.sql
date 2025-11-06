-- ============================================
-- HAXEUZ E-COMMERCE DATABASE SCHEMA
-- Complete schema with all features
-- Run this FIRST before any other SQL files
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- USER ROLES TABLE
DROP TABLE IF EXISTS user_roles CASCADE;
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Now you can run email_setup.sql after this
-- The user_roles table needs to exist first for RLS policies to work

-- ============================================
-- INSTRUCTIONS
-- ============================================
-- 1. Run this file first: FIRST_RUN_THIS.sql
-- 2. Then run: complete_ecommerce_schema.sql (for all e-commerce features)
-- 3. Then run: email_setup.sql (for email functionality)
-- 4. Optional: make_admin.sql (to make yourself admin)
