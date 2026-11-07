const CODE_TOKEN = /(\b[A-Za-z]+\+\+)/g;
const LEFT_TO_RIGHT_ISOLATE = '\u2066';
const POP_DIRECTIONAL_ISOLATE = '\u2069';

export function isolateBidiTokens(value) {
  return String(value ?? '').replace(
    CODE_TOKEN,
    `${LEFT_TO_RIGHT_ISOLATE}$1${POP_DIRECTIONAL_ISOLATE}`,
  );
}
