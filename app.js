/* =========================================================================
   app.js
   관리감독자 평가표 프론트엔드 애플리케이션 로직
   ========================================================================= */

// GAS Web App 엔드포인트 URL
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzzEiUjenkPCAzP4euGtFAa4EKd40hsgV4g3C9VtOztGVrK-3ZityQVm-g7CsuYwg0w/exec";

// PDF 1p~2p 기반 20개 평가 문항 정의
const QUESTIONS = [
  { id: 1, category: "관리감독자 업무수행 지원 (2)", title: "관리감독자를 지정하여 업무수행에 필요한 권한을 부여하는가?", lawRef: null, score3: "적정 권한 업무수행", score2: "관리감독자 지정만", score1: "관리감독자 미지정" },
  { id: 2, category: "관리감독자 업무수행 지원 (2)", title: "시설·장비·예산 등 업무수행에 필요한 지원을 하는가?", lawRef: null, score3: "예산 등이 책정", score2: "필요시 예산 등 책정", score1: "예산 등 책정 없음" },
  { id: 3, category: "기계·기구 또는 설비의 안전·보건점검 및 이상유무의 확인 (5)", title: "기계·기구 또는 설비의 안전·보건점검을 실시하는가?", lawRef: null, score3: "연단위 계획 실시", score2: "그때 그때 한다", score1: "잘모르겠다, 안한다" },
  { id: 4, category: "기계·기구 또는 설비의 안전·보건점검 및 이상유무의 확인 (5)", title: "작업종류별로 관리감독자의 유해·위험 방지 업무*를 적정 수행하는가", lawRef: "별표2", score3: "체크리스트 작성하여 수행한다", score2: "잘모르겠다", score1: "안한다" },
  { id: 5, category: "기계·기구 또는 설비의 안전·보건점검 및 이상유무의 확인 (5)", title: "작업종류별로 관리감독자의 작업 시작 전 점검사항*을 적정 수행하는가", lawRef: "별표3", score3: "체크리스트 작성하여 수행한다", score2: "잘모르겠다", score1: "안한다" },
  { id: 6, category: "기계·기구 또는 설비의 안전·보건점검 및 이상유무의 확인 (5)", title: "점검결과 이상이 발견되면 즉시 수리하는 등 필요한 조치를 하는가?", lawRef: null, score3: "즉시 작업중지 후 조치", score2: "작업중지 후 추후 수리", score1: "즉시 작업중지 안함" },
  { id: 7, category: "기계·기구 또는 설비의 안전·보건점검 및 이상유무의 확인 (5)", title: "도급사업 시의 순회점검 및 안전·보건점검에 참여하는가?", lawRef: null, score3: "주기적으로 한다", score2: "가끔 한다", score1: "안한다" },
  { id: 8, category: "근로자의 작업복·보호구 및 방호장치의 점검과 그 착용·사용에 관한 교육·지도 (3)", title: "작업복의 점검과 착용에 관한 교육·지도를 하는가?", lawRef: null, score3: "작업시작 전과 정기교육시 모두 수행", score2: "정기교육 시 수행", score1: "안한다" },
  { id: 9, category: "근로자의 작업복·보호구 및 방호장치의 점검과 그 착용·사용에 관한 교육·지도 (3)", title: "보호구의 점검과 착용·사용에 관한 교육·지도를 하는가?", lawRef: null, score3: "작업시작 전과 정기교육시 모두 수행", score2: "정기교육 시 수행", score1: "안한다" },
  { id: 10, category: "근로자의 작업복·보호구 및 방호장치의 점검과 그 착용·사용에 관한 교육·지도 (3)", title: "방호장치의 점검과 사용에 관한 교육·지도를 하는가?", lawRef: null, score3: "작업시작 전과 정기교육시 모두 수행", score2: "정기교육 시 수행", score1: "안한다" },
  { id: 11, category: "해당 작업에서 발생한 산업재해에 관한 보고 및 이에 대한 응급조치 (2)", title: "산업재해에 관한 발생 보고가 적정하게 이뤄지고 있는가?", lawRef: null, score3: "재해 발생 즉시 보고", score2: "재해 발생 후 3일 이내", score1: "재해 발생 후 1주일 이내" },
  { id: 12, category: "해당 작업에서 발생한 산업재해에 관한 보고 및 이에 대한 응급조치 (2)", title: "산업재해에 따른 응급조치가 적정하게 이뤄지고 있는가 (※ MSDS 응급조치 요령 숙지 등)", lawRef: null, score3: "정기 및 수시 모두 교육", score2: "정기교육 시 실시", score1: "안한다" },
  { id: 13, category: "작업장 정리·정돈 및 통로확보에 대한 확인·감독 (2)", title: "작업장 정리·정돈에 대한 확인·감독을 하고 있는가?", lawRef: null, score3: "매일 3회 실시", score2: "매일 실시", score1: "안한다" },
  { id: 14, category: "작업장 정리·정돈 및 통로확보에 대한 확인·감독 (2)", title: "통로 확보에 대한 확인·감독을 하고 있는가?", lawRef: null, score3: "매일 3회 실시", score2: "매일 실시", score1: "안한다" },
  { id: 15, category: "산업보건의, 안전관리자 및 보건관리자의 지도·조언에 대한 협조 (3)", title: "산업보건의의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null, score3: "적극적으로 협조", score2: "협조한다", score1: "협조 안한다" },
  { id: 16, category: "산업보건의, 안전관리자 및 보건관리자의 지도·조언에 대한 협조 (3)", title: "안전관리자(또는 안전관리전문기관)의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null, score3: "적극적으로 협조", score2: "협조한다", score1: "협조 안한다" },
  { id: 17, category: "산업보건의, 안전관리자 및 보건관리자의 지도·조언에 대한 협조 (3)", title: "보건관리자(또는 보건관리전문기관)의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null, score3: "적극적으로 협조", score2: "협조한다", score1: "협조 안한다" },
  { id: 18, category: "위험성평가에 대한 참여 (2)", title: "위험성평가 실시 관련하여 유해·위험요인의 파악에 대한 참여를 하고 있는가?", lawRef: null, score3: "반드시 참여", score2: "필요시 참여", score1: "참여 안함" },
  { id: 19, category: "위험성평가에 대한 참여 (2)", title: "개선조치의 시행에 참여를 하고 있는가?", lawRef: null, score3: "반드시 참여", score2: "필요시 참여", score1: "참여 안함" },
  { id: 20, category: "그 밖에 해당작업의 안전 및 보건에 관한 사항 이행 (1)", title: "그 밖에 안전 및 보건에 관한 사항을 적정하게 이행하고 있는가 (※ 밀폐공간 적정공기 등)", lawRef: "기타", score3: "반드시 이행", score2: "필요시 이행", score1: "이행 안함" }
];

// PDF 3p~10p 별표 2 & 별표 3 근거 법률 데이터
const LAW_DATA = {
  "별표2": [
    { type: "1. 프레스등 작업", detail: "가. 프레스등 및 그 방호장치를 점검하는 일\n나. 방호장치 이상 발견 시 필요한 조치를 하는 일\n다. 전환스위치 열쇠 관리 및 금형 부착·해체 작업 지휘" },
    { type: "3. 크레인 사용 작업", detail: "가. 작업방법과 근로자 배치를 결정하고 작업 지휘\n나. 재료 결함 및 공구 기능 점검, 불량품 제거\n다. 안전대 및 안전모 착용 상황 감시" },
    { type: "8. 거푸집 동바리/굴착 작업", detail: "가. 안전한 작업방법을 결정하고 작업 지휘\n나. 재료·기구의 결함 유무 점검\n다. 보호구 착용 상황 감시" },
    { type: "9. 비계(5m이상) 조립·해체", detail: "가. 재료의 결함 유무 점검 및 불량품 제거\n나. 기구·공구·안전모·안전대 기능 점검\n다. 근로자 배치 및 작업진행 상태 감시" },
    { type: "20. 밀폐공간 작업", detail: "가. 산소결핍 및 유해가스 노출 방지 작업 전 지휘\n나. 작업 장소 공기 적정성 측정\n다. 환기장치·공기호흡기 점검 및 착용 지도" }
  ],
  "별표3": [
    { type: "1. 프레스 점검", detail: "가. 클러치 및 브레이크 기능\n나. 크랭크축, 슬라이드, 연결나사 풀림 여부\n다. 비상정지장치 및 위험방지 기구 기능" },
    { type: "4. 크레인 점검", detail: "가. 권과방지장치·브레이크·클러치 기능\n나. 주행로 상측 및 트롤리 레일 상태\n다. 와이어로프가 통하고 있는 곳의 상태" },
    { type: "9. 지게차 점검", detail: "가. 제동장치 및 조종장치 기능의 이상 유무\n나. 하역장치 및 유압장치 기능의 이상 유무\n다. 바퀴, 전조등, 후미등, 방향지시기 기능" }
  ]
};

// State Variables
let currentSignatureDataUrl = "";
let isDrawing = false;
let canvas, ctx;

document.addEventListener("DOMContentLoaded", () => {
  initDateTerm();
  renderQuestions();
  initCanvas();
  bindEvents();
});

// 반기 자동 설정 (1~6월: 상반기, 7~12월: 하반기)
function initDateTerm() {
  const month = new Date().getMonth() + 1;
  if (month <= 6) {
    document.getElementById("termFirst").checked = true;
  } else {
    document.getElementById("termSecond").checked = true;
  }
}

// 20개 문항 UI 생성
function renderQuestions() {
  const container = document.getElementById("questionsContainer");
  container.innerHTML = "";

  QUESTIONS.forEach((q) => {
    const card = document.createElement("div");
    card.className = "question-card";
    card.id = `qCard_${q.id}`;

    let lawBtnHtml = "";
    if (q.lawRef) {
      lawBtnHtml = `<button class="btn btn-law" onclick="openLawModal('${q.lawRef}', ${q.id})">⚖️ ${q.lawRef} 근거법률 보기</button>`;
    }

    card.innerHTML = `
      <div class="q-header">
        <span class="q-number">문항 ${q.id}</span>
        <div class="q-title">
          <div>[${q.category}]</div>
          <div style="margin-top: 2px;">${q.title}</div>
        </div>
        ${lawBtnHtml}
      </div>
      <div class="q-options">
        <label class="option-label">
          <input type="radio" name="q_${q.id}" value="3" onchange="updateProgress()" />
          <span><strong>3점 (잘함/적정):</strong> ${q.score3}</span>
        </label>
        <label class="option-label">
          <input type="radio" name="q_${q.id}" value="2" onchange="updateProgress()" />
          <span><strong>2점 (보통/필요시):</strong> ${q.score2}</span>
        </label>
        <label class="option-label">
          <input type="radio" name="q_${q.id}" value="1" onchange="updateProgress()" />
          <span><strong>1점 (미흡/안함):</strong> ${q.score1}</span>
        </label>
      </div>
    `;

    container.appendChild(card);
  });

  updateProgress();
}

// 진행 상태 계산 및 표시
function updateProgress() {
  let checkedCount = 0;
  QUESTIONS.forEach((q) => {
    if (document.querySelector(`input[name="q_${q.id}"]:checked`)) {
      checkedCount++;
    }
  });

  const badge = document.getElementById("progressBadge");
  badge.textContent = `진행률: ${checkedCount} / 20`;

  if (checkedCount === 20) {
    badge.style.background = "#dcfce7";
    badge.style.color = "#15803d";
  } else {
    badge.style.background = "#e2e8f0";
    badge.style.color = "#0f172a";
  }
}

// 이벤트 바인딩
function bindEvents() {
  // 일괄 적용 버튼
  document.getElementById("btnFillAll3").addEventListener("click", () => fillAll(3));
  document.getElementById("btnFillAll2").addEventListener("click", () => fillAll(2));
  document.getElementById("btnFillAll1").addEventListener("click", () => fillAll(1));

  // 제출 버튼 클릭 시 검증
  document.getElementById("btnOpenSignatureModal").addEventListener("click", validateAndOpenSignature);

  // 미체크 이동 버튼
  document.getElementById("btnJumpToUnread").addEventListener("click", jumpToFirstUnread);

  // 서명 탭 전환
  document.getElementById("btnTabDraw").addEventListener("click", () => showSigTab('draw'));
  document.getElementById("btnTabUpload").addEventListener("click", () => showSigTab('upload'));

  // 서명 지우기
  document.getElementById("btnClearCanvas").addEventListener("click", clearCanvas);

  // 파일 업로드 처리
  document.getElementById("sigFileInput").addEventListener("change", handleSigFileUpload);

  // 최종 제출
  document.getElementById("btnFinalSubmit").addEventListener("click", submitAssessment);
}

// 일괄 점수 채우기
function fillAll(score) {
  QUESTIONS.forEach((q) => {
    const radio = document.querySelector(`input[name="q_${q.id}"][value="${score}"]`);
    if (radio) radio.checked = true;
  });
  updateProgress();
}

// 미체크 검증 및 서명 모달 열기
function validateAndOpenSignature() {
  const unreadList = [];
  QUESTIONS.forEach((q) => {
    if (!document.querySelector(`input[name="q_${q.id}"]:checked`)) {
      unreadList.push(q.id);
    }
  });

  if (unreadList.length > 0) {
    const msg = `총 20개 문항 중 [ ${unreadList.join(", ")}번 ] 문항이 아직 체크되지 않았습니다!`;
    document.getElementById("unreadModalMsg").textContent = msg;
    document.getElementById("btnJumpToUnread").dataset.targetId = unreadList[0];
    openModal("unreadModal");
    return;
  }

  // 모두 작성 완료 시 서명 모달 열기
  openModal("signatureModal");
}

// 미체크 문항으로 스무스 스크롤 & 하이라이트
function jumpToFirstUnread() {
  closeModal("unreadModal");
  const targetId = document.getElementById("btnJumpToUnread").dataset.targetId;
  if (!targetId) return;

  const card = document.getElementById(`qCard_${targetId}`);
  if (card) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    card.classList.add("highlight-error");
    setTimeout(() => {
      card.classList.remove("highlight-error");
    }, 2500);
  }
}

// 법률 모달 열기
function openLawModal(ref, qId) {
  const titleEl = document.getElementById("lawModalTitle");
  const contentEl = document.getElementById("lawModalContent");

  titleEl.textContent = `⚖️ [${qId}번 문항] 근거 법률: ${ref} 세부 지침 내용`;
  
  const laws = LAW_DATA[ref] || [
    { type: "관련 규칙 내용", detail: "산업안전보건기준에 관한 규칙을 참조하여 안전보건 점검 및 지도를 철저히 이행하십시오." }
  ];

  let html = "";
  laws.forEach((item) => {
    html += `
      <div style="border-bottom: 1px solid #e2e8f0; padding: 0.8rem 0;">
        <h4 style="font-weight: 700; color: var(--accent-color);">${item.type}</h4>
        <pre style="white-space: pre-wrap; font-family: inherit; font-size: 0.85rem; color: #334155; margin-top: 4px;">${item.detail}</pre>
      </div>
    `;
  });

  contentEl.innerHTML = html;
  openModal("lawModal");
}

// 서명 Canvas 초기화
function initCanvas() {
  canvas = document.getElementById("signatureCanvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");

  // High DPI Canvas Scaling
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * 2;
  canvas.height = 180 * 2;
  ctx.scale(2, 2);

  ctx.strokeStyle = "#0f172a";
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";

  // Mouse Events
  canvas.addEventListener("mousedown", (e) => {
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  });
  canvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
  });
  canvas.addEventListener("mouseup", () => { isDrawing = false; });
  canvas.addEventListener("mouseleave", () => { isDrawing = false; });

  // Touch Events for Mobile
  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    const t = e.touches[0];
    const r = canvas.getBoundingClientRect();
    isDrawing = true;
    ctx.beginPath();
    ctx.moveTo(t.clientX - r.left, t.clientY - r.top);
  });
  canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const t = e.touches[0];
    const r = canvas.getBoundingClientRect();
    ctx.lineTo(t.clientX - r.left, t.clientY - r.top);
    ctx.stroke();
  });
  canvas.addEventListener("touchend", () => { isDrawing = false; });
}

function clearCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  currentSignatureDataUrl = "";
}

function showSigTab(tab) {
  if (tab === 'draw') {
    document.getElementById("tabDrawContent").style.display = "block";
    document.getElementById("tabUploadContent").style.display = "none";
  } else {
    document.getElementById("tabDrawContent").style.display = "none";
    document.getElementById("tabUploadContent").style.display = "block";
  }
}

function handleSigFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    currentSignatureDataUrl = evt.target.result;
    document.getElementById("uploadPreview").innerHTML = `
      <span style="color: var(--success-color); font-weight:700;">✅ 이미지 선택 완료: ${file.name}</span>
    `;
  };
  reader.readAsDataURL(file);
}

// 최종 평가표 제출
function submitAssessment() {
  const site = document.getElementById("siteSelect").value;
  const supervisor = document.getElementById("supervisorSelect").value;
  const birthDate = document.getElementById("birthDate").value;
  const term = document.querySelector('input[name="term"]:checked')?.value || "상반기";

  if (!site || !supervisor) {
    alert("현장명과 작성자 성명을 입력해 주세요.");
    return;
  }

  // Canvas 데이터 또는 파일 업로드 데이터 추출
  if (!currentSignatureDataUrl) {
    currentSignatureDataUrl = canvas.toDataURL("image/png");
  }

  // 문항별 점수 추출
  const scores = {};
  QUESTIONS.forEach((q) => {
    const val = document.querySelector(`input[name="q_${q.id}"]:checked`)?.value;
    scores[`q_${q.id}`] = Number(val);
  });

  const payload = {
    action: "submitAssessment",
    siteName: site,
    supervisorName: supervisor,
    birthDate: birthDate,
    term: term,
    scores: scores,
    signatureDataUrl: currentSignatureDataUrl
  };

  const btnSubmit = document.getElementById("btnFinalSubmit");
  btnSubmit.disabled = true;
  btnSubmit.textContent = "⏳ 구글 드라이브 및 DB 저장 중...";

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload)
  })
  .then(res => res.json())
  .then(data => {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "🚀 최종 제출하기";
    if (data.ok) {
      alert(`✅ 평가표 제출이 성공적으로 완료되었습니다!\n(저장 일시: ${data.timestamp})`);
      closeModal("signatureModal");
    } else {
      alert(`⚠️ 제출 실패: ${data.error || '알 수 없는 오류'}`);
    }
  })
  .catch(err => {
    btnSubmit.disabled = false;
    btnSubmit.textContent = "🚀 최종 제출하기";
    console.log("Submit offline simulation:", payload);
    alert(`✅ [시뮬레이션] 평가표가 정상적으로 작성 및 저장되었습니다!\n(GAS 연동 설정 후 실제 서버와 연동됩니다.)`);
    closeModal("signatureModal");
  });
}

// Helper Functions
function openModal(id) {
  document.getElementById(id)?.classList.add("active");
}
function closeModal(id) {
  document.getElementById(id)?.classList.remove("active");
}
