import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LOCALES,
  getLocale,
  keywordNote,
  languageUi,
  localeInfo,
  setLocale,
  t,
  translateError,
} from '../src/i18n.js';

test('defines Arabic, French, Kinyarwanda, and English with the right direction', () => {
  assert.deepEqual(LOCALES.map((locale) => locale.id), ['ar', 'fr', 'rw', 'en']);
  assert.equal(localeInfo('ar').dir, 'rtl');
  assert.equal(localeInfo('fr').dir, 'ltr');
  assert.equal(localeInfo('rw').dir, 'ltr');
  assert.equal(localeInfo('en').dir, 'ltr');
  assert.equal(localeInfo('en').htmlLang, 'en');
});

test('switches the active locale and updates document metadata', () => {
  setLocale('fr');
  assert.equal(getLocale(), 'fr');
  assert.equal(localeInfo().htmlLang, 'fr');
  assert.equal(t('status.ready'), 'Prêt');

  setLocale('rw');
  assert.equal(getLocale(), 'rw');
  assert.equal(t('status.ready'), 'Byiteguye');

  setLocale('en');
  assert.equal(getLocale(), 'en');
  assert.equal(localeInfo().htmlLang, 'en');
  assert.equal(t('status.ready'), 'Ready');
  assert.equal(t('meta.title'), 'Miftah Al-Barmaja | Learn to Program in Arabic');

  setLocale('ar');
  assert.equal(t('status.ready'), 'جاهز');
});

test('interpolates translated values and falls back to Arabic', () => {
  assert.equal(t('output.duration', { ms: 42 }, 'fr'), "Durée d'exécution : 42 ms");
  assert.equal(t('output.lineColumn', { line: 3, column: 7 }, 'rw'), 'Umurongo 3, inkingi 7');
  assert.equal(t('output.duration', { ms: 42 }, 'en'), 'Execution duration: 42 ms');
  assert.equal(t('does.not.exist', {}, 'en'), 'does.not.exist');
  assert.equal(t('app.name', {}, 'en'), 'Miftah Al-Barmaja');
});

test('localizes language metadata while keeping sample code Arabic', () => {
  const french = languageUi('cpp', 'fr');
  assert.equal(french.title, 'Les bases du C++');
  assert.equal(french.samples[0].title, 'Premiers pas');
  assert.match(french.samples[0].code, /صحيح/);

  const kinyarwanda = languageUi('sql', 'rw');
  assert.equal(kinyarwanda.title, "Ububiko bw'amakuru");
  assert.equal(kinyarwanda.samples[1].title, 'Kongeraho umunyeshuri');
  assert.match(kinyarwanda.samples[1].code, /أدخل/);

  const english = languageUi('cpp', 'en');
  assert.equal(english.title, 'C++ Fundamentals');
  assert.equal(english.samples[0].title, 'First steps');
  assert.match(english.samples[0].code, /صحيح/);

  const arabic = languageUi('html', 'ar');
  assert.equal(arabic.title, 'صفحات الويب');
  assert.equal(arabic.samples[0].title, 'صفحة أولى');
});

test('localizes keyword notes by language', () => {
  assert.equal(keywordNote('cpp', { ar: 'صحيح', note: 'عدد صحيح' }, 'fr'), 'Entier');
  assert.equal(keywordNote('cpp', { ar: 'صحيح', note: 'عدد صحيح' }, 'rw'), 'Umubare wuzuye');
  assert.equal(keywordNote('cpp', { ar: 'صحيح', note: 'عدد صحيح' }, 'en'), 'Integer');
  assert.equal(keywordNote('sql', { ar: 'حد', note: 'لتحديد عدد الصفوف' }, 'fr'), 'Pour limiter le nombre de lignes');
  assert.equal(keywordNote('html', { ar: 'صفحة', note: 'جذر الصفحة' }, 'ar'), 'جذر الصفحة');
});

test('translates structured errors with dynamic values', () => {
  const error = {
    summaryKey: 'sql.noSuchTable',
    hintKey: 'sql.noSuchTable',
    params: { name: 'الطلاب' },
  };

  const french = translateError(error, 'fr');
  assert.equal(french.summary, 'Aucune table nommée « students ».'.replace('students', 'الطلاب'));
  assert.match(french.hint, /Données des tables/);

  const kinyarwanda = translateError(error, 'rw');
  assert.equal(kinyarwanda.summary, 'Nta mbonerahamwe yitwa « students ».'.replace('students', 'الطلاب'));

  const english = translateError(error, 'en');
  assert.equal(english.summary, 'No table named « students ».'.replace('students', 'الطلاب'));
  assert.match(english.hint, /Table data section/);
});
