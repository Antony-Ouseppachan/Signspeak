import { getDb, successResponse, errorResponse } from '../lib/db.js';
import { getOptionalAuthUser } from '../lib/auth.js';

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
    const body = await request.json().catch(() => null);

    if (!body) {
      return errorResponse('Invalid JSON body.', 400);
    }

    const { rating, categories, message, contactOptIn, page } = body;

    // Server-side validation
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return errorResponse('Rating must be between 1 and 5.', 400);
    }

    if (!Array.isArray(categories) || categories.length === 0) {
      return errorResponse('Please select at least one focus category.', 400);
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return errorResponse('Feedback message must be at least 10 characters.', 400);
    }

    if (message.length > 1000) {
      return errorResponse('Feedback message must not exceed 1000 characters.', 400);
    }

    const sql = getDb(env);

    // Optional user association if signed in
    const authUser = await getOptionalAuthUser(request, env);
    let userId = null;

    if (authUser) {
      const userRows = await sql`
        SELECT id FROM users WHERE firebase_uid = ${authUser.uid} LIMIT 1
      `;
      if (userRows.length) {
        userId = userRows[0].id;
      }
    }

    const rows = await sql`
      INSERT INTO feedback (
        user_id,
        rating,
        categories,
        message,
        contact_opt_in,
        page,
        created_at
      ) VALUES (
        ${userId},
        ${numRating},
        ${JSON.stringify(categories)}::jsonb,
        ${message.trim()},
        ${Boolean(contactOptIn)},
        ${page || 'about'},
        NOW()
      )
      RETURNING id, created_at;
    `;

    return successResponse({
      id: rows[0].id,
      message: 'Thank you! Your feedback helps shape the future of SignSpeak.'
    }, 201);
  } catch (err) {
    console.error('[API /api/feedback] Error:', err.message);
    return errorResponse(err.message || 'Failed to submit feedback.', 500);
  }
}
