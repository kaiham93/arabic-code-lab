export function createEditor({ textarea, gutter, onRun }) {
  const updateGutter = () => {
    const lines = textarea.value.split('\n');
    const fragment = document.createDocumentFragment();

    for (let index = 1; index <= lines.length; index += 1) {
      const lineNumber = document.createElement('span');
      lineNumber.className = 'line-number';
      lineNumber.textContent = String(index);
      fragment.append(lineNumber);
    }

    gutter.replaceChildren(fragment);
    gutter.scrollTop = textarea.scrollTop;
  };

  const syncScroll = () => {
    gutter.scrollTop = textarea.scrollTop;
  };

  const dispatchInput = () => {
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  };

  textarea.addEventListener('input', updateGutter);
  textarea.addEventListener('scroll', syncScroll);

  textarea.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.setRangeText('    ', start, end, 'end');
      updateGutter();
      dispatchInput();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      onRun?.();
    }
  });

  updateGutter();

  return {
    getValue() {
      return textarea.value;
    },
    setValue(value, { resetScroll = true } = {}) {
      textarea.value = value;
      if (resetScroll) {
        textarea.scrollTop = 0;
        textarea.scrollLeft = 0;
      }
      updateGutter();
    },
    focus() {
      textarea.focus();
    },
    refresh: updateGutter,
  };
}
