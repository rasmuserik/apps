(async function () {
  if (!self.veduz) self.veduz = {};
  let v = self.veduz;

  //////////////////////
  // Utility functions
  //////////////////////
  v.sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  v._loading = {};
  v.load = async function (url) {
    console.log("start-load", url);
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

    /*
    while(v._loading.length > 0) {
      console.log(v._)
      while(v._loading[0].isResolved) {
        v._loading.shift();
      }
      await Promise.all(v._loading);
    }
    */
    console.log("end-load", url);
  };
  v.btou = (o) =>
    btoa(o).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  v.utob = (o) => atob(o.replace(/-/g, "+").replace(/_/g, "/"));
  v.log = function log(type, obj = {}) {
    v.emit({ ...obj, type: "log", dst: 0, log_type: type });
  };

  ////////////////////
  // Any
  //////////////////
  v.Any = Any;
  function Any(type = "", data = "", children = {}) {
    this._type = type;
    this._data= data;
    this._children = children;
  }

  ////////////////////
  // Cursor
  //////////////////
  function normalisePath(path) {
    return ("/" + path + "/")
      .replace(/\/+/g, "/")
      .replace(/\/\.\//g, "/")
      .replace(/\/[^/]+\/\.\.\//g, "/")
      .slice(1, -1);
  }
  function addPath(a, b) {
    if (b.startsWith("/")) return b;
    return a + "/" + b;
  }
  v.Cursor = function (root, path) {
    this._root = root;
    this._path = normalisePath(path || "/");
  };
  v.Cursor.prototype.cd = function cd(path) {
    return new v.Cursor(this._root, addPath(this._path, String(path)));
  };
  v.Cursor.prototype.get = function get(path, defaultValue) {
    if (path) return this.cd(path).get();
    let t = this._root;
    for (const k of this._path.split("/")) {
      if (t instanceof Any) {
        t = t._children[k];
      } else {
        t = t[k];
      }
      if (!t) break;
    }
    return t === undefined ? defaultValue : t;
  };
  function updateIn(o, path, fn) {
    if (path.length === 0) {
      return fn(o);
    }
    let k = path[0];
    let result;
    let prev_val;
    let val;
    if (o instanceof Any) {
      let new_children = { ...o._children };
      val = updateIn(o.children[k], path.slice(1), fn);
      if (val !== undefined) {
        new_children[k] = val;
      } else {
        delete new_children[k];
      }
      result = new Any(o._type, o._data, new_children);
    } else if (o instanceof Array) {
      result = [...o];
      val = updateIn(o[k], path.slice(1), fn);
      if (val !== undefined) {
        result[k] = val;
      } else {
        delete result[k];
      }
    } else if (o instanceof Object) {
      result = { ...o };
      val = updateIn(o[k], path.slice(1), fn);
      if (val !== undefined) {
        result[k] = val;
      } else {
        delete result[k];
      }
    } else {
      result = {};
      val = updateIn(undefined, path.slice(1), fn);
      if (val !== undefined) {
        result[k] = val;
      }
    }
    return result;
  }
  v.Cursor.prototype.update = function update(...args) {
    let fn = args.pop();
    let path = args.pop() || "";
    let absPath = normalisePath(addPath(this._path, path)).split("/");
    return new v.Cursor(updateIn(this._root, absPath, fn), this._path);
  };
  v.Cursor.prototype.set = function set(...args) {
    let val = args.pop();
    let path = args.pop() || "";
    return this.update(path, () => val);
  };
  v.Cursor.prototype.path = function path() {
    return this._path;
  };

  ///////////////
  // state
  //////////////
  v.state = v.state || {};

  ////////////////////
  // Rendering
  ////////////////////
  v._renderers = v.renderers || {};
  v._rerender = function _rerender() {
    if (v.state !== v._prevState) {
      v._prevState = v.state;
      for (const id in v._renderers) {
        let appName = v._renderers[id];
        let elem = document.getElementById(id);
        let view = veduz?.[appName]?.render({
          cur: new v.Cursor(v.state, `/${appName}/elem_${id}`),
          elem,
        });
        if (view?.html) {
          elem.innerHTML = view.html;
        } else if (view?.preact) {
          v.preact.render(view.preact, elem);
        }
      }
    }
  };
  v._render = function _render(id, appName) {
    v._renderers[id] = appName;
  };
  if (!v._renderLoopStarted) {
    v._renderLoopStarted = true;
    async function renderLoop() {
      try {
        await v._rerender();
      } catch (e) {
        console.error(e);
      }
      requestAnimationFrame(renderLoop);
    }
    renderLoop();
  }
  v.style = function (id, style) {
    let elem = document.getElementById(id);
    if (!elem) {
      elem = document.createElement("style");
      elem.id = id;
      document.head.appendChild(elem);
    }
    if (typeof style === "string") {
      elem.innerHTML = style;
    } else {
      throw new Error("TODO: style object");
    }
  };

  ////////////////////
  // Connect to veduz,
  // v.expose, v.emit, v.call
  ////////////////////
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
        v._send = (data) => v._socket.send(v.cborx.encode(data));
        v._socket.onmessage = (e) => {
          let msg = v.cborx.decode(new Uint8Array(e.data));
          v._peer_id = msg.dst;
          v.emit(msg);
        };
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
  v.update_state = async function update_state(path, fn, msg = {}) {
    let o = (await fn({ ...msg, cur: new v.Cursor(v.state, path) })) || {};
    if (o instanceof v.Cursor && o._root !== v.state) {
      v.state = o._root;
      return {};
    }
    let cur = o?.cur;
    if (cur && cur._root !== v.state) {
      v.state = cur._root;
    }
    if (cur) delete o.cur;
    return o;
  };
  v.emit = async function (msg) {
    if (msg.dst !== undefined && msg.dst !== v._peer_id) return v._send(msg);
    msg = { ...msg };
    msg.retries = Math.max(msg.retries || 10, 100) - 1;
    msg.roles = ["any", ...(msg.roles || ["local"])];

    let { fn, permission } = v._exposed[msg.type] || {};
    if (!fn) return;
    if (!permission.some((p) => msg.roles.includes(p))) return;
    let { result, error } = v.update_state("/", fn, msg);
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
    let req = args[args.length - 1];
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

  ////////////////////
  // Message passing :
  // expose, emit, call
  ////////////////////
  v.expose("any", "ua", () => ({ result: navigator.userAgent }));
  v.expose("system", "sys:eval", async (msg) => ({
    result: new Function(msg.code)(),
  }));

  //////////////////////
  // Login functionality (old code)
  //////////////////////
  if (!v.login) {
    let app_id = "48a7de57-c558-4092-ba78-57e9d5f5a4dc";
    let session = JSON.parse(sessionStorage.getItem(app_id) || "{}");

    async function login(site = "https://solsort.com") {
      let app_name = `Veduz WP Client (ID:${
        location.host + location.pathname
      }-${v.btou(
        String.fromCharCode(...crypto.getRandomValues(new Uint8Array(6)))
      )})`;
      let api_url = site + "/wp-json/";
      let api_info = await (await fetch(api_url)).json();
      let auth_url =
        api_info.authentication?.["application-passwords"]?.endpoints
          ?.authorization || site + "/wp-admin/authorize-application.php";
      let auth_request =
        auth_url +
        `?app_name=${encodeURIComponent(
          app_name
        )}&app_id=${app_id}&success_url=${encodeURIComponent(
          location.origin + location.pathname
        )}`;
      if (!session.auth) {
        location.href = auth_request;
      }

      let user = await api("wp/v2/users/me");

      v.user = {
        username: user.name,
        wpuser: user,
      };
    }
    v.login = login;
    v.wprest = api;

    init();
    function init() {
      let saveSession = () =>
        sessionStorage.setItem(app_id, JSON.stringify(session));
      function parseQuery(qs) {
        let o = {};
        for (const s of qs.replace(/^[?]/, "").split(/&/g)) {
          let [k, v] = s.split("=");
          o[k] = decodeURIComponent(v);
        }
        return o;
      }

      let query = parseQuery(location.search) || {};
      if (query.user_login) {
        session.auth = { ...session.query, ...query };
        saveSession();
        location.href = location.href.replace(/[?].*/, "");
      }
    }
    async function api(path, opt) {
      path = session.auth.site_url + "/wp-json/" + path;
      opt = opt || {};
      opt.headers = opt.headers || {};
      opt.headers.Authorization = `Basic ${v.btou(
        session.auth.user_login + ":" + session.auth.password
      )}`;
      return await (await fetch(path, opt)).json();
    }
  }

  if (!v.data) {
    v.data = {
      get(path) {
        return v.wprest(`veduz/v1/data/${path}`);
      },
      put(path, type, data = "", permission = "") {
        return v.wprest(`veduz/v1/data/${path}`, {
          method: "PUT",
          body: JSON.stringify({ type, data, permission }),
        });
      },
    };
  }

  //////////////////////
  // main / test
  /////////////////////
  async function main() {
    await v.sleep(400);
    let t0 = Date.now();
    let pong = await v.call(0, "ping", {});
    v.log("ping-time", {
      numeric: Date.now() - t0,
      drift: Date.now() - Date.parse(pong.now),
    });

    let peers = await v.call(0, "peers", {});
    for (const peer of peers) {
      if (peer === v._peer_id) continue;
      console.log("peer", peer, await v.call(peer, "ua", {}));
      v.call(peer, "sys:eval", {
        code: "alert('hello from ' + location.href)",
      });
    }
  }
  //  main();

  ////////////////////
  // main

  let scriptTags = Array.from(document.querySelectorAll("script")).filter((o) =>
    o.src.endsWith("veduz.js")
  );
  for (const script of scriptTags) {
    let appName = script.getAttribute("app") || script.dataset["app"];
    if (appName) {
      let elemId = script.getAttribute("elem") || script.dataset["elem"];
      if (!elemId) {
        elemId = Math.random().toString(36).slice(2);
        script.dataset["elem"] = elemId;
      }
      let elem = document.getElementById(elemId);
      if (!elem) {
        elem = document.createElement("div");
        elem.className = "veduz-app veduz-app-" + appName;
        elem.id = elemId;
        script.parentNode.insertBefore(elem, script);
      }
      if (!v[appName]) await v.load(`${appName}/${appName}.js`);
      if (v[appName]?.init) {
        v.update_state(`/${appName}/elem_${elemId}`, v[appName].init, {});
      }
      v._render(elemId, appName);
    }
  }
  setTimeout(() => (v.state = { ...v.state }), 100);
})();
