(async () => {
  let v = self.veduz;
  v.user = {}
  await v.load("deps/preact.js");
let { Component, h, render } = v.preact;
let lineheight = 20;
let element;

let form = [
  "list",
  { title: "Emne/Thema", path: "topics" },
  ["input", { title: "Titel auf Deutsch", path: "title/de" }],
  ["input", { title: "Titel på Dansk", path: "title/da" }],
  [
    "list",
    { title: "Personer/Personen", path: "people" },
    ["input", {
      title: "Personsbeskrivelse på dansk",
      path: "person/da",
      lines: 1,
    }],
    ["input", {
      title: "Personsbeschreibung auf Deutsch",
      path: "person/de",
      lines: 1,
    }],
    ["input", { title: "Udsagn på Dansk", path: "statement/da", lines: 3 }],
    ["input", { title: "Aussage auf Deutsch", path: "statement/de", lines: 3 }],
    ["select", { title: "Land", path: "country" }, "da", "de"],
    ["upload", { title: "Optagelse på Dansk", path: "audio/da" }],
    ["upload", { title: "Aufname auf Deutsch", path: "audio/de" }],
    ["upload", { title: "Billede/Bild", path: "img" }],
  ],
  ["input", {
    title: "Hintergrund auf Deutsch",
    path: "background/de",
    lines: 10,
  }],
  ["input", {
    title: "Baggrundstekst på dansk",
    path: "background/da",
    lines: 10,
  }],
];

let state = {
  topics: [
    await (await fetch(
      './topic1.json'
    )).json(),
  ],
};

function normalize_path(path) {
  if (typeof path === "string") {
    path = path.replace(/[^/]+\/\.\.\//g, "");
    path = path.split("/");
    path = path.filter((s) => s);
    path = path.map((s) => (s === "0" || s.match(/^[1-9][0-9]*$/)) ? +s : s);
  }
  return path;
}

let store = {
  get: (path, o) => {
    path = normalize_path(path);
    if (!o) o = state;
    if (path.length == 0) return o;
    let child = o[path[0]];
    if (path.length == 1) return child;
    return store.get(path.slice(1), child || {});
  },
  update(path, fn, o) {
    path = normalize_path(path);
    let isRoot = !o;
    let result;
    if (path.length == 0) {
      result = fn(o);
    } else {
      if (!o) o = state;
      let key = path[0];
      if (typeof o !== "object") {
        if (typeof key == "number") o = [];
        else o = {};
      }
      let child = o[key];
      if (path.length > 1 && typeof child !== "object") {
        child = typeof path[0] == "number" ? [] : {};
      }
      if (Array.isArray(o)) {
        o = [...o];
        o[key] = store.update(path.slice(1), fn, child);
      } else {
        o = { ...o, [key]: store.update(path.slice(1), fn, child) };
      }
      result = o;
    }
    if (isRoot) {
      state = result;
      rerender();
    }
    return result;
  },
};

function render_form(form, path) {
  if (form[1].path) path = path + "/" + form[1].path;
  let data = store.get(path);
  let result = [];
  switch (form[0]) {
    case "list":
      data = data || [];
      let items = data.map((item, i) =>
        h(
          "div",
          { class: "list-item" },
          i === 0 ? null : h("div", {
            class: "item-up list-item-button",
            onclick: () =>
              store.update(path, (o) => {
                if (i == 0) return o;
                o = [...o];
                let tmp = o[i - 1];
                o[i - 1] = o[i];
                o[i] = tmp;
                return o;
              }),
          }, "↑"),
          i === data.length - 1 ? null : h("div", {
            class: "item-down list-item-button",
            onclick: () =>
              store.update(path, (o) => {
                if (i == o.length - 1) return o;
                o = [...o];
                let tmp = o[i + 1];
                o[i + 1] = o[i];
                o[i] = tmp;
                return o;
              }),
          }, "↓"),
          h("div", {
            class: "item-delete list-item-button",
            onclick: () => {
              window.confirm("Er du sikker på at du vil slette dette?") &&
                store.update(path, (o) => {
                  return o.filter((_, j) => j != i);
                });
            },
          }, "🗑"),
          ...form.slice(2).map((f) => render_form(f, path + "/" + i)),
        )
      );
      result = [
        ...items,
        h(
          "span",
          {
            class: "list-item-button list-append-button",
            onclick: () =>
              store.update(path, (o) => {
                return [...(o || []), {}];
              }),
          },
          "+",
        ),
      ];
      break;
    case "input":
      result = [
        h("textarea", {
          style: {
            height: Math.min(
              window.innerHeight * .95,
              (form[1].lines || 1) * lineheight + 8,
            ) + "px",
          },

          value: data || "",
          oninput: (e) => store.update(path, () => e.target.value),
        }),
      ];
      break;
    case "select":
      result = [h("select", {
        value: data,
        onchange: (e) => store.update(path, () => e.target.value),
      },
        ...form.slice(2).map((f) => h("option", {
          value: f,
          selected: data === f,
        }, f)))]
        break;
    case "upload":
      result = [
        (data?.startsWith("data:audio") || data?.endsWith(".mp3")) &&
        h("audio", {src: data, controls: true}),
        (data?.startsWith("data:image") || data?.endsWith(".jpg")) && 
        h("img", {
          src: data,
          style: {
            maxHeight: 128,
          },
        }),
        h("br"),
        h("input", {
          type: "file",
          onchange: async (e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function(e) {
              const dataUrl = e.target.result;
              store.update(path, () => dataUrl);
            };
            reader.readAsDataURL(file);
          }
        })];
        break;

    default:
      result = ["TODO: " + form[0]];
  }
  return h(
    "div",
    { class: `form-${form[0]}` },
    form[1].title && h("div", { class: "title" }, form[1].title, ":"),
    ...result,
  );
}

function rerender() {
  console.log("rerender", state);
  if (!self.veduz) {
    render(
      h("h1", {
        style: {
          background: "red",
          margin: 10,
          padding: 10,
        },
      }, "Error: veduz-api not available on site"),
      element,
    );
  } else if (!self.veduz.user) {
    render(
      h("button", {
        class: "button",
        onclick: async () => {
          await veduz.login();
          rerender();
        },
      }, "Login"),
      element,
    );
  } else {
    render(
      h("div", { class: "appeditor" }, render_form(form, "")),
      element,
    );
  }
}
function style() {
  let elem = document.createElement("style");
  elem.innerHTML = `
    .appeditor {
        font-family: sans-serif;
        font-size: 14px;
    }
    .appeditor .title {
        margin: 10px 0 5px 0;
        font-weight: bold;
    }
    .appeditor .list-item-button {
        height: 36px;
        width: 36px;
        font-size: 20px;
        box-shadow: 1px 1px 6px 0px rgba(0,0,0,0.5);
        border-radius: 50%;
        display: inline-block;
        text-align: center;
        line-height: 36px;
        margin: 0 10px 0 0;
    }
    .appeditor .list-append-button {
        position: relative;
        top: 0px;
        margin: 0 0 30px 0;
        padding: 0px;
    }
    .appeditor .list-item {
        position: relative;
        padding: 8px;
        border-radius: 10px;
        margin: 0 0 10px 0;
        box-shadow: 1px 1px 6px 0px rgba(0,0,0,0.5);
    }
    .appeditor textarea {
        margin: 0;
        padding: 4px;
        border: 1px solid black;
        line-height: ${lineheight}px;
        width: 98%;
        font-family: sans-serif;
    `;
  document.head.appendChild(elem);
}

function main ({ elem }) {
  if (elem) {
    element = elem;
  }
  style();
  rerender();
}

let script = document.currentScript;
  let elem = document.createElement("div");
  document.body.appendChild(elem);
  main({ elem });
})();
