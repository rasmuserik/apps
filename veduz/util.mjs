(async function () {
  if (!self.veduz) self.veduz = {};
  let v = self.veduz;
  v._prevTime = 0;
  v.uniqueTime = () => (v._prevTime = Math.max(Date.now(), v._prevTime + 1));
  v.btou = (o) =>
    btoa(o).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  v.utob = (o) => atob(o.replace(/-/g, "+").replace(/_/g, "/"));
  v.log = function log(type, obj = {}) {
    console.log("log", type, obj);
    v.emit({ ...obj, type: "log", dst: 0, log_type: type, time: Date.now() });
  };
})();
