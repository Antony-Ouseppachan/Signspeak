import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// Helper to load .dev.vars in local development if present
function loadDevVars() {
  const devVarsPath = path.resolve(process.cwd(), '.dev.vars');
  if (fs.existsSync(devVarsPath)) {
    const content = fs.readFileSync(devVarsPath, 'utf-8');
    const env = {};
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        env[key] = val;
      }
    }
    return env;
  }
  return {};
}

// Vite plugin to serve Cloudflare Pages Functions locally during `npm run dev`
function localCloudflareApiPlugin() {
  return {
    name: 'local-cloudflare-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/')) {
          return next();
        }

        const devEnv = loadDevVars();
        const env = {
          ...process.env,
          ...devEnv
        };

        const url = new URL(req.url, `http://${req.headers.host}`);
        const pathname = url.pathname;

        try {
          let handlerModule = null;

          let params = {};

          if (pathname === '/api/auth/sync') {
            handlerModule = await import('./functions/api/auth/sync.js');
          } else if (pathname === '/api/profile') {
            handlerModule = await import('./functions/api/profile.js');
          } else if (pathname === '/api/contact') {
            handlerModule = await import('./functions/api/contact.js');
          } else if (pathname === '/api/feedback') {
            handlerModule = await import('./functions/api/feedback.js');
          } else if (pathname === '/api/admin/feedback') {
            handlerModule = await import('./functions/api/admin/feedback.js');
          } else if (pathname.startsWith('/api/admin/feedback/')) {
            const id = pathname.replace('/api/admin/feedback/', '');
            params = { id };
            handlerModule = await import('./functions/api/admin/feedback.js');
          } else if (pathname === '/api/admin/contacts') {
            handlerModule = await import('./functions/api/admin/contacts.js');
          } else if (pathname.startsWith('/api/admin/contacts/')) {
            const id = pathname.replace('/api/admin/contacts/', '');
            params = { id };
            handlerModule = await import('./functions/api/admin/contacts.js');
          }

          if (!handlerModule) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: `Endpoint ${pathname} not found.` }));
            return;
          }

          // Buffer request body if any
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          const bodyBuffer = Buffer.concat(chunks);
          const bodyString = bodyBuffer.toString('utf-8');

          const webRequest = new Request(url.toString(), {
            method: req.method,
            headers: req.headers,
            body: ['GET', 'HEAD', 'OPTIONS'].includes(req.method) ? undefined : bodyString
          });

          const context = {
            request: webRequest,
            env,
            params
          };

          let webResponse;
          if (req.method === 'OPTIONS' && handlerModule.onRequestOptions) {
            webResponse = await handlerModule.onRequestOptions(context);
          } else if (req.method === 'POST' && handlerModule.onRequestPost) {
            webResponse = await handlerModule.onRequestPost(context);
          } else if (req.method === 'GET' && handlerModule.onRequestGet) {
            webResponse = await handlerModule.onRequestGet(context);
          } else if (req.method === 'PUT' && handlerModule.onRequestPut) {
            webResponse = await handlerModule.onRequestPut(context);
          } else if (req.method === 'DELETE' && handlerModule.onRequestDelete) {
            webResponse = await handlerModule.onRequestDelete(context);
          } else if (handlerModule.onRequest) {
            webResponse = await handlerModule.onRequest(context);
          } else {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: false, error: `Method ${req.method} not allowed.` }));
            return;
          }

          res.statusCode = webResponse.status;
          webResponse.headers.forEach((val, key) => {
            res.setHeader(key, val);
          });

          const responseText = await webResponse.text();
          res.end(responseText);
        } catch (err) {
          console.error('[Local API Error]:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message || 'Internal Server Error' }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), localCloudflareApiPlugin()],
  server: {
    port: 5173,
    open: false
  }
});
