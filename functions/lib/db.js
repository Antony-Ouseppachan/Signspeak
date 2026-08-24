import { neon } from '@neondatabase/serverless';

export function getDb(env) {
  const databaseUrl = env?.DATABASE_URL || (typeof process !== 'undefined' ? process.env?.DATABASE_URL : null);
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured in the server environment.');
  }
  return neon(databaseUrl);
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

export function errorResponse(message, status = 400) {
  return jsonResponse({ success: false, error: message }, status);
}

export function successResponse(data, status = 200) {
  return jsonResponse({ success: true, data }, status);
}
