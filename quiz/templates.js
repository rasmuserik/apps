import mustache from "../lib/mustache.js";
let templates = {};
export async function load_templates(url) {
  let html = await (await fetch(url)).text();
  let parser = new DOMParser();
  let doc = parser.parseFromString(html, "text/html");
  templates = {};
  for (const elem of doc.querySelectorAll("body > *")) {
    if (elem.id) {
      templates[elem.id] = elem.innerHTML;
    }
  }
  return templates;
}
export function template(name, obj = {}) {
  return mustache.render(templates[name] || "", obj);
}
