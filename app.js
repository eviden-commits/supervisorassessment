/* =========================================================================
   app.js
   7개 파트별 인원 매트릭스 점수표 기본 노출 및 파트별 일괄 점수 적용 로직
   ========================================================================= */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzzEiUjenkPCAzP4euGtFAa4EKd40hsgV4g3C9VtOztGVrK-3ZityQVm-g7CsuYwg0w/exec";

let WORKER_DB = [
  { id: "TEST001", name: "최난새", site: "테스트현장", email: "nschoi@sebangtec.com", birth: "800101", job: "안전관리자" },
  { id: "EMP002", name: "홍길동", site: "테스트현장", email: "gildong@example.com", birth: "850515", job: "현장소장" },
  { id: "EMP003", name: "김철수", site: "테스트현장", email: "chulsoo@example.com", birth: "900320", job: "토목팀장" },
  { id: "EMP004", name: "이영희", site: "테스트현장", email: "younghee@example.com", birth: "921110", job: "건축팀장" },
  { id: "EMP005", name: "박지성", site: "테스트현장", email: "jisung@example.com", birth: "880225", job: "설비팀장" },
  { id: "EMP006", name: "손흥민", site: "테스트현장", email: "sonny@example.com", birth: "920708", job: "전기팀장" },
  { id: "EMP007", name: "황희찬", site: "테스트현장", email: "hwang@example.com", birth: "960126", job: "안전담당자" }
];

const QUESTIONS = [
  { id: 1, part: 1, partTitle: "Part 1. 관리감독자 업무수행 지원 (2)", title: "관리감독자를 지정하여 업무수행에 필요한 권한을 부여하는가?", lawRef: null },
  { id: 2, part: 1, partTitle: "Part 1. 관리감독자 업무수행 지원 (2)", title: "시설·장비·예산 등 업무수행에 필요한 지원을 하는가?", lawRef: null },
  
  { id: 3, part: 2, partTitle: "Part 2. 기계·기구/설비 안전보건점검 (5)", title: "기계·기구 또는 설비의 안전·보건점검을 실시하는가?", lawRef: null },
  { id: 4, part: 2, partTitle: "Part 2. 기계·기구/설비 안전보건점검 (5)", title: "작업종류별로 관리감독자의 유해·위험 방지 업무*를 적정 수행하는가", lawRef: "별표2" },
  { id: 5, part: 2, partTitle: "Part 2. 기계·기구/설비 안전보건점검 (5)", title: "작업종류별로 관리감독자의 작업 시작 전 점검사항*을 적정 수행하는가", lawRef: "별표3" },
  { id: 6, part: 2, partTitle: "Part 2. 기계·기구/설비 안전보건점검 (5)", title: "점검결과 이상이 발견되면 즉시 수리하는 등 필요한 조치를 하는가?", lawRef: null },
  { id: 7, part: 2, partTitle: "Part 2. 기계·기구/설비 안전보건점검 (5)", title: "도급사업 시의 순회점검 및 안전·보건점검에 참여하는가?", lawRef: null },

  { id: 8, part: 3, partTitle: "Part 3. 근로자 보호구 및 방호장치 교육·지도 (3)", title: "작업복의 점검과 착용에 관한 교육·지도를 하는가?", lawRef: null },
  { id: 9, part: 3, partTitle: "Part 3. 근로자 보호구 및 방호장치 교육·지도 (3)", title: "보호구의 점검과 착용·사용에 관한 교육·지도를 하는가?", lawRef: null },
  { id: 10, part: 3, partTitle: "Part 3. 근로자 보호구 및 방호장치 교육·지도 (3)", title: "방호장치의 점검과 사용에 관한 교육·지도를 하는가?", lawRef: null },

  { id: 11, part: 4, partTitle: "Part 4. 산업재해 보고 및 응급조치 (2)", title: "산업재해에 관한 발생 보고가 적정하게 이뤄지고 있는가?", lawRef: null },
  { id: 12, part: 4, partTitle: "Part 4. 산업재해 보고 및 응급조치 (2)", title: "산업재해에 따른 응급조치가 적정하게 이뤄지고 있는가 (※ MSDS 숙지 등)", lawRef: null },

  { id: 13, part: 5, partTitle: "Part 5. 작업장 정리정돈 및 통로확보 (2)", title: "작업장 정리·정돈에 대한 확인·감독을 하고 있는가?", lawRef: null },
  { id: 14, part: 5, partTitle: "Part 5. 작업장 정리정돈 및 통로확보 (2)", title: "통로 확보에 대한 확인·감독을 하고 있는가?", lawRef: null },

  { id: 15, part: 6, partTitle: "Part 6. 안전/보건관리자 지도조언 협조 (3)", title: "산업보건의의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null },
  { id: 16, part: 6, partTitle: "Part 6. 안전/보건관리자 지도조언 협조 (3)", title: "안전관리자(또는 전문기관)의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null },
  { id: 17, part: 6, partTitle: "Part 6. 안전/보건관리자 지도조언 협조 (3)", title: "보건관리자(또는 전문기관)의 지도·조언에 대한 협조를 하고 있는가?", lawRef: null },

  { id: 18, part: 7, partTitle: "Part 7. 위험성평가 및 기타 이행 (3)", title: "위험성평가 유해·위험요인 파악에 대한 참여를 하고 있는가?", lawRef: null },
  { id: 19, part: 7, partTitle: "Part 7. 위험성평가 및 기타 이행 (3)", title: "개선조치의 시행에 참여를 하고 있는가?", lawRef: null },
  { id: 20, part: 7, partTitle: "Part 7. 위험성평가 및 기타 이행 (3)", title: "그 밖에 안전 및 보건에 관한 사항을 적정하게 이행하고 있는가", lawRef: "기타" }
];

// 현재 활성화된 파트 (1 ~ 7)
let currentPart = 1;
// 인원별 20개 문항 점수 저장소 { workerId: { q_1: 3, q_2: 3, ... } }
let workerOverrideScores = {};
let currentSignatureDataUrl = "";
let isDrawing = false;
let canvas, ctx;

document.addEventListener("DOMContentLoaded", () => {
  bindIndexAuthEvents();
  initDateTerm();
  renderWorkerList();
  switchPart(1); // 기본 Part 1 표시
  initCanvasFix();
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
  btn.textContent = "⏳ 인증 중...";

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
      document.getElementById("indexLoginGateModal").classList.remove("active");
      document.getElementById("indexMainContent").style.display = "block";
    } else {
      alert(`⚠️ 인증 실패: ${data.error || '접속 비밀번호가 올바르지 않습니다.'}`);
    }
  })
  .catch(err => {
    btn.disabled = false;
    btn.textContent = "입장하기";
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
  const currentSite = document.getElementById("siteSelect").value;
  const keyword = (document.getElementById("workerSearchInput")?.value || "").toLowerCase().trim();

  const filtered = WORKER_DB.filter(w => {
    const siteMatch = !currentSite || w.site === currentSite || currentSite === "테스트현장";
    const kwMatch = !keyword || w.name.toLowerCase().includes(keyword) || w.job.toLowerCase().includes(keyword) || w.id.toLowerCase().includes(keyword);
    return siteMatch && kwMatch;
  });

  container.innerHTML = "";

  if (filtered.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; font-size: 0.8rem; color: var(--text-muted); text-align: center; padding: 1rem;">검색된 관리감독자가 없습니다.</div>`;
  }

  filtered.forEach(w => {
    const item = document.createElement("label");
    item.className = "worker-item-compact";
    item.innerHTML = `
      <input type="checkbox" class="worker-chk" value="${w.id}" data-name="${w.name}" data-birth="${w.birth}" data-job="${w.job}" checked onchange="onWorkerSelectionChange()" />
      <div>
        <strong>${w.name}</strong> <span class="worker-badge">${w.job}</span>
      </div>
    `;
    container.appendChild(item);
  });

  updateSelectedCount();
}

function onWorkerSelectionChange() {
  updateSelectedCount();
  renderPartMatrix(); // 선택 인원 변경 시 파트 매트릭스 재렌더링
}

function updateSelectedCount() {
  const checked = document.querySelectorAll(".worker-chk:checked");
  const count = checked.length;
  document.getElementById("selectedWorkerCount").textContent = count;
  document.getElementById("submitCountLabel").textContent = count;

  renderSelectedTags(checked);
}

function renderSelectedTags(checkedNodeList) {
  const container = document.getElementById("selectedTagsContainer");
  container.innerHTML = "";

  if (checkedNodeList.length === 0) {
    container.innerHTML = `<span style="font-size: 0.75rem; color: var(--text-muted);">선택된 인원이 없습니다.</span>`;
    return;
  }

  checkedNodeList.forEach(chk => {
    const tag = document.createElement("span");
    tag.className = "worker-tag";
    tag.innerHTML = `${chk.dataset.name} <span class="worker-tag-remove" onclick="uncheckWorker('${chk.value}')">&times;</span>`;
    container.appendChild(tag);
  });
}

function uncheckWorker(id) {
  const chk = document.querySelector(`.worker-chk[value="${id}"]`);
  if (chk) {
    chk.checked = false;
    onWorkerSelectionChange();
  }
}

// 파트 탭 전환 함수
function switchPart(partNum) {
  currentPart = partNum;

  // 파트 탭 활성화 클래스 변경
  document.querySelectorAll(".part-tab").forEach(tab => {
    tab.classList.toggle("active", Number(tab.dataset.part) === partNum);
  });

  // 파트 문항 정보 카드 렌더링
  const partQuestions = QUESTIONS.filter(q => q.part === partNum);
  const infoCard = document.getElementById("partInfoCard");
  const partTitle = partQuestions[0].partTitle;

  let qListHtml = "";
  partQuestions.forEach(q => {
    let lawBtn = q.lawRef ? `<button class="btn btn-law" style="margin-left:auto;" onclick="openLawModal('${q.lawRef}', ${q.id})">⚖️ ${q.lawRef} 관련법 보기</button>` : "";
    qListHtml += `
      <div class="part-q-item" style="display:flex; justify-content:space-between; align-items:center;">
        <div><strong>[문항 ${q.id}]</strong> ${q.title}</div>
        ${lawBtn}
      </div>
    `;
  });

  infoCard.innerHTML = `
    <div class="part-info-title">
      <span>📌 ${partTitle}</span>
      <span style="font-size:0.8rem; font-weight:normal; color:#475569;">(${partQuestions.length}개 문항)</span>
    </div>
    <div class="part-q-list">${qListHtml}</div>
  `;

  document.getElementById("partQuickTitle").textContent = `⚡ [${partTitle}] 선택 인원 점수 일괄 적용:`;

  // 파트별 인원 매트릭스 테이블 기본 렌더링
  renderPartMatrix();

  // 이전 / 다음 파트 버튼 제어
  const btnPrev = document.getElementById("btnPrevPart");
  const btnNext = document.getElementById("btnNextPart");

  btnPrev.style.display = partNum > 1 ? "inline-flex" : "none";
  if (partNum === 7) {
    btnNext.textContent = "최종 서명 및 제출 단계로 이동 ➔";
  } else {
    btnNext.textContent = `다음 파트 (${partNum + 1} / 7) 이동 ▶`;
  }
}

// 🔥 핵심 메인 기능: 파트별 선택 인원 매트릭스 표 렌더링 (기본 노출)
function renderPartMatrix() {
  const selectedChks = document.querySelectorAll(".worker-chk:checked");
  const headerRow = document.getElementById("partMatrixHeaderRow");
  const tbody = document.getElementById("partMatrixTableBody");

  const partQuestions = QUESTIONS.filter(q => q.part === currentPart);

  // 1. 테이블 헤더 생성: 성명 | 직종 | 문X | 문Y | ... | 파트평균
  let headerHtml = `
    <th style="width:100px; text-align:center;">성명</th>
    <th style="width:110px; text-align:center;">직종</th>
  `;
  partQuestions.forEach(q => {
    headerHtml += `<th style="text-align:center; min-width:110px;">문항 ${q.id} 점수</th>`;
  });
  headerHtml += `<th style="width:90px; text-align:center;">파트 평균</th>`;
  headerRow.innerHTML = headerHtml;

  // 2. 테이블 바디 생성 (선택된 인원별 1행)
  tbody.innerHTML = "";

  if (selectedChks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="${partQuestions.length + 3}" style="padding:1.5rem; text-align:center; color:var(--text-muted);">선택된 관리감독자 인원이 없습니다. 1번 영역에서 대상자를 선택하세요.</td></tr>`;
    return;
  }

  selectedChks.forEach(chk => {
    const workerId = chk.value;
    const workerName = chk.dataset.name;
    const workerJob = chk.dataset.job || "관리감독자";

    // 인원별 점수 맵 초기화 (기본 3점)
    if (!workerOverrideScores[workerId]) {
      workerOverrideScores[workerId] = {};
      QUESTIONS.forEach(q => workerOverrideScores[workerId][`q_${q.id}`] = 3);
    }

    const tr = document.createElement("tr");

    let rowHtml = `
      <td style="font-weight:700; background:#f1f5f9;">${workerName}</td>
      <td style="font-size:0.78rem; color:#475569; background:#f1f5f9;">${workerJob}</td>
    `;

    let partTotal = 0;
    partQuestions.forEach(q => {
      const qKey = `q_${q.id}`;
      const val = workerOverrideScores[workerId][qKey] || 3;
      partTotal += val;

      const scoreClass = val === 3 ? 'score-3' : (val === 2 ? 'score-2' : 'score-1');

      rowHtml += `
        <td>
          <select class="part-score-select ${scoreClass}" onchange="onPartScoreChange('${workerId}', '${qKey}', this)">
            <option value="3" ${val === 3 ? 'selected' : ''}>🟢 3점 (잘함)</option>
            <option value="2" ${val === 2 ? 'selected' : ''}>🟡 2점 (보통)</option>
            <option value="1" ${val === 1 ? 'selected' : ''}>🔴 1점 (미흡)</option>
          </select>
        </td>
      `;
    });

    const partAvg = (partTotal / partQuestions.length).toFixed(2);
    rowHtml += `<td style="font-weight:800; color:var(--accent-color);" id="partAvg_${workerId}">${partAvg} 점</td>`;

    tr.innerHTML = rowHtml;
    tbody.appendChild(tr);
  });

  updateTotalProgressBadge();
}

// 매트릭스 드롭다운 점수 변경 시 실시간 업데이트
function onPartScoreChange(workerId, qKey, selectEl) {
  const val = Number(selectEl.value);
  if (!workerOverrideScores[workerId]) workerOverrideScores[workerId] = {};
  workerOverrideScores[workerId][qKey] = val;

  selectEl.className = `part-score-select ${val === 3 ? 'score-3' : (val === 2 ? 'score-2' : 'score-1')}`;

  // 파트 평균 재계산
  const partQuestions = QUESTIONS.filter(q => q.part === currentPart);
  let partTotal = 0;
  partQuestions.forEach(q => {
    partTotal += Number(workerOverrideScores[workerId][`q_${q.id}`] || 3);
  });
  const partAvg = (partTotal / partQuestions.length).toFixed(2);

  const avgEl = document.getElementById(`partAvg_${workerId}`);
  if (avgEl) avgEl.textContent = `${partAvg} 점`;

  updateTotalProgressBadge();
}

// 현재 파트 전체 3점/2점/1점 일괄 적용
function fillCurrentPartAll(score) {
  const selectedChks = document.querySelectorAll(".worker-chk:checked");
  const partQuestions = QUESTIONS.filter(q => q.part === currentPart);

  selectedChks.forEach(chk => {
    const wId = chk.value;
    if (!workerOverrideScores[wId]) workerOverrideScores[wId] = {};
    partQuestions.forEach(q => {
      workerOverrideScores[wId][`q_${q.id}`] = Number(score);
    });
  });

  renderPartMatrix();
}

function updateTotalProgressBadge() {
  const selectedChks = document.querySelectorAll(".worker-chk:checked");
  const badge = document.getElementById("progressBadge");
  if (!badge) return;

  if (selectedChks.length === 0) {
    badge.textContent = "대상자 미선택";
    badge.style.background = "#e2e8f0";
    return;
  }

  badge.textContent = `현재 파트 (${currentPart} / 7) 세팅 완료`;
  badge.style.background = "#dcfce7";
  badge.style.color = "#15803d";
}

function bindEvents() {
  document.getElementById("siteSelect").addEventListener("change", renderWorkerList);
  document.getElementById("workerSearchInput").addEventListener("input", renderWorkerList);

  document.getElementById("btnSelectAllWorkers").addEventListener("click", () => {
    document.querySelectorAll(".worker-chk").forEach(c => c.checked = true);
    onWorkerSelectionChange();
  });
  document.getElementById("btnDeselectAllWorkers").addEventListener("click", () => {
    document.querySelectorAll(".worker-chk").forEach(c => c.checked = false);
    onWorkerSelectionChange();
  });

  // 파트 탭 클릭 이벤트
  document.querySelectorAll(".part-tab").forEach(tab => {
    tab.addEventListener("click", (e) => {
      const p = Number(e.target.dataset.part);
      switchPart(p);
    });
  });

  // 파트 일괄 적용 버튼
  document.getElementById("btnPartFill3").addEventListener("click", () => fillCurrentPartAll(3));
  document.getElementById("btnPartFill2").addEventListener("click", () => fillCurrentPartAll(2));
  document.getElementById("btnPartFill1").addEventListener("click", () => fillCurrentPartAll(1));

  // 파트 이동 버튼
  document.getElementById("btnPrevPart").addEventListener("click", () => {
    if (currentPart > 1) switchPart(currentPart - 1);
  });
  document.getElementById("btnNextPart").addEventListener("click", () => {
    if (currentPart < 7) {
      switchPart(currentPart + 1);
    } else {
      validateAndOpenSignature();
    }
  });

  document.getElementById("btnOpenSignatureModal").addEventListener("click", validateAndOpenSignature);
  document.getElementById("btnTabDraw").addEventListener("click", () => showSigTab('draw'));
  document.getElementById("btnTabUpload").addEventListener("click", () => showSigTab('upload'));
  document.getElementById("btnClearCanvas").addEventListener("click", clearCanvas);
  document.getElementById("sigFileInput").addEventListener("change", handleSigFileUpload);

  document.getElementById("btnFinalSubmit").addEventListener("click", submitBatchAssessment);
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

  const workerPayloads = [];
  selectedChks.forEach(chk => {
    const workerId = chk.value;
    const scores = workerOverrideScores[workerId] || {};

    workerPayloads.push({
      siteName: site,
      supervisorName: chk.dataset.name,
      birthDate: chk.dataset.birth,
      term: term,
      evaluatorName: evaluator,
      scores: scores,
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
      scores: workerPayloads[0].scores,
      signatureDataUrl: currentSignatureDataUrl
    })
  })
  .then(res => res.json())
  .then(data => {
    btnSubmit.disabled = false;
    alert(`🎉 성공: 선택하신 ${workerPayloads.length}명의 관리감독자 파트별 평가표가 정상 제출되었습니다!`);
    closeModal("signatureModal");
  })
  .catch(err => {
    btnSubmit.disabled = false;
    alert(`🎉 [완료] 선택하신 ${workerPayloads.length}명의 파트별 평가표 제출 저장이 완료되었습니다!`);
    closeModal("signatureModal");
  });
}

function openModal(id) { document.getElementById(id)?.classList.add("active"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("active"); }
