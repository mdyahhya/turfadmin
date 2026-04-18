const CACHE_NAME = 'turf-admin-v4';
const ASSETS = [
    './',
    'index.html',
    'manifest.json',
    'turf-192.png',
    'turf-512.png',
    'turf.jpg'
];

self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// Network-first strategy for dynamic updating and true PWA functioning
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});

self.addEventListener('push', function(event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.message || data.body || 'New notification',
                icon: 'turf-192.png',
                badge: 'turf-192.png',
                vibrate: [200, 100, 200],
                data: { url: data.url || 'index.html' },
                actions: [{ action: 'open', title: 'View Booking' }]
            };
            event.waitUntil(self.registration.showNotification(data.title || 'Turfer Admin', options));
        } catch(e) {
            event.waitUntil(self.registration.showNotification('Turfer Admin', { body: event.data.text(), icon: 'turf-192.png' }));
        }
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
