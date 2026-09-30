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
  // 가운뎃점(·)이 줄 맨 앞으로 넘어가지 않게 앞 단어에 붙임 (A · B → A\u00A0· B)
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  )).replace(/ · /g, '\u00A0· ');
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
    talk: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3.5c-5 0-9 3.2-9 7.1 0 2.5 1.6 4.7 4.1 5.9l-.9 3.3c-.1.3.3.6.6.4l3.9-2.6c.4 0 .9.1 1.3.1 5 0 9-3.2 9-7.1S17 3.5 12 3.5z"/></svg>',
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
        <p class="day-wx" data-wx-chip="${day.date}">${wxChipHTML(day.date)}</p>
        <p class="day-who" aria-label="이날 제주에 있는 사람">${dayWhoHTML(day.date)}</p>
        ${items.length ? `<ol class="items">${items.map(itemHTML).join('')}</ol>` : ''}
        ${day.open ? `<p class="empty-slot">${esc(day.open)}</p><div class="fb" data-fb-day="${day.date}"></div>` : ''}
        ${night
          ? `<p class="night">${ICON.moon}<span>숙박 · <b>${esc(night.name)}</b></span></p>`
          : `<p class="night">${ICON.plane}<span>${esc(day.nightNote || '집으로')}</span></p>`}
      </div>
    </article>`;
  }

  /* ---------- 홈 ---------- */
  function heroHTML(st) {
    const H = T.hero || {};
    let big;
    let small;
    if (st.phase === 'before') { big = `D-${st.dday}`; small = '출발까지'; }
    else if (st.phase === 'during') {
      big = st.index === 0 ? 'D-DAY' : `${st.index + 1}일차`;
      small = st.index === 0 ? '드디어 출발!' : `${dates.length}일 중`;
    } else { big = '다녀왔어요'; small = '모두 수고했어요'; }
    const nights = dates.length - 1;
    return `<section class="invite" aria-label="여행 초대">
      <div class="inv-text">
        <p class="inv-eyebrow">${esc(H.eyebrow || T.eyebrow)}</p>
        <h1 class="inv-title">${esc(H.title || T.shortTitle)}</h1>
        <p class="inv-dates">${md(T.start)}(${wd(T.start)}) – ${md(T.end)}(${wd(T.end)})</p>
        <p class="dday"><b>${esc(big)}</b><span>${esc(small)}</span></p>
        <p class="inv-note">${esc(H.note || `${nights}박 ${dates.length}일 · ${T.tagline}`)}</p>
        ${T.share ? `<button type="button" class="kakao-share" data-share>${ICON.talk}<span>카톡으로 초대하기</span></button>` : ''}
      </div>
      ${H.photo ? `<figure class="inv-photo">
        <p class="inv-bubble">${esc(H.bubble || '')}</p>
        <span class="inv-flip f0" data-flip><img src="${esc(H.photo)}" alt="${esc(H.alt || '')}" width="430" height="561" fetchpriority="high"></span>
      </figure>` : ICON.mandarin}
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

  /* ---------- 날씨 (Open-Meteo 예보, 못 받으면 평년값) ---------- */
  const WX_KEY = 'jeju2026.wx.v1';
  let wxDays = null;
  try { const c = JSON.parse(localStorage.getItem(WX_KEY)); if (c && c.days) wxDays = c.days; } catch (e) { /* 무시 */ }
  const WX_ICON = {
    sun: '<svg viewBox="0 0 24 24" class="wx sun" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M5.5 18.5l1.7-1.7M16.8 7.2l1.7-1.7"/></svg>',
    partly: '<svg viewBox="0 0 24 24" class="wx partly" aria-hidden="true"><g class="s"><circle cx="9" cy="8.5" r="3.2"/><path d="M9 2.6v1.6M3.1 8.5h1.6M4.8 4.3l1.1 1.1M13.2 4.3l-1.1 1.1"/></g><path class="c" d="M8.5 19.5h8.2a3.6 3.6 0 0 0 .4-7.2 4.8 4.8 0 0 0-9.2 1.3 2.95 2.95 0 0 0 .6 5.9z"/></svg>',
    cloud: '<svg viewBox="0 0 24 24" class="wx cloud" aria-hidden="true"><path class="c" d="M7.5 18.5h9.3a3.9 3.9 0 0 0 .4-7.8 5.3 5.3 0 0 0-10.2 1.4 3.2 3.2 0 0 0 .5 6.4z"/></svg>',
    rain: '<svg viewBox="0 0 24 24" class="wx rain" aria-hidden="true"><path class="c" d="M7.5 15h9.3a3.9 3.9 0 0 0 .4-7.8A5.3 5.3 0 0 0 7 8.6 3.2 3.2 0 0 0 7.5 15z"/><path class="d" d="M8.5 18l-1 2.5M12.5 18l-1 2.5M16.5 18l-1 2.5"/></svg>',
    storm: '<svg viewBox="0 0 24 24" class="wx storm" aria-hidden="true"><path class="c" d="M7.5 15h9.3a3.9 3.9 0 0 0 .4-7.8A5.3 5.3 0 0 0 7 8.6 3.2 3.2 0 0 0 7.5 15z"/><path class="b" d="M12.5 15.5 10.5 19h3l-2 3.5"/></svg>',
    fog: '<svg viewBox="0 0 24 24" class="wx fog" aria-hidden="true"><path class="c" d="M7.5 13h9.3a3.9 3.9 0 0 0 .4-7.8A5.3 5.3 0 0 0 7 6.6 3.2 3.2 0 0 0 7.5 13z"/><path class="d" d="M5 16.5h14M7 19.5h10"/></svg>',
    snow: '<svg viewBox="0 0 24 24" class="wx snow" aria-hidden="true"><path class="c" d="M7.5 15h9.3a3.9 3.9 0 0 0 .4-7.8A5.3 5.3 0 0 0 7 8.6 3.2 3.2 0 0 0 7.5 15z"/><path class="d" d="M9 18.5v.1M12 20v.1M15 18.5v.1"/></svg>',
  };
  const WX_LABEL = { sun: '맑음', partly: '구름 조금', cloud: '흐림', rain: '비', storm: '뇌우', fog: '안개', snow: '눈' };
  function wxType(code) {
    if (code === 0) return 'sun';
    if (code <= 2) return 'partly';
    if (code === 3) return 'cloud';
    if (code === 45 || code === 48) return 'fog';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if (code >= 95) return 'storm';
    return 'rain';
  }
  function wxOf(iso) {
    const d = wxDays && wxDays[iso];
    if (d) return { type: wxType(d.code), max: Math.round(d.max), min: Math.round(d.min), pop: d.pop, normal: false };
    const N = T.weather.normal;
    return { type: 'partly', max: N.max, min: N.min, pop: null, normal: true };
  }
  const wxMiniHTML = (iso) => { const w = wxOf(iso); return `${WX_ICON[w.type]}<span class="t${w.normal ? ' normal' : ''}">${w.max}°</span>`; };
  function wxChipHTML(iso) {
    const w = wxOf(iso);
    return `<span class="wx-chip">${WX_ICON[w.type]}<b>${w.normal ? '평년' : WX_LABEL[w.type]}</b> ${w.max}° / ${w.min}°${w.pop != null && w.pop >= 20 ? ` · 비 ${w.pop}%` : ''}</span>`;
  }
  function fillWeather() {
    view.querySelectorAll('[data-wx]').forEach((el) => { el.innerHTML = wxMiniHTML(el.dataset.wx); });
    view.querySelectorAll('[data-wx-chip]').forEach((el) => { el.innerHTML = wxChipHTML(el.dataset.wxChip); });
    const list = view.querySelector('[data-wx-list]');
    if (list) list.innerHTML = wxListHTML();
  }
  function wxListHTML() {
    return T.days.map((d) => { const w = wxOf(d.date); return `<li><span class="wl-d">${esc(mdw(d.date))}</span><span class="wl-i">${WX_ICON[w.type]}</span><span class="wl-l">${w.normal ? '평년' : WX_LABEL[w.type]}</span><span class="wl-t">${w.max}° / ${w.min}°</span><span class="wl-p">${w.pop != null ? `비 ${w.pop}%` : ''}</span></li>`; }).join('');
  }
  async function loadWeather() {
    try {
      const c = JSON.parse(localStorage.getItem(WX_KEY) || 'null');
      if (c && Date.now() - c.at < 3 * 3600e3) return;
    } catch (e) { /* 무시 */ }
    const { lat, lon } = T.weather.point;
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Asia%2FSeoul&forecast_days=16`);
      const j = await res.json();
      const D = j.daily;
      const days = {};
      D.time.forEach((t, i) => { if (dates.includes(t)) days[t] = { code: D.weather_code[i], max: D.temperature_2m_max[i], min: D.temperature_2m_min[i], pop: D.precipitation_probability_max[i] }; });
      if (Object.keys(days).length) {
        wxDays = days;
        try { localStorage.setItem(WX_KEY, JSON.stringify({ at: Date.now(), days })); } catch (e) { /* 무시 */ }
        fillWeather();
      }
    } catch (e) { /* 예보를 못 받으면 평년값 그대로 */ }
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
      const blocks = (day.blocks || []).map(([a, b, label, kind, tbd, pk], bk) => {
        const len = toH(b) - toH(a);
        const ph = len >= 1.5 ? photoOf(pk) : null;
        const cls = ['pb', `k-${kind}`, tbd ? 'tbd' : '', len < 0.9 ? 'tiny' : '', ph ? 'has-photo' : ''].filter(Boolean).join(' ');
        return `<span class="${cls}" style="--c:${i};--k:${bk};top:calc(${at(toH(a))}% + 1.5px);height:calc(${((len / span) * 100).toFixed(2)}% - 3px)${ph ? `;--ph:url('${esc(new URL(ph.src, document.baseURI).href)}');--pp:${esc(ph.pos || 'center')}` : ''}" title="${esc(`${a}–${b} ${label}`)}">${len >= 1.5 && !tbd ? kindIcon(kind) : ''}<b>${esc(label)}</b>${len >= 1.8 && !tbd && kind !== 'rest' ? `<small>${esc(a)}</small>` : ''}</span>`;
      }).join('');
      let now = '';
      if (isToday) {
        const d = new Date();
        const h = d.getHours() + d.getMinutes() / 60;
        if (h >= P.from && h <= P.to) now = `<span class="pl-now" style="top:${at(h)}%"></span>`;
      }
      const night = day.night ? stays.get(day.night).short : '집';
      return `<a class="pl-col${isToday ? ' is-today' : ''}${weekend ? ' is-weekend' : ''}" href="#plan" data-goto="day-${day.date}" aria-label="${esc(`${mdw(day.date)} ${day.title}`)}">
        <span class="pl-head"><span class="pl-wd">${wd(day.date)}</span><b>${dom(day.date)}</b><span class="pl-wx" data-wx="${day.date}">${wxMiniHTML(day.date)}</span></span>
        <span class="pl-body">${blocks}${now}</span>
        <span class="pl-night">${esc(night)}</span>
      </a>`;
    }).join('');

    const legend = Object.entries(P.kinds).map(([k, name]) => `<span class="k-${k}"><i>${kindIcon(k)}</i>${esc(name)}</span>`).join('');
    return `<section class="block">
      <div class="h-row"><h2 class="h">6일 시간표</h2><span class="count">날짜를 누르면 자세히</span></div>
      <div class="card planner-card" data-sky>
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

  /* ---------- 동선 지도: 실제 도로 위에 시간 순서대로 (Leaflet + OpenStreetMap) ---------- */
  const mapSel = { home: 'all', plan: 'all' };
  const maps = {}; // key → { map, layer }
  const ROUTES = window.ROUTES || {};
  const placeOf = (id) => T.map.places[id];
  const legOf = (a, b) => ROUTES[`${a}>${b}`];
  const dayColor = (i) => getComputedStyle(document.documentElement).getPropertyValue(`--d${i + 1}`).trim() || '#0E7A73';
  const roundMin = (m) => Math.max(5, Math.ceil(m / 5) * 5);
  const isDark = () => {
    const t = document.documentElement.dataset.theme;
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  function stepsHTML(key) {
    const sel = mapSel[key];
    if (sel === 'all') {
      return `<ol class="rt-list">${T.days.map((d, i) => {
        const r = d.route || [];
        let mins = 0;
        for (let k = 1; k < r.length; k += 1) { const l = legOf(r[k - 1].at, r[k].at); if (l) mins += l.min; }
        return `<li style="--dc:var(--d${i + 1})"><button type="button" class="rt-day" data-map-key="${key}" data-map-day="${i}"><i></i><b>${dom(d.date)}일</b><span>${r.length > 1 ? esc(r.map((s) => placeOf(s.at).name).join(' → ')) : '아직 정하는 중'}</span>${mins ? `<em>운전 ${roundMin(mins)}분</em>` : ''}</button></li>`;
      }).join('')}</ol>`;
    }
    const i = Number(sel);
    const d = T.days[i];
    const r = d.route || [];
    if (r.length < 2) return `<p class="rt-empty">${esc(mdw(d.date))}은 아직 동선이 없어요. 후보 탭에서 골라봐요.</p>`;
    const rows = r.map((s, k) => {
      const leg = k ? legOf(r[k - 1].at, s.at) : null;
      return `${leg ? `<li class="st-leg">차로 약 ${roundMin(leg.min)}분 · ${leg.km}km</li>` : ''}
        <li class="st" style="--dc:var(--d${i + 1})"><button type="button" data-fly="${key}:${k}"><span class="st-n">${k + 1}</span><span class="st-t">${esc(s.time || '')}</span><span class="st-l">${esc(s.label)}<small>${esc(placeOf(s.at).name)}</small></span></button></li>`;
    }).join('');
    return `<ol class="steps">${rows}</ol>`;
  }

  function routeMapHTML(key, title) {
    const sel = mapSel[key];
    const chips = [`<button type="button" class="mchip" data-map-key="${key}" data-map-day="all" aria-pressed="${sel === 'all'}">전체</button>`]
      .concat(T.days.map((d, i) => `<button type="button" class="mchip" data-map-key="${key}" data-map-day="${i}" aria-pressed="${String(sel) === String(i)}" style="--dc:var(--d${i + 1})"><i></i>${dom(d.date)}일</button>`))
      .join('');
    return `<section class="block" id="map-${key}">
      <h2 class="h">${esc(title)}</h2>
      <p class="lede">${esc(T.map.caption)}</p>
      <div class="card route-map" data-map="${key}">
        <div class="mchips" role="group" aria-label="날짜 고르기">${chips}</div>
        <div class="lmap-wrap"><div class="lmap" id="lmap-${key}" role="img" aria-label="동선 지도"></div><p class="lmap-hint">지도를 한 번 누르면 움직일 수 있어요</p></div>
        <div class="rt-steps">${stepsHTML(key)}</div>
        <p class="map-note">${esc(T.map.note)}</p>
      </div>
    </section>`;
  }

  /* 지도 엔진: 카카오맵 키가 있으면 카카오맵, 없으면 Leaflet(OpenStreetMap) */
  let kakaoReady = null;
  function loadKakao() {
    if (!T.map.kakaoKey) return Promise.resolve(false);
    if (!kakaoReady) {
      kakaoReady = new Promise((resolve) => {
        const sc = document.createElement('script');
        sc.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(T.map.kakaoKey)}&autoload=false`;
        // 도메인 미등록 등으로 키가 거부되면 SDK 대신 오류 JSON 이 와서 kakao 가 안 생김 → OpenStreetMap 으로
        const fail = setTimeout(() => resolve(false), 20000);
        sc.onload = () => {
          if (window.kakao && window.kakao.maps && window.kakao.maps.load) window.kakao.maps.load(() => { clearTimeout(fail); resolve(true); });
          else { clearTimeout(fail); resolve(false); }
        };
        sc.onerror = () => { clearTimeout(fail); resolve(false); };
        document.head.appendChild(sc);
      });
    }
    return kakaoReady;
  }

  // 공통: 그릴 것 목록 만들기 (선 · 번호 핀 · 이름표)
  function mapShapes(key) {
    const sel = mapSel[key];
    const lines = [];
    const pins = [];
    const dayIdx = sel === 'all' ? T.days.map((_, i) => i) : [Number(sel)];
    dayIdx.forEach((i) => {
      const r = T.days[i].route || [];
      for (let k = 1; k < r.length; k += 1) {
        const leg = legOf(r[k - 1].at, r[k].at);
        if (leg) lines.push({ pts: leg.pts, color: dayColor(i), thin: sel === 'all' });
      }
    });
    if (sel === 'all') {
      Object.values(T.map.places).forEach((pl) => pins.push({ pl, label: '', color: 'var(--ink)', dot: true }));
    } else {
      const i = Number(sel);
      const r = T.days[i].route || [];
      const byPlace = {};
      r.forEach((s, k) => { (byPlace[s.at] = byPlace[s.at] || []).push(k + 1); });
      Object.entries(byPlace).forEach(([id, nums]) => pins.push({ pl: placeOf(id), label: nums.join('·'), color: dayColor(i) }));
      if (!r.length) pins.push({ pl: placeOf('somerset'), label: '·', color: dayColor(i) });
    }
    return { lines, pins };
  }

  const pinHTML = (p) => `<div class="kpin${p.pl.labelSide === 'left' ? ' left' : ''}"><span class="${p.dot ? 'dot' : ''}" style="--c:${p.color}">${esc(p.label)}</span><em>${esc(p.pl.name)}</em></div>`;

  function numIcon(label, color) {
    return window.L.divIcon({ className: 'pin', html: `<span style="--c:${color}">${esc(label)}</span>`, iconSize: [28, 28], iconAnchor: [14, 14] });
  }

  function drawMap(key) {
    const M = maps[key];
    if (!M) return;
    const { lines, pins } = mapShapes(key);
    if (M.kind === 'kakao') {
      const K = window.kakao.maps;
      M.items.forEach((it) => it.setMap(null));
      M.items = [];
      const bounds = new K.LatLngBounds();
      lines.forEach((ln) => {
        const path = ln.pts.map(([la, lo]) => new K.LatLng(la, lo));
        M.items.push(new K.Polyline({ map: M.map, path, strokeWeight: ln.thin ? 6 : 9, strokeColor: '#ffffff', strokeOpacity: 0.9 }));
        M.items.push(new K.Polyline({ map: M.map, path, strokeWeight: ln.thin ? 3 : 5, strokeColor: ln.color, strokeOpacity: 0.95 }));
        path.forEach((ll) => bounds.extend(ll));
      });
      pins.forEach((p) => {
        const ll = new K.LatLng(p.pl.lat, p.pl.lon);
        M.items.push(new K.CustomOverlay({ map: M.map, position: ll, content: pinHTML(p), xAnchor: 0.5, yAnchor: 0.5, zIndex: 3 }));
        bounds.extend(ll);
      });
      if (!bounds.isEmpty()) M.map.setBounds(bounds, 36, 24, 36, 24);
      return;
    }
    const L = window.L;
    M.layer.clearLayers();
    const bounds = [];
    lines.forEach((ln) => {
      L.polyline(ln.pts, { color: isDark() ? '#121615' : '#ffffff', weight: ln.thin ? 6 : 9, opacity: 0.9 }).addTo(M.layer);
      L.polyline(ln.pts, { color: ln.color, weight: ln.thin ? 3 : 5, opacity: 0.95 }).addTo(M.layer);
      ln.pts.forEach((pt) => bounds.push(pt));
    });
    pins.forEach((p) => {
      const icon = p.dot
        ? L.divIcon({ className: 'pin dot', html: '<span></span>', iconSize: [14, 14], iconAnchor: [7, 7] })
        : numIcon(p.label, p.color);
      L.marker([p.pl.lat, p.pl.lon], { icon })
        .bindTooltip(p.pl.name, { permanent: true, direction: p.pl.labelSide === 'left' ? 'left' : 'right', offset: [(p.dot ? 8 : 12) * (p.pl.labelSide === 'left' ? -1 : 1), 0], className: 'pin-tip' })
        .addTo(M.layer);
      bounds.push([p.pl.lat, p.pl.lon]);
    });
    if (bounds.length > 1) M.map.fitBounds(bounds, { padding: [28, 28], maxZoom: 13 });
    else if (bounds.length) M.map.setView(bounds[0], 12);
  }

  function flyTo(key, pl) {
    const M = maps[key];
    if (!M) return;
    if (M.kind === 'kakao') {
      M.map.setLevel(5);
      M.map.panTo(new window.kakao.maps.LatLng(pl.lat, pl.lon));
    } else M.map.flyTo([pl.lat, pl.lon], 14, { duration: 0.6 });
  }

  async function initMaps() {
    Object.keys(maps).forEach((k) => { if (maps[k].kind === 'leaflet') maps[k].map.remove(); delete maps[k]; });
    const boxes = [...view.querySelectorAll('.route-map[data-map]')];
    if (!boxes.length) return;
    const useKakao = await loadKakao();
    const touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    boxes.forEach((box) => {
      if (!box.isConnected) return;
      const key = box.dataset.map;
      const el = box.querySelector('.lmap');
      if (useKakao) {
        const K = window.kakao.maps;
        const map = new K.Map(el, { center: new K.LatLng(33.38, 126.45), level: 10 });
        map.addControl(new K.ZoomControl(), K.ControlPosition.RIGHT);
        if (touch) {
          map.setDraggable(false);
          K.event.addListener(map, 'click', () => { map.setDraggable(true); box.classList.add('map-active'); });
        } else box.classList.add('map-active');
        box.classList.add('kakao-map');
        maps[key] = { kind: 'kakao', map, items: [] };
      } else {
        const L = window.L;
        if (!L || !el) { box.classList.add('no-map'); return; }
        const map = L.map(el, { scrollWheelZoom: false, dragging: !touch, tap: false, zoomControl: true, attributionControl: true });
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);
        box.classList.toggle('dark-tiles', isDark());
        if (touch) {
          map.once('click', () => { map.dragging.enable(); box.classList.add('map-active'); });
        } else box.classList.add('map-active');
        maps[key] = { kind: 'leaflet', map, layer: L.layerGroup().addTo(map) };
      }
      drawMap(key);
    });
  }

  function selectMapDay(key, value, scroll) {
    mapSel[key] = value;
    const box = view.querySelector(`.route-map[data-map="${key}"]`);
    if (!box) return;
    box.querySelectorAll('[data-map-day].mchip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.mapDay === String(value))));
    box.querySelector('.rt-steps').innerHTML = stepsHTML(key);
    drawMap(key);
    if (scroll) document.getElementById(`map-${key}`).scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  /* 홈: 무엇이든 말해주세요 (가족 의견 + AI 반영) */
  function homeVoiceHTML() {
    return `<section class="block">
      <div class="h-row"><h2 class="h">가족 의견함</h2><a class="count link" href="#ideas">전체 보기</a></div>
      <div class="card voice">
        <p class="voice-lead">하고 싶은 것, 궁금한 것, 바꾸고 싶은 것 뭐든 남겨주세요. <b>AI가 한 시간 안에 확인하고 답하거나 사이트에 반영해요.</b></p>
        <div class="fb" data-fb-day="home"></div>
      </div>
    </section>`;
  }

  function updatesHTML() {
    const list = (T.updates || []).slice(0, 4);
    if (!list.length) return '';
    return `<section class="block">
      <h2 class="h">업데이트 소식</h2>
      <ol class="card updates">${list.map((u) => `<li><span class="u-d">${esc(md(u.date))}</span><span class="u-t">${esc(u.text)}${u.by ? `<small>${esc(u.by)}</small>` : ''}</span></li>`).join('')}</ol>
    </section>`;
  }

  function renderHome() {
    const st = tripState();
    return heroHTML(st) + nowHTML(st) + plannerHTML(st) + homeVoiceHTML() + routeMapHTML('home', '동선 지도') + updatesHTML() + bookingsHTML() + todoHTML();
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
      <section class="block">
        <h2 class="h">가족 의견</h2>
        <p class="lede">하고 싶은 거, 먹고 싶은 거 아무거나 남겨주세요. 링크도 붙일 수 있어요.</p>
        <div class="card fb fb-all" data-fb-day="all"></div>
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
    if (e.target.closest('[data-share]')) { shareInvite(); return; }
    const chip = e.target.closest('[data-map-day]');
    if (chip) { selectMapDay(chip.dataset.mapKey, chip.dataset.mapDay, false); return; }
    const show = e.target.closest('[data-show-day]');
    if (show) { selectMapDay('plan', show.dataset.showDay, true); return; }
    const fly = e.target.closest('[data-fly]');
    if (fly) {
      const [key, k] = fly.dataset.fly.split(':');
      const stop = T.days[Number(mapSel[key])].route[Number(k)];
      const pl = placeOf(stop.at);
      flyTo(key, pl);
      return;
    }
    const zoom = e.target.closest('.item-photo img');
    if (zoom) { openLightbox(zoom.currentSrc || zoom.src, zoom.alt); return; }
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
      <p class="sub">${esc([C.company, `운전 ${C.driver}`].filter(Boolean).join(' · '))}</p>
      <dl class="facts">
        ${C.detail ? `<dt>차량</dt><dd>${esc(C.detail)}</dd>` : ''}
        <dt>인수</dt><dd>${esc(mdw(C.pickup.date))}${C.pickup.time ? ` ${esc(C.pickup.time)}` : ''}${C.pickup.place ? ` · ${esc(C.pickup.place)}` : ''}</dd>
        <dt>반납</dt><dd>${esc(mdw(C.return.date))}${C.return.time ? ` ${esc(C.return.time)}` : ''}${C.return.place ? ` · ${esc(C.return.place)}` : ''}</dd>
        ${C.address ? `<dt>차고지</dt><dd>${esc(C.address)}</dd>` : ''}
        ${C.insurance ? `<dt>보험</dt><dd>${esc(C.insurance)}</dd>` : ''}
        <dt>좌석</dt><dd>${esc(C.seats)}</dd>
      </dl>
      ${C.notes && C.notes.length ? `<ul class="bullets" style="margin-top:12px">${C.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      ${naverLink(C.company)}
    </div>`;

    const W = T.weather;
    const weatherHTML = `<div class="card info-card">
      <h3>${esc(W.title)}</h3>
      <p class="sub" style="margin-top:10px">날짜별 예보 · 서머셋 근처</p>
      <ul class="wx-list" data-wx-list>${wxListHTML()}</ul>
      <p class="sub" style="margin-top:14px">10월 중순 평년</p>
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

  /* ---------- 카톡 초대장 보내기 (카카오 공유) ---------- */
  let kakaoShare = null;
  function loadKakaoShare() {
    if (!T.share || !T.map.kakaoKey) return Promise.resolve(false);
    if (!kakaoShare) {
      kakaoShare = new Promise((resolve) => {
        const sc = document.createElement('script');
        sc.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.0/kakao.min.js';
        sc.onload = () => {
          try {
            if (!window.Kakao.isInitialized()) window.Kakao.init(T.map.kakaoKey);
            resolve(Boolean(window.Kakao.Share));
          } catch (e) { resolve(false); }
        };
        sc.onerror = () => resolve(false);
        document.head.appendChild(sc);
      });
    }
    return kakaoShare;
  }
  // 버튼을 누른 순간 바로 보내야 팝업이 막히지 않아서, 홈을 열 때 미리 불러둠
  const kakaoShareReady = () => Boolean(window.Kakao && window.Kakao.isInitialized && window.Kakao.isInitialized() && window.Kakao.Share);

  async function shareInvite() {
    const S = T.share;
    const url = (T.site && T.site.url) || location.href.split('#')[0];
    const link = { mobileWebUrl: url, webUrl: url };
    if (kakaoShareReady()) {
      try {
        window.Kakao.Share.sendDefault({
          objectType: 'feed',
          content: { title: S.title, description: S.text, imageUrl: S.image, imageWidth: 1200, imageHeight: 630, link },
          buttons: [{ title: S.button || '초대장 열기', link }],
        });
        return;
      } catch (e) { /* 아래 방법으로 */ }
    }
    if (navigator.share) {
      try { await navigator.share({ title: S.title, text: S.text, url }); } catch (e) { /* 취소 */ }
      return;
    }
    try { await navigator.clipboard.writeText(url); toast('링크를 복사했어요. 카톡에 붙여넣어 주세요'); } catch (e) { toast(url); }
  }

  /* ---------- 가족 의견 (구글 시트에 저장) ---------- */
  const FB = T.feedback || {};
  const NAME_KEY = 'jeju2026.name';
  let fbItems = null;
  let fbOpen = null;
  const fbDays = () => T.days.filter((d) => d.open).map((d) => d.date);
  const savedName = () => { try { return localStorage.getItem(NAME_KEY) || ''; } catch (e) { return ''; } };
  const saveName = (n) => { try { localStorage.setItem(NAME_KEY, n); } catch (e) { /* 무시 */ } };

  function ago(ts) {
    const t = new Date(ts);
    if (Number.isNaN(t.getTime())) return '';
    const m = Math.round((Date.now() - t) / 60000);
    if (m < 1) return '방금';
    if (m < 60) return `${m}분 전`;
    if (m < 60 * 24) return `${Math.round(m / 60)}시간 전`;
    return `${t.getMonth() + 1}.${t.getDate()}`;
  }
  const hostOf = (u) => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return '링크'; } };

  function fbItemHTML(it, showDay) {
    const safeLink = /^https?:\/\//.test(it.link || '') ? it.link : '';
    let aiBox = '';
    if (it.ai) {
      const al = it.aiLink || '';
      aiBox = `<div class="fb-ai"><span class="fb-ai-tag">✦ AI가 찾아봤어요</span><p>${esc(it.ai)}</p>${
        /^https?:\/\//.test(al) ? `<a class="fb-link" href="${esc(al)}" target="_blank" rel="noopener">자세히 · ${esc(hostOf(al))}</a>` : naverLink(al, true)}</div>`;
    } else if (FB.aiOn) aiBox = '<p class="fb-ai-wait">✦ AI가 곧 찾아볼게요</p>';
    return `<li class="fb-item">
      <p class="fb-meta"><b>${esc(it.name || '누군가')}</b>${showDay && it.day ? ` · ${esc(`${dom(it.day)}일`)}` : ''} · ${esc(ago(it.ts))}</p>
      <p class="fb-text">${esc(it.text)}</p>
      ${safeLink ? `<a class="fb-link" href="${esc(safeLink)}" target="_blank" rel="noopener">링크 열기 · ${esc(hostOf(safeLink))}</a>` : ''}
      ${aiBox}
    </li>`;
  }

  function fbFormHTML(day) {
    const me = savedName();
    const uid = `fb-${day}`;
    const daySelect = day === 'all' || day === 'home'
      ? `<label class="fb-label" for="${uid}-day">언제요?</label>
         <select id="${uid}-day" name="day" class="fb-input"><option value="">날짜 상관없음</option>${T.days.map((d) => `<option value="${d.date}">${esc(mdw(d.date))}</option>`).join('')}</select>`
      : '';
    return `<form class="fb-form" data-day="${day}">
      <p class="fb-label">누구예요?</p>
      <div class="fb-names">${T.people.filter((p) => p.id !== 'taeo').map((p) => `<label><input type="radio" name="name" value="${esc(p.name)}"${me === p.name ? ' checked' : ''}><span>${esc(p.name)}</span></label>`).join('')}</div>
      ${daySelect}
      <label class="fb-label" for="${uid}-text">${day === 'home' ? '무슨 이야기예요?' : '뭐 하고 싶어요?'}</label>
      <textarea id="${uid}-text" name="text" class="fb-input" maxlength="500" rows="3" required placeholder="${day === 'home' ? '예) 14일에 비 오면 실내로 바꿔요 / 15일 점심은 고기국수!' : '예) 카멜리아힐 가서 가족사진 찍고 싶어요'}"></textarea>
      <label class="fb-label" for="${uid}-link">참고 링크 <small>(선택)</small></label>
      <input id="${uid}-link" name="link" type="url" class="fb-input" placeholder="인스타 · 블로그 · 네이버 지도 주소">
      <input name="website" class="fb-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="fb-actions"><button type="submit" class="btn primary">올리기</button><button type="button" class="btn" data-fb-cancel>취소</button></div>
      <p class="fb-status" role="status"></p>
    </form>`;
  }

  function fbBlockHTML(day) {
    const list = (fbItems || []).filter((it) => day === 'all' || day === 'home' || it.day === day).slice(0, day === 'home' ? 3 : 999);
    const items = fbItems === null && FB.endpoint
      ? '<p class="fb-empty loading">의견 불러오는 중…</p>'
      : list.length
        ? `<ul class="fb-list">${list.map((it) => fbItemHTML(it, day === 'all' || day === 'home')).join('')}</ul>`
        : `<p class="fb-empty">${day === 'all' || day === 'home' ? '아직 의견이 없어요. 첫 의견을 남겨주세요!' : '이날 하고 싶은 게 있으면 남겨주세요.'}</p>`;
    return `${items}${fbOpen === day ? fbFormHTML(day) : `<button type="button" class="fb-open" data-fb-open="${day}">＋ 의견 남기기</button>`}`;
  }

  function fillFeedback() {
    view.querySelectorAll('.fb[data-fb-day]').forEach((el) => { el.innerHTML = fbBlockHTML(el.dataset.fbDay); });
  }

  async function loadFeedback() {
    if (!FB.endpoint) return;
    try {
      const res = await fetch(`${FB.endpoint}?t=${Date.now()}`);
      const data = await res.json();
      fbItems = (data.items || []).sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
    } catch (e) {
      fbItems = fbItems || [];
    }
    fillFeedback();
  }

  view.addEventListener('click', (e) => {
    const open = e.target.closest('[data-fb-open]');
    if (open) {
      fbOpen = open.dataset.fbOpen;
      fillFeedback();
      const ta = view.querySelector(`.fb-form[data-day="${fbOpen}"] textarea`);
      if (ta) ta.focus();
      return;
    }
    if (e.target.closest('[data-fb-cancel]')) { fbOpen = null; fillFeedback(); }
  });

  view.addEventListener('submit', async (e) => {
    const form = e.target.closest('.fb-form');
    if (!form) return;
    e.preventDefault();
    const fd = new FormData(form);
    const status = form.querySelector('.fb-status');
    const name = fd.get('name');
    const text = String(fd.get('text') || '').trim();
    const link = String(fd.get('link') || '').trim();
    if (!name) { status.textContent = '이름을 골라주세요.'; return; }
    if (!text) { status.textContent = '하고 싶은 걸 적어주세요.'; return; }
    if (link && !/^https?:\/\//.test(link)) { status.textContent = '링크는 http 로 시작하는 주소만 돼요.'; return; }
    saveName(name);
    if (!FB.endpoint) { status.textContent = '아직 의견 창구가 연결 전이에요. 민석이 곧 열어둘게요!'; return; }
    const day = ['all', 'home'].includes(form.dataset.day) ? String(fd.get('day') || '') : form.dataset.day;
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    status.textContent = '올리는 중…';
    try {
      const res = await fetch(FB.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ action: 'add', name, day, text, link, website: fd.get('website') || '' }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'fail');
      fbItems = [{ id: data.id, ts: new Date().toISOString(), name, day, text, link }].concat(fbItems || []);
      fbOpen = null;
      fillFeedback();
      toast(FB.aiOn ? '올렸어요! AI가 곧 확인해요' : '올렸어요!');
      loadFeedback();
    } catch (err) {
      btn.disabled = false;
      status.textContent = '올리지 못했어요. 인터넷 연결을 확인하고 다시 눌러주세요.';
    }
  });

  /* ---------- 사진 크게 보기 ---------- */
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.hidden = true;
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.innerHTML = '<button type="button" class="lb-close" aria-label="닫기">×</button><img alt=""><p class="lb-cap"></p>';
  document.body.appendChild(lb);
  function openLightbox(src, alt) {
    lb.querySelector('img').src = src;
    lb.querySelector('img').alt = alt || '';
    lb.querySelector('.lb-cap').textContent = alt || '';
    lb.hidden = false;
    document.documentElement.classList.add('lb-open');
    lb.querySelector('.lb-close').focus();
  }
  function closeLightbox() { lb.hidden = true; document.documentElement.classList.remove('lb-open'); }
  lb.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLightbox(); });

  /* ---------- 움직임: 등장 · 상단 바 · 토스트 · D-day ---------- */
  // 휴대폰의 '동작 줄이기' 설정과 상관없이 효과를 보여줌 (가족 요청)
  const reduceMotion = false;
  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(topbar);
  const TAB_TITLE = { home: T.shortTitle, plan: '일정', ideas: '가볼 곳 · 먹을 곳', pack: '준비물', info: '정보' };
  function updateTopbar() {
    const st = tripState();
    const right = st.phase === 'before' ? `D-${st.dday}` : st.phase === 'during' ? `${st.index + 1}일차` : '';
    topbar.innerHTML = `<b>${esc(TAB_TITLE[currentTab()])}</b><span>${esc(right)}</span>`;
  }
  window.addEventListener('scroll', () => { topbar.classList.toggle('show', window.scrollY > 140); }, { passive: true });

  const toastEl = document.createElement('div');
  toastEl.className = 'toast';
  toastEl.setAttribute('role', 'status');
  document.body.appendChild(toastEl);
  let toastTimer = null;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  function animateIn() {
    if (reduceMotion) return;
    view.classList.remove('view-in');
    [...view.children].forEach((el, i) => el.style.setProperty('--i', Math.min(i, 8)));
    void view.offsetWidth; // 애니메이션 다시 시작
    view.classList.add('view-in');
    const b = view.querySelector('.dday b');
    const m = b && /^D-(\d+)$/.exec(b.textContent);
    if (m) {
      const n = Number(m[1]);
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 700);
        b.textContent = `D-${Math.round(n * (1 - Math.pow(1 - k, 3)))}`;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }

  /* ---------- 스크롤 효과: 까딱까딱 태오 · 날아다니는 비행기 ---------- */
  const FRAMES = ['f0', 'f1', 'f2'];
  let flipStep = 0;
  let lastY = window.scrollY;
  let travelled = 0;
  let restTimer = null;

  // 초대 카드가 화면 밖으로 나가면 오른쪽 아래에서 따라다니는 작은 태오
  const buddy = document.createElement('button');
  buddy.type = 'button';
  buddy.className = 'buddy';
  buddy.setAttribute('aria-label', '맨 위로');
  if (T.hero && T.hero.photo) {
    buddy.innerHTML = `<span class="inv-flip f0" data-flip><img src="${esc(T.hero.photo)}" alt="" width="430" height="561"></span>`;
    document.body.appendChild(buddy);
    buddy.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  function setFrame(step) {
    document.querySelectorAll('[data-flip]').forEach((el) => {
      el.classList.remove(...FRAMES);
      el.classList.add(FRAMES[step % FRAMES.length]);
    });
  }

  const PLANE = '<path d="M21 11.2 13.6 9.4 9.9 3.5H8.1l1.9 5.4-5.2-.6-1.6-2.2H1.9l1 3.9-1 3.9h1.3l1.6-2.2 5.2-.6-1.9 5.4h1.8l3.7-5.9 7.4-1.8a.9.9 0 0 0 0-1.6z"/>';
  let sky = null;

  function buildSky() {
    sky = null;
    const host = view.querySelector('[data-sky]');
    if (!host || reduceMotion) return;
    const w = host.clientWidth;
    const h = host.clientHeight;
    const d = `M -40 ${h * 0.12} C ${w * 0.45} ${-h * 0.02}, ${w * 0.05} ${h * 0.42}, ${w * 0.5} ${h * 0.46} S ${w * 1.05} ${h * 0.7}, ${w * 0.62} ${h * 0.82} S ${w * 0.2} ${h * 0.98}, ${w + 40} ${h * 0.95}`;
    const d2 = `M ${w + 30} ${h * 0.05} C ${w * 0.7} ${h * 0.02}, ${w * 0.35} ${h * 0.09}, -30 ${h * 0.03}`;
    let svg = host.querySelector('.pl-sky');
    if (!svg) { svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'pl-sky'); svg.setAttribute('aria-hidden', 'true'); host.appendChild(svg); }
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.innerHTML = `<defs><mask id="sky-mask"><path class="sky-reveal" d="${d}" fill="none" stroke="#fff" stroke-width="8"/></mask></defs>
      <path class="sky-trail" d="${d}" mask="url(#sky-mask)"/>
      <g class="sky-plane big"><g transform="translate(-14 -14) scale(1.2)">${PLANE}</g></g>
      <path class="sky-path2" d="${d2}" fill="none" stroke="none"/>
      <g class="sky-plane small"><g transform="translate(-9 -9) scale(.75) translate(24 0) scale(-1 1)">${PLANE}</g></g>`;
    const main = svg.querySelector('.sky-reveal');
    sky = { host, svg, main, len: main.getTotalLength(), p2: svg.querySelector('.sky-path2'), big: svg.querySelector('.sky-plane.big'), small: svg.querySelector('.sky-plane.small') };
    sky.len2 = sky.p2.getTotalLength();
    main.style.strokeDasharray = `${sky.len} ${sky.len}`;
    drawSky();
  }

  function planeAt(path, len, t) {
    const a = path.getPointAtLength(Math.max(0, Math.min(len, len * t)));
    const b = path.getPointAtLength(Math.max(0, Math.min(len, len * t + 1)));
    return { x: a.x, y: a.y, deg: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI };
  }

  function drawSky() {
    if (!sky || !sky.host.isConnected) return;
    const r = sky.host.getBoundingClientRect();
    const vh = window.innerHeight;
    const t = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
    const eased = t * t * (3 - 2 * t);
    const p = planeAt(sky.main, sky.len, eased);
    sky.big.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${p.deg})`);
    sky.main.style.strokeDashoffset = String(sky.len * (1 - eased));
    const q = planeAt(sky.p2, sky.len2, Math.min(1, t * 1.6));
    sky.small.setAttribute('transform', `translate(${q.x} ${q.y})`);
  }

  function onScroll() {
    const y = window.scrollY;
    travelled += Math.abs(y - lastY);
    lastY = y;
    if (!reduceMotion && travelled > 70) {
      travelled = 0;
      flipStep += 1;
      setFrame(flipStep);
      clearTimeout(restTimer);
      restTimer = setTimeout(() => { flipStep = 0; setFrame(0); }, 450);
    }
    const inv = view.querySelector('.invite');
    const heroGone = !inv || inv.getBoundingClientRect().bottom < 40;
    buddy.classList.toggle('show', heroGone && y > 120);
    drawSky();
  }
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', () => buildSky());
  document.addEventListener('focusin', (e) => { if (e.target.matches('input, textarea, select')) buddy.classList.add('typing'); });
  document.addEventListener('focusout', () => buddy.classList.remove('typing'));

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
    initMaps();
    fillFeedback();
    fillWeather();
    updateTopbar();
    animateIn();
    if (view.querySelector('[data-share]')) loadKakaoShare();
    requestAnimationFrame(() => { buildSky(); onScroll(); });
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
  loadFeedback();
  loadWeather();
})();
