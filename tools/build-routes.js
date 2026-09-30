/* 날짜별 동선(data/trip.js 의 days[].route)을 실제 도로 경로로 바꿔 data/routes.js 에 저장.
   사용: node tools/build-routes.js   (OSRM 공개 서버 사용, 인터넷 필요)
   일정의 장소 순서를 바꾸면 다시 돌리면 돼요. */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

global.window = {};
require(path.join(__dirname, '../data/trip.js'));
const T = window.TRIP;
const P = T.map.places;

// 점이 너무 많으면 파일이 커지니 Douglas–Peucker 로 줄임 (약 15m 오차)
function simplify(pts, eps) {
  if (pts.length < 3) return pts;
  const [a, b] = [pts[0], pts[pts.length - 1]];
  let idx = 0; let dmax = 0;
  for (let i = 1; i < pts.length - 1; i += 1) {
    const [x, y] = pts[i];
    const dx = b[0] - a[0]; const dy = b[1] - a[1];
    const t = ((x - a[0]) * dx + (y - a[1]) * dy) / ((dx * dx + dy * dy) || 1);
    const px = a[0] + t * dx; const py = a[1] + t * dy;
    const d = Math.hypot(x - px, y - py);
    if (d > dmax) { dmax = d; idx = i; }
  }
  if (dmax <= eps) return [a, b];
  return simplify(pts.slice(0, idx + 1), eps).slice(0, -1).concat(simplify(pts.slice(idx), eps));
}

const legs = {};
T.days.forEach((d) => (d.route || []).forEach((s, i, r) => { if (i) legs[`${r[i - 1].at}>${s.at}`] = true; }));

const out = {};
Object.keys(legs).forEach((key) => {
  const [a, b] = key.split('>').map((k) => P[k]);
  const url = `https://router.project-osrm.org/route/v1/driving/${a.lon},${a.lat};${b.lon},${b.lat}?overview=full&geometries=geojson`;
  const res = JSON.parse(execFileSync('curl', ['-sS', '--max-time', '30', '-A', 'JejuFamilySite/1.0', url]).toString());
  const r = res.routes[0];
  const pts = simplify(r.geometry.coordinates.map(([lon, lat]) => [lat, lon]), 0.00015)
    .map(([lat, lon]) => [Number(lat.toFixed(5)), Number(lon.toFixed(5))]);
  out[key] = { km: Number((r.distance / 1000).toFixed(1)), min: Math.round(r.duration / 60), pts };
  console.log(key, out[key].km, 'km', out[key].min, 'min', pts.length, 'pts');
});

fs.writeFileSync(path.join(__dirname, '../data/routes.js'),
  `/* 자동 생성 파일 — tools/build-routes.js 로 만들어요. 직접 고치지 마세요.\n   경로 데이터 © OpenStreetMap contributors, OSRM */\nwindow.ROUTES = ${JSON.stringify(out)};\n`);
