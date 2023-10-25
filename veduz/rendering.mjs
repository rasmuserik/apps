import { update, getState } from "./state.mjs";
import { Cursor } from "./cursor.mjs";
import reactdom from "https://esm.sh/react-dom";

let v = globalThis.veduz = globalThis.veduz || {};
let _renderers = {};
let _prevState = {};
function _rerender() {
  if (getState() !== _prevState) {
    _prevState = getState();
    for (const id in _renderers) {
      let appName = _renderers[id];
      let elem = document.getElementById(id);
      let view = v.apps?.[appName]?.render({
        cur: new Cursor(getState(), `/${appName}/elem_${id}`),
        elem,
      });
      if (view?.html) {
        elem.innerHTML = view.html;
      } else if (view?.react) {
        reactdom.render(view.react, elem);
      }
    }
  }
}
export function appElem(appName, elemId, params) {
  _renderers[elemId] = appName;
  if (v.apps[appName]?.init) {
    update(`/${appName}/elem_${elemId}`, v.apps[appName].init, params);
  }
}
async function renderLoop() {
  try {
    await _rerender();
  } catch (e) {
    console.error(e);
  }
  requestAnimationFrame(renderLoop);
}
renderLoop();
export function style(id, style) {
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
}
