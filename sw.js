/* 제주 가족여행 — 인터넷이 약하거나 끊겨도 사이트가 열리게 해 주는 파일
 * tools/build-sw.js 가 만들어요 (직접 고치지 말고 tools/sw.template.js 를 고친 뒤 다시 만들기)
 * - 일정·코드·데이터: 인터넷 먼저 (새 내용) → 안 되면 저장해 둔 것
 * - 사진·아이콘·글꼴: 저장해 둔 것 먼저 (빠름) → 뒤에서 새로 받아 둠
 * - 의견·투표·지도처럼 실시간인 것은 건드리지 않음 (사이트가 따로 마지막 내용을 기억해 둠)
 */
const VERSION = '87358a7421';
const CORE_CACHE = `jeju-core-${VERSION}`;
const MEDIA_CACHE = 'jeju-media-v1';
const PHOTO_CACHE = 'jeju-family-photos-v1'; // 가족 사진첩 미리보기 (이 폰에만)
const CORE = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "assets/style.css",
  "assets/app.js",
  "data/trip.js",
  "data/routes.js",
  "assets/vendor/leaflet.js",
  "assets/vendor/leaflet.css",
  "assets/favicon.png",
  "assets/apple-touch-icon.png",
  "assets/logo.png"
];
const MEDIA = [
  "assets/icons/camera.webp",
  "assets/icons/heart.webp",
  "assets/icons/mandarin.webp",
  "assets/icons/map.webp",
  "assets/icons/plane.webp",
  "assets/icons/suitcase.webp",
  "assets/photos/aria.jpg",
  "assets/photos/shilla.jpg",
  "assets/photos/somerset.jpg",
  "assets/photos/taeo-gyul.webp",
  "assets/photos/taeo-plane.webp",
  "assets/photos/taeo/ball.webp",
  "assets/photos/taeo/banana.webp",
  "assets/photos/taeo/beanie.webp",
  "assets/photos/taeo/bonnet.webp",
  "assets/photos/taeo/hero-ball.webp",
  "assets/photos/taeo/hero-banana.webp",
  "assets/photos/taeo/hero-bottle.webp",
  "assets/photos/taeo/hero-close.webp",
  "assets/photos/taeo/hero-crawl.webp",
  "assets/photos/taeo/hero-dad.webp",
  "assets/photos/taeo/hero-feet.webp",
  "assets/photos/taeo/hero-food.webp",
  "assets/photos/taeo/hero-hanbok.webp",
  "assets/photos/taeo/hero-hat.webp",
  "assets/photos/taeo/hero-hold.webp",
  "assets/photos/taeo/hero-kitty.webp",
  "assets/photos/taeo/hero-knot.webp",
  "assets/photos/taeo/hero-laugh.webp",
  "assets/photos/taeo/hero-milk.webp",
  "assets/photos/taeo/hero-muff.webp",
  "assets/photos/taeo/hero-peek.webp",
  "assets/photos/taeo/hero-stand.webp",
  "assets/photos/taeo/hero-tilt.webp",
  "assets/photos/taeo/hero-towel.webp",
  "assets/photos/taeo/kitty.webp",
  "assets/photos/taeo/paci.webp",
  "assets/photos/taeo/peek.webp",
  "assets/photos/taeo/sleep.webp",
  "assets/photos/taeo/wave.webp"
];

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CORE_CACHE);
    await c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })));
    // 사진은 하나가 실패해도 괜찮게 하나씩
    const m = await caches.open(MEDIA_CACHE);
    await Promise.all(MEDIA.map(async (u) => { if (!(await m.match(u))) { try { await m.add(u); } catch (err) { /* 다음에 */ } } }));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keep = [CORE_CACHE, MEDIA_CACHE, PHOTO_CACHE];
    await Promise.all((await caches.keys()).filter((k) => k.startsWith('jeju-') && !keep.includes(k)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

const timeout = (ms) => new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms));

async function networkFirst(req) {
  const c = await caches.open(CORE_CACHE);
  try {
    const res = await Promise.race([fetch(req), timeout(5000)]);
    if (res && res.ok) c.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = (await c.match(req, { ignoreSearch: true })) || (req.mode === 'navigate' && (await c.match('./')));
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req, name, max) {
  const c = await caches.open(name);
  const hit = await c.match(req);
  const update = fetch(req).then(async (res) => {
    if (res && (res.ok || res.type === 'opaque')) {
      await c.put(req, res.clone());
      if (max) { const keys = await c.keys(); if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => c.delete(k))); }
    }
    return res;
  }).catch(() => null);
  return hit || (await update) || Response.error();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === location.origin) {
    if (/\.(webp|jpe?g|png|svg)$/i.test(url.pathname)) { e.respondWith(cacheFirst(req, MEDIA_CACHE)); return; }
    e.respondWith(networkFirst(req));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) { e.respondWith(cacheFirst(req, MEDIA_CACHE)); return; }
  // 가족 사진 미리보기는 한 번 본 건 폰에 저장 (최근 150장까지)
  if (url.hostname === 'lh3.googleusercontent.com' || (url.hostname === 'drive.google.com' && url.pathname.startsWith('/thumbnail'))) {
    e.respondWith(cacheFirst(req, PHOTO_CACHE, 150));
  }
});
