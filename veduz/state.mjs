import { Cursor } from "./cursor.mjs";
globalThis.veduz = globalThis.veduz || {};
let v = globalThis.veduz;
v.state = v.state || {};
export async function update(path, fn, msg = {}) {
  let o = (await fn({ ...msg, cur: new Cursor(v.state, path) })) || {};
  if (o instanceof Cursor && o._root !== v.state) {
    v.state = o._root;
    return {};
  }
  let cur = o?.cur;
  if (cur && cur._root !== v.state) {
    v.state = cur._root;
  }
  if (cur) delete o.cur;
  return o;
}
v.update = update;
export function getState() {
  return v.state;
}
