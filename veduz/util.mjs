  let _prevTime = 0;
  export function uniqueTime() {
    _prevTime = Math.max(Date.now(), _prevTime + 1)
    return _prevTime;
 };
  export let btou = (o) =>
    btoa(o).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  export let utob = (o) => atob(o.replace(/-/g, "+").replace(/_/g, "/"));
