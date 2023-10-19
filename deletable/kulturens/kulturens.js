(async () => {
  let v = self.veduz;
  await v.load("deps/react.js");
  await v.load("deps/htm.js");
  let { createElement, Fragment } = v.react;
  let h = createElement;
  let { html } = v.htm;
  v.kulturens = {};
  v.kulturens.init = async function ({ cur }) {
    let pages = await (
      await fetch("https://kulturens.solsort.com/wp-json/wp/v2/pages")
    ).json();
    cur = cur.set("../pages", pages);
    cur = cur.set("../changed", Math.random());
    return cur;
  };
  v.update("/kulturens/init", v.kulturens.init);
  function topBar({ cur }) {
    return h(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        },
      },
      h("ion-icon", { name: "chevron-back-outline", style: { fontSize: 36 } }),
      h(
        "div",
        {
          style: {
            flexGrow: 1,
            textAlign: "center",
          },
        },
        "KULTURENS"
      ),
      h("ion-icon", { name: "menu", style: { fontSize: 36, paddingRight: 20 } })
    );
  }
  function bottmBar({ cur }) {
    let path = cur.path();
    let buttons = {
      people: "people",
      chatbubbles: "discuss",
      home: "locations",
      library: "guides"
    }
    return h(
      "div",
      {
        style: {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 36,
          width: "100%",
        },
      },
      ...Object.keys(buttons).map((icon) =>
      h("div",
      {
        onClick: () => veduz.update(path, ({cur}) => cur.set("page", buttons[icon])),
      },
      h("ion-icon", { name: icon, style: { fontSize: 44 }, }),
      ))
    );
  }
  function root_view({ cur, width, height }) {
    let pages = cur.get("../pages");
    console.log(pages);
    let pageid = cur.get("page");
    console.log("pageid", pageid);
    let appContent = pages.find(x => x.slug === pageid) || pages.find((x) => x.slug === "app");
    return () =>
      h(
        "div",
        { style: { textAlign: "left" } },
        h(
          "div",
          {
            style: {
              //background: "#f3e2e0",
              background: "#fff",
              position: "absolute",
              top: 84,
              left: 0,
              width,
              height: height - 100,
              overflow: "auto",
            },
          },
          h("h1", {
            style: { padding: 30 },
            dangerouslySetInnerHTML: { __html: appContent.title.rendered },
          }),
          h("div", {
            style: { padding: 30 },
            dangerouslySetInnerHTML: { __html: appContent.content.rendered },
          })
        ),
        h(
          "div",
          {
            style: {
              paddingTop: 40,
              position: "absolute",
              top: 0,
              left: 0,
              width,
              height: 84,
              boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
              background: "#f1eee9",
              color: "rgb(25, 127, 255)",
            },
          },
          topBar({ cur })
        ),
        h(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              background: "#f1eee9",
              color: "rgb(25, 127, 255)",
              alignItems: "center",
              position: "absolute",
              bottom: 0,
              left: 0,
              width,
              height: 80,
              boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.75)",
            },
          },
          bottmBar({ cur })
        )
      );
  }
  v.kulturens.render = function ({ cur, elem }) {
    console.log("render");
    let width = elem.offsetWidth;
    let height = elem.offsetHeight;
    return { react: h(root_view({ cur, width, height })) };
  };
  let ionicons = document.getElementById("ionicons");
  if (!ionicons) {
    ionicons = document.createElement("script");
    ionicons.src = "https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.js";
    document.head.appendChild(ionicons);
  }
})();
self.v = self.veduz;
