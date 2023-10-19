import * as veduz  from '../veduz.mjs';

console.log(veduz);

export function init({cur}) {
  console.log('init');
  return cur.set("initialised", true);
}
export function render({cur}) {
  return {html: "<h1>hello world</h1>"}
}
