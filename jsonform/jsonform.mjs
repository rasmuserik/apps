import { createElement } from "https://esm.sh/react";
import { call, style, update, getCur } from "../veduz.mjs";
let h = createElement;

let lineheight = 20;
let form = [
  "list",
  { title: "Emne/Thema", path: "topics" },
  ["input", { title: "Titel auf Deutsch", path: "title/de" }],
  ["input", { title: "Titel på Dansk", path: "title/da" }],
  //["input", { title: "ID", path: "id" }],
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
    //["input", { title: "ID", path: "id" }],
    ["input", { title: "Udsagn på Dansk", path: "statement/da", lines: 3 }],
    ["input", { title: "Aussage auf Deutsch", path: "statement/de", lines: 3 }],
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
                      update(cur.path(), ({cur}) =>
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
                      update(cur.path(), ({cur}) =>
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
                update(cur.path(), ({ cur }) =>
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
              update(cur.path(), ({ cur }) =>
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
            update(cur.path(), ({ cur }) => cur.set("", e.target.value)),
        }),
      ];
      break;
    case "select":
      result = [
        h(
          "select",
          {
            value: data,
            onChange: (e) =>
              update(cur.path(), ({ cur }) => cur.set(e.target.value)),
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
          onChange: async (e) => {
            console.log("filechange", e);
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
              const dataUrl = e.target.result;
              update(cur.path(), ({ cur }) => cur.set(dataUrl));
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
style(
  "jsonform-stylel",
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

async function doLogin(path) {
  let cur = getCur(path);
  let email = cur.get("email");
  let userExists = await call(0, "user_exists", {
    email: cur.get("email"),
  });
  if (!userExists) {
    await call(0, "reset_password", { email });
    update(path, ({ cur }) =>
      cur
        .set("login_message", "Email sent with new password")
        .set("route", ["password"])
    );
  } else {
    update(path, ({ cur }) =>
      cur.set("login_message", "").set("route", ["password"])
    );
  }
}

async function handle_password(path) {
  let cur = getCur(path);
  let signin = await call(0, "login", {
    email: cur.get("email"),
    password: cur.get("password"),
  });

  if (signin.error) {
    update(path, ({ cur }) =>
      cur
        .set("login_message", "Login failed")
        .set("password", "")
        .set("route", ["login"])
    );
  } else {
    update(path, ({ cur }) => cur.set("route", ["formedit"]));
  }
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
      onKeyDown: (e) => e.key === "Enter" && handle_password(cur.path()),
      onInput: (e) => {
        localStorage.setItem("jsonform-pw", e.target.value);
        update(cur.path(), ({ cur }) => cur.set("password", e.target.value));
      },
    }),
    h(
      "button",
      {
        style,
        onClick: async () => handle_password(cur.path()),
      },
      "Login"
    ),
    h(
      "small",
      { style: { ...style, border: "none", padding: 0, color: "#666" } },
      cur.get("login_message", "")
    ),
    h(
      "button",
      {
        style: {
          margin: 10,
          padding: 10,
        },
        onClick: async () => {
          let email = cur.get("email");
          let result = await call(0, "reset_password", { email });
          if (result?.error) {
            update(cur.path(), ({ cur }) =>
              cur.set("login_message", result.error?.en)
            );
          } else {
            update(cur.path(), ({ cur }) =>
              cur
                .set("password", "")
                .set("login_message", "Email sent with new password")
            );
          }
        },
      },
      "Send new password to " + cur.get("email")
    )
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
      onKeyDown: (e) => e.key === "Enter" && doLogin(cur.path()),
      onInput: (e) => {
        localStorage.setItem("jsonform-email", e.target.value);
        return update(cur.path(), ({ cur }) =>
          cur.set("email", e.target.value)
        );
      },
    }),
    h(
      "button",
      {
        style,
        onClick: async () => doLogin(cur.path()),
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
function logout({ cur }) {
  localStorage.removeItem("jsonform-email");
  localStorage.removeItem("jsonform-pw");
  call(0, "logout", {});
  return cur.set("password", "").set("email", "").set("route", ["login"]);
}

export function init({ cur }) {
  //cur = cur.set("data", { topics: [await (await fetch("./topic1.json")).json()], });
  console.log("init");
  async () => {
    let roles = await call(0, "roles", {});
    update(cur.path(), ({ cur }) => cur.set("roles", roles));
  };
  let email = localStorage.getItem("jsonform-email") || "";
  let password = localStorage.getItem("jsonform-pw") || "";
  cur = cur.set("form", form);
  cur = cur.set("email", email);
  cur = cur.set("password", password);
  if (email && password) {
    setTimeout(() => handle_password(cur.path()), 0);
  }
  console.log(cur.cd("/mount/jsonform-data").path());
  cur = cur.set(`/mount/jsonform-data`, {
    path: "/" + cur.path() + "/data",
    server: "veduz.com/apps/tyskapp/data",
  });
  console.log("jsonform init", cur.get("/"));
  return cur;
}

function fix_data(cur) {
  let topics = cur.get("topics", "");
  console.log("fix_data", topics);
  for (const i in topics) {
    if (!topics[i].id)
      update(cur.path(), ({ cur }) =>
        cur.update(`topics/${i}/id`, (s) =>
          s
            ? s.replace(/[^a-z0-9_]/gi, "")
            : Math.random().toString(36).substring(2, 9)
        )
      );
    if (topics[i].people) {
      for (const j in topics[i].people) {
        if (topics[i].people[j].id) continue;
          update(cur.path(), ({ cur }) =>
            cur.update(`topics/${i}/people/${j}/id`, (s) =>
              s
                ? s.replace(/[^a-z0-9_]/gi, "")
                : Math.random().toString(36).substring(2, 9)
            )
          );
      }
    }
  }
}

export function render({ cur }) {
  let route = cur.get("route", []);
  fix_data(cur.cd("data"));
  console.log("jsonform.render", route, cur);
  let [page] = route;
  let pages = {
    login,
    password,
    formedit: ({ cur }) =>
      h(
        "div",
        {},
        h(
          "div",
          { style: { textAlign: "right" } },
          "Logged in as: " + cur.get("email"),
          " ",
          h(
            "button",
            {
              onClick: () => update(cur.path(), logout),
            },
            "Log out"
          )
        ),
        render_form(cur.get("form"), cur.cd("data"))
      ),
  };

  return {
    react: h(
      "div",
      { class: "appeditor" },
      (pages[page] || pages.login)({ cur })
    ),
  };
}
