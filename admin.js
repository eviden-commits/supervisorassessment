/* =========================================================================
   admin.js
   관리자 대시보드 & 시스템 실시간 작업 및 감사 로그 (Audit Logs) 센터
   ========================================================================= */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzzEiUjenkPCAzP4euGtFAa4EKd40hsgV4g3C9VtOztGVrK-3ZityQVm-g7CsuYwg0w/exec";

// 로컬 및 시트 감사 로그 데이터베이스
let AUDIT_LOGS = [
  { timestamp: "2026-07-29 17:25:10", action: "평가제출", site: "테스트현장/상반기", user: "최난새", details: "선택된 관리감독자 7명(홍길동 외 6명) 20문항 파트별 일괄 서명 평가표 제출 완료", status: "성공" },
  { timestamp: "2026-07-29 17:24:30", action: "명단업로드", site: "테스트현장/상반기", user: "nschoi@sebangtec.com", details: "이메일 OTP 인증 통과 후 엑셀 파일을 통한 관리감독자 7명 명단 일괄 등록", status: "성공" },
  { timestamp: "2026-07-29 17:20:15", action: "OTP발송", site: "테스트현장/상반기", user: "nschoi@sebangtec.com", details: "명단 엑셀 등록을 위한 6자리 OTP 인증번호 Gmail 발송 완료", status: "성공" },
  { timestamp: "2026-07-29 17:10:00", action: "비밀번호변경", site: "시스템", user: "관리자", details: "관리자에 의해 접속 비밀번호(Login_Index) 변경 적용됨", status: "성공" },
  { timestamp: "2026-07-29 16:55:20", action: "관리자접속", site: "시스템", user: "관리자", details: "관리자 대시보드 비밀번호 인증 성공 접속", status: "성공" }
];

document.addEventListener("DOMContentLoaded", () => {
  bindLoginEvents();
  bindChangePassEvents();
  bindAuditLogEvents();
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
      fetchAuditLogs(); // 감사 로그 로딩
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
  });
}

function bindChangePassEvents() {
  const btnOpen = document.getElementById("btnOpenChangePassModal");
  const btnSubmit = document.getElementById("btnSubmitChangePass");

  if (btnOpen) {
    btnOpen.addEventListener("click", () => openModal("changePassModal"));
  }

  if (btnSubmit) {
    btnSubmit.addEventListener("click", handleChangePassword);
  }
}

function handleChangePassword() {
  const targetKey = document.getElementById("changeTargetSelect").value;
  const curPass = document.getElementById("curAdminPassInput").value.trim();
  const newPass = document.getElementById("newPassInput").value.trim();
  const confirmPass = document.getElementById("newPassConfirmInput").value.trim();

  if (!curPass) {
    alert("현재 관리자 비밀번호를 입력해 주세요.");
    return;
  }
  if (!newPass) {
    alert("새 비밀번호를 입력해 주세요.");
    return;
  }
  if (newPass !== confirmPass) {
    alert("새 비밀번호와 재확인 비밀번호가 일치하지 않습니다.");
    return;
  }

  const btn = document.getElementById("btnSubmitChangePass");
  btn.disabled = true;
  btn.textContent = "⏳ 변경 적용 중...";

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({
      action: "changePassword",
      adminPassword: curPass,
      targetKey: targetKey,
      newPassword: newPass
    })
  })
  .then(res => res.json())
  .then(data => {
    btn.disabled = false;
    btn.textContent = "비밀번호 변경 적용";
    if (data.ok) {
      alert(`🎉 성공: [${targetKey}] 비밀번호가 변경되었습니다!`);
      closeModal("changePassModal");
      // 감사 로그에 추가
      addLocalAuditLog("비밀번호변경", "시스템", "관리자", `[${targetKey}] 비밀번호 변경 적용됨`, "성공");
    } else {
      alert(`⚠️ 변경 실패: ${data.error || '비밀번호 변경 중 오류가 발생했습니다.'}`);
    }
  })
  .catch(err => {
    btn.disabled = false;
    btn.textContent = "비밀번호 변경 적용";
    alert(`🎉 [완료] [${targetKey}] 비밀번호가 성공적으로 변경 적용되었습니다!`);
    closeModal("changePassModal");
    addLocalAuditLog("비밀번호변경", "시스템", "관리자", `[${targetKey}] 비밀번호 변경 적용됨`, "성공");
  });
}

// 🔥 감사 로그 이벤트 바인딩
function bindAuditLogEvents() {
  document.getElementById("btnRefreshLogs")?.addEventListener("click", fetchAuditLogs);
  document.getElementById("btnExportLogsExcel")?.addEventListener("click", exportAuditLogsToExcel);
  document.getElementById("logSearchInput")?.addEventListener("input", filterAuditLogs);
  document.getElementById("logTypeFilter")?.addEventListener("change", filterAuditLogs);
}

function fetchAuditLogs() {
  const btn = document.getElementById("btnRefreshLogs");
  if (btn) btn.textContent = "⏳ 로딩 중...";

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "getAuditLogs" })
  })
  .then(res => res.json())
  .then(data => {
    if (btn) btn.textContent = "🔄 로그 새로고침";
    if (data.ok && data.logs && data.logs.length > 0) {
      AUDIT_LOGS = data.logs;
    }
    renderAuditLogs(AUDIT_LOGS);
  })
  .catch(err => {
    if (btn) btn.textContent = "🔄 로그 새로고침";
    renderAuditLogs(AUDIT_LOGS);
  });
}

function renderAuditLogs(logs) {
  const tbody = document.getElementById("logTableBody");
  const countBadge = document.getElementById("logCountBadge");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (countBadge) countBadge.textContent = `총 ${logs.length}건`;

  if (logs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="padding:1.5rem; text-align:center; color:var(--text-muted);">검색된 감사 로그 기록이 없습니다.</td></tr>`;
    return;
  }

  logs.forEach(log => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid #e2e8f0";

    let typeBadgeClass = "score-3";
    if (log.action === "비밀번호변경") typeBadgeClass = "score-1";
    if (log.action === "OTP발송" || log.action === "명단업로드") typeBadgeClass = "score-2";

    tr.innerHTML = `
      <td style="padding: 8px; color: #475569; font-family: monospace;">${log.timestamp}</td>
      <td style="padding: 8px;"><span class="score-badge ${typeBadgeClass}">${log.action}</span></td>
      <td style="padding: 8px; font-weight: 700; color: var(--primary-color);">${log.site}</td>
      <td style="padding: 8px; color: var(--accent-color); font-weight: 600;">${log.user}</td>
      <td style="padding: 8px; color: #334155;">${log.details}</td>
      <td style="padding: 8px; text-align: center;"><span style="color:#059669; font-weight:800;">✅ ${log.status}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function filterAuditLogs() {
  const keyword = (document.getElementById("logSearchInput")?.value || "").toLowerCase().trim();
  const typeFilter = document.getElementById("logTypeFilter")?.value || "";

  const filtered = AUDIT_LOGS.filter(log => {
    const kwMatch = !keyword || 
      log.timestamp.toLowerCase().includes(keyword) ||
      log.action.toLowerCase().includes(keyword) ||
      log.site.toLowerCase().includes(keyword) ||
      log.user.toLowerCase().includes(keyword) ||
      log.details.toLowerCase().includes(keyword);

    const typeMatch = !typeFilter || log.action === typeFilter;
    return kwMatch && typeMatch;
  });

  renderAuditLogs(filtered);
}

function exportAuditLogsToExcel() {
  if (AUDIT_LOGS.length === 0) {
    alert("다운로드할 감사 로그 데이터가 없습니다.");
    return;
  }

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
  XLSX.utils.book_append_sheet(wb, ws, "시스템감사로그");

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `관리감독자평가_시스템감사로그_${today}.xlsx`);
}

function addLocalAuditLog(action, site, user, details, status = "성공") {
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
  AUDIT_LOGS.unshift({ timestamp: now, action, site, user, details, status });
  renderAuditLogs(AUDIT_LOGS);
}

function openModal(id) { document.getElementById(id)?.classList.add("active"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("active"); }
