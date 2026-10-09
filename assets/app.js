/* 2026 가을 제주 가족여행 — 화면 그리기.
   여행 내용은 data/trip.js 한 곳에서만 고칩니다. 이 파일은 그 내용을 화면으로 옮기기만 해요. */
(() => {
  'use strict';

  const T = window.TRIP;
  const view = document.getElementById('view');
  const foot = document.getElementById('foot');
  const tabLinks = document.querySelectorAll('.tabbar a');

  const TABS = ['home', 'plan', 'ideas', 'album', 'info', 'pack', 'guide', 'recap']; // pack · guide · recap 은 탭바 없이 링크로만
  const WD = ['일', '월', '화', '수', '목', '금', '토'];
  const STATUS = { ok: '확정', plan: '예정', tbd: '미정', idea: '후보' };
  const PACK_KEY = 'jeju2026.packing.v1';

  /* ---------- 작은 도구 ---------- */
  // 가운뎃점(·)이 줄 맨 앞으로 넘어가지 않게 앞 단어에 붙임 (A · B → A\u00A0· B)
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  )).replace(/ · /g, '\u00A0· ');
  const toDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  // 테스트용: 주소 끝에 ?now=2026-10-13T11:40 을 붙이면 그 시각인 것처럼 보여줌
  const NOW_AT = (() => { const m = /[?&]now=([\dT:-]+)/.exec(location.search); const d = m ? new Date(m[1]) : null; return d && !Number.isNaN(d.getTime()) ? d : null; })();
  const LOADED = Date.now();
  const nowDate = () => (NOW_AT ? new Date(NOW_AT.getTime() + (Date.now() - LOADED)) : new Date());
  const today = () => { const n = nowDate(); return new Date(n.getFullYear(), n.getMonth(), n.getDate()); };
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

  // 카드 오른쪽에 붙는 작은 지도 단추 (내용이 아래로 밀리지 않게)
  function naverSide(q) {
    if (!q) return '';
    return `<a class="naver side" href="https://map.naver.com/p/search/${encodeURIComponent(q)}" target="_blank" rel="noopener" aria-label="${esc(q)} 네이버 지도">${ICON.pin}<span>지도</span></a>`;
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
  // 누가 가는지: 전원이면 생략, 아니면 짧은 꼬리표 (태오네 · 후발대 · 이름)
  function whoTag(who, present) {
    if (!who || who === 'all') return '';
    if (present && present.length === 1 && present[0] === who) return ''; // 그날 그 무리만 있으면 굳이 안 적음
    const g = typeof who === 'string' && T.groups.find((x) => x.id === who);
    const label = g ? (who === 'a' ? '태오네' : who === 'b' ? '후발대' : g.name) : membersOf(who).map((p) => p.name).join('·');
    return `<span class="wtag ${typeof who === 'string' ? esc(who) : 'p'}">${esc(label)}</span>`;
  }
  const norm = (x) => String(x || '').replace(/[\s·()]/g, '');
  function daySlots(day) {
    const items = (day.items || []).map((it) => ({ ...it }));
    const used = new Set();
    (day.blocks || []).filter((b) => b[4] === 'tbd').forEach((b) => {
      const [start, end, label, kind] = b;
      const k = items.findIndex((it, j) => !used.has(j) && it.status === 'tbd'
        && (it.time === start || norm(it.title).includes(norm(label)) || norm(label).includes(norm(it.title))));
      const slot = { start, end, label, kind };
      if (k >= 0) { used.add(k); items[k].slot = slot; return; }
      const at = items.findIndex((it) => it.time && it.time > start);
      const row = { time: start, title: label, status: 'tbd', slot, synthetic: true };
      if (at < 0) items.push(row); else items.splice(at, 0, row);
    });
    return items;
  }
  // 이 빈 시간에 들어온 제안 (📍 장소 제안 · 시간이 같은 의견)
  function slotSuggestHTML(date, S) {
    const list = (fbItems || []).filter((x) => x.day === date && String(x.text).includes(`${S.start}~${S.end}`));
    if (!list.length) return '';
    return `<ul class="slot-sug">${list.map((x) => {
      const m = String(x.text).match(/^📍\s*([^·\n]+)/);
      const what = m ? m[1].trim() : String(x.text).replace(/^\d+일 [\d:~]+ \([^)]*\):\s*/, '').slice(0, 40);
      return `<li><span class="ss-n">${esc(x.name || '가족')}</span><b>${esc(what)}</b>${x.link ? `<a href="${esc(/naver/.test(x.link) ? x.link : naverOf(what))}" target="_blank" rel="noopener">지도</a>` : ''}${x.ai ? '<em>AI 답 ✓</em>' : ''}</li>`;
    }).join('')}</ul>`;
  }
  function slotRowHTML(it, day) {
    const S = it.slot;
    const meal = S.kind === 'meal';
    const poll = (T.polls || []).find((p) => p.day === day.date && (meal ? p.kind !== 'course' : p.kind === 'course') && today() <= toDate(p.closes));
    const label = it.synthetic ? `${S.label.replace(/\s*\(미정\)|\s*미정/g, '')} · 아직 비어 있어요` : it.title;
    return `<li class="item s-tbd slot">
      <span class="time is-set">${esc(S.start)}</span>
      <div class="what">
        <div class="slot-box">
          <p class="slot-t"><span class="slot-badge">빈 시간</span>${esc(S.start)}–${esc(S.end)}</p>
          <p class="title">${esc(label)}</p>
          ${it.note ? `<p class="note">${esc(it.note)}</p>` : ''}
          <div class="slot-acts">
            ${poll ? `<a class="slot-btn vote" href="#ideas" data-goto="polls">${poll.kind === 'course' ? ICON.route : ICON.meal}<span>투표하러 가기</span></a>` : ''}
            <button type="button" class="slot-btn find" data-place-find="${esc(day.date)}|${esc(S.start)}|${esc(S.end)}|${esc(S.label)}|${esc(S.kind)}">🔍 ${meal ? '먹을 곳' : '갈 곳'} 찾아서 제안</button>
            <button type="button" class="slot-btn ghost" data-slot="${esc(day.date)}|${esc(S.start)}|${esc(S.end)}|${esc(S.label)}">글로 남기기</button>
          </div>
          ${slotSuggestHTML(day.date, S)}
        </div>
      </div>
    </li>`;
  }
  function blockAt(day, time) {
    if (!time) return -1;
    return (day.blocks || []).findIndex((b) => b[0] <= time && time < b[1]);
  }
  function itemHTML(it, present, blk) {
    const hasTime = Boolean(it.time);
    const status = it.status || 'ok';
    const note = it.note || '';
    const long = note.length > 38;
    return `<li class="item s-${status}${long ? ' has-more' : ''}"${long ? ' data-item-more' : ''}>
      <span class="time${hasTime ? ' is-set' : ''}">${esc(it.time || it.when || '미정')}</span>
      <div class="what">
        <div class="row-head"><div>
          <p class="title">${esc(it.title)}${status !== 'ok' ? ` ${pill(status)}` : ''}${whoTag(it.who, present)}</p>
          ${note ? `<p class="note">${esc(note)}</p>${long ? '<span class="note-more" aria-hidden="true">더보기</span>' : ''}` : ''}
        </div>${it.place ? naverSide(it.place) : ''}</div>
        ${blk ? `<button type="button" class="it-rx" data-blk="${blk}">반응 · 의견<i class="pb-badge" data-blk-badge="${blk}"></i></button>` : ''}
        ${photoOf(it.photo) ? `<figure class="item-photo"><img src="${esc(photoOf(it.photo).src)}" alt="${esc(photoOf(it.photo).alt || it.title)}" loading="lazy"></figure>` : ''}
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
    const present = T.groups.filter((g) => day.date >= g.arrive.date && day.date <= g.depart.date).map((g) => g.id);
    const rows = daySlots(day);
    return `<article class="day dayx${isToday ? ' is-today' : ''}" id="day-${day.date}" style="--dc:var(--d${i + 1})">
      <div class="day-body">
        <p class="dx-date"><b>${md(day.date)}</b> ${wd(day.date)}요일 <span class="dx-n">DAY ${i + 1}</span>${isToday ? '<span class="stub-today">오늘</span>' : ''}</p>
        <h2 class="day-title">${esc(day.title)}</h2>
        <div class="dx-meta">
          <button type="button" class="day-wx" data-wx-open="${day.date}" data-wx-chip="${day.date}" aria-label="${esc(mdw(day.date))} 자세한 날씨">${wxChipHTML(day.date)}</button>
          ${hasRoute ? `<button class="route-btn" type="button" data-show-day="${i}">${ICON.route}<span>동선 지도</span></button>` : ''}
        </div>
        <p class="day-who" aria-label="이날 제주에 있는 사람">${dayWhoHTML(day.date)}</p>
        ${rows.length ? `<ol class="items">${rows.map((it) => { if (it.slot) return slotRowHTML(it, day); const bk = blockAt(day, it.time); return itemHTML(it, present, bk >= 0 ? `${i}|${bk}` : ''); }).join('')}</ol>` : ''}
        ${day.open && !rows.some((r) => r.slot) ? `<p class="empty-slot">${esc(day.open)}</p>` : ''}
        ${pollDayHTML(day)}
        <div class="fb" data-fb-day="${day.date}"></div>
        ${rainBoxHTML(day)}
        ${babyDayHTML(day)}
        ${night
          ? `<p class="night">${ICON.moon}<span>숙박 · <b>${esc(night.name)}</b></span></p>`
          : `<p class="night">${ICON.plane}<span>${esc(day.nightNote || '집으로')}</span></p>`}
      </div>
    </article>`;
  }

  /* ---------- 화면마다 인사하는 태오 스티커 ---------- */
  const taeoSrc = (s) => `assets/photos/taeo/${s.img}.webp`;
  // 화면마다 사진이 여러 장이면 열 때마다 한 장 (누르면 다음 장)
  const taeoList = (key) => [].concat((T.taeo && T.taeo[key]) || []);
  const taeoPick = (key) => { const L = taeoList(key); return L.length ? L[Math.floor(Math.random() * L.length)] : null; };
  const sayOf = (s, not) => { const L = s.says || []; if (L.length < 2) return L[0] || ''; let x; do { x = L[Math.floor(Math.random() * L.length)]; } while (x === not); return x; };
  function peekHTML(key) {
    const L = taeoList(key);
    if (!L.length) return '';
    const i = Math.floor(Math.random() * L.length);
    const s = L[i];
    return `<figure class="tpeek tp-${esc(key)}" data-tpeek="${esc(key)}" data-ti="${i}">
          <p class="tp-b" aria-live="polite">${esc(sayOf(s))}</p>
          <img src="${esc(taeoSrc(s))}" alt="${esc(s.alt || '태오')}" width="${s.w}" height="${s.h}">
        </figure>`;
  }

  /* ---------- 홈 ---------- */
  // 태오 말풍선: 열 때마다 하나씩 랜덤 (방금 나온 건 피함), 태오를 누르면 다음 말
  let lastBubble = -1;
  // 낮에는 여러 장 중 하나 (열 때마다 지난번과 다른 사진, 누르면 다음 사진)
  // 밤에는 자는 태오, 여행이 끝나면 번쩍 안긴 태오
  const HERO_KEY = 'jeju2026.heroLast';
  const dayLooks = (() => {
    const H = T.hero || {};
    return [{ photo: H.photo, w: 600, h: 736, alt: H.alt, bubbles: H.bubbles || [H.bubble] }].concat(H.looks || []).filter((x) => x.photo);
  })();
  let heroIdx = (() => {
    if (dayLooks.length < 2) return 0;
    let last = -1;
    try { last = Number(localStorage.getItem(HERO_KEY) ?? -1); } catch (e) { /* 무시 */ }
    let i;
    do { i = Math.floor(Math.random() * dayLooks.length); } while (i === last);
    try { localStorage.setItem(HERO_KEY, String(i)); } catch (e) { /* 무시 */ }
    return i;
  })();
  function heroLook() {
    const H = T.hero || {};
    if (H.after && tripState().phase === 'after') return H.after;
    const h = nowDate().getHours();
    if (H.night && (h >= H.night.from || h < H.night.to)) return H.night;
    return { ...dayLooks[heroIdx], day: true };
  }
  // 사진마다 실제 보이는 높이가 달라서, 말풍선을 태오 머리 바로 위에 붙임
  function placeBubble() {
    const fig = view.querySelector('.inv-photo');
    const img = fig && fig.querySelector('[data-hero-img]');
    const b = fig && fig.querySelector('[data-bubble]');
    if (!img || !b) return;
    const w = Number(img.getAttribute('width')) || 1;
    const h = Number(img.getAttribute('height')) || 1;
    const shown = Math.min(img.clientHeight, (img.clientWidth * h) / w);
    const top = img.parentElement.offsetTop + img.offsetTop + img.clientHeight - shown - b.offsetHeight + 4;
    b.style.top = `${Math.max(0, Math.round(top))}px`;
  }
  window.addEventListener('resize', () => placeBubble());
  function pickBubble() {
    const look = heroLook();
    const who = T.people.find((p) => p.name === savedName());
    // 고른 사람이 있으면 가끔 그 사람을 불러줌 (할머니 보고 싶어요!)
    if (look.day && who && who.call && Math.random() < 0.4 && lastBubble !== -2) { lastBubble = -2; return `${who.call} 보고 싶어요!`; }
    const list = look.bubbles || [''];
    if (list.length < 2) return list[0] || '';
    let i;
    do { i = Math.floor(Math.random() * list.length); } while (i === lastBubble);
    lastBubble = i;
    return list[i];
  }

  function heroHTML(st) {
    const H = T.hero || {};
    const look = heroLook();
    let big;
    let small;
    if (st.phase === 'before') { big = `D-${st.dday}`; small = '출발까지'; }
    else if (st.phase === 'during') {
      big = st.index === 0 ? 'D-DAY' : `${st.index + 1}일차`;
      small = st.index === 0 ? '드디어 출발!' : `${dates.length}일 중`;
    } else { big = '다녀왔어요'; small = '모두 수고했어요'; }
    const nights = dates.length - 1;
    return `<section class="invite" aria-label="여행 초대">
      <p class="dday inv-dday${st.phase === 'after' ? ' long' : ''}"><span>${esc(small)}</span><b>${esc(big)}</b></p>
      <div class="inv-text">
        <p class="inv-eyebrow">${esc(H.eyebrow || T.eyebrow)}</p>
        <h1 class="inv-title">${esc(H.title || T.shortTitle)}</h1>
        <p class="inv-dates">${md(T.start)}(${wd(T.start)}) – ${md(T.end)}(${wd(T.end)})</p>
        <p class="inv-note">${esc(H.note || `${nights}박 ${dates.length}일 · ${T.tagline}`)}</p>
        ${T.share ? (st.phase === 'after' && T.recap ? `<button type="button" class="kakao-share" data-share="recap">${ICON.talk}<span>추억 카톡으로 보내기</span></button>` : `<button type="button" class="kakao-share" data-share>${ICON.talk}<span>카톡으로 초대하기</span></button>`) : ''}
      </div>
      ${look && look.photo ? `<figure class="inv-photo${look.edge ? ` edge-${esc(look.edge)}` : ''}">
        <p class="inv-bubble" data-bubble aria-live="polite">${esc(pickBubble())}</p>
        <span class="inv-flip f0" data-flip><img data-hero-img src="${esc(look.photo)}" alt="${esc(look.alt || '')}" width="${look.w}" height="${look.h}" fetchpriority="high"></span>
      </figure>` : ICON.mandarin}
    </section>`;
  }

  /* ---------- 날씨 (Open-Meteo 예보, 못 받으면 평년값) ---------- */
  const WX_KEY = 'jeju2026.wx.v2';
  let wxDays = null;
  let wxHours = null; // 날짜별 3시간 간격 예보 [시, 기온, 비%, 날씨코드, 바람 m/s]
  try { const c = JSON.parse(localStorage.getItem(WX_KEY)); if (c && c.days) { wxDays = c.days; wxHours = c.hours || null; } } catch (e) { /* 무시 */ }
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
    if (d) return { type: wxType(d.code), max: Math.round(d.max), min: Math.round(d.min), pop: d.pop, wind: d.wind != null ? Math.round(d.wind) : null, normal: false };
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
    view.querySelectorAll('[data-rain]').forEach((el) => { const d = T.days.find((x) => x.date === el.dataset.rain); if (d) el.outerHTML = rainBoxHTML(d); });
  }
  function wxListHTML() {
    return T.days.map((d) => { const w = wxOf(d.date); return `<li data-wx-open="${d.date}" role="button" tabindex="0"><span class="wl-d">${esc(mdw(d.date))}</span><span class="wl-i">${WX_ICON[w.type]}</span><span class="wl-l">${w.normal ? '평년' : WX_LABEL[w.type]}</span><span class="wl-t">${w.max}° / ${w.min}°</span><span class="wl-p">${w.pop != null ? `비 ${w.pop}%` : ''}</span></li>`; }).join('');
  }
  async function loadWeather() {
    try {
      const c = JSON.parse(localStorage.getItem(WX_KEY) || 'null');
      if (c && Date.now() - c.at < 3 * 3600e3) return;
    } catch (e) { /* 무시 */ }
    const { lat, lon } = T.weather.point;
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m&wind_speed_unit=ms&timezone=Asia%2FSeoul&forecast_days=16`);
      const j = await res.json();
      const D = j.daily;
      const days = {};
      D.time.forEach((t, i) => { if (dates.includes(t) && D.temperature_2m_max[i] != null) days[t] = { code: D.weather_code[i], max: D.temperature_2m_max[i], min: D.temperature_2m_min[i], pop: D.precipitation_probability_max[i], wind: D.wind_speed_10m_max ? D.wind_speed_10m_max[i] : null }; });
      const hours = {};
      const H = j.hourly || { time: [] };
      H.time.forEach((t, i) => {
        const [d, hh] = t.split('T');
        const h = Number(hh.slice(0, 2));
        if (!dates.includes(d) || h % 3 || h < 6 || H.temperature_2m[i] == null) return;
        (hours[d] = hours[d] || []).push([h, Math.round(H.temperature_2m[i]), H.precipitation_probability[i], H.weather_code[i], H.wind_speed_10m[i] != null ? Math.round(H.wind_speed_10m[i]) : null]);
      });
      if (Object.keys(days).length) {
        wxDays = days;
        wxHours = hours;
        try { localStorage.setItem(WX_KEY, JSON.stringify({ at: Date.now(), days, hours })); } catch (e) { /* 무시 */ }
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
        return `<button type="button" class="${cls}" data-blk="${i}|${bk}" style="--c:${i};--k:${bk};top:calc(${at(toH(a))}% + 1.5px);height:calc(${((len / span) * 100).toFixed(2)}% - 3px)${ph ? `;--ph:url('${esc(new URL(ph.src, document.baseURI).href)}');--pp:${esc(ph.pos || 'center')}` : ''}" aria-label="${esc(`${mdw(day.date)} ${a}–${b} ${label} 자세히 · 반응 · 의견`)}">${len >= 1.5 && !tbd ? kindIcon(kind) : ''}<b>${esc(label)}</b>${len >= 1.8 && !tbd && kind !== 'rest' ? `<small>${esc(a)}</small>` : ''}<i class="pb-badge" data-blk-badge="${i}|${bk}"></i></button>`;
      }).join('');
      let now = '';
      if (isToday) {
        const d = new Date();
        const h = d.getHours() + d.getMinutes() / 60;
        if (h >= P.from && h <= P.to) now = `<span class="pl-now" style="top:${at(h)}%"></span>`;
      }
      const night = day.night ? stays.get(day.night).short : '집';
      return `<div class="pl-col${isToday ? ' is-today' : ''}${weekend ? ' is-weekend' : ''}">
        <a class="pl-head" href="#plan" data-goto="day-${day.date}" aria-label="${esc(`${mdw(day.date)} ${day.title} 일정 보기`)}"><span class="pl-wd">${wd(day.date)}</span><b>${dom(day.date)}</b><span class="pl-wx" data-wx="${day.date}" data-wx-open="${day.date}" role="button" aria-label="${esc(mdw(day.date))} 자세한 날씨">${wxMiniHTML(day.date)}</span></a>
        <span class="pl-body">${blocks}${now}</span>
        <span class="pl-night">${esc(night)}</span>
      </div>`;
    }).join('');

    return `<section class="block">
      <div class="h-row"><h2 class="h">6일 시간표</h2><span class="count">칸을 누르면 자세히 · 반응 · 의견</span></div>
      <div class="card planner-card" data-sky>
        <div class="planner" style="--hours:${span}">
          <div class="pl-axis" aria-hidden="true">
            <span class="pl-head"></span>
            <span class="pl-body">${ticks.map((h) => `<i style="top:${at(h)}%">${String(h).padStart(2, '0')}</i>`).join('')}</span>
            <span class="pl-night"></span>
          </div>
          ${cols}
        </div>

      </div>
    </section>`;
  }

  function bookingsHTML() {
    const rows = T.bookings.map((b) => `<li class="card booking">
      <span class="booking-icon${b.accent ? ' t' : ''}">${ICON[b.icon] || ''}</span>
      <div class="row-head"><div>
        <h3>${esc(b.title)} ${pill(b.status)}</h3>
        <p class="meta">${esc(b.meta)}</p>
      </div>${naverSide(b.q)}</div>
    </li>`).join('');
    return `<section class="block" id="i-fixed">
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
      <div class="h-row"><h2 class="h">민석 할 일</h2><span class="count">${done} / ${T.todo.length}</span></div>
      <details class="card more-card"><summary>${T.todo.length - done}개 남았어요 · 눌러서 보기</summary><ul class="todo">${rows}</ul></details>
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
  const isDark = () => false; // 다크모드는 쓰지 않아요 (늘 밝은 화면)

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

  function routeMapHTML(key, title, foldable) {
    const sel = mapSel[key];
    const chips = [`<button type="button" class="mchip" data-map-key="${key}" data-map-day="all" aria-pressed="${sel === 'all'}">전체</button>`]
      .concat(T.days.map((d, i) => `<button type="button" class="mchip" data-map-key="${key}" data-map-day="${i}" aria-pressed="${String(sel) === String(i)}" style="--dc:var(--d${i + 1})"><i></i>${dom(d.date)}<span class="mchip-u">일</span></button>`))
      .join('');
    return `<section class="block" id="map-${key}">
      ${foldable ? `<div class="h-row"><h2 class="h">${esc(title)}</h2><button type="button" class="h-fold" data-map-close>접기<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 15 6-6 6 6"/></svg></button></div>` : `<h2 class="h">${esc(title)}</h2>`}
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
        sc.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(T.map.kakaoKey)}&autoload=false&libraries=services`;
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

  const JEJU_BOX = [[33.05, 125.95], [33.7, 127.0]]; // 남서쪽 · 북동쪽 끝 (마라도 ~ 우도 조금 바깥)
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
        // 제주도 밖으로는 안 나가게: 더 멀리 축소 못 하고, 중심이 섬 밖으로 나가면 되돌림
        map.setMaxLevel(10);
        K.event.addListener(map, 'idle', () => {
          const c = map.getCenter();
          const lat = Math.min(JEJU_BOX[1][0], Math.max(JEJU_BOX[0][0], c.getLat()));
          const lon = Math.min(JEJU_BOX[1][1], Math.max(JEJU_BOX[0][1], c.getLng()));
          if (lat !== c.getLat() || lon !== c.getLng()) map.panTo(new K.LatLng(lat, lon));
        });
        if (touch) {
          map.setDraggable(false);
          K.event.addListener(map, 'click', () => { map.setDraggable(true); box.classList.add('map-active'); });
        } else box.classList.add('map-active');
        box.classList.add('kakao-map');
        maps[key] = { kind: 'kakao', map, items: [] };
      } else {
        const L = window.L;
        if (!L || !el) { box.classList.add('no-map'); return; }
        // 제주도 밖으로는 안 나가게 (섬 전체가 보이는 정도까지만 축소)
        const map = L.map(el, { scrollWheelZoom: false, dragging: !touch, tap: false, zoomControl: true, attributionControl: true, minZoom: 9, maxBounds: JEJU_BOX, maxBoundsViscosity: 1 });
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
        <p class="voice-lead">뭐든 남기면 <b>AI가 한 시간 안에</b> 답하거나 일정에 넣어요.</p>
        <button type="button" class="place-cta" data-place-find=""><span aria-hidden="true">🔍</span><span><b>장소 찾아서 제안하기</b><small>가고 싶은 곳을 검색해서 골라요</small></span></button>
        <div class="fb" data-fb-day="home"></div>
      </div>
    </section>`;
  }

  function updatesHTML() {
    const list = T.updates || [];
    if (!list.length) return '';
    const li = (u) => `<li><span class="u-d">${esc(md(u.date))}</span><span class="u-t">${esc(u.text)}${u.by ? `<small>${esc(u.by)}</small>` : ''}</span></li>`;
    const rest = list.slice(2, 12);
    return `<section class="block" id="i-news">
      <h2 class="h">업데이트 소식</h2>
      <div class="card updates-card">
        <ol class="updates">${list.slice(0, 2).map(li).join('')}</ol>
        ${rest.length ? `<details class="more"><summary><span>지난 소식 ${rest.length}개 더 보기</span><span>접기</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><ol class="updates">${rest.map(li).join('')}</ol></details>` : ''}
      </div>
    </section>`;
  }

  // 홈 동선 지도: 처음엔 접어두고, 펼칠 때 지도를 그림
  let homeMapOpen = false;
  function homeMapHTML() {
    if (homeMapOpen) return routeMapHTML('home', '동선 지도', true);
    return `<section class="block" id="map-home">
      <h2 class="h">동선 지도</h2>
      <button type="button" class="card map-teaser" data-map-open>
        <span class="mt-ic">${ICON.route}</span>
        <span class="mt-t"><b>날짜별 동선 지도 펼치기</b><small>${T.days.length}일 동선을 실제 도로 위에 시간 순서대로</small></span>
        <svg class="mt-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
      </button>
    </section>`;
  }

  function renderHome() {
    const st = tripState();
    // 홈은 꼭 필요한 것만: 초대장 · 내 일정 · 바로가기 · 챙길 것 · 시간표 · 의견함 (나머지는 정보 탭으로)
    return meBarHTML() + heroHTML(st) + recapCardHTML(st) + (me() ? myCardHTML(st) : nowHTML(st)) + todayPhotoHTML(st) + quickHTML(st) + checkHTML(st) + plannerHTML(st) + homeVoiceHTML();
  }

  /* ---------- 일정 ---------- */
  function renderPlan() {
    const st = tripState();
    const undated = T.undated.map((u) => `<li class="card undated">
      <div class="row-head"><h3>${esc(u.title)} ${pill(u.status)}</h3>${naverSide(u.q)}</div>
      <p class="note">${esc(whoText(u.who))}${u.note ? ` · ${esc(u.note)}` : ''}</p>
    </li>`).join('');

    // 홈에서 날짜를 눌러 들어오면 그 날을 보여줌
    if (pendingGoto && pendingGoto.startsWith('day-')) {
      const k = T.days.findIndex((d) => `day-${d.date}` === pendingGoto);
      if (k >= 0) planDay = k;
    }
    if (planDay == null) planDay = st.phase === 'during' ? st.index : 0;
    return `<section class="block">
        ${peekHTML('plan')}
        <h1 class="page-title">일정</h1>
        <p class="lede">날짜를 누르면 그날 일정이 나와요. 옆으로 밀어도 넘어가요.</p>
      </section>
      ${planTabsHTML(st)}
      <section class="block plan-panel" data-plan-panel>${planPanelHTML(planDay, st)}</section>
      ${routeMapHTML('plan', '동선 지도')}
      ${undated ? `<section class="block">
        <h2 class="h">날짜만 정하면 돼요</h2>
        <ul class="stack">${undated}</ul>
      </section>` : ''}
      <section class="block"><a class="btn-link" href="#ideas">가볼 곳 · 먹을 곳 후보 보기</a></section>`;
  }
  let planDay = null;
  function planTabsHTML(st) {
    return `<nav class="dtabs" role="tablist" aria-label="날짜 고르기">${T.days.map((d, k) => {
      const today = st.phase === 'during' && st.index === k;
      return `<button type="button" role="tab" class="dtab${k === planDay ? ' on' : ''}${today ? ' today' : ''}" data-plan-day="${k}" aria-selected="${k === planDay}" style="--dc:var(--d${k + 1})">
        <span class="dt-d">${dom(d.date)}</span><span class="dt-w">${wd(d.date)}</span>${today ? '<i>오늘</i>' : ''}
      </button>`;
    }).join('')}</nav>`;
  }
  function planPanelHTML(k, st) {
    const prev = T.days[k - 1];
    const next = T.days[k + 1];
    return `${dayHTML(T.days[k], k, st)}
      <div class="dnav">
        ${prev ? `<button type="button" class="dnav-b" data-plan-day="${k - 1}">← ${dom(prev.date)}일 (${wd(prev.date)})</button>` : '<span></span>'}
        ${next ? `<button type="button" class="dnav-b next" data-plan-day="${k + 1}">${dom(next.date)}일 (${wd(next.date)}) →</button>` : '<span></span>'}
      </div>`;
  }
  function showPlanDay(k, fromSwipe) {
    if (k < 0 || k >= T.days.length || k === planDay) return;
    const dir = k > planDay ? 1 : -1;
    planDay = k;
    const panel = view.querySelector('[data-plan-panel]');
    if (!panel) return;
    panel.innerHTML = planPanelHTML(k, tripState());
    view.querySelectorAll('.dtab').forEach((b) => {
      const on = Number(b.dataset.planDay) === k;
      b.classList.toggle('on', on);
      b.setAttribute('aria-selected', String(on));
      if (on) b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    });
    if (!reduceMotion) { panel.style.setProperty('--dir', dir); panel.classList.remove('slide'); void panel.offsetWidth; panel.classList.add('slide'); }
    fillFeedback();
    fillPolls();
    fillWeather();
    fillBlockBadges();
    if (view.querySelector('.route-map[data-map="plan"]')) selectMapDay('plan', String(k), false);
    // 아래로 내려가 있었으면 날짜 탭이 보이게 위로
    const tabs = view.querySelector('.dtabs');
    if (tabs && (fromSwipe || panel.getBoundingClientRect().top < 0)) {
      const y = tabs.getBoundingClientRect().top + window.scrollY - 64;
      if (window.scrollY > y) window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }
  // 옆으로 밀어서 다음 날 / 전날
  let swipe = null;
  view.addEventListener('touchstart', (e) => {
    const p = e.target.closest('[data-plan-panel]');
    if (!p || e.touches.length !== 1 || e.target.closest('.route-map, input, textarea')) { swipe = null; return; }
    swipe = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
  }, { passive: true });
  view.addEventListener('touchend', (e) => {
    if (!swipe) return;
    const dx = e.changedTouches[0].clientX - swipe.x;
    const dy = e.changedTouches[0].clientY - swipe.y;
    const quick = Date.now() - swipe.t < 700;
    swipe = null;
    if (quick && Math.abs(dx) > 70 && Math.abs(dy) < Math.abs(dx) * 0.5) showPlanDay(planDay + (dx < 0 ? 1 : -1), true);
  }, { passive: true });

  // 긴 화면 위에 붙는 '바로 가기' 칩 (같은 화면 안에서 이동)
  const jumpHTML = (items) => `<nav class="jumps" aria-label="바로 가기">${items.map(([id, label]) => `<a href="#${id}" data-jump="${esc(id)}">${esc(label)}</a>`).join('')}</nav>`;
  view.addEventListener('click', (e) => {
    const j = e.target.closest('[data-jump]');
    if (!j) return;
    e.preventDefault();
    const el = document.getElementById(j.dataset.jump);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

  /* ---------- 후보 ---------- */
  function renderIdeas() {
    const ideaCard = (x) => `<li class="card idea">
      <div class="row-head"><h3>${esc(x.name)}</h3>${naverSide(x.q || x.name)}</div>
      <p>${esc(x.desc)}</p>
      <div class="tags">${(x.tags || []).map((t) => `<span class="tag ${t.kind || ''}">${esc(t.text)}</span>`).join('')}</div>
    </li>`;
    return `<section class="block">
        ${peekHTML('ideas')}
        <h1 class="page-title">가볼 곳 · 먹을 곳</h1>
        <p class="lede">${esc(T.ideasNote)}</p>
      </section>
      ${jumpHTML([...((T.polls || []).length ? [['polls', '가족 투표']] : []), ['voices', '가족 의견'], ...(T.ideaGroups || []).map((g, i) => [`ideas-${i}`, g.title]), ...(T.rainPlan ? [['rain', '비 오는 날']] : [])])}
      ${pollsSectionHTML()}
      <section class="block" id="voices">
        <h2 class="h">가족 의견</h2>
        <p class="lede">하고 싶은 거, 먹고 싶은 거 아무거나 남겨주세요. 링크도 붙일 수 있어요.</p>
        <button type="button" class="place-cta" data-place-find=""><span aria-hidden="true">🔍</span><span><b>장소 찾아서 제안하기</b><small>검색해서 고르면 비어 있는 시간에 바로 제안돼요</small></span></button>
        <div class="card fb fb-all" data-fb-day="all"></div>
      </section>
      ${(T.ideaGroups || []).map((g, i) => `<section class="block" id="ideas-${i}">
        <h2 class="h">${esc(g.title)}</h2>
        <ul class="ideas">${g.items.map(ideaCard).join('')}</ul>
      </section>`).join('')}
      ${T.rainPlan ? `<section class="block" id="rain">
        <h2 class="h">비 오는 날 (실내)</h2>
        <p class="lede">${esc(T.rainPlan.note)}</p>
        <ul class="ideas">${T.rainPlan.items.map((x) => ideaCard({ ...x, tags: rainTags(x) })).join('')}</ul>
      </section>` : ''}`;
  }

  /* ---------- 준비물 (체크 표시는 이 기기에만 저장) ---------- */
  function loadPack() {
    try { return JSON.parse(localStorage.getItem(PACK_KEY)) || {}; } catch (e) { return {}; }
  }
  function savePack(state) {
    try { localStorage.setItem(PACK_KEY, JSON.stringify(state)); } catch (e) { /* 저장이 막힌 브라우저: 화면에서만 유지 */ }
  }
  // 체크는 물건 이름으로 기억 (예전엔 '구역::이름' 이었어서 한 번 옮겨 줌)
  let packState = (() => {
    const st = loadPack();
    let moved = false;
    Object.keys(st).forEach((k) => { if (k.includes('::')) { st[k.split('::').pop()] = st[k]; delete st[k]; moved = true; } });
    if (moved) savePack(st);
    return st;
  })();
  const packKey = (section, item) => (typeof item === 'string' ? item : item.t);
  const PACK_HIDE = 'jeju2026.packHide';
  const packHide = () => store.get(PACK_HIDE) === '1';
  const packDone = (sec) => sec.items.filter((it) => packState[packKey(sec, it)]).length;

  function packSummaryHTML() {
    const all = T.packing.reduce((a, sec) => a + sec.items.length, 0);
    const done = T.packing.reduce((a, sec) => a + packDone(sec), 0);
    const pct = all ? Math.round((done / all) * 100) : 0;
    return `<div class="card pk-sum">
      <div class="pk-sum-top"><p><b>${done}</b> / ${all}개 챙겼어요</p><span class="pk-pct${done === all ? ' full' : ''}">${done === all ? '다 챙겼어요!' : `${pct}%`}</span></div>
      <div class="pk-bar"><i style="width:${pct}%"></i></div>
      <div class="pk-cats">${T.packing.map((sec, si) => {
        const d = packDone(sec);
        const full = d === sec.items.length;
        return `<a class="pk-cat${full ? ' full' : ''}" href="#pack" data-pack-jump="${si}"><span class="pk-ic" aria-hidden="true">${esc(sec.icon || '📦')}</span><span class="pk-n">${esc(sec.short || sec.title)}</span><span class="pk-c">${full ? '✓' : `${d}/${sec.items.length}`}</span></a>`;
      }).join('')}</div>
      <label class="pk-hide"><input type="checkbox" data-pack-hide${packHide() ? ' checked' : ''}><span>챙긴 건 숨기기</span></label>
    </div>`;
  }

  function renderPack() {
    const sections = T.packing.map((sec, si) => {
      const items = sec.items.map((it, ii) => {
        const key = packKey(sec, it);
        const text = typeof it === 'string' ? it : it.t;
        const note = typeof it === 'string' ? '' : it.n;
        const id = `pk-${si}-${ii}`;
        return `<li${packState[key] ? ' class="is-done"' : ''}><label for="${id}">
          <input type="checkbox" id="${id}" data-key="${esc(key)}"${packState[key] ? ' checked' : ''}>
          <span class="txt">${esc(text)}${note ? `<small>${esc(note)}</small>` : ''}</span>
        </label></li>`;
      }).join('');
      const done = packDone(sec);
      return `<section class="block pk-sec${done === sec.items.length ? ' all-done' : ''}" data-sec="${si}" id="pk-sec-${si}">
        <div class="card pk-card">
          <div class="pk-head">
            <span class="pk-ic" aria-hidden="true">${esc(sec.icon || '📦')}</span>
            <h2 class="pk-title">${esc(sec.title)}${sec.who ? `<span class="pk-who">${esc(sec.who)}</span>` : ''}</h2>
            <span class="count${done === sec.items.length ? ' full' : ''}">${done} / ${sec.items.length}</span>
          </div>
          ${sec.note ? `<p class="pk-note">${esc(sec.note)}</p>` : ''}
          <ul class="checklist">${items}</ul>
          <p class="pk-alldone">다 챙겼어요 ✓</p>
        </div>
      </section>`;
    }).join('');

    return `<section class="block">
        <a class="back-link" href="#info">← 정보</a>
        ${peekHTML('pack')}
        <h1 class="page-title">준비물</h1>
        <p class="lede">체크는 지금 보는 휴대폰에만 저장돼요. 각자 폰에서 체크하면 돼요.</p>
      </section>
      <section class="block" data-pack-sum>${packSummaryHTML()}</section>
      <div class="pk-list${packHide() ? ' hide-done' : ''}">${sections}</div>
      <section class="block"><button class="btn" type="button" id="pack-reset">체크 모두 지우기</button></section>`;
  }

  function refreshPackCounts() {
    view.querySelectorAll('[data-sec]').forEach((el) => {
      const sec = T.packing[Number(el.dataset.sec)];
      const done = packDone(sec);
      const c = el.querySelector('.count');
      c.textContent = `${done} / ${sec.items.length}`;
      c.classList.toggle('full', done === sec.items.length);
      el.classList.toggle('all-done', done === sec.items.length);
      el.querySelectorAll('input[data-key]').forEach((b) => b.closest('li').classList.toggle('is-done', b.checked));
    });
    const sum = view.querySelector('[data-pack-sum]');
    if (sum) sum.innerHTML = packSummaryHTML();
  }
  view.addEventListener('change', (e) => {
    const h = e.target.closest('[data-pack-hide]');
    if (!h) return;
    store.set(PACK_HIDE, h.checked ? '1' : '0');
    const list = view.querySelector('.pk-list');
    if (list) list.classList.toggle('hide-done', h.checked);
  });
  view.addEventListener('click', (e) => {
    const j = e.target.closest('[data-pack-jump]');
    if (!j) return;
    e.preventDefault();
    const el = document.getElementById(`pk-sec-${j.dataset.packJump}`);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

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
    const sh = e.target.closest('[data-share]');
    if (sh) { shareInvite(sh.dataset.share); return; }
    if (e.target.closest('[data-map-open], [data-map-close]')) {
      homeMapOpen = !!e.target.closest('[data-map-open]');
      if (maps.home && maps.home.kind === 'leaflet') maps.home.map.remove();
      delete maps.home;
      view.querySelector('#map-home').outerHTML = homeMapHTML();
      if (homeMapOpen) initMaps();
      const nsec = view.querySelector('#map-home');
      if (nsec && nsec.getBoundingClientRect().top < 0) nsec.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    if (e.target.closest('.inv-photo')) {
      // 낮에는 누를 때마다 다음 태오 사진으로
      const img = view.querySelector('[data-hero-img]');
      if (img && heroLook().day && dayLooks.length > 1) {
        heroIdx = (heroIdx + 1) % dayLooks.length;
        const L = dayLooks[heroIdx];
        lastBubble = -1;
        img.src = L.photo; img.setAttribute('width', L.w); img.setAttribute('height', L.h); img.alt = L.alt || '';
        img.classList.remove('swap'); void img.offsetWidth; img.classList.add('swap');
      }
      const b = view.querySelector('[data-bubble]');
      if (b) { b.textContent = pickBubble(); placeBubble(); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
      return;
    }
    const sl = e.target.closest('[data-slot]');
    if (sl) {
      const [d, a, b, label] = sl.dataset.slot.split('|');
      fbOpen = d;
      fillFeedback();
      const form = view.querySelector(`.fb-form[data-day="${d}"]`);
      const ta = form && form.querySelector('textarea');
      if (ta) {
        const pre = `${dom(d)}일 ${a}~${b} (${label.replace(/\s*\(미정\)/, '')}): `;
        if (!ta.value.trim()) ta.value = pre;
        ta.focus({ preventScroll: true });
        ta.setSelectionRange(ta.value.length, ta.value.length);
        form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
      return;
    }
    const pd = e.target.closest('[data-plan-day]');
    if (pd) { showPlanDay(Number(pd.dataset.planDay)); return; }
    const more = e.target.closest('[data-item-more]');
    if (more && !e.target.closest('a, button')) { more.classList.toggle('open'); return; }
    const tp = e.target.closest('[data-tpeek]');
    if (tp) {
      const L = taeoList(tp.dataset.tpeek);
      const i = L.length > 1 ? (Number(tp.dataset.ti) + 1) % L.length : 0;
      const s = L[i];
      const b = tp.querySelector('.tp-b');
      const im = tp.querySelector('img');
      if (s && L.length > 1 && im) {
        tp.dataset.ti = String(i);
        im.src = taeoSrc(s); im.setAttribute('width', s.w); im.setAttribute('height', s.h); im.alt = s.alt || '태오';
      }
      if (b && s) b.textContent = sayOf(s, b.textContent);
      tp.classList.remove('tap'); void tp.offsetWidth; tp.classList.add('tap');
      return;
    }
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
      <div class="row-head"><h3>${esc(s.name)}</h3>${naverSide(s.q)}</div>
      <p class="sub">${esc(s.room)} · ${esc(whoText(s.who))}</p>
      <dl class="facts">
        <dt>체크인</dt><dd>${esc(mdw(s.checkIn.date))}${s.checkIn.time ? ` ${esc(s.checkIn.time)}` : ''}</dd>
        <dt>체크아웃</dt><dd>${esc(mdw(s.checkOut.date))}${s.checkOut.time ? ` ${esc(s.checkOut.time)}` : ''}</dd>
        ${s.address ? `<dt>주소</dt><dd>${esc(s.address)}</dd>` : ''}
      </dl>
      ${s.notes && s.notes.length ? `<ul class="bullets" style="margin-top:12px">${s.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
    </li>`).join('');

    const C = T.car;
    const carHTML = `<div class="card info-card">
      <div class="row-head"><h3>${esc(C.model)}</h3>${naverSide(C.company)}</div>
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
        <div class="row-head"><b>${esc(h.name)}</b>${naverSide(h.q || h.name)}</div>
        <p>${esc(h.desc)}</p>
        ${h.tel ? `<p>대표번호 <a class="tel" href="tel:${esc(h.tel.replace(/-/g, ''))}">${esc(h.tel)}</a></p>` : ''}
        ${h.address ? `<p>${esc(h.address)}</p>` : ''}
      </li>`).join('')}</ul>
      ${E.note ? `<p class="tip">${esc(E.note)}</p>` : ''}
    </div>`;

    return `<section class="block">
        ${peekHTML('info')}
        <h1 class="page-title">정보</h1>
        <p class="lede">항공편 · 숙소 · 렌터카 · 날씨 · 병원을 한곳에 모았어요.</p>
      </section>
      ${jumpHTML([['i-when', '오고 가요'], ['i-stay', '숙소'], ['i-car', '렌터카'], ['i-wx', '날씨'], ['i-sos', '비상 연락'], ['baby', '태오'], ['i-fixed', '정해진 것'], ['i-news', '소식']])}
      <section class="block" id="i-when"><h2 class="h">누가 언제 오고 가요</h2><ul class="stack">${groupsHTML}</ul>
        ${T.guideB ? `<a class="btn-link" href="#guide">${esc(T.guideB.linkText || '후발대 안내 보기')}</a>` : ''}</section>
      <section class="block"><h2 class="h">준비물</h2>
        <a class="card map-teaser" href="#pack"><span class="mt-ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="7" width="16" height="13" rx="2.5"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="m9 13.5 2 2 4-4"/></svg></span><span class="mt-t"><b>준비물 체크리스트</b><small>꼭 챙길 것 · 옷 · 태오 · 운전 — 체크는 각자 휴대폰에 저장</small></span><svg class="mt-chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></a>
      </section>
      <section class="block" id="i-stay"><h2 class="h">숙소</h2><ul class="stack">${staysHTML}</ul></section>
      <section class="block" id="i-car"><h2 class="h">렌터카</h2>${carHTML}</section>
      <section class="block" id="i-wx"><h2 class="h">날씨</h2>${weatherHTML}</section>
      <section class="block" id="i-sos"><h2 class="h">비상 연락</h2>${emergencyHTML}</section>
      ${babyInfoHTML()}
      ${bookingsHTML()}
      ${todoHTML()}
      ${updatesHTML()}
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

  async function shareInvite(kind) {
    const base = T.share;
    const S = kind === 'guide' && T.guideB ? { ...base, ...T.guideB.share } : kind === 'recap' && T.recap ? { ...base, ...T.recap.share } : base;
    const url = ((T.site && T.site.url) || location.href.split('#')[0]) + (kind === 'guide' ? '#guide' : kind === 'recap' ? '#recap' : '');
    const link = { mobileWebUrl: url, webUrl: url };
    // 카카오 개발자 설정에 사이트 도메인이 등록돼 있어야 카톡 카드 링크가 제대로 가요.
    // 등록 전에는(kakaoCard: false) 휴대폰 공유창으로 주소를 그대로 보내요 → 카톡을 고르면 미리보기 그림도 떠요
    const sheetFirst = !(T.share && T.share.kakaoCard) && navigator.share;
    if (sheetFirst) {
      try { await navigator.share({ title: S.title, text: S.text, url }); } catch (e) { /* 취소 */ }
      return;
    }
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
  let fbExpanded = false; // 홈 의견함: 처음엔 접어서 한 줄씩만
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

  // AI 답 정리: 첫 줄 = 한 줄 요약, "- 라벨: 내용" = 항목, "> " = 팁
  // 날짜 항목(예: "11일(일): 맑음 · 16–27°")에는 날씨 아이콘을 붙임
  function aiWx(label, value) {
    if (!/^\d{1,2}일/.test(label)) return '';
    value = value.split(/[·,]/)[0]; // "비 13%" 같은 강수확률은 빼고 날씨 말만 봄
    const t = /뇌우|천둥/.test(value) ? 'storm' : /비|소나기/.test(value) ? 'rain' : /안개/.test(value) ? 'fog'
      : /흐림|흐리/.test(value) ? 'cloud' : /구름/.test(value) ? 'partly' : /맑/.test(value) ? 'sun' : '';
    return t ? WX_ICON[t] : '';
  }
  function aiHTML(text) {
    const lines = String(text).split(/\n+/).map((l) => l.trim()).filter(Boolean);
    let head = '';
    const rows = [];
    const tips = [];
    const paras = [];
    lines.forEach((l, i) => {
      if (/^[-•·]\s*/.test(l) && !/^[-•·]\s*$/.test(l)) {
        const body = l.replace(/^[-•·]\s*/, '');
        const m = /^([^:：]{1,14})[:：]\s*(.+)$/.exec(body);
        rows.push(m ? { k: m[1].trim(), v: m[2].trim() } : { k: '', v: body });
      } else if (/^>\s*/.test(l)) tips.push(l.replace(/^>\s*/, ''));
      else if (i === 0 && lines.length > 1) head = l;
      else paras.push(l);
    });
    return `${head ? `<p class="fb-ai-head">${esc(head)}</p>` : ''}${paras.map((p) => `<p>${esc(p)}</p>`).join('')}${
      rows.length ? `<ul class="fb-ai-list">${rows.map((r) => (r.k
        ? `<li><b>${aiWx(r.k, r.v)}${esc(r.k)}</b><span>${esc(r.v)}</span></li>`
        : `<li class="solo"><span>${esc(r.v)}</span></li>`)).join('')}</ul>` : ''}${
      tips.map((t) => `<p class="fb-ai-tip">${esc(t)}</p>`).join('')}`;
  }

  function fbItemHTML(it, showDay) {
    const safeLink = /^https?:\/\//.test(it.link || '') ? it.link : '';
    let aiBox = '';
    if (it.ai) {
      const al = it.aiLink || '';
      aiBox = `<div class="fb-ai"><span class="fb-ai-tag">✦ AI가 찾아봤어요</span>${aiHTML(it.ai)}${
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
    // 입력창을 맨 위에 둬서 열자마자 바로 쓸 수 있게
    return `<form class="fb-form" data-day="${day}">
      <label class="fb-label" for="${uid}-text">${day === 'home' ? '무슨 이야기예요?' : '뭐 하고 싶어요?'}</label>
      <textarea id="${uid}-text" name="text" class="fb-input" maxlength="500" rows="3" required placeholder="${day === 'home' ? '예) 14일에 비 오면 실내로 바꿔요 / 15일 점심은 고기국수!' : '예) 카멜리아힐 가서 가족사진 찍고 싶어요'}"></textarea>
      <p class="fb-label">누구예요?</p>
      <div class="fb-names">${T.people.filter((p) => p.id !== 'taeo').map((p) => `<label><input type="radio" name="name" value="${esc(p.name)}"${me === p.name ? ' checked' : ''}><span>${esc(p.name)}</span></label>`).join('')}</div>
      ${daySelect}
      <label class="fb-label" for="${uid}-link">참고 링크 <small>(선택)</small></label>
      <input id="${uid}-link" name="link" type="url" class="fb-input" placeholder="인스타 · 블로그 · 네이버 지도 주소">
      <input name="website" class="fb-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="fb-actions"><button type="submit" class="btn primary">올리기</button><button type="button" class="btn" data-fb-cancel>취소</button></div>
      <p class="fb-status" role="status"></p>
    </form>`;
  }

  function fbBlockHTML(day) {
    const list = (fbItems || []).filter((it) => day === 'all' || day === 'home' || it.day === day).slice(0, day === 'home' ? 2 : 999);
    const items = fbItems === null && FB.endpoint
      ? '<p class="fb-empty loading">의견 불러오는 중…</p>'
      : list.length
        ? `<ul class="fb-list">${list.map((it) => fbItemHTML(it, day === 'all' || day === 'home')).join('')}</ul>`
        : `<p class="fb-empty">${day === 'all' || day === 'home' ? '아직 의견이 없어요. 첫 의견을 남겨주세요!' : '이날 하고 싶은 게 있으면 남겨주세요.'}</p>`;
    if (day === 'home' && list.length) {
      // 접힌 상태: 이름 · 한 줄 미리보기 · AI 답 표시만. 누르면 펼쳐짐
      const rows = fbExpanded
        ? items
        : `<ul class="fb-list compact">${list.map((it) => `<li><button type="button" class="fb-row" data-fb-expand>
            <b>${esc(it.name || '누군가')}</b><span class="fb-snip">${esc(it.text)}</span>
            ${it.ai ? '<span class="fb-badge">✦ AI 답</span>' : (FB.aiOn ? '<span class="fb-badge wait">확인 중</span>' : '')}</button></li>`).join('')}</ul>`;
      const toggle = `<button type="button" class="fb-more" ${fbExpanded ? 'data-fb-collapse aria-expanded="true"' : 'data-fb-expand aria-expanded="false"'}>${fbExpanded ? '접기' : '자세히 보기'}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>`;
      return `${rows}${fbOpen === day ? fbFormHTML(day) : `<div class="fb-bar">${toggle}<button type="button" class="fb-open" data-fb-open="${day}">＋ 의견 남기기</button></div>`}`;
    }
    return `${items}${fbOpen === day ? fbFormHTML(day) : `<button type="button" class="fb-open" data-fb-open="${day}">＋ 의견 남기기</button>`}`;
  }

  function fillFeedback() {
    view.querySelectorAll('.fb[data-fb-day]').forEach((el) => { el.innerHTML = fbBlockHTML(el.dataset.fbDay); });
  }

  const FB_CACHE = 'jeju2026.fbcache';
  async function loadFeedback() {
    if (!FB.endpoint) return;
    try {
      let data;
      try {
        const res = await fetch(`${FB.endpoint}?t=${Date.now()}`);
        data = await res.json();
        try { localStorage.setItem(FB_CACHE, JSON.stringify(data)); } catch (e) { /* 저장 공간 부족: 무시 */ }
      } catch (e) {
        // 인터넷이 안 되면 마지막으로 받아 둔 의견·투표를 보여줌
        data = JSON.parse(localStorage.getItem(FB_CACHE) || 'null');
        if (!data) throw e;
      }
      fbItems = (data.items || []).map((it) => {
        // 구글 시트가 'YYYY-MM-DD' 를 날짜로 바꿔서 돌려주는 경우가 있어 다시 날짜 글자로
        if (it.day && !/^\d{4}-\d{2}-\d{2}$/.test(it.day)) { const d = new Date(it.day); it.day = Number.isNaN(d.getTime()) ? '' : isoOf(d); }
        return it;
      }).sort((a, b) => String(b.ts).localeCompare(String(a.ts)));
      backendV = data.v || 1;
      notice = data.notice || null;
      if (data.votes) votes = data.votes;
      photosOn = Boolean(data.photosOn);
    } catch (e) {
      fbItems = fbItems || [];
    }
    fillFeedback();
    fillPolls();
    fillNotice();
    fillRecap();
    if (currentTab() === 'plan') refreshPlanPanel();
    fillBlockBadges();
    if (photosOn && photoKey()) loadPhotos();
    else fillAlbum();
  }

  view.addEventListener('click', (e) => {
    const open = e.target.closest('[data-fb-open]');
    if (open) {
      fbOpen = open.dataset.fbOpen;
      fillFeedback();
      // 입력창으로 바로 이동: 키보드가 뜨도록 누른 순간 포커스하고, 화면은 부드럽게 입력창으로
      const form = view.querySelector(`.fb-form[data-day="${fbOpen}"]`);
      const ta = form && form.querySelector('textarea');
      if (ta) {
        ta.focus({ preventScroll: true });
        form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
      return;
    }
    if (e.target.closest('[data-fb-expand]')) { fbExpanded = true; fillFeedback(); return; }
    if (e.target.closest('[data-fb-collapse]')) {
      fbExpanded = false;
      fillFeedback();
      const card = view.querySelector('.voice');
      if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
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
  function closeLightbox() { lb.hidden = true; lb.querySelector('img').onerror = null; document.documentElement.classList.remove('lb-open'); }
  lb.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !lb.hidden) closeLightbox(); });

  /* ---------- 움직임: 등장 · 상단 바 · 토스트 · D-day ---------- */
  // 휴대폰의 '동작 줄이기' 설정과 상관없이 효과를 보여줌 (가족 요청)
  let reduceMotion = false;
  const topbar = document.createElement('div');
  topbar.className = 'topbar';
  topbar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(topbar);
  const TAB_TITLE = { home: T.shortTitle, plan: '일정', ideas: '가볼 곳 · 먹을 곳', pack: '준비물', info: '정보', album: '가족 사진첩', guide: '후발대 안내', recap: '우리 제주 여행' };
  function updateTopbar() {
    const st = tripState();
    const right = st.phase === 'before' ? `D-${st.dday}` : st.phase === 'during' ? `${st.index + 1}일차` : '';
    topbar.innerHTML = `<b><img class="tb-logo" src="assets/logo.png" alt="" width="22" height="22">${esc(TAB_TITLE[currentTab()])}</b><span>${esc(right)}</span>`;
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

  /* ---------- 스크롤 효과: 까딱까딱 태오 · 비행기 탄 태오 · 날아다니는 비행기 ---------- */
  const FRAMES = ['f0', 'f1', 'f2'];
  let flipStep = 0;
  let lastY = window.scrollY;
  let travelled = 0;
  let restTimer = null;

  // 초대 카드가 화면 밖으로 나가면, 비행기를 탄 태오가 스크롤을 따라 화면 아래쪽을 날아다님
  // 비행기 탄 태오 사진 (오른쪽을 보고 있음, 420×335)
  const FLY_W = 136;
  const FLY_H = 108;
  const flyer = document.createElement('div');
  flyer.className = 'flyer';
  flyer.setAttribute('aria-hidden', 'true');
  const fly = { target: -FLY_W, pos: -FLY_W, vel: 0, dir: 1, lift: 0, tilt: 0, puff: 0, raf: 0, last: 0 };
  const planeSrc = (T.hero && T.hero.plane) || '';
  if (planeSrc) {
    flyer.innerHTML = `<button type="button" class="fly-plane" tabindex="-1" aria-label="맨 위로">
      <span class="fly-turn"><img class="fly-body" src="${esc(planeSrc)}" alt="" width="${FLY_W}" height="${FLY_H}" loading="lazy" decoding="async"></span>
    </button>`;
    document.body.appendChild(flyer);
    flyer.querySelector('.fly-plane').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }
  const flyPlane = flyer.querySelector('.fly-plane');

  function setFlyDir(dir) {
    fly.dir = dir;
    flyer.classList.toggle('left', dir < 0); // 방향이 바뀌면 비행기와 태오가 함께 빙글 돌아섬
  }

  // 스크롤은 '목표 위치'만 옮기고, 비행기는 스프링처럼 부드럽게 따라감 (관성·감속·기울기)
  function nudgeFlyer(dy) {
    if (!flyPlane || !dy) return;
    fly.target += dy * 0.6;
    if (!fly.raf) { fly.last = performance.now(); fly.raf = requestAnimationFrame(stepFlyer); }
  }

  function stepFlyer(now) {
    const dt = Math.min(3, (now - fly.last) / 16.67); // 60fps 기준 프레임 수
    fly.last = now;
    // 스프링: 목표를 향해 가속하고, 공기 저항으로 감속
    fly.vel += (fly.target - fly.pos) * 0.05 * dt;
    fly.vel *= Math.pow(0.72, dt);
    fly.vel = Math.max(-24, Math.min(24, fly.vel));
    fly.pos += fly.vel * dt;
    // 방향은 가려는 쪽이 분명할 때만 바꿈 (멈추면서 살짝 밀려도 뒤돌지 않게)
    const ahead = fly.target - fly.pos;
    if (Math.abs(ahead) > 8 && Math.sign(ahead) !== fly.dir) setFlyDir(Math.sign(ahead));

    const box = flyer.clientWidth || window.innerWidth;
    const span = box + FLY_W * 2;
    const x = ((((fly.pos + FLY_W) % span) + span) % span) - FLY_W;
    // 높이: 완만한 물결 + 빨리 날수록 살짝 위로
    const speed = Math.abs(fly.vel);
    const goal = Math.sin(fly.pos / 230) * 12 - Math.min(speed * 0.7, 12);
    const prevLift = fly.lift;
    fly.lift += (goal - fly.lift) * (1 - Math.pow(0.88, dt));
    // 기울기: 올라갈 땐 기수를 들고, 내려갈 땐 숙임 + 속도만큼 살짝 들기
    const vy = (fly.lift - prevLift) / (dt || 1);
    const pitch = (Math.atan2(vy, Math.max(speed, 1.5)) * 180) / Math.PI;
    const tiltGoal = Math.max(-12, Math.min(12, (pitch - Math.min(speed * 0.25, 4)) * fly.dir));
    fly.tilt += (tiltGoal - fly.tilt) * (1 - Math.pow(0.87, dt));
    flyPlane.style.transform = `translate3d(${x.toFixed(2)}px, ${fly.lift.toFixed(2)}px, 0) rotate(${fly.tilt.toFixed(2)}deg)`;

    fly.puff += speed * dt;
    if (fly.puff > 34 && speed > 2) { fly.puff = 0; addPuff(x, fly.lift, speed); }

    const settled = Math.abs(fly.target - fly.pos) < 0.3 && speed < 0.05 && Math.abs(goal - fly.lift) < 0.1 && Math.abs(tiltGoal - fly.tilt) < 0.05;
    fly.raf = settled ? 0 : requestAnimationFrame(stepFlyer);
  }

  function addPuff(x, lift, speed) {
    if (flyer.querySelectorAll('.puff').length > 9) return;
    const el = document.createElement('i');
    el.className = 'puff';
    const size = 9 + Math.random() * 8;
    const tailX = fly.dir > 0 ? x + 12 : x + FLY_W - 12;
    el.style.left = `${tailX}px`;
    el.style.bottom = `${50 - lift + (Math.random() * 8 - 4)}px`;
    el.style.width = el.style.height = `${size.toFixed(1)}px`;
    el.style.setProperty('--dx', `${(-fly.dir * (18 + speed * 1.5)).toFixed(1)}px`);
    el.style.setProperty('--dy', `${(-4 - Math.random() * 8).toFixed(1)}px`);
    flyer.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
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
    const dy = y - lastY;
    travelled += Math.abs(dy);
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
    flyer.classList.toggle('show', heroGone && y > 120);
    nudgeFlyer(dy);
    drawSky();
  }
  let scrollQueued = false;
  window.addEventListener('scroll', () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => { scrollQueued = false; onScroll(); });
  }, { passive: true });
  window.addEventListener('resize', () => buildSky());
  document.addEventListener('focusin', (e) => { if (e.target.matches('input, textarea, select')) flyer.classList.add('typing'); });
  document.addEventListener('focusout', () => flyer.classList.remove('typing'));

  /* =====================================================================
     여행 도우미 — 지금 · 출발 전 체크 · 바로가기 · 후발대 안내 · 비 오는 날 · 태오 정보 · 저녁 투표 · 사진첩
     ===================================================================== */
  const mins = (t) => { const [h, m] = String(t).split(':').map(Number); return h * 60 + (m || 0); };
  const hm = (n) => `${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`;
  const leftText = (m) => (m < 60 ? `${m}분 뒤` : `${Math.floor(m / 60)}시간${m % 60 ? ` ${m % 60}분` : ''} 뒤`);
  const isoOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  // 네이버 지도 길찾기: 휴대폰에 네이버 지도 앱이 있으면 바로 자동차 길안내, 없으면 네이버 지도 웹
  function routeLink(key, label) {
    const p = T.map.places[key];
    if (!p) return '';
    const name = p.q || p.name;
    const web = `https://map.naver.com/p/search/${encodeURIComponent(name)}`;
    const app = `nmap://route/car?dlat=${p.lat}&dlng=${p.lon}&dname=${encodeURIComponent(name)}&appname=${encodeURIComponent('dkdldrmtit.github.io')}`;
    return `<a class="go-btn" href="${esc(web)}" data-nmap="${esc(app)}" target="_blank" rel="noopener">${ICON.route}<span>${esc(label || `${p.name} 길찾기`)}</span></a>`;
  }
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-nmap]');
    if (!a || !(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) return;
    e.preventDefault();
    const web = a.href;
    location.href = a.dataset.nmap;
    setTimeout(() => { if (!document.hidden) location.href = web; }, 1400);
  });

  /* 1. 여행 중: 지금 · 다음 일정 · 길찾기 */
  function nowHTML(st) {
    if (st.phase !== 'during') return '';
    const day = T.days[st.index];
    const n = nowDate();
    const cur = n.getHours() * 60 + n.getMinutes();
    const timed = (day.items || []).filter((it) => it.time).sort((a, b) => mins(a.time) - mins(b.time));
    let now = null;
    let next = null;
    timed.forEach((it) => { if (mins(it.time) <= cur) now = it; else if (!next) next = it; });
    let tomorrow = false;
    if (!next && T.days[st.index + 1]) { next = (T.days[st.index + 1].items || []).find((it) => it.time) || null; tomorrow = Boolean(next); }
    const stop = (day.route || []).find((r) => r.time && mins(r.time) > cur);
    const stopPlace = stop && T.map.places[stop.at];
    return `<section class="block now-block">
      <div class="card now-card">
        <div class="now-top"><span class="now-live"><i></i>지금</span><span class="now-clock">${esc(mdw(day.date))} ${hm(n)} · DAY ${st.index + 1}</span></div>
        <p class="now-what">${esc(now ? now.title : (next && !tomorrow ? '곧 시작해요' : '자유 시간'))}</p>
        ${now && now.note ? `<p class="now-note">${esc(now.note)}</p>` : ''}
        ${next ? `<div class="now-next"><span class="nn-l">다음</span><span class="nn-t"><b>${tomorrow ? '내일 ' : ''}${esc(next.time)}</b> ${esc(next.title)}</span>${tomorrow ? '' : `<em>${leftText(mins(next.time) - cur)}</em>`}</div>` : '<div class="now-next"><span class="nn-l">다음</span><span class="nn-t">오늘 일정 끝 · 푹 쉬어요</span></div>'}
        <div class="now-actions">
          ${stopPlace ? routeLink(stop.at, `${stopPlace.name}까지 길찾기`) : ''}
          <a class="now-all" href="#plan" data-goto="day-${day.date}">오늘 일정 전체</a>
        </div>
      </div>
    </section>`;
  }
  setInterval(() => {
    if (currentTab() !== 'home') return;
    const el = view.querySelector('.now-block');
    if (el) el.outerHTML = nowHTML(tripState());
  }, 60000);

  /* 6. 출발 전 · 여행 중 챙길 것 (체크는 이 휴대폰에만 저장) */
  const REMIND_KEY = 'jeju2026.remind.v1';
  let remindState = (() => { try { return JSON.parse(localStorage.getItem(REMIND_KEY)) || {}; } catch (e) { return {}; } })();
  function checkHTML(st) {
    const t = today();
    const p = me();
    const list = (T.reminders || []).filter((r) => toDate(r.from) <= t && t <= toDate(r.to) && (!p || !r.who || (Array.isArray(r.who) ? r.who.includes(p.id) : r.who === p.group)));
    if (!list.length) return '';
    const done = list.filter((r) => remindState[r.id]).length;
    const title = st.phase === 'before' ? '출발 전에 챙겨요' : '오늘 챙길 것';
    // 안 한 것 먼저, 3개만 보이고 나머지는 접어둠
    const sorted = list.filter((r) => !remindState[r.id]).concat(list.filter((r) => remindState[r.id]));
    const row = (r) => `<li><label for="rm-${esc(r.id)}">
          <input type="checkbox" id="rm-${esc(r.id)}" data-remind="${esc(r.id)}"${remindState[r.id] ? ' checked' : ''}>
          <span class="txt">${esc(r.text)}${r.note ? `<small>${esc(r.note)}</small>` : ''}</span>
        </label></li>`;
    const more = sorted.slice(3);
    return `<section class="block" id="checks">
      <div class="card checks${done === list.length ? ' all-done' : ''}">
        <div class="ck-head"><b>${esc(title)}</b><span class="count${done === list.length ? ' full' : ''}">${done} / ${list.length}</span></div>
        ${done === list.length && taeoList('done').length ? `<p class="ck-yay">${((d) => `<img src="${esc(taeoSrc(d))}" alt="${esc(d.alt || '')}" width="${d.w}" height="${d.h}">`)(taeoPick('done'))}<span>다 챙겼어요!<small>태오가 박수 쳐요</small></span></p>` : ''}
        <ul class="checklist">${sorted.slice(0, 3).map(row).join('')}</ul>
        ${more.length ? `<details class="more"><summary><span>${more.length}개 더 보기</span><span>접기</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary><ul class="checklist">${more.map(row).join('')}</ul></details>` : ''}
      </div>
    </section>`;
  }
  view.addEventListener('change', (e) => {
    const box = e.target.closest('input[data-remind]');
    if (!box) return;
    if (box.checked) remindState[box.dataset.remind] = true;
    else delete remindState[box.dataset.remind];
    try { localStorage.setItem(REMIND_KEY, JSON.stringify(remindState)); } catch (err) { /* 무시 */ }
    const sec = view.querySelector('#checks');
    if (sec) sec.outerHTML = checkHTML(tripState());
  });

  /* 홈 바로가기: 후발대 안내 · 저녁 투표 · 사진첩 */
  // 바로가기: 3D 아이콘 + 짧은 이름만 한 줄로 (토스 메뉴처럼)
  const IC3 = (n) => `<img src="assets/icons/${n}.webp" alt="" width="48" height="48" loading="lazy">`;
  function quickHTML(st) {
    const t = today();
    const tiles = [];
    const G = T.guideB;
    const p = me();
    if (G && t <= toDate(G.until || T.end) && (!p || p.group === 'b')) tiles.push(['#guide', '', 'plane', '도착 안내']);
    const openPolls = (T.polls || []).filter((x) => t <= toDate(x.closes));
    if (openPolls.length) tiles.push(['#ideas', 'polls', 'heart', '가족 투표']);
    tiles.push(['#pack', '', 'suitcase', '준비물']);
    tiles.push(['#plan', 'map-plan', 'map', '이동 지도']);
    tiles.push(['#album', '', 'camera', '사진첩']);
    return `<section class="block"><nav class="qrow" aria-label="바로가기">${tiles.map(([href, go, ic, label]) => `<a class="qi" href="${href}"${go ? ` data-goto="${go}"` : ''}><span class="qi-ic">${IC3(ic)}</span><span>${esc(label)}</span></a>`).join('')}</nav></section>`;
  }

  /* 7. 후발대 안내 (할아버지 · 할머니 · 선미 · 범준) */
  function renderGuide() {
    const G = T.guideB;
    if (!G) return '<section class="block"><h1 class="page-title">후발대 안내</h1></section>';
    const g = T.groups.find((x) => x.id === 'b');
    const stepList = (steps) => `<ol class="g-steps">${steps.map((s) => `<li><span class="gs-t">${esc(s.time || '')}</span><div><b>${esc(s.title)}</b>${s.note ? `<p>${esc(s.note)}</p>` : ''}</div></li>`).join('')}</ol>`;
    return `<section class="block">
        ${peekHTML('guide')}
        <p class="page-kicker">${esc(whoText('b'))}</p>
        <h1 class="page-title">${esc(G.title)}</h1>
        <p class="lede">${esc(G.intro)}</p>
        <button type="button" class="kakao-share small" data-share="guide">${ICON.talk}<span>이 안내 카톡으로 보내기</span></button>
      </section>
      <section class="block">
        <h2 class="h">${esc(mdw(g.arrive.date))} 제주 도착</h2>
        <div class="card g-card">
          <p class="g-flight">${ICON.plane}<span><b>${esc(g.arrive.time)} 도착</b> · ${esc(g.arrive.flight)}</span></p>
          ${stepList(G.arrive)}
          ${G.meet ? `<p class="tip">${esc(G.meet)}</p>` : ''}
          ${routeLink('cju', '제주공항 지도')}
        </div>
      </section>
      <section class="block">
        <h2 class="h">${esc(mdw(g.depart.date))} 제주 출발</h2>
        <div class="card g-card">
          <p class="g-flight">${ICON.plane}<span><b>${esc(g.depart.time)} 출발</b> · ${esc(g.depart.flight)}</span></p>
          ${stepList(G.depart)}
        </div>
      </section>
      ${G.bring ? `<section class="block"><h2 class="h">꼭 챙겨요</h2><div class="card info-card"><ul class="bullets">${G.bring.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div></section>` : ''}
      <section class="block"><a class="btn-link" href="#plan">전체 일정 보기</a></section>`;
  }

  /* 3. 비 오는 날 실내 대안 (예보에 비가 있으면 자동으로 펼쳐짐) */
  function isRainy(iso) {
    const w = wxOf(iso);
    return !w.normal && (w.type === 'rain' || w.type === 'storm' || (w.pop != null && w.pop >= 50));
  }
  const rainTags = (x) => [{ text: x.drive }, ...(x.baby ? [{ text: x.baby, kind: 'baby' }] : []), ...(x.closed ? [{ text: x.closed }] : [])].filter((t) => t.text);
  function rainBoxHTML(day) {
    const R = T.rainPlan;
    if (!R || !(day.blocks || []).some((b) => b[4] === 'tbd')) return '';
    const w = wxOf(day.date);
    const rainy = isRainy(day.date);
    const head = rainy ? `비 소식${w.pop != null ? ` ${w.pop}%` : ''} · 실내로 가요` : '비 오면 갈 실내 후보';
    return `<details class="xbox rain${rainy ? ' on' : ''}" data-rain="${day.date}">
      <summary>${WX_ICON.rain}<span>${esc(head)}</span><em>${R.items.length}곳</em></summary>
      <ul class="xlist">${R.items.map((x) => `<li><div><b>${esc(x.name)}</b><p>${esc([x.drive, x.desc].filter(Boolean).join(' · '))}</p></div>${naverSide(x.q || x.name)}</li>`).join('')}</ul>
    </details>`;
  }

  /* 2. 태오 정보: 그날 가는 곳의 수유실 · 아기용품 + 아플 때 */
  const BABY_IC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4.5"/><path d="M10.3 8.3h.01M13.7 8.3h.01M10.5 10.3c.9.6 2.1.6 3 0"/><path d="M5.5 21c.8-4 3.4-6.5 6.5-6.5s5.7 2.5 6.5 6.5"/></svg>';
  function babyDayHTML(day) {
    const B = T.baby;
    if (!B) return '';
    const keys = [...new Set([...(day.route || []).map((r) => r.at), day.night].filter(Boolean))];
    const spots = keys.map((k) => B.spots && B.spots[k] && { k, ...B.spots[k] }).filter(Boolean);
    if (!spots.length) return '';
    return `<details class="xbox baby">
      <summary>${BABY_IC}<span>태오 정보 · 수유실 · 아기용품</span><em>${spots.length}곳</em></summary>
      <ul class="xlist">${spots.map((s) => `<li><div><b>${esc(s.name)}</b>${s.items.map((x) => `<p>${esc(x)}</p>`).join('')}</div></li>`).join('')}</ul>
      <a class="xmore" href="#info" data-goto="baby">아플 때 갈 곳 보기</a>
    </details>`;
  }
  function babyInfoHTML() {
    const B = T.baby;
    if (!B) return '';
    return `<section class="block" id="baby"><h2 class="h">태오 · 아기 정보</h2>
      ${B.lead ? `<p class="lede">${esc(B.lead)}</p>` : ''}
      <ul class="stack">
        ${Object.values(B.spots || {}).map((s) => `<li class="card info-card"><h3>${esc(s.name)}</h3><ul class="bullets">${s.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></li>`).join('')}
        ${B.clinics && B.clinics.length ? `<li class="card info-card emergency"><h3>태오가 아플 때</h3>
          ${B.clinicLead ? `<p class="sub">${esc(B.clinicLead)}</p>` : ''}
          <ul class="hosp">${B.clinics.map((h) => `<li><div class="row-head"><b>${esc(h.name)}</b>${naverSide(h.q || h.name)}</div><p>${esc(h.desc)}</p>${h.address ? `<p>${esc(h.address)}</p>` : ''}</li>`).join('')}</ul>
          ${B.clinicTip ? `<p class="tip">${esc(B.clinicTip)}</p>` : ''}</li>` : ''}
      </ul>
      ${B.src ? `<p class="src">출처 · ${esc(B.src)}</p>` : ''}
    </section>`;
  }

  /* 5. 저녁 투표 (구글 시트에 저장, 하트를 다시 누르면 취소) */
  let votes = null;
  let backendV = 0;
  let photosOn = false;
  const votersOf = (pollId, optId) => ((votes && votes[pollId] && votes[pollId][optId]) || []);
  function leaderOf(p) {
    let best = null;
    let max = 0;
    let tie = false;
    p.options.forEach((o) => {
      const n = votersOf(p.id, o.id).length;
      if (n > max) { max = n; best = o; tie = false; } else if (n && n === max) tie = true;
    });
    return max ? { opt: best, n: max, tie } : null;
  }
  function pollsSectionHTML() {
    if (!(T.polls || []).length) return '';
    return `<section class="block" id="polls">
      <h2 class="h">가족 투표</h2>
      <p class="lede">마음에 드는 곳에 하트를 눌러주세요. 여러 개 눌러도 돼요. 마감되면 1등이 일정에 들어가요.</p>
      <div data-polls></div>
    </section>`;
  }
  function pollsBodyHTML() {
    const me = savedName();
    const ready = backendV >= 2;
    const names = `<div class="poll-who"><span>누구예요?</span><div class="fb-names">${T.people.filter((p) => p.id !== 'taeo').map((p) => `<label><input type="radio" name="pollname" value="${esc(p.name)}"${me === p.name ? ' checked' : ''}><span>${esc(p.name)}</span></label>`).join('')}</div></div>`;
    const t = today();
    return `${ready ? names : '<p class="poll-off">투표는 곧 열려요 (민석이 설정하는 중)</p>'}
      ${T.polls.map((p) => {
        const closed = t > toDate(p.closes);
        const lead = leaderOf(p);
        return `<div class="card poll${closed ? ' closed' : ''}">
          <div class="poll-head"><b>${esc(p.title)}</b><span>${closed ? '마감' : `${esc(mdw(p.closes))}까지`}</span></div>
          <ul class="poll-opts">${p.options.map((o) => {
            const vs = votersOf(p.id, o.id);
            const mine = me && vs.includes(me);
            const top = lead && !lead.tie && lead.opt.id === o.id;
            return `<li class="${top ? 'top' : ''}">
              <div class="po-t"><b>${esc(o.name)}${top ? ' <span class="po-1">1등</span>' : ''}</b><p>${esc([o.drive, o.desc].filter(Boolean).join(' · '))}</p>${o.plan ? `<details class="po-more"><summary>코스 보기 <span>${o.plan.length}단계</span></summary><ol class="po-plan">${o.plan.map((x) => `<li>${esc(x)}</li>`).join('')}</ol></details>` : ''}
                ${vs.length ? `<p class="po-who">${esc(vs.join(' · '))}</p>` : ''}</div>
              ${naverSide(o.q || o.name)}
              <button type="button" class="heart${mine ? ' on' : ''}" data-vote="${esc(p.id)}|${esc(o.id)}" aria-pressed="${mine ? 'true' : 'false'}" aria-label="${esc(o.name)} 하트"${!ready || closed ? ' disabled' : ''}>
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.8 3.9 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.7 1.1-1.6 2.7-2.7 4.7-2.7 3.4 0 5.6 3.3 4.5 6.6-1.7 4.8-9.2 9.4-9.2 9.4z"/></svg><span>${vs.length}</span>
              </button>
            </li>`;
          }).join('')}</ul>
        </div>`;
      }).join('')}`;
  }
  function pollDayHTML(day) {
    return (T.polls || []).filter((x) => x.day === day.date).map((p) => `<a class="poll-day" href="#ideas" data-goto="polls" data-poll-day="${esc(p.id)}">${p.kind === 'course' ? ICON.route : ICON.meal}<span>${esc(p.short || p.title)} 투표 중</span><em></em></a>`).join('');
  }
  function fillPolls() {
    view.querySelectorAll('[data-polls]').forEach((el) => { el.innerHTML = pollsBodyHTML(); });
    view.querySelectorAll('[data-poll-day]').forEach((el) => {
      const p = T.polls.find((x) => x.id === el.dataset.pollDay);
      const lead = p && leaderOf(p);
      el.querySelector('em').textContent = lead ? (lead.tie ? `공동 1등 ${lead.n}표` : `1등 ${lead.opt.name} ${lead.n}표`) : '';
    });
  }
  view.addEventListener('change', (e) => {
    const r = e.target.closest('input[name="pollname"]');
    if (r) { saveName(r.value); fillPolls(); }
  });
  view.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-vote]');
    if (!btn) return;
    const name = savedName();
    if (!name) { toast('먼저 이름을 골라주세요'); const w = view.querySelector('.poll-who'); if (w) { w.classList.remove('nudge'); void w.offsetWidth; w.classList.add('nudge'); } return; }
    const [poll, option] = btn.dataset.vote.split('|');
    votes = votes || {};
    const pv = (votes[poll] = votes[poll] || {});
    const list = (pv[option] = pv[option] || []);
    const i = list.indexOf(name);
    if (i >= 0) list.splice(i, 1); else list.push(name);
    fillPolls();
    try {
      const res = await fetch(FB.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'vote', poll, option, name }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      votes = data.votes || votes;
      fillPolls();
    } catch (err) {
      toast('투표를 저장하지 못했어요. 다시 눌러주세요');
      loadFeedback();
    }
  });

  /* 4. 가족 사진첩 (구글 드라이브에 저장 · 가족 비밀번호가 있어야 보고 올림) */
  const PKEY = 'jeju2026.photokey';
  const PH_CACHE = 'jeju2026.phcache';
  let photos = null;
  let photoErr = '';
  const photoKey = () => { try { return localStorage.getItem(PKEY) || ''; } catch (e) { return ''; } };
  // 구글 드라이브 사진 주소: 컴퓨터 브라우저에서 구글에 로그인돼 있으면 drive.google.com 주소가 로그인 화면으로 넘어가 깨져서,
  // 로그인과 상관없는 lh3 주소를 먼저 쓰고 안 되면 drive 주소로 한 번 더 시도
  const thumb = (id, w) => `https://lh3.googleusercontent.com/d/${encodeURIComponent(id)}=w${w}`;
  const thumbAlt = (id, w) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w${w}`;
  view.addEventListener('error', (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.alt || img.dataset.tried) return;
    img.dataset.tried = '1';
    img.src = img.dataset.alt;
  }, true);
  async function loadPhotos() {
    const key = photoKey();
    if (!FB.endpoint || !key) { fillAlbum(); return; }
    try {
      let data;
      try {
        const res = await fetch(`${FB.endpoint}?type=photos&key=${encodeURIComponent(key)}&t=${Date.now()}`);
        data = await res.json();
        if (data.ok) { try { localStorage.setItem(PH_CACHE, JSON.stringify(data)); } catch (e) { /* 무시 */ } }
      } catch (e) {
        data = JSON.parse(localStorage.getItem(PH_CACHE) || 'null');
        if (!data) throw e;
      }
      if (data.ok) { photos = data.photos || []; photoErr = ''; } else {
        photoErr = data.error || 'fail';
        if (photoErr === 'key') { try { localStorage.removeItem(PKEY); } catch (e) { /* 무시 */ } }
      }
    } catch (e) { photoErr = 'net'; }
    fillAlbum();
  }
  function albumBodyHTML(limit) {
    if (!FB.endpoint || (backendV && (backendV < 2 || !photosOn))) return '<p class="album-empty">사진첩은 곧 열려요 (민석이 설정하는 중)</p>';
    if (!backendV) return '<p class="fb-empty loading">불러오는 중…</p>';
    if (!photoKey()) {
      return `<form class="album-lock" data-album-lock>
        <p>가족 비밀번호를 넣으면 사진을 보고 올릴 수 있어요. 비밀번호는 단톡방에 있어요.</p>
        <div class="al-row"><input name="pk" class="fb-input" type="password" inputmode="numeric" autocomplete="off" placeholder="가족 비밀번호" aria-label="가족 비밀번호"><button type="submit" class="btn primary">열기</button></div>
        ${photoErr === 'key' ? '<p class="fb-status">비밀번호가 달라요. 다시 확인해 주세요.</p>' : ''}
      </form>`;
    }
    if (photos === null) return photoErr === 'net' ? '<p class="album-empty">사진을 불러오지 못했어요. 잠시 뒤 다시 열어주세요.</p>' : '<p class="fb-empty loading">불러오는 중…</p>';
    const list = limit ? photos.slice(0, limit) : photos;
    const up = `<label class="btn primary album-up"><input type="file" accept="image/*" multiple data-upload hidden>＋ 사진 올리기</label>`;
    if (!photos.length) return `<p class="album-empty">아직 사진이 없어요. 첫 사진을 올려주세요!</p>${up}`;
    const grid = (arr) => `<div class="ph-grid">${arr.map((ph) => `<button type="button" class="ph" data-ph="${esc(ph.id)}"><img src="${esc(thumb(ph.fileId, 480))}" data-alt="${esc(thumbAlt(ph.fileId, 480))}" alt="${esc(`${ph.name || '가족'}이 올린 사진`)}" loading="lazy" referrerpolicy="no-referrer"></button>`).join('')}</div>`;
    if (limit) return `${grid(list)}${up}`;
    const byDay = new Map();
    list.forEach((ph) => { const k = ph.day || ''; if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(ph); });
    return `${up}${[...byDay.entries()].map(([d, arr]) => `<h3 class="ph-day">${d ? esc(mdw(d)) : '날짜 없음'} <small>${arr.length}장</small></h3>${grid(arr)}`).join('')}`;
  }
  function fillAlbum() {
    view.querySelectorAll('[data-album]').forEach((el) => { el.innerHTML = albumBodyHTML(el.dataset.album === 'home' ? 6 : 0); });
    fillTodayPhoto();
    fillRecap();
  }

  /* ---------- 오늘의 한 장 (여행 중 홈) ---------- */
  function todayPhotoHTML(st) {
    if (st.phase !== 'during' || !FB.endpoint) return '';
    return '<section class="block" data-today-photo hidden></section>';
  }
  function fillTodayPhoto() {
    const el = view.querySelector('[data-today-photo]');
    if (!el) return;
    const st = tripState();
    const card = (txt) => `<a class="card tph-lock" href="#album"><span class="tph-ic" aria-hidden="true">📷</span><span><b>오늘의 한 장</b>${esc(txt)}</span></a>`;
    if (!photosOn) { el.hidden = true; return; }
    if (!photoKey()) { el.hidden = false; el.innerHTML = card('가족 비밀번호를 넣으면 오늘 올라온 사진이 여기 떠요'); return; }
    if (!photos) { el.hidden = true; return; }
    el.hidden = false;
    if (!photos.length) { el.innerHTML = card('오늘 첫 사진을 올려 주세요!'); return; }
    const todays = photos.filter((p) => p.day === st.iso);
    const ph = todays[0] || photos[0];
    const who = ph.name || '가족';
    el.innerHTML = `<div class="h-row"><h2 class="h">${todays.length ? '오늘의 한 장' : '가장 최근 사진'}</h2><a class="count link" href="#album">${todays.length ? `오늘 ${todays.length}장 · ` : ''}사진첩</a></div>
      <button type="button" class="card tph" data-ph="${esc(ph.id)}"><img src="${esc(thumb(ph.fileId, 900))}" data-alt="${esc(thumbAlt(ph.fileId, 900))}" alt="${esc(`${who}이 올린 사진`)}" referrerpolicy="no-referrer" loading="lazy"><span class="tph-cap">${esc(who)}${ph.day ? ` · ${esc(mdw(ph.day))}` : ''}</span></button>`;
  }

  /* ---------- 우리 제주 여행 (추억 모아보기) ---------- */
  function recapCardHTML(st) {
    if (st.phase !== 'after') return '';
    return `<section class="block"><a class="card recap-card" href="#recap">
      <span><b>우리 제주 여행 추억 모아보기</b><small>날짜별 사진 · 투표로 간 곳 · 가족 의견</small></span><span class="rc-go" aria-hidden="true">→</span>
    </a></section>`;
  }
  // 투표 1등 (마감 처리된 게 있으면 그걸, 아니면 지금 표가 제일 많은 곳)
  function pollWinner(p) {
    const v = (votes || {})[p.id] || {};
    const count = (id) => (v[id] || []).length;
    let best = null;
    if (p.decided && p.decided !== 'none') best = p.options.find((o) => o.id === p.decided) || null;
    if (!best) {
      const sorted = p.options.slice().sort((a, b) => count(b.id) - count(a.id));
      if (sorted[0] && count(sorted[0].id) > 0 && (!sorted[1] || count(sorted[0].id) > count(sorted[1].id))) best = sorted[0];
    }
    return best ? { name: best.name, n: count(best.id) } : null;
  }
  function renderRecap() {
    const st = tripState();
    const days = T.days.map((d, i) => {
      const hl = (d.items || []).filter((it) => it.status !== 'tbd').slice(0, 5);
      return `<section class="block rc-day" style="--dc:var(--d${i + 1})">
        <p class="dx-date"><b>${md(d.date)}</b> ${wd(d.date)}요일 <span class="dx-n">DAY ${i + 1}</span></p>
        <h2 class="rc-title">${esc(d.title)}</h2>
        <div class="card rc-card">
          <ul class="rc-list">${hl.map((it) => `<li><span>${esc(it.time || it.when || '')}</span>${esc(it.title)}</li>`).join('')}</ul>
          <div class="rc-photos" data-recap-photos="${d.date}"></div>
          <div class="rc-voices" data-recap-voices="${d.date}"></div>
        </div>
      </section>`;
    }).join('');
    return `<section class="block">
        <a class="back-link" href="#home">← 홈</a>
        ${peekHTML('recap')}
        <p class="page-kicker">${md(T.start)}(${wd(T.start)}) – ${md(T.end)}(${wd(T.end)}) · 일곱 식구</p>
        <h1 class="page-title">우리 제주 여행</h1>
        <p class="lede">${st.phase === 'after' ? '6일 동안의 추억을 날짜별로 모았어요.' : '여행이 끝나면 날짜별 사진과 추억이 여기 모여요. 지금은 미리보기예요.'}</p>
        <button type="button" class="kakao-share small" data-share="recap">${ICON.talk}<span>추억 페이지 카톡으로 보내기</span></button>
      </section>
      <section class="block"><div class="rc-stats" data-recap-stats></div></section>
      ${days}
      <section class="block"><h2 class="h">가족 투표로 정한 곳</h2><div class="card"><ul class="rc-polls" data-recap-polls></ul></div></section>`;
  }
  function fillRecap() {
    if (currentTab() !== 'recap') return;
    const items = fbItems || [];
    const list = photos || [];
    const stats = view.querySelector('[data-recap-stats]');
    if (stats) {
      const nVotes = Object.entries(votes || {}).filter(([k]) => !k.startsWith('rx:')).reduce((a, [, p]) => a + Object.values(p).reduce((b, arr) => b + arr.length, 0), 0);
      const cell = (n, l) => `<div><b>${n}</b><span>${l}</span></div>`;
      stats.innerHTML = cell(T.days.length, '일') + cell(photoKey() && photos ? list.length : '🔒', '사진') + cell(items.length, '의견') + cell(nVotes, '표')
        + (photosOn && !photoKey() ? '<a class="rc-lock" href="#album">가족 비밀번호를 넣으면 날짜별 사진도 보여요 →</a>' : '');
    }
    view.querySelectorAll('[data-recap-photos]').forEach((el) => {
      const arr = list.filter((p) => p.day === el.dataset.recapPhotos);
      if (!arr.length) { el.innerHTML = ''; return; }
      const more = arr.length - 6;
      el.innerHTML = `<div class="ph-grid">${arr.slice(0, 6).map((ph, k) => `<button type="button" class="ph" data-ph="${esc(ph.id)}"><img src="${esc(thumb(ph.fileId, 480))}" data-alt="${esc(thumbAlt(ph.fileId, 480))}" alt="${esc(`${ph.name || '가족'}이 올린 사진`)}" loading="lazy" referrerpolicy="no-referrer">${k === 5 && more > 0 ? `<span class="ph-more">+${more}</span>` : ''}</button>`).join('')}</div>`;
    });
    view.querySelectorAll('[data-recap-voices]').forEach((el) => {
      const arr = items.filter((x) => x.day === el.dataset.recapVoices).slice(0, 2);
      el.innerHTML = arr.map((x) => `<p class="rc-voice"><b>${esc(x.name || '가족')}</b>${esc(x.text)}</p>`).join('');
    });
    const pl = view.querySelector('[data-recap-polls]');
    if (pl) {
      const rows = (T.polls || []).map((p) => { const w = pollWinner(p); return `<li><span>${esc(p.short || p.title)}</span><b>${w ? `${esc(w.name)}${w.n ? ` · ${w.n}표` : ''}` : '아직 정하는 중'}</b></li>`; });
      pl.innerHTML = rows.join('') || '<li><span>투표가 없었어요</span></li>';
    }
  }
  function homeAlbumHTML() {
    return `<section class="block"><div class="h-row"><h2 class="h">가족 사진첩</h2><a class="count link" href="#album">전체 보기</a></div><div class="card album" data-album="home"></div></section>`;
  }
  function renderAlbum() {
    return `<section class="block">
        ${peekHTML('album')}
        <h1 class="page-title">가족 사진첩</h1>
        <p class="lede">여행 중에 찍은 사진을 같이 모아요. 올린 사진은 민석 구글 드라이브에 저장되고, 가족 비밀번호를 아는 사람만 볼 수 있어요.</p>
        ${tripState().phase !== 'before' ? '<a class="btn-link" href="#recap">날짜별 추억 페이지 보기</a>' : ''}
      </section>
      <section class="block"><div class="card album" data-album="all"></div></section>`;
  }
  view.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-album-lock]');
    if (!f) return;
    e.preventDefault();
    const v = String(new FormData(f).get('pk') || '').trim();
    if (!v) return;
    try { localStorage.setItem(PKEY, v); } catch (err) { /* 무시 */ }
    photos = null;
    fillAlbum();
    loadPhotos();
  });
  view.addEventListener('click', (e) => {
    const b = e.target.closest('[data-ph]');
    if (!b || !photos) return;
    const ph = photos.find((x) => x.id === b.dataset.ph);
    if (!ph) return;
    const im = lb.querySelector('img');
    im.referrerPolicy = 'no-referrer';
    im.onerror = () => { im.onerror = null; im.src = thumbAlt(ph.fileId, 1600); };
    openLightbox(thumb(ph.fileId, 1600), [ph.name, ph.day ? mdw(ph.day) : ''].filter(Boolean).join(' · '));
  });
  async function toJpeg(file, max = 1600) {
    let src;
    try { src = await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) {
      src = await new Promise((ok, no) => { const im = new Image(); im.onload = () => ok(im); im.onerror = no; im.src = URL.createObjectURL(file); });
    }
    const w0 = src.width || src.naturalWidth;
    const h0 = src.height || src.naturalHeight;
    const k = Math.min(1, max / Math.max(w0, h0));
    const c = document.createElement('canvas');
    c.width = Math.round(w0 * k);
    c.height = Math.round(h0 * k);
    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    const url = c.toDataURL('image/jpeg', 0.85);
    return { data: url.slice(url.indexOf(',') + 1), w: c.width, h: c.height };
  }
  // 실패하면 이유를 사람 말로 (구글 오류 화면은 HTML 로 와서 글자만 뽑아냄)
  function uploadErr(raw) {
    const t = String(raw || '');
    if (/authoriz|권한|permission|DriveApp/i.test(t)) return '구글 드라이브 권한이 아직 없어요 (민석이 Apps Script 에서 허용해야 해요)';
    if (t === 'key') return '가족 비밀번호가 달라요';
    if (t === 'bad image') return '사진 파일을 읽지 못했어요';
    if (t === 'convert') return '이 사진은 변환이 안 돼요. 다른 사진으로 해 보세요';
    if (t === 'net') return '서버에서 오류가 났어요 (구글 드라이브 권한 문제일 수 있어요)';
    const m = /(Exception|Error)[^<]{0,120}/.exec(t.replace(/<[^>]+>/g, ' '));
    return m ? m[0].trim() : t.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
  }
  view.addEventListener('change', async (e) => {
    const inp = e.target.closest('input[data-upload]');
    if (!inp || !inp.files.length) return;
    const files = [...inp.files].slice(0, 20);
    inp.value = '';
    const st = tripState();
    let ok = 0;
    let lastErr = '';
    for (let i = 0; i < files.length; i += 1) {
      toast(`사진 올리는 중 ${i + 1} / ${files.length}`);
      let img;
      try { img = await toJpeg(files[i]); } catch (err) { lastErr = 'convert'; continue; }
      try {
        const res = await fetch(FB.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'photo', key: photoKey(), name: savedName() || '가족', day: st.phase === 'during' ? st.iso : isoOf(today()), ...img }) });
        const txt = await res.text();
        let data = null;
        try { data = JSON.parse(txt); } catch (err) { lastErr = txt; }
        if (data && data.ok) ok += 1;
        else if (data) lastErr = data.error || 'fail';
      } catch (err) { lastErr = 'net'; }
    }
    const why = ok === files.length ? '' : uploadErr(lastErr);
    toast(ok === files.length ? `사진 ${ok}장 올렸어요!` : `${files.length}장 중 ${ok}장 올렸어요 · ${why}`);
    if (why) {
      // 토스트는 금방 사라지니 사진첩 안에도 남겨둠
      view.querySelectorAll('[data-album]').forEach((el) => {
        let p = el.querySelector('.album-err');
        if (!p) { p = document.createElement('p'); p.className = 'fb-status album-err'; el.prepend(p); }
        p.textContent = `올리지 못한 이유: ${why}`;
      });
    }
    if (ok) loadPhotos();
  });

  /* ---------- 날씨 자세히 (날씨를 누르면 아래에서 올라오는 창) ---------- */
  const wxSheet = document.createElement('div');
  wxSheet.className = 'sheet';
  wxSheet.hidden = true;
  wxSheet.setAttribute('role', 'dialog');
  wxSheet.setAttribute('aria-modal', 'true');
  document.body.appendChild(wxSheet);
  // 그날 머무는 동네 기준으로 네이버 날씨 검색
  const wxPlaceOf = (iso) => { const d = T.days.find((x) => x.date === iso); return d && d.night === 'shilla' ? '중문동' : '안덕면'; };
  function wxTips(w) {
    const tips = [];
    if (w.normal) return tips;
    if (w.pop != null && w.pop >= 50) tips.push('비 소식 · 우산 챙기고 실내 위주로 (일정 카드에 실내 후보 있어요)');
    else if (w.pop != null && w.pop >= 30) tips.push('비가 올 수도 있어요 · 우산 하나 챙겨요');
    if (w.wind != null && w.wind >= 9) tips.push(`바람이 세요 (최대 ${w.wind}m/s) · 해안길 · 오름은 조심`);
    if (w.max >= 26) tips.push('낮엔 더워요 · 태오는 얇게, 물 자주');
    if (w.min <= 16) tips.push('아침저녁 쌀쌀해요 · 겉옷 · 태오 담요');
    return tips;
  }
  function openWxSheet(iso) {
    const w = wxOf(iso);
    const hrs = (wxHours && wxHours[iso]) || [];
    const naver = `https://m.search.naver.com/search.naver?query=${encodeURIComponent(`${wxPlaceOf(iso)} 날씨`)}`;
    const tips = wxTips(w);
    wxSheet.innerHTML = `<div class="sheet-panel" tabindex="-1">
      <div class="sheet-grab" aria-hidden="true"></div>
      <div class="ws-head">
        <span class="ws-ic">${WX_ICON[w.type]}</span>
        <div><p class="ws-day">${esc(mdw(iso))} · ${esc(wxPlaceOf(iso))}</p>
          <p class="ws-main"><b>${w.normal ? '평년' : WX_LABEL[w.type]}</b> ${w.max}° / ${w.min}°</p>
          <p class="ws-sub">${w.normal ? '아직 예보가 없어서 10월 중순 평년값이에요' : [w.pop != null ? `비 올 확률 ${w.pop}%` : '', w.wind != null ? `바람 최대 ${w.wind}m/s` : ''].filter(Boolean).join(' · ')}</p></div>
        <button type="button" class="sheet-x" data-sheet-close aria-label="닫기">×</button>
      </div>
      ${hrs.length ? `<ol class="ws-hours">${hrs.map(([h, t, p, c, wd]) => `<li><span class="wh-h">${h}시</span>${WX_ICON[wxType(c)]}<b>${t}°</b><span class="wh-p${p >= 50 ? ' hi' : ''}">${p != null ? `${p}%` : ''}</span><span class="wh-w">${wd != null ? `${wd}m/s` : ''}</span></li>`).join('')}</ol>` : ''}
      ${tips.length ? `<ul class="ws-tips">${tips.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      <a class="ws-naver" href="${esc(naver)}" target="_blank" rel="noopener"><span class="ws-n">N</span>네이버 날씨에서 자세히 보기</a>
      <p class="ws-src">이 화면 예보는 Open-Meteo(세계 기상 모델) 기준이에요. 네이버 날씨는 기상청 예보라 조금 다를 수 있어요.</p>
    </div>`;
    wxSheet.hidden = false;
    document.documentElement.classList.add('lb-open');
    requestAnimationFrame(() => wxSheet.classList.add('in'));
    wxSheet.querySelector('.sheet-x').focus();
  }
  function closeWxSheet() {
    wxSheet.classList.remove('in');
    document.documentElement.classList.remove('lb-open');
    setTimeout(() => { wxSheet.hidden = true; }, 220);
  }
  wxSheet.addEventListener('click', (e) => { if (e.target === wxSheet || e.target.closest('[data-sheet-close]')) closeWxSheet(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !wxSheet.hidden) closeWxSheet(); });
  // 계획표 칸은 링크라서, 날씨를 누를 땐 링크 대신 날씨 창을 엶 (캡처 단계에서 먼저 가로챔)
  view.addEventListener('click', (e) => {
    const el = e.target.closest('[data-wx-open]');
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    openWxSheet(el.dataset.wxOpen);
  }, true);
  view.addEventListener('keydown', (e) => {
    const el = e.target.closest && e.target.closest('li[data-wx-open]');
    if (el && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openWxSheet(el.dataset.wxOpen); }
  });

  /* =====================================================================
     누구세요? · 내 일정 · 큰 글씨 — 어르신도 편하게
     ===================================================================== */
  const BIG_KEY = 'jeju2026.big';
  const ASKED_KEY = 'jeju2026.whoAsked';
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* 무시 */ } },
  };
  const me = () => T.people.find((p) => p.name === savedName() && p.id !== 'taeo') || null;
  const isBig = () => { const v = store.get(BIG_KEY); if (v === '1') return true; if (v === '0') return false; const p = me(); return Boolean(p && p.big); };
  function applyBig() {
    const big = isBig();
    document.documentElement.classList.toggle('big', big);
    // 큰 글씨일 땐 날아다니는 효과를 꺼서 화면을 차분하게
    document.documentElement.classList.toggle('calm', big);
    reduceMotion = big;
  }
  applyBig();

  // 어르신이 읽기 쉬운 시각: 21:40 → 밤 9:40, 12:00 → 낮 12시
  function friendlyTime(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    const part = h < 6 ? '새벽' : h < 12 ? '오전' : h < 13 ? '낮' : h < 18 ? '오후' : h < 21 ? '저녁' : '밤';
    const hh = h > 12 ? h - 12 : h;
    return `${part} ${hh}${m ? `:${String(m).padStart(2, '0')}` : '시'}`;
  }
  const presentOn = (p, iso) => { const g = T.groups.find((x) => x.id === p.group); return !g || (g.arrive.date <= iso && iso <= g.depart.date); };
  function forMe(p, it, iso) {
    if (!presentOn(p, iso)) return false;
    if (!it.who || it.who === 'all') return true;
    if (Array.isArray(it.who)) return it.who.includes(p.id);
    return it.who === p.group;
  }
  function myItems(p) {
    const out = [];
    T.days.forEach((d) => (d.items || []).forEach((it) => { if (forMe(p, it, d.date)) out.push({ ...it, date: d.date }); }));
    return out;
  }

  function meBarHTML() {
    const p = me();
    const big = isBig();
    if (!p) {
      return `<div class="me-bar"><button type="button" class="me-name" data-who-open>누구세요? <b>고르기</b></button><button type="button" class="me-big${big ? ' on' : ''}" data-big aria-pressed="${big}" aria-label="큰 글씨">가<small>+</small></button></div>`;
    }
    return `<div class="me-bar"><button type="button" class="me-name" data-who-open aria-label="사람 바꾸기"><b>${esc(p.name)}</b>${p.name.length > 2 ? '' : '님'} <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
      ${isAdmin() ? `<button type="button" class="me-notice" data-notice-open aria-label="공지 올리기"${notice && notice.text ? ' hidden' : ''}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4a1 1 0 0 0 1 1h2l5 4V5L7 9H5a1 1 0 0 0-1 1z"/><path d="M16 9a4 4 0 0 1 0 6"/></svg></button>` : ''}
      <button type="button" class="me-big${big ? ' on' : ''}" data-big aria-pressed="${big}" aria-label="큰 글씨 ${big ? '끄기' : '켜기'}">가<small>${big ? '−' : '+'}</small></button></div>`;
  }

  function myCardHTML(st) {
    const p = me();
    if (!p) return '';
    const items = myItems(p).filter((it) => it.time);
    const now = nowDate();
    const nowIso = isoOf(now);
    const cur = now.getHours() * 60 + now.getMinutes();
    const upcoming = items.filter((it) => it.date > nowIso || (it.date === nowIso && mins(it.time) >= cur - 15));
    const g = T.groups.find((x) => x.id === p.group);
    const start = g ? g.arrive.date : T.start;
    const left = dayDiff(today(), toDate(start));
    const badge = left > 0 ? `제주까지 ${left}일` : st.phase === 'during' ? `여행 ${st.index + 1}일째` : '';
    const next = upcoming[0];
    const rest = upcoming.slice(1, 2);
    const when = (it) => `${it.date === nowIso ? '오늘' : `${dom(it.date)}일(${wd(it.date)})`} ${friendlyTime(it.time)}`;
    const leftMin = next && next.date === nowIso ? mins(next.time) - cur : null;
    const day = T.days.find((d) => d.date === (next && next.date));
    // 길찾기 목적지: '출발' 일정이면 그 다음 정거장, 아니면 그 시각의 정거장
    const rt = (day && day.route) || [];
    const si = next ? rt.findIndex((r) => r.time === next.time) : -1;
    const stop = si < 0 ? null : (/출발/.test(next.title) && rt[si + 1] ? rt[si + 1] : rt[si]);
    return `<section class="block my-block">
      <div class="card my-card">
        <div class="my-top"><h2>${esc(p.name)} 일정</h2>${badge ? `<span class="my-badge">${esc(badge)}</span>` : ''}</div>
        ${next ? `<div class="my-next">
            <p class="my-when">${esc(when(next))}${leftMin != null && leftMin >= 0 ? `<em>${leftText(leftMin)}</em>` : ''}</p>
            <p class="my-what">${esc(next.title)}</p>
            ${next.note ? `<p class="my-note">${esc(next.note)}</p>` : ''}
            ${stop ? routeLink(stop.at, `${T.map.places[stop.at].name} 길찾기`) : ''}
          </div>
          ${rest.length ? `<ol class="my-list">${rest.map((it) => `<li><span>${esc(when(it))}</span><b>${esc(it.title)}</b></li>`).join('')}</ol>` : ''}`
        : '<p class="my-what">일정이 다 끝났어요. 조심히 들어가세요!</p>'}
        <div class="my-actions">
          ${p.group === 'b' && T.guideB ? '<a class="my-go" href="#guide">도착 · 출발 안내 크게 보기</a>' : ''}
          <button type="button" class="my-go ghost" data-my-all>내 일정 전부 보기</button>
        </div>
      </div>
    </section>`;
  }

  // 내 일정 전부: 아래에서 올라오는 창 (날씨 창과 같은 모양)
  function openMyAll() {
    const p = me();
    if (!p) return;
    const byDay = new Map();
    myItems(p).forEach((it) => { if (!byDay.has(it.date)) byDay.set(it.date, []); byDay.get(it.date).push(it); });
    wxSheet.innerHTML = `<div class="sheet-panel my-all" tabindex="-1">
      <div class="sheet-grab" aria-hidden="true"></div>
      <div class="ws-head"><div><p class="ws-day">${esc(p.name)}</p><p class="ws-main"><b>내 일정 전부</b></p></div><button type="button" class="sheet-x" data-sheet-close aria-label="닫기">×</button></div>
      ${[...byDay.entries()].map(([d, arr]) => `<h3 class="ma-day">${esc(mdw(d))}</h3><ol class="ma-list">${arr.map((it) => `<li><span>${esc(it.time ? friendlyTime(it.time) : (it.when || ''))}</span><div><b>${esc(it.title)}</b>${it.note ? `<p>${esc(it.note)}</p>` : ''}</div></li>`).join('')}</ol>`).join('')}
    </div>`;
    wxSheet.hidden = false;
    document.documentElement.classList.add('lb-open');
    requestAnimationFrame(() => wxSheet.classList.add('in'));
  }

  // 누구세요? 고르는 창
  function openWho() {
    const p = me();
    wxSheet.innerHTML = `<div class="sheet-panel who-panel" tabindex="-1">
      <div class="sheet-grab" aria-hidden="true"></div>
      ${((w) => (w ? `<img class="who-taeo" src="${esc(taeoSrc(w))}" alt="" width="${w.w}" height="${w.h}">` : '<img class="who-mandarin" src="assets/icons/mandarin.webp" alt="" width="72" height="72">'))(taeoPick('who'))}
      <h2 class="who-title">누구세요?</h2>
      <p class="who-sub">고르면 내 일정을 맨 위에 크게 보여드려요. 의견 · 투표 · 사진 올릴 때 이름도 자동으로 들어가요.</p>
      <div class="who-grid">${T.people.filter((x) => x.id !== 'taeo').map((x) => `<button type="button" class="who-btn${p && p.id === x.id ? ' on' : ''}" data-who="${esc(x.name)}">${esc(x.name)}</button>`).join('')}</div>
      <button type="button" class="who-skip" data-sheet-close>그냥 둘러볼게요</button>
    </div>`;
    wxSheet.hidden = false;
    document.documentElement.classList.add('lb-open');
    requestAnimationFrame(() => wxSheet.classList.add('in'));
  }
  wxSheet.addEventListener('click', (e) => {
    const b = e.target.closest('[data-who]');
    if (!b) return;
    saveName(b.dataset.who);
    store.set(ASKED_KEY, '1');
    try { localStorage.removeItem(BIG_KEY); } catch (err) { /* 무시 */ } // 사람에 맞는 기본값으로
    applyBig();
    closeWxSheet();
    render();
    window.scrollTo(0, 0);
  });
  view.addEventListener('click', (e) => {
    if (e.target.closest('[data-who-open]')) { openWho(); return; }
    if (e.target.closest('[data-my-all]')) { openMyAll(); return; }
    if (e.target.closest('[data-big]')) {
      store.set(BIG_KEY, isBig() ? '0' : '1');
      applyBig();
      render();
    }
  });
  // 처음 들어오면 한 번만 물어봄
  function askWhoOnce() {
    if (currentTab() !== 'home' || me() || store.get(ASKED_KEY)) return;
    store.set(ASKED_KEY, '1');
    setTimeout(openWho, 700);
  }

  /* ---------- 탭 전환 ---------- */
  const RENDER = { home: renderHome, plan: renderPlan, ideas: renderIdeas, pack: renderPack, info: renderInfo, album: renderAlbum, guide: renderGuide, recap: renderRecap };
  const currentTab = () => {
    const h = location.hash.replace('#', '');
    return TABS.includes(h) ? h : 'home';
  };

  function render() {
    const tab = currentTab();
    view.innerHTML = RENDER[tab]();
    const lit = { pack: 'info', guide: 'home', recap: 'home' }[tab] || tab; // 탭바에 없는 페이지는 들어온 탭에 불을 켬
    tabLinks.forEach((a) => {
      if (a.dataset.tab === lit) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    foot.textContent = `마지막 업데이트 ${md(T.updated)} · ${T.updatedBy}`;
    initMaps();
    fillFeedback();
    fillPolls();
    fillAlbum();
    fillWeather();
    updateTopbar();
    animateIn();
    placeBubble();
    fillBlockBadges();
    if (view.querySelector('[data-share]')) loadKakaoShare();
    requestAnimationFrame(() => { buildSky(); onScroll(); });
    askWhoOnce();
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

  /* ---------- 시간표 칸 자세히: 그 시간의 일정 · 반응(❤️🙋😋👶) · 의견 ---------- */
  // 반응은 투표 시트를 같이 써요 (투표 이름 'rx:날짜:시작시간', 다시 누르면 취소)
  const RX = [['love', '❤️', '기대돼요'], ['me', '🙋', '나도 할래'], ['yum', '😋', '맛있겠다'], ['cam', '📸', '사진 찍자'], ['baby', '👶', '태오도 좋아요']];
  const rxKey = (date, start) => `rx:${date}:${start}`;
  const rxList = (kind) => RX.filter(([k]) => (kind === 'meal' ? k !== 'cam' : k !== 'yum'));
  function blkInfo(v) {
    const [di, bk] = String(v).split('|').map(Number);
    const day = T.days[di];
    const b = day && day.blocks && day.blocks[bk];
    if (!b) return null;
    const [start, end, label, kind, tbd, pk] = b;
    return { di, bk, day, start, end, label, kind, tbd, pk };
  }
  const blkComments = (B) => (fbItems || []).filter((x) => x.day === B.day.date && String(x.text).includes(`${B.start}~${B.end}`));
  function blkCounts(B) {
    const r = (votes || {})[rxKey(B.day.date, B.start)] || {};
    const n = Object.values(r).reduce((a, arr) => a + arr.length, 0);
    return { rx: n, top: Object.entries(r).sort((a, b) => b[1].length - a[1].length)[0], cm: blkComments(B).length };
  }
  function fillBlockBadges() {
    document.querySelectorAll('[data-blk-badge]').forEach((el) => {
      const B = blkInfo(el.dataset.blkBadge);
      if (!B) return;
      const c = blkCounts(B);
      const em = c.top && c.top[1].length ? (RX.find(([k]) => k === c.top[0]) || [])[1] : '';
      el.textContent = [c.rx ? `${em || '❤️'}${c.rx}` : '', c.cm ? `💬${c.cm}` : ''].filter(Boolean).join(' ');
      el.classList.toggle('on', Boolean(c.rx || c.cm));
    });
  }
  function blockItems(B) {
    return (B.day.items || []).filter((it) => (it.time ? it.time >= B.start && it.time < B.end : norm(it.title).includes(norm(B.label)) || norm(B.label).includes(norm(it.title))));
  }
  let blkOpen = null;
  function openBlockSheet(v) {
    const B = blkInfo(v);
    if (!B) return;
    blkOpen = v;
    const ph = photoOf(B.pk);
    const items = blockItems(B);
    const meal = B.kind === 'meal';
    const poll = B.tbd && (T.polls || []).find((p) => p.day === B.day.date && (meal ? p.kind !== 'course' : p.kind === 'course') && today() <= toDate(p.closes));
    wxSheet.innerHTML = `<div class="sheet-panel blk-panel k-${esc(B.kind)}" tabindex="-1">
      <div class="sheet-grab" aria-hidden="true"></div>
      ${ph ? `<div class="blk-photo" style="background-image:url('${esc(new URL(ph.src, document.baseURI).href)}');background-position:${esc(ph.pos || 'center')}"></div>` : ''}
      <div class="ws-head"><div><p class="ws-day">${esc(mdw(B.day.date))} · ${esc(B.start)}–${esc(B.end)}</p><p class="ws-main"><span class="blk-kind">${kindIcon(B.kind)}</span><b>${esc(B.label)}</b>${B.tbd ? '<span class="slot-badge">빈 시간</span>' : ''}</p></div><button type="button" class="sheet-x" data-sheet-close aria-label="닫기">×</button></div>
      <div class="blk-body">
        ${items.length ? `<ul class="blk-items">${items.map((it) => `<li><span class="bi-t">${esc(it.time || it.when || '')}</span><div><b>${esc(it.title)}</b>${it.status && it.status !== 'ok' ? ` ${pill(it.status)}` : ''}${it.note ? `<p>${esc(it.note)}</p>` : ''}${it.place ? `<a class="bi-map" href="https://map.naver.com/p/search/${encodeURIComponent(it.place)}" target="_blank" rel="noopener">지도에서 보기</a>` : ''}</div></li>`).join('')}</ul>` : ''}
        ${B.tbd ? `<div class="slot-acts">${poll ? `<a class="slot-btn vote" href="#ideas" data-goto="polls" data-sheet-close>${poll.kind === 'course' ? ICON.route : ICON.meal}<span>투표하러 가기</span></a>` : ''}<button type="button" class="slot-btn find" data-place-find="${esc(B.day.date)}|${esc(B.start)}|${esc(B.end)}|${esc(B.label)}|${esc(B.kind)}">🔍 ${meal ? '먹을 곳' : '갈 곳'} 찾아서 제안</button></div>` : ''}
        <div class="blk-rx" data-blk-rx></div>
        <div class="blk-cm">
          <p class="blk-h">이 시간 이야기</p>
          <div data-blk-cms></div>
          <form class="blk-form" data-blk-form>
            <textarea name="t" class="fb-input" rows="2" maxlength="300" placeholder="${B.tbd ? '여기서 뭐 하고 싶어요?' : '기대되는 거, 궁금한 거, 아무거나'}"></textarea>
            <button type="submit" class="btn primary">남기기</button>
          </form>
          <p class="fb-status" data-blk-status aria-live="polite"></p>
        </div>
        <a class="blk-day" href="#plan" data-goto="day-${esc(B.day.date)}" data-sheet-close>${esc(dom(B.day.date))}일 일정 전체 보기 →</a>
      </div>
    </div>`;
    wxSheet.hidden = false;
    fillBlockSheet();
    document.documentElement.classList.add('lb-open');
    requestAnimationFrame(() => wxSheet.classList.add('in'));
  }
  function fillBlockSheet() {
    const B = blkOpen && blkInfo(blkOpen);
    if (!B || wxSheet.hidden) return;
    const rxEl = wxSheet.querySelector('[data-blk-rx]');
    const cmEl = wxSheet.querySelector('[data-blk-cms]');
    if (!rxEl || !cmEl) return;
    const r = (votes || {})[rxKey(B.day.date, B.start)] || {};
    const me = savedName();
    rxEl.innerHTML = `<div class="rx-row">${rxList(B.kind).map(([k, e, l]) => {
      const who = r[k] || [];
      const on = me && who.includes(me);
      return `<button type="button" class="rx${on ? ' on' : ''}" data-rx="${k}" aria-pressed="${Boolean(on)}"><span class="rx-e">${e}</span><span class="rx-l">${esc(l)}</span>${who.length ? `<b>${who.length}</b>` : ''}</button>`;
    }).join('')}</div>
      ${Object.values(r).some((a) => a.length) ? `<p class="rx-who">${rxList(B.kind).filter(([k]) => (r[k] || []).length).map(([k, e]) => `${e} ${esc(r[k].join(' · '))}`).join('<br>')}</p>` : '<p class="rx-who">처음으로 반응을 남겨 보세요</p>'}`;
    const cms = blkComments(B);
    cmEl.innerHTML = cms.length ? `<ul class="blk-cms">${cms.map((x) => `<li><b>${esc(x.name || '가족')}</b><p>${esc(String(x.text).replace(/^\d+일 [\d:]+~[\d:]+ \([^)]*\):\s*/, ''))}</p>${x.ai ? `<p class="blk-ai">✦ ${esc(String(x.ai).split('\n')[0])}</p>` : ''}</li>`).join('')}</ul>` : '<p class="blk-empty">아직 이야기가 없어요</p>';
  }
  async function toggleRx(k) {
    const B = blkOpen && blkInfo(blkOpen);
    if (!B) return;
    const name = savedName();
    if (!name) { toast('먼저 이름을 골라 주세요'); openWho(); return; }
    const poll = rxKey(B.day.date, B.start);
    votes = votes || {};
    const pv = (votes[poll] = votes[poll] || {});
    const arr = (pv[k] = pv[k] || []);
    const i = arr.indexOf(name);
    if (i >= 0) arr.splice(i, 1); else arr.push(name);
    fillBlockSheet();
    fillBlockBadges();
    try {
      const res = await fetch(FB.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'vote', poll, option: k, name }) });
      const data = await res.json();
      if (data.ok && data.votes) { votes = data.votes; fillBlockSheet(); fillBlockBadges(); }
    } catch (e) { toast('인터넷이 안 돼서 반응이 저장되지 않았어요'); }
  }
  async function sendBlockComment(form) {
    const B = blkOpen && blkInfo(blkOpen);
    if (!B) return;
    const t = String(new FormData(form).get('t') || '').trim();
    const st = wxSheet.querySelector('[data-blk-status]');
    if (!t) { st.textContent = '내용을 적어 주세요'; return; }
    const name = savedName();
    if (!name) { toast('먼저 이름을 골라 주세요'); openWho(); return; }
    const text = `${dom(B.day.date)}일 ${B.start}~${B.end} (${String(B.label).replace(/\s*\(미정\)/, '')}): ${t}`;
    st.textContent = '올리는 중…';
    try {
      const res = await fetch(FB.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'add', name, day: B.day.date, text, link: '', website: '' }) });
      const data = await res.json();
      if (!data.ok) throw new Error('fail');
      fbItems = [{ id: data.id, ts: new Date().toISOString(), name, day: B.day.date, text, link: '', ai: '', aiLink: '' }].concat(fbItems || []);
      form.reset();
      st.textContent = '남겼어요 · AI가 한 시간 안에 확인해요';
      fillBlockSheet();
      fillBlockBadges();
      fillFeedback();
    } catch (e) { st.textContent = '올리지 못했어요. 인터넷 연결을 확인해 주세요'; }
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-blk]');
    if (b && !e.target.closest('[data-wx-open]')) { e.preventDefault(); openBlockSheet(b.dataset.blk); }
  });
  wxSheet.addEventListener('click', (e) => {
    const r = e.target.closest('[data-rx]');
    if (r) { toggleRx(r.dataset.rx); return; }
    // 창 안의 '그날 일정 보기' · '투표하러 가기' 도 그 자리로
    const go = e.target.closest('[data-goto]');
    if (go) {
      pendingGoto = go.dataset.goto;
      if (location.hash === go.getAttribute('href')) { e.preventDefault(); window.dispatchEvent(new HashChangeEvent('hashchange')); }
    }
  });
  wxSheet.addEventListener('submit', (e) => { const f = e.target.closest('[data-blk-form]'); if (!f) return; e.preventDefault(); sendBlockComment(f); });

  /* ---------- 장소 찾아서 제안하기 (카카오 장소 검색 → 빈 시간에 제안 → AI 가 일정 · 투표에 반영) ---------- */
  const BASE = { lat: 33.300126, lon: 126.318729 }; // 서머셋
  let place = { ctx: null, results: [], pick: null, timer: null, seq: 0 };
  const kmFrom = (lat, lon) => {
    const R = 6371;
    const dLat = ((lat - BASE.lat) * Math.PI) / 180;
    const dLon = ((lon - BASE.lon) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((BASE.lat * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  };
  // 직선거리로 어림한 차 시간 (제주 국도 평균 40km/h, 굽은 길 1.3배)
  const driveMin = (km) => Math.max(5, Math.round(((km * 1.3) / 40) * 60 / 5) * 5);
  function allSlots() {
    const out = [];
    T.days.forEach((d) => daySlots(d).forEach((it) => { if (it.slot) out.push({ date: d.date, ...it.slot }); }));
    return out;
  }
  const slotKey = (x) => `${x.date}|${x.start}|${x.end}|${x.label}|${x.kind || ''}`;
  const slotName = (x) => `${dom(x.date)}일(${wd(x.date)}) ${x.start}~${x.end} ${String(x.label).replace(/\s*\(미정\)|\s*미정/g, '').trim()}`;
  function openPlaceSheet(ctx) {
    place = { ctx, results: [], pick: null, timer: null, seq: 0 };
    wxSheet.innerHTML = `<div class="sheet-panel pl-panel" tabindex="-1">
      <div class="sheet-grab" aria-hidden="true"></div>
      <div class="ws-head"><div><p class="ws-day">${ctx ? esc(slotName(ctx)) : '가고 싶은 곳 · 먹고 싶은 곳'}</p><p class="ws-main"><b>장소 찾아서 제안</b></p></div><button type="button" class="sheet-x" data-sheet-close aria-label="닫기">×</button></div>
      <div class="pl-body" data-pl-body></div>
    </div>`;
    wxSheet.hidden = false;
    document.documentElement.classList.add('lb-open');
    requestAnimationFrame(() => wxSheet.classList.add('in'));
    renderPlaceSearch();
    loadKakao();
  }
  const naverOf = (name, addr) => `https://map.naver.com/p/search/${encodeURIComponent(`${name} ${String(addr || '제주').split(' ').slice(0, 2).join(' ')}`.trim())}`;
  const isNaverLink = (v) => /^https?:\/\/(naver\.me|(m\.)?map\.naver\.com|m\.place\.naver\.com|place\.naver\.com)\//i.test(String(v).trim());
  function renderPlaceSearch(q = '') {
    const body = wxSheet.querySelector('[data-pl-body]');
    if (!body) return;
    body.innerHTML = `<div class="pl-search"><input type="search" class="fb-input" data-pl-q placeholder="예: 카멜리아힐, 흑돼지, 키즈카페" value="${esc(q)}" enterkeyhint="search" autocomplete="off"></div>
      <p class="pl-hint">이름이나 '흑돼지 · 키즈카페'처럼 종류로 찾아도 돼요. 네이버 지도 링크를 붙여 넣어도 돼요.</p>
      <ul class="pl-list" data-pl-list></ul>
      <div class="pl-naver">
        <p><b>네이버 지도에서 찾았어요</b><span>네이버 지도 앱 → 장소 → 공유 → 링크 복사 후 붙여 넣기</span></p>
        <a class="pl-n-open" href="https://map.naver.com/p/search/${encodeURIComponent(q ? `제주 ${q}` : '제주')}" target="_blank" rel="noopener" data-pl-naver-open><span class="ws-n">N</span>네이버 지도 열기</a>
        <button type="button" class="pl-n-paste" data-pl-paste>링크 붙여 넣기</button>
      </div>`;
    const inp = body.querySelector('[data-pl-q]');
    inp.focus({ preventScroll: true });
    if (q) runPlaceSearch(q);
  }
  async function runPlaceSearch(q) {
    const list = wxSheet.querySelector('[data-pl-list]');
    if (!list) return;
    q = q.trim();
    if (q.length < 2) { list.innerHTML = ''; return; }
    const my = ++place.seq;
    list.innerHTML = '<li class="pl-empty">찾는 중…</li>';
    const ok = await loadKakao();
    const K = window.kakao && window.kakao.maps;
    if (!ok || !K || !K.services) {
      list.innerHTML = `<li class="pl-empty">지금은 검색이 안 돼요. <a href="https://map.naver.com/p/search/${encodeURIComponent(`제주 ${q}`)}" target="_blank" rel="noopener">네이버 지도에서 찾기</a> 후 '글로 남기기'로 적어 주세요.</li>`;
      return;
    }
    const ps = new K.services.Places();
    const bounds = new K.LatLngBounds(new K.LatLng(JEJU_BOX[0][0], JEJU_BOX[0][1]), new K.LatLng(JEJU_BOX[1][0], JEJU_BOX[1][1]));
    ps.keywordSearch(q, (data, status) => {
      if (my !== place.seq) return; // 더 새 검색이 있으면 버림
      if (status !== K.services.Status.OK || !data.length) { list.innerHTML = '<li class="pl-empty">제주에서 찾는 곳이 없어요. 다른 이름으로 찾아 보세요.</li>'; return; }
      // 카카오 정확도 순서는 그대로 두고, 이름이 딱 맞는 곳을 맨 위로 · 주차장은 찾을 때만
      const nq = norm(q);
      place.results = data
        .filter((d) => d.category_group_code !== 'PK6' || /주차/.test(q))
        .map((d, k) => {
          const km = kmFrom(Number(d.y), Number(d.x));
          return { id: d.id, name: d.place_name, cat: String(d.category_name || '').split(' > ').pop(), addr: (d.road_address_name || d.address_name || '').replace('제주특별자치도 ', ''), url: d.place_url, lat: Number(d.y), lon: Number(d.x), km, rank: norm(d.place_name) === nq ? -1 : k };
        })
        .sort((a, b) => a.rank - b.rank);
      if (!place.results.length) { list.innerHTML = '<li class="pl-empty">제주에서 찾는 곳이 없어요. 다른 이름으로 찾아 보세요.</li>'; return; }
      list.innerHTML = place.results.map((r, k) => `<li class="pl-row">
        <button type="button" class="pl-pick" data-pl-pick="${k}">
          <b>${esc(r.name)}</b><span class="pl-cat">${esc(r.cat)}</span>
          <span class="pl-addr">${esc(r.addr)}</span>
          <span class="pl-dist">서머셋에서 차로 약 ${driveMin(r.km)}분 · ${r.km.toFixed(1)}km</span>
        </button>
        <a class="pl-map" href="${esc(naverOf(r.name, r.addr))}" target="_blank" rel="noopener" aria-label="${esc(r.name)} 네이버 지도"><span class="ws-n">N</span>지도</a>
      </li>`).join('');
    }, { bounds, size: 15, location: new K.LatLng(BASE.lat, BASE.lon) });
  }
  function renderPlaceConfirm() {
    const body = wxSheet.querySelector('[data-pl-body]');
    const r = place.pick;
    if (!body || !r) return;
    const slots = allSlots().filter((x) => today() <= toDate(x.date));
    const cur = place.ctx ? slotKey(place.ctx) : '';
    body.innerHTML = `<div class="pl-chosen"><b>📍 ${esc(r.name)}</b><span>${esc([r.cat, r.km != null ? `서머셋에서 차로 약 ${driveMin(r.km)}분` : ''].filter(Boolean).join(' · '))}</span><a href="${esc(r.naver ? r.url : naverOf(r.name, r.addr))}" target="_blank" rel="noopener">네이버 지도에서 보기</a></div>
      <form class="pl-form" data-pl-form>
        <p class="pl-label">언제 갈까요?</p>
        <div class="pl-slots">${slots.map((x) => `<label><input type="radio" name="slot" value="${esc(slotKey(x))}"${slotKey(x) === cur ? ' checked' : ''}><span>${esc(slotName(x))}</span></label>`).join('')}
          <label><input type="radio" name="slot" value=""${cur ? '' : ' checked'}><span>아무 때나 좋아요</span></label></div>
        <p class="pl-label">한마디 (선택)</p>
        <input name="memo" class="fb-input" maxlength="120" placeholder="예: 동백 예쁘대요, 유모차 되는지 궁금해요">
        <div class="nt-btns"><button type="submit" class="btn primary">제안 올리기</button><button type="button" class="btn" data-pl-back>다시 찾기</button></div>
        <p class="fb-status" data-pl-status aria-live="polite"></p>
      </form>`;
  }
  function renderNaverPaste(link = '') {
    const body = wxSheet.querySelector('[data-pl-body]');
    if (!body) return;
    body.innerHTML = `<form class="pl-form" data-pl-naver-form>
        <p class="pl-label">네이버 지도 링크</p>
        <input name="link" class="fb-input" inputmode="url" placeholder="https://naver.me/…" value="${esc(link)}" autocomplete="off">
        <p class="pl-label">장소 이름</p>
        <input name="name" class="fb-input" maxlength="40" placeholder="예: 카멜리아힐" required>
        <div class="nt-btns"><button type="submit" class="btn primary">다음</button><button type="button" class="btn" data-pl-back>다시 찾기</button></div>
        <p class="fb-status" data-pl-status aria-live="polite"></p>
      </form>`;
    const f = body.querySelector(link ? '[name=name]' : '[name=link]');
    if (f) f.focus({ preventScroll: true });
  }
  async function submitPlace(form) {
    const r = place.pick;
    const fd = new FormData(form);
    const sk = String(fd.get('slot') || '');
    const memo = String(fd.get('memo') || '').trim();
    const [date, start, end, label] = sk ? sk.split('|') : ['', '', '', ''];
    const when = sk ? `${dom(date)}일 ${start}~${end} (${String(label).replace(/\s*\(미정\)|\s*미정/g, '').trim()})에 가고 싶어요` : '언제든 가 보고 싶어요';
    const text = `📍 ${r.name} · ${when}${r.cat ? ` · ${r.cat}` : ''}${r.km != null ? ` · 서머셋에서 차로 약 ${driveMin(r.km)}분` : ''}${memo ? ` · ${memo}` : ''}`;
    const st = wxSheet.querySelector('[data-pl-status]');
    st.textContent = '올리는 중…';
    try {
      const name = savedName() || '가족';
      const res = await fetch(FB.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'add', name, day: date, text, link: r.url, website: '' }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'fail');
      fbItems = [{ id: data.id, ts: new Date().toISOString(), name, day: date, text, link: r.url, ai: '', aiLink: '' }].concat(fbItems || []);
      closeWxSheet();
      fillFeedback();
      refreshPlanPanel();
      toast('제안했어요 · AI가 한 시간 안에 확인하고 일정이나 투표에 넣어요');
    } catch (e) {
      st.textContent = '올리지 못했어요. 인터넷 연결을 확인하고 다시 해 주세요';
    }
  }
  wxSheet.addEventListener('input', (e) => {
    if (!e.target.matches('[data-pl-q]')) return;
    clearTimeout(place.timer);
    const q = e.target.value;
    // 검색칸에 네이버 지도 링크를 붙여 넣으면 바로 붙여 넣기 화면으로
    if (isNaverLink(q)) { renderNaverPaste(q.trim()); return; }
    const nv = wxSheet.querySelector('[data-pl-naver-open]');
    if (nv) nv.href = `https://map.naver.com/p/search/${encodeURIComponent(q.trim() ? `제주 ${q.trim()}` : '제주')}`;
    place.timer = setTimeout(() => runPlaceSearch(q), 350);
  });
  wxSheet.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.matches('[data-pl-q]')) { e.preventDefault(); clearTimeout(place.timer); runPlaceSearch(e.target.value); } });
  wxSheet.addEventListener('click', (e) => {
    const pk = e.target.closest('[data-pl-pick]');
    if (pk) { place.pick = place.results[Number(pk.dataset.plPick)]; renderPlaceConfirm(); return; }
    if (e.target.closest('[data-pl-back]')) { renderPlaceSearch(''); return; }
    if (e.target.closest('[data-pl-paste]')) {
      // 복사해 둔 링크가 있으면 바로 채움 (권한이 없으면 빈 칸)
      const go = (v) => renderNaverPaste(isNaverLink(v) ? v.trim() : '');
      if (navigator.clipboard && navigator.clipboard.readText) navigator.clipboard.readText().then(go, () => go(''));
      else go('');
    }
  });
  wxSheet.addEventListener('submit', (e) => {
    const nf = e.target.closest('[data-pl-naver-form]');
    if (nf) {
      e.preventDefault();
      const fd = new FormData(nf);
      const link = String(fd.get('link') || '').trim();
      const name = String(fd.get('name') || '').trim();
      const st = nf.querySelector('[data-pl-status]');
      if (link && !isNaverLink(link)) { st.textContent = '네이버 지도 링크가 아닌 것 같아요 (naver.me 로 시작해요)'; return; }
      if (!name) { st.textContent = '장소 이름을 적어 주세요'; return; }
      place.pick = { name, cat: '', km: null, naver: true, url: link || naverOf(name) };
      renderPlaceConfirm();
      return;
    }
    const f = e.target.closest('[data-pl-form]');
    if (!f) return;
    e.preventDefault();
    submitPlace(f);
  });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-place-find]');
    if (!b) return;
    const v = b.dataset.placeFind;
    if (!v) { openPlaceSheet(null); return; }
    const [date, start, end, label, kind] = v.split('|');
    openPlaceSheet({ date, start, end, label, kind });
  });
  function refreshPlanPanel() {
    const panel = view.querySelector('[data-plan-panel]');
    if (!panel || planDay == null) return;
    panel.innerHTML = planPanelHTML(planDay, tripState());
    fillFeedback();
    fillPolls();
    fillWeather();
    fillBlockBadges();
  }

  /* ---------- 민석 공지: 구글 시트 '공지' 칸에 적으면 모든 화면 맨 위에 띠로 ---------- */
  let notice = null;
  const NOTICE_KEY = 'jeju2026.noticeSeen';
  const noticeEl = document.createElement('div');
  noticeEl.className = 'notice';
  noticeEl.hidden = true;
  document.querySelector('.shell').prepend(noticeEl);
  function fillNotice() {
    const n = notice || T.notice || null;
    const t = isoOf(today());
    const live = n && n.text && (!n.until || t <= n.until);
    // 민석 폰에선 닫아도 계속 보여서(눌러서 고치기) 따로 '공지' 단추가 필요 없음
    const admin = typeof isAdmin === 'function' && isAdmin();
    const show = live && (admin || store.get(NOTICE_KEY) !== n.text);
    noticeEl.hidden = !show;
    document.querySelectorAll('.me-notice').forEach((b) => { b.hidden = Boolean(live); });
    if (!show) return;
    noticeEl.classList.toggle('is-admin', admin);
    noticeEl.innerHTML = `<p class="nt-body"><span class="nt-label">공지</span><span class="nt-text">${esc(n.text)}</span></p>${admin
      ? '<button type="button" class="nt-edit" data-notice-open>수정</button>'
      : '<button type="button" class="nt-x" data-notice-x aria-label="공지 닫기"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>'}`;
  }
  // 민석 폰에서만 '공지 올리기': 주소 끝에 ?admin=관리열쇠 를 붙여 한 번 열면 그 폰이 기억해요 (주소에서는 바로 지움)
  const ADMIN_KEY = 'jeju2026.admin';
  (() => {
    const m = location.search.match(/[?&]admin=([^&#]+)/);
    if (!m) return;
    store.set(ADMIN_KEY, decodeURIComponent(m[1]));
    const q = location.search.replace(/([?&])admin=[^&#]*&?/, '$1').replace(/[?&]$/, '');
    history.replaceState(null, '', location.pathname + q + location.hash);
  })();
  function isAdmin() { return Boolean(store.get(ADMIN_KEY)); }
  function openNoticeSheet() {
    const n = notice || {};
    const t0 = today();
    const t1 = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() + 1);
    const opts = [[isoOf(t0), '오늘까지'], [isoOf(t1), '내일까지'], ['', '계속']];
    const cur = n.text ? (n.until || '') : isoOf(t0);
    wxSheet.innerHTML = `<div class="sheet-panel nt-panel" tabindex="-1">
      <div class="sheet-grab" aria-hidden="true"></div>
      <div class="ws-head"><div><p class="ws-day">민석 폰에서만 보여요</p><p class="ws-main"><b>공지 올리기</b></p></div><button type="button" class="sheet-x" data-sheet-close aria-label="닫기">×</button></div>
      <form class="nt-form" data-notice-form>
        <textarea name="t" class="fb-input" rows="3" maxlength="200" placeholder="예: 내일 아침 9시에 로비에서 만나요 · 우산 챙겨요">${esc(n.text || '')}</textarea>
        <div class="nt-until">${opts.map(([v, l]) => `<label><input type="radio" name="u" value="${v}"${v === cur ? ' checked' : ''}><span>${l}</span></label>`).join('')}</div>
        <div class="nt-btns"><button type="submit" class="btn primary">올리기</button>${n.text ? '<button type="button" class="btn" data-notice-clear>공지 내리기</button>' : ''}</div>
        <p class="fb-status" data-nt-status aria-live="polite"></p>
      </form>
    </div>`;
    wxSheet.hidden = false;
    document.documentElement.classList.add('lb-open');
    requestAnimationFrame(() => wxSheet.classList.add('in'));
    const ta = wxSheet.querySelector('textarea');
    if (ta) ta.focus({ preventScroll: true });
  }
  async function sendNotice(text, until) {
    const st = wxSheet.querySelector('[data-nt-status]');
    if (st) st.textContent = '올리는 중…';
    try {
      const res = await fetch(FB.endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'notice', key: store.get(ADMIN_KEY), text, until }) });
      const data = await res.json();
      if (!data.ok) {
        if (st) st.textContent = data.error === 'unauthorized' ? '관리 열쇠가 맞지 않아요 (민석 폰에서 관리 주소로 다시 열어 주세요)' : data.error === 'unknown action' ? '구글 시트 코드를 새 버전으로 배포해 주세요' : '올리지 못했어요. 잠시 뒤 다시 해 주세요';
        return;
      }
      notice = data.notice || null;
      try { localStorage.removeItem(NOTICE_KEY); } catch (e) { /* 무시 */ }
      fillNotice();
      closeWxSheet();
      toast(text ? '공지를 올렸어요 · 모두의 화면 맨 위에 떠요' : '공지를 내렸어요');
    } catch (e) {
      if (st) st.textContent = '인터넷 연결을 확인해 주세요';
    }
  }
  wxSheet.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-notice-form]');
    if (!f) return;
    e.preventDefault();
    const fd = new FormData(f);
    const text = String(fd.get('t') || '').trim();
    if (!text) { wxSheet.querySelector('[data-nt-status]').textContent = '공지 내용을 적어 주세요'; return; }
    sendNotice(text, String(fd.get('u') || ''));
  });
  wxSheet.addEventListener('click', (e) => { if (e.target.closest('[data-notice-clear]')) sendNotice('', ''); });
  document.addEventListener('click', (e) => { if (e.target.closest('[data-notice-open]')) openNoticeSheet(); });

  noticeEl.addEventListener('click', (e) => {
    if (!e.target.closest('[data-notice-x]')) return;
    const n = notice || T.notice;
    if (n) store.set(NOTICE_KEY, n.text);
    noticeEl.hidden = true;
  });

  /* ---------- 인터넷이 끊겨도 열리게 (sw.js) ---------- */
  const offBar = document.createElement('p');
  offBar.className = 'offline-bar';
  offBar.setAttribute('role', 'status');
  offBar.textContent = '인터넷이 안 돼요 · 저장된 내용을 보여줘요';
  document.body.appendChild(offBar);
  const syncOnline = () => {
    const off = navigator.onLine === false;
    offBar.classList.toggle('show', off);
    if (!off && offBar.dataset.was === '1') { loadFeedback(); loadWeather(); }
    offBar.dataset.was = off ? '1' : '0';
  };
  window.addEventListener('online', syncOnline);
  window.addEventListener('offline', syncOnline);
  syncOnline();
  if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => { /* 지원 안 하는 브라우저: 그냥 온라인으로 */ }); });
  }

  render();
  fillNotice();
  if (currentTab() === 'plan') scrollToToday();
  loadFeedback();
  loadWeather();
})();
