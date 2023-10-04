# Veduz standard library

Next: change veduz.js to load other parts.

## API


Functions:

- `v.sleep`
- `v.uniqueTime()`
- `v.load`
- `v.btou`
- `v.utob`
- `v.log(type, {...})`
- `v.exposes(permission, name, fn)`
- `v.emit(msg)`
- `v.call([[host,] type,] msg)`
- `v.update(path, fn({...msg, cur}) -> Cursor, msg)`
- `v.style(id, css-as-text)`
- **TODO** `v.mount(...)` synchronise state data to/from server etc.

Properties:

- `v.state`

Classes:

- `v.Any(type, data, children)`
- `v.new_any(type, data, children)`
- `v.Cursor(root, path?)`
    - `cd(path)`
    - `get(path)`
    - `update(path, fn)`
    - `set(path, val)`
    - `path()`
    - `type()`
    - `data()`
    - `children()`
    - `keys()`
    - `diff(next)`
    - `apply_changes(changes)`
    - TODO later: traceable

App data / functions:

- `v.$APP_NAME.render({cur})` returns `{html:"..."}` or `{preact:...}` or `{react: ...}`
- `v.$APP_NAME.init({cur})` returns `{cur}`
- TODO `v.$APP_NAME.start(...)`
- TODO `v.$APP_NAME.stop(...)`

Veduz reads `<script>`-tag it is loaded with, and handles the following properties (with or without `data-`):

- `app`, – load `veduz.com/app/app.js` and start it, with a target div/id
- `elem` - elem to render app into (create new at `<script>`-tag if not supplied
- `fullscreen` - whether the apps should use the entire screen
- `landscape-mockup` - app should open in an app mockup view



State content:

- `/$APP_NAME/elem_$ELEMID` state for current app-element

Deps loaded with `v.load('deps/$DEPNAME')`:
- `v.cborx`
- `v.preact`
- `v.marked`
- `v.mustache`

Messages:

- `src`
- `dst`
- `type`
- `rid`
- `result`
- `error`
- `state` property not allowed

