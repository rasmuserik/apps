(async () => {
  let v = self.veduz;
  await v.load("deps/react.js");
  await v.load("veduz/mount.js");
  let h = v.react.createElement;
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
    if (!form) return h("h1", {}, "Loading...");
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
                    onClick: () =>
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
                    onClick: () =>
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
                onClick: () =>
                  window.confirm("Er du sikker på at du vil slette dette?") &&
                  v.update(cur.path(), ({ cur }) =>
                    cur.update((o) => o.filter((_, j) => j != i))
                  ),
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
              onClick: () =>
                v.update(cur.path(), ({ cur }) =>
                  cur.update((o) => [...(o || []), {}])
                ),
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
            onInput: (e) =>
              v.update(cur.path(), ({ cur }) => cur.set("", e.target.value)),
          }),
        ];
        break;
      case "select":
        result = [
          h(
            "select",
            {
              value: data,
              onchange: (e) =>
                v.update(cur.path(), ({ cur }) => cur.set(e.target.value)),
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
                v.update(cur.path(), ({ cur }) => cur.set(dataUrl));
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

  async function doLogin({ cur }) {
    let email = cur.get("email");
    let userExists = await v.call(0, "user_exists", {
      email: cur.get("email"),
    });
    if (!userExists) {
      await v.call(0, "reset_password", { email });
      cur = cur.set("login_message", "Email sent with new password");
    } else {
      cur = cur.set("login_message", "");
    }
    return cur.set("route", ["password"]);
  }

  async function handle_password({ cur }) {
    let signin = await v.call(0, "login", {
      email: cur.get("email"),
      password: cur.get("password"),
    });
    if (signin.error) {
      return cur
        .set("login_message", "Login failed")
        .set("password", "")
        .set("route", ["login"]);
    }
    return cur.set("route", ["formedit"]);
  }

  function password({ cur }) {
    let style = {
      width: 240,
      boxSizing: "border-box",
      margin: 10,
      padding: 10,
      borderRadius: 5,
      border: "1px solid #999",
    };
    return h(
      "div",
      { class: "login" },
      h(
        "span",
        {
          style: { ...style, padding: 0, border: "none" },
        },
        "Enter password that you received per email:"
      ),
      h("input", {
        style,
        type: "password",
        name: "password",
        autocomplete: "current-password" /*"username"*/,
        placeholder: "password sent to " + cur.get("email"),
        value: cur.get("password", ""),
        onKeyDown: (e) =>
          e.key === "Enter" && v.update(cur.path(), handle_password),
        onInput: (e) => {
          localStorage.setItem("updata-pw", e.target.value);
          v.update(cur.path(), ({ cur }) =>
            cur.set("password", e.target.value)
          );
        },
      }),
      h(
        "button",
        {
          style,
          onClick: async () => v.update(cur.path(), handle_password),
        },
        "Login"
      ),
      h(
        "small",
        { style: { ...style, border: "none", padding: 0, color: "#666" } },
        cur.get("login_message", ""),
      ),
      h("button", {
        style: {
          margin: 10,
          padding: 10,
        },
        onClick: async () => {
          let email = cur.get("email");
          let result = await v.call(0, "reset_password", { email });
          if(result?.error) {
            v.update(cur.path(), ({cur}) => cur.set("login_message", result.error?.en));
          } else {
            v.update(cur.path(), ({cur}) => cur.set("password", "").set("login_message", "Email sent with new password"));
          }
        },
      }, "Send new password to " + cur.get("email")),
    );
  }

  function login({ cur }) {
    let style = {
      width: 240,
      boxSizing: "border-box",
      margin: 10,
      padding: 10,
      borderRadius: 5,
      border: "1px solid #999",
    };
    return h(
      "div",
      { class: "login" },
      h(
        "span",
        {
          style: { ...style, padding: 0, border: "none" },
        },
        "Sign in using your university email (enrolled in the course) to get access to edit the content:"
      ),
      h("input", {
        style,
        type: "email",
        name: "username",
        autocomplete: "email" /*"username"*/,
        placeholder: "abc123@alumni.ku.dk",
        value: cur.get("email"),
        onKeyDown: (e) => e.key === "Enter" && v.update(cur.path(), doLogin),
        onInput: (e) => {
          localStorage.setItem("updata-email", e.target.value);
          return v.update(cur.path(), ({ cur }) =>
            cur.set("email", e.target.value)
          );
        },
      }),
      h(
        "button",
        {
          style,
          onClick: async () => v.update(cur.path(), doLogin),
        },
        "Login"
      ),
      h(
        "small",
        { style: { ...style, border: "none", padding: 0, color: "#666" } },
        "(If you haven't logged in here before, you will get an email with a new password. Contact tyskapp@solsort.dk, if you have questions, or problems logging in)."
      ),
      h(
        "span",
        { style: { ...style, border: "none", padding: 0 } },
        cur.get("login_message", "")
      )
    );
  }
  async function logout({cur}) {
    localStorage.removeItem("updata-email");
    localStorage.removeItem("updata-pw");
    await v.call(0, "logout", {});
    return cur.set("password", "").set("email", "").set("route", ["login"]);
  }

  v.updata.init = async ({ cur }) => {
    //cur = cur.set("data", { topics: [await (await fetch("./topic1.json")).json()], });
    let roles = await v.call(0, "roles", {});
    let email = localStorage.getItem("updata-email") || "";
    let password = localStorage.getItem("updata-pw") || "";
    cur = cur.set("form", form);
    cur = cur.set("roles", roles);
    cur = cur.set("email", email);
    cur = cur.set("password", password);
    if (email && password) {
      setTimeout(() => v.update(cur.path(), handle_password), 0);
    }
    console.log(cur.cd("/mount/updata-data").path());
    cur = cur.set(`/mount/updata-data`, {
      path: "/" + cur.path() + "/data",
      server: "veduz.com/apps/tyskapp/data"
    })
    console.log("updata init", cur.get("/"));
    return cur;
  };
  v.updata.render = function ({ cur }) {
    let route = cur.get("route", []);
    //console.log("updata.render", route, cur);
    let [page] = route;
    let pages = {
      login,
      password,
      formedit: ({ cur }) => h("div", {}, 
      h("div", {style: {textAlign: "right"}}, "Logged in as: " + cur.get("email"), " ",
      h("button", {
        onClick: () => v.update(cur.path(), logout)
      }, "Log out")),
      render_form(cur.get("form"), cur.cd("data"))),
    };

    return {
      react: h(
        "div",
        { class: "appeditor" },
        (pages[page] || pages.login)({ cur })
      ),
    };
  };
})();
