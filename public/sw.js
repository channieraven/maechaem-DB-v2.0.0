// Maechaem DB — Service Worker
// Provides offline capability by caching the app shell.

const CACHE_NAME = 'maechaem-v1';

// Derive the base path of this service worker (e.g. '/maechaem-DB-v2.0.0/' or '/')
// so that shell asset URLs are absolute and work correctly on subpath deployments.
const SW_BASE = self.location.pathname.substring(0, self.location.pathname.lastIndexOf('/') + 1);

// Core assets to pre-cache on install (app shell)
const SHELL_ASSETS = [
  SW_BASE,
  SW_BASE + 'index.html',
  SW_BASE + 'manifest.json',
  SW_BASE + 'icons/icon.svg',
];

// ── Install: pre-cache the app shell ────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  // Activate immediately without waiting for old tabs to close
  self.skipWaiting();
});

// ── Activate: clean up old caches ───────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Take control of all open pages immediately
  self.clients.claim();
});

// ── Fetch: cache-first for local assets, network-first for API calls ────────
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Pass through external API calls (Google Apps Script, Cloudinary, CDN)
  const passthrough = [
    'script.google.com',
    'res.cloudinary.com',
    'esm.sh',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'unpkg.com',
    'cdn.tailwindcss.com',
  ];
  if (passthrough.some((host) => url.hostname.includes(host))) return;

  // For navigation requests, try network first then fall back to cached /index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(SW_BASE + 'index.html').then((cached) => cached || new Response('ออฟไลน์', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }))
        )
    );
    return;
  }

  // For other same-origin requests: cache-first, update in background
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
  }
});
