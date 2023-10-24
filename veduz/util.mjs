let _prevTime = 0;
export function uniqueTime() {
  _prevTime = Math.max(Date.now(), _prevTime + 1);
  return _prevTime;
}
export let btou = (o) =>
  btoa(o).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
export let utob = (o) => atob(o.replace(/-/g, "+").replace(/_/g, "/"));
export let sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function array_shuffle(a) {
  let input = [...a];
  let output = [];
  while (input.length > 0) {
    let pos = Math.random() * input.length | 0;
    output.push(input[pos]);
    input[pos] = input[input.length - 1];
    input.pop();
  }
  return output;
}
