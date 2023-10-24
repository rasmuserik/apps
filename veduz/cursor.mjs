export const empty_obj = {};
///////////////
// Any
///////////////
export function Any(type, data, children) {
  this._type_ = type;
  this._data_ = data;
  this._children_ = children || empty_obj;
}
Any.prototype.data = function () {
  return this._data_;
};
Any.prototype.type = function () {
  return this._type_;
};
Any.prototype.children = function () {
  return this._children_;
};

export function new_any(type, data, children) {
  if (type === "String") return String(data);
  if (type === "Number") return +data;
  if (type === "Boolean") return !!data;
  if (type === "Nil") return undefined;
  if (type === "Object") {
    if (children?.constructor === Object) return children;
    return { ...children };
  }
  if (type === "Array") {
    if (children?.constructor === Array) return children;
    return to_array(children);
  }
  return new Any(type, data, children);
}
export function any_nochildren(any) {
  let cstr = any?.constructor;
  return cstr !== Object && cstr !== Array && cstr !== Any;
}
export function any_type(any) {
  if (any === null || any === undefined) return "Nil";
  let cstr = any?.constructor;
  if (cstr === Any) return any.type();
  if (cstr) return cstr.name;
}
export function any_data(any) {
  if (!any) return any;
  let cstr = any?.constructor;
  if (cstr === Object || cstr === Array) return undefined;
  if (cstr === Any) return any.data();
  return any;
}
export function any_children(any) {
  let cstr = any?.constructor;
  if (cstr === Object || cstr === Array) return any;
  if (cstr === Any) return any.children();
  return empty_obj;
}
export function any_keys(any) {
  return Object.keys(any_children(any));
}
export function any_get(any, key) {
  return any_children(any)[key];
}
export function any_set(any, key, val) {
  let cstr = any?.constructor;
  if (cstr === Object) {
    let result = { ...any };
    if (val === undefined) delete result[key];
    else result[key] = val;
    return result;
  }
  if (cstr === Array) {
    let result = [...any];
    if (val === undefined) delete result[key];
    else result[key] = val;
    return result;
  }
  if (cstr === Any) {
    let children = { ...any.children() };
    if (val === undefined) delete children[key];
    else children[key] = val;
    return new Any(any.type(), any.data(), children);
  }
  return any;
}

///////////////
// Util
///////////////
function to_array(obj) {
  let arr = [];
  if (obj) {
    for (const k in obj) {
      arr[k] = obj[k];
    }
  }
  return arr;
}
function unique_strings(strs) {
  let acc = {};
  for (const s of strs) {
    acc[s] = true;
  }
  return Object.keys(acc);
}
function updateIn(o, path, fn) {
  if (path.length === 0) {
    return fn(o);
  }
  let k = path[0];
  if (any_type(o) === "Nil") o = {};
  //if (any_nochildren(o)) o = {}; TODO: remove
  let v = updateIn(any_get(o, k), path.slice(1), fn);
  return any_set(o, k, v);
}
function normalisePath(path) {
  if (Array.isArray(path)) return path;
  return ("/" + path + "/")
    .replace(/\/+/g, "/")
    .replace(/\/\.\//g, "/")
    .replace(/\/[^/]+\/\.\.\//g, "/")
    .split(/\//g)
    .slice(1, -1);
}
function addPath(a, b) {
  a = Array.isArray(a) ? a.join("/") : String(a);
  b = Array.isArray(b) ? b.join("/") : String(b);
  if (b.startsWith("/")) return normalisePath(b);
  return normalisePath(a + "/" + b);
}

///////////////
// Cursor
///////////////

export function Cursor(root, path = []) {
  this._root = root;
  path = normalisePath(path);
  this._path = path;

  let current = root;
  for (const k of path) {
    current = any_get(current, k);
    if (!current) break;
  }
  this._current = current;
}
Cursor.prototype.cd = function cd(path) {
  let newPath = addPath(this._path, path);
  return new Cursor(this._root, newPath);
};
Cursor.prototype.get = function get(path, defaultValue) {
  if (!path) return this._current === undefined ? defaultValue : this._current;
  return this.cd(path).get(undefined, defaultValue);
};
Cursor.prototype.update = function update(path, fn) {
  if (arguments.length === 1) {
    fn = path;
    path = undefined;
  }
  if (!path) {
    path = this._path;
  } else {
    path = addPath(this._path, path);
  }
  return new Cursor(updateIn(this._root, path, fn), this._path);
};
Cursor.prototype.set = function set(path, val) {
  if (arguments.length === 1) {
    val = path;
    path = undefined;
  }
  return this.update(path, () => val);
};
Cursor.prototype.path = function path() {
  return "/" + this._path.join("/");
};
Cursor.prototype.children = function children() {
  return any_children(this._current);
};
Cursor.prototype.keys = function keys() {
  return any_keys(this._current);
};
Cursor.prototype.type = function type() {
  return any_type(this._current);
};
Cursor.prototype.data = function data() {
  return any_data(this._current);
};
Cursor.prototype.diff = function diff(next, prefix, acc = []) {
  if (!prefix) prefix = this.path();
  if (this.get() === next.get()) return acc;
  if (this.data() !== next.data() || this.type() !== next.type()) {
    acc.push({
      path: this.path().replace(prefix, "").replace(/^\//, ""),
      type: next.type(),
      data: next.data(),
    });
  }
  if (this.children() !== next.children()) {
    let keys = unique_strings(this.keys().concat(next.keys()));
    for (const key of keys) {
      acc = this.cd(key).diff(next.cd(key), prefix, acc);
    }
  }
  return acc;
};
Cursor.prototype.apply_changes = function apply_changes(changes) {
  let prefix = "/" + this.path() + "/";
  let cur = this;
  for (const change of changes) {
    let path = prefix + change.path;
    cur = cur.cd(path);
    cur = cur.set(
      new_any(
        change.hasOwnProperty("type") ? change.type : cur.type(),
        change.hasOwnProperty("data") ? change.data : cur.data(),
        cur.children(),
      ),
    );
  }
  cur = cur.cd(prefix);
  return cur;
};

///////////////
// Experiments
///////////////
async function main() {
  let orig = new Cursor(
    await (await fetch("../tyskapp/topic1.json")).json(),
    "/people/0",
  );
  let cur = orig.set("country", "da");
  let changes = orig.cd("/people").diff(cur.cd("/people"));
  let next = new Cursor({}, "/foo");
  next = next.apply_changes(changes);
  console.log(changes, next);
}
//main();
