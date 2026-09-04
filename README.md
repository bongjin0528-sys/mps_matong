# MPS Trigger Point Reference

통증 부위별 근육 클러스터링 참조 웹앱 (60개 부위, 355개 이미지)

## 구조
- `index.html` — 페이지 뼈대
- `style.css` — 스타일
- `app.js` — 동작 로직 (data.json을 fetch로 불러옴)
- `data.json` — 부위/근육/지도 데이터
- `images/` — 트리거포인트 이미지 (WebP)

## 로컬에서 확인하는 방법
`fetch()`로 data.json을 불러오기 때문에 `index.html`을 더블클릭해서 여는 것(`file://`)은 안 되고,
간단한 로컬 서버가 필요합니다.

```
python3 -m http.server 8000
```
그 다음 브라우저에서 http://localhost:8000 접속

## GitHub 업로드 → Lovable 연결
1. github.com에서 새 저장소 생성
2. 이 폴더 안의 파일/폴더 전체를 그대로 드래그 앤 드롭 업로드
3. Lovable에서 New Project → Import from GitHub → 이 저장소 선택
