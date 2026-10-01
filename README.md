# 2026 가을 제주 가족여행

일곱 식구 제주 여행(2026.10.11 – 10.16, 5박 6일)의 일정·숙소·준비물을 가족이 같이 보는 사이트예요.
휴대폰으로 보기 좋게 만들었고, 로그인 없이 링크만 있으면 열려요.

공개 주소 (GitHub Pages를 켠 뒤): https://dkdldrmtit.github.io/JEJU/

## 화면 구성

| 탭 | 내용 |
| --- | --- |
| 홈 | D-day, 6일 시간표(가로 날짜 × 세로 시간, 날짜별 인원 포함), 동선 지도, 정해진 예약, 준비 현황 |
| 일정 | 동선 지도(날짜별 · 전체), 날짜별 타임라인(확정 · 예정 · 미정) |
| 후보 | 가볼 곳 · 먹을 곳 후보 |
| 준비물 | 체크리스트 (체크 표시는 각자 휴대폰에만 저장) |
| 정보 | 도착·출발, 숙소, 렌터카, 날씨, 아플 때 연락처 |

## 내용 고치기

여행 내용은 전부 `data/trip.js` 한 파일에 있어요. 항공편 시간, 일정, 후보 장소를 여기서 고치면 화면이 알아서 바뀌어요.
날짜별 동선은 각 날짜의 `route`에 `map.places`의 이름을 순서대로 적으면 지도에 그려져요.

- `assets/app.js` — 데이터를 화면으로 그리는 코드
- `assets/style.css` — 디자인
- `assets/og-taeo-gyul.jpg` — 카카오톡에 링크 보낼 때 뜨는 미리보기 그림

## GitHub Pages로 공개하기

1. 저장소 **Settings → Pages**
2. **Build and deployment → Source**: `Deploy from a branch`
3. **Branch**: 이 파일들이 있는 브랜치, 폴더 `/ (root)` → **Save**
4. 1–2분 뒤 https://dkdldrmtit.github.io/JEJU/ 로 열려요

## 올리지 않는 것

공개 저장소라 누구나 볼 수 있어요. 예약번호, 개인 연락처, 금액·예산은 여기에 올리지 않아요.

## 카카오맵 켜기 (선택, 휴대폰 브라우저로 가능)

키가 없으면 동선 지도는 OpenStreetMap으로 나와요. 카카오맵으로 바꾸려면:

1. [developers.kakao.com](https://developers.kakao.com) 로그인 → **내 애플리케이션 → 애플리케이션 추가하기** (이름: 제주가족여행)
2. 만든 앱 → **앱 설정 → 플랫폼 → Web 플랫폼 등록** → 사이트 도메인 `https://dkdldrmtit.github.io`
3. **제품 설정 → 카카오맵** 에서 사용 설정 **ON**
4. **앱 키**의 **JavaScript 키**를 `data/trip.js` 의 `map.kakaoKey` 에 넣기 (또는 Claude에게 보내기)

JavaScript 키는 등록한 도메인에서만 동작해서 공개돼도 괜찮아요.
