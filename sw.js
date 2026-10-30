// 인터넷 없이 열기 (서비스 워커)
// - 버전은 index.html이 등록할 때 붙이는 sw.js?v=APP_VERSION 값을 써요. 그래서 버전을 올릴 때 이 파일은 고치지 않아도 돼요.
// - 화면 저장본 'mongle-shell-버전' (index.html·version.json·manifest.json): 네트워크 우선, 안 되면 저장본. 새 버전이 켜지면 예전 것은 지워요.
// - 그림·글꼴 저장본 'mongle-assets': 버전이 바뀌어도 지우지 않아요. 저장본을 먼저 보여 주고,
//   뒤에서 네트워크로 파일 크기를 확인해 바뀐 파일만 새로 받아 저장해요 (stale-while-revalidate). 같은 파일은 10분에 한 번만 확인.
//   GitHub Pages는 배포할 때마다 모든 파일의 ETag·Last-Modified가 바뀌어서, 크기(HEAD 요청)로 바뀐 파일을 알아내요.
// - 저장본에는 200(파일 전체) 응답만 넣어요. 서비스 워커가 네트워크에 보내는 요청에는 Range를 붙이지 않아요
// - 새 sw.js는 기다리지 않고 바로 적용 (skipWaiting, clients.claim)
// - 목소리(voice/)는 저장하지 않고, 예전에 저장한 목소리 파일은 켜질 때 지워요 (클로바더빙 무료 음성 사용 불가, CLAUDE.md 참고)
const VERSION = new URL(location.href).searchParams.get('v') || 'dev';
const SHELL_CACHE = 'mongle-shell-' + VERSION, ASSET_CACHE = 'mongle-assets';
const SCOPE = new URL(self.registration.scope);
const SHELL = ['./', 'manifest.json', 'version.json'];
const FIRST_ASSETS = ['fonts/jua.woff2', 'fonts/gowun-dodum.woff2', 'images/brand/giraffe.webp', 'images/brand/favicon.png', 'images/cards/hero.webp'];

const inScope = url => url.origin === SCOPE.origin && url.pathname.startsWith(SCOPE.pathname);
const rel = url => url.pathname.slice(SCOPE.pathname.length);
const isAsset = path => /^(images|fonts)\//.test(path);
// 저장 이름: 주소 뒤 ?v= 같은 값은 떼고 저장 (index.html은 './' 하나로)
const keyOf = url => { const path = rel(url); return new URL(path === 'index.html' ? './' : path, SCOPE).href; };

self.addEventListener('install', e => {
  self.skipWaiting();
  // 하나가 실패해도 설치는 되게 하나씩 저장해요. 그림·글꼴은 이미 있으면 건너뜀
  e.waitUntil(Promise.all([
    caches.open(SHELL_CACHE).then(c => Promise.all(SHELL.map(p => {
      const url = new URL(p, SCOPE);
      return fetch(url, { cache: 'no-cache' }).then(r => r.status === 200 ? c.put(keyOf(url), r) : 0).catch(() => 0);
    }))),
    warm(FIRST_ASSETS)
  ]));
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k.startsWith('mongle-') && k !== SHELL_CACHE && k !== ASSET_CACHE) await caches.delete(k);
    // 예전에 저장한 목소리 파일 지우기
    const assets = await caches.open(ASSET_CACHE);
    for (const r of await assets.keys()) if (rel(new URL(r.url)).startsWith('voice/')) await assets.delete(r);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (!inScope(url)) return; // 방문자 수 세기 등 바깥 주소는 그대로
  const path = rel(url);
  if (req.mode === 'navigate' || path === '' || path === 'index.html' || path === 'version.json' || path === 'manifest.json') e.respondWith(networkFirst(req, url));
  else if (isAsset(path)) e.respondWith(staleWhileRevalidate(e, url));
});

async function networkFirst(req, url) {
  const key = req.mode === 'navigate' ? SCOPE.href : keyOf(url);
  const cache = await caches.open(SHELL_CACHE);
  try {
    // 화면 이동 요청은 옵션을 붙여 다시 만들 수 없어서 주소로 받아요
    const r = await fetch(url.href, { cache: 'no-cache' });
    if (r.status === 200) cache.put(key, r.clone());
    return r;
  } catch (err) {
    const hit = await cache.match(key);
    if (hit) return hit;
    throw err;
  }
}

async function staleWhileRevalidate(e, url) {
  const req = e.request, key = keyOf(url);
  const cache = await caches.open(ASSET_CACHE);
  let hit = await cache.match(key);
  if (hit) e.waitUntil(revalidate(cache, key, url, hit));
  else {
    // 오디오는 부분 요청(Range)으로 받아요. 206 부분 응답은 저장할 수 없어서,
    // Range 없이 파일 전체를 따로 받아 저장하고 요청한 부분만 잘라서 돌려줘요 (아래 rangeOf)
    const r = await fetch(url.href);
    if (r.status !== 200) return r;
    await cache.put(key, r.clone());
    checked.set(key, Date.now());
    hit = r;
  }
  return req.headers.has('range') ? rangeOf(hit, req.headers.get('range')) : hit;
}

// 뒤에서 확인: 같은 파일은 10분에 한 번만 (GitHub Pages 캐시 시간과 같게). 크기가 다르면(바뀐 파일) 새로 받아 저장
const checked = new Map(), CHECK_EVERY = 10 * 60 * 1000;
const sizeOf = r => r.headers.get('content-length');
async function revalidate(cache, key, url, hit) {
  if (Date.now() - (checked.get(key) || 0) < CHECK_EVERY) return;
  checked.set(key, Date.now());
  try {
    const head = await fetch(url.href, { method: 'HEAD', cache: 'no-cache' });
    if (!head.ok) return;
    if (sizeOf(head) && sizeOf(hit) && sizeOf(head) === sizeOf(hit)) return;
    const r = await fetch(url.href, { cache: 'no-cache' });
    if (r.status === 200) await cache.put(key, r);
  } catch {} // 인터넷이 없으면 그냥 저장본을 써요
}

// 사파리 등은 오디오 재생에 206 부분 응답이 필요해서 저장본에서 잘라 줘요
async function rangeOf(res, range) {
  const buf = await res.arrayBuffer(), size = buf.byteLength;
  const m = /bytes=(\d*)-(\d*)/.exec(range);
  let start = m && m[1] ? +m[1] : 0, end = m && m[2] ? +m[2] : size - 1;
  if (m && !m[1] && m[2]) { start = Math.max(0, size - +m[2]); end = size - 1; }
  if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), { status: 206, headers: {
    'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
    'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
}

// 페이지가 보낸 목록 중 저장본에 없는 파일만 뒤에서 조금씩 받아요.
// keep(지금 사이트에서 쓰는 파일 전체 목록)이 같이 오면, 거기에 없는 예전 파일은 저장본에서 지워요
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'warm' && Array.isArray(d.urls)) e.waitUntil(warm(d.urls, Array.isArray(d.keep) ? d.keep : null));
});

const assetUrls = list => [...new Set(list)].map(p => new URL(p, SCOPE)).filter(u => inScope(u) && isAsset(rel(u)));
async function warm(list, keep) {
  const cache = await caches.open(ASSET_CACHE);
  if (keep) {
    const keepKeys = new Set(assetUrls(keep).map(keyOf));
    if (keepKeys.size) for (const r of await cache.keys()) if (!keepKeys.has(r.url)) await cache.delete(r);
  }
  const urls = assetUrls(list);
  let i = 0;
  const worker = async () => {
    while (i < urls.length) {
      const url = urls[i++], key = keyOf(url);
      if (await cache.match(key)) continue;
      try { const r = await fetch(url.href); if (r.status === 200) { await cache.put(key, r); checked.set(key, Date.now()); } } catch {}
    }
  };
  await Promise.all([worker(), worker(), worker()]);
}
