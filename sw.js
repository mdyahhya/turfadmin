const CACHE_NAME = 'turf-admin-v10';
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
    self.clients.claim();
});

// Network-first strategy: Always try to get fresh data from the server first
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response.ok && event.request.url.startsWith(self.location.origin)) {
                    const resClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, resClone));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
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
