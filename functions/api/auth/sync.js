import { getDb, successResponse, errorResponse } from '../../lib/db.js';
import { verifyFirebaseToken } from '../../lib/auth.js';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;

    // 1. Verify token cryptographically
    const verifiedUser = await verifyFirebaseToken(request, env);

    // 2. Initialize Neon database client
    const sql = getDb(env);

    // 3. Upsert user record in Neon PostgreSQL
    const rows = await sql`
      INSERT INTO users (
        firebase_uid,
        email,
        display_name,
        photo_url,
        last_login_at,
        updated_at
      ) VALUES (
        ${verifiedUser.uid},
        ${verifiedUser.email},
        ${verifiedUser.name || null},
        ${verifiedUser.picture || null},
        NOW(),
        NOW()
      )
      ON CONFLICT (firebase_uid) DO UPDATE SET
        email = EXCLUDED.email,
        display_name = COALESCE(EXCLUDED.display_name, users.display_name),
        photo_url = COALESCE(EXCLUDED.photo_url, users.photo_url),
        last_login_at = NOW(),
        updated_at = NOW()
      RETURNING
        id,
        firebase_uid,
        email,
        display_name,
        photo_url,
        created_at,
        last_login_at;
    `;

    if (!rows.length) {
      return errorResponse('Failed to synchronize user in database.', 500);
    }

    return successResponse(rows[0], 200);
  } catch (err) {
    console.error('[API /api/auth/sync] Error:', err.message);
    const status = err.message.includes('token') || err.message.includes('Authorization') ? 401 : 500;
    return errorResponse(err.message || 'Authentication synchronization failed.', status);
  }
}
