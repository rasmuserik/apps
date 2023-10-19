# Veduz.com

Veduz.com hosts various prototypes and apps by [Solsort](https://solsort.com), and a generic app backend/platform for those – see <https://solsort.com> for more details.

Apps under development:

- [TyskApp](./tyskapp/) for a german course at KU
- [Quiz](./quiz/) with AI-generated quizzes
- [JsonForm](./jsonform) creates a form for editing JSON-data, without knowing json, – currently used to allow students to edit content for the TyskApp
- `smk_stl` to be renamed, – hack4dk hack

Apps to be migrated to the platform:

- Combigame
- Runicode



## Platform
# Veduz standard library



`/veduz.js` has code for loading + boots veduz.

- `v.sleep`
- `v.load(...)`

`veduz/util.js` contains various utilities:

- `v.uniqueTime()`
- `v.btou`
- `v.utob`
- `v.log(type, {...})`

`veduz/cursor.js` creates cursor class:

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

`veduz/state.js` handles state management/access.

- `v.update(path, fn({...msg, cur}) -> Cursor, msg)`

`veduz/messaging.js` handles messaging, networking, and rpc

- `v.exposes(permission, name, fn)`
- `v.emit(msg)`
- `v.call([[host,] type,] msg)`

Rendering:

- `v.style(id, css-as-text)`
- `v.$APPNAME.render({cur})` returns `{html:"..."}` or `{preact:...}` or `{react: ...}`

Main

- `v.$APP_NAME.init({cur})` returns `{cur}`

Functions:

- **TODO** `v.mount(...)` synchronise state data to/from server etc.

Properties:

- `v.state`

Classes:

App data / functions:

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

