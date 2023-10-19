  import {update, getState} from './state.mjs';
  import {Cursor} from './cursor.mjs';
  import {call} from './messaging.mjs';
  async function mount_loop() {
    let mount = new Cursor(getState(), "/mount");
    for (const id of mount.keys()) {
      let cur = mount.cd(id);
      let path = cur.get("path");
      let server = cur.get("server");
      let remoteData = cur.cd("remoteData");
      let localData = cur.cd(path);
      let timestamp = cur.get("timestamp") || 0;

      if (!server.startsWith("veduz.com/")) continue;
      let serverPath = server.replace("veduz.com", "");

      // get local changes and push to server
      let local_changes = remoteData.diff(localData)
      let server_update = local_changes.map((o) => ({ ...o, path: serverPath + "/" + o.path, }));
      // NB: TODO fix error – apparently sync'ing at wrong location/path
      if (server_update.length) {
        console.log('pushing data to server', local_changes.map(o => o.path));
        let result = await call(0, "datastore_update", {
          changes: server_update,
        });
      }

      // get changes from server
      let serverChanges = await call(0, "datastore_since", {
        path: serverPath,
        since: timestamp,
      });
      if (serverChanges.length > 0) {
      serverChanges = serverChanges.map((o) => {
        o = {...o};
        if(o.path.startsWith(serverPath)) o.path = o.path.replace(serverPath, "");
        return o;
      });
        console.log("got data from server", serverChanges);
      await update(path, ({ cur }) => {
        let local_changes = remoteData.diff(cur);
        cur = cur.apply_changes(serverChanges).apply_changes(local_changes);
        return cur;
      });
      await update(remoteData.path(), ({ cur }) =>
        cur.apply_changes(serverChanges)
      );
      for (const { updated_at } of serverChanges) {
        timestamp = Math.max(timestamp, updated_at);
      }
      update(cur.cd("timestamp").path(), ({ cur }) => cur.set(timestamp));
      }
    }
    setTimeout(() => mount_loop(), 3000);
  };
  setTimeout(mount_loop, 1000);
