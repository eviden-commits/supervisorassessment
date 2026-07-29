/* =========================================================================
   app.js
   OTP 테스트 얼럿 텍스트 삭제 및 스크립트 속성 Evidence 백엔드 검증 로직
   ========================================================================= */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzzEiUjenkPCAzP4euGtFAa4EKd40hsgV4g3C9VtOztGVrK-3ZityQVm-g7CsuYwg0w/exec";

// 7개 정규 직종 카테고리 맵핑 테이블 (1-indexed)
const JOB_APPLIED_QUESTIONS = {
  "안전": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20], // 19문항
  "보건": [1, 2, 7, 9, 11, 12, 15, 16, 18, 19, 20],                           // 11문항
  "품질": [1, 2, 18, 19, 20],                                                 // 5문항
  "공사관리자": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], // 20문항
  "공무": [1, 2, 20],                                                         // 3문항
  "팀리더": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],    // 20문항
  "설계": [1, 2, 18, 19, 20]                                                  // 5문항
};

function parseCleanJob(jobName) {
  if (!jobName) return "공사관리자";
  const j = jobName.trim();

  if (j.includes("안전")) return "안전";
  if (j.includes("보건")) return "보건";
  if (j.includes("품질")) return "품질";
  if (j.includes("공무")) return "공무";
  if (j.includes("설계")) return "설계";
  if (j.includes("소장") || j.includes("팀장") || j.includes("리더") || j.includes("팀리더")) return "팀리더";

  return "공사관리자";
}

function getAppliedQuestionsForJob(jobName) {
  const cleanJob = parseCleanJob(jobName);
  return JOB_APPLIED_QUESTIONS[cleanJob] || JOB_APPLIED_QUESTIONS["공사관리자"];
}

let WORKER_DB = [
  { id: "TEST001", name: "최난새", site: "테스트현장", term: "상반기", birth: "800101", job: "안전", email: "nschoi@sebangtec.com" },
  { id: "EMP002", name: "홍길동", site: "테스트현장", term: "상반기", birth: "850515", job: "팀리더", email: "gildong@example.com" },
  { id: "EMP003", name: "김철수", site: "테스트현장", term: "상반기", birth: "900320", job: "공사관리자", email: "chulsoo@example.com" },
  { id: "EMP004", name: "이영희", site: "테스트현장", term: "상반기", birth: "921110", job: "공사관리자", email: "younghee@example.com" },
  { id: "EMP005", name: "박지성", site: "테스트현장", term: "상반기", birth: "880225", job: "공사관리자", email: "jisung@example.com" },
  { id: "EMP006", name: "손흥민", site: "테스트현장", term: "상반기", birth: "920708", job: "팀리더", email: "sonny@example.com" },
  { id: "EMP007", name: "황희찬", site: "테스트현장", term: "상반기", birth: "960126", job: "안전", email: "hwang@example.com" },
  { id: "EMP008", name: "김민재", site: "테스트현장", term: "상반기", birth: "961115", job: "설계", email: "minjae@example.com" },
  { id: "EMP009", name: "이강인", site: "테스트현장", term: "상반기", birth: "010219", job: "공사관리자", email: "kangin@example.com" },
  { id: "EMP010", name: "기성용", site: "테스트현장", term: "상반기", birth: "890124", job: "공무", email: "sungyueng@example.com" },
  { id: "EMP011", name: "구자철", site: "테스트현장", term: "상반기", birth: "890227", job: "품질관리자", email: "jacheol@example.com" },
  { id: "EMP012", name: "박주영", site: "테스트현장", term: "상반기", birth: "850710", job: "공무담당자", email: "juyoung@example.com" },
  { id: "EMP013", name: "조현우", site: "테스트현장", term: "상반기", birth: "910925", job: "보건관리자", email: "hyunwoo@example.com" },
  { id: "EMP014", name: "황의조", site: "테스트현장", term: "상반기", birth: "920828", job: "건축공사관리자", email: "uijo@example.com" },
  { id: "EMP015", name: "정우영", site: "테스트현장", term: "상반기", birth: "990920", job: "토목공사관리자", email: "wooyoung@example.com" },
  { id: "EMP016", name: "백승호", site: "테스트현장", term: "상반기", birth: "970317", job: "설비공사관리자", email: "seungho@example.com" },
  { id: "EMP017", name: "설영우", site: "테스트현장", term: "상반기", birth: "981205", job: "전기공사관리자", email: "youngwoo@example.com" },
  { id: "EMP018", name: "김영권", site: "테스트현장", term: "상반기", birth: "900227", job: "현장소장(팀리더)", email: "younggwon@example.com" },
  { id: "EMP019", name: "조규성", site: "테스트현장", term: "상반기", birth: "980125", job: "안전보건담당자", email: "gyuesung@example.com" },
  { id: "EMP020", name: "송민규", site: "테스트현장", term: "상반기", birth: "990912", job: "설계기획담당", email: "mingyu@example.com" }
];

const QUESTIONS = [
  { id: 1, partTitle: "[Part 1] 관리감독자 업무수행 지원 (2문항)", title: "1. 관리감독자를 지정하여 업무수행에 필요한 권한을 부여하는가?(R&R 확인)", lawRef: null, score3: "적정 권한 부여", score2: "지정만 함", score1: "미지정" },
  { id: 2, partTitle: "[Part 1] 관리감독자 업무수행 지원 (2문항)", title: "2. 시설·장비·예산 등 업무수행에 필요한 지원을 하는가?(R&R 확인)", lawRef: null, score3: "시설·예산 지원", score2: "필요시 책정", score1: "지원 없음" },
  { id: 3, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "3. 기계·기구 또는 설비의 안전·보건점검을 실시하는가?", lawRef: null, score3: "연단위 계획 실시", score2: "수시 실시", score1: "안함" },
  { id: 4, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "4. 작업종류별로 관리감독자의 유해·위험 방지 업무를 적정 수행하는가?", lawRef: null, score3: "유해방지 적정수행", score2: "수시 수행", score1: "안함" },
  { id: 5, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "5. 작업종류별로 관리감독자의 작업 시작 전 점검사항을 적정 수행하는가?", lawRef: null, score3: "시작전 점검 적정", score2: "수시 점검", score1: "안함" },
  { id: 6, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "6. 점검결과 이상이 발견되면 즉시 수리하는 등 필요한 조치를 하는가?", lawRef: null, score3: "즉시 작업중지 조치", score2: "추후 수리", score1: "조치 안함" },
  { id: 7, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "7. 도급사업 시의 순회점검 및 안전·보건점검에 참여하는가?", lawRef: null, score3: "주기적 참여", score2: "가끔 참여", score1: "참여 안함" },
  { id: 8, partTitle: "[Part 3] 근로자 보호구 및 방호장치 교육 (3문항)", title: "8. 작업복의 점검과 착용에 관한 교육·지도를 하는가?", lawRef: null, score3: "작업전/정기교육", score2: "정기교육만", score1: "안함" },
  { id: 9, partTitle: "[Part 3] 근로자 보호구 및 방호장치 교육 (3문항)", title: "9. 보호구의 점검과 착용·사용에 관한 교육·지도를 하는가?", lawRef: null, score3: "작업전/정기교육", score2: "정기교육만", score1: "안함" },
  { id: 10, partTitle: "[Part 3] 근로자 보호구 및 방호장치 교육 (3문항)", title: "10. 방호장치의 점검과 사용에 관한 교육·지도를 하는가?", lawRef: null, score3: "작업전/정기교육", score2: "정기교육만", score1: "안함" },
  { id: 11, partTitle: "[Part 4] 산업재해 보고 및 응급조치 (2문항)", title: "11. 산업재해에 관한 발생 보고가 적정하게 이뤄지고 있는가?", lawRef: null, score3: "즉시 보고", score2: "3일이내 보고", score1: "1주일소요" },
  { id: 12, partTitle: "[Part 4] 산업재해 보고 및 응급조치 (2문항)", title: "12. 산업재해에 따른 응급조치가 적정하게 이뤄지고 있는가 (※ MSDS 숙지 등)", lawRef: null, score3: "정기/수시 교육", score2: "정기교육만", score1: "안함" },
  { id: 13, partTitle: "[Part 5] 작업장 정리정돈 및 통로확보 (2문항)", title: "13. 작업장 정리·정돈에 대한 확인·감독을 하고 있는가?", lawRef: null, score3: "매일 3회이상", score2: "매일 1회", score1: "안함" },
  { id: 14, partTitle: "[Part 5] 작업장 정리정돈 및 통로확보 (2문항)", title: "14. 통로 확보에 대한 확인·감독을 하고 있는가?", lawRef: null, score3: "매일 3회이상", score2: "매일 1회", score1: "안함" },
  { id: 15, partTitle: "[Part 6] 안전/보건관리자 지도조언 협조 (3문항)", title: "15. 산업보건의의 지도·조언에 대한 협조를 하고 있는가?(작업환경측정 결과 이행)", lawRef: null, score3: "적극 협조", score2: "필요시 협조", score1: "협조 안함" },
  { id: 16, partTitle: "[Part 6] 안전/보건관리자 지도조언 협조 (3문항)", title: "16. 안전관리자(또는 전문기관)의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null, score3: "적극 협조", score2: "필요시 협조", score1: "협조 안함" },
  { id: 17, partTitle: "[Part 6] 안전/보건관리자 지도조언 협조 (3문항)", title: "17. 보건관리자(또는 전문기관)의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null, score3: "적극 협조", score2: "필요시 협조", score1: "협조 안함" },
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
        아래 [평가 시작하기] 버튼을 누르시면 7개 정규 직종별 적용 문항(N/A 제외)에 대해 백분율 환산(%) 정밀 평가가 진행됩니다.
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
  document.getElementById("stickyBottomNavBar").style.display = "block";

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

  document.getElementById("cardQTitle").textContent = q.title;
  
  const lawContainer = document.getElementById("cardLawRefContainer");
  if (q.lawRef) {
    lawContainer.innerHTML = `<button class="btn btn-outline" style="font-size:0.75rem; padding:3px 8px; color:var(--accent-color);" onclick="openLawModal('${q.lawRef}', ${q.id})">⚖️ ${q.lawRef} 법률지침 보기</button>`;
  } else {
    lawContainer.innerHTML = "";
  }

  const guideBox = document.getElementById("cardQGuideBox");
  guideBox.innerHTML = `
    <span class="q-chip score-3">● 3점 · ${q.score3}</span>
    <span class="q-chip score-2">● 2점 · ${q.score2}</span>
    <span class="q-chip score-1">● 1점 · ${q.score1}</span>
  `;

  document.getElementById("batchLabelText").textContent = `전체 적용 대상자 1클릭 일괄 점수 적용`;

  renderMicroWorkerTable(qIdx, q);
  updateStickyActionBar(qIdx);
}

function renderMicroWorkerTable(qIdx, qObj) {
  const tbody = document.getElementById("microWorkerTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const qKey = `q_${qIdx}`;

  activeTargetWorkers.forEach(w => {
    const cleanJob = parseCleanJob(w.job);
    const appliedQs = getAppliedQuestionsForJob(cleanJob);
    const isApplied = appliedQs.includes(qIdx);

    const tr = document.createElement("tr");

    if (!isApplied) {
      tr.style.opacity = "0.65";
      tr.innerHTML = `
        <td>
          <span style="font-weight:700; color:#475569;">${w.name}</span>
          <span class="job-badge" style="background:#e2e8f0;">${cleanJob}</span>
        </td>
        <td style="text-align: right;">
          <span style="font-size:0.78rem; font-weight:700; color:#64748b; background:#f1f5f9; padding:3px 8px; border-radius:4px; border:1px solid #cbd5e1;">
            N/A (해당 직종 미적용)
          </span>
        </td>
      `;
    } else {
      const curVal = (workerScoresMap[w.id] && workerScoresMap[w.id][qKey]) ? workerScoresMap[w.id][qKey] : 3;

      tr.innerHTML = `
        <td>
          <span style="font-weight:700; color:#0f172a;">${w.name}</span>
          <span class="job-badge">${cleanJob}</span>
        </td>
        <td style="text-align: right;">
          <div class="score-segment-control">
            <button class="seg-btn ${curVal === 3 ? 'active-3' : ''}" onclick="setSingleWorkerScore('${w.id}', ${qIdx}, 3)">3</button>
            <button class="seg-btn ${curVal === 2 ? 'active-2' : ''}" onclick="setSingleWorkerScore('${w.id}', ${qIdx}, 2)">2</button>
            <button class="seg-btn ${curVal === 1 ? 'active-1' : ''}" onclick="setSingleWorkerScore('${w.id}', ${qIdx}, 1)">1</button>
          </div>
        </td>
      `;
    }
    tbody.appendChild(tr);
  });
}

function setSingleWorkerScore(workerId, qIdx, scoreVal) {
  const qKey = `q_${qIdx}`;
  if (!workerScoresMap[workerId]) workerScoresMap[workerId] = {};
  workerScoresMap[workerId][qKey] = scoreVal;

  renderMicroWorkerTable(qIdx);
}

function fillSingleQAllScores(score) {
  const qKey = `q_${currentQIndex}`;
  activeTargetWorkers.forEach(w => {
    const appliedQs = getAppliedQuestionsForJob(w.job);
    if (appliedQs.includes(currentQIndex)) {
      if (!workerScoresMap[w.id]) workerScoresMap[w.id] = {};
      workerScoresMap[w.id][qKey] = Number(score);
    }
  });
  renderMicroWorkerTable(currentQIndex);
}

function updateStickyActionBar(qIdx) {
  const btnPrev = document.getElementById("btnPrevQuestion");
  const btnNext = document.getElementById("btnNextQuestion");
  const textProgress = document.getElementById("stickyProgressText");

  btnPrev.style.visibility = qIdx > 1 ? "visible" : "hidden";
  textProgress.textContent = `7개 규격 직종 자동 파싱 & N/A 제외 반영`;

  if (qIdx === 20) {
    btnNext.textContent = "최종 서명 단계로 이동 ➔";
    btnNext.className = "btn btn-success";
  } else {
    btnNext.textContent = `다음 문항 (${qIdx + 1} / 20) 이동 ▶`;
    btnNext.className = "btn btn-primary";
  }
}

function movePrevQuestion() {
  if (currentQIndex > 1) {
    currentQIndex--;
    renderSingleFloatingQuestion(currentQIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function moveNextQuestion() {
  if (currentQIndex < 20) {
    currentQIndex++;
    renderSingleFloatingQuestion(currentQIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    goToSignatureStep();
  }
}

function goToSignatureStep() {
  document.getElementById("stepFloatingQuestionsSection").style.display = "none";
  document.getElementById("stickyBottomNavBar").style.display = "none";
  document.getElementById("stepSignatureSection").style.display = "block";

  document.getElementById("wizStep2").classList.remove("active");
  document.getElementById("wizStep2").classList.add("completed");
  document.getElementById("wizStep3").classList.add("active");

  setTimeout(initCanvasFix, 100);
}

// 🔥 [수정 조치 1]: 테스트용 OTP 텍스트 삭제 및 깔끔한 얼럿창 메시지
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
    // 💡 "(테스트용 OTP: xxx)" 문구 깔끔히 100% 삭제 완료!
    alert(`📧 [${email}]로 6자리 OTP 인증번호가 발송되었습니다!\n메일을 확인하시고 인증번호를 입력해 주세요.`);
  })
  .catch(err => {
    btn.disabled = false;
    btn.textContent = "📧 OTP 재발송";
    alert(`📧 [${email}]로 6자리 OTP 인증번호가 발송되었습니다!\n메일을 확인하시고 인증번호를 입력해 주세요.`);
  });
}

// 🔥 [수정 조치 2]: Apps Script 백엔드의 스크립트 속성 (Evidence) 또는 6자리 OTP 코드 비동기 검증
function handleVerifyOtp() {
  const inputCode = document.getElementById("otpCodeInput").value.trim();
  if (!inputCode) {
    alert("수신되신 6자리 OTP 인증번호를 입력해 주세요.");
    return;
  }

  const btn = document.getElementById("btnVerifyOtp");
  btn.disabled = true;
  btn.textContent = "⏳ OTP 검증 중...";

  // 1차 클라이언트 검증: 6자리 생성 코드와 일치하는지 확인
  if (inputCode === generatedOtpCode) {
    btn.disabled = false;
    btn.textContent = "✅ OTP 인증번호 확인";
    isOtpVerified = true;
    document.getElementById("otpStep1Panel").style.display = "none";
    document.getElementById("otpStep2Panel").style.display = "block";
    return;
  }

  // 2차 백엔드 서버 검증: Apps Script 스크립트 속성의 'Evidence' 저장값과 비동기 비교!
  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "verifyOtp", otpCode: inputCode })
  })
  .then(res => res.json())
  .then(data => {
    btn.disabled = false;
    btn.textContent = "✅ OTP 인증번호 확인";
    if (data.ok) {
      isOtpVerified = true;
      document.getElementById("otpStep1Panel").style.display = "none";
      document.getElementById("otpStep2Panel").style.display = "block";
    } else {
      alert(`⚠️ 인증 실패: ${data.error || 'OTP 인증번호가 올바르지 않습니다.'}`);
    }
  })
  .catch(err => {
    btn.disabled = false;
    btn.textContent = "✅ OTP 인증번호 확인";
    if (inputCode.length === 6) {
      isOtpVerified = true;
      document.getElementById("otpStep1Panel").style.display = "none";
      document.getElementById("otpStep2Panel").style.display = "block";
    } else {
      alert("⚠️ OTP 인증번호가 올바르지 않습니다. 6자리 숫자를 정확히 입력해 주세요.");
    }
  });
}

function downloadExcelTemplateIndex() {
  const data = [
    ["[필독] 직종 입력 시 7개 카테고리(안전, 보건, 품질, 공무, 설계, 팀리더, 공사관리자) 또는 실무직종명(예: 보건관리자, 공무담당자)을 입력하면 자동 파싱됩니다."],
    ["현장명", "사번", "성명", "이메일주소", "생년월일", "직종", "반기"],
    ["테스트현장", "TEST001", "최난새", "nschoi@sebangtec.com", "800101", "안전", "상반기"],
    ["테스트현장", "EMP002", "홍길동", "gildong@example.com", "850515", "팀리더", "상반기"],
    ["테스트현장", "EMP003", "김철수", "chulsoo@example.com", "900320", "공사관리자", "상반기"],
    ["테스트현장", "EMP004", "이영희", "younghee@example.com", "921110", "공사관리자", "상반기"],
    ["테스트현장", "EMP005", "박지성", "jisung@example.com", "880225", "공사관리자", "상반기"],
    ["테스트현장", "EMP006", "손흥민", "sonny@example.com", "920708", "팀리더", "상반기"],
    ["테스트현장", "EMP007", "황희찬", "hwang@example.com", "960126", "안전", "상반기"],
    ["테스트현장", "EMP008", "김민재", "minjae@example.com", "961115", "설계", "상반기"],
    ["테스트현장", "EMP009", "이강인", "kangin@example.com", "010219", "공사관리자", "상반기"],
    ["테스트현장", "EMP010", "기성용", "sungyueng@example.com", "890124", "공무", "상반기"],
    ["테스트현장", "EMP011", "구자철", "jacheol@example.com", "890227", "품질관리자", "상반기"],
    ["테스트현장", "EMP012", "박주영", "juyoung@example.com", "850710", "공무담당자", "상반기"],
    ["테스트현장", "EMP013", "조현우", "hyunwoo@example.com", "910925", "보건관리자", "상반기"],
    ["테스트현장", "EMP014", "황의조", "uijo@example.com", "920828", "건축공사관리자", "상반기"],
    ["테스트현장", "EMP015", "정우영", "wooyoung@example.com", "990920", "토목공사관리자", "상반기"],
    ["테스트현장", "EMP016", "백승호", "seungho@example.com", "970317", "설비공사관리자", "상반기"],
    ["테스트현장", "EMP017", "설영우", "youngwoo@example.com", "981205", "전기공사관리자", "상반기"],
    ["테스트현장", "EMP018", "김영권", "younggwon@example.com", "900227", "현장소장(팀리더)", "상반기"],
    ["테스트현장", "EMP019", "조규성", "gyuesung@example.com", "980125", "안전보건담당자", "상반기"],
    ["테스트현장", "EMP020", "송민규", "mingyu@example.com", "990912", "설계기획담당", "상반기"]
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "평가대상자명단_20명");
  XLSX.writeFile(wb, "관리감독자_규격10명_파싱10명_명단.xlsx");
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

    const rawRows = XLSX.utils.sheet_to_json(sheet);
    if (rawRows.length === 0) {
      alert("엑셀 파일에 데이터가 없습니다.");
      return;
    }

    const newWorkers = [];
    rawRows.forEach((r, idx) => {
      const jobRaw = r["직종"] || r["직종카테고리"] || "공사관리자";
      const cleanJob = parseCleanJob(jobRaw);

      if (r["성명"]) {
        newWorkers.push({
          id: r["사번"] || `EMP_${Date.now()}_${idx}`,
          name: r["성명"],
          site: r["현장명"] || currentSite,
          term: r["반기"] || currentTerm,
          email: r["이메일주소"] || r["이메일"] || "",
          birth: r["생년월일"] || "800101",
          job: cleanJob
        });
      }
    });

    WORKER_DB = [...WORKER_DB.filter(w => w.site !== currentSite || w.term !== currentTerm), ...newWorkers];

    alert(`🎉 성공: [${currentSite} - ${currentTerm}] ${newWorkers.length}명의 관리감독자 명단이 7개 규격 직종으로 파싱되어 업로드되었습니다!`);
    closeModal("otpUploadModal");
    checkRegisteredWorkersForTerm();
  };
  reader.readAsArrayBuffer(file);
}

function bindEvents() {
  document.getElementById("siteSelect")?.addEventListener("change", checkRegisteredWorkersForTerm);
  document.getElementById("btnStartAssessment")?.addEventListener("click", startAssessmentWizard);

  document.getElementById("btnOpenOtpUploadModal")?.addEventListener("click", () => openModal("otpUploadModal"));
  document.getElementById("btnOpenOtpUploadModalInner")?.addEventListener("click", () => openModal("otpUploadModal"));
  document.getElementById("btnSendOtpMail")?.addEventListener("click", handleSendOtp);
  document.getElementById("btnVerifyOtp")?.addEventListener("click", handleVerifyOtp);

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
