const apiMock = require('@ng-apimock/core');
const devInterface = require('@ng-apimock/dev-interface');
const connect = require('connect');
const cors = require('cors');
const http = require('http');
const serveStatic = require('serve-static');

const fs = require('fs');
const path = require('path');
const url = require('url');
const crypto = require('crypto');

const DB_PATH = path.join(__dirname, 'db', 'books.json');
const USERS_DB_PATH = path.join(__dirname, 'db', 'users.json');

// Change if you want. You can also read from env: process.env.MOCK_JWT_SECRET
const JWT_SECRET = process.env.MOCK_JWT_SECRET || 'mock-jwt-secret-change-me';
const JWT_EXPIRES_IN_SECONDS = 60 * 60; // 1h

// ---------- tiny JSON db helpers ----------
function ensureDbFile(filePath, defaultJson = '[]') {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultJson, 'utf8');
  }
}

function readDbFile(filePath) {
  ensureDbFile(filePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return null;
  }
}

function writeDbFile(filePath, next) {
  ensureDbFile(filePath);
  fs.writeFileSync(filePath, JSON.stringify(next, null, 2), 'utf8');
}

function readBooksDb() {
  ensureDbFile(DB_PATH, '[]');
  const parsed = readDbFile(DB_PATH);
  return Array.isArray(parsed) ? parsed : [];
}

function writeBooksDb(next) {
  writeDbFile(DB_PATH, Array.isArray(next) ? next : []);
}

function ensureUsersDb() {
  // default admin user if file doesn’t exist
  const defaultUsers = [
    {
      id: 'u-admin',
      username: 'admin',
      password: 'admin', // for mock only
      displayName: 'Admin',
      role: 'admin',
    },
  ];
  ensureDbFile(USERS_DB_PATH, JSON.stringify(defaultUsers, null, 2));
}

function readUsersDb() {
  ensureUsersDb();
  const parsed = readDbFile(USERS_DB_PATH);
  return Array.isArray(parsed) ? parsed : [];
}

function nowIso() {
  return new Date().toISOString();
}

function genId() {
  return `mxs-${Math.floor(Math.random() * 1e9)}-${Math.floor(Math.random() * 1e9)}`;
}

function readJsonBody(req) {
  return new Promise(resolve => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function sendText(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(payload);
}

function sendNoContent(res) {
  res.statusCode = 204;
  res.end();
}

function toNumberString(v, fallback) {
  if (v === null || v === undefined) return fallback;
  const n = Number(v);
  if (Number.isFinite(n)) return String(n);
  return fallback;
}

function normalizeBookCreate(body) {
  return {
    id: genId(),
    lastUpdated: nowIso(),
    lastUpdatedBy: body.lastUpdatedBy ?? 'Mock Server',
    onSale: Boolean(body.onSale),
    pageCount: toNumberString(body.pageCount, '0'),
    price: toNumberString(body.price, '0'),
    title: String(body.title ?? '').trim(),
  };
}

function normalizeBookUpdate(existing, body) {
  return {
    ...existing,
    title: body.title != null ? String(body.title).trim() : existing.title,
    onSale: body.onSale != null ? Boolean(body.onSale) : existing.onSale,
    pageCount: body.pageCount != null ? toNumberString(body.pageCount, existing.pageCount) : existing.pageCount,
    price: body.price != null ? toNumberString(body.price, existing.price) : existing.price,
    lastUpdated: nowIso(),
    lastUpdatedBy: body.lastUpdatedBy ?? existing.lastUpdatedBy ?? 'Mock Server',
  };
}

// ---------- JWT (no extra deps) ----------
function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecodeToString(input) {
  const b64 = String(input).replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4));
  return Buffer.from(b64 + pad, 'base64').toString('utf8');
}

function signJwt(payload, { expiresInSeconds }) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + (expiresInSeconds ?? JWT_EXPIRES_IN_SECONDS);

  const fullPayload = { ...payload, iat, exp };

  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(fullPayload));
  const data = `${headerB64}.${payloadB64}`;

  const signature = crypto.createHmac('sha256', JWT_SECRET).update(data).digest();
  const sigB64 = base64UrlEncode(signature);

  return `${data}.${sigB64}`;
}

function verifyJwt(token) {
  if (!token) return { ok: false, reason: 'missing_token' };

  const parts = String(token).split('.');
  if (parts.length !== 3) return { ok: false, reason: 'bad_format' };

  const [headerB64, payloadB64, sigB64] = parts;
  const data = `${headerB64}.${payloadB64}`;

  const expectedSig = base64UrlEncode(crypto.createHmac('sha256', JWT_SECRET).update(data).digest());
  if (sigB64 !== expectedSig) return { ok: false, reason: 'bad_signature' };

  let payload;
  try {
    payload = JSON.parse(base64UrlDecodeToString(payloadB64));
  } catch {
    return { ok: false, reason: 'bad_payload' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (typeof payload.exp === 'number' && now >= payload.exp) return { ok: false, reason: 'expired' };

  return { ok: true, payload };
}

function getBearerToken(req) {
  const h = req.headers?.authorization || req.headers?.Authorization;
  if (!h) return null;
  const s = Array.isArray(h) ? h[0] : String(h);
  const m = s.match(/^Bearer\s+(.+)$/i);
  return m ? m[1] : null;
}

function requireAuth(req, res) {
  const token = getBearerToken(req);
  const v = verifyJwt(token);

  if (!v.ok) {
    sendJson(res, 401, {
      message: 'Unauthorized',
      errors: [{ reason: v.reason, description: 'Missing/invalid token', identifier: 'auth' }],
      timestamp: nowIso(),
    });
    return { ok: false };
  }

  // attach for later use
  req.user = v.payload;
  return { ok: true, user: v.payload };
}

// ---------- AUTH middleware ----------
function authApiMiddleware(req, res, next) {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '';

  const prefixes = ['/book-store-bff/v1/auth', '/v1/auth'];
  const base = prefixes.find(p => pathname === p || pathname.startsWith(p + '/'));
  if (!base) return next();

  // handle OPTIONS preflight quickly
  if (req.method === 'OPTIONS') return sendNoContent(res);

  const rest = pathname.slice(base.length); // '' or '/login' or '/me'
  const endpoint = rest.startsWith('/') ? rest.slice(1) : '';

  // POST /auth/login
  if (req.method === 'POST' && endpoint === 'login') {
    return readJsonBody(req).then(body => {
      const username = String(body.username ?? '').trim();
      const password = String(body.password ?? '').trim();

      if (!username || !password) {
        return sendJson(res, 400, { message: 'username and password are required' });
      }

      const users = readUsersDb();
      const user = users.find(u => u.username === username && u.password === password);

      if (!user) {
        return sendJson(res, 401, { message: 'Invalid credentials' });
      }

      const token = signJwt(
        {
          sub: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
        },
        { expiresInSeconds: JWT_EXPIRES_IN_SECONDS }
      );

      return sendJson(res, 200, {
        accessToken: token,
        tokenType: 'Bearer',
        expiresIn: JWT_EXPIRES_IN_SECONDS,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          role: user.role,
        },
      });
    });
  }

  // GET /auth/me
  if (req.method === 'GET' && endpoint === 'me') {
    const auth = requireAuth(req, res);
    if (!auth.ok) return;

    return sendJson(res, 200, {
      id: auth.user.sub,
      username: auth.user.username,
      displayName: auth.user.displayName,
      role: auth.user.role,
    });
  }

  return sendJson(res, 404, { message: 'Not found' });
}

// ---------- REST middleware ----------
function booksApiMiddleware(req, res, next) {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '';

  const prefixes = ['/book-store-bff/v1/books', '/v1/books'];
  const base = prefixes.find(p => pathname === p || pathname.startsWith(p + '/'));
  if (!base) return next();

  // handle OPTIONS preflight quickly
  if (req.method === 'OPTIONS') return sendNoContent(res);

  const rest = pathname.slice(base.length); // '' or '/:id'
  const id = rest.startsWith('/') ? rest.slice(1) : null;

  // GET /books
  if (req.method === 'GET' && !id) {
    const db = readBooksDb();
    const onSale = parsed.query?.onSale;
    const onlyOnSale = onSale === true || onSale === 'true';

    const list = onlyOnSale ? db.filter(b => b.onSale === true) : db;
    return sendJson(res, 200, list);
  }

  // GET /books/:id
  if (req.method === 'GET' && id) {
    const db = readBooksDb();
    const found = db.find(b => b.id === id);
    if (!found) return sendJson(res, 404, { message: 'Book not found' });
    return sendJson(res, 200, found);
  }

  // POST /books  (protected)
  if (req.method === 'POST' && !id) {
    const auth = requireAuth(req, res);
    if (!auth.ok) return;

    return readJsonBody(req).then(body => {
      if (!body || !body.title) {
        return sendJson(res, 400, { message: 'title is required' });
      }

      const db = readBooksDb();
      const created = normalizeBookCreate({
        ...body,
        // if FE doesn't send lastUpdatedBy, use logged in displayName
        lastUpdatedBy: body.lastUpdatedBy ?? auth.user.displayName ?? auth.user.username ?? 'Mock Server',
      });

      db.unshift(created);
      writeBooksDb(db);

      return sendJson(res, 201, created);
    });
  }

  // PUT /books/:id (protected)
  if (req.method === 'PUT' && id) {
    const auth = requireAuth(req, res);
    if (!auth.ok) return;

    return readJsonBody(req).then(body => {
      const db = readBooksDb();
      const idx = db.findIndex(b => b.id === id);
      if (idx === -1) return sendJson(res, 404, { message: 'Book not found' });

      const updated = normalizeBookUpdate(db[idx], {
        ...body,
        lastUpdatedBy: body.lastUpdatedBy ?? auth.user.displayName ?? auth.user.username ?? db[idx].lastUpdatedBy,
      });
      db[idx] = updated;
      writeBooksDb(db);

      return sendJson(res, 200, updated);
    });
  }

  // DELETE /books/:id (protected)
  if (req.method === 'DELETE' && id) {
    const auth = requireAuth(req, res);
    if (!auth.ok) return;

    const db = readBooksDb();
    const existed = db.some(b => b.id === id);

    const nextDb = db.filter(b => b.id !== id);
    writeBooksDb(nextDb);

    // keep your “frontend likes 200 JSON”
    return sendJson(res, 200, { ok: true, deleted: existed, bookId: id });
  }

  return next();
}

// ---------- original bootstrapping ----------
const start = (appPort, mockPort) => {
  const app = connect();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  // IMPORTANT: auth before books
  app.use(authApiMiddleware);
  app.use(booksApiMiddleware);

  app.use(apiMock.middleware);

  app.use('/mocking', serveStatic(devInterface));
  app.use(function (req, res, next) {
    if (req.url === '/') {
      res.writeHead(301, { Location: '/mocking' });
      res.end();
    } else {
      next();
    }
  });

  http
    .createServer(app)
    .listen(mockPort, function () {
      console.log('Mock server running on port ' + mockPort + '.');
      console.log('Books DB:', DB_PATH);
      console.log('Users DB:', USERS_DB_PATH);
      console.log('Auth login:', `http://localhost:${mockPort}/book-store-bff/v1/auth/login`);
    })
    .on('error', function () {
      console.log('Mock server is already started.');
    });

  apiMock.processor.process({
    src: 'mocks',
    patterns: {
      mocks: 'api/**/*.json',
      presets: 'api/**/*.preset.json',
    },
    watch: true,
  });
};

exports.start = start;
