const CACHE_NAME = 'cms-profile-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];


self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('Service Worker: Activated');
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});



// --- PUSH: Terima notifikasi dari server ---
self.addEventListener('push', (event) => {
  let data = { title: 'CMS Profil', body: 'Ada pembaruan data artikel' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }
  
  const options = {
    body: data.body,
    icon: data.icon || '/nisa.jpeg',
    badge: data.icon || '/nisa.jpeg',
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100],
  };
  
  event.waitUntil(self.registration.showNotification(data.title, options));
});

// --- NOTIFICATIONCLICK: Klik notifikasi mengarah ke link terkait ---
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      // Fokus ke tab jika sudah terbuka
      for (const client of wins) {
        if ('focus' in client) {
          client.navigate(target);
          return client.focus();
        }
      }
      // Buka tab baru jika belum terbuka
      return clients.openWindow(target);
    })
  );
});
