// Cho game chạy như app cài trên máy & chơi được khi mất mạng.
// Ưu tiên lấy bản mới trên mạng (để cập nhật GitHub là app có bản mới ngay), mất mạng thì dùng bản đã lưu.
const CACHE = 'vuon-tho-hong-v1';
const FILES = [
  './', 'index.html', 'style.css', 'data.js', 'scene.js', 'crops.js', 'game.js',
  'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        // lưu lại bản mới (cả phông chữ Google) để lần sau mất mạng vẫn chơi được
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })),
  );
});
