import { Cursor } from "./cursor.mjs";
globalThis.veduz = globalThis.veduz || {};
let v = globalThis.veduz;
v.state = v.state || {};


/**
 * Update the state of the application.
 * Ensures only one update happens at a time.
 * 
 * @param {string} path
 * @param {function} fn
 * @param {object} msg
 */
let updating = false;
export async function update(path, fn, msg = {}) {
  while (updating) {
    await updating;
  }
  let done;
  updating = new Promise(
    (resolve) =>
      (done = () => {
        updating = false;
        resolve();
      })
  );

  let o;
  try {
    o = (await fn({ ...msg, cur: new Cursor(v.state, path) })) || {};
  } catch (e) {
    //log('updata error', {error: String(e)});
    console.error(e);
  }
  if (o instanceof Cursor && o._root !== v.state) {
    v.state = o._root;
    done();
    return {};
  }
  let cur = o?.cur;
  if (cur && cur._root !== v.state) {
    v.state = cur._root;
  }
  if (cur) delete o.cur;
  done();
  return o;
}
v.update = update;

export function getState() {
  return v.state;
}
