import { LANGUAGES, LANGUAGE_ORDER } from './config.js';
import { transpileCpp } from './transpilers/cpp.js';
import { transpileHtml } from './transpilers/html.js';
import { transpileSql } from './transpilers/sql.js';
import { isolateBidiTokens } from './core/text.js';
import { runCpp } from './runtimes/cpp.js';
import { runHtml } from './runtimes/html.js';
import {
  ensureSqlRuntime,
  getTablesPreview,
  resetDatabase,
  runSql,
} from './runtimes/sql.js';
import { createEditor } from './ui/editor.js';
import {
  renderCppResult,
  renderHtmlResult,
  renderLoading,
  renderSqlBootstrap,
  renderSqlResult,
  renderTranspileError,
  renderWelcome,
} from './ui/output.js';

const dom = {
  tabs: document.getElementById('language-tabs'),
  editorTitle: document.getElementById('editor-title'),
  editorDescription: document.getElementById('editor-description'),
  sampleSelect: document.getElementById('sample-select'),
  textarea: document.getElementById('code-editor'),
  gutter: document.getElementById('line-numbers'),
  runButton: document.getElementById('run-button'),
  resetButton: document.getElementById('reset-sample'),
  resetDatabaseButton: document.getElementById('reset-database'),
  toggleGenerated: document.getElementById('toggle-generated'),
  generatedWrap: document.getElementById('generated-wrap'),
  generatedCode: document.getElementById('generated-code'),
  generatedLabel: document.getElementById('generated-label'),
  copyGenerated: document.getElementById('copy-generated'),
  output: document.getElementById('output'),
  status: document.getElementById('status'),
  statusText: document.getElementById('status-text'),
  stdinDetails: document.getElementById('stdin-details'),
  stdinSummary: document.querySelector('#stdin-details summary'),
  stdinInput: document.getElementById('stdin-input'),
  reference: document.getElementById('reference-content'),
};

const state = {
  active: 'cpp',
  code: {},
  sampleIndex: {},
  stdin: {},
  outputs: {},
  status: {},
  running: false,
  generatedVisible: false,
  sqlReady: false,
  sqlInitPromise: null,
};

let editor = null;
let previewTimer = null;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function transpileFor(languageId, source) {
  if (languageId === 'cpp') return transpileCpp(source);
  if (languageId === 'html') return transpileHtml(source);
  return transpileSql(source);
}

function toErrorState(error) {
  return {
    summary: error?.message || 'حدث خطأ غير متوقع.',
    hint: error?.hint || '',
    line: error?.line ?? null,
    column: error?.column ?? null,
    details: error?.details || '',
  };
}

function setStatus(status) {
  dom.status.dataset.status = status.kind;
  dom.statusText.textContent = isolateBidiTokens(status.text);
}

function buildTabs() {
  const fragment = document.createDocumentFragment();

  LANGUAGE_ORDER.forEach((languageId) => {
    const language = LANGUAGES[languageId];
    const button = element('button', 'tab', isolateBidiTokens(language.tabLabel));
    button.type = 'button';
    button.id = `tab-${languageId}`;
    button.dataset.language = languageId;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', 'false');
    button.title = language.title;
    button.addEventListener('click', () => {
      activateLanguage(languageId);
    });
    fragment.append(button);
  });

  dom.tabs.replaceChildren(fragment);
}

function updateTabs() {
  for (const button of dom.tabs.querySelectorAll('.tab')) {
    const isActive = button.dataset.language === state.active;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-selected', String(isActive));
  }
}

function populateSamples(languageId) {
  const language = LANGUAGES[languageId];
  const options = language.samples.map((sample, index) => {
    return new Option(`${sample.title} · ${sample.description}`, String(index));
  });

  dom.sampleSelect.replaceChildren(...options);
  dom.sampleSelect.value = String(state.sampleIndex[languageId]);
}

function defaultOutputFor(languageId) {
  if (languageId === 'sql' && state.sqlReady) {
    try {
      return { kind: 'sql-bootstrap', data: { tables: getTablesPreview() } };
    } catch {
      return { kind: 'welcome' };
    }
  }

  return { kind: 'welcome' };
}

function renderCurrentOutput() {
  const outputState = state.outputs[state.active] || { kind: 'welcome' };

  switch (outputState.kind) {
    case 'cpp':
      renderCppResult(dom.output, outputState.data);
      break;
    case 'html':
      renderHtmlResult(dom.output, outputState.data);
      break;
    case 'sql':
      renderSqlResult(dom.output, outputState.data);
      break;
    case 'sql-bootstrap':
      renderSqlBootstrap(dom.output, outputState.data);
      break;
    case 'transpile-error':
      renderTranspileError(dom.output, outputState.error);
      break;
    case 'loading':
      renderLoading(dom.output, outputState.message);
      break;
    case 'welcome':
    default:
      renderWelcome(dom.output, LANGUAGES[state.active]);
      break;
  }
}

function updateGeneratedPreview(precomputed = null) {
  const languageId = state.active;
  const language = LANGUAGES[languageId];
  dom.generatedLabel.textContent = isolateBidiTokens(language.generatedLabel);
  dom.generatedCode.classList.remove('has-error');

  try {
    const transpiled = precomputed || transpileFor(languageId, state.code[languageId]);
    dom.generatedCode.textContent = transpiled.code.trimEnd() || '// لا يوجد كود بعد.';
  } catch (error) {
    dom.generatedCode.textContent = `// ${error.message}`;
    dom.generatedCode.classList.add('has-error');
  }
}

function renderKeywordTable(title, entries, targetLabel) {
  const section = element('section', 'ref-section');
  section.append(element('h3', 'ref-section-title', title));

  const table = element('table', 'keyword-table');
  const thead = element('thead');
  const headRow = element('tr');
  headRow.append(element('th', '', 'بالعربية'));
  headRow.append(element('th', '', targetLabel));
  thead.append(headRow);
  table.append(thead);

  const tbody = element('tbody');

  for (const entry of entries) {
    const row = element('tr');
    if (entry.warning) row.classList.add('kw-warning');

    const arabicCell = element('td');
    const arabicCode = element('code', 'ar-keyword', entry.ar);
    arabicCode.dir = 'rtl';
    arabicCell.append(arabicCode);
    row.append(arabicCell);

    const targetCell = element('td');
    const targetCode = element('code', 'target-code', entry.target || '—');
    targetCode.dir = 'ltr';
    targetCell.append(targetCode);

    if (entry.note) {
      targetCell.append(element('span', 'kw-note', entry.note));
    }

    row.append(targetCell);
    tbody.append(row);
  }

  table.append(tbody);
  section.append(table);
  return section;
}

function renderSchema() {
  const language = LANGUAGES.sql;
  const section = element('section', 'ref-section');
  section.append(element('h3', 'ref-section-title', 'جداول قاعدة البيانات'));

  for (const table of language.tables) {
    const card = element('div', 'schema-card');
    card.append(element('strong', 'schema-name', table.name));

    const chips = element('div', 'schema-chips');
    for (const column of table.columns) {
      chips.append(element('span', 'chip', column));
    }

    card.append(chips);
    section.append(card);
  }

  return section;
}

function renderReference() {
  const language = LANGUAGES[state.active];
  const fragment = document.createDocumentFragment();

  const intro = {
    cpp: 'هذه الكلمات تُفهم داخل محرر C++. الأسماء العربية تتحول تلقائيًا إلى أسماء إنجليزية مناسبة.',
    html: 'استبدل الوسوم الإنجليزية بوسوم عربية واضحة؛ سيبقى الناتج صفحة HTML قياسية.',
    sql: 'اكتب أوامر SQL بالعربية على الجداول التجريبية. الكلمات هنا هي الأوامر التي يفهمها المحوّل.',
  }[state.active];

  fragment.append(element('p', 'ref-intro', isolateBidiTokens(intro)));

  if (state.active === 'cpp' || state.active === 'sql') {
    fragment.append(
      renderKeywordTable(
        isolateBidiTokens(state.active === 'cpp' ? 'كلمات C++' : 'كلمات SQL'),
        language.keywords,
        isolateBidiTokens(state.active === 'cpp' ? 'كود C++' : 'كود SQL'),
      ),
    );
  }

  if (state.active === 'html') {
    fragment.append(renderKeywordTable('وسوم HTML', language.tags, 'وسم HTML'));
    fragment.append(renderKeywordTable('سمات HTML', language.attributes, 'سمة HTML'));
  }

  if (state.active === 'sql') {
    fragment.append(renderSchema());
  }

  const tips = element('section', 'tips-card');
  tips.append(element('h3', 'ref-section-title', 'نصائح سريعة'));
  const list = element('ul', 'tips-list');
  for (const tip of language.tips) {
    list.append(element('li', '', isolateBidiTokens(tip)));
  }
  tips.append(list);
  fragment.append(tips);

  dom.reference.replaceChildren(fragment);
}

function activateLanguage(languageId, { initial = false } = {}) {
  if (!initial && state.active === languageId) return;

  if (!initial) {
    state.code[state.active] = editor.getValue();
    state.stdin[state.active] = dom.stdinInput.value;
  }

  state.active = languageId;
  updateTabs();

  const language = LANGUAGES[languageId];
  dom.editorTitle.textContent = isolateBidiTokens(language.title);
  dom.editorDescription.textContent = isolateBidiTokens(language.description);
  dom.runButton.textContent = isolateBidiTokens(language.runLabel);
  dom.generatedLabel.textContent = isolateBidiTokens(language.generatedLabel);

  populateSamples(languageId);
  editor.setValue(state.code[languageId]);

  dom.stdinDetails.hidden = languageId !== 'cpp';
  dom.resetDatabaseButton.hidden = languageId !== 'sql';

  if (languageId === 'cpp') {
    dom.stdinSummary.textContent = language.stdin.label;
    dom.stdinInput.placeholder = language.stdin.placeholder;
    dom.stdinInput.value = state.stdin.cpp || '';
    const sample = language.samples[state.sampleIndex.cpp];
    dom.stdinDetails.open = Boolean(sample?.stdin);
  }

  updateGeneratedPreview();
  renderReference();
  renderCurrentOutput();
  setStatus(state.status[languageId]);
  dom.runButton.disabled = state.running;

  if (languageId === 'sql') {
    prepareSqlTab();
  }
}

function applySample(index) {
  const languageId = state.active;
  const language = LANGUAGES[languageId];
  const sample = language.samples[index];
  if (!sample) return;

  state.sampleIndex[languageId] = index;
  state.code[languageId] = sample.code;
  state.stdin[languageId] = sample.stdin || '';

  editor.setValue(sample.code);

  if (languageId === 'cpp') {
    dom.stdinInput.value = state.stdin.cpp;
    dom.stdinDetails.open = Boolean(sample.stdin);
  }

  state.outputs[languageId] = defaultOutputFor(languageId);
  state.status[languageId] = { kind: 'ready', text: 'جاهز' };
  updateGeneratedPreview();
  renderCurrentOutput();
  setStatus(state.status[languageId]);
}

function sqlInitializationFailed() {
  return state.outputs.sql.kind === 'sql-bootstrap' && Boolean(state.outputs.sql.data?.error);
}

async function prepareSqlTab() {
  if (state.sqlReady) return;
  if (state.outputs.sql.kind !== 'welcome' && !sqlInitializationFailed()) return;

  state.outputs.sql = { kind: 'loading', message: 'جارٍ تجهيز قاعدة البيانات...' };
  state.status.sql = { kind: 'running', text: 'جارٍ التجهيز...' };
  renderCurrentOutput();
  setStatus(state.status.sql);

  if (!state.sqlInitPromise) {
    state.sqlInitPromise = ensureSqlRuntime()
      .then(() => {
        state.sqlReady = true;
      })
      .catch((error) => {
        state.sqlInitPromise = null;
        throw error;
      });
  }

  try {
    await state.sqlInitPromise;
    const tables = getTablesPreview();

    if (state.outputs.sql.kind === 'loading') {
      state.outputs.sql = { kind: 'sql-bootstrap', data: { tables } };
      state.status.sql = { kind: 'ready', text: 'قاعدة البيانات جاهزة' };

      if (state.active === 'sql') {
        renderCurrentOutput();
        setStatus(state.status.sql);
      }
    }
  } catch (error) {
    const errorState = toErrorState(error);
    state.outputs.sql = { kind: 'sql-bootstrap', data: { error: errorState } };
    state.status.sql = { kind: 'error', text: 'تعذّر تجهيز البيانات' };

    if (state.active === 'sql') {
      renderCurrentOutput();
      setStatus(state.status.sql);
    }
  }
}

async function ensureSqlReady() {
  if (state.sqlReady) return;

  if (!state.sqlInitPromise) {
    state.sqlInitPromise = ensureSqlRuntime()
      .then(() => {
        state.sqlReady = true;
      })
      .catch((error) => {
        state.sqlInitPromise = null;
        throw error;
      });
  }

  await state.sqlInitPromise;
}

async function handleRun() {
  if (state.running) return;

  const languageId = state.active;
  state.code[languageId] = editor.getValue();
  state.stdin[languageId] = dom.stdinInput.value;

  let transpiled;

  try {
    transpiled = transpileFor(languageId, state.code[languageId]);
  } catch (error) {
    const errorState = toErrorState(error);
    state.outputs[languageId] = { kind: 'transpile-error', error: errorState };
    state.status[languageId] = { kind: 'error', text: 'يوجد خطأ' };
    updateGeneratedPreview();
    renderCurrentOutput();
    setStatus(state.status[languageId]);
    return;
  }

  updateGeneratedPreview(transpiled);

  state.running = true;
  dom.runButton.disabled = true;
  state.status[languageId] = { kind: 'running', text: 'جارٍ التنفيذ...' };
  state.outputs[languageId] = {
    kind: 'loading',
    message: languageId === 'html'
      ? 'جارٍ تجهيز المعاينة...'
      : languageId === 'sql'
        ? 'جارٍ تنفيذ الاستعلام...'
        : 'جارٍ تشغيل البرنامج...',
  };

  if (state.active === languageId) {
    renderCurrentOutput();
    setStatus(state.status[languageId]);
  }

  try {
    if (languageId === 'cpp') {
      const result = await runCpp(transpiled, { input: state.stdin.cpp || '' });
      state.outputs.cpp = {
        kind: 'cpp',
        data: { ...result, warnings: transpiled.warnings },
      };
      state.status.cpp = result.error
        ? { kind: 'error', text: 'يوجد خطأ' }
        : { kind: 'success', text: 'تم التشغيل' };
    } else if (languageId === 'html') {
      const result = runHtml(transpiled);
      state.outputs.html = {
        kind: 'html',
        data: { ...result, warnings: transpiled.warnings },
      };
      state.status.html = { kind: 'success', text: 'تم العرض' };
    } else {
      await ensureSqlReady();
      const result = await runSql(transpiled);
      state.outputs.sql = { kind: 'sql', data: result };
      state.status.sql = result.error
        ? { kind: 'error', text: 'يوجد خطأ' }
        : { kind: 'success', text: 'تم التنفيذ' };
    }
  } catch (error) {
    const errorState = toErrorState(error);

    if (languageId === 'sql') {
      state.outputs.sql = { kind: 'sql-bootstrap', data: { error: errorState } };
    } else {
      state.outputs[languageId] = { kind: 'transpile-error', error: errorState };
    }

    state.status[languageId] = { kind: 'error', text: 'تعذّر التنفيذ' };
  } finally {
    state.running = false;
    dom.runButton.disabled = false;

    if (state.active === languageId) {
      renderCurrentOutput();
      setStatus(state.status[languageId]);
    }

    dom.runButton.textContent = isolateBidiTokens(LANGUAGES[state.active].runLabel);

    if (languageId === 'sql') {
      dom.resetDatabaseButton.disabled = false;
    }
  }
}

async function handleResetDatabase() {
  if (state.running) return;

  state.running = true;
  dom.runButton.disabled = true;
  dom.resetDatabaseButton.disabled = true;
  state.outputs.sql = { kind: 'loading', message: 'جارٍ إعادة ضبط البيانات...' };
  state.status.sql = { kind: 'running', text: 'جارٍ إعادة الضبط...' };

  if (state.active === 'sql') {
    renderCurrentOutput();
    setStatus(state.status.sql);
  }

  try {
    await ensureSqlReady();
    const { tables } = await resetDatabase();
    state.outputs.sql = { kind: 'sql-bootstrap', data: { tables } };
    state.status.sql = { kind: 'success', text: 'تمت إعادة الضبط' };
  } catch (error) {
    state.outputs.sql = {
      kind: 'sql-bootstrap',
      data: { error: toErrorState(error) },
    };
    state.status.sql = { kind: 'error', text: 'تعذّر إعادة الضبط' };
  } finally {
    state.running = false;
    dom.runButton.disabled = false;
    dom.resetDatabaseButton.disabled = false;

    if (state.active === 'sql') {
      renderCurrentOutput();
      setStatus(state.status.sql);
    }
  }
}

function toggleGenerated() {
  state.generatedVisible = !state.generatedVisible;
  dom.generatedWrap.hidden = !state.generatedVisible;
  dom.toggleGenerated.setAttribute('aria-pressed', String(state.generatedVisible));
  dom.toggleGenerated.textContent = state.generatedVisible
    ? 'إخفاء الكود المترجم'
    : 'عرض الكود المترجم';

  if (state.generatedVisible) {
    updateGeneratedPreview();
  }
}

async function copyGenerated() {
  if (dom.generatedCode.classList.contains('has-error')) return;

  const code = dom.generatedCode.textContent || '';
  if (!code) return;

  try {
    await navigator.clipboard.writeText(code);
    dom.copyGenerated.textContent = 'تم النسخ';
  } catch {
    dom.copyGenerated.textContent = 'تعذّر النسخ';
  }

  setTimeout(() => {
    dom.copyGenerated.textContent = 'نسخ';
  }, 1600);
}

function attachEvents() {
  dom.runButton.addEventListener('click', handleRun);
  dom.resetButton.addEventListener('click', () => {
    applySample(state.sampleIndex[state.active]);
  });
  dom.resetDatabaseButton.addEventListener('click', handleResetDatabase);
  dom.toggleGenerated.addEventListener('click', toggleGenerated);
  dom.copyGenerated.addEventListener('click', copyGenerated);

  dom.sampleSelect.addEventListener('change', () => {
    applySample(Number(dom.sampleSelect.value));
  });

  dom.stdinInput.addEventListener('input', () => {
    state.stdin[state.active] = dom.stdinInput.value;
  });

  dom.textarea.addEventListener('input', () => {
    state.code[state.active] = editor.getValue();

    if (state.generatedVisible) {
      clearTimeout(previewTimer);
      previewTimer = setTimeout(() => updateGeneratedPreview(), 220);
    }
  });

  window.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      handleRun();
    }
  });
}

function start() {
  for (const languageId of LANGUAGE_ORDER) {
    const firstSample = LANGUAGES[languageId].samples[0];
    state.code[languageId] = firstSample.code;
    state.sampleIndex[languageId] = 0;
    state.stdin[languageId] = firstSample.stdin || '';
    state.outputs[languageId] = { kind: 'welcome' };
    state.status[languageId] = { kind: 'ready', text: 'جاهز' };
  }

  editor = createEditor({
    textarea: dom.textarea,
    gutter: dom.gutter,
    onRun: handleRun,
  });

  buildTabs();
  attachEvents();
  activateLanguage('cpp', { initial: true });
}

start();
