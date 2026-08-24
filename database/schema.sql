-- =============================================================================
-- SignSpeak Lakebase PostgreSQL Database Schema (Neon)
-- =============================================================================
-- Description: Production schema for user authentication, contact inquiries,
-- and community feedback.
-- =============================================================================

-- Enable pgcrypto for UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table (Synchronized with Firebase Authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for instant lookup during Firebase token synchronization
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users (firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- 2. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'unread',
    is_starred BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_user_id ON contact_messages (user_id);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages (status);
CREATE INDEX IF NOT EXISTS idx_contact_is_starred ON contact_messages (is_starred);

-- 3. Community Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    categories JSONB NOT NULL DEFAULT '[]'::jsonb,
    message TEXT NOT NULL,
    contact_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(50) NOT NULL DEFAULT 'unread',
    is_starred BOOLEAN NOT NULL DEFAULT FALSE,
    page VARCHAR(100) DEFAULT 'about',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback (user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback (rating);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback (status);
CREATE INDEX IF NOT EXISTS idx_feedback_is_starred ON feedback (is_starred);

-- 4. User ASL Study Playground & Gamification Progress Table
CREATE TABLE IF NOT EXISTS user_playground_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    streak INTEGER NOT NULL DEFAULT 1,
    expertise_tier VARCHAR(50) NOT NULL DEFAULT 'Novice Signer',
    practiced_letters JSONB NOT NULL DEFAULT '[]'::jsonb,
    unlocked_achievements JSONB NOT NULL DEFAULT '["first_sign"]'::jsonb,
    quiz_high_score INTEGER NOT NULL DEFAULT 0,
    words_completed INTEGER NOT NULL DEFAULT 0,
    total_drills INTEGER NOT NULL DEFAULT 0,
    accuracy_rate NUMERIC(5,2) NOT NULL DEFAULT 100.00,
    last_studied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playground_user_id ON user_playground_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_playground_xp ON user_playground_progress (xp DESC);
