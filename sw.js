/* 居宅営業管理システム：録音アプリの「共有」からファイルを受け取るためのサービスワーカー（データは保存しません） */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method === 'POST' && url.pathname.endsWith('/kyotaku/share')) {
    e.respondWith((async function () {
      try {
        var fd = await e.request.formData(), f = fd.get('audio');
        if (f) {
          var c = await caches.open('kyotaku-share');
          await c.put('shared-file', new Response(f, { headers: { 'content-type': f.type || 'audio/mp4', 'x-name': encodeURIComponent(f.name || '通話.m4a') } }));
        }
      } catch (err) {}
      return Response.redirect('./?shared=1', 303);
    })());
  }
});
