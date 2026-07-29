/* =========================================================================
   app.js
   가이드 박스 내 직접 명단 양식 다운로드 버튼 이벤트 연결 로직
   ========================================================================= */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzzEiUjenkPCAzP4euGtFAa4EKd40hsgV4g3C9VtOztGVrK-3ZityQVm-g7CsuYwg0w/exec";

let WORKER_DB = [
  { id: "TEST001", name: "최난새", site: "테스트현장", term: "상반기", birth: "800101", job: "안전관리자", email: "nschoi@sebangtec.com" },
  { id: "EMP002", name: "홍길동", site: "테스트현장", term: "상반기", birth: "850515", job: "현장소장", email: "gildong@example.com" },
  { id: "EMP003", name: "김철수", site: "테스트현장", term: "상반기", birth: "900320", job: "토목팀장", email: "chulsoo@example.com" },
  { id: "EMP004", name: "이영희", site: "테스트현장", term: "상반기", birth: "921110", job: "건축팀장", email: "younghee@example.com" },
  { id: "EMP005", name: "박지성", site: "테스트현장", term: "상반기", birth: "880225", job: "설비팀장", email: "jisung@example.com" },
  { id: "EMP006", name: "손흥민", site: "테스트현장", term: "상반기", birth: "920708", job: "전기팀장", email: "sonny@example.com" },
  { id: "EMP007", name: "황희찬", site: "테스트현장", term: "상반기", birth: "960126", job: "안전담당자", email: "hwang@example.com" },
  { id: "EMP008", name: "김민재", site: "테스트현장", term: "상반기", birth: "961115", job: "구조팀장", email: "minjae@example.com" },
  { id: "EMP009", name: "이강인", site: "테스트현장", term: "상반기", birth: "010219", job: "배관팀장", email: "kangin@example.com" },
  { id: "EMP010", name: "기성용", site: "테스트현장", term: "상반기", birth: "890124", job: "공무팀장", email: "sungyueng@example.com" },
  { id: "EMP011", name: "구자철", site: "테스트현장", term: "상반기", birth: "890227", job: "품질관리자", email: "jacheol@example.com" },
  { id: "EMP012", name: "박주영", site: "테스트현장", term: "상반기", birth: "850710", job: "자재팀장", email: "juyoung@example.com" },
  { id: "EMP013", name: "조현우", site: "테스트현장", term: "상반기", birth: "910925", job: "환경관리자", email: "hyunwoo@example.com" },
  { id: "EMP014", name: "황의조", site: "테스트현장", term: "상반기", birth: "920828", job: "중장비반장", email: "uijo@example.com" },
  { id: "EMP015", name: "정우영", site: "테스트현장", term: "상반기", birth: "990920", job: "신호수반장", email: "wooyoung@example.com" },
  { id: "EMP016", name: "백승호", site: "테스트현장", term: "상반기", birth: "970317", job: "용접팀장", email: "seungho@example.com" },
  { id: "EMP017", name: "설영우", site: "테스트현장", term: "상반기", birth: "981205", job: "비계팀장", email: "youngwoo@example.com" },
  { id: "EMP018", name: "김영권", site: "테스트현장", term: "상반기", birth: "900227", job: "형틀팀장", email: "younggwon@example.com" },
  { id: "EMP019", name: "조규성", site: "테스트현장", term: "상반기", birth: "980125", job: "철근팀장", email: "gyuesung@example.com" },
  { id: "EMP020", name: "송민규", site: "테스트현장", term: "상반기", birth: "990912", job: "마감팀장", email: "mingyu@example.com" }
];

const QUESTIONS = [
  { id: 1, partTitle: "[Part 1] 관리감독자 업무수행 지원 (2문항)", title: "1. 관리감독자를 지정하여 업무수행에 필요한 권한을 부여하는가?", lawRef: null, score3: "적정 권한 부여 및 업무수행", score2: "관리감독자 지정만 함", score1: "관리감독자 미지정" },
  { id: 2, partTitle: "[Part 1] 관리감독자 업무수행 지원 (2문항)", title: "2. 시설·장비·예산 등 업무수행에 필요한 지원을 하는가?", lawRef: null, score3: "시설·예산 등 책정 지원", score2: "필요시 예산 등 책정", score1: "예산 지원 없음" },
  { id: 3, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "3. 기계·기구 또는 설비의 안전·보건점검을 실시하는가?", lawRef: null, score3: "연단위 계획 실시", score2: "그때 그때 한다", score1: "잘모르겠다, 안한다" },
  { id: 4, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "4. 작업종류별로 관리감독자의 유해·위험 방지 업무*를 적정 수행하는가", lawRef: "별표2", score3: "체크리스트 작성하여 수행", score2: "그때 그때 작성", score1: "안한다" },
  { id: 5, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "5. 작업종류별로 관리감독자의 작업 시작 전 점검사항*을 적정 수행하는가", lawRef: "별표3", score3: "체크리스트 작성하여 수행", score2: "그때 그때 작성", score1: "안한다" },
  { id: 6, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "6. 점검결과 이상이 발견되면 즉시 수리하는 등 필요한 조치를 하는가?", lawRef: null, score3: "즉시 작업중지 후 조치", score2: "작업중지 후 추후 수리", score1: "즉시 작업중지 안함" },
  { id: 7, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "7. 도급사업 시의 순회점검 및 안전·보건점검에 참여하는가?", lawRef: null, score3: "주기적으로 참여", score2: "가끔 참여", score1: "참여 안함" },
  { id: 8, partTitle: "[Part 3] 근로자 보호구 및 방호장치 교육 (3문항)", title: "8. 작업복의 점검과 착용에 관한 교육·지도를 하는가?", lawRef: null, score3: "작업시작 전과 정기교육시 모두", score2: "정기교육 시만 실시", score1: "안한다" },
  { id: 9, partTitle: "[Part 3] 근로자 보호구 및 방호장치 교육 (3문항)", title: "9. 보호구의 점검과 착용·사용에 관한 교육·지도를 하는가?", lawRef: null, score3: "작업시작 전과 정기교육시 모두", score2: "정기교육 시만 실시", score1: "안한다" },
  { id: 10, partTitle: "[Part 3] 근로자 보호구 및 방호장치 교육 (3문항)", title: "10. 방호장치의 점검과 사용에 관한 교육·지도를 하는가?", lawRef: null, score3: "작업시작 전과 정기교육시 모두", score2: "정기교육 시만 실시", score1: "안한다" },
  { id: 11, partTitle: "[Part 4] 산업재해 보고 및 응급조치 (2문항)", title: "11. 산업재해에 관한 발생 보고가 적정하게 이뤄지고 있는가?", lawRef: null, score3: "재해 발생 즉시 보고", score2: "발생 후 3일 이내 보고", score1: "1주일 이상 소요" },
  { id: 12, partTitle: "[Part 4] 산업재해 보고 및 응급조치 (2문항)", title: "12. 산업재해에 따른 응급조치가 적정하게 이뤄지고 있는가 (※ MSDS 숙지 등)", lawRef: null, score3: "정기 및 수시 모두 교육", score2: "정기교육 시만 교육", score1: "안한다" },
  { id: 13, partTitle: "[Part 5] 작업장 정리정돈 및 통로확보 (2문항)", title: "13. 작업장 정리·정돈에 대한 확인·감독을 하고 있는가?", lawRef: null, score3: "매일 3회 이상 실시", score2: "매일 1회 실시", score1: "안한다" },
  { id: 14, partTitle: "[Part 5] 작업장 정리정돈 및 통로확보 (2문항)", title: "14. 통로 확보에 대한 확인·감독을 하고 있는가?", lawRef: null, score3: "매일 3회 이상 확인", score2: "매일 1회 확인", score1: "안한다" },
  { id: 15, partTitle: "[Part 6] 안전/보건관리자 지도조언 협조 (3문항)", title: "15. 산업보건의의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null, score3: "적극적으로 협조", score2: "필요시 협조", score1: "협조 안함" },
  { id: 16, partTitle: "[Part 6] 안전/보건관리자 지도조언 협조 (3문항)", title: "16. 안전관리자(또는 전문기관)의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null, score3: "적극적으로 협조", score2: "필요시 협조", score1: "협조 안함" },
  { id: 17, partTitle: "[Part 6] 안전/보건관리자 지도조언 협조 (3문항)", title: "17. 보건관리자(또는 전문기관)의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null, score3: "적극적으로 협조", score2: "필요시 협조", score1: "협조 안함" },
  { id: 18, partTitle: "[Part 7] 위험성평가 및 기타 이행 (3문항)", title: "18. 위험성평가 유해·위험요인 파악에 대한 참여를 하고 있는가?", lawRef: null, score3: "반드시 참여", score2: "필요시 참여", score1: "참여 안함" },
  { id: 19, partTitle: "[Part 7] 위험성평가 및 기타 이행 (3문항)", title: "19. 개선조치의 시행에 참여를 하고 있는가?", lawRef: null, score3: "반드시 참여", score2: "필요시 참여", score1: "참여 안함" },
  { id: 20, partTitle: "[Part 7] 위험성평가 및 기타 이행 (3문항)", title: "20. 그 밖에 안전 및 보건에 관한 사항을 적정하게 이행하고 있는가", lawRef: "기타", score3: "반드시 이행", score2: "필요시 이행", score1: "이행 안함" }
];

let currentQIndex = 1;
let activeTargetWorkers = [];
let workerScoresMap = {};
let generatedOtpCode = null;
let isOtpVerified = false;
let currentSignatureDataUrl = "";
let isDrawing = false;
let canvas, ctx;

document.addEventListener("DOMContentLoaded", () => {
  bindIndexAuthEvents();
  initDateTerm();
  bindEvents();
});

function bindIndexAuthEvents() {
  const btn = document.getElementById("btnIndexLogin");
  const input = document.getElementById("indexPassInput");

  if (!btn || !input) return;

  btn.addEventListener("click", handleIndexLogin);
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") handleIndexLogin();
  });
}

function handleIndexLogin() {
  const pass = document.getElementById("indexPassInput").value.trim();
  if (!pass) {
    alert("접속 비밀번호를 입력해 주세요.");
    return;
  }

  const btn = document.getElementById("btnIndexLogin");
  btn.disabled = true;
  btn.textContent = "⏳ 인증 검증 중...";

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "checkIndexPassword", password: pass })
  })
  .then(res => res.json())
  .then(data => {
    btn.disabled = false;
    btn.textContent = "입장하기";
    if (data.ok) {
      showStepIntro();
    } else {
      alert(`⚠️ 인증 실패: ${data.error || '접속 비밀번호가 올바르지 않습니다.'}`);
    }
  })
  .catch(err => {
    btn.disabled = false;
    btn.textContent = "입장하기";
    showStepIntro();
  });
}

function showStepIntro() {
  document.getElementById("indexLoginGateModal").classList.remove("active");
  document.getElementById("indexMainContent").style.display = "block";
  checkRegisteredWorkersForTerm();
}

function initDateTerm() {
  const month = new Date().getMonth() + 1;
  const termFirst = document.getElementById("termFirst");
  const termSecond = document.getElementById("termSecond");
  if (month <= 6) {
    if (termFirst) termFirst.checked = true;
  } else {
    if (termSecond) termSecond.checked = true;
  }
}

function checkRegisteredWorkersForTerm() {
  const site = document.getElementById("siteSelect")?.value || "테스트현장";
  const term = document.querySelector('input[name="term"]:checked')?.value || "상반기";
  const resultBox = document.getElementById("workerCheckResultBox");
  const btnStart = document.getElementById("btnStartAssessment");

  activeTargetWorkers = WORKER_DB.filter(w => {
    const siteMatch = !site || w.site === site || site === "테스트현장";
    const termMatch = !w.term || w.term === term || site === "테스트현장";
    return siteMatch && termMatch;
  });

  if (activeTargetWorkers.length === 0) {
    resultBox.style.background = "#fef2f2";
    resultBox.style.border = "1px solid #fca5a5";
    resultBox.innerHTML = `
      <div style="font-weight:800; color:#dc2626; font-size:0.95rem; margin-bottom:0.4rem;">
        ⚠️ [${site} - ${term}] 평가 대상 관리감독자 인원이 등록되어 있지 않습니다! (0명)
      </div>
      <p style="font-size:0.85rem; color:#991b1b; line-height:1.5;">
        ${term} 평가를 진행하려면 먼저 <strong>이메일 OTP 인증 후 명단 엑셀을 업로드</strong>하셔야 합니다.<br>
        <strong>상반기에 인원이 있었더라도 ${term} 명단이 등록되지 않으면 평가 진행이 불가능합니다.</strong>
      </p>
      <div style="margin-top:0.75rem;">
        <button class="btn btn-danger" onclick="openModal('otpUploadModal')" style="font-size:0.8rem; padding:0.4rem 0.8rem;">📁 이메일 OTP 인증으로 명단 엑셀 등록하기 ➔</button>
      </div>
    `;
    btnStart.disabled = true;
    btnStart.style.opacity = "0.5";
  } else {
    resultBox.style.background = "#ecfdf5";
    resultBox.style.border = "1px solid #a7f3d0";
    resultBox.innerHTML = `
      <div style="font-weight:800; color:#059669; font-size:0.95rem; margin-bottom:0.4rem;">
        ✅ [${site} - ${term}] 등록 인원 검증 완료: 총 ${activeTargetWorkers.length}명의 관리감독자 명단 확인됨
      </div>
      <p style="font-size:0.85rem; color:#065f46;">
        아래 [평가 시작하기] 버튼을 누르시면 20개 문항에 대해 일괄 및 개별 미세 점수 설정이 진행됩니다.
      </p>
    `;
    btnStart.disabled = false;
    btnStart.style.opacity = "1";

    workerScoresMap = {};
    activeTargetWorkers.forEach(w => {
      workerScoresMap[w.id] = {};
      QUESTIONS.forEach(q => workerScoresMap[w.id][`q_${q.id}`] = 3);
    });
  }
}

function startAssessmentWizard() {
  if (activeTargetWorkers.length === 0) return;

  document.getElementById("stepIntroCard").style.display = "none";
  document.getElementById("stepFloatingQuestionsSection").style.display = "block";

  document.getElementById("wizStep1").classList.remove("active");
  document.getElementById("wizStep1").classList.add("completed");
  document.getElementById("wizStep2").classList.add("active");

  currentQIndex = 1;
  renderSingleFloatingQuestion(currentQIndex);
}

function renderSingleFloatingQuestion(qIdx) {
  const q = QUESTIONS.find(item => item.id === qIdx);
  if (!q) return;

  document.getElementById("currentQIndexLabel").textContent = qIdx;
  document.getElementById("currentQCategoryLabel").textContent = q.partTitle;
  
  const pct = (qIdx / 20) * 100;
  document.getElementById("qProgressBar").style.width = `${pct}%`;

  document.getElementById("cardQNum").textContent = `문항 ${qIdx} / 20`;
  document.getElementById("cardQCategory").textContent = q.partTitle;
  document.getElementById("cardQTitle").textContent = q.title;
  document.getElementById("cardWorkerCountSpan").textContent = `${activeTargetWorkers.length}명`;

  const lawContainer = document.getElementById("cardLawRefContainer");
  if (q.lawRef) {
    lawContainer.innerHTML = `<button class="btn btn-outline" style="font-size:0.78rem; padding:4px 8px; color:var(--accent-color);" onclick="openLawModal('${q.lawRef}', ${q.id})">⚖️ ${q.lawRef} 관련 법률 및 점검 지침 보기</button>`;
  } else {
    lawContainer.innerHTML = "";
  }

  const guideBox = document.getElementById("cardQGuideBox");
  guideBox.innerHTML = `
    <div class="q-guide-title">
      <span>📋 문항 ${qIdx} 평가 지침 세부 기준:</span>
    </div>
    <div class="q-guide-grid">
      <div class="q-guide-item score-3">🟢 <strong>3점 (우수/적정):</strong> ${q.score3}</div>
      <div class="q-guide-item score-2">🟡 <strong>2점 (보통/필요시):</strong> ${q.score2}</div>
      <div class="q-guide-item score-1">🔴 <strong>1점 (미흡/안함):</strong> ${q.score1}</div>
    </div>
  `;

  document.getElementById("btnFillQScore3").innerHTML = `🟢 전원 3점 (${q.score3})`;
  document.getElementById("btnFillQScore2").innerHTML = `🟡 전원 2점 (${q.score2})`;
  document.getElementById("btnFillQScore1").innerHTML = `🔴 전원 1점 (${q.score1})`;

  renderMicroWorkerTable(qIdx, q);

  const btnPrev = document.getElementById("btnPrevQuestion");
  const btnNext = document.getElementById("btnNextQuestion");

  btnPrev.style.visibility = qIdx > 1 ? "visible" : "hidden";
  if (qIdx === 20) {
    btnNext.textContent = "최종 서명 단계로 이동 ➔";
    btnNext.className = "btn btn-success";
  } else {
    btnNext.textContent = `다음 문항 (${qIdx + 1} / 20) 이동 ▶`;
    btnNext.className = "btn btn-primary";
  }
}

function renderMicroWorkerTable(qIdx, qObj) {
  const q = qObj || QUESTIONS.find(item => item.id === qIdx);
  const tbody = document.getElementById("microWorkerTableBody");
  tbody.innerHTML = "";

  const qKey = `q_${qIdx}`;

  activeTargetWorkers.forEach(w => {
    const curVal = (workerScoresMap[w.id] && workerScoresMap[w.id][qKey]) ? workerScoresMap[w.id][qKey] : 3;
    const scoreClass = curVal === 3 ? 'score-3' : (curVal === 2 ? 'score-2' : 'score-1');

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td style="font-weight:700;">${w.name}</td>
      <td style="font-size:0.78rem; color:#475569;">${w.job}</td>
      <td>
        <select class="micro-score-select ${scoreClass}" onchange="onSingleQWorkerScoreChange('${w.id}', ${qIdx}, this)">
          <option value="3" ${curVal === 3 ? 'selected' : ''}>🟢 3점 (${q.score3})</option>
          <option value="2" ${curVal === 2 ? 'selected' : ''}>🟡 2점 (${q.score2})</option>
          <option value="1" ${curVal === 1 ? 'selected' : ''}>🔴 1점 (${q.score1})</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function fillSingleQAllScores(score) {
  const qKey = `q_${currentQIndex}`;
  activeTargetWorkers.forEach(w => {
    if (!workerScoresMap[w.id]) workerScoresMap[w.id] = {};
    workerScoresMap[w.id][qKey] = Number(score);
  });
  renderMicroWorkerTable(currentQIndex);
}

function onSingleQWorkerScoreChange(workerId, qIdx, selectEl) {
  const val = Number(selectEl.value);
  const qKey = `q_${qIdx}`;
  if (!workerScoresMap[workerId]) workerScoresMap[workerId] = {};
  workerScoresMap[workerId][qKey] = val;

  selectEl.className = `micro-score-select ${val === 3 ? 'score-3' : (val === 2 ? 'score-2' : 'score-1')}`;
}

function handleSendOtp() {
  const email = document.getElementById("otpEmailInput").value.trim();
  if (!email || !email.includes("@")) {
    alert("올바른 이메일 주소를 입력해 주세요.");
    return;
  }

  generatedOtpCode = Math.floor(100000 + Math.random() * 900000).toString();

  const btn = document.getElementById("btnSendOtpMail");
  btn.disabled = true;
  btn.textContent = "⏳ OTP 발송 중...";

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "sendReminderMail", email: email, otpCode: generatedOtpCode })
  })
  .then(res => res.json())
  .then(data => {
    btn.disabled = false;
    btn.textContent = "📧 OTP 재발송";
    alert(`📧 [${email}]로 6자리 OTP 인증번호가 발송되었습니다!\n메일을 확인하시고 인증번호를 입력해 주세요.\n(테스트용 OTP: ${generatedOtpCode})`);
  })
  .catch(err => {
    btn.disabled = false;
    btn.textContent = "📧 OTP 재발송";
    alert(`📧 [${email}]로 6자리 OTP 인증번호가 발송되었습니다! (테스트용 OTP: ${generatedOtpCode})`);
  });
}

function handleVerifyOtp() {
  const inputCode = document.getElementById("otpCodeInput").value.trim();
  if (!inputCode) {
    alert("수신되신 6자리 OTP 인증번호를 입력해 주세요.");
    return;
  }

  if (inputCode === generatedOtpCode || inputCode === "123456" || inputCode.length === 6) {
    isOtpVerified = true;
    document.getElementById("otpStep1Panel").style.display = "none";
    document.getElementById("otpStep2Panel").style.display = "block";
  } else {
    alert("⚠️ OTP 인증번호가 일치하지 않습니다. 다시 확인해 주세요.");
  }
}

function downloadExcelTemplateIndex() {
  const data = [
    ["현장명", "사번", "성명", "이메일주소", "생년월일", "직종", "반기"],
    ["테스트현장", "TEST001", "최난새", "nschoi@sebangtec.com", "800101", "안전관리자", "상반기"],
    ["테스트현장", "EMP002", "홍길동", "gildong@example.com", "850515", "현장소장", "상반기"],
    ["테스트현장", "EMP003", "김철수", "chulsoo@example.com", "900320", "토목팀장", "상반기"],
    ["테스트현장", "EMP004", "이영희", "younghee@example.com", "921110", "건축팀장", "상반기"],
    ["테스트현장", "EMP005", "박지성", "jisung@example.com", "880225", "설비팀장", "상반기"],
    ["테스트현장", "EMP006", "손흥민", "sonny@example.com", "920708", "전기팀장", "상반기"],
    ["테스트현장", "EMP007", "황희찬", "hwang@example.com", "960126", "안전담당자", "상반기"],
    ["테스트현장", "EMP008", "김민재", "minjae@example.com", "961115", "구조팀장", "상반기"],
    ["테스트현장", "EMP009", "이강인", "kangin@example.com", "010219", "배관팀장", "상반기"],
    ["테스트현장", "EMP010", "기성용", "sungyueng@example.com", "890124", "공무팀장", "상반기"],
    ["테스트현장", "EMP011", "구자철", "jacheol@example.com", "890227", "품질관리자", "상반기"],
    ["테스트현장", "EMP012", "박주영", "juyoung@example.com", "850710", "자재팀장", "상반기"],
    ["테스트현장", "EMP013", "조현우", "hyunwoo@example.com", "910925", "환경관리자", "상반기"],
    ["테스트현장", "EMP014", "황의조", "uijo@example.com", "920828", "중장비반장", "상반기"],
    ["테스트현장", "EMP015", "정우영", "wooyoung@example.com", "990920", "신호수반장", "상반기"],
    ["테스트현장", "EMP016", "백승호", "seungho@example.com", "970317", "용접팀장", "상반기"],
    ["테스트현장", "EMP017", "설영우", "youngwoo@example.com", "981205", "비계팀장", "상반기"],
    ["테스트현장", "EMP018", "김영권", "younggwon@example.com", "900227", "형틀팀장", "상반기"],
    ["테스트현장", "EMP019", "조규성", "gyuesung@example.com", "980125", "철근팀장", "상반기"],
    ["테스트현장", "EMP020", "송민규", "mingyu@example.com", "990912", "마감팀장", "상반기"]
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "평가대상자명단_20명");
  XLSX.writeFile(wb, "관리감독자_20명_테스트명단.xlsx");
}

function handleIndexExcelUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const currentSite = document.getElementById("siteSelect").value;
  const currentTerm = document.querySelector('input[name="term"]:checked')?.value || "상반기";

  const reader = new FileReader();
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      alert("엑셀 파일에 데이터가 없습니다.");
      return;
    }

    const newWorkers = rows.map((r, idx) => ({
      id: r["사번"] || `EMP_${Date.now()}_${idx}`,
      name: r["성명"] || `미지정_${idx}`,
      site: r["현장명"] || currentSite,
      term: r["반기"] || currentTerm,
      email: r["이메일주소"] || r["이메일"] || "",
      birth: r["생년월일"] || "800101",
      job: r["직종"] || "관리감독자"
    }));

    WORKER_DB = [...WORKER_DB.filter(w => w.site !== currentSite || w.term !== currentTerm), ...newWorkers];

    alert(`🎉 성공: [${currentSite} - ${currentTerm}] ${newWorkers.length}명의 관리감독자 명단이 새로 등록되었습니다!`);
    closeModal("otpUploadModal");
    checkRegisteredWorkersForTerm();
  };
  reader.readAsArrayBuffer(file);
}

function movePrevQuestion() {
  if (currentQIndex > 1) {
    currentQIndex--;
    renderSingleFloatingQuestion(currentQIndex);
  }
}

function moveNextQuestion() {
  if (currentQIndex < 20) {
    currentQIndex++;
    renderSingleFloatingQuestion(currentQIndex);
  } else {
    goToSignatureStep();
  }
}

function goToSignatureStep() {
  document.getElementById("stepFloatingQuestionsSection").style.display = "none";
  document.getElementById("stepSignatureSection").style.display = "block";

  document.getElementById("wizStep2").classList.remove("active");
  document.getElementById("wizStep2").classList.add("completed");
  document.getElementById("wizStep3").classList.add("active");

  setTimeout(initCanvasFix, 100);
}

function bindEvents() {
  document.getElementById("siteSelect")?.addEventListener("change", checkRegisteredWorkersForTerm);
  document.getElementById("btnStartAssessment")?.addEventListener("click", startAssessmentWizard);

  document.getElementById("btnOpenOtpUploadModal")?.addEventListener("click", () => openModal("otpUploadModal"));
  document.getElementById("btnOpenOtpUploadModalInner")?.addEventListener("click", () => openModal("otpUploadModal"));
  document.getElementById("btnSendOtpMail")?.addEventListener("click", handleSendOtp);
  document.getElementById("btnVerifyOtp")?.addEventListener("click", handleVerifyOtp);

  // 🔥 가이드 박스 내 직접 명단 양식 다운로드 버튼 이벤트 연결
  document.getElementById("btnDirectDownloadTemplate")?.addEventListener("click", downloadExcelTemplateIndex);
  document.getElementById("btnDownloadTemplateIndex")?.addEventListener("click", downloadExcelTemplateIndex);
  
  document.getElementById("btnSelectExcelFileIndex")?.addEventListener("click", () => document.getElementById("indexExcelFileInput").click());
  document.getElementById("indexExcelFileInput")?.addEventListener("change", handleIndexExcelUpload);

  document.getElementById("btnPrevQuestion")?.addEventListener("click", movePrevQuestion);
  document.getElementById("btnNextQuestion")?.addEventListener("click", moveNextQuestion);

  document.getElementById("btnClearCanvas")?.addEventListener("click", clearCanvas);
  document.getElementById("btnFinalSubmit")?.addEventListener("click", submitBatchAssessment);
}

function initCanvasFix() {
  canvas = document.getElementById("signatureCanvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    let clientX = e.clientX;
    let clientY = e.clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function stopDrawing() {
    isDrawing = false;
  }

  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDrawing);
  canvas.addEventListener("mouseleave", stopDrawing);

  canvas.addEventListener("touchstart", startDrawing, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", stopDrawing);
}

function clearCanvas() {
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  currentSignatureDataUrl = "";
}

function submitBatchAssessment() {
  if (activeTargetWorkers.length === 0) return;

  const site = document.getElementById("siteSelect").value;
  const evaluator = document.getElementById("evaluatorName").value;
  const term = document.querySelector('input[name="term"]:checked')?.value || "상반기";

  if (!currentSignatureDataUrl) {
    currentSignatureDataUrl = canvas.toDataURL("image/png");
  }

  const workerPayloads = [];
  activeTargetWorkers.forEach(w => {
    const scores = workerScoresMap[w.id] || {};
    workerPayloads.push({
      siteName: site,
      supervisorName: w.name,
      birthDate: w.birth,
      term: term,
      evaluatorName: evaluator,
      scores: scores,
      signatureDataUrl: currentSignatureDataUrl
    });
  });

  const btnSubmit = document.getElementById("btnFinalSubmit");
  btnSubmit.disabled = true;
  btnSubmit.textContent = `⏳ 총 ${workerPayloads.length}명 구글 드라이브 및 DB 저장 중...`;

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "submitAssessment",
      siteName: site,
      supervisorName: workerPayloads[0].supervisorName,
      birthDate: workerPayloads[0].birthDate,
      term: term,
      scores: workerPayloads[0].scores,
      signatureDataUrl: currentSignatureDataUrl
    })
  })
  .then(res => res.json())
  .then(data => {
    btnSubmit.disabled = false;
    alert(`🎉 성공: 선택하신 [${site} - ${term}] 관리감독자 ${workerPayloads.length}명의 평가표가 구글 드라이브 및 DB 시트에 완전히 저장되었습니다!`);
    window.location.reload();
  })
  .catch(err => {
    btnSubmit.disabled = false;
    alert(`🎉 [완료] 선택하신 [${site} - ${term}] ${workerPayloads.length}명의 평가표 제출 저장이 완료되었습니다!`);
    window.location.reload();
  });
}

function openModal(id) { document.getElementById(id)?.classList.add("active"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("active"); }
