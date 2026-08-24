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

    const { name, email, subject, message } = body;

    // Server-side validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return errorResponse('Name must be at least 2 characters.', 400);
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      return errorResponse('A valid email address is required.', 400);
    }

    if (!subject || typeof subject !== 'string' || !subject.trim()) {
      return errorResponse('Please select or specify a subject.', 400);
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return errorResponse('Message must be at least 10 characters.', 400);
    }

    if (message.length > 2000) {
      return errorResponse('Message must not exceed 2000 characters.', 400);
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
      INSERT INTO contact_messages (
        user_id,
        name,
        email,
        subject,
        message,
        status,
        created_at
      ) VALUES (
        ${userId},
        ${name.trim()},
        ${email.trim().toLowerCase()},
        ${subject.trim()},
        ${message.trim()},
        'unread',
        NOW()
      )
      RETURNING id, created_at, status;
    `;

    return successResponse({
      id: rows[0].id,
      status: rows[0].status,
      message: 'Your inquiry has been received. Our team will get back to you shortly.'
    }, 201);
  } catch (err) {
    console.error('[API /api/contact] Error:', err.message);
    return errorResponse(err.message || 'Failed to submit contact message.', 500);
  }
}
