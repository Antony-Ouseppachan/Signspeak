import { getDb, successResponse, errorResponse } from '../../lib/db.js';
import { verifyFirebaseToken } from '../../lib/auth.js';

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

function calculateExpertiseTier(xp, level, practicedCount) {
  if (xp >= 1000 || practicedCount >= 26) return 'ASL Master';
  if (xp >= 500 || practicedCount >= 18) return 'Fluent Communicator';
  if (xp >= 250 || practicedCount >= 10) return 'Advanced Signer';
  if (xp >= 100 || practicedCount >= 4) return 'Intermediate Fingerspeller';
  return 'Novice Signer';
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    const verifiedUser = await verifyFirebaseToken(request, env);
    const sql = getDb(env);

    // Get user id
    const users = await sql`
      SELECT id FROM users WHERE firebase_uid = ${verifiedUser.uid} LIMIT 1
    `;

    if (!users.length) {
      return errorResponse('User profile not found in database.', 404);
    }

    const userId = users[0].id;

    const rows = await sql`
      SELECT * FROM user_playground_progress WHERE user_id = ${userId} LIMIT 1
    `;

    if (!rows.length) {
      const defaultProgress = {
        xp: 0,
        level: 1,
        streak: 1,
        expertise_tier: 'Novice Signer',
        practiced_letters: [],
        unlocked_achievements: ['first_sign'],
        quiz_high_score: 0,
        words_completed: 0,
        total_drills: 0,
        accuracy_rate: 100.0,
        last_studied_at: new Date().toISOString()
      };
      return successResponse(defaultProgress, 200);
    }

    return successResponse(rows[0], 200);
  } catch (err) {
    console.error('[API /api/playground/progress GET] Error:', err.message);
    const status = err.message.includes('token') || err.message.includes('Authorization') ? 401 : 500;
    return errorResponse(err.message || 'Failed to retrieve study progress.', status);
  }
}

export async function onRequestPut(context) {
  try {
    const { request, env } = context;
    const verifiedUser = await verifyFirebaseToken(request, env);
    const body = await request.json().catch(() => ({}));
    const sql = getDb(env);

    // Get user id
    const users = await sql`
      SELECT id FROM users WHERE firebase_uid = ${verifiedUser.uid} LIMIT 1
    `;

    if (!users.length) {
      return errorResponse('User profile not found in database.', 404);
    }

    const userId = users[0].id;
    const xp = Math.max(0, parseInt(body.xp, 10) || 0);
    const level = Math.max(1, Math.floor(xp / 100) + 1);
    const streak = Math.max(1, parseInt(body.streak, 10) || 1);
    const practicedLetters = Array.isArray(body.practiced_letters) ? body.practiced_letters : [];
    const unlockedAchievements = Array.isArray(body.unlocked_achievements) ? body.unlocked_achievements : ['first_sign'];
    const quizHighScore = Math.max(0, parseInt(body.quiz_high_score, 10) || 0);
    const wordsCompleted = Math.max(0, parseInt(body.words_completed, 10) || 0);
    const totalDrills = Math.max(0, parseInt(body.total_drills, 10) || 0);
    const accuracyRate = typeof body.accuracy_rate === 'number' ? Math.min(100, Math.max(0, body.accuracy_rate)) : 100.0;

    const expertiseTier = calculateExpertiseTier(xp, level, practicedLetters.length);

    const rows = await sql`
      INSERT INTO user_playground_progress (
        user_id,
        xp,
        level,
        streak,
        expertise_tier,
        practiced_letters,
        unlocked_achievements,
        quiz_high_score,
        words_completed,
        total_drills,
        accuracy_rate,
        last_studied_at,
        updated_at
      ) VALUES (
        ${userId},
        ${xp},
        ${level},
        ${streak},
        ${expertiseTier},
        ${JSON.stringify(practicedLetters)}::jsonb,
        ${JSON.stringify(unlockedAchievements)}::jsonb,
        ${quizHighScore},
        ${wordsCompleted},
        ${totalDrills},
        ${accuracyRate},
        NOW(),
        NOW()
      )
      ON CONFLICT (user_id) DO UPDATE SET
        xp = EXCLUDED.xp,
        level = EXCLUDED.level,
        streak = EXCLUDED.streak,
        expertise_tier = EXCLUDED.expertise_tier,
        practiced_letters = EXCLUDED.practiced_letters,
        unlocked_achievements = EXCLUDED.unlocked_achievements,
        quiz_high_score = GREATEST(user_playground_progress.quiz_high_score, EXCLUDED.quiz_high_score),
        words_completed = EXCLUDED.words_completed,
        total_drills = EXCLUDED.total_drills,
        accuracy_rate = EXCLUDED.accuracy_rate,
        last_studied_at = NOW(),
        updated_at = NOW()
      RETURNING *;
    `;

    return successResponse(rows[0], 200);
  } catch (err) {
    console.error('[API /api/playground/progress PUT] Error:', err.message);
    const status = err.message.includes('token') || err.message.includes('Authorization') ? 401 : 500;
    return errorResponse(err.message || 'Failed to save study progress.', status);
  }
}

export async function onRequestPost(context) {
  return onRequestPut(context);
}
