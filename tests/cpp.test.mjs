import test from 'node:test';
import assert from 'node:assert/strict';
import { transpileCpp } from '../src/transpilers/cpp.js';

test('translates core C++ keywords and adds the prelude', () => {
  const source = `// مثال
صحيح دالة جمع(صحيح أ، صحيح ب) {
    أرجع أ + ب;
}

صحيح رئيسية() {
    صحيح العمر = 20;
    إذا (العمر >= 18 و صواب) {
        اطبع "بالغ" << سطر_جديد;
    } وإلا {
        اطبع "قاصر" << سطر_جديد;
    }
    لكل (صحيح ع = 0; ع < 3; ع++) {
        طالما (صواب) { توقف; }
    }
    أرجع 0;
}`;

  const result = transpileCpp(source);

  assert.match(result.code, /^#include <iostream>\nusing namespace std;/);
  assert.match(result.code, /int\s+\w+\(int a, int b\)/);
  assert.match(result.code, /int main\(\)/);
  assert.match(result.code, /if \(/);
  assert.match(result.code, /else \{/);
  assert.match(result.code, /for \(/);
  assert.match(result.code, /while \(true\)/);
  assert.match(result.code, /return a \+ b;/);
  assert.match(result.code, /cout << "بالغ" << endl;/);
  assert.doesNotMatch(result.code, /دالة|إذا|وإلا|سطر_جديد/);
  assert.equal(result.preludeLines, 2);
});

test('uses one consistent transliterated name per Arabic identifier', () => {
  const result = transpileCpp(`صحيح رئيسية() {
    صحيح العمر = 20;
    اطبع العمر;
    العمر = العمر + 1;
  }`);

  const identifier = result.identifierMap.get('العمر');
  assert.ok(identifier);
  assert.match(result.code, new RegExp(`int ${identifier} = 20;`));
  assert.equal(result.reverseIdentifiers.get(identifier), 'العمر');
  assert.match(result.code, new RegExp(`cout << ${identifier};`));
  assert.match(result.code, new RegExp(`${identifier} = ${identifier} \\+ 1;`));
});

test('does not translate keywords inside strings or comments', () => {
  const result = transpileCpp(`// إذا كان هذا تعليقًا
صحيح رئيسية() {
    اطبع "إذا وإلا وليس" << سطر_جديد;
    أرجع 0;
}`);

  assert.match(result.code, /\/\/ إذا كان هذا تعليقًا/);
  assert.match(result.code, /"إذا وإلا وليس"/);
  assert.doesNotMatch(result.code, /\/\/ if/);
});

test('normalizes Arabic digits and punctuation outside strings', () => {
  const result = transpileCpp(`صحيح رئيسية() {
    صحيح س = ١٢، ص = ٣؛
    اطبع "١٢" << سطر_جديد؛
    أرجع ٠;
  }`);

  assert.match(result.code, /int s = 12, s_\d+ = 3;/);
  assert.match(result.code, /cout << "١٢" << endl;/);
  assert.match(result.code, /return 0;/);
});

test('accepts common spelling variants without hamza', () => {
  const result = transpileCpp(`صحيح رئيسية() {
    اذا (صواب) {
      ارجع 0;
    }
  }`);

  assert.match(result.code, /if \(true\)/);
  assert.match(result.code, /return 0;/);
});

test('does not duplicate includes when the program already has one', () => {
  const result = transpileCpp(`#include <iostream>
using namespace std;
صحيح رئيسية() { أرجع 0; }`);

  assert.equal(result.preludeLines, 0);
  assert.equal(result.code.match(/#include <iostream>/g)?.length, 1);
});

test('warns and includes string support when the Arabic string keyword is used', () => {
  const result = transpileCpp(`صحيح رئيسية() {
    نص الاسم = "سارة";
    أرجع 0;
  }`);

  assert.match(result.code, /#include <string>/);
  assert.ok(result.warnings.length > 0);
  assert.match(result.warnings[0], /std::string/);
});

test('wraps top-level Arabic statements in a generated main function', () => {
  const result = transpileCpp('اطبع ("مرحبا خليل");');

  assert.equal(
    result.code,
    '#include <iostream>\nusing namespace std;\nint main() {\ncout << ("مرحبا خليل");\nreturn 0;\n}\n',
  );
  assert.equal(result.userCode, 'cout << ("مرحبا خليل");');
  assert.equal(result.preludeLines, 3);
});

test('wraps top-level variables, conditions, and loops', () => {
  const result = transpileCpp(`صحيح س = ٥؛
إذا (س > ٣) {
  اطبع "كبير" << سطر_جديد؛
}
لكل (صحيح ع = ٠؛ ع < ٢؛ ع++) {
  اطبع ع؛
}`);

  assert.match(result.code, /int main\(\) \{\nint s = 5;\nif \(s > 3\) \{/);
  assert.match(result.code, /cout << "كبير" << endl;/);
  assert.match(result.code, /for \(int \w+ = 0; \w+ < 2; \w+\+\+\) \{/);
  assert.match(result.code, /cout << \w+;/);
});

test('wraps top-level input and output statements', () => {
  const result = transpileCpp(`صحيح س؛
اقرأ س؛
اطبع س؛`);

  assert.match(
    result.code,
    /int main\(\) \{\nint s;\ncin >> s;\ncout << s;\nreturn 0;\n\}/,
  );
});

test('does not wrap code that already defines a main function', () => {
  const result = transpileCpp('صحيح رئيسية() { اطبع "مرحبا"؛ أرجع ٠؛ }');

  assert.equal((result.code.match(/int main\(\)/g) || []).length, 1);
  assert.match(result.code, /int main\(\) \{ cout << "مرحبا"; return 0; \}/);
});

test('keeps leading includes outside the generated main function', () => {
  const result = transpileCpp(`#include <iostream>
using namespace std;
اطبع "مرحبا"؛`);

  assert.match(
    result.code,
    /^#include <iostream>\nint main\(\) \{\nusing namespace std;\ncout << "مرحبا";/,
  );
  assert.equal(result.preludeLines, 1);
});

test('asks for a main function when the snippet only defines other functions', () => {
  assert.throws(
    () => transpileCpp('صحيح دالة جمع(صحيح أ، صحيح ب) { أرجع أ + ب؛ }'),
    (error) => error.name === 'TranspileError' && /رئيسية/.test(error.message),
  );
});

test('reports unterminated strings with a friendly error', () => {
  assert.throws(
    () => transpileCpp('صحيح رئيسية() { اطبع "مرحبا; }'),
    (error) => error.name === 'TranspileError' && error.line === 1,
  );
});
