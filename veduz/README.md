# Veduz API/platform

Various utility libraries + architecture for making apps.


It includes

- message-passing and rpc, – between running apps, – with server-validated roles for security
- central state a la redux, but accessed through functional cursors. Updated during message handling.
- Cursor that makes it easy to alter objects immutably
    - (may later on also be used for automatic reactive components).
- data abstraction (type, data, dict-of-children).


State 

- `/mount/`
- `/$APPNAME/` data for an app/widget (independent of view)
- `/$APPNAME/$ELEM_ID` data for a view of an app/widget

## Data abstraction
## 
State 

The core idea is to have a 

- `state` central app-state from which the user interface is rendered
- `cursor` simplified data abstraction and functional cursor, to make it easy to make changes to state purely functional
- `main` automounts
- `messaging`
- `mount`
- `rendering`
- `util`
