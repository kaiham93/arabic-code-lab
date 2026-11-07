const BASE_STYLE = `<style>
  html { color-scheme: light; }
  body {
    margin: 0;
    padding: 1.25rem;
    font-family: "Segoe UI", Tahoma, "Noto Sans Arabic", Arial, sans-serif;
    line-height: 1.8;
    color: #1e2a32;
    background: #fff;
  }
  img, video { max-width: 100%; height: auto; }
  table { border-collapse: collapse; max-width: 100%; }
  td, th { border: 1px solid #d7d2c7; padding: 0.4rem 0.65rem; }
  code { direction: ltr; unicode-bidi: isolate; }
</style>`;

export function buildPreviewDocument(translatedHtml) {
  const html = String(translatedHtml || '');
  const headInjection = `<meta charset="UTF-8">${BASE_STYLE}`;
  const hasHtmlElement = /<html(?:\s|>)/i.test(html);

  if (hasHtmlElement) {
    if (/<head(?:\s|>)/i.test(html)) {
      return html.replace(/<head([^>]*)>/i, (match, attributes) => {
        return `<head${attributes}>${headInjection}`;
      });
    }

    return html.replace(/<html([^>]*)>/i, (match, attributes) => {
      return `<html${attributes}><head>${headInjection}</head>`;
    });
  }

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>${headInjection}</head>
<body>
${html}
</body>
</html>`;
}

export function runHtml(transpiled) {
  return {
    document: buildPreviewDocument(transpiled.code),
    warnings: transpiled.warnings || [],
  };
}
