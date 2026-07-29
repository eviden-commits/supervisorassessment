# 📋 관리감독자 업무수행 평가 프로그램 (SupervisorAssessment)

본 프로그램은 구글 스프레드시트 + Google Apps Script (GAS) 백엔드와 GitHub Pages (HTML/CSS/JS) 프론트엔드를 기반으로 구현된 **관리감독자 정기 업무수행 평가 및 3단계 결재선 종합보고서 관리 시스템**입니다.

---

## 📁 주요 파일 구성

```
SupervisorAssessment/
├── index.html                  # 현장소장용 평가표 작성 UI
├── admin.html                  # 관리자 대시보드 및 3단계 결재선 A4 보고서 출력 UI
├── style.css                   # Pretendard 폰트 기반 고급 디자인 시스템
├── app.js                      # index.html 프론트엔드 비동기 통신 & 유효성 검증 & 서명 패드
├── admin.js                    # admin.html 관리자 통신 & SheetJS 엑셀 다운로드/일괄 업로드
├── gas/                        # Google Apps Script 백엔드 모듈
│   ├── appsscript.json         # Apps Script 매니페스트
│   ├── Code.gs                 # REST API Web App 엔드포인트
│   ├── Auth.gs                 # 비밀번호(Addpassword) 검증 & Email OTP 인증
│   ├── Assessment.gs           # 평가표 데이터 저장 로직
│   ├── Admin.gs                # 인원 일괄 업로드 & automail 미제출 독려 메일
│   ├── DriveVault.gs           # 구글 드라이브 Data 폴더 생성 & 서명 PNG 파일 저장
│   ├── QuestionsData.gs        # 20개 문항 및 근거 법률 JSON 모듈
│   └── SpreadsheetSetup.gs     # 시트 자동 구축 & 테스트 데이터(최난새 nschoi@sebangtec.com)
└── README.md                   # 설정 및 배포 안내 문서
```

---

## ⚙️ 설정 및 설치 방법

### 1. 구글 스프레드시트 & Apps Script 설정
1. 구글 드라이브에서 **새 구글 스프레드시트**를 하나 만듭니다.
2. 스프레드시트 메뉴에서 `확장 프로그램` > `Apps Script`를 클릭합니다.
3. `gas/` 폴더 내의 `.gs` 파일들 내용(`Code.gs`, `Auth.gs`, `Assessment.gs`, `Admin.gs`, `DriveVault.gs`, `QuestionsData.gs`, `SpreadsheetSetup.gs`)을 Apps Script 에디터에 각각 파일로 추가하여 붙여넣습니다.
4. `SpreadsheetSetup.gs` 파일의 `setupSpreadsheet_()` 함수를 1회 실행하면 구글 스프레드시트에 `Evaluations` 및 `Users` 시트와 **테스트현장 - 최난새 (nschoi@sebangtec.com)** 데이터가 자동 생성됩니다.

### 2. 비밀번호 설정 (Addpassword)
1. Apps Script 좌측 톱니바퀴 아이콘 **[프로젝트 설정]** 클릭
2. 하단 **[스크립트 속성 (Script Properties)]** > **[스크립트 속성 추가]** 클릭
3. **속성 이름**: `Addpassword`
4. **값**: `(관리자가 사용할 비밀번호 입력)` 입력 후 저장

### 3. Web App 배포
1. Apps Script 우측 상단 **[배포]** > **[새 배포]** 클릭
2. 유형 선택: **웹 앱 (Web App)**
3. 설명: `v1.0.0`
4. 다음 사용자 지정으로 실행: **나 (내 구글 계정)**
5. 액세스 권한 있는 사용자: **모든 사용자 (Anyone)**
6. **[배포]** 버튼 클릭 후 생성된 **웹 앱 URL (Exec URL)**을 복사합니다.
7. `app.js` 및 `admin.js` 상단의 `GAS_API_URL` 상수에 복사한 URL을 붙여넣습니다.

### 4. GitHub 레포지토리 연동 (`supervisorassessment`)
1. GitHub에서 `supervisorassessment` 이름으로 새 레포지토리를 생성합니다.
2. 로컬 `C:\Users\evide\OneDrive\2026년\claud\SupervisorAssessment` 폴더에서 Git push를 진행합니다:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for supervisor assessment app"
   git branch -M main
   git remote add origin https://github.com/사용자계정/supervisorassessment.git
   git push -u origin main
   ```
3. GitHub 레포지토리 `Settings` > `Pages`에서 Source를 `main` 브랜치 `/ (root)`로 설정하여 Web Pages를 활성화합니다.

---

## 🌟 주요 기능 하이라이트

1. **미체크 항목 검증 및 스무스 스크롤 이동**: 20개 문항 중 빠뜨린 항목이 있으면 경고 모달과 함께 해당 카드로 스무스 스크롤 및 붉은색 테두리 하이라이트 제공.
2. **구글 드라이브 Data 폴더 서명 PNG 보관**: 서명 데이터가 Base64 형태로 구글 드라이브 `SupervisorAssessment_Vault/Data` 폴더에 이미지 파일로 저장되고 URL로 매칭.
3. **SheetJS 명단 양식 다운로드 & 일괄 파싱**: `[명단 등록 양식 다운로드 (.xlsx)]` 버튼 제공 및 이메일 주소 포함 파싱.
4. **`automail` 연동 & E-mail OTP 2차 인증**: 미제출 현장소장에 대한 1-클릭 이메일 알림 및 본인 확인용 OTP 생성.
5. **3단계 결재선 A4 보고서 출력**: 작성 - 검토 - 승인 결재선이 포함된 항목별 평균 평점 종합 보고서 A4 출력 지원.
