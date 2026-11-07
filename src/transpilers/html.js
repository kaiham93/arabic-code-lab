import { HTML_ATTRIBUTES, HTML_TAGS } from '../keywords.js';
import { normalizeArabicWord } from '../core/arabic.js';
import { TranspileError, lineColumnAt } from '../core/diagnostics.js';

const TAG_MAP = new Map(
  HTML_TAGS.map(({ ar, target }) => [normalizeArabicWord(ar).toLowerCase(), target]),
);

const ATTRIBUTE_MAP = new Map(
  HTML_ATTRIBUTES.map(({ ar, target }) => [normalizeArabicWord(ar).toLowerCase(), target]),
);

const QUOTE_PAIRS = new Map([
  ['"', '"'],
  ["'", "'"],
  ['“', '”'],
  ['”', '”'],
  ['«', '»'],
  ['»', '»'],
]);

function mapTag(name) {
  const mapped = TAG_MAP.get(normalizeArabicWord(name).toLowerCase());
  return mapped || name;
}

function mapAttribute(name) {
  const mapped = ATTRIBUTE_MAP.get(normalizeArabicWord(name).toLowerCase());
  return mapped || name;
}

function findTagEnd(source, start) {
  let quote = null;

  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index];

    if (quote) {
      if (character === quote) quote = null;
      continue;
    }

    if (QUOTE_PAIRS.has(character)) {
      quote = QUOTE_PAIRS.get(character);
      continue;
    }

    if (character === '>') return index;
  }

  return -1;
}

function processAttributes(raw) {
  let output = '';
  let index = 0;

  while (index < raw.length) {
    const character = raw[index];

    if (/\s/.test(character)) {
      output += character;
      index += 1;
      continue;
    }

    let nameStart = index;
    while (index < raw.length && !/[\s=]/.test(raw[index])) {
      index += 1;
    }

    const name = raw.slice(nameStart, index);
    output += mapAttribute(name);

    while (index < raw.length && /\s/.test(raw[index])) {
      output += raw[index];
      index += 1;
    }

    if (raw[index] !== '=') continue;

    output += '=';
    index += 1;

    while (index < raw.length && /\s/.test(raw[index])) {
      output += raw[index];
      index += 1;
    }

    const quote = raw[index];
    const closingQuote = QUOTE_PAIRS.get(quote);

    if (closingQuote) {
      const valueStart = index + 1;
      index += 1;
      while (index < raw.length && raw[index] !== closingQuote) {
        index += 1;
      }
      const value = raw.slice(valueStart, index);
      output += `"${value}"`;
      if (raw[index] === closingQuote) index += 1;
      continue;
    }

    const valueStart = index;
    while (index < raw.length && !/\s/.test(raw[index])) {
      index += 1;
    }
    output += raw.slice(valueStart, index);
  }

  return output;
}

function translateTag(raw, source, tagStart) {
  if (raw.startsWith('<!--')) {
    return raw;
  }

  if (raw.startsWith('<!') || raw.startsWith('<?')) {
    return raw;
  }

  const match = /^<\s*(\/?)\s*([\p{L}\p{N}_:-]+)/u.exec(raw);
  if (!match) return raw;

  const closing = Boolean(match[1]);
  const mappedName = mapTag(match[2]);

  if (closing) {
    return `</${mappedName}>`;
  }

  const inner = raw.slice(match[0].length, raw.length - 1);
  const selfClosing = /\/\s*$/.test(inner);
  const rawAttributes = selfClosing ? inner.replace(/\/\s*$/, '') : inner;
  let attributes = processAttributes(rawAttributes);

  if (mappedName.toLowerCase() === 'html') {
    if (!/(^|\s)lang\s*=/i.test(attributes)) attributes += ' lang="ar"';
    if (!/(^|\s)dir\s*=/i.test(attributes)) attributes += ' dir="rtl"';
  }

  const suffix = selfClosing ? ' />' : '>';
  return `<${mappedName}${attributes}${suffix}`;
}

export function transpileHtml(source) {
  if (typeof source !== 'string') {
    throw new TypeError('source must be a string');
  }

  let output = '';
  let position = 0;

  while (position < source.length) {
    if (source[position] !== '<') {
      const nextTag = source.indexOf('<', position);
      if (nextTag < 0) {
        output += source.slice(position);
        break;
      }
      output += source.slice(position, nextTag);
      position = nextTag;
      continue;
    }

    if (source.startsWith('<!--', position)) {
      const commentEnd = source.indexOf('-->', position + 4);
      if (commentEnd < 0) {
        const { line, column } = lineColumnAt(source, position);
        throw new TranspileError('لم يتم إغلاق تعليق HTML.', {
          line,
          column,
          hint: 'أضف --> لإغلاق التعليق.',
        });
      }
      output += source.slice(position, commentEnd + 3);
      position = commentEnd + 3;
      continue;
    }

    const nextCharacter = source[position + 1] || '';
    const isTag = nextCharacter === '/'
      || nextCharacter === '!'
      || nextCharacter === '?'
      || /[\p{L}]/u.test(nextCharacter);

    if (!isTag) {
      output += '<';
      position += 1;
      continue;
    }

    const tagEnd = findTagEnd(source, position);
    if (tagEnd < 0) {
      const { line, column } = lineColumnAt(source, position);
      throw new TranspileError('لم يتم إغلاق وسم HTML.', {
        line,
        column,
        hint: 'أضف > في نهاية الوسم.',
      });
    }

    const rawTag = source.slice(position, tagEnd + 1);
    output += translateTag(rawTag, source, position);
    position = tagEnd + 1;
  }

  return {
    language: 'html',
    code: output,
    userCode: output,
    preludeLines: 0,
    warnings: [],
  };
}
