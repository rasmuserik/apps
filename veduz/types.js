(async () => {

  function Any(value, type, children) {
    this._value_ = value;
    if(type) this._type_ = type;
    if(children) this._children_ = children;
  }

  function Num(value) {
    this._value_ = +value;
  } 
  Num.prototype = new Any();

  function Str(value) {
    this._value_ = String(value);
  } 
  Str.prototype = new Any();

  function Bool(value) {
    this._value_ = !!value;
  }
  Str.prototype = new Any();

  function  Tuple(value) {
    this._value_ = Array.from(value);
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
        t = t._children_[k];
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
    let val;
    if (o instanceof Any) {
      let new_children = { ...o._children_ };
      val = updateIn(o.children[k], path.slice(1), fn);
      if (val !== undefined) {
        new_children[k] = val;
      } else {
        delete new_children[k];
      }
      result = new Any(o._type_, o._data_, new_children);
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
})();
