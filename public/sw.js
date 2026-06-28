self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  // Minimal PWA service worker that just passes through requests.
  // This satisfies the strict PWA installability requirements for Chrome/Edge/Android.
});
