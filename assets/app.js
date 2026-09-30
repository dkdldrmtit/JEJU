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
  const APPROX_HOUR = { 새벽: 5, 아침: 8, 오전: 10, 점심: 12, 오후: 15, 저녁: 19, 밤: 21 };
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
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>',
    mandarin: '<svg class="hero-mandarin" viewBox="0 0 54 54" aria-hidden="true"><circle cx="27" cy="31" r="19" fill="var(--tangerine)"/><circle cx="20.5" cy="25" r="4.5" fill="var(--basalt-ink)" opacity=".2"/><path d="M27 13.5V9" stroke="var(--basalt-ink)" stroke-width="2.2" stroke-linecap="round"/><path d="M27.5 10.5c1.8-4.2 6.3-6.3 10.5-5.2-1.6 4.2-6.2 6.4-10.5 5.2z" fill="var(--sea)"/></svg>',
  };

  const pill = (s) => (s && STATUS[s] ? `<span class="pill ${s}">${STATUS[s]}</span>` : '');

  function mapLinks(q, compact = false) {
    if (!q) return '';
    const e = encodeURIComponent(q);
    return `<div class="maplinks">
      <a href="https://map.naver.com/p/search/${e}" target="_blank" rel="noopener">${compact ? '네이버' : '네이버 지도'}</a>
      <a class="kakao" href="https://map.kakao.com/link/search/${e}" target="_blank" rel="noopener">${compact ? '카카오' : '카카오맵'}</a>
    </div>`;
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

  /* 도착/출발 시각 → 0~24시. 시간이 없으면 '저녁' 같은 대략값, 그것도 없으면 기본값. */
  function hourOf(point, fallback) {
    if (point && point.time) {
      const [h, m] = point.time.split(':').map(Number);
      return { h: h + (m || 0) / 60, exact: true };
    }
    if (point && point.approx && APPROX_HOUR[point.approx] != null) return { h: APPROX_HOUR[point.approx], exact: false };
    return { h: fallback, exact: false };
  }
  const pct = (iso, hour) => ((dayDiff(toDate(T.start), toDate(iso)) + hour / 24) / dates.length) * 100;

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
    const time = it.time || it.when || '시간 미정';
    return `<li class="item">
      <span class="time${hasTime ? ' is-set' : ''}">${esc(time)}</span>
      <div class="what">
        <p class="title">${esc(it.title)} ${pill(it.status)}</p>
        ${it.who ? `<p class="note">${esc(whoText(it.who))}</p>` : ''}
        ${it.note ? `<p class="note">${esc(it.note)}</p>` : ''}
        ${it.place ? `<div class="place">${mapLinks(it.place, true)}</div>` : ''}
      </div>
    </li>`;
  }

  function presentChips(iso) {
    return T.groups.map((g) => {
      if (iso < g.arrive.date || iso > g.depart.date) return '';
      let tag = '';
      if (iso === g.arrive.date) tag = g.arrive.approx ? `${g.arrive.approx} 도착` : '도착';
      else if (iso === g.depart.date) tag = '출발';
      const chips = membersOf(g.id).map((p) => `<li class="chip ${g.id}">${esc(p.name)}</li>`).join('');
      return chips + (tag ? `<li class="chip-note">${esc(tag)}</li>` : '');
    }).join('');
  }

  function dayHTML(day, i, st) {
    const isToday = st.phase === 'during' && st.index === i;
    const night = day.night ? stays.get(day.night) : null;
    const items = day.items || [];
    return `<article class="day${isToday ? ' is-today' : ''}" id="day-${day.date}">
      <div class="stub">
        <span class="stub-n">DAY ${i + 1}</span>
        <span class="stub-date">${md(day.date)}</span>
        <span class="stub-wd">${wd(day.date)}요일</span>
        ${isToday ? '<span class="stub-today">오늘</span>' : ''}
      </div>
      <div class="day-body">
        <h3 class="day-title">${esc(day.title)}</h3>
        <ul class="who day-who" aria-label="이날 제주에 있는 사람">${presentChips(day.date)}</ul>
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

  function nowHTML(st) {
    if (st.phase === 'after') return '';
    const i = st.phase === 'during' ? st.index : 0;
    const day = T.days[i];
    const label = st.phase === 'during' ? `오늘 · ${mdw(day.date)}` : `첫날 미리보기 · ${mdw(day.date)}`;
    const items = (day.items || []).slice(0, 4);
    return `<section class="block">
      <div class="card now-card">
        <p class="now-label">${esc(label)}</p>
        <h3>${esc(day.title)}</h3>
        ${items.length ? `<ol class="items">${items.map(itemHTML).join('')}</ol>` : `<p class="empty-slot">${esc(day.open || '아직 정하는 중이에요')}</p>`}
        <a class="btn-link" href="#plan">전체 일정 보기</a>
      </div>
    </section>`;
  }

  function timelineHTML(st) {
    const head = dates.map((iso, i) => (
      `<div class="${st.phase === 'during' && st.index === i ? 'is-today' : ''}"><b>${dom(iso)}</b><span>${wd(iso)}</span></div>`
    )).join('');

    const span = T.groups.map((g) => {
      const a = hourOf(g.arrive, 12);
      const d = hourOf(g.depart, 14);
      return { g, a, d, left: pct(g.arrive.date, a.h), right: pct(g.depart.date, d.h) };
    });

    const rows = span.map(({ g, a, d, left, right }) => {
      const cls = ['tl-bar', g.id, a.exact ? '' : 'fuzzy-start', d.exact ? '' : 'fuzzy-end'].filter(Boolean).join(' ');
      return `<div class="tl-row">
        <p class="tl-label">${esc(g.name)}</p>
        <div class="tl-track"><span class="${cls}" style="left:${left.toFixed(2)}%;width:${(right - left).toFixed(2)}%"></span></div>
        <p class="tl-caption"><span>${esc(whenText(g.arrive, '도착'))} → ${esc(whenText(g.depart, '출발'))}</span></p>
      </div>`;
    }).join('');

    const togetherLeft = Math.max(...span.map((s) => s.left));
    const togetherRight = Math.min(...span.map((s) => s.right));

    const stayBars = T.stays.map((s) => {
      const l = pct(s.checkIn.date, hourOf(s.checkIn, 15).h);
      const r = pct(s.checkOut.date, hourOf(s.checkOut, 11).h);
      return `<span class="tl-stay" style="left:${l.toFixed(2)}%;width:${(r - l).toFixed(2)}%">${esc(s.short)}</span>`;
    }).join('');

    const lastGroupIn = span.reduce((m, s) => (s.left > m.left ? s : m), span[0]);
    const firstGroupOut = span.reduce((m, s) => (s.right < m.right ? s : m), span[0]);

    return `<section class="block">
      <h2 class="h">누가 언제 있어요</h2>
      <div class="card">
        <div class="tl" style="--cols:${dates.length}">
          <div class="tl-head">${head}</div>
          <div class="tl-body">
            <div class="tl-cols" aria-hidden="true">${dates.map(() => '<span></span>').join('')}</div>
            ${togetherRight > togetherLeft ? `<div class="tl-together" style="left:${togetherLeft.toFixed(2)}%;width:${(togetherRight - togetherLeft).toFixed(2)}%" aria-hidden="true"></div>` : ''}
            ${rows}
            <div class="tl-row">
              <p class="tl-label">잠자는 곳</p>
              <div class="tl-stays">${stayBars}</div>
            </div>
          </div>
        </div>
        <p class="tl-legend"><span><i></i>${T.people.length}명 모두 함께 · ${esc(whenText(lastGroupIn.g.arrive))}부터 ${esc(mdw(firstGroupOut.g.depart.date))}까지</span></p>
      </div>
    </section>`;
  }

  function bookingsHTML() {
    const rows = T.bookings.map((b) => `<li class="card booking">
      <span class="booking-icon${b.accent ? ' t' : ''}">${ICON[b.icon] || ''}</span>
      <div>
        <h3>${esc(b.title)} ${pill(b.status)}</h3>
        <p class="meta">${esc(b.meta)}</p>
        ${b.q ? mapLinks(b.q) : ''}
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

  /* 제주 섬 약도: 해안선 좌표(경도·위도)를 부드러운 곡선으로 잇고, 주요 지점만 찍는다. */
  function mapHTML() {
    const M = T.map;
    const S = 4.25; // 1km당 px
    const KX = 93 * S; // 위도 33.4° 부근 경도 1°≈93km
    const KY = 111 * S;
    const LON0 = 126.12;
    const LAT0 = 33.6;
    const W = 340;
    const H = 205;
    const P = ([lon, lat]) => [(lon - LON0) * KX, (LAT0 - lat) * KY];
    const f = (n) => n.toFixed(1);

    const pts = M.coast.map(P);
    let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
    for (let i = 0; i < pts.length; i += 1) {
      const p0 = pts[(i - 1 + pts.length) % pts.length];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % pts.length];
      const p3 = pts[(i + 2) % pts.length];
      d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)},${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)},${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])},${f(p2[1])}`;
    }
    d += 'Z';

    const byId = new Map(M.points.map((p) => [p.id, { ...p, xy: P([p.lon, p.lat]) }]));

    const routes = M.routes.map((r) => {
      const a = byId.get(r.from).xy;
      const b = byId.get(r.to).xy;
      const mx = (a[0] + b[0]) / 2;
      const my = (a[1] + b[1]) / 2;
      const [lx, ly] = r.labelAt || [mx, my];
      return `<path class="map-route" d="M${f(a[0])},${f(a[1])} L${f(b[0])},${f(b[1])}"/>
        <text class="map-route-label" x="${f(lx)}" y="${f(ly)}" text-anchor="middle">${esc(r.label)}</text>`;
    }).join('');

    const peak = P(M.peak.at);
    const dots = [...byId.values()].map((p) => {
      const [x, y] = p.xy;
      const lines = p.label.map((t, i) => `<tspan x="${f(x + p.dx)}" dy="${i === 0 ? 0 : 14}">${esc(t)}</tspan>`).join('');
      return `<circle class="map-dot ${p.kind}" cx="${f(x)}" cy="${f(y)}" r="6"/>
        <text class="map-label${p.seaSide ? ' sea-side' : ''}" x="${f(x + p.dx)}" y="${f(y + p.dy)}" text-anchor="${p.anchor || 'start'}">${lines}</text>`;
    }).join('');

    return `<section class="block">
      <h2 class="h">우리 동선</h2>
      <p class="lede">${esc(M.caption)}</p>
      <figure class="card map-card" style="margin:0">
        <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(M.alt)}">
          <path class="map-island" d="${d}"/>
          <path class="map-peak" d="M${f(peak[0] - 7)},${f(peak[1] + 5)} L${f(peak[0])},${f(peak[1] - 6)} L${f(peak[0] + 7)},${f(peak[1] + 5)}Z"/>
          <text class="map-peak-label" x="${f(peak[0] + 10)}" y="${f(peak[1] + 4)}">${esc(M.peak.name)}</text>
          ${routes}
          ${dots}
        </svg>
        <figcaption class="map-note">${esc(M.note)}</figcaption>
      </figure>
    </section>`;
  }

  function renderHome() {
    const st = tripState();
    return heroHTML(st) + nowHTML(st) + timelineHTML(st) + bookingsHTML() + todoHTML() + mapHTML();
  }

  /* ---------- 일정 ---------- */
  function renderPlan() {
    const st = tripState();
    const undated = T.undated.map((u) => `<li class="card undated">
      <h3>${esc(u.title)} ${pill(u.status)}</h3>
      <p class="note">${esc(whoText(u.who))}${u.note ? ` · ${esc(u.note)}` : ''}</p>
      ${mapLinks(u.q)}
    </li>`).join('');

    return `<section class="block">
        <h1 class="page-title">일정</h1>
        <p class="lede">정해진 것과 아직 정할 것을 나눠 적었어요. 바뀌면 바로 고쳐둘게요.</p>
        <p class="legend"><span class="pill ok">확정</span> 예약·결정 끝 <span class="pill plan">예정</span> 하기로 함 <span class="pill tbd">미정</span> 시간·내용 정하는 중</p>
      </section>
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
      ${mapLinks(x.q || x.name)}
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
      ${mapLinks(s.q)}
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
        ${mapLinks(h.q || h.name)}
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
    if (currentTab() === 'plan') scrollToToday();
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
