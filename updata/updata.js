(async () => {
  let v = self.veduz;
  await v.load("deps/preact.js");
  let { h } = v.preact;
  v.updata = v.updata || {};

  let lineheight = 20;
  let form = [
    "list",
    { title: "Emne/Thema", path: "topics" },
    ["input", { title: "Titel auf Deutsch", path: "title/de" }],
    ["input", { title: "Titel på Dansk", path: "title/da" }],
    [
      "list",
      { title: "Personer/Personen", path: "people" },
      [
        "input",
        {
          title: "Personsbeskrivelse på dansk",
          path: "person/da",
          lines: 1,
        },
      ],
      [
        "input",
        {
          title: "Personsbeschreibung auf Deutsch",
          path: "person/de",
          lines: 1,
        },
      ],
      ["input", { title: "Udsagn på Dansk", path: "statement/da", lines: 3 }],
      [
        "input",
        { title: "Aussage auf Deutsch", path: "statement/de", lines: 3 },
      ],
      ["select", { title: "Land", path: "country" }, "da", "de"],
      ["upload", { title: "Optagelse på Dansk", path: "audio/da" }],
      ["upload", { title: "Aufname auf Deutsch", path: "audio/de" }],
      ["upload", { title: "Billede/Bild", path: "img" }],
    ],
    [
      "input",
      {
        title: "Hintergrund auf Deutsch",
        path: "background/de",
        lines: 10,
      },
    ],
    [
      "input",
      {
        title: "Baggrundstekst på dansk",
        path: "background/da",
        lines: 10,
      },
    ],
  ];
  function render_form(form, cur) {
    if(!form) return h("h1", {}, "Loading..."  )
    if (form[1].path) {
      let t = cur.cd(form[1].path);
      cur = t;
    }
    let data = cur.get();
    let result = [];
    switch (form[0]) {
      case "list":
        data = data || [];
        let items = data.map((item, i) =>
          h(
            "div",
            { class: "list-item" },
            i === 0
              ? null
              : h(
                  "div",
                  {
                    class: "item-up list-item-button",
                    onclick: () =>
                      v.update_state(cur.path(), ({cur}) =>
                      cur.update(o => {
                        if (i == 0) return o;
                        o = [...o];
                        let tmp = o[i - 1];
                        o[i - 1] = o[i];
                        o[i] = tmp;
                        return o;
                      })),
                  },
                  "↑"
                ),
            i === data.length - 1
              ? null
              : h(
                  "div",
                  {
                    class: "item-down list-item-button",
                    onclick: () =>
                      v.update_state(cur.path(), ({cur}) =>
                      cur.update(o => {
                        if (i == o.length - 1) return o;
                        o = [...o];
                        let tmp = o[i + 1];
                        o[i + 1] = o[i];
                        o[i] = tmp;
                        return o;
                      })),
                  },
                  "↓"
                ),
            h(
              "div",
              {
                class: "item-delete list-item-button",
                onclick: () => 
                  window.confirm("Er du sikker på at du vil slette dette?") &&
                  v.update_state(cur.path(), ({cur}) =>
                    cur.update(o => o.filter((_, j) => j != i)))
                ,
              },
              "🗑"
            ),
            ...form.slice(2).map((f) => render_form(f, cur.cd(i)))
          )
        );
        result = [
          ...items,
          h(
            "span",
            {
              class: "list-item-button list-append-button",
              onclick: () =>
                v.update_state(cur.path(), ({cur}) => 
                  cur.update(o => [...o || [], {}]))
            },
            "+"
          ),
        ];
        break;
      case "input":
        result = [
          h("textarea", {
            style: {
              height:
                Math.min(
                  window.innerHeight * 0.95,
                  (form[1].lines || 1) * lineheight + 8
                ) + "px",
            },

            value: data || "",
            oninput: (e) => v.update_state(cur.path(), ({cur}) => cur.set("", e.target.value) ),
          }),
        ];
        break;
      case "select":
        result = [
          h(
            "select",
            {
              value: data,
              onchange: (e) => v.update_state(cur.path(), ({cur}) => cur.set(e.target.value))
            },
            ...form.slice(2).map((f) =>
              h(
                "option",
                {
                  value: f,
                  selected: data === f,
                },
                f
              )
            )
          ),
        ];
        break;
      case "upload":
        result = [
          (data?.startsWith("data:audio") || data?.endsWith(".mp3")) &&
            h("audio", { src: data, controls: true }),
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
              reader.onload = function (e) {
                const dataUrl = e.target.result;
                v.update_state(cur.path(), ({cur}) => cur.set(dataUrl));
              };
              reader.readAsDataURL(file);
            },
          }),
        ];
        break;

      default:
        result = ["TODO: " + form[0]];
    }
    return h(
      "div",
      { class: `form-${form[0]}` },
      form[1].title && h("div", { class: "title" }, form[1].title, ":"),
      ...result
    );
  }
  v.style(
    "updata-stylel",
    `
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
    `
  );

  v.updata.init = async ({cur})  => cur.set("../form", form)
      .set("../data", {
      topics: [await (await fetch("./topic1.json")).json()],
    });
  v.updata.render = function ({ cur }) {
    console.log("updata.render", cur);
    return { preact: h("div", { class: "appeditor" }, render_form(cur.get("../form"), cur.cd("../data"))) };
  };
})();
