let loadError = '';

try {
  importScripts('../../vendor/JSCPP.es5.min.js');
} catch (error) {
  loadError = error && error.message ? error.message : String(error);
}

if (loadError) {
  self.onmessage = (event) => {
    const id = Array.isArray(event.data) ? event.data[0] : null;
    self.postMessage({
      id,
      err: -1,
      msg: `تعذّر تحميل مشغّل C++: ${loadError}`,
    });
  };
}
