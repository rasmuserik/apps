(async function () {
  let scriptPath = document.currentScript.src.replace(/[^/]*$/, '');
  await import(scriptPath + 'veduz.mjs');
})();
