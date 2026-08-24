import { neon } from '@neondatabase/serverless';

const databaseUrl = 'postgresql://neondb_owner:npg_ReOL70VBcXfW@ep-bold-butterfly-b389b1j5-pooler.c-4.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function check() {
  const sql = neon(databaseUrl);
  
  console.log('--- Columns for contact_messages ---');
  const contactCols = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'contact_messages'
    ORDER BY ordinal_position;
  `;
  console.table(contactCols);

  console.log('--- Columns for feedback ---');
  const feedbackCols = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'feedback'
    ORDER BY ordinal_position;
  `;
  console.table(feedbackCols);

  console.log('--- Columns for users ---');
  const userCols = await sql`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
  `;
  console.table(userCols);
}

check().catch(console.error);
