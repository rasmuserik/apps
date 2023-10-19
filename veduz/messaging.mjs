  import {encode, decode} from 'https://esm.sh/cbor-x@1'
  import {update} from './state.mjs';
  import { uniqueTime } from './util.mjs';
  let _reconnectTime;
  let _socket;
  let _peer_id;
  let _unsent = {};
  let _exposed = {};
  let _send = async function _send(msg) {
    if (_socket?.readyState === WebSocket.OPEN) {
      _socket.send(encode(msg));
    } else {
      _unsent[uniqueTime()] = msg;
    }
  };
  async function _connect() {
    if (!_socket || _socket.readyState !== WebSocket.OPEN) {
      _reconnectTime = Math.min(_reconnectTime * 1.5, 30000);
      _socket = new WebSocket("wss://ws.veduz.com/ws");
      _socket.binaryType = "arraybuffer";
      await new Promise((resolve) => {
        _socket.onopen = resolve;
        _socket.onerror = resolve;
      });
      if (_socket.readyState === WebSocket.OPEN) {
        _reconnectTime = 500;
        _socket.onmessage = (e) => {
          let msg = decode(new Uint8Array(e.data));
          _peer_id = msg.dst;
          emit(msg);
        };

        let unsent = _unsent;
        _unsent = {};
        let t = String(Date.now() - 10000);
        for (const ts in unsent) {
          if (ts > t) _send(unsent[ts]);
        }
      }
    }
    setTimeout(() => _connect(), _reconnectTime);
  };
  if (!_reconnectTime) {
    _reconnectTime = 500;
    setTimeout(_connect, 0);
  }
  export function expose(permission, name, fn) {
    permission = ("system " + (permission || "local")).split(" ");
    _exposed[name] = { fn, permission };
  };
  export async function emit(msg) {
    if (msg.dst !== undefined && msg.dst !== _peer_id) return _send(msg);
    msg = { ...msg };
    msg.retries = Math.max(msg.retries || 10, 100) - 1;
    msg.roles = ["any", ...(msg.roles || ["local"])];

    let { fn, permission } = _exposed[msg.type] || {};
    if (!fn) return;
    if (!permission.some((p) => msg.roles.includes(p))) return;
    let { result, error } = update("/", fn, msg);
    if (msg.rid) {
      emit({
        dst: msg.src,
        src: msg.dst,
        type: "reply",
        id: msg.rid,
        result,
        error,
      });
    }
  };

  let _calls = new Map();
  let _next_rid = 1;
  export function call(...args) {
    let dst = args.length > 2 ? args[args.length - 3] : undefined;
    let type = args.length > 1 ? args[args.length - 2] : undefined;
    let req = args[args.length - 1] || {};
    let rid = _next_rid++;

    req = { ...req, dst, type, rid };
    let resolve, reject;
    let result = new Promise((res, rej) => {
      resolve = res;
      reject = rej;
    });

    let timeout = setTimeout(() => {
      _calls.delete(rid);
      reject({ error: "timeout" });
    }, 20000);
    _calls.set(rid, { req, reject, resolve, timeout });
    emit(req);
    return result;
  };

  expose("any", "reply", async function (res) {
    if (!_calls.has(res.id)) return;
    let { req, reject, resolve, timeout } = _calls.get(res.id);
    clearTimeout(timeout);
    if (req.dst !== res.src) return;
    if (res.error) return reject(res.error);
    return resolve(res.result);
  });

  expose("any", "ua", () => ({ result: navigator.userAgent }));
  expose("system", "sys:eval", async (msg) => ({
    result: new Function(msg.code)(),
  }));

  export function log(type, obj = {}) {
    console.log("log", type, obj);
    emit({ ...obj, type: "log", dst: 0, log_type: type, time: Date.now() });
  }; 