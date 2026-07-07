const CACHE_NAME = 'npt-calc-v2';

// Archivos que forman la app (rutas relativas para que funcione
// aunque el sitio esté en un subdirectorio, ej. GitHub Pages).
const APP_SHELL = [
  './',
  './index.html',
  './manifest-npt.json',
  './icon-npt-192.png',
  './icon-npt-512.png',
  './escudo-bsc.webp'
];

// Al instalar: guardamos toda la app en caché.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Al activar: borramos cachés de versiones anteriores.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// Al pedir un recurso: intentamos red primero (para tener lo más nuevo),
// actualizamos el caché, y si no hay red respondemos desde el caché.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then(
        (cached) => cached || caches.match('./index.html')
      ))
  );
});
