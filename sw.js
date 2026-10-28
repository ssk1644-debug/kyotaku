/* 居宅営業管理システム：録音アプリの「共有」からファイルを受け取るためのサービスワーカー（データは保存しません） */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method === 'POST' && url.pathname.endsWith('/kyotaku/share')) {
    e.respondWith((async function () {
      try {
        var fd = await e.request.formData(), fs = fd.getAll('audio').filter(function (f) { return f && f.size; });
        var c = await caches.open('kyotaku-share'), old = await c.keys();
        for (var k = 0; k < old.length; k++) await c.delete(old[k]);
        for (var i = 0; i < fs.length && i < 20; i++) {   /* 複数まとめて共有されたときも全部受け取る */
          await c.put('shared-file-' + i, new Response(fs[i], { headers: { 'content-type': fs[i].type || 'audio/mp4', 'x-name': encodeURIComponent(fs[i].name || '通話.m4a') } }));
        }
      } catch (err) {}
      return Response.redirect('./?shared=1', 303);
    })());
  }
});
