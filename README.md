# Flatlay Generator Frontend

Next.js 기반 프론트엔드 애플리케이션

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```bash
# 패스워드 설정 (필수)

# API URL 설정
NEXT_PUBLIC_API_URL=http://localhost:8000
```

또는 `.env.local.example` 파일을 복사:

```bash
cp .env.local.example .env.local
# .env.local 파일을 편집하여 패스워드 설정
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 빌드

```bash
npm run build
npm start
```

## 주요 기능

- 제품 정보 입력 (타입, Sub Type, Image URL)
- 여러 제품 추가/삭제
- Rulebook 설정 (선택사항)
- 템플릿 사용 옵션
- 생성된 이미지 미리보기
- 이미지 다운로드
- 토큰 사용량 및 비용 표시

## UI 특징

- 모던하고 깔끔한 디자인
- 반응형 레이아웃 (모바일 지원)
- 로딩 상태 표시
- 에러 메시지 표시
- 그라데이션 헤더
- 카드 기반 제품 입력 폼
