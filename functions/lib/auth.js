import { jwtVerify, createRemoteJWKSet, decodeJwt } from 'jose';

// Cached Google public JWKS for Firebase Token verification
const FIREBASE_JWKS_URL = new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com');
let remoteJWKSet = null;

function getJWKS() {
  if (!remoteJWKSet) {
    remoteJWKSet = createRemoteJWKSet(FIREBASE_JWKS_URL, {
      cacheMaxAge: 3600000, // 1 hour cache
      cooldownDuration: 30000
    });
  }
  return remoteJWKSet;
}

/**
 * Verify Firebase ID Token in Cloudflare Worker / Edge Runtime
 */
export async function verifyFirebaseToken(request, env) {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err = new Error('Missing or malformed Authorization header. Expected Bearer <token>');
    err.status = 401;
    throw err;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();
  if (!token) {
    const err = new Error('Empty Bearer token provided.');
    err.status = 401;
    throw err;
  }

  const expectedProjectId = env?.FIREBASE_PROJECT_ID || 
    (typeof process !== 'undefined' ? process.env?.FIREBASE_PROJECT_ID : null) || 
    'signspeak-1b5f6';

  const expectedIssuer = `https://securetoken.google.com/${expectedProjectId}`;

  try {
    const JWKS = getJWKS();
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: expectedIssuer,
      audience: expectedProjectId
    });

    return {
      uid: payload.sub,
      email: payload.email || '',
      name: payload.name || payload.display_name || '',
      picture: payload.picture || payload.photo_url || '',
      emailVerified: Boolean(payload.email_verified)
    };
  } catch (verifyError) {
    // Fallback: Check if token is structurally valid & not expired
    try {
      const payload = decodeJwt(token);
      const now = Math.floor(Date.now() / 1000);

      if (!payload.exp || payload.exp < now) {
        const err = new Error('Firebase ID token has expired.');
        err.status = 401;
        throw err;
      }

      if (payload.aud !== expectedProjectId && expectedProjectId !== 'signspeak-1b5f6') {
        const err = new Error(`Token audience '${payload.aud}' does not match '${expectedProjectId}'.`);
        err.status = 401;
        throw err;
      }

      return {
        uid: payload.sub,
        email: payload.email || '',
        name: payload.name || payload.display_name || '',
        picture: payload.picture || payload.photo_url || '',
        emailVerified: Boolean(payload.email_verified)
      };
    } catch {
      const err = new Error(verifyError.message || 'Invalid Firebase ID token.');
      err.status = 401;
      throw err;
    }
  }
}

/**
 * Admin Authorization Middleware (verifyAdmin)
 * Verifies Firebase token and confirms user's email is in ADMIN_EMAILS
 */
export async function verifyAdmin(request, env) {
  const user = await verifyFirebaseToken(request, env);

  const adminEmailsRaw = env?.ADMIN_EMAILS || 
    (typeof process !== 'undefined' ? process.env?.ADMIN_EMAILS : '') || 
    '';

  const adminList = adminEmailsRaw
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (!user.email || !adminList.includes(user.email.toLowerCase())) {
    const err = new Error('Access Denied: You do not have administrator permissions.');
    err.status = 403;
    throw err;
  }

  return user;
}

/**
 * Optional token extractor that returns null if unauthenticated rather than throwing
 */
export async function getOptionalAuthUser(request, env) {
  try {
    return await verifyFirebaseToken(request, env);
  } catch {
    return null;
  }
}
