console.log('here');
veduz = self.veduz = self.veduz || {};
veduz.user = veduz.user || {};
veduz.store = veduz.store || {};


veduz.user.host = 'solsort.com'
veduz.user.login = () => location.href = `https://${veduz.user.host}/wp-admin/authorize-application.php?app_name=${encodeURI(document.title + ` [${Math.random().toString(36).slice(2)}]`)}&success_url=${location.href}`
