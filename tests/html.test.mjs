import test from 'node:test';
import assert from 'node:assert/strict';
import { transpileHtml } from '../src/transpilers/html.js';

test('translates Arabic tags and injects RTL metadata', () => {
  const result = transpileHtml(
    '<صفحة><رأس><عنوان>مرحبا</عنوان></رأس><جسم><فقرة>نص</فقرة></جسم></صفحة>',
  );

  assert.equal(
    result.code,
    '<html lang="ar" dir="rtl"><head><title>مرحبا</title></head><body><p>نص</p></body></html>',
  );
});

test('translates Arabic attributes without touching their values', () => {
  const result = transpileHtml(
    '<صفحة><جسم><رابط الرابط="https://example.com" الهدف="_blank">رابط</رابط><صورة المصدر="a.png" البديل="صورة"></جسم></صفحة>',
  );

  assert.match(result.code, /<a href="https:\/\/example\.com" target="_blank">رابط<\/a>/);
  assert.match(result.code, /<img src="a\.png" alt="صورة">/);
});

test('does not translate Arabic words used as attribute values', () => {
  const result = transpileHtml(
    '<صفحة><جسم><فقرة الصنف="إذا">نص</فقرة></جسم></صفحة>',
  );

  assert.match(result.code, /<p class="إذا">نص<\/p>/);
});

test('respects an explicit direction and adds only the missing language', () => {
  const result = transpileHtml('<صفحة الاتجاه="ltr"><جسم>نص</جسم></صفحة>');
  assert.match(result.code, /<html dir="ltr" lang="ar">/);
});

test('handles greater-than signs and Arabic quotations inside attributes', () => {
  const result = transpileHtml(
    '<صفحة><جسم><فقرة العنوان="1 > 0">نص</فقرة><رابط الرابط=“https://example.com”>رابط</رابط></جسم></صفحة>',
  );

  assert.match(result.code, /title="1 > 0"/);
  assert.match(result.code, /href="https:\/\/example\.com"/);
});

test('preserves doctypes, comments, and less-than signs in text', () => {
  const result = transpileHtml('<!DOCTYPE html><!-- تعليق --><فقرة>1 < 2</فقرة>');
  assert.equal(result.code, '<!DOCTYPE html><!-- تعليق --><p>1 < 2</p>');
});

test('supports self-closing and void tags', () => {
  const result = transpileHtml('<جسم><سطر_فاصل><خط_أفقي></جسم>');
  assert.equal(result.code, '<body><br><hr></body>');
});

test('reports unclosed comments and tags', () => {
  assert.throws(
    () => transpileHtml('<صفحة></صفحة><!-- تعليق'),
    (error) => error.name === 'TranspileError' && /تعليق HTML/.test(error.message),
  );

  assert.throws(
    () => transpileHtml('<صفحة><فقرة'),
    (error) => error.name === 'TranspileError' && /وسم HTML/.test(error.message),
  );
});
