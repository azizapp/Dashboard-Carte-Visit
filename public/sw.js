const CACHE_NAME = 'carte-visit-v1.1.2';
const urlsToCache = [
    '/',
    '/index.html',
    '/index.css',
    '/index.tsx',
    '/manifest.json'
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // تفعيل Service Worker الجديد فوراً
    );
});

// Fetch event - استراتيجية ذكية للتخزين المؤقت
self.addEventListener('fetch', (event) => {
    const { request } = event;

    try {
        const url = new URL(request.url);

        // تجاهل الطلبات من chrome-extension أو غير HTTP/HTTPS
        if (!url.protocol.startsWith('http')) {
            return;
        }

        // استراتيجية Network First للـ API calls
        if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
            event.respondWith(
                fetch(request)
                    .then(response => {
                        // حفظ نسخة في الكاش للاستخدام offline
                        if (response && response.status === 200 && response.type !== 'opaque') {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseClone).catch(err => {
                                    // تجاهل أخطاء التخزين المؤقت بصمت
                                });
                            });
                        }
                        return response;
                    })
                    .catch(() => {
                        // في حالة عدم وجود اتصال، استخدم الكاش
                        return caches.match(request);
                    })
            );
        }
        // استراتيجية Cache First للملفات الثابتة
        else {
            event.respondWith(
                caches.match(request)
                    .then((response) => {
                        if (response) {
                            return response;
                        }
                        return fetch(request).then(response => {
                            // حفظ الملفات الجديدة في الكاش
                            if (request.method === 'GET' && response && response.status === 200 && response.type !== 'opaque') {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME).then(cache => {
                                    cache.put(request, responseClone).catch(err => {
                                        // تجاهل أخطاء التخزين المؤقت بصمت
                                    });
                                });
                            }
                            return response;
                        });
                    })
            );
        }
    } catch (error) {
        // في حالة حدوث خطأ في parsing URL، تجاهل الطلب
        return;
    }
});

// Activate event - clean up old caches and take control immediately
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheWhitelist.indexOf(cacheName) === -1) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim()) // السيطرة على جميع الصفحات فوراً
    );
});