import { isolateBidiTokens } from '../core/text.js';
import { t, translateError, warningText } from '../i18n.js';

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

function renderWarnings(container, warnings, warningKeys = []) {
  if (!warnings || warnings.length === 0) return;

  const box = element('aside', 'warning-card');
  box.append(element('p', 'callout-title', t('output.warningTitle')));

  const list = element('ul', 'callout-list');
  warnings.forEach((warning, index) => {
    const text = warningKeys[index] ? warningText(warningKeys[index]) : warningText(warning);
    list.append(element('li', '', isolateBidiTokens(text)));
  });

  box.append(list);
  container.append(box);
}

function renderError(container, error, fallbackTitleKey = 'output.errorTitle') {
  const article = element('article', 'error-card');
  article.setAttribute('role', 'alert');
  const localized = translateError(error);

  article.append(element('p', 'error-title', isolateBidiTokens(t(fallbackTitleKey))));

  const summary = localized.summary || t('output.unexpectedError');
  article.append(element('p', 'error-summary', isolateBidiTokens(summary)));

  if (localized.line) {
    const location = localized.column
      ? t('output.lineColumn', { line: localized.line, column: localized.column })
      : t('output.lineOnly', { line: localized.line });
    article.append(element('p', 'error-location', location));
  }

  if (localized.hint) {
    article.append(element('p', 'error-hint', isolateBidiTokens(localized.hint)));
  }

  const detailsText = localized.details;
  if (detailsText && detailsText !== summary) {
    const details = element('details', 'error-details');
    details.append(element('summary', '', t('output.technicalDetails')));

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
    parts.push(t('output.duration', { ms: durationMs }));
  }

  if (Number.isInteger(exitCode) && exitCode !== 0) {
    parts.push(t('output.exitCode', { code: exitCode }));
  }

  if (parts.length === 0) return;

  container.append(element('p', 'run-meta', parts.join(' • ')));
}

function normalizeCell(value) {
  if (value === null || value === undefined) {
    return { text: 'NULL', className: 'null-value' };
  }

  if (value instanceof Uint8Array) {
    return { text: t('output.binary'), className: 'binary-value' };
  }

  if (typeof value === 'number') {
    return { text: String(value), className: 'number-value' };
  }

  return { text: String(value), className: '' };
}

function buildTable({ name, columns, values }, { caption = '', emptyText = t('output.noRows') } = {}) {
  const wrap = element('div', 'table-wrap');
  const table = element('table', 'data-table');
  table.dir = 'rtl';

  if (caption) {
    table.append(element('caption', 'table-caption', caption));
  }

  const thead = element('thead');
  const headerRow = element('tr');

  if (!columns || columns.length === 0) {
    const th = element('th', '', name || t('output.table'));
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

function renderTables(container, tables, { open = false, title = t('output.currentTables') } = {}) {
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
  card.append(element('p', 'welcome-kicker', t('output.welcomeKicker')));
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

export function renderLoading(container, message = t('output.loadingDefault')) {
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
  renderWarnings(container, data.warnings, data.warningKeys);

  if (data.error) {
    renderError(container, data.error, 'output.cppErrorTitle');
  }

  if (data.output) {
    if (data.error) {
      container.append(element('h3', 'output-heading', t('output.printedBeforeError')));
    }
    renderConsole(container, data.output);
  }

  if (!data.error && !data.output) {
    const empty = element('p', 'empty-output', t('output.emptyOutput'));
    container.append(empty);
  }

  renderRunMeta(container, data);
}

export function renderSqlBootstrap(container, { tables, error } = {}) {
  clear(container);

  if (error) {
    renderError(container, error, 'output.sqlBootstrapErrorTitle');
    return;
  }

  const card = element('section', 'welcome-card compact');
  card.append(element('p', 'welcome-kicker', t('output.databaseReadyKicker')));
  card.append(element('h2', 'welcome-title', t('output.databaseReadyTitle')));
  card.append(element('p', 'welcome-text', t('output.databaseReadyText')));
  container.append(card);

  renderTables(container, tables, { open: true, title: t('output.experimentalTablesTitle') });
}

export function renderSqlResult(container, data) {
  clear(container);

  if (data.error) {
    renderError(container, data.error, 'output.sqlErrorTitle');
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
            ? t('output.resultHeadingMultiple', { index: index + 1, rows: rowCount })
            : t('output.resultHeadingSingle', { rows: rowCount }),
        ),
      );
      section.append(buildTable(result));
      container.append(section);
    });
  } else if (data.modified > 0) {
    const notice = element('div', 'success-card');
    notice.append(element('p', 'success-title', t('output.successTitle')));
    notice.append(
      element('p', 'success-text', t('output.affectedRows', { count: data.modified })),
    );
    container.append(notice);
  } else {
    const notice = element('div', 'success-card');
    notice.append(element('p', 'success-title', t('output.successTitle')));
    notice.append(element('p', 'success-text', t('output.noResults')));
    container.append(notice);
  }

  renderRunMeta(container, { durationMs: data.durationMs });
  renderTables(container, data.tables, { open: !hasResults });
}

export function renderHtmlResult(container, { document: previewDocument, warnings, warningKeys }) {
  clear(container);
  renderWarnings(container, warnings, warningKeys);

  const toolbar = element('div', 'preview-toolbar');
  toolbar.append(element('span', 'preview-label', t('output.previewLabel')));
  toolbar.append(element('span', 'preview-note', t('output.previewNote')));

  const openButton = element('button', 'ghost-button small', t('output.openNewWindow'));
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
  frame.setAttribute('title', t('output.iframeTitle'));
  frame.srcdoc = previewDocument;

  container.append(toolbar, frame);
}

export function renderTranspileError(container, error) {
  clear(container);
  renderError(container, error, 'output.transpileErrorTitle');
}
