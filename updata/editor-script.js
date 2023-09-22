let script = document.currentScript;
(async () => {
  let module = await import(script.src.replace(/[^\/]*$/, "") + "editor.js");
  let elem = document.createElement("div");
  script.parentNode.insertBefore(elem, script);
  module.default({ elem });
})();
