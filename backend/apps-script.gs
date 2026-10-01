/**
 * 제주 가족여행 — 가족 의견 · 저녁 투표 · 사진첩 창구 (Google Apps Script 웹 앱)
 * 구글 시트에 붙여서 '웹 앱'으로 배포하면, 사이트에서 로그인 없이 쓸 수 있어요.
 * 설정 방법은 backend/README.md 를 보세요.
 *
 * 시트 '의견' 열: id | ts | name | day | text | link | ai | aiLink | hidden
 *  - hidden 칸에 아무 글자나 적으면 사이트에서 숨겨져요 (지우고 싶은 의견).
 *  - ai / aiLink 칸은 AI가 조사해서 채워요 (AI_TOKEN 이 맞아야 쓸 수 있음).
 * 시트 '투표' 열: poll | option | name | ts        (한 사람이 한 후보에 한 번, 다시 누르면 취소)
 * 시트 '사진' 열: id | ts | name | day | fileId | w | h | hidden
 *  - 사진 파일은 내 구글 드라이브 '제주여행 사진첩' 폴더에 저장돼요 (링크가 있는 사람만 보기).
 *  - 사진은 스크립트 속성 PHOTO_KEY(가족 비밀번호)를 아는 사람만 보고 올릴 수 있어요.
 *  - hidden 칸에 아무 글자나 적으면 사이트에서 숨겨져요.
 */
const VERSION = 2;
const SHEET_NAME = '의견';
const HEAD = ['id', 'ts', 'name', 'day', 'text', 'link', 'ai', 'aiLink', 'hidden'];
const VOTE_SHEET = '투표';
const VOTE_HEAD = ['poll', 'option', 'name', 'ts'];
const PHOTO_SHEET = '사진';
const PHOTO_HEAD = ['id', 'ts', 'name', 'day', 'fileId', 'w', 'h', 'hidden'];
const PHOTO_FOLDER = '제주여행 사진첩';

function sheetOf_(name, head) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(head);
    sh.setFrozenRows(1);
  }
  return sh;
}
const sheet_ = () => sheetOf_(SHEET_NAME, HEAD);

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 길이 제한 + 시트 수식으로 해석되지 않게 막기
function clean_(v, n) {
  let s = String(v == null ? '' : v).slice(0, n).trim();
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}
const iso_ = (v) => (v instanceof Date ? v.toISOString() : String(v));
const prop_ = (k) => PropertiesService.getScriptProperties().getProperty(k);
const photoOk_ = (key) => { const k = prop_('PHOTO_KEY'); return Boolean(k) && String(key || '') === k; };

function votes_() {
  const rows = sheetOf_(VOTE_SHEET, VOTE_HEAD).getDataRange().getValues().slice(1);
  const votes = {};
  rows.forEach((r) => {
    if (!r[0] || !r[1] || !r[2]) return;
    const p = (votes[r[0]] = votes[r[0]] || {});
    (p[r[1]] = p[r[1]] || []).push(String(r[2]));
  });
  return votes;
}

function photos_() {
  const rows = sheetOf_(PHOTO_SHEET, PHOTO_HEAD).getDataRange().getValues().slice(1);
  return rows
    .filter((r) => r[0] && r[4] && !r[7])
    .map((r) => ({ id: String(r[0]), ts: iso_(r[1]), name: String(r[2]), day: String(r[3]), fileId: String(r[4]), w: Number(r[5]) || 0, h: Number(r[6]) || 0 }))
    .reverse();
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.type === 'photos') {
    if (!photoOk_(p.key)) return out_({ ok: false, error: prop_('PHOTO_KEY') ? 'key' : 'off' });
    return out_({ ok: true, photos: photos_() });
  }
  const rows = sheet_().getDataRange().getValues().slice(1);
  const items = rows
    .filter((r) => r[0] && !r[8])
    .map((r) => ({
      id: String(r[0]),
      ts: iso_(r[1]),
      name: String(r[2]), day: String(r[3]), text: String(r[4]).replace(/^'/, ''), link: String(r[5]),
      ai: String(r[6]).replace(/^'/, ''), aiLink: String(r[7]),
    }));
  return out_({ v: VERSION, items, votes: votes_(), photosOn: Boolean(prop_('PHOTO_KEY')) });
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad json' }); }

  // 사진은 크기가 커서 잠금 밖에서 드라이브에 먼저 저장
  if (body.action === 'photo') {
    if (!photoOk_(body.key)) return out_({ ok: false, error: 'key' });
    const data = String(body.data || '');
    if (!/^[A-Za-z0-9+/=]+$/.test(data) || data.length > 8 * 1024 * 1024) return out_({ ok: false, error: 'bad image' });
    const it = DriveApp.getFoldersByName(PHOTO_FOLDER);
    const folder = it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER);
    const id = Utilities.getUuid().slice(0, 8);
    const blob = Utilities.newBlob(Utilities.base64Decode(data), 'image/jpeg', `${id}.jpg`);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const day = /^\d{4}-\d{2}-\d{2}$/.test(String(body.day || '')) ? body.day : '';
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheetOf_(PHOTO_SHEET, PHOTO_HEAD).appendRow([id, new Date(), clean_(body.name, 20), day, file.getId(), Number(body.w) || 0, Number(body.h) || 0, '']);
    } finally {
      lock.releaseLock();
    }
    return out_({ ok: true, id, fileId: file.getId() });
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    if (body.action === 'add') {
      if (body.website) return out_({ ok: true }); // 스팸 봇용 함정 칸 (사람은 안 보임)
      const text = clean_(body.text, 500);
      if (!text) return out_({ ok: false, error: 'empty' });
      const link = /^https?:\/\//.test(String(body.link || '')) ? clean_(body.link, 500) : '';
      const day = /^\d{4}-\d{2}-\d{2}$/.test(String(body.day || '')) ? body.day : '';
      const id = Utilities.getUuid().slice(0, 8);
      sh.appendRow([id, new Date(), clean_(body.name, 20), day, text, link, '', '', '']);
      return out_({ ok: true, id });
    }
    if (body.action === 'annotate') {
      const token = prop_('AI_TOKEN');
      if (!token || body.token !== token) return out_({ ok: false, error: 'unauthorized' });
      const rows = sh.getDataRange().getValues();
      for (let i = 1; i < rows.length; i += 1) {
        if (String(rows[i][0]) === String(body.id)) {
          sh.getRange(i + 1, 7, 1, 2).setValues([[clean_(body.ai, 1200), clean_(body.aiLink, 300)]]);
          return out_({ ok: true });
        }
      }
      return out_({ ok: false, error: 'not found' });
    }
    if (body.action === 'vote') {
      const poll = clean_(body.poll, 40);
      const option = clean_(body.option, 40);
      const name = clean_(body.name, 20);
      if (!poll || !option || !name) return out_({ ok: false, error: 'empty' });
      const vs = sheetOf_(VOTE_SHEET, VOTE_HEAD);
      const rows = vs.getDataRange().getValues();
      let found = 0;
      for (let i = rows.length - 1; i >= 1; i -= 1) {
        if (String(rows[i][0]) === poll && String(rows[i][1]) === option && String(rows[i][2]) === name) { vs.deleteRow(i + 1); found += 1; }
      }
      if (!found) vs.appendRow([poll, option, name, new Date()]);
      return out_({ ok: true, on: !found, votes: votes_() });
    }
    return out_({ ok: false, error: 'unknown action' });
  } finally {
    lock.releaseLock();
  }
}
