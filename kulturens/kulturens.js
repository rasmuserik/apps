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
    cur = cur.set('../changed', Math.random());
    return cur;
  };
  v.update("/kulturens/init", v.kulturens.init);
  function topBar({ cur }) {
    return h("div", { style: { } }, "TODO: topbar");
  }
  function bottmBar({ cur }) {
    return h("div", { style: { } }, "TODO: bottom");
  }
  function root_view({ cur, width, height }) {
    let pages = cur.get('../pages');
    let appContent = pages.find(x => x.slug === 'app');
    console.log(appContent.content.rendered);
      return () => h(
        "div",
        {style: {textAlign: 'left'}},
        h(
          "div",
          {
            style: {
              position: "absolute",
              top: 60,
              left: 0,
              width,
              height: height - 100,
              scroll: "auto",
              overflow: "hidden",
            },
          },
          h("div", {
            style: { padding: 10 },
            dangerouslySetInnerHTML: { __html: appContent.content.rendered },
          })
        ),
        h(
          "div",
          {
            style: { 
              background: "gray",
              position: "absolute", top: 0, left: 0, width, height: 60 },
          },
          topBar({ cur })
        ),
        h(
          "div",
          {
            style: {
              position: "absolute",
              bottom: 0,
              background: "gray",
              left: 0,
              width,
              height: 80,
            },
          },
          bottmBar({ cur })
        )
      )
  }
  v.kulturens.render = function ({ cur, elem }) {
    console.log('render');
    let width = elem.offsetWidth;
    let height = elem.offsetHeight;

    console.log(elem);
    elem.style.background = "white";

    return {react: h(root_view({ cur, width, height }))};
  };
})();
self.v = self.veduz;
