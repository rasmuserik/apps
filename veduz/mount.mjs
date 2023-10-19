(() => {
  let v = self.veduz;
  if (!v.mount_loop) {
    setTimeout(() => v.mount_loop(), 1000);
  }
  v.mount_loop = async () => {
    let mount = new v.Cursor(v.state, "/mount");
    for (const id of mount.keys()) {
      let cur = mount.cd(id);
      let path = cur.get("path");
      let server = cur.get("server");
      let remoteData = cur.cd("remoteData");
      let localData = cur.cd(path);
      let timestamp = cur.get("timestamp") || 0;

      if (!server.startsWith("veduz.com/")) continue;
      serverPath = server.replace("veduz.com", "");

      // get local changes and push to server
      let local_changes = remoteData.diff(localData)
      let server_update = local_changes.map((o) => ({ ...o, path: serverPath + "/" + o.path, }));
      console.log('su', local_changes.map(o => o.path));
      // NB: TODO fix error – apparently sync'ing at wrong location/path
      if (false && server_update.length) {
        console.log("push changes to server", server_update);
        let result = await v.call(0, "datastore_update", {
          changes: server_update,
        });
      }

      // get changes from server
      let serverChanges = await v.call(0, "datastore_since", {
        path: serverPath,
        since: timestamp,
      });
      serverChanges = serverChanges.map((o) => {
        o = {...o};
        if(o.path.startsWith(serverPath)) o.path = o.path.replace(serverPath, "");
        return o;
      });
      if (serverChanges.length) console.log("serverchanges", serverChanges);
      let t = new v.Cursor({});
      await v.update(path, ({ cur }) => {
        return cur.apply_changes(serverChanges).apply_changes(local_changes);
      });
      await v.update(remoteData.path(), ({ cur }) =>
        cur.apply_changes(serverChanges)
      );
      for (const { updated_at } of serverChanges) {
        timestamp = Math.max(timestamp, updated_at);
      }
      v.update(cur.cd("timestamp").path(), ({ cur }) => cur.set(timestamp));

      let obj = cur.get(id);
      let local = cur.cd();
    }
    setTimeout(() => v.mount_loop(), 1000);
  };
})();
