# Veduz standard library

- core:
    - `v.load`
    - `


- veduz - core
    - `v.load(...)`
    - dummy-message-queue
- util
- cborx
- Cursor + Any
- State
    - `v.update(path, fn({...msg, cur}) => Cursor || {state, ...}, msg)`
- Message passing + RPC
    - `v.emit(msg)`
    - `v.expose(permission, name, fn)`
    - `v.call(host, method, {...params})`
- server connection
- rendering

---

App functions

- `v.$APPNAME`.init({cur})`
- `v.$APPNAME`.render({cur})`
- `v.$APPNAME`.start({cur})`
- `v.$APPNAME`.stop({cur})`

---

- abstract over datatypes
- later: traceable

## Any

- `{type: "SomeType", data: somedata, children: {...}}`

utility functions:
- type(obj)
- data(obj)
- children(obj)


## Cursor:
- root 
- path


Methods:

- core methods
    - `constructor(obj, path?)`
    - `cd(path)`
    - `ls(relativePath?)` returns children list.
    - `path()`
    - `root()`
    - `update(relativePath?, fn)`
    - `get(relativePath?, defaultValue?)`
- made with other methods
    - `set(relativePath?, val)`
    - `diff(to)` returns changelist: `[{path, type, data, children},...]`
    - `applyChanges(changelist)`

