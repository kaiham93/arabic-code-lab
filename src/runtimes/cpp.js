const DEFAULT_TIMEOUT_MS = 7000;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractLocation(text) {
  const lineMatch = text.match(/\bline\s+(\d+)(?:\s*\(column\s+(\d+)\))?/i);
  if (lineMatch) {
    return {
      line: Number(lineMatch[1]),
      column: lineMatch[2] ? Number(lineMatch[2]) : null,
    };
  }

  const compactMatch = text.match(/(?:^|\n)(\d+):(\d+)/);
  if (compactMatch) {
    return { line: Number(compactMatch[1]), column: Number(compactMatch[2]) };
  }

  return { line: null, column: null };
}

function swapIdentifiers(message, reverseIdentifiers) {
  let localized = message;
  const entries = [...reverseIdentifiers.entries()].sort((a, b) => b[0].length - a[0].length);

  for (const [generated, original] of entries) {
    if (!generated || generated === original) continue;
    const pattern = new RegExp(
      `(?<![A-Za-z0-9_])${escapeRegExp(generated)}(?![A-Za-z0-9_])`,
      'g',
    );
    localized = localized.replace(pattern, original);
  }

  return localized;
}

function localizeCppError(rawMessage, transpiled) {
  const text = String(rawMessage || '').trim();
  const location = extractLocation(text);
  let line = location.line;
  let column = location.column;

  if (line !== null && line > transpiled.preludeLines) {
    line -= transpiled.preludeLines;
  } else if (line !== null) {
    line = null;
    column = null;
  }

  let summaryKey = 'cpp.runtimeGeneric';

  if (/cannot find library/i.test(text)) {
    summaryKey = 'cpp.runtimeLibrary';
  } else if (/Parsing Failure|parse error|Expected /i.test(text)) {
    summaryKey = 'cpp.runtimeParse';
  } else if (/no main/i.test(text)) {
    summaryKey = 'cpp.runtimeNoMain';
  } else if (/division by zero/i.test(text)) {
    summaryKey = 'cpp.runtimeDivision';
  } else if (/overflow|out of range/i.test(text)) {
    summaryKey = 'cpp.runtimeOverflow';
  } else if (/infinite|too long|timed out/i.test(text)) {
    summaryKey = 'cpp.runtimeInfinite';
  }

  return {
    summaryKey,
    hintKey: summaryKey,
    details: swapIdentifiers(text, transpiled.reverseIdentifiers || new Map()),
    line,
    column,
  };
}

export function runCpp(transpiled, { input = '', timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  return new Promise((resolve) => {
    const startedAt = performance.now();
    let worker;

    try {
      worker = new Worker(new URL('../workers/cpp-worker.js', import.meta.url));
    } catch (error) {
      resolve({
        output: '',
        exitCode: null,
        durationMs: performance.now() - startedAt,
        error: {
          summaryKey: 'cpp.runtimeStartFailed',
          hintKey: 'cpp.runtimeStartFailed',
          details: error && error.message ? error.message : String(error),
          line: null,
          column: null,
        },
      });
      return;
    }

    let settled = false;

    const finish = (result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve({ durationMs: Math.round(performance.now() - startedAt), ...result });
    };

    const timer = setTimeout(() => {
      finish({
        output: '',
        exitCode: null,
        error: {
          summaryKey: 'cpp.runtimeTimeout',
          hintKey: 'cpp.runtimeTimeout',
          details: 'Execution timed out.',
          line: null,
          column: null,
        },
      });
    }, timeoutMs);

    const requestId = 1;
    let output = '';

    worker.onmessage = (event) => {
      const data = event.data || {};

      if (data.type === 'stdio.write') {
        output += String(data.data ?? '');
        return;
      }

      if (data.id !== requestId) return;

      if (data.err) {
        finish({
          output,
          exitCode: null,
          error: localizeCppError(data.msg, transpiled),
        });
        return;
      }

      finish({
        output,
        exitCode: Number.isInteger(data.data) ? data.data : 0,
        error: null,
      });
    };

    worker.onerror = (event) => {
      finish({
        output,
        exitCode: null,
        error: {
          summaryKey: 'cpp.runtimeWorkerFailed',
          hintKey: 'cpp.runtimeWorkerFailed',
          details: event.message || 'Worker failed to start.',
          line: null,
          column: null,
        },
      });
    };

    worker.postMessage([requestId, 'run', transpiled.code, input, {}]);
  });
}
