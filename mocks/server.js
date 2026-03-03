const apiMock = require('@ng-apimock/core');
const devInterface = require('@ng-apimock/dev-interface');
const connect = require('connect');
const cors = require('cors');
const http = require('http');
const serveStatic = require('serve-static');

const fs = require('fs');
const path = require('path');
const url = require('url');

const DB_PATH = path.join(__dirname, 'db', 'books.json');

// ---------- tiny JSON db helpers ----------
function ensureDbFile() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '[]', 'utf8');
  }
}

function readDb() {
  ensureDbFile();
  const raw = fs.readFileSync(DB_PATH, 'utf8');
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeDb(next) {
  ensureDbFile();
  fs.writeFileSync(DB_PATH, JSON.stringify(next, null, 2), 'utf8');
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

// ---------- REST middleware ----------
function booksApiMiddleware(req, res, next) {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname || '';

  const prefixes = ['/book-store-bff/v1/books', '/v1/books'];
  const base = prefixes.find(p => pathname === p || pathname.startsWith(p + '/'));
  if (!base) return next();

  const rest = pathname.slice(base.length); // '' or '/:id'
  const id = rest.startsWith('/') ? rest.slice(1) : null;

  // GET /books
  if (req.method === 'GET' && !id) {
    const db = readDb();
    const onSale = parsed.query?.onSale;
    const onlyOnSale = onSale === true || onSale === 'true';

    const list = onlyOnSale ? db.filter(b => b.onSale === true) : db;
    return sendJson(res, 200, list);
  }

  // GET /books/:id
  if (req.method === 'GET' && id) {
    const db = readDb();
    const found = db.find(b => b.id === id);
    if (!found) return sendJson(res, 404, { message: 'Book not found' });
    return sendJson(res, 200, found);
  }

  // POST /books
  if (req.method === 'POST' && !id) {
    return readJsonBody(req).then(body => {
      if (!body || !body.title) {
        return sendJson(res, 400, { message: 'title is required' });
      }

      const db = readDb();
      const created = normalizeBookCreate(body);

      db.unshift(created);
      writeDb(db);

      return sendJson(res, 201, created);
    });
  }

  // PUT /books/:id
  if (req.method === 'PUT' && id) {
    return readJsonBody(req).then(body => {
      const db = readDb();
      const idx = db.findIndex(b => b.id === id);
      if (idx === -1) return sendJson(res, 404, { message: 'Book not found' });

      const updated = normalizeBookUpdate(db[idx], body);
      db[idx] = updated;
      writeDb(db);

      return sendJson(res, 200, updated);
    });
  }

  // DELETE /books/:id
  if (req.method === 'DELETE' && id) {
    const db = readDb();
    const existed = db.some(b => b.id === id);

    const nextDb = db.filter(b => b.id !== id);
    writeDb(nextDb);

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
