# Cursor


```
c = cur([path,] obj)
c.cd(path)
c.update([path, ], fn)
c.get([path[, defaultValue]])
c.keys() => Array

c.diff



```

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

