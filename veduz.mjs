(async function () {
  if (!self.veduz) self.veduz = {};

  let v = self.veduz;
  v.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  v._loading = v.loading || {};
  v.load = async function (url) {
    v.emit && v.emit({ dst: 0, type: "load", path: url });
    if (v._loading[url]) return v._loading[url];
    if (!url.startsWith("http")) {
      let baseUrl =
        location.hostname === "127.0.0.1" || location.hostname === "localhost"
          ? location.origin
          : "https://veduz.com";
      url = baseUrl + "/" + url;
    }

    let script = document.createElement("script");
    script.src = url;
    document.head.appendChild(script);
    let promise = new Promise((resolve) => (script.onload = resolve));
    v._loading[url] = promise;
    await promise;
    promise.isResolved = true;
    while (Object.values(v._loading).some((p) => !p.isResolved)) {
      await Promise.all(Object.values(v._loading));
    }
    await v.sleep(0);
    console.log('loaded', url);
  };

  await Promise.all([
    v.load("deps/cborx.js"),
    v.load("veduz/util.js"),
    v.load("veduz/cursor.js"),
    v.load("veduz/state.js"),
    v.load("veduz/messaging.js"),
    v.load("veduz/rendering.js"),
    v.load("veduz/main.js")
  ]);
})();
