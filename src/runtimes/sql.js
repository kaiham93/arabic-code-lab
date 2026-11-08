const SEED_SQL = `
CREATE TABLE الطلاب (
  المعرف INTEGER PRIMARY KEY AUTOINCREMENT,
  الاسم TEXT NOT NULL,
  العمر INTEGER,
  المدينة TEXT
);
CREATE TABLE المواد (
  المعرف INTEGER PRIMARY KEY AUTOINCREMENT,
  اسم_المادة TEXT NOT NULL,
  الساعات INTEGER
);
INSERT INTO الطلاب (الاسم, العمر, المدينة) VALUES
  ('سارة', 20, 'صنعاء'),
  ('علي', 17, 'عدن'),
  ('ليلى', 22, 'تعز'),
  ('خالد', 19, 'إب');
INSERT INTO المواد (اسم_المادة, الساعات) VALUES
  ('الرياضيات', 3),
  ('البرمجة', 4),
  ('قواعد البيانات', 3);
`;

const SQL_JS_URL = new URL('../../vendor/sql-wasm.js', import.meta.url);
const VENDOR_URL = new URL('../../vendor/', import.meta.url);

let sqlModulePromise = null;
let SQL = null;
let database = null;

function localizedError(message, summaryKey, hintKey = summaryKey, params = {}) {
  const error = new Error(message);
  error.summaryKey = summaryKey;
  error.hintKey = hintKey;
  error.params = params;
  return error;
}

function loadScript(url) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-dynamic-src="${url}"]`);
    if (existing) {
      if (existing.dataset.loaded === 'true') resolve();
      else {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(localizedError('تعذّر تحميل مشغّل SQL.', 'sql.loadFailed')), { once: true });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    script.dataset.dynamicSrc = url;
    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve();
    }, { once: true });
    script.addEventListener('error', () => {
      reject(localizedError('تعذّر تحميل مشغّل SQL. تأكد من وجود ملفات vendor.', 'sql.vendorMissing'));
    }, { once: true });
    document.head.append(script);
  });
}

function ensureDatabase() {
  if (!database) {
    throw localizedError('قاعدة البيانات غير مهيأة بعد.', 'sql.notReady');
  }
  return database;
}

function quoteIdentifier(name) {
  return `"${String(name).replaceAll('"', '""')}"`;
}

export function getTablesPreview() {
  const db = ensureDatabase();
  const tablesResult = db.exec(`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name;
  `);

  const names = tablesResult[0]?.values?.map((row) => String(row[0])) || [];

  return names.map((name) => {
    try {
      const result = db.exec(`SELECT * FROM ${quoteIdentifier(name)} LIMIT 10;`);
      const table = result[0] || { columns: [], values: [] };
      return { name, columns: table.columns, values: table.values };
    } catch {
      return { name, columns: [], values: [] };
    }
  });
}

export function ensureSqlRuntime() {
  if (!sqlModulePromise) {
    sqlModulePromise = (async () => {
      await loadScript(SQL_JS_URL.href);

      if (typeof globalThis.initSqlJs !== 'function') {
        throw localizedError('لم يُهيَّأ مشغّل SQL بشكل صحيح.', 'sql.notInitialized');
      }

      SQL = await globalThis.initSqlJs({
        locateFile: (file) => new URL(file, VENDOR_URL).href,
      });

      database = new SQL.Database();
      database.exec(SEED_SQL);
      return SQL;
    })().catch((error) => {
      sqlModulePromise = null;
      throw error;
    });
  }

  return sqlModulePromise;
}

export async function resetDatabase() {
  await ensureSqlRuntime();
  if (database) database.close();
  database = new SQL.Database();
  database.exec(SEED_SQL);
  return { tables: getTablesPreview() };
}

function localizeSqlError(error) {
  const raw = String(error && error.message ? error.message : error).trim();
  let summaryKey = 'sql.generic';
  let params = {};

  let match = raw.match(/no such table:\s*(.+)/i);
  if (match) {
    summaryKey = 'sql.noSuchTable';
    params = { name: match[1].trim() };
    return { summaryKey, hintKey: summaryKey, params, details: raw };
  }

  match = raw.match(/no such column:\s*(.+)/i);
  if (match) {
    summaryKey = 'sql.noSuchColumn';
    params = { name: match[1].trim() };
    return { summaryKey, hintKey: summaryKey, params, details: raw };
  }

  match = raw.match(/no such function:\s*(.+)/i);
  if (match) {
    summaryKey = 'sql.noSuchFunction';
    params = { name: match[1].trim() };
    return { summaryKey, hintKey: summaryKey, params, details: raw };
  }

  match = raw.match(/near "([^"]+)":\s*syntax error/i);
  if (match) {
    summaryKey = 'sql.syntaxNear';
    params = { token: match[1] };
    return { summaryKey, hintKey: summaryKey, params, details: raw };
  }

  match = raw.match(/table\s+(.+)\s+already exists/i);
  if (match) {
    summaryKey = 'sql.tableExists';
    params = { name: match[1].trim() };
    return { summaryKey, hintKey: summaryKey, params, details: raw };
  }

  match = raw.match(/UNIQUE constraint failed:\s*(.+)/i);
  if (match) {
    summaryKey = 'sql.unique';
    params = { name: match[1].trim() };
    return { summaryKey, hintKey: summaryKey, params, details: raw };
  }

  match = raw.match(/NOT NULL constraint failed:\s*(.+)/i);
  if (match) {
    summaryKey = 'sql.notNull';
    params = { name: match[1].trim() };
    return { summaryKey, hintKey: summaryKey, params, details: raw };
  }

  return { summaryKey, hintKey: summaryKey, params, details: raw };
}

export async function runSql(transpiled) {
  await ensureSqlRuntime();
  const db = ensureDatabase();
  const startedAt = performance.now();

  db.run('BEGIN;');

  try {
    const results = db.exec(transpiled.code);
    const modified = db.getRowsModified();
    db.run('COMMIT;');

    return {
      results,
      modified,
      tables: getTablesPreview(),
      durationMs: Math.round(performance.now() - startedAt),
      error: null,
    };
  } catch (error) {
    try {
      db.run('ROLLBACK;');
    } catch {
      // The transaction may already have been aborted by SQLite.
    }

    return {
      results: [],
      modified: 0,
      tables: getTablesPreview(),
      durationMs: Math.round(performance.now() - startedAt),
      error: localizeSqlError(error),
    };
  }
}
