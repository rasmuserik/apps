(async function () {
  if (!self.veduz) self.veduz = {};
  let v = self.veduz;

  v._unsent = {};
  v._send = async function _send(msg) {
    if (v._socket?.readyState === WebSocket.OPEN) {
      v._socket.send(v.cborx.encode(msg));
    } else {
      v._unsent[v.uniqueTime()] = msg;
    }
  };
  v._connect = async function connect() {
    if (!v.cborx) await v.load("deps/cborx.js");
    if (!v._socket || v._socket.readyState !== WebSocket.OPEN) {
      v._reconnectTime = Math.min(v._reconnectTime * 1.5, 30000);
      v._socket = new WebSocket("wss://ws.veduz.com/ws");
      v._socket.binaryType = "arraybuffer";
      await new Promise((resolve) => {
        v._socket.onopen = resolve;
        v._socket.onerror = resolve;
      });
      if (v._socket.readyState === WebSocket.OPEN) {
        v._reconnectTime = 500;
        v._socket.onmessage = (e) => {
          let msg = v.cborx.decode(new Uint8Array(e.data));
          v._peer_id = msg.dst;
          v.emit(msg);
        };

        let unsent = v._unsent;
        v._unsent = {};
        let t = String(Date.now() - 10000);
        for (const ts in unsent) {
          if (ts > t) v._send(unsent[ts]);
        }
      }
    }
    setTimeout(() => v._connect(), v._reconnectTime);
  };
  if (!v._reconnectTime) {
    v._reconnectTime = 500;
    setTimeout(v._connect, 0);
  }
  v._exposed = v._exposed || {};
  v.expose = function expose(permission, name, fn) {
    permission = ("system " + (permission || "local")).split(" ");
    v._exposed[name] = { fn, permission };
  };
  v.emit = async function (msg) {
    if (msg.dst !== undefined && msg.dst !== v._peer_id) return v._send(msg);
    msg = { ...msg };
    msg.retries = Math.max(msg.retries || 10, 100) - 1;
    msg.roles = ["any", ...(msg.roles || ["local"])];

    let { fn, permission } = v._exposed[msg.type] || {};
    if (!fn) return;
    if (!permission.some((p) => msg.roles.includes(p))) return;
    let { result, error } = v.update("/", fn, msg);
    if (msg.rid) {
      v.emit({
        dst: msg.src,
        src: msg.dst,
        type: "reply",
        id: msg.rid,
        result,
        error,
      });
    }
  };

  if (!v._calls) v._calls = new Map();
  if (!v._next_rid) v._next_rid = 1;
  v.call = function call(...args) {
    let dst = args.length > 2 ? args[args.length - 3] : undefined;
    let type = args.length > 1 ? args[args.length - 2] : undefined;
    let req = args[args.length - 1] || {};
    let rid = v._next_rid++;

    req = { ...req, dst, type, rid };
    let resolve, reject;
    let result = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    let timeout = setTimeout(() => {
      v._calls.delete(rid);
      reject({ error: "timeout" });
    }, 20000);
    v._calls.set(rid, { req, reject, resolve, timeout });
    v.emit(req);
    return result;
  };

  v.expose("any", "reply", async function (res) {
    if (!v._calls.has(res.id)) return;
    let { req, reject, resolve, timeout } = v._calls.get(res.id);
    clearTimeout(timeout);
    if (req.dst !== res.src) return;
    if (res.error) return reject(res.error);
    return resolve(res.result);
  });

  v.expose("any", "ua", () => ({ result: navigator.userAgent }));
  v.expose("system", "sys:eval", async (msg) => ({
    result: new Function(msg.code)(),
  }));

})();
