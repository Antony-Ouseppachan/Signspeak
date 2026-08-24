import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const databaseUrl = 'postgresql://neondb_owner:npg_ReOL70VBcXfW@ep-bold-butterfly-b389b1j5-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function runMigration() {
  console.log('Connecting to Neon database...');
  const sql = neon(databaseUrl);

  const schemaPath = path.resolve(process.cwd(), 'database', 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Applying database/schema.sql...');
  
  // Neon sql function executes queries
  // Let's run the statements
  await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`;

  await sql`
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
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users (firebase_uid);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);`;

  await sql`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'unread',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_contact_created_at ON contact_messages (created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_user_id ON contact_messages (user_id);`;

  await sql`
    CREATE TABLE IF NOT EXISTS feedback (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      categories JSONB NOT NULL DEFAULT '[]'::jsonb,
      message TEXT NOT NULL,
      contact_opt_in BOOLEAN NOT NULL DEFAULT FALSE,
      page VARCHAR(100) DEFAULT 'about',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback (created_at DESC);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback (user_id);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback (rating);`;

  console.log('Schema migration applied successfully!');

  const tables = await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `;
  console.log('Confirmed tables present in Neon Lakebase PostgreSQL:');
  console.log(tables.map(t => '  - ' + t.table_name).join('\n'));
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
