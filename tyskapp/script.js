let script = document.currentScript;
(async () => {
  let module = await import(script.src.replace(/[^\/]*$/, "") + "main.js");
  let elem = document.createElement("div");
  script.parentNode.insertBefore(elem, script);
  module.default({ elem });
})();
