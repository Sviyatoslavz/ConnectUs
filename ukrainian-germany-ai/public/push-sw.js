// Messaging-only service worker: shows deadline reminders. No caching.
self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { title: event.data && event.data.text() }; }
  event.waitUntil(self.registration.showNotification(data.title || "Ukrainian Germany AI", {
    body: data.body || "", icon: "/favicon.png", data: { url: data.url || "/settings" },
  }));
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "/settings", self.location.origin).href;
  // Focus an open tab of the app instead of opening a new one each time.
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    for (const client of list) {
      if (new URL(client.url).origin === self.location.origin && "focus" in client) {
        if ("navigate" in client) client.navigate(target);
        return client.focus();
      }
    }
    return self.clients.openWindow(target);
  }));
});
