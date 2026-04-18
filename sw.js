const CACHE_NAME = 'turf-admin-v1';
const ASSETS = [
    'index.html',
    'manifest.json',
    'turf.jpg'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: 'turf.jpg',
            badge: 'turf.jpg',
            vibrate: [200, 100, 200],
            data: {
                url: data.url || 'index.html'
            },
            actions: [
                { action: 'open', title: 'View Booking' }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
