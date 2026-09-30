/* 2026 가을 제주 가족여행 — 화면 그리기.
   여행 내용은 data/trip.js 한 곳에서만 고칩니다. 이 파일은 그 내용을 화면으로 옮기기만 해요. */
(() => {
  'use strict';

  const T = window.TRIP;
  const view = document.getElementById('view');
  const foot = document.getElementById('foot');
  const tabLinks = document.querySelectorAll('.tabbar a');

  const TABS = ['home', 'plan', 'ideas', 'pack', 'info'];
  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  const STATUS = { ok: '확정', plan: '예정', tbd: '미정', idea: '후보' };
  const PACK_KEY = 'jeju2026.packing.v1';

  /* ---------- 작은 도구 ---------- */
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
  const toDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const today = () => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
  const dayDiff = (from, to) => Math.round((to - from) / 86400000);
  const md = (iso) => { const d = toDate(iso); return `${d.getMonth() + 1}.${d.getDate()}`; };
  const wd = (iso) => WD[toDate(iso).getDay()];
  const mdw = (iso) => `${md(iso)}(${wd(iso)})`;
  const dom = (iso) => toDate(iso).getDate();

  const dates = T.days.map((d) => d.date);
  const people = new Map(T.people.map((p) => [p.id, p]));
  const stays = new Map(T.stays.map((s) => [s.id, s]));

  const ICON = {
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18V6"/><path d="M3 14h18v4"/><path d="M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/></svg>',
    car: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 16V9.5L7 5h10l2 4.5V16"/><path d="M3 16h18v3H3z"/><path d="M5 9.5h14"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="16.5" cy="19" r="1.5"/></svg>',
    meal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3v8a2 2 0 0 0 2 2v8"/><path d="M11 3v8a2 2 0 0 1-2 2"/><path d="M17 21V3c-2 1.5-3 4-3 7s1 4 3 4"/></svg>',
    plane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.5 13.5 3 11l1.5-1.5 7 1L16 6a2.1 2.1 0 0 1 3 3l-4.5 4.5 1 7L14 22l-2.5-7.5"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
    route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    mandarin: '<svg class="hero-mandarin" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="31" r="19" fill="var(--tangerine)"/><circle cx="20.5" cy="25" r="4.5" fill="var(--basalt-ink)" opacity=".2"/><path d="M27 13.5V9" stroke="var(--basalt-ink)" stroke-width="2.2" stroke-linecap="round"/><path d="M27.5 10.5c1.8-4.2 6.3-6.3 10.5-5.2-1.6 4.2-6.2 6.4-10.5 5.2z" fill="var(--sea)"/></svg>',
  };

  /* 시간표 블록 아이콘 */
  const KIND_ICON = {
    fly: '<path d="M10.5 13.5 3 11l1.5-1.5 7 1L16 6a2.1 2.1 0 0 1 3 3l-4.5 4.5 1 7L14 22l-2.5-7.5"/>',
    move: '<path d="M5 16V10l2-4h10l2 4v6"/><path d="M4 16h16v3H4z"/><circle cx="8" cy="19" r="1"/><circle cx="16" cy="19" r="1"/>',
    meal: '<path d="M8 3v7a2 2 0 0 0 2 2v9"/><path d="M12 3v7a2 2 0 0 1-2 2"/><path d="M17 21V3c-2 1.5-3 4-3 7s1 4 3 4"/>',
    play: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/>',
    rest: '<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M9 3.5c0 1 1 1.5 1 2.5M12.5 3.5c0 1 1 1.5 1 2.5"/>',
  };
  const kindIcon = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${KIND_ICON[k] || ''}</svg>`;

  /* 등록된 사진만 쓴다 (없으면 조용히 건너뜀) */
  const photoOf = (key) => (key && T.photos && T.photos[key]) || null;

  const pill = (s) => (s && STATUS[s] ? `<span class="pill ${s}">${STATUS[s]}</span>` : '');

  /* 지도 링크는 네이버 지도 하나로 */
  function naverLink(q, small = false) {
    if (!q) return '';
    return `<a class="naver${small ? ' small' : ''}" href="https://map.naver.com/p/search/${encodeURIComponent(q)}" target="_blank" rel="noopener">${ICON.pin}<span>네이버 지도</span></a>`;
  }

  function membersOf(who) {
    if (!who || who === 'all') return T.people;
    if (Array.isArray(who)) return who.map((id) => people.get(id)).filter(Boolean);
    return T.people.filter((p) => p.group === who);
  }

  function whoText(who) {
    if (!who || who === 'all') return `${T.people.length}명 모두`;
    return membersOf(who).map((p) => p.name).join(' · ');
  }

  function whenText(point, verb = '') {
    const parts = [mdw(point.date)];
    if (point.time) parts.push(point.time);
    else if (point.approx) parts.push(point.approx);
    if (verb) parts.push(verb);
    return parts.join(' ');
  }

  function tripState() {
    const t = today();
    const s = toDate(T.start);
    const e = toDate(T.end);
    if (t < s) return { phase: 'before', dday: dayDiff(t, s) };
    if (t > e) return { phase: 'after' };
    const index = dayDiff(s, t);
    return { phase: 'during', index, iso: dates[index] };
  }

  /* ---------- 일정 조각 ---------- */
  function itemHTML(it) {
    const hasTime = Boolean(it.time);
    const status = it.status || 'ok';
    const sub = [it.who ? whoText(it.who) : '', it.note || ''].filter(Boolean).join(' · ');
    return `<li class="item s-${status}">
      <span class="time${hasTime ? ' is-set' : ''}">${esc(it.time || it.when || '미정')}</span>
      <div class="what">
        <p class="title">${esc(it.title)}${status !== 'ok' ? ` ${pill(status)}` : ''}</p>
        ${sub ? `<p class="note">${esc(sub)}</p>` : ''}
        ${photoOf(it.photo) ? `<figure class="item-photo"><img src="${esc(photoOf(it.photo).src)}" alt="${esc(photoOf(it.photo).alt || it.title)}" loading="lazy"></figure>` : ''}
        ${it.place ? naverLink(it.place, true) : ''}
      </div>
    </li>`;
  }

  /* 그날 제주에 있는 사람: 이름은 작게, 도착·출발만 강조 */
  function dayWhoHTML(iso) {
    return T.groups.map((g) => {
      if (iso < g.arrive.date || iso > g.depart.date) return '';
      let tag = '';
      if (iso === g.arrive.date) tag = `${g.arrive.time || g.arrive.approx || ''} 도착`.trim();
      else if (iso === g.depart.date) tag = `${g.depart.time || ''} 출발`.trim();
      const names = membersOf(g.id).map((p) => p.name).join(' · ');
      return `<span class="wg ${g.id}"><i></i>${esc(names)}${tag ? ` <em>${esc(tag)}</em>` : ''}</span>`;
    }).join('');
  }

  /* 그날 인원: 시작 → 끝 */
  function headcount(iso) {
    let start = 0;
    let end = 0;
    let most = 0;
    T.groups.forEach((g) => {
      const n = membersOf(g.id).length;
      if (iso < g.arrive.date || iso > g.depart.date) return;
      most += n;
      if (g.arrive.date < iso) start += n;
      if (g.depart.date > iso) end += n;
    });
    if (start && end && start !== end) return `${start}→${end}명`;
    return `${most}명`;
  }

  function dayHTML(day, i, st) {
    const isToday = st.phase === 'during' && st.index === i;
    const night = day.night ? stays.get(day.night) : null;
    const items = day.items || [];
    const hasRoute = (day.route || []).length > 1;
    return `<article class="day${isToday ? ' is-today' : ''}" id="day-${day.date}" style="--dc:var(--d${i + 1})">
      <div class="stub">
        <span class="stub-n">DAY ${i + 1}</span>
        <span class="stub-date">${md(day.date)}</span>
        <span class="stub-wd">${wd(day.date)}요일</span>
        ${isToday ? '<span class="stub-today">오늘</span>' : ''}
      </div>
      <div class="day-body">
        <div class="day-head">
          <h3 class="day-title">${esc(day.title)}</h3>
          ${hasRoute ? `<button class="route-btn" type="button" data-show-day="${i}">${ICON.route}<span>동선</span></button>` : ''}
        </div>
        <p class="day-who" aria-label="이날 제주에 있는 사람">${dayWhoHTML(day.date)}</p>
        ${items.length ? `<ol class="items">${items.map(itemHTML).join('')}</ol>` : ''}
        ${day.open ? `<p class="empty-slot">${esc(day.open)}</p>` : ''}
        ${night
          ? `<p class="night">${ICON.moon}<span>숙박 · <b>${esc(night.name)}</b></span></p>`
          : `<p class="night">${ICON.plane}<span>${esc(day.nightNote || '집으로')}</span></p>`}
      </div>
    </article>`;
  }

  /* ---------- 홈 ---------- */
  function heroHTML(st) {
    let big;
    let small;
    if (st.phase === 'before') { big = `D-${st.dday}`; small = '출발까지'; }
    else if (st.phase === 'during') {
      big = st.index === 0 ? 'D-DAY' : `${st.index + 1}일차`;
      small = st.index === 0 ? '드디어 출발' : `${dates.length}일 중`;
    } else { big = '끝!'; small = '모두 수고했어요'; }
    const nights = dates.length - 1;
    return `<section class="hero" aria-label="여행 요약">
      ${ICON.mandarin}
      <p class="hero-eyebrow">${esc(T.eyebrow)}</p>
      <h1>${esc(T.shortTitle)}</h1>
      <p class="hero-dates">${md(T.start)} ${wd(T.start)} – ${md(T.end)} ${wd(T.end)} <span>· ${nights}박 ${dates.length}일</span></p>
      <div class="hero-row">
        <p class="dday"><b>${esc(big)}</b><span>${esc(small)}</span></p>
        <p class="hero-note">${esc(T.tagline)}<small>${esc(T.people.map((p) => p.name).join(' · '))}</small></p>
      </div>
    </section>`;
  }

  /* 여행 중에만: 오늘 카드 */
  function nowHTML(st) {
    if (st.phase !== 'during') return '';
    const day = T.days[st.index];
    const items = day.items || [];
    return `<section class="block">
      <div class="card now-card">
        <p class="now-label">오늘 · ${esc(mdw(day.date))}</p>
        <h3>${esc(day.title)}</h3>
        ${items.length ? `<ol class="items">${items.map(itemHTML).join('')}</ol>` : `<p class="empty-slot">${esc(day.open || '아직 정하는 중이에요')}</p>`}
      </div>
    </section>`;
  }

  /* 6일 계획표: 가로는 날짜, 세로는 시간 (방학 계획표처럼) */
  const toH = (t) => { const [h, m] = t.split(':').map(Number); return h + (m || 0) / 60; };

  function plannerHTML(st) {
    const P = T.planner;
    const span = P.to - P.from;
    const at = (h) => (((h - P.from) / span) * 100).toFixed(2);
    const ticks = [];
    for (let h = P.from; h <= P.to; h += 2) ticks.push(h);

    const cols = T.days.map((day, i) => {
      const isToday = st.phase === 'during' && st.index === i;
      const weekend = [0, 6].includes(toDate(day.date).getDay());
      const blocks = (day.blocks || []).map(([a, b, label, kind, tbd, pk]) => {
        const len = toH(b) - toH(a);
        const ph = len >= 1.5 ? photoOf(pk) : null;
        const cls = ['pb', `k-${kind}`, tbd ? 'tbd' : '', len < 0.9 ? 'tiny' : '', ph ? 'has-photo' : ''].filter(Boolean).join(' ');
        return `<span class="${cls}" style="top:calc(${at(toH(a))}% + 1.5px);height:calc(${((len / span) * 100).toFixed(2)}% - 3px)${ph ? `;--ph:url('${esc(new URL(ph.src, document.baseURI).href)}');--pp:${esc(ph.pos || 'center')}` : ''}" title="${esc(`${a}–${b} ${label}`)}">${len >= 1.5 && !tbd ? kindIcon(kind) : ''}<b>${esc(label)}</b>${len >= 1.8 && !tbd && kind !== 'rest' ? `<small>${esc(a)}</small>` : ''}</span>`;
      }).join('');
      let now = '';
      if (isToday) {
        const d = new Date();
        const h = d.getHours() + d.getMinutes() / 60;
        if (h >= P.from && h <= P.to) now = `<span class="pl-now" style="top:${at(h)}%"></span>`;
      }
      const night = day.night ? stays.get(day.night).short : '집';
      return `<a class="pl-col${isToday ? ' is-today' : ''}${weekend ? ' is-weekend' : ''}" href="#plan" data-goto="day-${day.date}" aria-label="${esc(`${mdw(day.date)} ${day.title}`)}">
        <span class="pl-head"><span class="pl-wd">${wd(day.date)}</span><b>${dom(day.date)}</b><em>${headcount(day.date)}</em></span>
        <span class="pl-body">${blocks}${now}</span>
        <span class="pl-night">${esc(night)}</span>
      </a>`;
    }).join('');

    const legend = Object.entries(P.kinds).map(([k, name]) => `<span class="k-${k}"><i>${kindIcon(k)}</i>${esc(name)}</span>`).join('');
    return `<section class="block">
      <div class="h-row"><h2 class="h">6일 시간표</h2><span class="count">날짜를 누르면 자세히</span></div>
      <div class="card planner-card">
        <div class="planner" style="--hours:${span}">
          <div class="pl-axis" aria-hidden="true">
            <span class="pl-head"></span>
            <span class="pl-body">${ticks.map((h) => `<i style="top:${at(h)}%">${String(h).padStart(2, '0')}</i>`).join('')}</span>
            <span class="pl-night"></span>
          </div>
          ${cols}
        </div>
        <p class="pl-legend">${legend}<span class="tbd"><i></i>미정</span></p>
      </div>
    </section>`;
  }

  function bookingsHTML() {
    const rows = T.bookings.map((b) => `<li class="card booking">
      <span class="booking-icon${b.accent ? ' t' : ''}">${ICON[b.icon] || ''}</span>
      <div>
        <h3>${esc(b.title)} ${pill(b.status)}</h3>
        <p class="meta">${esc(b.meta)}</p>
        ${b.q ? naverLink(b.q) : ''}
      </div>
    </li>`).join('');
    return `<section class="block">
      <h2 class="h">정해진 것</h2>
      <ul class="stack">${rows}</ul>
    </section>`;
  }

  function todoHTML() {
    const done = T.todo.filter((t) => t.done).length;
    const rows = T.todo.map((t) => `<li class="${t.done ? 'is-done' : ''}">
      <span class="mark">${t.done ? ICON.check : ''}</span>
      <span class="t">${esc(t.text)}${t.note ? `<span class="n">${esc(t.note)}</span>` : ''}</span>
      ${t.done ? '<span class="pill done">완료</span>' : ''}
    </li>`).join('');
    return `<section class="block">
      <div class="h-row"><h2 class="h">준비 현황</h2><span class="count">${done} / ${T.todo.length}</span></div>
      <div class="card"><ul class="todo">${rows}</ul></div>
    </section>`;
  }

  /* ---------- 동선 지도: 날짜별 · 전체 ---------- */
  const mapSel = { home: 'all', plan: 'all' };

  function islandPath(P) {
    const f = (n) => n.toFixed(1);
    const pts = T.map.coast.map(P);
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 0; i < pts.length; i += 1) {
      const p0 = pts[(i - 1 + pts.length) % pts.length];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const p3 = pts[(i + 2) % pts.length];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
    }
    return `${d}Z`;
  }

  const legKey = (a, b) => [a, b].sort().join('|');
  const placeName = (id) => T.map.places[id].name;

  function routeSVG(sel) {
    const M = T.map;
    // 제주 서쪽 절반을 확대 (공항 · 중문 · 신화월드가 다 들어오게)
    const S = 6.3; // 1km당 px
    const LON0 = 126.12;
    const LAT0 = 33.58;
    const W = 340;
    const H = 287;
    const P = ([lon, lat]) => [(lon - LON0) * 93 * S, (LAT0 - lat) * 111 * S];
    const f = (n) => n.toFixed(1);
    const xy = (id) => P([M.places[id].lon, M.places[id].lat]);

    const dayIdx = sel === 'all' ? T.days.map((_, i) => i) : [Number(sel)];
    const pairUse = {};
    const used = new Set();
    let paths = '';
    let labels = '';

    dayIdx.forEach((i) => {
      const r = T.days[i].route || [];
      const color = `var(--d${i + 1})`;
      const labeled = new Set();
      r.forEach((id) => used.add(id));
      for (let k = 0; k < r.length - 1; k += 1) {
        const a = xy(r[k]);
        const b = xy(r[k + 1]);
        const key = legKey(r[k], r[k + 1]);
        const n = pairUse[key] || 0;
        pairUse[key] = n + 1;
        const dx = b[0] - a[0];
        const dy = b[1] - a[1];
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const off = Math.min(10 + n * 8, len * 0.45);
        const c = [(a[0] + b[0]) / 2 + nx * off, (a[1] + b[1]) / 2 + ny * off];
        const m = [0.25 * a[0] + 0.5 * c[0] + 0.25 * b[0], 0.25 * a[1] + 0.5 * c[1] + 0.25 * b[1]];
        const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
        paths += `<path class="rt${sel === 'all' ? ' thin' : ''}" d="M${f(a[0])},${f(a[1])} Q${f(c[0])},${f(c[1])} ${f(b[0])},${f(b[1])}" style="stroke:${color}"/>
          <path d="M-5,-4.5 L5,0 L-5,4.5Z" transform="translate(${f(m[0])},${f(m[1])}) rotate(${f(deg)})" style="fill:${color}"/>`;
        if (sel !== 'all' && M.legs[key] && !labeled.has(key)) {
          labeled.add(key);
          labels += `<text class="rt-label" x="${f(m[0] + nx * 22)}" y="${f(m[1] + ny * 22 + 4)}" text-anchor="middle">${esc(M.legs[key])}</text>`;
        }
      }
    });
    if (!used.size) used.add('somerset');

    // 점과 이름 (붙어 있는 곳은 이름 하나로)
    const groupsShown = {};
    [...used].forEach((id) => {
      const g = M.places[id].group;
      if (g) (groupsShown[g] = groupsShown[g] || []).push(id);
    });
    let dots = '';
    [...used].forEach((id) => {
      const pl = M.places[id];
      const [x, y] = xy(id);
      dots += `<circle class="map-dot ${pl.kind}" cx="${f(x)}" cy="${f(y)}" r="6"/>`;
      if (!pl.group) {
        dots += `<text class="map-label" x="${f(x + pl.dx)}" y="${f(y + pl.dy)}" text-anchor="${pl.anchor || 'start'}">${esc(pl.name)}</text>`;
      }
    });
    Object.entries(groupsShown).forEach(([g, ids]) => {
      const G = M.groups[g];
      const [x, y] = xy(ids[0]);
      const name = ids.length > 1 ? `${G.name} (${ids.map(placeName).join(' · ')})` : `${G.name} ${placeName(ids[0])}`;
      dots += `<text class="map-label sea-side" x="${f(x + G.dx)}" y="${f(y + G.dy)}">${esc(name)}</text>`;
    });

    const peak = P(M.peak.at);
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(M.alt)}">
      <path class="map-island" d="${islandPath(P)}"/>
      <path class="map-peak" d="M${f(peak[0] - 7)},${f(peak[1] + 5)} L${f(peak[0])},${f(peak[1] - 6)} L${f(peak[0] + 7)},${f(peak[1] + 5)}Z"/>
      <text class="map-peak-label" x="${f(peak[0] + 10)}" y="${f(peak[1] + 4)}">${esc(M.peak.name)}</text>
      ${paths}${labels}${dots}
    </svg>`;
  }

  function routeListHTML(sel) {
    if (sel === 'all') {
      return `<ol class="rt-list">${T.days.map((d, i) => {
        const r = d.route || [];
        return `<li style="--dc:var(--d${i + 1})"><i></i><b>${dom(d.date)}일</b><span>${r.length > 1 ? esc(r.map(placeName).join(' → ')) : '아직 정하는 중'}</span></li>`;
      }).join('')}</ol>`;
    }
    const i = Number(sel);
    const d = T.days[i];
    const r = d.route || [];
    if (r.length < 2) return `<p class="rt-empty">${esc(mdw(d.date))}은 아직 동선이 없어요. 후보 탭에서 골라봐요.</p>`;
    const legs = [];
    for (let k = 0; k < r.length - 1; k += 1) {
      const t = T.map.legs[legKey(r[k], r[k + 1])];
      legs.push(`<li style="--dc:var(--d${i + 1})"><i></i><span>${esc(placeName(r[k]))} → ${esc(placeName(r[k + 1]))}</span>${t ? `<em>${esc(t)}</em>` : ''}</li>`);
    }
    return `<ol class="rt-list legs">${legs.join('')}</ol>`;
  }

  function routeMapInner(key) {
    const sel = mapSel[key];
    const chips = [`<button type="button" class="mchip" data-map-key="${key}" data-map-day="all" aria-pressed="${sel === 'all'}">전체</button>`]
      .concat(T.days.map((d, i) => `<button type="button" class="mchip" data-map-key="${key}" data-map-day="${i}" aria-pressed="${String(sel) === String(i)}" style="--dc:var(--d${i + 1})"><i></i>${dom(d.date)}일</button>`))
      .join('');
    return `<div class="mchips" role="group" aria-label="날짜 고르기">${chips}</div>
      <div class="map-card">${routeSVG(sel)}</div>
      ${routeListHTML(sel)}
      <p class="map-note">${esc(T.map.note)}</p>`;
  }

  function routeMapHTML(key, title) {
    return `<section class="block" id="map-${key}">
      <h2 class="h">${esc(title)}</h2>
      <p class="lede">${esc(T.map.caption)}</p>
      <div class="card route-map" data-map="${key}">${routeMapInner(key)}</div>
    </section>`;
  }

  function renderHome() {
    const st = tripState();
    return heroHTML(st) + nowHTML(st) + plannerHTML(st) + routeMapHTML('home', '동선 지도') + bookingsHTML() + todoHTML();
  }

  /* ---------- 일정 ---------- */
  function renderPlan() {
    const st = tripState();
    const undated = T.undated.map((u) => `<li class="card undated">
      <h3>${esc(u.title)} ${pill(u.status)}</h3>
      <p class="note">${esc(whoText(u.who))}${u.note ? ` · ${esc(u.note)}` : ''}</p>
      ${naverLink(u.q)}
    </li>`).join('');

    return `<section class="block">
        <h1 class="page-title">일정</h1>
        <p class="lede">정해진 것과 아직 정할 것을 나눠 적었어요. 바뀌면 바로 고쳐둘게요.</p>
        <p class="legend"><span class="lg s-ok"><i></i>확정</span><span class="lg s-plan"><i></i>예정</span><span class="lg s-tbd"><i></i>미정 · 정하는 중</span></p>
      </section>
      ${routeMapHTML('plan', '동선 지도')}
      ${undated ? `<section class="block">
        <h2 class="h">날짜만 정하면 돼요</h2>
        <ul class="stack">${undated}</ul>
      </section>` : ''}
      <section class="block">
        <h2 class="h">날짜별 일정</h2>
        <div class="days">${T.days.map((d, i) => dayHTML(d, i, st)).join('')}</div>
        <a class="btn-link" href="#ideas">가볼 곳 · 먹을 곳 후보 보기</a>
      </section>`;
  }

  /* ---------- 후보 ---------- */
  function renderIdeas() {
    const ideaCard = (x) => `<li class="card idea">
      <h3>${esc(x.name)}</h3>
      <p>${esc(x.desc)}</p>
      <div class="tags">${(x.tags || []).map((t) => `<span class="tag ${t.kind || ''}">${esc(t.text)}</span>`).join('')}</div>
      ${naverLink(x.q || x.name)}
    </li>`;
    return `<section class="block">
        <h1 class="page-title">가볼 곳 · 먹을 곳</h1>
        <p class="lede">${esc(T.ideasNote)}</p>
      </section>
      ${(T.ideaGroups || []).map((g) => `<section class="block">
        <h2 class="h">${esc(g.title)}</h2>
        <ul class="ideas">${g.items.map(ideaCard).join('')}</ul>
      </section>`).join('')}`;
  }

  /* ---------- 준비물 (체크 표시는 이 기기에만 저장) ---------- */
  function loadPack() {
    try { return JSON.parse(localStorage.getItem(PACK_KEY)) || {}; } catch (e) { return {}; }
  }
  function savePack(state) {
    try { localStorage.setItem(PACK_KEY, JSON.stringify(state)); } catch (e) { /* 저장이 막힌 브라우저: 화면에서만 유지 */ }
  }
  let packState = loadPack();
  const packKey = (section, item) => `${section.title}::${typeof item === 'string' ? item : item.t}`;

  function renderPack() {
    const sections = T.packing.map((sec, si) => {
      const items = sec.items.map((it, ii) => {
        const key = packKey(sec, it);
        const text = typeof it === 'string' ? it : it.t;
        const note = typeof it === 'string' ? '' : it.n;
        const id = `pk-${si}-${ii}`;
        return `<li><label for="${id}">
          <input type="checkbox" id="${id}" data-key="${esc(key)}"${packState[key] ? ' checked' : ''}>
          <span class="txt">${esc(text)}${note ? `<small>${esc(note)}</small>` : ''}</span>
        </label></li>`;
      }).join('');
      const done = sec.items.filter((it) => packState[packKey(sec, it)]).length;
      return `<section class="block" data-sec="${si}">
        <div class="h-row"><h2 class="h">${esc(sec.title)}</h2><span class="count${done === sec.items.length ? ' full' : ''}">${done} / ${sec.items.length}</span></div>
        ${sec.note ? `<p class="lede">${esc(sec.note)}</p>` : ''}
        <div class="card"><ul class="checklist">${items}</ul></div>
      </section>`;
    }).join('');

    return `<section class="block">
        <h1 class="page-title">준비물</h1>
        <p class="lede">체크 표시는 지금 보고 있는 휴대폰에만 저장돼요. 각자 폰에서 체크하면 돼요.</p>
      </section>
      ${sections}
      <section class="block"><button class="btn" type="button" id="pack-reset">체크 모두 지우기</button></section>`;
  }

  function refreshPackCounts() {
    view.querySelectorAll('[data-sec]').forEach((el) => {
      const sec = T.packing[Number(el.dataset.sec)];
      const done = sec.items.filter((it) => packState[packKey(sec, it)]).length;
      const c = el.querySelector('.count');
      c.textContent = `${done} / ${sec.items.length}`;
      c.classList.toggle('full', done === sec.items.length);
    });
  }

  let resetArmed = null;
  view.addEventListener('change', (e) => {
    const box = e.target.closest('input[type="checkbox"][data-key]');
    if (!box) return;
    if (box.checked) packState[box.dataset.key] = true;
    else delete packState[box.dataset.key];
    savePack(packState);
    refreshPackCounts();
  });
  let pendingGoto = null;
  view.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-map-day]');
    if (chip) {
      const key = chip.dataset.mapKey;
      mapSel[key] = chip.dataset.mapDay;
      const box = view.querySelector(`.route-map[data-map="${key}"]`);
      if (box) box.innerHTML = routeMapInner(key);
      return;
    }
    const show = e.target.closest('[data-show-day]');
    if (show) {
      mapSel.plan = show.dataset.showDay;
      const box = view.querySelector('.route-map[data-map="plan"]');
      if (box) {
        box.innerHTML = routeMapInner('plan');
        document.getElementById('map-plan').scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
      return;
    }
    const go = e.target.closest('[data-goto]');
    if (go) pendingGoto = go.dataset.goto;
  });
  view.addEventListener('click', (e) => {
    const btn = e.target.closest('#pack-reset');
    if (!btn) return;
    if (!resetArmed) {
      btn.textContent = '한 번 더 누르면 모두 지워져요';
      btn.classList.add('warn');
      resetArmed = setTimeout(() => {
        resetArmed = null;
        btn.textContent = '체크 모두 지우기';
        btn.classList.remove('warn');
      }, 4000);
      return;
    }
    clearTimeout(resetArmed);
    resetArmed = null;
    packState = {};
    savePack(packState);
    render();
  });

  /* ---------- 정보 ---------- */
  function renderInfo() {
    const groupsHTML = T.groups.map((g) => `<li class="card info-card">
      <h3>${esc(g.name)}</h3>
      <dl class="facts">
        <dt>제주 도착</dt><dd>${esc(whenText(g.arrive))}${g.arrive.flight ? ` · ${esc(g.arrive.flight)}` : ' <span class="pill tbd">편명 미정</span>'}</dd>
        <dt>제주 출발</dt><dd>${esc(whenText(g.depart))}${g.depart.flight ? ` · ${esc(g.depart.flight)}` : ' <span class="pill tbd">편명 미정</span>'}</dd>
      </dl>
      ${g.tip ? `<p class="tip">${esc(g.tip)}</p>` : ''}
    </li>`).join('');

    const staysHTML = T.stays.map((s) => `<li class="card info-card">
      <h3>${esc(s.name)}</h3>
      <p class="sub">${esc(s.room)} · ${esc(whoText(s.who))}</p>
      <dl class="facts">
        <dt>체크인</dt><dd>${esc(mdw(s.checkIn.date))}${s.checkIn.time ? ` ${esc(s.checkIn.time)}` : ''}</dd>
        <dt>체크아웃</dt><dd>${esc(mdw(s.checkOut.date))}${s.checkOut.time ? ` ${esc(s.checkOut.time)}` : ''}</dd>
        ${s.address ? `<dt>주소</dt><dd>${esc(s.address)}</dd>` : ''}
      </dl>
      ${s.notes && s.notes.length ? `<ul class="bullets" style="margin-top:12px">${s.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      ${naverLink(s.q)}
    </li>`).join('');

    const C = T.car;
    const carHTML = `<div class="card info-card">
      <h3>${esc(C.model)}</h3>
      <p class="sub">운전 · ${esc(C.driver)}</p>
      <dl class="facts">
        <dt>인수</dt><dd>${esc(mdw(C.pickup.date))}${C.pickup.time ? ` ${esc(C.pickup.time)}` : ''}${C.pickup.place ? ` · ${esc(C.pickup.place)}` : ''}</dd>
        <dt>반납</dt><dd>${esc(mdw(C.return.date))}${C.return.time ? ` ${esc(C.return.time)}` : ''}${C.return.place ? ` · ${esc(C.return.place)}` : ''}</dd>
        <dt>좌석</dt><dd>${esc(C.seats)}</dd>
      </dl>
      ${C.notes && C.notes.length ? `<ul class="bullets" style="margin-top:12px">${C.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    </div>`;

    const W = T.weather;
    const weatherHTML = `<div class="card info-card">
      <h3>${esc(W.title)}</h3>
      <dl class="facts">${W.facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      ${W.tip ? `<p class="tip">${esc(W.tip)}</p>` : ''}
      ${W.src ? `<p class="src">출처 · <a href="${esc(W.src.url)}" target="_blank" rel="noopener">${esc(W.src.name)}</a></p>` : ''}
    </div>`;

    const E = T.emergency;
    const emergencyHTML = `<div class="card info-card emergency">
      <h3>아플 때 · 급할 때</h3>
      <p class="sub">${esc(E.lead)}</p>
      <dl class="facts">${E.numbers.map(([k, v]) => `<dt>${esc(k)}</dt><dd><span class="num">${esc(v)}</span></dd>`).join('')}</dl>
      <ul class="hosp">${E.hospitals.map((h) => `<li>
        <b>${esc(h.name)}</b>
        <p>${esc(h.desc)}</p>
        ${h.tel ? `<p>대표번호 <a class="tel" href="tel:${esc(h.tel.replace(/-/g, ''))}">${esc(h.tel)}</a></p>` : ''}
        ${h.address ? `<p>${esc(h.address)}</p>` : ''}
        ${naverLink(h.q || h.name)}
      </li>`).join('')}</ul>
      ${E.note ? `<p class="tip">${esc(E.note)}</p>` : ''}
    </div>`;

    return `<section class="block">
        <h1 class="page-title">정보</h1>
        <p class="lede">항공편 · 숙소 · 렌터카 · 날씨 · 병원을 한곳에 모았어요.</p>
      </section>
      <section class="block"><h2 class="h">누가 언제 오고 가요</h2><ul class="stack">${groupsHTML}</ul></section>
      <section class="block"><h2 class="h">숙소</h2><ul class="stack">${staysHTML}</ul></section>
      <section class="block"><h2 class="h">렌터카</h2>${carHTML}</section>
      <section class="block"><h2 class="h">날씨</h2>${weatherHTML}</section>
      <section class="block"><h2 class="h">비상 연락</h2>${emergencyHTML}</section>
      <section class="block"><h2 class="h">이 사이트는요</h2>
        <div class="card info-card"><ul class="bullets">${T.about.map((a) => `<li>${esc(a)}</li>`).join('')}</ul></div>
        ${Object.keys(T.photos || {}).length ? `<p class="src">사진 출처 · ${Object.values(T.photos).map((ph) => esc(`${ph.alt} — ${ph.credit}`)).join(' / ')}</p>` : ''}
      </section>`;
  }

  /* ---------- 탭 전환 ---------- */
  const RENDER = { home: renderHome, plan: renderPlan, ideas: renderIdeas, pack: renderPack, info: renderInfo };
  const currentTab = () => {
    const h = location.hash.replace('#', '');
    return TABS.includes(h) ? h : 'home';
  };

  function render() {
    const tab = currentTab();
    view.innerHTML = RENDER[tab]();
    tabLinks.forEach((a) => {
      if (a.dataset.tab === tab) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    foot.textContent = `마지막 업데이트 ${md(T.updated)} · ${T.updatedBy}`;
  }

  window.addEventListener('hashchange', () => {
    if (!TABS.includes(location.hash.replace('#', ''))) return; // '#view' 같은 본문 이동 링크는 탭을 바꾸지 않음
    render();
    window.scrollTo(0, 0);
    if (pendingGoto) {
      const el = document.getElementById(pendingGoto);
      pendingGoto = null;
      if (el) el.scrollIntoView({ block: 'start' });
    } else if (currentTab() === 'plan') scrollToToday();
  });

  function scrollToToday() {
    const st = tripState();
    if (st.phase !== 'during') return;
    const el = document.getElementById(`day-${st.iso}`);
    if (el) el.scrollIntoView({ block: 'start' });
  }

  render();
  if (currentTab() === 'plan') scrollToToday();
})();
