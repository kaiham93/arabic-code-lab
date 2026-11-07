const ARABIC_INDIC_DIGITS = /[\u0660-\u0669\u06F0-\u06F9]/g;
const ARABIC_MARKS = /[\u0610-\u061A\u064B-\u065F\u0670\u0640\u06D6-\u06ED\u200C\u200D]/g;
const LETTER_OR_UNDERSCORE = /^[A-Za-z_\u0600-\u06FF]/u;

const TRANSLITERATION = new Map([
  ['ا', 'a'], ['أ', 'a'], ['إ', 'i'], ['آ', 'aa'], ['ٱ', 'a'],
  ['ب', 'b'], ['پ', 'p'], ['ت', 't'], ['ث', 'th'], ['ج', 'j'],
  ['چ', 'ch'], ['ح', 'h'], ['خ', 'kh'], ['د', 'd'], ['ذ', 'dh'],
  ['ر', 'r'], ['ز', 'z'], ['ژ', 'zh'], ['س', 's'], ['ش', 'sh'],
  ['ص', 's'], ['ض', 'd'], ['ط', 't'], ['ظ', 'z'], ['ع', 'a'],
  ['غ', 'gh'], ['ف', 'f'], ['ق', 'q'], ['ك', 'k'], ['ک', 'k'],
  ['گ', 'g'], ['ل', 'l'], ['م', 'm'], ['ن', 'n'], ['ه', 'h'],
  ['ة', 'a'], ['و', 'w'], ['ؤ', 'w'], ['ي', 'y'], ['ی', 'y'],
  ['ئ', 'y'], ['ى', 'a'], ['ء', ''], ['ۀ', 'a'],
]);

export function toAsciiDigits(value) {
  return value.replace(ARABIC_INDIC_DIGITS, (digit) => {
    const code = digit.charCodeAt(0);
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
    return String(code - 0x06f0);
  });
}

export function stripArabicMarks(value) {
  return value.replace(ARABIC_MARKS, '');
}

export function normalizeArabicWord(value) {
  return stripArabicMarks(value.normalize('NFC'))
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/[ىئ]/g, 'ي')
    .replace(/ؤ/g, 'و');
}

export function normalizePunctuation(character) {
  if (character === '،') return ',';
  if (character === '؛') return ';';
  if (character === '٫') return '.';
  if (character === '٬') return '';
  return character;
}

export function isIdentifierStart(character) {
  return Boolean(character) && /[\p{L}_]/u.test(character);
}

export function isIdentifierPart(character) {
  return Boolean(character) && /[\p{L}\p{M}\p{N}_\u200C\u200D]/u.test(character);
}

export function isAsciiIdentifier(value) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(value);
}

export function transliterateIdentifier(value) {
  let result = '';

  for (const character of value.normalize('NFC')) {
    if (/[A-Za-z0-9_]/.test(character)) {
      result += character;
      continue;
    }

    if (TRANSLITERATION.has(character)) {
      result += TRANSLITERATION.get(character);
      continue;
    }

    if (/[\u0660-\u0669\u06F0-\u06F9]/.test(character)) {
      result += toAsciiDigits(character);
      continue;
    }

    if (!stripArabicMarks(character)) {
      continue;
    }

    result += '_';
  }

  if (!LETTER_OR_UNDERSCORE.test(result)) {
    result = `id_${result}`;
  }

  return result;
}
