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
      ["upload", { title: "Optagelse på Dansk", path: "audio_da" }],
      ["upload", { title: "Aufname auf Deutsch", path: "audio_de" }],
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
            /*
            i === 0
              ? null
              : h(
                  "div",
                  {
                    class: "item-up list-item-button",
                    onclick: () =>
                      v.update(cur.path(), ({cur}) =>
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
                      v.update(cur.path(), ({cur}) =>
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
                */
            h(
              "div",
              {
                class: "item-delete list-item-button",
                onclick: () => 
                  window.confirm("Er du sikker på at du vil slette dette?") &&
                  v.update(cur.path(), ({cur}) =>
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
                v.update(cur.path(), ({cur}) => 
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
            oninput: (e) => v.update(cur.path(), ({cur}) => cur.set("", e.target.value) ),
          }),
        ];
        break;
      case "select":
        result = [
          h(
            "select",
            {
              value: data,
              onchange: (e) => v.update(cur.path(), ({cur}) => cur.set(e.target.value))
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
                v.update(cur.path(), ({cur}) => cur.set(dataUrl));
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
    }
    .appeditor .login {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
      top: 0;
      left: 0;
    }`
  );

  async function doLogin({cur}) {
    // TODO login

    let email = cur.get("email");
    let userExists = await v.call(0, 'user_exists', {email: cur.get("email")});
    console.log(email, userExists)

    return cur.set("route", ["formedit"]);
  }

  function login({cur}) {
    let style = {
          width: 240,
          boxSizing: "border-box",
          margin: 10,
          padding: 10,
          borderRadius: 5,
      border: "1px solid #999"
        }
    return h("div", {class: "login"},
      h("span", {

        style: {...style, padding: 0, border: "none"},

      }, "Sign in using your university email (enrolled in the course) to get access to edit the content:"),
      h("input", {
        style,
        type:"email",
        name: "username",
        autocomplete: "email" /*"username"*/,
          type: "text", 
          placeholder: "abc123@alumni.ku.dk", 
          value: cur.get("email"), 
          oninput: e => v.update(cur.path(), ({cur}) => cur.set("email", e.target.value))}),
      h("button", {
        style,
        onclick: async () => v.update(cur.path(), doLogin)},"Login"),
        h("small", {style: {...style, border: "none", padding: 0, color: "#666"}}, "(If you haven't logged in here before, you will get an email with a new password. Contact kulturapp@solsort.dk, if you have questions, or problems logging in).")
        );

  }

  v.updata.init = async ({cur})  => {
    cur = cur.set("form", form)
      .set("data", {
      topics: [await (await fetch("./topic1.json")).json()],
    });
    let roles = await v.call(0, 'roles', {});
    cur = cur.set('roles', roles)
    console.log('roles', roles);
    console.log('updata init');
    return cur;
  }
  v.updata.render = function ({ cur }) {
    let route = cur.get("route", []);
    console.log("updata.render", cur);
    console.log(route);
    let [page] = route;
    let pages = {
      login, 
      formedit: ({cur}) => render_form(cur.get("form"), cur.cd("data")),
    }

    return { preact: h("div", { class: "appeditor" }, 
    (pages[page] || pages.login)({cur}))};
  };
})();
