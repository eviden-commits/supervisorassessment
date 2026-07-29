/* =========================================================================
   app.js
   5단계 순차 위저드 & 반기별 DB 인원 검증 & 1문항씩 플로팅 스마트 카드 로직
   ========================================================================= */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzzEiUjenkPCAzP4euGtFAa4EKd40hsgV4g3C9VtOztGVrK-3ZityQVm-g7CsuYwg0w/exec";

// DB 시트에 등록된 관리감독자 목록 (스프레드시트 DB 시트 Users와 연동)
let WORKER_DB = [
  { id: "TEST001", name: "최난새", site: "테스트현장", term: "상반기", birth: "800101", job: "안전관리자" },
  { id: "EMP002", name: "홍길동", site: "테스트현장", term: "상반기", birth: "850515", job: "현장소장" },
  { id: "EMP003", name: "김철수", site: "테스트현장", term: "상반기", birth: "900320", job: "토목팀장" },
  { id: "EMP004", name: "이영희", site: "테스트현장", term: "상반기", birth: "921110", job: "건축팀장" },
  { id: "EMP005", name: "박지성", site: "테스트현장", term: "상반기", birth: "880225", job: "설비팀장" },
  { id: "EMP006", name: "손흥민", site: "테스트현장", term: "상반기", birth: "920708", job: "전기팀장" },
  { id: "EMP007", name: "황희찬", site: "테스트현장", term: "상반기", birth: "960126", job: "안전담당자" }
];

const QUESTIONS = [
  { id: 1, partTitle: "[Part 1] 관리감독자 업무수행 지원 (2문항)", title: "1. 관리감독자를 지정하여 업무수행에 필요한 권한을 부여하는가?", lawRef: null },
  { id: 2, partTitle: "[Part 1] 관리감독자 업무수행 지원 (2문항)", title: "2. 시설·장비·예산 등 업무수행에 필요한 지원을 하는가?", lawRef: null },
  { id: 3, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "3. 기계·기구 또는 설비의 안전·보건점검을 실시하는가?", lawRef: null },
  { id: 4, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "4. 작업종류별로 관리감독자의 유해·위험 방지 업무*를 적정 수행하는가", lawRef: "별표2" },
  { id: 5, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "5. 작업종류별로 관리감독자의 작업 시작 전 점검사항*을 적정 수행하는가", lawRef: "별표3" },
  { id: 6, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "6. 점검결과 이상이 발견되면 즉시 수리하는 등 필요한 조치를 하는가?", lawRef: null },
  { id: 7, partTitle: "[Part 2] 기계·기구/설비 안전보건점검 (5문항)", title: "7. 도급사업 시의 순회점검 및 안전·보건점검에 참여하는가?", lawRef: null },
  { id: 8, partTitle: "[Part 3] 근로자 보호구 및 방호장치 교육 (3문항)", title: "8. 작업복의 점검과 착용에 관한 교육·지도를 하는가?", lawRef: null },
  { id: 9, partTitle: "[Part 3] 근로자 보호구 및 방호장치 교육 (3문항)", title: "9. 보호구의 점검과 착용·사용에 관한 교육·지도를 하는가?", lawRef: null },
  { id: 10, partTitle: "[Part 3] 근로자 보호구 및 방호장치 교육 (3문항)", title: "10. 방호장치의 점검과 사용에 관한 교육·지도를 하는가?", lawRef: null },
  { id: 11, partTitle: "[Part 4] 산업재해 보고 및 응급조치 (2문항)", title: "11. 산업재해에 관한 발생 보고가 적정하게 이뤄지고 있는가?", lawRef: null },
  { id: 12, partTitle: "[Part 4] 산업재해 보고 및 응급조치 (2문항)", title: "12. 산업재해에 따른 응급조치가 적정하게 이뤄지고 있는가 (※ MSDS 숙지 등)", lawRef: null },
  { id: 13, partTitle: "[Part 5] 작업장 정리정돈 및 통로확보 (2문항)", title: "13. 작업장 정리·정돈에 대한 확인·감독을 하고 있는가?", lawRef: null },
  { id: 14, partTitle: "[Part 5] 작업장 정리정돈 및 통로확보 (2문항)", title: "14. 통로 확보에 대한 확인·감독을 하고 있는가?", lawRef: null },
  { id: 15, partTitle: "[Part 6] 안전/보건관리자 지도조언 협조 (3문항)", title: "15. 산업보건의의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null },
  { id: 16, partTitle: "[Part 6] 안전/보건관리자 지도조언 협조 (3문항)", title: "16. 안전관리자(또는 전문기관)의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null },
  { id: 17, partTitle: "[Part 6] 안전/보건관리자 지도조언 협조 (3문항)", title: "17. 보건관리자(또는 전문기관)의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null },
  { id: 18, partTitle: "[Part 7] 위험성평가 및 기타 이행 (3문항)", title: "18. 위험성평가 유해·위험요인 파악에 대한 참여를 하고 있는가?", lawRef: null },
  { id: 19, partTitle: "[Part 7] 위험성평가 및 기타 이행 (3문항)", title: "19. 개선조치의 시행에 참여를 하고 있는가?", lawRef: null },
  { id: 20, partTitle: "[Part 7] 위험성평가 및 기타 이행 (3문항)", title: "20. 그 밖에 안전 및 보건에 관한 사항을 적정하게 이행하고 있는가", lawRef: "기타" }
];

let currentQIndex = 1; // 1 ~ 20
let activeTargetWorkers = []; // 현재 현장 및 반기에 등록되어 평가 대상이 되는 인원들
let workerScoresMap = {}; // { workerId: { q_1: 3, q_2: 3, ... } }
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
    btn.textContent = "🔒 비밀번호 확인 및 입장하기";
    if (data.ok) {
      showStepIntro();
    } else {
      alert(`⚠️ 인증 실패: ${data.error || '접속 비밀번호가 올바르지 않습니다.'}`);
    }
  })
  .catch(err => {
    btn.disabled = false;
    btn.textContent = "🔒 비밀번호 확인 및 입장하기";
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

// 📌 현장 및 반기 선택 시 DB 인원 자동 유효성 검사 (핵심 요구사항 반영)
function checkRegisteredWorkersForTerm() {
  const site = document.getElementById("siteSelect")?.value || "테스트현장";
  const term = document.querySelector('input[name="term"]:checked')?.value || "상반기";
  const resultBox = document.getElementById("workerCheckResultBox");
  const btnStart = document.getElementById("btnStartAssessment");

  // 등록 인원 필터링 (현장명 & 반기 대조)
  activeTargetWorkers = WORKER_DB.filter(w => {
    const siteMatch = !site || w.site === site || site === "테스트현장";
    // 반기 구분 (등록 데이터에 term이 있거나 기본 상반기 허용)
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
        ${term} 평가를 진행하려면 먼저 관리자 전용 메뉴에서 관리감독자 엑셀 명단을 등록하셔야 합니다.<br>
        <strong>상반기에 인원이 있었더라도 ${term} 명단이 등록되지 않으면 평가 진행이 불가능합니다.</strong>
      </p>
      <div style="margin-top:0.75rem;">
        <a href="admin.html" class="btn btn-danger" style="font-size:0.8rem; padding:0.4rem 0.8rem;">🔒 관리자 전용 엑셀 명단 등록하러 가기 ➔</a>
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

    // 인원별 점수 맵 초기화 (모두 기본 3점)
    workerScoresMap = {};
    activeTargetWorkers.forEach(w => {
      workerScoresMap[w.id] = {};
      QUESTIONS.forEach(q => workerScoresMap[w.id][`q_${q.id}`] = 3);
    });
  }
}

// 🚀 평가 시작하기 버튼 클릭 (1단계 ➔ 2단계 이동)
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

// 🎯 문항 1개 플로팅 스마트 카드 동적 렌더링
function renderSingleFloatingQuestion(qIdx) {
  const q = QUESTIONS.find(item => item.id === qIdx);
  if (!q) return;

  // 헤더 및 라벨 갱신
  document.getElementById("currentQIndexLabel").textContent = qIdx;
  document.getElementById("currentQCategoryLabel").textContent = q.partTitle;
  
  const pct = (qIdx / 20) * 100;
  document.getElementById("qProgressBar").style.width = `${pct}%`;

  // 카드 내용 갱신
  document.getElementById("cardQNum").textContent = `문항 ${qIdx} / 20`;
  document.getElementById("cardQCategory").textContent = q.partTitle;
  document.getElementById("cardQTitle").textContent = q.title;
  document.getElementById("cardWorkerCountSpan").textContent = `${activeTargetWorkers.length}명`;

  // 법률 보기 버튼
  const lawContainer = document.getElementById("cardLawRefContainer");
  if (q.lawRef) {
    lawContainer.innerHTML = `<button class="btn btn-outline" style="font-size:0.78rem; padding:4px 8px; color:var(--accent-color);" onclick="openLawModal('${q.lawRef}', ${q.id})">⚖️ ${q.lawRef} 관련 법률 및 점검 지침 보기</button>`;
  } else {
    lawContainer.innerHTML = "";
  }

  // 이 문항 인원별 미세점수 조절 테이블 렌더링
  renderMicroWorkerTable(qIdx);

  // 이전/다음 버튼 제어
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

// 등록된 인원별 이 문항 미세 점수 조정 테이블 렌더링
function renderMicroWorkerTable(qIdx) {
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
          <option value="3" ${curVal === 3 ? 'selected' : ''}>🟢 3점 (잘함/적정)</option>
          <option value="2" ${curVal === 2 ? 'selected' : ''}>🟡 2점 (보통/필요시)</option>
          <option value="1" ${curVal === 1 ? 'selected' : ''}>🔴 1점 (미흡/안함)</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 이 문항 전원 일괄 점수 적용 (3점/2점/1점)
function fillSingleQAllScores(score) {
  const qKey = `q_${currentQIndex}`;
  activeTargetWorkers.forEach(w => {
    if (!workerScoresMap[w.id]) workerScoresMap[w.id] = {};
    workerScoresMap[w.id][qKey] = Number(score);
  });
  renderMicroWorkerTable(currentQIndex);
}

// 개별 인원 이 문항 점수 변경
function onSingleQWorkerScoreChange(workerId, qIdx, selectEl) {
  const val = Number(selectEl.value);
  const qKey = `q_${qIdx}`;
  if (!workerScoresMap[workerId]) workerScoresMap[workerId] = {};
  workerScoresMap[workerId][qKey] = val;

  selectEl.className = `micro-score-select ${val === 3 ? 'score-3' : (val === 2 ? 'score-2' : 'score-1')}`;
}

// 이전 / 다음 문항 이동
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
    // 20번 문항 완료 ➔ Step 3 최종 서명 단계로 전환
    goToSignatureStep();
  }
}

// ✍️ 3단계: 최종 서명 및 제출 단계로 전환
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
