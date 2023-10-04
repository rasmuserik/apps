(async function () {
  let v = self.veduz;
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
          console.log("render-preact", view.preact);
          v.preact.render(view.preact, elem);
        } else if (view?.react) {
          console.log("render-react", view.react);
          v.react.dom.render(view.react, elem);
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
})();
