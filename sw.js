const CACHE_NAME = 'rcr-inspecoes-v2'; // Mudamos a versão para forçar a limpeza
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Instalação do Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Limpeza de caches antigos de versões anteriores
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ESTRATÉGIA CORRIGIDA: Network-First (Tenta a rede, se falhar usa o cache)
self.addEventListener('fetch', event => {
  if (event.request.method === 'POST') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Se a rede funcionar, guarda a cópia nova no cache e retorna
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Se estiver COMPLETAMENTE SEM INTERNET, usa a cópia salva
        return caches.match(event.request);
      })
  );
});