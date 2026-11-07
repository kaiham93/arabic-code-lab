import { SQL_KEYWORDS } from '../keywords.js';
import {
  isIdentifierPart,
  isIdentifierStart,
  normalizeArabicWord,
  normalizePunctuation,
  toAsciiDigits,
} from '../core/arabic.js';
import { TranspileError } from '../core/diagnostics.js';

const KEYWORD_MAP = new Map(
  SQL_KEYWORDS.map(({ ar, target }) => [normalizeArabicWord(ar), target]),
);

const FI = normalizeArabicWord('في');
const COMMAND_WORDS = new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP']);

function keywordFor(word) {
  const normalized = normalizeArabicWord(word);
  return KEYWORD_MAP.has(normalized) ? KEYWORD_MAP.get(normalized) : undefined;
}

function isAsciiDigit(character) {
  return character >= '0' && character <= '9';
}

function isArabicDigit(character) {
  return Boolean(character) && /[\u0660-\u0669\u06F0-\u06F9]/.test(character);
}

function isDigit(character) {
  return isAsciiDigit(character) || isArabicDigit(character);
}

export function tokenizeSql(source) {
  const tokens = [];
  let position = 0;
  let line = 1;
  let column = 1;

  const advance = () => {
    const character = source[position];
    position += 1;
    if (character === '\n') {
      line += 1;
      column = 1;
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

    if (character === '-' && source[position + 1] === '-') {
      let value = '';
      while (position < source.length && source[position] !== '\n') {
        value += advance();
      }
      push('comment', value, startLine, startColumn);
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
      continue;
    }

    if (character === "'" || character === '"' || character === '`') {
      const quote = character;
      let value = advance();
      let closed = false;

      while (position < source.length) {
        const next = advance();
        value += next;

        if (next === quote) {
          if (source[position] === quote) {
            value += advance();
            continue;
          }
          closed = true;
          break;
        }
      }

      if (!closed) {
        throw new TranspileError('لم يتم إغلاق النص في استعلام SQL.', {
          line: startLine,
          column: startColumn,
          hint: `أضف ${quote} لإغلاق النص.`,
        });
      }

      push(quote === "'" ? 'string' : 'quotedIdentifier', value, startLine, startColumn);
      continue;
    }

    if (isDigit(character)) {
      let value = '';

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

      push('number', value, startLine, startColumn);
      continue;
    }

    if (isIdentifierStart(character)) {
      let value = '';
      while (position < source.length && isIdentifierPart(source[position])) {
        value += advance();
      }
      push('identifier', value, startLine, startColumn);
      continue;
    }

    push('punctuation', advance(), startLine, startColumn);
  }

  return tokens;
}

export function transpileSql(source) {
  if (typeof source !== 'string') {
    throw new TypeError('source must be a string');
  }

  const tokens = tokenizeSql(source);
  let lastSignificant = -1;

  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index].type !== 'whitespace' && tokens[index].type !== 'comment') {
      lastSignificant = index;
    }
  }

  const lastToken = lastSignificant >= 0 ? tokens[lastSignificant] : null;
  const lastIsSemicolon = lastToken
    && lastToken.type === 'punctuation'
    && (lastToken.value === ';' || lastToken.value === '؛');
  const needsSemicolon = Boolean(lastToken) && !lastIsSemicolon;

  let output = '';
  let currentCommand = null;
  let insertHasInto = false;

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (token.type === 'identifier') {
      const normalized = normalizeArabicWord(token.value);

      if (normalized === FI) {
        const target = currentCommand === 'INSERT' && !insertHasInto ? 'INTO' : 'IN';
        output += target;
        if (target === 'INTO') insertHasInto = true;
      } else {
        const keyword = keywordFor(token.value);
        const mapped = keyword === undefined ? token.value : keyword;
        output += mapped;

        if (COMMAND_WORDS.has(mapped)) {
          currentCommand = mapped;
          insertHasInto = false;
        } else if (mapped === 'INTO') {
          insertHasInto = true;
        }
      }
    } else if (token.type === 'number') {
      output += toAsciiDigits(token.value).replace(/٫/g, '.');
    } else if (token.type === 'punctuation') {
      const normalizedPunctuation = normalizePunctuation(token.value);
      output += normalizedPunctuation;
      if (normalizedPunctuation === ';') {
        currentCommand = null;
        insertHasInto = false;
      }
    } else {
      output += token.value;
    }

    if (index === lastSignificant && needsSemicolon) {
      output += ';';
    }
  }

  return {
    language: 'sql',
    code: output,
    userCode: output,
    preludeLines: 0,
    warnings: [],
  };
}
