import { isolateBidiTokens } from '../core/text.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function clear(container) {
  container.replaceChildren();
  container.scrollTop = 0;
}

function renderWarnings(container, warnings) {
  if (!warnings || warnings.length === 0) return;

  const box = element('aside', 'warning-card');
  box.append(element('p', 'callout-title', 'ملاحظة'));

  const list = element('ul', 'callout-list');
  for (const warning of warnings) {
    list.append(element('li', '', isolateBidiTokens(warning)));
  }

  box.append(list);
  container.append(box);
}

function renderError(container, error, fallbackTitle = 'تعذّر إكمال العملية') {
  const article = element('article', 'error-card');
  article.setAttribute('role', 'alert');

  article.append(element('p', 'error-title', isolateBidiTokens(fallbackTitle)));

  const summary = error?.summary || error?.message || 'حدث خطأ غير متوقع.';
  article.append(element('p', 'error-summary', isolateBidiTokens(summary)));

  if (error?.line) {
    const location = error.column
      ? `السطر ${error.line}، العمود ${error.column}`
      : `السطر ${error.line}`;
    article.append(element('p', 'error-location', location));
  }

  if (error?.hint) {
    article.append(element('p', 'error-hint', isolateBidiTokens(error.hint)));
  }

  const detailsText = error?.details;
  if (detailsText && detailsText !== summary) {
    const details = element('details', 'error-details');
    details.append(element('summary', '', 'تفاصيل تقنية'));

    const pre = element('pre', 'error-raw', detailsText);
    pre.dir = 'ltr';
    details.append(pre);
    article.append(details);
  }

  container.append(article);
}

function renderConsole(container, output) {
  if (!output) return;

  const consoleBox = element('div', 'console');
  const lines = output.replace(/\n$/, '').split('\n');

  for (const line of lines) {
    const lineElement = element('div', 'console-line', line === '' ? ' ' : line);
    lineElement.dir = 'auto';
    consoleBox.append(lineElement);
  }

  container.append(consoleBox);
}

function renderRunMeta(container, { durationMs, exitCode } = {}) {
  const parts = [];

  if (Number.isFinite(durationMs)) {
    parts.push(`مدة التنفيذ: ${durationMs} مللي ثانية`);
  }

  if (Number.isInteger(exitCode) && exitCode !== 0) {
    parts.push(`رمز الخروج: ${exitCode}`);
  }

  if (parts.length === 0) return;

  container.append(element('p', 'run-meta', parts.join(' • ')));
}

function normalizeCell(value) {
  if (value === null || value === undefined) {
    return { text: 'NULL', className: 'null-value' };
  }

  if (value instanceof Uint8Array) {
    return { text: '[بيانات ثنائية]', className: 'binary-value' };
  }

  if (typeof value === 'number') {
    return { text: String(value), className: 'number-value' };
  }

  return { text: String(value), className: '' };
}

function buildTable({ name, columns, values }, { caption = '', emptyText = 'لا توجد صفوف.' } = {}) {
  const wrap = element('div', 'table-wrap');
  const table = element('table', 'data-table');
  table.dir = 'rtl';

  if (caption) {
    table.append(element('caption', 'table-caption', caption));
  }

  const thead = element('thead');
  const headerRow = element('tr');

  if (!columns || columns.length === 0) {
    const th = element('th', '', name || 'الجدول');
    headerRow.append(th);
  } else {
    for (const column of columns) {
      headerRow.append(element('th', '', String(column)));
    }
  }

  thead.append(headerRow);
  table.append(thead);

  const tbody = element('tbody');

  if (!values || values.length === 0) {
    const row = element('tr');
    const cell = element('td', 'empty-cell', emptyText);
    cell.colSpan = Math.max(1, columns?.length || 1);
    row.append(cell);
    tbody.append(row);
  } else {
    for (const rowValues of values) {
      const row = element('tr');
      for (const value of rowValues) {
        const data = normalizeCell(value);
        const cell = element('td', data.className, data.text);
        cell.dir = 'auto';
        row.append(cell);
      }
      tbody.append(row);
    }
  }

  table.append(tbody);
  wrap.append(table);
  return wrap;
}

function renderTables(container, tables, { open = false, title = 'بيانات الجداول الحالية' } = {}) {
  if (!tables || tables.length === 0) return;

  const details = element('details', 'db-preview');
  details.open = open;
  details.append(element('summary', '', title));

  const stack = element('div', 'table-stack');
  for (const table of tables) {
    stack.append(buildTable(table, { caption: table.name }));
  }

  details.append(stack);
  container.append(details);
}

export function renderWelcome(container, language) {
  clear(container);

  const card = element('section', 'welcome-card');
  card.append(element('p', 'welcome-kicker', 'جاهز للبدء'));
  card.append(element('h2', 'welcome-title', isolateBidiTokens(language.welcomeTitle)));
  card.append(element('p', 'welcome-text', isolateBidiTokens(language.welcomeText)));

  if (language.tips?.length) {
    const list = element('ul', 'welcome-list');
    for (const tip of language.tips.slice(0, 3)) {
      list.append(element('li', '', isolateBidiTokens(tip)));
    }
    card.append(list);
  }

  container.append(card);
}

export function renderLoading(container, message = 'جارٍ التنفيذ...') {
  clear(container);

  const card = element('section', 'loading-card');
  const spinner = element('span', 'spinner');
  spinner.setAttribute('aria-hidden', 'true');
  card.append(spinner);
  card.append(element('p', 'loading-text', message));
  container.append(card);
}

export function renderCppResult(container, data) {
  clear(container);
  renderWarnings(container, data.warnings);

  if (data.error) {
    renderError(container, data.error, 'تعذّر تنفيذ برنامج C++');
  }

  if (data.output) {
    if (data.error) {
      container.append(element('h3', 'output-heading', 'ما طُبع قبل الخطأ'));
    }
    renderConsole(container, data.output);
  }

  if (!data.error && !data.output) {
    const empty = element('p', 'empty-output', 'انتهى البرنامج دون مخرجات.');
    container.append(empty);
  }

  renderRunMeta(container, data);
}

export function renderSqlBootstrap(container, { tables, error } = {}) {
  clear(container);

  if (error) {
    renderError(container, error, 'تعذّر تجهيز قاعدة البيانات');
    return;
  }

  const card = element('section', 'welcome-card compact');
  card.append(element('p', 'welcome-kicker', 'قاعدة البيانات جاهزة'));
  card.append(element('h2', 'welcome-title', 'بيانات تجريبية بين يديك'));
  card.append(
    element(
      'p',
      'welcome-text',
      'اكتب استعلامك بالعربية ثم اضغط «نفّذ الاستعلام». يمكنك إضافة صفوف أو تعديل البيانات، وستبقى التغييرات حتى تعيد الضبط.',
    ),
  );
  container.append(card);

  renderTables(container, tables, { open: true, title: 'جداول قاعدة البيانات التجريبية' });
}

export function renderSqlResult(container, data) {
  clear(container);

  if (data.error) {
    renderError(container, data.error, 'تعذّر تنفيذ استعلام SQL');
    renderTables(container, data.tables, { open: false });
    return;
  }

  const hasResults = Array.isArray(data.results) && data.results.length > 0;

  if (hasResults) {
    data.results.forEach((result, index) => {
      const section = element('section', 'result-block');
      const rowCount = result.values?.length || 0;
      section.append(
        element(
          'div',
          'result-heading',
          data.results.length > 1
            ? `النتيجة ${index + 1} • ${rowCount} صف`
            : `النتيجة • ${rowCount} صف`,
        ),
      );
      section.append(buildTable(result));
      container.append(section);
    });
  } else if (data.modified > 0) {
    const notice = element('div', 'success-card');
    notice.append(element('p', 'success-title', 'تم تنفيذ الأمر بنجاح'));
    notice.append(
      element('p', 'success-text', `الصفوف المتأثرة: ${data.modified}. يمكنك كتابة استعلام اختر لعرض البيانات.`),
    );
    container.append(notice);
  } else {
    const notice = element('div', 'success-card');
    notice.append(element('p', 'success-title', 'تم تنفيذ الأمر بنجاح'));
    notice.append(element('p', 'success-text', 'لم يكن للأمر نتائج لعرضها.'));
    container.append(notice);
  }

  renderRunMeta(container, { durationMs: data.durationMs });
  renderTables(container, data.tables, { open: !hasResults });
}

export function renderHtmlResult(container, { document: previewDocument, warnings }) {
  clear(container);
  renderWarnings(container, warnings);

  const toolbar = element('div', 'preview-toolbar');
  toolbar.append(element('span', 'preview-label', 'معاينة مباشرة'));
  toolbar.append(element('span', 'preview-note', 'JavaScript معطّل داخل المعاينة'));

  const openButton = element('button', 'ghost-button small', 'فتح في نافذة جديدة');
  openButton.type = 'button';
  openButton.addEventListener('click', () => {
    const url = URL.createObjectURL(
      new Blob([previewDocument], { type: 'text/html;charset=utf-8' }),
    );
    window.open(url, '_blank', 'noopener');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  });
  toolbar.append(openButton);

  const frame = element('iframe', 'preview-frame');
  frame.setAttribute('sandbox', '');
  frame.setAttribute('title', 'معاينة صفحة HTML');
  frame.srcdoc = previewDocument;

  container.append(toolbar, frame);
}

export function renderTranspileError(container, error) {
  clear(container);
  renderError(container, error, 'تعذّر تحويل الكود العربي');
}
