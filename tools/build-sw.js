// 오프라인용 sw.js 만들기: node tools/build-sw.js
// 사이트 파일 목록과 내용 지문(hash)을 넣어서, 파일이 바뀌면 휴대폰에 저장된 것도 새로 받게 함
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.join(__dirname, '..');
const walk = (dir) => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((d) => {
  const p = path.posix.join(dir, d.name);
  return d.isDirectory() ? walk(p) : [p];
});
const CORE = ['index.html', 'manifest.webmanifest', 'assets/style.css', 'assets/app.js', 'data/trip.js', 'data/routes.js',
  'assets/vendor/leaflet.js', 'assets/vendor/leaflet.css', 'assets/favicon.png', 'assets/apple-touch-icon.png', 'assets/logo.png'];
const MEDIA = [...walk('assets/icons'), ...walk('assets/photos')].filter((p) => /\.(webp|jpe?g|png)$/i.test(p)).sort();
const hash = crypto.createHash('sha1');
[...CORE, ...MEDIA].forEach((p) => hash.update(p).update(fs.readFileSync(path.join(root, p))));
const ver = hash.digest('hex').slice(0, 10);

const tpl = fs.readFileSync(path.join(__dirname, 'sw.template.js'), 'utf8');
const out = tpl
  .replace('__VERSION__', ver)
  .replace('__CORE__', JSON.stringify(['./', ...CORE], null, 2))
  .replace('__MEDIA__', JSON.stringify(MEDIA, null, 2));
fs.writeFileSync(path.join(root, 'sw.js'), out);
console.log(`sw.js 만듦 · 버전 ${ver} · 기본 ${CORE.length + 1}개 · 사진 ${MEDIA.length}개`);
