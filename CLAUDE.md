# 몽글몽글 놀이방 (mongle-playroom)

## 개요
- 4~6세 아이가 광고 없이 쓰는 터치 놀이 사이트. 사이트 주소: https://girinssam.github.io/mongle-playroom/
- 주 사용 기기: 태블릿 가로 화면(갤럭시탭·아이패드). 세로·휴대폰·컴퓨터도 지원
- 만든 사람: 언어재활사 꿈부자기린쌤 (Instagram @slp_girin). 코딩은 AI와 함께 진행

## 파일 구조
- index.html 한 개에 HTML·CSS·JS가 모두 들어 있음 (빌드 없음)
- images/ 폴더: cards(첫 화면 그림·버튼 그림), icons, balloons, bridge, coloring, hidden, dress, scenes, brand(기린 로고·파비콘), celebrate(칭찬 창 기린 3장)
- voice/ 폴더: 읽어 주는 목소리 녹음 mp3 (네이버 클로바더빙). fc(여자아이·다인)·mc(남자아이·하준)·fa(여자 어른·아라)·ma(남자 어른·종혁), 네 폴더 모두 같은 파일 이름
- voice-list.csv: 녹음 문장 목록 (파일 이름, 문장, 우선순위, 쓰이는 곳). index.html의 kidClip(문장↔파일 연결표)은 이 목록 중 실제로 녹음된 파일만 넣음
- sw.js: 인터넷 없이 열기용 서비스 워커 (아래 '서비스 워커')
- fonts/: Jua·Gowun Dodum 서브셋 woff2(사이트에서 쓰는 글자만)와 글꼴 라이선스(OFL-*.txt). 구글 글꼴 연결은 쓰지 않음 (아래 '글꼴')
- tools/font-subset.cjs: 글꼴 서브셋을 다시 만드는 스크립트 (사이트에서는 안 씀)
- GitHub Pages로 main 브랜치 루트에서 바로 배포

## 놀이 (3묶음 12개)
- 숫자·글자 놀이: 풍선 터뜨리기('풍선 15개 찾기'(시간 제한 없음·15개 정답 시 완료)와 '30초 도전' 두 방식), 동물들의 주문 받기, 징검다리 건너기, 전화기(준비 중)
- 보고 찾는 놀이: 같은 그림 찾기, 그림자 맞추기, 두더지 잡기('두더지 15마리 잡기'(시간 제한 없음·MOLE_GOAL=15마리 잡으면 완료)와 '30초 도전' 두 방식, 풍선과 같은 고르는 화면), 숨은 그림 찾기
- 숨은 그림 찾기는 그림 속 물건 6개를 모두 찾는 방식만 사용. 그림에 보이는 물건과 찾을 물건 수가 같아야 함 (hiddenPlay의 lv=0 '3개만 뽑기' 기능은 나중을 위해 남겨 둠)
- 숨은 그림 6장은 색칠 도안으로도 씀: 6개를 다 찾으면 칭찬 창에 '이 그림 색칠하기' 버튼이 나오고, 색칠하기 도안 고르기에도 기존 도안 뒤에 같은 이름으로 들어 있음. 도안 키는 'hidden-'+숨은 그림 키 (기존 도안 키와 이어 그리기 저장이 섞이지 않게)
- 만들기·꾸미기 놀이: 색칠하기, 그림 그리기, 퍼즐 맞추기(네모/퍼즐 모양 조각), 옷입히기(준비 중)
- 퍼즐(네모·퍼즐 모양)은 조각을 끌어다 맞는 자리 근처에 놓거나, 조각을 누른 뒤 자리를 눌러도 들어감
- 퍼즐 그림은 두 종류 (puzzleSolo·puzzleStory 배열, 고르는 화면에서도 이 순서로 두 묶음)
  - 그림 하나: 배경 없음, images/icons 그림 그대로 사용 (동물 → 탈것 순: 고양이·강아지·판다·개구리·자동차·기차·비행기·버스·소방차)
  - 이야기 그림: 배경 있음, 퍼즐판과 조각에는 images/puzzle/키.webp(큰 그림), 고르는 화면·보기 그림에는 images/puzzle/thumb/키.webp. 미리 불러오기 목록(preloadAll)에는 thumb만 넣음
- 조각 수(puzzleGrid, 네모·퍼즐 모양 같음): 그림 하나는 쉬움 4(2×2)·보통 6(3×2)·어려움 9(3×3), 이야기 그림은 쉬움 6(3×2)·보통 9(3×3)·어려움 12(가로 4×세로 3)
- 네모 퍼즐에서 그림이 거의 없는 조각(그림 부분이 BLANK_PIECE=20% 미만)끼리는 서로 바꿔 넣어도 맞음. 칸에는 그 칸의 원래 그림이 보임. 퍼즐 모양은 조각 모양으로 구분되니 해당 없음
- 네모 퍼즐 빈칸에는 그 칸의 그림이 흐리게 깔려 있음(--ghost 색으로 덮어 흐리게). 퍼즐 모양은 밑그림 없음
- 보기 그림: 태블릿 가로 화면은 판 오른쪽에 160px, 세로 화면·휴대폰은 판 아래 조각들 옆에 (--ref)
- 세로 화면에서는 보기 그림 바로 위 자리 바꾸기 버튼(#puzzle-side)으로 조각을 왼쪽/오른쪽에 둘 수 있음 (왼손잡이·오른손잡이). 기본은 조각 왼쪽, 고른 값은 이 기기에 기억(localStorage 'mongle-puzzle-pieces'). 가로 화면에서는 버튼 숨김
- 휴대폰 가로 화면(높이 500px 이하)은 판을 왼쪽에 화면 높이만큼 크게, 오른쪽에 조각들과 보기 그림. 자리 바꾸기 버튼 없음
- 12조각(가로 4칸)은 가로 화면의 조각 칸에서 3개씩 4줄로 놓아 조각 크기를 9조각과 같게 (--tcols). 세로 화면은 4개씩 3줄
- 놀이 방법 시범은 고양이 4조각 그대로

## 디자인 원칙
- 파스텔 그림책 분위기, 놀이마다 색 하나 (노랑·연두·하늘·분홍·연보라)
- 안내 글은 고운돋움, 아이가 누르는 버튼과 놀이 글자는 주아체
- 모든 버튼에는 기능을 알 수 있는 선 아이콘을 함께 넣음
- 놀이 화면의 '홈으로' 버튼은 모든 놀이에서 노란색(--butter)으로 통일
- 고르는 화면이 있는 놀이(같은 그림 찾기·주문 받기·징검다리·풍선·두더지·그림자·숨은 그림·색칠하기·퍼즐)는 놀이 화면에 '뒤로' 버튼이 있어 고른 옵션이 남은 채 고르는 화면으로 돌아감. shell(놀이, 컨트롤, 고르는 화면 함수)의 세 번째 값으로 지정. 기기의 뒤로 버튼도 같은 순서(놀이 → 고르는 화면 → 홈)
- 휴대폰(480px 이하)에서는 놀이 화면 위쪽 버튼(뒤로·홈으로)이 아이콘만 보임
- 그림은 갈색 외곽선의 귀여운 일러스트만 사용 (코드로 그린 도형 그림 쓰지 않음)
- 사용자는 글을 못 읽는 아이: 놀이 중 불필요한 글자는 넣지 않음
- 같은 그림 찾기·퍼즐·숨은 그림 찾기·그림자 맞추기는 틀려도 알림창을 띄우지 않음
- 맞혔을 때는 별·칭찬 말풍선 등 축하를 크게 (cheer 함수)
- 칭찬 창에는 대표 캐릭터 기린(images/celebrate)이 무작위로 나옴. 작품을 보여 주는 놀이(색칠하기·그림 그리기·옷입히기)는 작품을 보여 줌
- 각 놀이는 처음 할 때 '놀이 방법' 팝업(시범 애니메이션 + 짧은 문장)을 한 번 띄우고, 물음표 버튼으로 다시 볼 수 있음. 문장은 guides 객체에서 수정
- 놀이 방법 시범에서 손가락은 실제로 누르는 것만 누르고, 보기만 하는 것은 반짝임으로 표시. 배치는 실제 화면과 같게

## 켜고 끄는 설정 (index.html 안)
- const VOICE_ON=true; → 읽어 주는 목소리: 켜짐 (클로바더빙 네 목소리)
- 녹음 파일을 못 쓸 때(파일 없음·인터넷 없음)는 기기 목소리로 읽되 한국어(ko) 음성만 씀. 한국어 음성이 없는 기기에서는 다른 언어로 읽지 않고 소리 없이 넘어감 (ttsSpeak)
- const COMING_SOON=['dress','phone']; → 준비 중인 놀이. 첫 화면에 일부러 보이지 않게 함 (아이가 열리지 않는 버튼을 보고 기다리기 어렵기 때문). 이 동작은 바꾸지 말 것. 다 고치면 목록에서 빼기
- 주소 뒤 ?fit=1 → 준비 중인 놀이도 첫 화면에 보이고 열림, 옷 위치 맞추기 모드. 개발용이라 localhost(127.0.0.1)에서 열 때만 동작 (배포 주소에서는 무시)
- const FEEDBACK_URL → 의견 보내기 구글 설문지 주소
- const STATS_CODE → GoatCounter 방문자 수 세기 코드 (쿠키·개인정보 없음)
- 소리 버튼: 끄기는 한 번 누르기, 켜기는 1초 꾹 누르기
- 목소리 버튼(#voice-btn)과 소리 버튼(#sound)은 홈 화면에서만 보임. 놀이 화면에서는 .app:has(>#main[data-hue]) .header-actions로 숨김 (하단 버튼과 같은 조건)
- 앱 안 브라우저(인스타그램·카카오톡·페이스북·네이버)는 userAgent로 알아내 홈 위에 보호자용 안내 띠(.inapp-note)를 보여 줌. 카카오톡은 처음 한 번 kakaotalk://web/openExternal?url= 로 바깥 브라우저에서 열기
- 그림 미리 불러오기: 첫 화면에서는 홈 카드 그림만(preloadHome), 각 놀이 그림은 openGame에서 그 놀이를 처음 열 때(preloadGame, gameArt 표). 준비 중인 놀이 그림은 preloadAll에 넣지 않음. 새 그림을 넣으면 preloadAll에 경로 추가
- 보호자 안내는 꾹 누르기(holdify) 1초. 이 하단 버튼과 안내 문장, 출처·저작권 두 줄(.credit-note)은 홈 화면에서만 보임 (놀이 화면에서는 #main[data-hue]~footer로 숨김)
- 의견 보내기는 보호자 안내 '소개' 탭 안의 한 번 누르는 링크 버튼(FEEDBACK_URL, 새 창). 홈 하단에 두지 않음 (링크를 꾹 누르면 브라우저 링크 메뉴가 떠서 꾹 누르기가 끊기고, 코드로 새 창을 열면 팝업 차단될 수 있음)
- holdify는 누르는 동안 setPointerCapture로 포인터를 붙잡고(24px 넘게 벗어나면 취소), 길게 누르기 메뉴(contextmenu)를 막음
- 보호자 안내 '소개' 탭에 개인정보 안내(.news-privacy)가 있음. 모으는 정보가 바뀌면 이 문장도 고치기
- 보호자 안내 '소개' 탭 순서: 노란 상자(.news-intro, 소개 문장 + 의견 보내기 버튼. 줄바꿈 <br> 없이 이어 씀, '몽글몽글 놀이방'만 주아체 .news-brand) → '인터넷 없이 쓰기' 상자 → 개인정보 상자
- SNS 링크 미리보기: head의 og:·twitter: 태그, 그림은 images/brand/og.png(1200×630). 사이트 설명 문장은 meta description·og:description·twitter:description 세 곳을 같은 문장으로 맞추기
- 보호자 안내 창의 업데이트 소식은 siteNews 배열에 ['날짜',['소식']] 형식으로 추가

## 작업 규칙
- 작업 전에 항상 git pull
- 요청받은 부분만 바꾸고, 바꾼 부분을 보여 준 뒤 커밋·push
- 커밋 메시지는 한국어로 짧게
- 새 그림은 images/ 안 알맞은 폴더에 webp로 넣고 경로로 연결 (base64로 넣지 않기)
- 색칠하기는 캔버스를 쓰므로 파일을 직접 열면 안 되고, 사이트 주소로 확인
- 새로 만드는 누르는 영역(버튼이 아닌 캔버스·그림판 등)도 파란 터치 표시가 나오지 않는지 확인
- 읽어 줄 문장을 새로 만들면 voice-list.csv에 추가하고, 네 목소리 모두 클로바더빙으로 녹음해서 mp3(모노, 64kbps, 평균 -20dB 정도)로 넣기. 화면 글자와 녹음 문장을 똑같이 맞추기. 출처 표기 유지
- 그림 저장 파일 이름은 이름_날짜-시각.png로 매번 다르게 (같은 이름이면 안드로이드가 다시 다운로드할지 물어봄)

## 버전 올리기 규칙

이 저장소에서 사이트를 바꿔 push할 때마다 version.json의 v와 index.html의 APP_VERSION을 같은 새 값으로 올린다. 형식: 날짜-그날의 순번 (예: 2026.10.23-2).

- 앱으로 설치해 쓰는 기기는 열 때와 다시 돌아올 때 version.json을 확인해서, 값이 APP_VERSION과 다르면 홈 화면에서 새로 고친다.
- 두 값이 다르게 push되면 새로 고친 뒤에도 계속 예전 버전으로 판단하므로, 반드시 같은 값으로 맞춘다.
- sw.js는 고치지 않아도 된다. index.html이 sw.js?v=APP_VERSION으로 등록하므로 APP_VERSION이 바뀌면 새 서비스 워커가 설치되고, 화면 저장본(mongle-shell-버전)만 새로 만들어지고 예전 것은 지워진다. 그림·목소리·글꼴 저장본(mongle-assets)은 버전이 바뀌어도 그대로 둔다 (바뀐 파일만 뒤에서 새로 받음).
- 화면에 보이는 글자를 바꿨으면(새 문장·낱말) tools/font-subset.cjs의 확인(--check)을 돌리고, 빠진 글자가 있으면 서브셋을 다시 만든다 (아래 '글꼴').

## 서비스 워커 (sw.js, 인터넷 없이 열기)
- 저장본 두 개
  - mongle-shell-버전: index.html·version.json·manifest.json. 네트워크 우선(안 되면 저장본). 버전이 바뀌면 예전 것은 지움
  - mongle-assets: images·voice·fonts. 버전이 바뀌어도 지우지 않음. 저장본을 먼저 보여 주고 뒤에서 확인해 바뀐 파일만 새로 저장(stale-while-revalidate). 같은 파일은 10분에 한 번만 확인 (GitHub Pages 캐시 시간과 같게)
  - 바뀐 파일은 파일 크기(HEAD 요청의 Content-Length)로 알아냄. GitHub Pages는 배포할 때마다 모든 파일의 ETag·Last-Modified가 바뀌어서 그것으로는 구분이 안 되기 때문. 그래서 그림·목소리를 바꿨는데 바이트 크기가 예전 파일과 똑같으면 새 파일로 안 바뀜 (거의 없는 일. 그럴 때는 파일 이름을 바꿔서 연결)
  - 바뀐 그림은 그 그림을 쓴 다음번 열 때(또는 다음 화면)부터 보임
- 처음 열 때는 홈에 필요한 것(index.html, 글꼴, 기린·첫 화면·놀이 카드 그림)을 저장. 놀이 그림은 써 본 놀이만 저장
- 앱으로 설치해서 열었을 때(display-mode fullscreen·standalone·minimal-ui 또는 아이패드 navigator.standalone. 크롬 '바로가기'로 추가한 것은 해당 안 됨)만: 공개된 놀이의 그림 전체(preloadAll + 퍼즐 큰 그림 + 목소리 고르기 그림)와 지금 고른 목소리 폴더 중 저장본에 없는 파일만 뒤에서 미리 저장(swStart, swWarmVoice). 목소리를 바꾸면 그 폴더도 저장
- 이때 지금 사이트에서 쓰는 파일 전체 목록(keep: 그림 + 네 목소리 폴더 + 글꼴 + 앱 아이콘)도 같이 보내서, 목록에 없는 예전 파일(지운 그림·목소리)은 mongle-assets에서 지움. 새 그림 폴더나 파일을 쓰게 되면 preloadAll(또는 swStart의 keep)에 넣어야 지워지지 않음
- 준비 중인 놀이(COMING_SOON) 그림은 preloadAll에 없어서 미리 저장하지 않음. 그 놀이에만 쓰는 목소리 파일은 soonVoice(놀이별 파일 이름 규칙)로 빼 둠. 전화기·옷입히기 목소리를 새 이름으로 녹음하면 soonVoice도 맞추기
- 새 sw.js는 기다리지 않고 바로 적용(skipWaiting, clients.claim)
- '인터넷 없이 쓰기' 상자(보호자 안내 '소개' 탭, offlineInit): 버튼을 누르면 공개된 놀이의 그림 전체(offlineArt)와 지금 고른 목소리 폴더(offlineVoice)를 mongle-assets에 받음. 이미 받은 파일은 건너뛰어서 끊겨도 다시 누르면 없는 것만 받음. 받는 동안 '받는 중 120/287'처럼 보이고, 다 받으면 '준비 완료'. 목소리를 바꾸면 그 목소리가 아직 없으니 버튼이 다시 보임
  - 버튼의 '약 ○MB'는 const OFFLINE_MB (지금 5: 그림 130개 3.4MB + 목소리 한 폴더 약 1.2MB). 그림·목소리를 많이 더하거나 빼면 다시 계산해서 고치기
  - 상자 맨 아래 작은 글씨: 서비스 워커 작동 여부 · 앱 설치 모드 여부 · 저장된 그림 수/전체 · 저장된 목소리 수/전체. 기기에서 저장이 안 될 때 이것부터 확인
- 목소리 고르기에서 다른 목소리를 누르면(voiceUsable): 그 목소리 파일이 이 기기에 다 받아져 있으면 인터넷이 없어도 바로 바꿈. 아니면 인터넷을 확인(navigator.onLine이 false거나, 아직 없는 그 목소리 파일 하나를 실제로 받아 보기가 5초 안에 안 되면 인터넷 없음)해서, 인터넷이 없으면 목소리를 바꾸지 않고 안내창(voiceOfflineNotice, 확인 버튼 하나)을 띄움
- 저장본에는 200(파일 전체) 응답만 넣음. 오디오의 부분 요청(Range)은 저장본에 없으면 Range 없이 파일 전체를 받아 저장한 뒤 요청한 부분만 잘라 206으로 돌려줌
- 목소리 mp3는 부분 요청(Range)에 저장본을 잘라 206으로 답함 (사파리 재생용). 음성 파일 자체는 바꾸지 않음
- 문제가 생겼을 때 (새 버전이 안 들어오거나 화면이 이상할 때)
  - 모든 기기에서 끄기: index.html의 const SW_ON=true;를 false로 바꾸고 버전을 올려 push. index.html은 네트워크 우선이라, 인터넷에 연결된 기기는 다음에 열 때 서비스 워커를 해제하고 mongle-로 시작하는 저장본(mongle-shell-버전, mongle-assets 둘 다)을 지운다. 고친 뒤 다시 true로
  - sw.js 자체가 고장 나서 index.html도 안 바뀔 때: sw.js 내용을 아래로 바꿔 push (저장본을 지우고 스스로 해제한 뒤 화면을 다시 열어 줌)
    self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())await caches.delete(k);await self.registration.unregister();for(const c of await self.clients.matchAll({type:'window'}))c.navigate(c.url)})()));
  - 내 기기 하나만: 크롬 개발자 도구 > Application > Service workers > Unregister, Storage > Clear site data. 태블릿·휴대폰은 크롬 설정 > 사이트 설정 > 모든 사이트 > girinssam.github.io > 데이터 삭제 (사파리: 설정 > Safari > 고급 > 웹사이트 데이터)
- 확인: 로컬 서버(localhost)에서 열고 크롬 개발자 도구 > Network > Offline으로 바꿔 새로 고침

## 글꼴
- fonts/jua.woff2·fonts/gowun-dodum.woff2는 index.html·voice-list.csv에 쓰인 글자와 영문·숫자·기호만 남긴 서브셋. 여기에 없는 글자는 기기 기본 글꼴로 보임
- fonts/not-in-font.json: 원본 글꼴에도 없는 글자 목록(이모지, 주아체의 ‘’·… 등). 서브셋을 만들 때 스크립트가 자동으로 씀. 직접 고치지 않음
- 준비(한 번): 저장소 밖 임시 폴더에서 npm i subset-font fontkit
- 빠진 글자 확인: 같은 임시 폴더에서 node <저장소>/tools/font-subset.cjs <저장소> --check
  - '빠진 글자 없음'이면 그대로 두면 됨. '빠진 글자 N개 → 서브셋을 다시 만들어 주세요'가 나오면 아래처럼 다시 만들기
  - '(참고) 원본 글꼴에도 없어…'는 원래 글꼴에 없는 글자라 다시 만들어도 같음 (기기 글꼴로 보임)
- 서브셋 다시 만들기:
  1. 원본 글꼴 받기 (저장소에 넣지 않음): https://github.com/google/fonts/raw/main/ofl/jua/Jua-Regular.ttf , https://github.com/google/fonts/raw/main/ofl/gowundodum/GowunDodum-Regular.ttf
  2. 같은 임시 폴더에서 node <저장소>/tools/font-subset.cjs <저장소> <Jua-Regular.ttf> <GowunDodum-Regular.ttf> → fonts/의 두 woff2와 not-in-font.json이 새로 만들어지고, 끝에 확인도 자동으로 함
  - 파이썬이 있으면 pyftsubset으로 만들어도 됨: pyftsubset Jua-Regular.ttf --text-file=글자목록.txt --flavor=woff2 --output-file=fonts/jua.woff2 (글자목록은 index.html·voice-list.csv 내용). 이때는 not-in-font.json이 안 바뀌니 확인 결과의 '빠진 글자'에 원본에 없는 글자가 섞일 수 있음
- 글꼴 라이선스는 SIL OFL 1.1 (fonts/OFL-*.txt). 글꼴 파일을 넣을 때 라이선스 파일도 같이 둔다

## 남은 할 일
- 전화기·옷입히기 문장 34개 녹음 (voice-list.csv 우선순위 2)
- 전화기·옷입히기 다듬은 뒤 열기
- 숨은 그림 찾기 3개 찾기: 물건 3개만 숨은 그림을 따로 만들어서 추가하기
- (아이디어) 도움 손가락: 아이가 몇 초 동안 아무것도 안 누르면 정답 쪽을 손가락 그림이 살짝 가리켜 주기
