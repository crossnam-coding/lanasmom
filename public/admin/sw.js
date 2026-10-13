/* 라나엄마 어드민 — 새 주문 푸시 알림 */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let msg = { title: "라나엄마", body: "새 소식이 있어요", url: "/admin/", tag: undefined };
  try { msg = { ...msg, ...event.data.json() }; } catch (_) { /* 본문이 JSON 이 아님 */ }
  event.waitUntil(
    self.registration.showNotification(msg.title, {
      body: msg.body,
      tag: msg.tag,
      icon: "/admin/icon-192.png",
      badge: "/admin/icon-192.png",
      data: { url: msg.url },
      requireInteraction: true,
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/admin/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.includes("/admin")) { c.navigate(url); return c.focus(); }
      }
      return self.clients.openWindow(url);
    }),
  );
});
