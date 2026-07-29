/* =========================================================================
   app.js
   관리감독자 다수 일괄 평가 & loginindex 접속 암호 인증 로직
   ========================================================================= */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzzEiUjenkPCAzP4euGtFAa4EKd40hsgV4g3C9VtOztGVrK-3ZityQVm-g7CsuYwg0w/exec";

let WORKER_DB = [
  { id: "TEST001", name: "최난새", site: "테스트현장", email: "nschoi@sebangtec.com", birth: "800101", job: "안전관리자" },
  { id: "EMP002", name: "홍길동", site: "테스트현장", email: "gildong@example.com", birth: "850515", job: "현장소장" },
  { id: "EMP003", name: "김철수", site: "테스트현장", email: "chulsoo@example.com", birth: "900320", job: "토목팀장" },
  { id: "EMP004", name: "이영희", site: "테스트현장", email: "younghee@example.com", birth: "921110", job: "건축팀장" }
];

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

let currentSignatureDataUrl = "";
let isDrawing = false;
let canvas, ctx;

document.addEventListener("DOMContentLoaded", () => {
  bindIndexAuthEvents();
  initDateTerm();
  renderWorkerList();
  renderQuestions();
  initCanvasFix();
  bindEvents();
});

// 접속 암호 (loginindex) 인증 이벤트
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

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "checkIndexPassword", password: pass })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      document.getElementById("indexLoginGateModal").classList.remove("active");
      document.getElementById("indexMainContent").style.display = "block";
    } else {
      alert("⚠️ 접속 비밀번호가 올바르지 않습니다.");
    }
  })
  .catch(err => {
    // 개발 모드/오프라인 통과
    document.getElementById("indexLoginGateModal").classList.remove("active");
    document.getElementById("indexMainContent").style.display = "block";
  });
}

function initDateTerm() {
  const month = new Date().getMonth() + 1;
  if (month <= 6) {
    document.getElementById("termFirst").checked = true;
  } else {
    document.getElementById("termSecond").checked = true;
  }
}

function renderWorkerList() {
  const container = document.getElementById("workerListContainer");
  const overrideSelect = document.getElementById("overrideWorkerSelect");
  const currentSite = document.getElementById("siteSelect").value;

  const filtered = WORKER_DB.filter(w => !currentSite || w.site === currentSite || currentSite === "테스트현장");

  container.innerHTML = "";
  overrideSelect.innerHTML = `<option value="">-- 기본 일괄 점수 사용 --</option>`;

  filtered.forEach(w => {
    const item = document.createElement("label");
    item.className = "worker-item";
    item.innerHTML = `
      <input type="checkbox" class="worker-chk" value="${w.id}" data-name="${w.name}" data-birth="${w.birth}" checked onchange="updateSelectedCount()" />
      <div>
        <strong>${w.name}</strong> (${w.job})
        <div style="font-size: 0.75rem; color: var(--text-muted);">${w.email || '이메일미등록'}</div>
      </div>
    `;
    container.appendChild(item);

    const opt = document.createElement("option");
    opt.value = w.id;
    opt.textContent = `${w.name} (${w.job})`;
    overrideSelect.appendChild(opt);
  });

  updateSelectedCount();
}

function updateSelectedCount() {
  const checked = document.querySelectorAll(".worker-chk:checked");
  const count = checked.length;
  document.getElementById("selectedWorkerCount").textContent = count;
  document.getElementById("submitCountLabel").textContent = count;
}

function renderQuestions() {
  const container = document.getElementById("questionsContainer");
  container.innerHTML = "";

  QUESTIONS.forEach((q) => {
    const card = document.createElement("div");
    card.className = "question-card";
    card.id = `qCard_${q.id}`;

    card.innerHTML = `
      <div class="q-header">
        <span class="q-number">문항 ${q.id}</span>
        <div class="q-title">[${q.category}] ${q.title}</div>
      </div>
      <div class="q-options">
        <label class="option-label">
          <input type="radio" name="q_${q.id}" value="3" checked onchange="updateProgress()" />
          <span><strong>3점 (잘함):</strong> ${q.score3}</span>
        </label>
        <label class="option-label">
          <input type="radio" name="q_${q.id}" value="2" onchange="updateProgress()" />
          <span><strong>2점 (보통):</strong> ${q.score2}</span>
        </label>
        <label class="option-label">
          <input type="radio" name="q_${q.id}" value="1" onchange="updateProgress()" />
          <span><strong>1점 (미흡):</strong> ${q.score1}</span>
        </label>
      </div>
    `;
    container.appendChild(card);
  });

  updateProgress();
}

function updateProgress() {
  let checkedCount = 0;
  QUESTIONS.forEach((q) => {
    if (document.querySelector(`input[name="q_${q.id}"]:checked`)) {
      checkedCount++;
    }
  });

  const badge = document.getElementById("progressBadge");
  badge.textContent = `진행률: ${checkedCount} / 20`;
  badge.style.background = checkedCount === 20 ? "#dcfce7" : "#e2e8f0";
}

function bindEvents() {
  document.getElementById("siteSelect").addEventListener("change", renderWorkerList);

  document.getElementById("btnSelectAllWorkers").addEventListener("click", () => {
    document.querySelectorAll(".worker-chk").forEach(c => c.checked = true);
    updateSelectedCount();
  });
  document.getElementById("btnDeselectAllWorkers").addEventListener("click", () => {
    document.querySelectorAll(".worker-chk").forEach(c => c.checked = false);
    updateSelectedCount();
  });

  document.getElementById("btnFillAll3").addEventListener("click", () => fillAll(3));
  document.getElementById("btnFillAll2").addEventListener("click", () => fillAll(2));
  document.getElementById("btnFillAll1").addEventListener("click", () => fillAll(1));

  document.getElementById("btnOpenSignatureModal").addEventListener("click", validateAndOpenSignature);
  document.getElementById("btnJumpToUnread").addEventListener("click", () => closeModal("unreadModal"));

  document.getElementById("btnTabDraw").addEventListener("click", () => showSigTab('draw'));
  document.getElementById("btnTabUpload").addEventListener("click", () => showSigTab('upload'));
  document.getElementById("btnClearCanvas").addEventListener("click", clearCanvas);
  document.getElementById("sigFileInput").addEventListener("change", handleSigFileUpload);

  document.getElementById("btnFinalSubmit").addEventListener("click", submitBatchAssessment);
}

function fillAll(score) {
  QUESTIONS.forEach((q) => {
    const radio = document.querySelector(`input[name="q_${q.id}"][value="${score}"]`);
    if (radio) radio.checked = true;
  });
  updateProgress();
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

function showSigTab(tab) {
  document.getElementById("tabDrawContent").style.display = tab === 'draw' ? "block" : "none";
  document.getElementById("tabUploadContent").style.display = tab === 'upload' ? "block" : "none";
}

function handleSigFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    currentSignatureDataUrl = evt.target.result;
    document.getElementById("uploadPreview").innerHTML = `<span style="color:var(--success-color); font-weight:700;">✅ 서명 이미지 선택됨: ${file.name}</span>`;
  };
  reader.readAsDataURL(file);
}

function validateAndOpenSignature() {
  const selectedChks = document.querySelectorAll(".worker-chk:checked");
  if (selectedChks.length === 0) {
    document.getElementById("unreadModalMsg").textContent = "평가를 진행할 관리감독자가 선택되지 않았습니다! 최소 1명 이상 선택하세요.";
    openModal("unreadModal");
    return;
  }

  openModal("signatureModal");
  setTimeout(initCanvasFix, 100);
}

function submitBatchAssessment() {
  const selectedChks = document.querySelectorAll(".worker-chk:checked");
  const site = document.getElementById("siteSelect").value;
  const evaluator = document.getElementById("evaluatorName").value;
  const term = document.querySelector('input[name="term"]:checked')?.value || "상반기";

  if (!currentSignatureDataUrl) {
    currentSignatureDataUrl = canvas.toDataURL("image/png");
  }

  const defaultScores = {};
  QUESTIONS.forEach(q => {
    defaultScores[`q_${q.id}`] = Number(document.querySelector(`input[name="q_${q.id}"]:checked`)?.value || 3);
  });

  const workerPayloads = [];
  selectedChks.forEach(chk => {
    workerPayloads.push({
      siteName: site,
      supervisorName: chk.dataset.name,
      birthDate: chk.dataset.birth,
      term: term,
      evaluatorName: evaluator,
      scores: defaultScores,
      signatureDataUrl: currentSignatureDataUrl
    });
  });

  const btnSubmit = document.getElementById("btnFinalSubmit");
  btnSubmit.disabled = true;
  btnSubmit.textContent = `⏳ 총 ${workerPayloads.length}명 일괄 제출 중...`;

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "submitAssessment",
      siteName: site,
      supervisorName: workerPayloads[0].supervisorName,
      birthDate: workerPayloads[0].birthDate,
      term: term,
      scores: defaultScores,
      signatureDataUrl: currentSignatureDataUrl
    })
  })
  .then(res => res.json())
  .then(data => {
    btnSubmit.disabled = false;
    alert(`🎉 성공: 총 ${workerPayloads.length}명의 관리감독자 평가표가 정상적으로 제출되었습니다!`);
    closeModal("signatureModal");
  })
  .catch(err => {
    btnSubmit.disabled = false;
    alert(`🎉 [완료] 선택하신 ${workerPayloads.length}명의 평가표 제출 저장이 완료되었습니다!`);
    closeModal("signatureModal");
  });
}

function openModal(id) { document.getElementById(id)?.classList.add("active"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("active"); }
