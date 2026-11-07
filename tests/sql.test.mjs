import test from 'node:test';
import assert from 'node:assert/strict';
import { transpileSql } from '../src/transpilers/sql.js';

test('translates SELECT, WHERE, ORDER BY, and Arabic punctuation', () => {
  const result = transpileSql(
    'اختر الاسم، العمر من الطلاب حيث العمر >= 20 ترتيب حسب العمر تنازليًا؛',
  );

  assert.equal(
    result.code,
    'SELECT الاسم, العمر FROM الطلاب WHERE العمر >= 20 ORDER BY العمر DESC;',
  );
});

test('adds a missing final semicolon', () => {
  assert.equal(transpileSql('اختر * من الطلاب').code, 'SELECT * FROM الطلاب;');
});

test('maps في to INTO inside INSERT and to IN elsewhere', () => {
  const insert = transpileSql(`أدخل في الطلاب (الاسم، العمر) قيم ('مريم'، 21)`);
  assert.equal(insert.code, "INSERT INTO الطلاب (الاسم, العمر) VALUES ('مريم', 21);");

  const select = transpileSql('اختر * من الطلاب حيث العمر في (20، 21)');
  assert.equal(select.code, 'SELECT * FROM الطلاب WHERE العمر IN (20, 21);');
});

test('resets INSERT context after a statement boundary', () => {
  const result = transpileSql(
    `أدخل في الطلاب (الاسم) قيم ('أ')؛ اختر * من الطلاب حيث العمر في (20)`,
  );

  assert.equal(
    result.code,
    "INSERT INTO الطلاب (الاسم) VALUES ('أ'); SELECT * FROM الطلاب WHERE العمر IN (20);",
  );
});

test('translates INSERT, UPDATE, DELETE, and aggregate helpers', () => {
  const insert = transpileSql(`أدخل في المواد (اسم_المادة، الساعات) قيم ('الشبكات'، 3)`);
  assert.match(insert.code, /^INSERT INTO المواد /);

  const update = transpileSql(`حدث الطلاب عين العمر = 21 حيث الاسم = 'سارة'`);
  assert.match(update.code, /^UPDATE الطلاب SET العمر = 21 WHERE الاسم = 'سارة';$/);

  const remove = transpileSql(`احذف من الطلاب حيث العمر < 18`);
  assert.match(remove.code, /^DELETE FROM الطلاب WHERE العمر < 18;$/);

  const stats = transpileSql('اختر عدد(*) باسم عدد_الطلاب، متوسط(العمر) باسم متوسط_العمر من الطلاب');
  assert.equal(
    stats.code,
    'SELECT COUNT(*) AS عدد_الطلاب, AVG(العمر) AS متوسط_العمر FROM الطلاب;',
  );
});

test('keeps keywords inside strings and quoted identifiers untouched', () => {
  const result = transpileSql(
    `اختر * من الطلاب حيث الاسم = 'من في حيث' و "عمود اختر" = 'قيمة'`,
  );

  assert.match(result.code, /'من في حيث'/);
  assert.match(result.code, /"عمود اختر"/);
});

test('normalizes Arabic digits inside numbers only', () => {
  const result = transpileSql(`اختر * من الطلاب حيث العمر = ٢٠ و الاسم = '٢٠'`);
  assert.equal(result.code, "SELECT * FROM الطلاب WHERE العمر = 20 AND الاسم = '٢٠';");
});

test('places an auto semicolon before a trailing comment', () => {
  const result = transpileSql('اختر * من الطلاب -- تعليق');
  assert.equal(result.code, 'SELECT * FROM الطلاب; -- تعليق');
});

test('keeps BEGIN-like SQL keywords out of strings intact', () => {
  const result = transpileSql(`اختر 'اختر من حيث' من الطلاب`);
  assert.equal(result.code, "SELECT 'اختر من حيث' FROM الطلاب;");
});

test('reports unterminated SQL strings', () => {
  assert.throws(
    () => transpileSql("اختر * من الطلاب حيث الاسم = 'سارة"),
    (error) => error.name === 'TranspileError' && /إغلاق/.test(error.message),
  );
});
