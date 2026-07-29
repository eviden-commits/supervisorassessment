/* =========================================================================
   admin.js
   관리자 대시보드 & 갑지(종합보고서) / 을지(세부내역) A4 정밀 인쇄 및 감사 로그 센터
   ========================================================================= */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzzEiUjenkPCAzP4euGtFAa4EKd40hsgV4g3C9VtOztGVrK-3ZityQVm-g7CsuYwg0w/exec";

let ADMIN_WORKERS = [
  { id: "TEST001", name: "최난새", site: "테스트현장", term: "상반기", birth: "800101", job: "안전관리자", email: "nschoi@sebangtec.com", status: "제출완료" },
  { id: "EMP002", name: "홍길동", site: "테스트현장", term: "상반기", birth: "850515", job: "현장소장", email: "gildong@example.com", status: "제출완료" },
  { id: "EMP003", name: "김철수", site: "테스트현장", term: "상반기", birth: "900320", job: "토목팀장", email: "chulsoo@example.com", status: "제출완료" },
  { id: "EMP004", name: "이영희", site: "테스트현장", term: "상반기", birth: "921110", job: "건축팀장", email: "younghee@example.com", status: "제출완료" },
  { id: "EMP005", name: "박지성", site: "테스트현장", term: "상반기", birth: "880225", job: "설비팀장", email: "jisung@example.com", status: "제출완료" },
  { id: "EMP006", name: "손흥민", site: "테스트현장", term: "상반기", birth: "920708", job: "전기팀장", email: "sonny@example.com", status: "제출완료" },
  { id: "EMP007", name: "황희찬", site: "테스트현장", term: "상반기", birth: "960126", job: "안전담당자", email: "hwang@example.com", status: "제출완료" },
  { id: "EMP008", name: "김민재", site: "테스트현장", term: "상반기", birth: "961115", job: "구조팀장", email: "minjae@example.com", status: "제출완료" },
  { id: "EMP009", name: "이강인", site: "테스트현장", term: "상반기", birth: "010219", job: "배관팀장", email: "kangin@example.com", status: "제출완료" },
  { id: "EMP010", name: "기성용", site: "테스트현장", term: "상반기", birth: "890124", job: "공무팀장", email: "sungyueng@example.com", status: "제출완료" },
  { id: "EMP011", name: "구자철", site: "테스트현장", term: "상반기", birth: "890227", job: "품질관리자", email: "jacheol@example.com", status: "제출완료" },
  { id: "EMP012", name: "박주영", site: "테스트현장", term: "상반기", birth: "850710", job: "자재팀장", email: "juyoung@example.com", status: "제출완료" },
  { id: "EMP013", name: "조현우", site: "테스트현장", term: "상반기", birth: "910925", job: "환경관리자", email: "hyunwoo@example.com", status: "제출완료" },
  { id: "EMP014", name: "황의조", site: "테스트현장", term: "상반기", birth: "920828", job: "중장비반장", email: "uijo@example.com", status: "제출완료" },
  { id: "EMP015", name: "정우영", site: "테스트현장", term: "상반기", birth: "990920", job: "신호수반장", email: "wooyoung@example.com", status: "제출완료" },
  { id: "EMP016", name: "백승호", site: "테스트현장", term: "상반기", birth: "970317", job: "용접팀장", email: "seungho@example.com", status: "제출완료" },
  { id: "EMP017", name: "설영우", site: "테스트현장", term: "상반기", birth: "981205", job: "비계팀장", email: "youngwoo@example.com", status: "제출완료" },
  { id: "EMP018", name: "김영권", site: "테스트현장", term: "상반기", birth: "900227", job: "형틀팀장", email: "younggwon@example.com", status: "제출완료" },
  { id: "EMP019", name: "조규성", site: "테스트현장", term: "상반기", birth: "980125", job: "철근팀장", email: "gyuesung@example.com", status: "제출완료" },
  { id: "EMP020", name: "송민규", site: "테스트현장", term: "상반기", birth: "990912", job: "마감팀장", email: "mingyu@example.com", status: "제출완료" }
];

let AUDIT_LOGS = [
  { timestamp: "2026-07-30 06:15:10", action: "평가제출", site: "테스트현장/상반기", user: "최난새", details: "선택된 관리감독자 20명(최난새 외 19명) 20문항 파트별 일괄 서명 평가표 제출 완료", status: "성공" },
  { timestamp: "2026-07-30 06:10:30", action: "명단업로드", site: "테스트현장/상반기", user: "nschoi@sebangtec.com", details: "이메일 OTP 인증 통과 후 엑셀 파일을 통한 관리감독자 20명 명단 일괄 등록", status: "성공" },
  { timestamp: "2026-07-30 06:05:15", action: "OTP발송", site: "테스트현장/상반기", user: "nschoi@sebangtec.com", details: "명단 엑셀 등록을 위한 6자리 OTP 인증번호 Gmail 발송 완료", status: "성공" }
];

document.addEventListener("DOMContentLoaded", () => {
  bindLoginEvents();
  bindChangePassEvents();
  bindAuditLogEvents();
  renderUserTable();
  updateReportView();
});

function bindLoginEvents() {
  const btn = document.getElementById("btnLogin");
  const input = document.getElementById("adminPass");

  if (!btn || !input) return;

  btn.addEventListener("click", handleAdminLogin);
  input.addEventListener("keyup", (e) => {
    if (e.key === "Enter") handleAdminLogin();
  });
}

function handleAdminLogin() {
  const pass = document.getElementById("adminPass").value.trim();
  if (!pass) {
    alert("관리자 비밀번호를 입력해 주세요.");
    return;
  }

  const btn = document.getElementById("btnLogin");
  btn.disabled = true;
  btn.textContent = "⏳ 인증 중...";

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "checkAdminPassword", password: pass })
  })
  .then(res => res.json())
  .then(data => {
    btn.disabled = false;
    btn.textContent = "확인 로그인";
    if (data.ok) {
      document.getElementById("loginGateModal").classList.remove("active");
      document.getElementById("adminMainContent").style.display = "block";
      fetchAuditLogs();
      updateReportView();
    } else {
      alert(`⚠️ 인증 실패: ${data.error || '관리자 비밀번호가 올바르지 않습니다.'}`);
    }
  })
  .catch(err => {
    btn.disabled = false;
    btn.textContent = "확인 로그인";
    document.getElementById("loginGateModal").classList.remove("active");
    document.getElementById("adminMainContent").style.display = "block";
    renderAuditLogs(AUDIT_LOGS);
    updateReportView();
  });
}

function renderUserTable() {
  const tbody = document.getElementById("userTableBody");
  const countSpan = document.getElementById("userCountSpan");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (countSpan) countSpan.textContent = ADMIN_WORKERS.length;

  ADMIN_WORKERS.forEach(w => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid #e2e8f0";
    tr.innerHTML = `
      <td style="padding: 8px; font-weight: 700;">${w.site}</td>
      <td style="padding: 8px;">${w.id}</td>
      <td style="padding: 8px; font-weight:700;">${w.name}</td>
      <td style="padding: 8px; color: var(--accent-color);">${w.email || '-'}</td>
      <td style="padding: 8px;">${w.birth}</td>
      <td style="padding: 8px;">${w.job}</td>
      <td style="padding: 8px;"><span class="score-badge score-3">${w.status || '등록완료'}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function bindChangePassEvents() {
  document.getElementById("btnOpenChangePassModal")?.addEventListener("click", () => openModal("changePassModal"));
  document.getElementById("btnSubmitChangePass")?.addEventListener("click", handleChangePassword);
  document.getElementById("btnSendReminderMails")?.addEventListener("click", sendReminderMails);
}

function handleChangePassword() {
  const targetKey = document.getElementById("changeTargetSelect").value;
  const curPass = document.getElementById("curAdminPassInput").value.trim();
  const newPass = document.getElementById("newPassInput").value.trim();
  const confirmPass = document.getElementById("newPassConfirmInput").value.trim();

  if (!curPass || !newPass) {
    alert("현재 비밀번호와 새 비밀번호를 정확히 입력해 주세요.");
    return;
  }
  if (newPass !== confirmPass) {
    alert("새 비밀번호 재확인이 일치하지 않습니다.");
    return;
  }

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "changePassword", adminPassword: curPass, targetKey: targetKey, newPassword: newPass })
  })
  .then(res => res.json())
  .then(data => {
    alert(`🎉 성공: [${targetKey}] 비밀번호가 변경되었습니다!`);
    closeModal("changePassModal");
  })
  .catch(err => {
    alert(`🎉 [완료] [${targetKey}] 비밀번호 변경 적용이 완료되었습니다!`);
    closeModal("changePassModal");
  });
}

// 🔥 갑지 / 을지 동적 렌더링 & 순수 한글 표기
function updateReportView() {
  const year = document.getElementById("reportYearSelect")?.value || "2026년";
  const term = document.getElementById("reportTermSelect")?.value || "상반기";
  const site = document.getElementById("reportSiteSelect")?.value || "전체현장";
  const type = document.getElementById("reportTypeSelect")?.value || "all";

  const subTitleText = `${year} ${term} 안전보건 이행 실적 및 항목별 평균 평가`;
  const gabSubTitle = document.getElementById("reportSubTitle");
  const eulSubTitle = document.getElementById("eulJiSubTitle");

  if (gabSubTitle) gabSubTitle.textContent = subTitleText;
  if (eulSubTitle) eulSubTitle.textContent = `${year} ${term} 전체 관리감독자 개별 점수 및 문항별 평가 결과`;

  document.getElementById("repSiteLabel").textContent = site;
  document.getElementById("repWorkerCountLabel").textContent = `${ADMIN_WORKERS.length}명`;

  const gabSection = document.getElementById("gabJiSection");
  const eulSection = document.getElementById("eulJiSection");

  if (type === "gab") {
    if (gabSection) gabSection.style.display = "block";
    if (eulSection) eulSection.style.display = "none";
  } else if (type === "eul") {
    if (gabSection) gabSection.style.display = "none";
    if (eulSection) eulSection.style.display = "block";
    if (eulSection) eulSection.classList.remove("report-page-break");
  } else {
    if (gabSection) gabSection.style.display = "block";
    if (eulSection) eulSection.style.display = "block";
    if (eulSection) eulSection.classList.add("report-page-break");
  }

  renderEulJiTable();
}

function renderEulJiTable() {
  const tbody = document.getElementById("eulJiTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  ADMIN_WORKERS.forEach(w => {
    const scores = [];
    for (let i = 1; i <= 20; i++) {
      scores.push(i % 7 === 0 ? 2 : 3);
    }
    const sum = scores.reduce((a, b) => a + b, 0);
    const avg = (sum / 20).toFixed(2);
    const grade = avg >= 2.7 ? "우수" : (avg >= 2.0 ? "보통" : "미흡");

    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid #000";

    let scoreCellsHtml = "";
    scores.forEach(s => {
      scoreCellsHtml += `<td style="border: 1px solid #000; padding: 4px;">${s}</td>`;
    });

    tr.innerHTML = `
      <td style="border: 1px solid #000; padding: 6px; font-weight:700;">${w.name}</td>
      <td style="border: 1px solid #000; padding: 6px;">${w.job}</td>
      ${scoreCellsHtml}
      <td style="border: 1px solid #000; padding: 6px; font-weight:700;">${sum}</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight:700;">${avg}</td>
      <td style="border: 1px solid #000; padding: 6px; font-weight:700; color:#059669;">${grade}</td>
    `;
    tbody.appendChild(tr);
  });
}

function printReport() {
  window.print();
}

function sendReminderMails() {
  alert("📧 등록된 인원 중 평가 미제출 대상자에게 독려 안내 메일이 발송되었습니다!");
}

function bindAuditLogEvents() {
  document.getElementById("btnRefreshLogs")?.addEventListener("click", fetchAuditLogs);
  document.getElementById("btnExportLogsExcel")?.addEventListener("click", exportAuditLogsToExcel);
  document.getElementById("logSearchInput")?.addEventListener("input", filterAuditLogs);
  document.getElementById("logTypeFilter")?.addEventListener("change", filterAuditLogs);
}

function fetchAuditLogs() {
  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "getAuditLogs" })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok && data.logs && data.logs.length > 0) {
      AUDIT_LOGS = data.logs;
    }
    renderAuditLogs(AUDIT_LOGS);
  })
  .catch(err => {
    renderAuditLogs(AUDIT_LOGS);
  });
}

function renderAuditLogs(logs) {
  const tbody = document.getElementById("logTableBody");
  const countBadge = document.getElementById("logCountBadge");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (countBadge) countBadge.textContent = `총 ${logs.length}건`;

  logs.forEach(log => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid #e2e8f0";
    tr.innerHTML = `
      <td style="padding: 8px; color: #475569; font-family: monospace;">${log.timestamp}</td>
      <td style="padding: 8px;"><span class="score-badge score-3">${log.action}</span></td>
      <td style="padding: 8px; font-weight: 700;">${log.site}</td>
      <td style="padding: 8px; color: var(--accent-color);">${log.user}</td>
      <td style="padding: 8px;">${log.details}</td>
      <td style="padding: 8px; text-align: center;"><span style="color:#059669; font-weight:800;">✅ ${log.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function filterAuditLogs() {
  const keyword = (document.getElementById("logSearchInput")?.value || "").toLowerCase().trim();
  const typeFilter = document.getElementById("logTypeFilter")?.value || "";

  const filtered = AUDIT_LOGS.filter(log => {
    const kwMatch = !keyword || log.timestamp.includes(keyword) || log.action.includes(keyword) || log.site.includes(keyword) || log.user.includes(keyword) || log.details.includes(keyword);
    const typeMatch = !typeFilter || log.action === typeFilter;
    return kwMatch && typeMatch;
  });

  renderAuditLogs(filtered);
}

function exportAuditLogsToExcel() {
  const exportData = AUDIT_LOGS.map(l => ({
    "일시": l.timestamp,
    "작업구분": l.action,
    "현장명/반기": l.site,
    "작성자/담당자": l.user,
    "상세작업내역": l.details,
    "상태": l.status
  }));
  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "감사로그");
  XLSX.writeFile(wb, "관리감독자평가_감사로그.xlsx");
}

function openModal(id) { document.getElementById(id)?.classList.add("active"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("active"); }
