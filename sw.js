/* アスポッピー営業ナビ：サービスワーカー
 *  ・録音アプリ・ショートメールの「共有」からファイルや文章を受け取る（データは保存しません）
 *  ・プッシュ通知（Firebase Cloud Messaging）を受け取って表示し、アイコンに未読の数を出す */
var messaging = null;
try {   /* 読み込めなくても「共有」の受け取りは動くように */
  importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');
  firebase.initializeApp({apiKey:"AIzaSyAf2B9QzwSSKVpSPBFeeF5VsalGCu3HPGE",authDomain:"asuport-eigyo-navi.firebaseapp.com",projectId:"asuport-eigyo-navi",storageBucket:"asuport-eigyo-navi.firebasestorage.app",messagingSenderId:"666281683745",appId:"1:666281683745:web:aae6f2f2a758f8ec2cec60"});
  messaging = firebase.messaging();
} catch (e) {}

self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

/* アイコンの数字：アプリが書いた未読数に、届いた通知の数を足す */
async function badgeAdd(k) {
  try {
    var c = await caches.open('kyotaku-badge'), r = await c.match('n'), n = r ? (parseInt(await r.text(), 10) || 0) : 0;
    n += k; await c.put('n', new Response(String(n)));
    if (self.navigator.setAppBadge) await self.navigator.setAppBadge(n);
  } catch (e) {}
}
if (messaging) messaging.onBackgroundMessage(function (p) {
  var d = (p && p.data) || {}, urg = d.urg === '1';
  return Promise.all([
    self.registration.showNotification(d.title || '営業ナビ', {
      body: d.body || '', tag: d.tag || 'kyotaku', renotify: true, requireInteraction: urg,
      icon: 'icon-192.png', badge: 'icon-192.png', vibrate: urg ? [400, 200, 400, 200, 400] : [200],
      data: { room: d.room || '' }
    }),
    badgeAdd(1)
  ]);
});
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var room = (e.notification.data && e.notification.data.room) || '';
  e.waitUntil((async function () {
    var ws = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var i = 0; i < ws.length; i++) {
      if (ws[i].url.indexOf('/kyotaku/') >= 0) { await ws[i].focus(); ws[i].postMessage({ type: 'openChat', room: room }); return; }
    }
    await self.clients.openWindow('./?open=chat');
  })());
});

self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method === 'POST' && url.pathname.endsWith('/kyotaku/share')) {
    e.respondWith((async function () {
      try {
        var fd = await e.request.formData(), fs = fd.getAll('audio').filter(function (f) { return f && f.size; });
        var c = await caches.open('kyotaku-share'), old = await c.keys();
        for (var k = 0; k < old.length; k++) await c.delete(old[k]);
        var tx = [fd.get('title'), fd.get('text'), fd.get('url')].filter(function (v) { return typeof v === 'string' && v.trim(); }).join('\n');
        if (tx && !fs.length) await c.put('shared-text', new Response(tx, { headers: { 'content-type': 'text/plain; charset=utf-8' } }));   /* ショートメールの文章 */
        for (var i = 0; i < fs.length && i < 20; i++) {   /* 複数まとめて共有されたときも全部受け取る */
          await c.put('shared-file-' + i, new Response(fs[i], { headers: { 'content-type': fs[i].type || 'audio/mp4', 'x-name': encodeURIComponent(fs[i].name || '通話.m4a') } }));
        }
      } catch (err) {}
      return Response.redirect('./?shared=1', 303);
    })());
  }
});
