
## 검은화면 / CORS 오류 해결

`index.html`을 더블클릭해서 `file:///C:/...` 주소로 열면 Chrome 보안 정책 때문에 아래 기능이 막힙니다.

- `src/app.js` 같은 ES module 로딩
- `manifest.json` 로딩
- Service Worker / Cache API
- Firebase Auth / Database 연결 일부 기능

그래서 이 버전은 `file:///`로 열면 검은화면 대신 실행 안내 화면이 나오도록 수정했습니다.

### 가장 쉬운 실행법
압축을 푼 폴더에서 아래 파일을 더블클릭하세요.

```text
start_server.bat
```

그러면 자동으로 Chrome 또는 기본 브라우저에서 아래 주소가 열립니다.

```text
http://localhost:8080
```

### 수동 실행법
압축을 푼 폴더에서 주소창에 `cmd` 입력 후 엔터, 그 다음:

```bash
python -m http.server 8080
```

Chrome에서:

```text
http://localhost:8080
```

### GitHub Pages에서는?
GitHub Pages는 `https://` 주소로 실행되므로 이 CORS 문제가 발생하지 않습니다.

# Character PVP - 1차 빌드 이미지 포함 버전

GitHub Pages에서 바로 올려 실행할 수 있는 HTML/Firebase 기반 1차 버전입니다.

## 포함 기능
- Firebase 이메일/비밀번호 회원가입 / 로그인
- 플레이어 2개 생성 / 선택 / 삭제(비밀번호 재확인)
- 자동 저장
- 준비 화면 + 리소스 다운로드 버튼(Service Worker 캐시)
- 로비 UI (메인 / 제작소 / 상점 / 스쿼드 / 아이템)
- 개발자 모드 (코드 2359)
- 캐릭터 목록, 캐릭터 이미지 원형 적용
- 스킬/궁극기 이미지 연결
- 캐릭터팩 개봉 연출, 직접 구매
- 스쿼드 변경 / 캐릭터 강화
- 경쟁전 AI 시뮬레이션 (컨트롤 / 오토)
- 오토모드 프로필 도전 / 던전 시뮬레이션
- 랭킹 화면 / 미션 화면
- 컨트롤 / 오토 PvP 경기방 생성, 입장, 삭제
- 흰색 경기장 전투 UI 프리뷰 화면

## 이미지 포함 내역

### 캐릭터 이미지
Luffy.png, Zoro.png, Sanji.png, Blitzcrank.png, ChoiJun.png, YoonSung.png, Zed.png, Taric.png, BatOhtani.png, Ngannou.png, Duolingo.png, SpiderMan.png, Hulk.png, Hashirama.png, Madara.png, Kakashi.png

### 스킬 이미지
ThousandHands.png, Susanoo.png, Bat.png, SpiderWeb.png, Grab.png, Forearm.png, Shuriken.png, GumGum.png, Chidori.png, TaricStun.png, TigerHunt.png

## Firebase databaseURL 주의

사용자가 준 config에는 `databaseURL`이 없어서 코드에서 자동으로 아래 형식으로 추정합니다.

```js
databaseURL: "https://character1-default-rtdb.firebaseio.com"
```

실제 Realtime Database URL이 다르면 `src/config.js`에서 `databaseURL`을 직접 수정하세요.

## Realtime Database Rules

`firebase-rules.example.json` 파일을 참고해서 Firebase Realtime Database Rules에 붙여넣으면 됩니다.

## GitHub Pages 업로드 방법
1. zip 파일 압축 풀기
2. 압축을 푼 폴더 안의 파일들을 GitHub 저장소 root에 업로드
3. GitHub 저장소 → Settings → Pages
4. Source: Deploy from a branch
5. Branch: main / root
6. 저장 후 Pages 주소로 접속

## 로컬 테스트
```bash
python -m http.server 8080
```

접속:
```text
http://localhost:8080
```

## 2차에서 추가할 추천 범위
- Cloudflare Durable Objects 연결
- 실시간 WebSocket 전투
- 컨트롤모드 조이패드 조작
- 오토모드 실제 전투 엔진
- 스킬 이펙트/사운드 동기화
- PvP 준비/시작/종료 상세 플로우
