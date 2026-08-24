import { getDb, successResponse, errorResponse } from '../lib/db.js';
import { verifyFirebaseToken } from '../lib/auth.js';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    // Verify token
    const verifiedUser = await verifyFirebaseToken(request, env);
    const sql = getDb(env);

    // Retrieve user record from Neon
    const users = await sql`
      SELECT
        id,
        firebase_uid,
        email,
        display_name,
        photo_url,
        created_at,
        last_login_at
      FROM users
      WHERE firebase_uid = ${verifiedUser.uid}
      LIMIT 1;
    `;

    if (!users.length) {
      return errorResponse('User profile not found in database.', 404);
    }

    const user = users[0];

    // Get counts for feedback, contact inquiries, and ASL study progress
    const [feedbackStats, contactStats, playgroundRows] = await Promise.all([
      sql`SELECT COUNT(*)::int as count FROM feedback WHERE user_id = ${user.id}`,
      sql`SELECT COUNT(*)::int as count FROM contact_messages WHERE user_id = ${user.id}`,
      sql`SELECT * FROM user_playground_progress WHERE user_id = ${user.id} LIMIT 1`
    ]);

    const playground = playgroundRows[0] || {
      xp: 0,
      level: 1,
      streak: 1,
      expertise_tier: 'Novice Signer',
      practiced_letters: [],
      unlocked_achievements: ['first_sign'],
      quiz_high_score: 0,
      words_completed: 0,
      total_drills: 0,
      accuracy_rate: 100.0
    };

    return successResponse({
      ...user,
      stats: {
        feedbackCount: feedbackStats[0]?.count || 0,
        contactCount: contactStats[0]?.count || 0
      },
      playground
    }, 200);
  } catch (err) {
    console.error('[API /api/profile GET] Error:', err.message);
    const status = err.message.includes('token') || err.message.includes('Authorization') ? 401 : 500;
    return errorResponse(err.message || 'Failed to retrieve user profile.', status);
  }
}

export async function onRequestPut(context) {
  try {
    const { request, env } = context;
    const verifiedUser = await verifyFirebaseToken(request, env);
    const body = await request.json().catch(() => ({}));
    const { display_name, photo_url } = body;

    if (!display_name || typeof display_name !== 'string' || display_name.trim().length < 2) {
      return errorResponse('Name must be at least 2 characters long.', 400);
    }

    const sql = getDb(env);

    const rows = await sql`
      UPDATE users
      SET
        display_name = ${display_name.trim()},
        photo_url = COALESCE(${photo_url || null}, photo_url),
        updated_at = NOW()
      WHERE firebase_uid = ${verifiedUser.uid}
      RETURNING id, firebase_uid, email, display_name, photo_url, created_at, last_login_at;
    `;

    if (!rows.length) {
      return errorResponse('User profile not found.', 404);
    }

    return successResponse(rows[0], 200);
  } catch (err) {
    console.error('[API /api/profile PUT] Error:', err.message);
    const status = err.message.includes('token') || err.message.includes('Authorization') ? 401 : 500;
    return errorResponse(err.message || 'Failed to update user profile.', status);
  }
}

export async function onRequestPost(context) {
  return onRequestPut(context);
}

