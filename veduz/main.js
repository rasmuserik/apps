(async function () {
  let v = self.veduz;
  async function main() {
    let scriptTags = Array.from(document.querySelectorAll("script")).filter(
      (o) => o.src.endsWith("veduz.js")
    );
    for (const script of scriptTags) {
      let appName = script.getAttribute("app") || script.dataset["app"];
      if (appName) {
        let elemId = script.getAttribute("elem") || script.dataset["elem"];
        if (!elemId) {
          elemId = Math.random().toString(36).slice(2);
          script.dataset["elem"] = elemId;
        }
        let elem = document.getElementById(elemId);
        if (!elem) {
          if (
            !script.getAttribute("landscape-mockup") &&
            !script.dataset["landscape-mockup"]
          ) {
            elem = document.createElement("div");
            elem.className = "veduz-app veduz-app-" + appName;
            elem.id = elemId;
            if (
              script.getAttribute("fullscreen" || script.dataset["fullscreen"])
            ) {
              Object.assign(elem.style, {
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: "100%",
              });
              alert("here");
            }
            script.parentNode.insertBefore(elem, script);
          } else {
            let center = document.createElement("center");
            script.parentNode.insertBefore(center, script);
            //393 × 852
            center.innerHTML = `
  <div style="position: relative; display: inline-block; height: 908px; width: 409px">
    <div id=${elemId} 
      className="veduz-app veduz-app-${appName}"
      style="
        position: absolute; 
        top: 0px; left: 0px; 
        border: 8px solid black; 
        border-radius: 48px; 
        box-shadow: rgba(0, 0, 0, 0.5) 8px 8px 32px; 
        width: 393px;
        height: 852px;
        overflow:hidden;"
      ></div>
    <div style="
        position: absolute;
        left: 135px;
        top: 10px;;
        height: 30px;
        width: 123px;
        background: black;
        border-radius: 20px;"></div>
  </div> `;
          }
        }
        console.log('loading', appName);
        if (!v[appName]) await v.load(`${appName}/${appName}.js`);
        console.log('loaded', appName);
        for (let i = 0; !v[appName] && i < 100; ++i) {
          await v.sleep(i);
        }
        console.log('xys', v[appName]);
        if (v[appName]?.init) {
          v.update(`/${appName}/elem_${elemId}`, v[appName].init, {});
        }
        v._render(elemId, appName);
      }
    }
    setTimeout(() => (v.state = { ...v.state }), 100);
    v.log("veduz-client-loaded:" + location.hostname);
  }
  main();
})();
