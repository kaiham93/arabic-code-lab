import test from 'node:test';
import assert from 'node:assert/strict';
import { LANGUAGES, LANGUAGE_ORDER } from '../src/config.js';
import { normalizeArabicWord } from '../src/core/arabic.js';
import { transpileCpp } from '../src/transpilers/cpp.js';
import { transpileHtml } from '../src/transpilers/html.js';
import { transpileSql } from '../src/transpilers/sql.js';

test('all built-in samples transpile successfully', () => {
  for (const languageId of LANGUAGE_ORDER) {
    const language = LANGUAGES[languageId];

    for (const sample of language.samples) {
      let result;

      if (languageId === 'cpp') result = transpileCpp(sample.code);
      else if (languageId === 'html') result = transpileHtml(sample.code);
      else result = transpileSql(sample.code);

      assert.equal(result.language, languageId, `${languageId}/${sample.id}`);
      assert.ok(result.code.trim().length > 0, `${languageId}/${sample.id} is empty`);
    }
  }
});

test('C++ samples all contain a main function', () => {
  for (const sample of LANGUAGES.cpp.samples) {
    assert.match(transpileCpp(sample.code).code, /int main\s*\(/, sample.id);
  }
});

test('HTML samples are complete RTL documents', () => {
  for (const sample of LANGUAGES.html.samples) {
    const code = transpileHtml(sample.code).code;
    assert.match(code, /<html\b[^>]*dir="rtl"/i, sample.id);
    assert.match(code, /<html\b[^>]*lang="ar"/i, sample.id);
  }
});

test('SQL samples contain a translated command', () => {
  for (const sample of LANGUAGES.sql.samples) {
    assert.match(transpileSql(sample.code).code, /\b(SELECT|INSERT)\b/, sample.id);
  }
});

test('keyword dictionaries do not contain normalized duplicates', () => {
  const groups = [
    ['cpp', LANGUAGES.cpp.keywords],
    ['sql', LANGUAGES.sql.keywords],
    ['html tags', LANGUAGES.html.tags],
    ['html attributes', LANGUAGES.html.attributes],
  ];

  for (const [label, entries] of groups) {
    const seen = new Map();

    for (const entry of entries) {
      const key = normalizeArabicWord(entry.ar).toLowerCase();
      assert.equal(seen.has(key), false, `${label}: duplicate keyword ${entry.ar}`);
      seen.set(key, true);
    }
  }
});

test('sample ids are unique within each language', () => {
  for (const languageId of LANGUAGE_ORDER) {
    const ids = LANGUAGES[languageId].samples.map((sample) => sample.id);
    assert.equal(new Set(ids).size, ids.length, languageId);
  }
});
