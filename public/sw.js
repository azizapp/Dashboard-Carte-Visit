const CACHE_NAME = 'carte-visit-v1.1.2';
const urlsToCache = [
    '/',
    '/index.html',
    '/index.css',
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
            .then(() => self.skipWaiting())
    );
});

// Fetch event - استراتيجية ذكية للتخزين المؤقت
self.addEventListener('fetch', (event) => {
    const { request } = event;

    try {
        const url = new URL(request.url);

        // تجاهل الطلبات من غير HTTP/HTTPS
        if (!url.protocol.startsWith('http')) {
            return;
        }

        // استراتيجية Network First للـ API calls و Supabase
        if (url.pathname.includes('/api/') || url.hostname.includes('supabase')) {
            event.respondWith(
                fetch(request)
                    .then(response => {
                        // حفظ نسخة في الكاش للاستخدام offline فقط لطلبات GET الناجحة
                        if (response && response.status === 200 && request.method === 'GET' && response.type !== 'opaque') {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then(cache => {
                                cache.put(request, responseClone).catch(() => {});
                            });
                        }
                        return response;
                    })
                    .catch(async () => {
                        // في حالة فشل الشبكة، حاول البحث في الكاش
                        const cachedResponse = await caches.match(request);
                        if (cachedResponse) return cachedResponse;
                        // إذا لم يوجد في الكاش وفشل الاتصال، اترك الخطأ يظهر بشكل طبيعي بدلاً من إرجاع undefined
                        throw new Error('Network failure and no cache available');
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
                            if (request.method === 'GET' && response && response.status === 200 && response.type !== 'opaque') {
                                const responseClone = response.clone();
                                caches.open(CACHE_NAME).then(cache => {
                                    cache.put(request, responseClone).catch(() => {});
                                });
                            }
                            return response;
                        });
                    })
            );
        }
    } catch (error) {
        return;
    }
});

// Activate event - clean up old caches
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
            .then(() => self.clients.claim())
    );
});