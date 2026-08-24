import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_ReOL70VBcXfW@ep-bold-butterfly-b389b1j5-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function migrateColumns() {
  console.log('Connecting to Neon PostgreSQL to add is_starred and status columns...');
  const sql = neon(databaseUrl);

  // Add is_starred to contact_messages
  await sql`
    ALTER TABLE contact_messages 
    ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT FALSE;
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_is_starred ON contact_messages (is_starred);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages (status);`;

  // Add status and is_starred to feedback
  await sql`
    ALTER TABLE feedback 
    ADD COLUMN IF NOT EXISTS status VARCHAR(50) NOT NULL DEFAULT 'unread';
  `;
  await sql`
    ALTER TABLE feedback 
    ADD COLUMN IF NOT EXISTS is_starred BOOLEAN NOT NULL DEFAULT FALSE;
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback (status);`;
  await sql`CREATE INDEX IF NOT EXISTS idx_feedback_is_starred ON feedback (is_starred);`;

  // Star a few sample items so the Starred filter immediately has data
  await sql`
    UPDATE contact_messages 
    SET is_starred = TRUE 
    WHERE id IN (
      SELECT id FROM contact_messages ORDER BY created_at DESC LIMIT 3
    );
  `;

  await sql`
    UPDATE feedback 
    SET is_starred = TRUE 
    WHERE id IN (
      SELECT id FROM feedback ORDER BY created_at DESC LIMIT 3
    );
  `;

  console.log('Successfully added columns and created indexes in Neon PostgreSQL!');
}

migrateColumns().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
