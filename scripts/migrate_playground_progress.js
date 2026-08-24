import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_ReOL70VBcXfW@ep-bold-butterfly-b389b1j5-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function migratePlaygroundSchema() {
  console.log('Connecting to Neon PostgreSQL to create user_playground_progress table...');
  const sql = neon(databaseUrl);

  await sql`
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
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_playground_user_id ON user_playground_progress (user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_playground_xp ON user_playground_progress (xp DESC);`;

  console.log('Successfully created user_playground_progress table and indexes in Neon PostgreSQL!');
}

migratePlaygroundSchema().catch((err) => {
  console.error('Playground migration failed:', err);
  process.exit(1);
});
