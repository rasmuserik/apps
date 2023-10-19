(async function () {
  let v = self.veduz;

  v.state = v.state || {};
  v.update = async function update_state(path, fn, msg = {}) {
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
})();
