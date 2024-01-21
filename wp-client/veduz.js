(function (self, undefined) {
  let v = (self.veduz = self.veduz || {});
  v.user = v.user || {};
  v.mycrud = v.mycrud || {};

  if (!v.login && !v.logout && !v.wpjson) {
    function authdata() {
      let query = location.search
        ? Object.fromEntries(
            location.search
              .slice(1)
              .split("&")
              .map((s) => s.split("=").map(decodeURIComponent)),
          )
        : {};
      if (query.site_url && query.user_login && query.password) {
        localStorage.setItem(
          "veduz_auth",
          JSON.stringify({
            site_url: query.site_url,
            user_login: query.user_login,
            password: query.password,
          }),
        );
        location.search = location.search
          .replace(/&?user_login=[^&]*/, "")
          .replace(/&?password=[^&]*/, "");
      }
      let auth = JSON.parse(localStorage.getItem("veduz_auth") || "{}");
      auth.site_url = query.site_url || auth.site_url || "https://solsort.com";
      return auth;
    }

    const auth = authdata();
    const login_url = `${auth.site_url}/wp-admin/authorize-application.php?app_name=${encodeURI(document.title + ` [${new Date().toISOString()}]`)}&success_url=${location.href}`;
    const rest_url = auth.site_url + "/wp-json/";

    v.login = () => (location.href = login_url);
    v.logout = () => {
      localStorage.removeItem("veduz_auth");
      location.reload();
    };
    v.wpjson = async (endpoint, opt = {}) =>
      (
        await fetch(rest_url + endpoint, {
          ...opt,
          headers: {
            ...opt.headers,
            Authorization: `Basic ${btoa(`${auth.user_login}:${auth.password}`)}`,
          },
        })
      ).json();
    v.user.username = auth.user_login;
  }

  v.user.wp = () => v.wpjson("wp/v2/users/me");
  v.user.roles = () => v.wpjson("veduz/v1/roles");

  v.mycrud = v.mycrud || {};
  v.mycrud.get = (path) => v.wpjson("veduz/v1/mycrud/" + path);
  v.mycrud.set = async (path, type, data) => {
    console.log(path, type, data);
    path = path.split("/").filter((o) => o);
    let prefix = path.slice(0, 3);
    path = path.slice(3).join("/");
    return v.wpjson("veduz/v1/mycrud/" + prefix.join("/"), {
      method: "POST",
      mode: "cors",
      body: JSON.stringify({ changes: [{ path, type, data }] }),
    });
  };
})(self);
