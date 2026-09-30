/**
 * 제주 가족여행 — 가족 의견 받는 창구 (Google Apps Script 웹 앱)
 * 구글 시트에 붙여서 '웹 앱'으로 배포하면, 사이트에서 로그인 없이 의견을 남기고 볼 수 있어요.
 * 설정 방법은 backend/README.md 를 보세요.
 *
 * 시트 '의견' 열: id | ts | name | day | text | link | ai | aiLink | hidden
 *  - hidden 칸에 아무 글자나 적으면 사이트에서 숨겨져요 (지우고 싶은 의견).
 *  - ai / aiLink 칸은 AI가 조사해서 채워요 (AI_TOKEN 이 맞아야 쓸 수 있음).
 */
const SHEET_NAME = '의견';
const HEAD = ['id', 'ts', 'name', 'day', 'text', 'link', 'ai', 'aiLink', 'hidden'];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
  }
  return sh;
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// 길이 제한 + 시트 수식으로 해석되지 않게 막기
function clean_(v, n) {
  let s = String(v == null ? '' : v).slice(0, n).trim();
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function doGet() {
  const rows = sheet_().getDataRange().getValues().slice(1);
  const items = rows
    .filter((r) => r[0] && !r[8])
    .map((r) => ({
      id: String(r[0]),
      ts: r[1] instanceof Date ? r[1].toISOString() : String(r[1]),
      name: String(r[2]), day: String(r[3]), text: String(r[4]).replace(/^'/, ''), link: String(r[5]),
      ai: String(r[6]).replace(/^'/, ''), aiLink: String(r[7]),
    }));
  return out_({ items });
}

function doPost(e) {
  let body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out_({ ok: false, error: 'bad json' }); }
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
      const token = PropertiesService.getScriptProperties().getProperty('AI_TOKEN');
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
    return out_({ ok: false, error: 'unknown action' });
  } finally {
    lock.releaseLock();
  }
}
