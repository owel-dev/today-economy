# 오늘의 경제뉴스

매일 아침 경제 신문 기사를 자동으로 수집·요약하여 WordPress, 이메일, Slack 등으로 발행하는 자동화 도구입니다.

## 동작 방식

```
신문사 기사 수집 (텍스트/이미지 OCR)
    ↓
불필요한 내용 제거 (GPT)
    ↓
중복 기사 병합 (GPT)
    ↓
핵심 내용 요약 (GPT)
    ↓
경제 용어 해설 추가 (GPT)
    ↓
발행 (터미널 / WordPress / 이메일 / Slack)
```

## 요구사항

- Node.js 18+
- OpenAI API Key (GPT)
- Google Cloud Vision API Key (이미지 기사 OCR 사용 시)
- 발행 채널에 따라: Gmail 앱 비밀번호 / Slack Bot Token / WordPress 앱 비밀번호

## 설치

```bash
npm install
```

## 설정

### 1. 환경 변수

`.env.example`을 복사하여 `.env` 파일을 만들고 값을 채웁니다.

```bash
cp .env.example .env
```

| 변수 | 설명 |
|---|---|
| `MODE` | 실행 모드: `terminal`, `wordpress`, `email`, `slack` |
| `GPT_API_KEY` | OpenAI API 키 |
| `GCP_API_KEY` | Google Cloud Vision API 키 (이미지 기사 사용 시) |
| `GMAIL_USER` | 발신 Gmail 주소 |
| `GMAIL_APP_PASSWORD` | Gmail 앱 비밀번호 |
| `SLACK_BOT_TOKEN` | Slack Bot Token (`xoxb-...`) |
| `SLACK_CHANNEL` | 발행할 Slack 채널 이름 |
| `WP_URL` | WordPress 사이트 URL |
| `WP_USERNAME` | WordPress 사용자 이름 |
| `WP_APP_PASSWORD` | WordPress 앱 비밀번호 |

### 2. 신문사 및 수신자 설정

`config.js.example`을 복사하여 `config.js` 파일을 만듭니다.

```bash
cp config.js.example config.js
```

```js
// --- 수집 대상 신문사 ---
export const newspapers = [
  {
    name: '신문사A',
    type: 'image',  // 이미지 기사 → Google Vision OCR로 텍스트 추출
    url: 'https://example.com/news/{year}{month}{day}/page.jpg',
  },
  {
    name: '신문사B',
    type: 'text',   // 텍스트 기사 → 직접 크롤링
    url: 'https://example.com/news/{year}/{month}/{day}/article',
  },
];

// --- 이메일 수신자 ---
export const emailRecipients = [
  { name: '홍길동', address: 'example@gmail.com' },
];
```

- URL의 `{year}`, `{month}`, `{day}`는 실행 시점의 날짜로 자동 치환됩니다.
- `type: image`: 이미지 URL에서 Google Cloud Vision OCR로 텍스트를 추출합니다.
- `type: text`: URL에서 HTML 텍스트를 직접 가져옵니다.

## 실행

```bash
# 터미널에 출력
MODE=terminal npm start

# WordPress에 포스팅
MODE=wordpress npm start

# 이메일 발송
MODE=email npm start

# Slack 메시지 발송
MODE=slack npm start
```

## 프로젝트 구조

```
├── index.js                  # 진입점
├── config.js                 # 신문사·수신자 설정
├── .env                      # 환경 변수
├── prompts/                  # GPT 프롬프트 파일
│   ├── remove-unnecessary.md
│   ├── merge-duplicate.md
│   ├── summary.md
│   └── add-terms-glossary.md
└── src/
    ├── news.js               # 기사 수집 및 처리 파이프라인
    ├── scraper.js            # 텍스트/이미지 크롤러
    ├── llm.js                # OpenAI API 호출
    ├── prompts.js            # 프롬프트 로더
    ├── constants.js
    ├── utils.js
    └── publishers/
        ├── email.js          # Gmail 발송
        ├── slack.js          # Slack 발송
        └── wordpress.js      # WordPress 포스팅
```
