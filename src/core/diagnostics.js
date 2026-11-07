export class TranspileError extends Error {
  constructor(message, { line = 1, column = 1, hint = '' } = {}) {
    super(message);
    this.name = 'TranspileError';
    this.line = line;
    this.column = column;
    this.hint = hint;
  }
}

export function lineColumnAt(text, index) {
  let line = 1;
  let column = 1;

  for (let position = 0; position < index && position < text.length; position += 1) {
    if (text[position] === '\n') {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }

  return { line, column };
}

export function withTimeoutHint(error) {
  if (error instanceof TranspileError) return error;
  return new TranspileError('تعذّر تحليل الكود العربي.', {
    hint: error && error.message ? error.message : '',
  });
}
