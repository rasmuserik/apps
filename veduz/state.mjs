import { Cursor } from "./cursor.mjs";
import {sleep} from './util.mjs';
globalThis.veduz = globalThis.veduz || {};
let v = globalThis.veduz;
v.state = v.state || {};

let running = false;
export function update(path, fn, msg = {}) {
  if(running) return (async () => {
    await sleep(0);
    return update(path, fn, msg);
  })();
  running = true;
  let o = fn({ ...msg, cur: new Cursor(v.state, path) }) || {};
  if (o instanceof Cursor && o._root !== v.state) {
    v.state = o._root;
    running = false;
    return {};
  }

  let cur = o?.cur;
  if (cur && cur._root !== v.state) {
    v.state = cur._root;
  }
  if (cur) delete o.cur;
 running = false;
  return o;
}
v.update = update;

export function getState() {
  return v.state;
}
export function getCur(path) {
  return new Cursor(v.state, path);
}
