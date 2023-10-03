(async () => {
  const empty_arr = [];
  const empty_obj = {};
  function unique_strings(strs) {
    let acc = {};
    for(const s of strs) {
      acc[s] = true;
    }
    return Object.keys(acc);
  }
  function normalisePath(path) {
    if(Array.isArray(path)) return path;
    return ("/" + path + "/")
      .replace(/\/+/g, "/")
      .replace(/\/\.\//g, "/")
      .replace(/\/[^/]+\/\.\.\//g, "/")
      .split(/\//g)
      .slice(1, -1);
  }
  function addPath(a, b) {
    if (Array.isArray(a)) a = a.join('/');
    if (Array.isArray(b)) b = b.join('/');
    if (b.startsWith("/")) return b;
    return normalisePath(a + "/" + b);
  }
  function updateIn(o, path, fn) {
    if (path.length === 0) {
      return fn(o);
    }
    let k = path[0];
    let result;
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
  class Any {
    constructor(type, data = '', children = {}) {
      this._type = type;
      this._data = data;
      this._children= children;
    }
  }
  class Cursor {
    constructor(root, path=[]);
    this._root = root;
    path = normalisePath(path);
    this._path = path;

    let current = root;
    for (const k of path) {
      if (current instanceof Any) {
        current = current._children[k];
      } else {
        current = current[k];
      }
      if (!t) break;
    }
    this._current = current;
  }
  cd(path) {
    let newPath = addPath(this._path, path);
    return new Cursor(this._root, newPath);
  }
  get(path) {
    if (!path) {
      return this._current;
    }
    return this.cd(path).get();
  }
  update(path, fn) {
    if(arguments.length === 1){
      fn = path;
      path = undefined;
    }
    if(!path) {
      path = this._path;
    } else {
      path = addPath(this._path, path);
    }
    return new Cursor(updateIn(this._root, path, fn));
  }
  set(path, val) {
    if(arguments.length === 1){
      val = path;
      path = undefined;
    }
    return update(path, () => val);
  }
  path() {
    return '/' + this._path.join('/');
  }
  children() {
    let o = this._current;
    if(o instanceof Any) return this._current._children;
    if(o instanceof Object || Array.isArray(o)) return this._current;
    return empty_obj;
  }
  keys() {
    return Object.keys(this.children());
  }
  type() {
    let o = this._current;
    if(o === undefined || o === null) return "Nil";
    if(o instanceof Any) return o._type;
    return o?.constructor?.name;
  }
  data() {
    let o = this._current;
    if(o instanceof Any) return o._data;
    if(typeof o === 'object') return undefined;
    return o
  }
  diff(next, acc = []) {
    next = next.cd(this.path());
    if(this.get() === next.get()) return acc;
    let changed = undefined;
    if(this.data() !== next.data()) {
      changed = {path: this.path(), data: next.data()};
    }
    if(this.type() !== next.type()) {
      changed = changed || {path: this.path()};
      changed.type = next.type();
    }
    if(changed) acc.push(changed);
    if(this.children() !== next.children()) {
      let keys = unique_strings(this.keys().concat(next.keys()));
      for(const key of keys) {
        acc = this.cd(key).diff(next, acc);
      }
    }
    return acc;
  }
  function cursor(root, path = '') {
    return new Cursor(path, root);
  }
})();
