import { getDb, successResponse, errorResponse } from '../../lib/db.js';
import { verifyAdmin } from '../../lib/auth.js';

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    await verifyAdmin(request, env);

    const sql = getDb(env);
    const rows = await sql`
      SELECT 
        f.id,
        f.user_id,
        f.rating,
        f.categories,
        f.message,
        f.contact_opt_in,
        f.status,
        f.is_starred,
        f.page,
        f.created_at,
        u.email AS user_email,
        u.display_name AS user_name,
        u.photo_url AS user_photo
      FROM feedback f
      LEFT JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC;
    `;

    return successResponse(rows);
  } catch (err) {
    console.error('[Admin API /api/admin/feedback GET] Error:', err.message);
    return errorResponse(err.message || 'Failed to fetch feedback entries.', err.status || 500);
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env, params } = context;
    await verifyAdmin(request, env);

    const url = new URL(request.url);
    const id = params?.id || url.searchParams.get('id');

    if (!id) {
      return errorResponse('Feedback entry ID is required.', 400);
    }

    const sql = getDb(env);
    const rows = await sql`
      DELETE FROM feedback
      WHERE id = ${id}
      RETURNING id;
    `;

    if (!rows.length) {
      return errorResponse('Feedback entry not found.', 404);
    }

    return successResponse({
      id: rows[0].id,
      message: 'Feedback entry deleted successfully.'
    });
  } catch (err) {
    console.error('[Admin API /api/admin/feedback DELETE] Error:', err.message);
    return errorResponse(err.message || 'Failed to delete feedback entry.', err.status || 500);
  }
}

export async function onRequestPut(context) {
  try {
    const { request, env, params } = context;
    await verifyAdmin(request, env);

    const url = new URL(request.url);
    const id = params?.id || url.searchParams.get('id');

    if (!id) {
      return errorResponse('Feedback entry ID is required.', 400);
    }

    const body = await request.json().catch(() => ({}));
    const sql = getDb(env);

    let rows = [];
    if (typeof body.is_starred === 'boolean' && body.status) {
      rows = await sql`
        UPDATE feedback
        SET status = ${body.status}, is_starred = ${body.is_starred}
        WHERE id = ${id}
        RETURNING id, status, is_starred;
      `;
    } else if (typeof body.is_starred === 'boolean') {
      rows = await sql`
        UPDATE feedback
        SET is_starred = ${body.is_starred}
        WHERE id = ${id}
        RETURNING id, status, is_starred;
      `;
    } else if (body.status) {
      rows = await sql`
        UPDATE feedback
        SET status = ${body.status}
        WHERE id = ${id}
        RETURNING id, status, is_starred;
      `;
    } else {
      return errorResponse('No fields provided to update.', 400);
    }

    if (!rows.length) {
      return errorResponse('Feedback entry not found.', 404);
    }

    return successResponse(rows[0]);
  } catch (err) {
    console.error('[Admin API /api/admin/feedback PUT] Error:', err.message);
    return errorResponse(err.message || 'Failed to update feedback entry.', err.status || 500);
  }
}
