import { CPP_KEYWORDS } from '../keywords.js';
import {
  isAsciiIdentifier,
  isIdentifierPart,
  isIdentifierStart,
  normalizeArabicWord,
  normalizePunctuation,
  toAsciiDigits,
  transliterateIdentifier,
} from '../core/arabic.js';
import { TranspileError } from '../core/diagnostics.js';

const KEYWORD_MAP = new Map(
  CPP_KEYWORDS.map(({ ar, target }) => [normalizeArabicWord(ar), target]),
);

const CPP_RESERVED = new Set([
  'alignas', 'alignof', 'and', 'and_eq', 'asm', 'auto', 'bitand', 'bitor',
  'bool', 'break', 'case', 'catch', 'char', 'char16_t', 'char32_t', 'class',
  'compl', 'const', 'constexpr', 'const_cast', 'continue', 'decltype',
  'default', 'delete', 'do', 'double', 'dynamic_cast', 'else', 'enum',
  'explicit', 'export', 'extern', 'false', 'float', 'for', 'friend', 'goto',
  'if', 'inline', 'int', 'long', 'mutable', 'namespace', 'new', 'noexcept',
  'not', 'not_eq', 'nullptr', 'operator', 'or', 'or_eq', 'private',
  'protected', 'public', 'register', 'reinterpret_cast', 'return', 'short',
  'signed', 'sizeof', 'static', 'static_assert', 'static_cast', 'struct',
  'switch', 'template', 'this', 'thread_local', 'throw', 'true', 'try',
  'typedef', 'typeid', 'typename', 'union', 'unsigned', 'using', 'virtual',
  'void', 'volatile', 'wchar_t', 'while', 'xor', 'xor_eq',
  'cin', 'cout', 'cerr', 'endl', 'std', 'string', 'main',
]);

function isAsciiDigit(character) {
  return character >= '0' && character <= '9';
}

function isArabicDigit(character) {
  return Boolean(character) && /[\u0660-\u0669\u06F0-\u06F9]/.test(character);
}

function isDigit(character) {
  return isAsciiDigit(character) || isArabicDigit(character);
}

function keywordFor(word) {
  const normalized = normalizeArabicWord(word);
  return KEYWORD_MAP.has(normalized) ? KEYWORD_MAP.get(normalized) : undefined;
}

export function tokenizeCpp(source) {
  const tokens = [];
  let position = 0;
  let line = 1;
  let column = 1;
  let lineStart = true;

  const advance = () => {
    const character = source[position];
    position += 1;
    if (character === '\n') {
      line += 1;
      column = 1;
      lineStart = true;
    } else {
      column += 1;
    }
    return character;
  };

  const push = (type, value, startLine, startColumn) => {
    tokens.push({ type, value, line: startLine, column: startColumn });
  };

  while (position < source.length) {
    const startLine = line;
    const startColumn = column;
    const character = source[position];

    if (/\s/.test(character)) {
      let value = '';
      while (position < source.length && /\s/.test(source[position])) {
        value += advance();
      }
      push('whitespace', value, startLine, startColumn);
      continue;
    }

    if (character === '/' && source[position + 1] === '/') {
      let value = '';
      while (position < source.length && source[position] !== '\n') {
        value += advance();
      }
      push('comment', value, startLine, startColumn);
      lineStart = false;
      continue;
    }

    if (character === '/' && source[position + 1] === '*') {
      let value = advance() + advance();
      let closed = false;

      while (position < source.length) {
        const next = advance();
        value += next;
        if (next === '*' && source[position] === '/') {
          value += advance();
          closed = true;
          break;
        }
      }

      if (!closed) {
        throw new TranspileError('لم يتم إغلاق التعليق المتعدد.', {
          line: startLine,
          column: startColumn,
          hint: 'أضف */ في نهاية التعليق.',
        });
      }

      push('comment', value, startLine, startColumn);
      lineStart = false;
      continue;
    }

    if (character === '"' || character === "'") {
      const quote = character;
      let value = advance();
      let closed = false;

      while (position < source.length) {
        const next = advance();
        value += next;

        if (next === '\\') {
          if (position < source.length) value += advance();
          continue;
        }

        if (next === quote) {
          closed = true;
          break;
        }

        if (next === '\n') {
          throw new TranspileError('لم يتم إغلاق النص قبل نهاية السطر.', {
            line: startLine,
            column: startColumn,
            hint: quote === '"' ? 'أضف " لإغلاق النص.' : "أضف ' لإغلاق الحرف.",
          });
        }
      }

      if (!closed) {
        throw new TranspileError('لم يتم إغلاق النص.', {
          line: startLine,
          column: startColumn,
          hint: quote === '"' ? 'أضف " لإغلاق النص.' : "أضف ' لإغلاق الحرف.",
        });
      }

      push(quote === '"' ? 'string' : 'char', value, startLine, startColumn);
      lineStart = false;
      continue;
    }

    if (lineStart && character === '#') {
      let value = '';
      while (position < source.length && source[position] !== '\n') {
        value += advance();
      }
      push('preprocessor', value, startLine, startColumn);
      lineStart = false;
      continue;
    }

    if (isDigit(character)) {
      let value = '';

      if (character === '0' && /[xXbB]/.test(source[position + 1] || '')) {
        value += advance() + advance();
        const basePattern = /[xX]/.test(value) ? /[0-9a-fA-F]/ : /[01]/;
        while (position < source.length && basePattern.test(source[position])) {
          value += advance();
        }
      } else {
        while (position < source.length && isDigit(source[position])) {
          value += advance();
        }

        if (source[position] === '.' || source[position] === '٫') {
          value += advance();
          while (position < source.length && isDigit(source[position])) {
            value += advance();
          }
        }

        if (/[eE]/.test(source[position] || '')) {
          value += advance();
          if (/[+-]/.test(source[position] || '')) value += advance();
          while (position < source.length && isDigit(source[position])) {
            value += advance();
          }
        }
      }

      while (/[fFlLuU]/.test(source[position] || '')) {
        value += advance();
      }

      push('number', value, startLine, startColumn);
      lineStart = false;
      continue;
    }

    if (isIdentifierStart(character)) {
      let value = '';
      while (position < source.length && isIdentifierPart(source[position])) {
        value += advance();
      }
      push('identifier', value, startLine, startColumn);
      lineStart = false;
      continue;
    }

    push('punctuation', advance(), startLine, startColumn);
    lineStart = false;
  }

  return tokens;
}

const CPP_TYPE_NAMES = new Set([
  'auto', 'bool', 'char', 'double', 'float', 'int', 'long', 'short',
  'signed', 'string', 'unsigned', 'void', 'wchar_t',
]);

const CPP_CONTROL_NAMES = new Set([
  'catch', 'for', 'if', 'sizeof', 'switch', 'while',
]);

const CPP_FUNCTION_TYPE_SKIP = new Set([
  '', '&', '*', 'const', 'constexpr', 'explicit', 'extern', 'friend',
  'inline', 'static', 'virtual',
]);

function tokenTarget(token) {
  if (!token || token.type !== 'identifier') return token ? token.value : '';
  const keyword = keywordFor(token.value);
  return keyword === undefined ? token.value : keyword;
}

function previousSignificantIndex(tokens, index) {
  for (let current = index - 1; current >= 0; current -= 1) {
    if (!['whitespace', 'comment', 'preprocessor'].includes(tokens[current].type)) {
      return current;
    }
  }
  return -1;
}

function findFunctionDefinitions(tokens) {
  const significant = tokens.filter(
    (token) => !['whitespace', 'comment', 'preprocessor'].includes(token.type),
  );
  const definitions = [];
  let depth = 0;

  for (let index = 0; index < significant.length; index += 1) {
    const token = significant[index];

    if (token.type === 'punctuation' && token.value === '{') {
      depth += 1;
      continue;
    }

    if (token.type === 'punctuation' && token.value === '}') {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (depth !== 0 || token.type !== 'punctuation' || token.value !== '(') {
      continue;
    }

    const nameIndex = previousSignificantIndex(significant, index);
    const nameToken = significant[nameIndex];
    if (!nameToken || nameToken.type !== 'identifier') continue;

    const name = tokenTarget(nameToken);
    if (CPP_CONTROL_NAMES.has(name)) continue;

    let typeIndex = previousSignificantIndex(significant, nameIndex);
    let typeName = '';

    while (typeIndex >= 0) {
      const candidate = tokenTarget(significant[typeIndex]);
      if (CPP_FUNCTION_TYPE_SKIP.has(candidate)) {
        typeIndex = previousSignificantIndex(significant, typeIndex);
        continue;
      }

      typeName = candidate;
      break;
    }

    const isMain = name === 'main';
    if (!isMain && !CPP_TYPE_NAMES.has(typeName)) continue;

    let parenthesisDepth = 0;
    let closingIndex = -1;

    for (let cursor = index; cursor < significant.length; cursor += 1) {
      const current = significant[cursor];
      if (current.type !== 'punctuation') continue;

      if (current.value === '(') {
        parenthesisDepth += 1;
      } else if (current.value === ')') {
        parenthesisDepth -= 1;
        if (parenthesisDepth === 0) {
          closingIndex = cursor;
          break;
        }
      }
    }

    if (closingIndex < 0) continue;

    const afterParameters = significant[closingIndex + 1];
    if (
      !afterParameters
      || afterParameters.type !== 'punctuation'
      || afterParameters.value !== '{'
    ) {
      continue;
    }

    definitions.push({ name, isMain });
  }

  return definitions;
}

function buildIdentifierResolver(tokens) {
  const usedNames = new Set(CPP_RESERVED);
  const identifierMap = new Map();
  const reverseIdentifiers = new Map();

  for (const token of tokens) {
    if (token.type !== 'identifier') continue;
    if (keywordFor(token.value) !== undefined) continue;
    if (isAsciiIdentifier(token.value)) usedNames.add(token.value);
  }

  const resolve = (original) => {
    if (identifierMap.has(original)) return identifierMap.get(original);
    if (isAsciiIdentifier(original)) {
      identifierMap.set(original, original);
      return original;
    }

    const base = transliterateIdentifier(original);
    let candidate = base;
    let suffix = 2;

    while (usedNames.has(candidate)) {
      candidate = `${base}_${suffix}`;
      suffix += 1;
    }

    usedNames.add(candidate);
    identifierMap.set(original, candidate);
    reverseIdentifiers.set(candidate, original);
    return candidate;
  };

  return { resolve, identifierMap, reverseIdentifiers };
}

export function transpileCpp(source) {
  if (typeof source !== 'string') {
    throw new TypeError('source must be a string');
  }

  const tokens = tokenizeCpp(source);
  const { resolve, identifierMap, reverseIdentifiers } = buildIdentifierResolver(tokens);

  const hasInclude = tokens.some(
    (token) => token.type === 'preprocessor' && /^\s*#\s*include\b/.test(token.value),
  );

  let usesString = tokens.some(
    (token) => token.type === 'identifier'
      && normalizeArabicWord(token.value) === normalizeArabicWord('نص'),
  );

  usesString ||= tokens.some(
    (token) => token.type === 'preprocessor' && /<string>/.test(token.value),
  );

  const warnings = [];

  if (usesString) {
    const keyword = CPP_KEYWORDS.find((entry) => entry.ar === 'نص');
    if (keyword?.warning) warnings.push(keyword.warning);
  }

  let prelude = '';
  if (!hasInclude) {
    prelude = '#include <iostream>\n';
    if (usesString) prelude += '#include <string>\n';
    prelude += 'using namespace std;\n';
  }

  const definitions = findFunctionDefinitions(tokens);
  const hasMain = definitions.some((definition) => definition.isMain);

  if (!hasMain && definitions.length > 0) {
    throw new TranspileError('لا توجد دالة رئيسية لتشغيل البرنامج.', {
      line: 1,
      column: 1,
      hint: 'أضف دالة رئيسية مثل: صحيح رئيسية() { ... }، ثم استدعِ الدوال بداخلها.',
    });
  }

  let seenCode = false;
  let hasNonLeadingPreprocessor = false;

  for (const token of tokens) {
    if (token.type === 'whitespace' || token.type === 'comment') continue;
    if (token.type === 'preprocessor') {
      if (seenCode) hasNonLeadingPreprocessor = true;
      continue;
    }
    seenCode = true;
  }

  if (!hasMain && hasNonLeadingPreprocessor) {
    throw new TranspileError('لا يمكن إضافة دالة رئيسية تلقائيًا لهذا الكود.', {
      line: 1,
      column: 1,
      hint: 'ضع توجيهات #include و#define في بداية الكود، أو أضف دالة رئيسية صريحة.',
    });
  }

  let output = '';
  let preprocessorOutput = '';
  let skipPreprocessorNewline = false;

  for (const token of tokens) {
    if (token.type === 'whitespace') {
      let value = token.value;

      if (skipPreprocessorNewline && /^\r?\n/.test(value)) {
        value = value.replace(/^\r?\n/, '');
        skipPreprocessorNewline = false;
      }

      output += value;
      continue;
    }

    if (token.type === 'preprocessor') {
      if (hasMain) {
        output += token.value;
      } else {
        preprocessorOutput += `${token.value}\n`;
        skipPreprocessorNewline = true;
      }
      continue;
    }

    if (
      token.type === 'comment'
      || token.type === 'string'
      || token.type === 'char'
    ) {
      output += token.value;
      continue;
    }

    if (token.type === 'number') {
      output += toAsciiDigits(token.value).replace(/٫/g, '.');
      continue;
    }

    if (token.type === 'identifier') {
      const keyword = keywordFor(token.value);

      if (keyword !== undefined) {
        if (keyword === '') {
          output = output.replace(/[ \t]+$/, '');
          continue;
        }

        output += keyword;
        continue;
      }

      output += resolve(token.value);
      continue;
    }

    output += normalizePunctuation(token.value);
  }

  let code = prelude + preprocessorOutput + output;
  let preludeLines = (prelude.match(/\n/g) || []).length;

  if (!hasMain) {
    const body = output.endsWith('\n') ? output : `${output}\n`;
    code = `${prelude}${preprocessorOutput}int main() {\n${body}return 0;\n}\n`;
    preludeLines += 1;
  }

  return {
    language: 'cpp',
    code,
    userCode: output,
    preludeLines,
    warnings,
    identifierMap,
    reverseIdentifiers,
  };
}
