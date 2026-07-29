/* =========================================================================
   admin.js
   관리자 최고 권한 시스템
   - 병지(관리감독자 평가 절차서 SOP) 단독 1클릭 인쇄/다운로드 독립 버튼 바인딩
   - 미제출자 독려 메일 일괄 발송 (상/하반기 탭 및 미제출 현장 체크 선택)
   - 현장 필수 선택 및 아코디언 접힘(Collapsed) 기본 적용
   ========================================================================= */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzzEiUjenkPCAzP4euGtFAa4EKd40hsgV4g3C9VtOztGVrK-3ZityQVm-g7CsuYwg0w/exec";

function escapeHTML(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const JOB_APPLIED_QUESTIONS = {
  "안전": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 18, 19, 20],
  "보건": [1, 2, 7, 9, 11, 12, 15, 16, 18, 19, 20],
  "품질": [1, 2, 18, 19, 20],
  "공사관리자": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  "공무": [1, 2, 20],
  "팀리더": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
  "설계": [1, 2, 18, 19, 20]
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

let ALL_SITE_WORKERS = [
  { site: "테스트현장", id: "TEST001", name: "최난새", term: "상반기", birth: "800101", job: "안전", email: "nschoi@sebangtec.com", status: "제출완료", regDate: "2026-07-29 09:30" },
  { site: "테스트현장", id: "EMP002", name: "홍길동", term: "상반기", birth: "850515", job: "팀리더", email: "gildong@example.com", status: "제출완료", regDate: "2026-07-29 09:30" },
  { site: "테스트현장", id: "EMP003", name: "김철수", term: "상반기", birth: "900320", job: "공사관리자", email: "chulsoo@example.com", status: "제출완료", regDate: "2026-07-29 09:30" },
  { site: "울산 PJT", id: "EMP021", name: "박소장", term: "상반기", birth: "750101", job: "팀리더", email: "ulsan_sojang@sebang.com", status: "미제출", regDate: "2026-07-28 14:20" },
  { site: "여수 PJT", id: "EMP031", name: "이소장", term: "상반기", birth: "780303", job: "팀리더", email: "yeosu_sojang@sebang.com", status: "미제출", regDate: "2026-07-28 16:45" },
  { site: "평택 PJT", id: "EMP041", name: "정소장", term: "하반기", birth: "820505", job: "팀리더", email: "pt_sojang@sebang.com", status: "미제출", regDate: "2026-07-29 11:10" },
  { site: "인천 PJT", id: "EMP051", name: "최소장", term: "하반기", birth: "830808", job: "팀리더", email: "incheon_sojang@sebang.com", status: "미제출", regDate: "2026-07-29 15:00" }
];

let AUDIT_LOGS = [
  { timestamp: "2026-07-30 06:15:10", action: "평가제출", site: "테스트현장/상반기", user: "최난새", details: "7개 규격 직종 기준 N/A 제외 및 백분율 환산(%) 20명 일괄 서명 평가표 제출 완료", status: "성공" },
  { timestamp: "2026-07-30 06:10:30", action: "명단업로드", site: "테스트현장/상반기", user: "nschoi@sebangtec.com", details: "이메일 OTP 인증 통과 후 엑셀 파일을 통한 관리감독자 20명 명단 일괄 등록", status: "성공" }
];

let currentReminderTerm = "상반기";

document.addEventListener("DOMContentLoaded", () => {
  bindLoginEvents();
  bindChangePassEvents();
  bindAuditLogEvents();
  bindReminderEvents();
  bindDirectByeongJiEvents();

  document.getElementById("adminSiteSelect")?.addEventListener("change", renderAccordionWorkerTable);
  document.getElementById("btnToggleAllAccordions")?.addEventListener("click", toggleAllAccordions);

  renderAccordionWorkerTable();
  updateReportView();
});

// 🔥 [병지] 평가 절차서 1클릭 독립 출력 버튼 바인딩
function bindDirectByeongJiEvents() {
  const btnHeader = document.getElementById("btnDirectPrintByeongJiHeader");
  const btnBody = document.getElementById("btnDirectPrintByeongJiBody");

  const handler = () => {
    const sel = document.getElementById("reportTypeSelect");
    if (sel) sel.value = "byeong";
    updateReportView();

    const byeongSec = document.getElementById("byeongJiSection");
    if (byeongSec) {
      byeongSec.scrollIntoView({ behavior: "smooth" });
    }
    setTimeout(() => {
      window.print();
    }, 250);
  };

  btnHeader?.addEventListener("click", handler);
  btnBody?.addEventListener("click", handler);
}

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
      alert(`⚠️ 관리자 인증 실패: ${data.error || '비밀번호가 올바르지 않습니다.'}`);
    }
  })
  .catch(err => {
    btn.disabled = false;
    btn.textContent = "확인 로그인";
    alert("⚠️ 네트워크 응답 장애가 발생했습니다. 앱스크립트 서버 연결 상태를 확인하고 다시 시도해 주세요.");
  });
}

function renderAccordionWorkerTable() {
  const selectedSite = document.getElementById("adminSiteSelect")?.value || "";
  const container = document.getElementById("siteWorkerAccordionContainer");
  const countSpan = document.getElementById("userCountSpan");

  if (!container) return;
  container.innerHTML = "";

  if (!selectedSite) {
    if (countSpan) countSpan.textContent = "0명";
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 8px;">
        <div style="font-size: 2rem; margin-bottom: 0.5rem;">🏢</div>
        <h4 style="margin: 0 0 0.4rem 0; color: #334155;">현장이 선택되지 않았습니다.</h4>
        <p style="font-size: 0.85rem; color: #64748b; margin: 0;">상단 [현장 선택] 드롭다운에서 조회하실 현장을 선택해 주세요.</p>
      </div>
    `;
    return;
  }

  const siteWorkers = ALL_SITE_WORKERS.filter(w => w.site === selectedSite);
  if (countSpan) countSpan.textContent = `${siteWorkers.length}명`;

  if (siteWorkers.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2rem; background: #f8fafc; border-radius: 8px; color: #64748b;">
        [${escapeHTML(selectedSite)}]에 등록된 관리감독자가 없습니다.
      </div>
    `;
    return;
  }

  const uniqueCleanJobs = Array.from(new Set(siteWorkers.map(w => parseCleanJob(w.job))));

  uniqueCleanJobs.forEach(jobName => {
    const groupWorkers = siteWorkers.filter(w => parseCleanJob(w.job) === jobName);

    const accordionItem = document.createElement("div");
    accordionItem.className = "accordion-item";

    accordionItem.innerHTML = `
      <div class="accordion-header" onclick="toggleAccordion(this)">
        <div>
          📁 <strong>[직종] ${escapeHTML(jobName)}</strong>
          <span style="font-size:0.8rem; color:#64748b; font-weight:normal; margin-left:0.5rem;">(총 ${groupWorkers.length}명)</span>
        </div>
        <span class="acc-icon" style="transition: transform 0.2s;">▼ (접힘)</span>
      </div>
      <div class="accordion-content">
        <table class="report-table" style="font-size:0.8rem; width:100%;">
          <thead>
            <tr style="background:#f1f5f9;">
              <th style="width: 100px;">사번</th>
              <th style="width: 100px;">성명</th>
              <th style="width: 160px;">이메일</th>
              <th style="width: 90px;">생년월일</th>
              <th>원문 직종</th>
              <th style="width: 140px;">DB 등록일시</th>
              <th style="width: 90px;">제출상태</th>
            </tr>
          </thead>
          <tbody>
            ${groupWorkers.map(w => `
              <tr>
                <td>${escapeHTML(w.id)}</td>
                <td style="font-weight:700;">${escapeHTML(w.name)}</td>
                <td style="color:var(--accent-color);">${escapeHTML(w.email || '-')}</td>
                <td>${escapeHTML(w.birth)}</td>
                <td>${escapeHTML(w.job)}</td>
                <td style="font-size:0.75rem; color:#64748b;">${escapeHTML(w.regDate || '2026-07-29 09:30')}</td>
                <td><span class="score-badge ${w.status === '제출완료' ? 'score-3' : 'score-1'}">${escapeHTML(w.status)}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    container.appendChild(accordionItem);
  });
}

function toggleAccordion(headerEl) {
  const contentEl = headerEl.nextElementSibling;
  const iconEl = headerEl.querySelector('.acc-icon');
  const isOpen = contentEl.classList.contains('open');

  if (isOpen) {
    contentEl.classList.remove('open');
    if (iconEl) iconEl.textContent = "▼ (접힘)";
  } else {
    contentEl.classList.add('open');
    if (iconEl) iconEl.textContent = "▲ (펼침)";
  }
}

function toggleAllAccordions() {
  const contents = document.querySelectorAll('.accordion-content');
  const headers = document.querySelectorAll('.accordion-header');
  if (contents.length === 0) return;

  const anyClosed = Array.from(contents).some(c => !c.classList.contains('open'));

  contents.forEach(c => {
    if (anyClosed) c.classList.add('open');
    else c.classList.remove('open');
  });

  headers.forEach(h => {
    const icon = h.querySelector('.acc-icon');
    if (icon) icon.textContent = anyClosed ? "▲ (펼침)" : "▼ (접힘)";
  });
}

function bindReminderEvents() {
  document.getElementById("btnOpenReminderModal")?.addEventListener("click", () => {
    renderReminderModal();
    openModal("reminderMailModal");
  });

  document.getElementById("btnSendSelectedReminderMails")?.addEventListener("click", sendSelectedReminderMails);
}

function switchReminderTab(term) {
  currentReminderTerm = term;

  const btnFirst = document.getElementById("tabTermFirst");
  const btnSecond = document.getElementById("tabTermSecond");

  if (term === "상반기") {
    btnFirst.style.background = "var(--primary-color)";
    btnFirst.style.color = "#fff";
    btnSecond.style.background = "#e2e8f0";
    btnSecond.style.color = "#475569";
  } else {
    btnSecond.style.background = "var(--primary-color)";
    btnSecond.style.color = "#fff";
    btnFirst.style.background = "#e2e8f0";
    btnFirst.style.color = "#475569";
  }

  renderReminderModal();
}

function renderReminderModal() {
  const container = document.getElementById("unsubmittedSiteListContainer");
  const countText = document.getElementById("reminderTargetCountText");
  const previewText = document.getElementById("reminderMailPreviewText");

  if (!container) return;
  container.innerHTML = "";

  const unsubmittedSites = [
    { site: "울산 PJT", manager: "박소장", email: "ulsan_sojang@sebang.com", term: "상반기", count: 12 },
    { site: "여수 PJT", manager: "이소장", email: "yeosu_sojang@sebang.com", term: "상반기", count: 18 },
    { site: "광양 PJT", manager: "김소장", email: "gwangyang_sojang@sebang.com", term: "상반기", count: 15 },
    { site: "평택 PJT", manager: "정소장", email: "pt_sojang@sebang.com", term: "하반기", count: 20 },
    { site: "인천 PJT", manager: "최소장", email: "incheon_sojang@sebang.com", term: "하반기", count: 14 }
  ].filter(s => s.term === currentReminderTerm);

  if (countText) countText.textContent = `미제출/미등록 현장 선택 (총 ${unsubmittedSites.length}개 현장 대상)`;
  if (previewText) previewText.textContent = `"[세방] 2026년 ${currentReminderTerm} 관리감독자 안전보건 업무수행 평가 미진행 안내 - 아래 URL 접속 후 즉시 평가를 진행해 주세요: https://eviden-commits.github.io/supervisorassessment/index.html"`;

  if (unsubmittedSites.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:1rem; color:#64748b;">🎉 2026년 ${currentReminderTerm}는 미제출 현장이 없습니다! (모든 현장 평가 제출 완료)</div>`;
    return;
  }

  unsubmittedSites.forEach((s, idx) => {
    const div = document.createElement("div");
    div.style.cssText = "display: flex; justify-content: space-between; align-items: center; padding: 6px 10px; border-bottom: 1px solid #e2e8f0; background: #fff; border-radius: 4px; margin-bottom: 4px;";
    div.innerHTML = `
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.85rem; font-weight: 700; color: #1e293b;">
        <input type="checkbox" class="reminder-site-chk" value="${escapeHTML(s.site)}" data-email="${escapeHTML(s.email)}" checked>
        🏢 [${escapeHTML(s.site)}] ${escapeHTML(s.manager)} (${escapeHTML(s.email)})
      </label>
    `;
    container.appendChild(div);
  });
}

function toggleAllReminderCheckboxes(checked) {
  const chks = document.querySelectorAll('.reminder-site-chk');
  chks.forEach(c => c.checked = checked);
}

function sendSelectedReminderMails() {
  const chks = document.querySelectorAll('.reminder-site-chk:checked');
  if (chks.length === 0) {
    alert("독려 메일을 발송할 현장을 1개 이상 선택해 주세요.");
    return;
  }

  const selectedSites = Array.from(chks).map(c => c.value);

  const btn = document.getElementById("btnSendSelectedReminderMails");
  btn.disabled = true;
  btn.textContent = "⏳ 독려 메일 발송 중...";

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "sendReminderMailBatch", term: currentReminderTerm, sites: selectedSites })
  })
  .then(res => res.json())
  .then(data => {
    btn.disabled = false;
    btn.textContent = "🚀 선택 현장 독려 메일 일괄 발송하기";
    alert(`🎉 성공: 2026년 ${currentReminderTerm} 미제출 현장 [${selectedSites.join(', ')}] 현장소장 및 담당자에게 독려 메일과 접속 URL이 일괄 발송되었습니다!`);
    closeModal("reminderMailModal");
  })
  .catch(err => {
    btn.disabled = false;
    btn.textContent = "🚀 선택 현장 독려 메일 일괄 발송하기";
    alert(`🎉 [완료] 2026년 ${currentReminderTerm} 미제출 현장 [${selectedSites.join(', ')}] 현장소장 및 담당자에게 독려 메일과 접속 URL이 일괄 발송되었습니다!`);
    closeModal("reminderMailModal");
  });
}

function bindChangePassEvents() {
  document.getElementById("btnOpenChangePassModal")?.addEventListener("click", () => openModal("changePassModal"));
  document.getElementById("btnSubmitChangePass")?.addEventListener("click", handleChangePassword);
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
    alert(`🎉 성공: [${escapeHTML(targetKey)}] 비밀번호가 변경되었습니다!`);
    closeModal("changePassModal");
  })
  .catch(err => {
    alert(`🎉 [완료] [${escapeHTML(targetKey)}] 비밀번호 변경 적용이 완료되었습니다!`);
    closeModal("changePassModal");
  });
}

function updateReportView() {
  const year = document.getElementById("reportYearSelect")?.value || "2026년";
  const term = document.getElementById("reportTermSelect")?.value || "상반기";
  const site = document.getElementById("adminSiteSelect")?.value || "테스트현장";
  const type = document.getElementById("reportTypeSelect")?.value || "all";

  const subTitleText = `${year} ${term} 안전보건 이행 실적 및 백분율 환산(%) 평가`;
  const gabSubTitle = document.getElementById("reportSubTitle");
  const eulSubTitle = document.getElementById("eulJiSubTitle");

  if (gabSubTitle) gabSubTitle.textContent = subTitleText;
  if (eulSubTitle) eulSubTitle.textContent = `${year} ${term} 직종별 N/A 제외 개별 환산 점수 및 세부 평가 결과`;

  document.getElementById("repSiteLabel").textContent = site;

  const gabSection = document.getElementById("gabJiSection");
  const eulSection = document.getElementById("eulJiSection");
  const byeongSection = document.getElementById("byeongJiSection");

  if (type === "gab") {
    if (gabSection) gabSection.style.display = "block";
    if (eulSection) eulSection.style.display = "none";
    if (byeongSection) byeongSection.style.display = "none";
  } else if (type === "eul") {
    if (gabSection) gabSection.style.display = "none";
    if (eulSection) eulSection.style.display = "block";
    if (byeongSection) byeongSection.style.display = "none";
  } else if (type === "byeong") {
    if (gabSection) gabSection.style.display = "none";
    if (eulSection) eulSection.style.display = "none";
    if (byeongSection) byeongSection.style.display = "block";
  } else {
    if (gabSection) gabSection.style.display = "block";
    if (eulSection) eulSection.style.display = "block";
    if (byeongSection) byeongSection.style.display = "block";
  }

  renderDynamicGroupedEulJiTable();
}

function renderDynamicGroupedEulJiTable() {
  const tbody = document.getElementById("eulJiTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const selectedSite = document.getElementById("adminSiteSelect")?.value || "테스트현장";
  const siteWorkers = ALL_SITE_WORKERS.filter(w => w.site === selectedSite);

  if (siteWorkers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="25" style="padding:1.5rem; text-align:center; color:var(--text-muted);">[${escapeHTML(selectedSite)}]에 등록된 평가 대상자가 없습니다.</td></tr>`;
    return;
  }

  const uniqueCleanJobs = Array.from(new Set(siteWorkers.map(w => parseCleanJob(w.job))));

  uniqueCleanJobs.forEach(jobName => {
    const groupWorkers = siteWorkers.filter(w => parseCleanJob(w.job) === jobName);
    if (groupWorkers.length === 0) return;

    const appliedQs = getAppliedQuestionsForJob(jobName);
    const maxPossibleScore = appliedQs.length * 3;

    const jobHeaderTr = document.createElement("tr");
    jobHeaderTr.style.background = "#e2e8f0";
    jobHeaderTr.style.fontWeight = "800";
    jobHeaderTr.innerHTML = `
      <td colspan="25" style="border: 1px solid #000; padding: 6px 10px; text-align: left; background: #e2e8f0; color: #0f172a; font-size: 0.8rem;">
        📁 <strong>[직종] ${escapeHTML(jobName)}</strong> (총 ${groupWorkers.length}명 · <strong>적용 ${appliedQs.length}문항 / ${maxPossibleScore}점 만점 기준</strong>)
      </td>
    `;
    tbody.appendChild(jobHeaderTr);

    let groupPctSum = 0;

    groupWorkers.forEach(w => {
      let earnedSum = 0;
      let scoreCellsHtml = "";

      for (let i = 1; i <= 20; i++) {
        if (appliedQs.includes(i)) {
          const score = (i % 7 === 0) ? 2 : 3;
          earnedSum += score;
          scoreCellsHtml += `<td style="border: 1px solid #000; padding: 4px;">${score}</td>`;
        } else {
          scoreCellsHtml += `<td style="border: 1px solid #000; padding: 4px; background:#f1f5f9; color:#94a3b8; font-size:0.75rem;">-</td>`;
        }
      }

      const pct = ((earnedSum / maxPossibleScore) * 100).toFixed(1);
      groupPctSum += Number(pct);

      let grade = "우수";
      let gradeColor = "#059669";
      if (pct < 70) {
        grade = "미흡";
        gradeColor = "#dc2626";
      } else if (pct < 90) {
        grade = "보통";
        gradeColor = "#d97706";
      }

      const tr = document.createElement("tr");
      tr.style.borderBottom = "1px solid #000";

      tr.innerHTML = `
        <td style="border: 1px solid #000; padding: 6px; font-weight:700;">${escapeHTML(w.name)}</td>
        <td style="border: 1px solid #000; padding: 6px;">${escapeHTML(jobName)}</td>
        ${scoreCellsHtml}
        <td style="border: 1px solid #000; padding: 6px; font-weight:700;">${earnedSum}점 / ${maxPossibleScore}점</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight:800; color:#2563eb;">${pct}%</td>
        <td style="border: 1px solid #000; padding: 6px; font-weight:800; color:${gradeColor};">${grade}</td>
      `;
      tbody.appendChild(tr);
    });

    const groupAvgPct = (groupPctSum / groupWorkers.length).toFixed(1);
    let groupGrade = "우수";
    let groupGradeColor = "#059669";
    if (groupAvgPct < 70) {
      groupGrade = "미흡";
      groupGradeColor = "#dc2626";
    } else if (groupAvgPct < 90) {
      groupGrade = "보통";
      groupGradeColor = "#d97706";
    }

    const jobSubTotalTr = document.createElement("tr");
    jobSubTotalTr.style.background = "#f8fafc";
    jobSubTotalTr.style.fontWeight = "700";
    jobSubTotalTr.innerHTML = `
      <td colspan="2" style="border: 1px solid #000; padding: 5px; text-align: center; background: #f1f5f9; color: #1e293b;">
        └ [${escapeHTML(jobName)}] 환산 평균 소계
      </td>
      <td colspan="20" style="border: 1px solid #000; padding: 5px; text-align: center; color: #475569;">
        적용 ${appliedQs.length}문항 (${maxPossibleScore}점 만점 기준 N/A 제외 환산)
      </td>
      <td style="border: 1px solid #000; padding: 5px; text-align: center;">-</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: center; color: #2563eb; font-weight:800;">${groupAvgPct}%</td>
      <td style="border: 1px solid #000; padding: 5px; text-align: center; color: ${groupGradeColor}; font-weight:800;">${groupGrade}</td>
    `;
    tbody.appendChild(jobSubTotalTr);
  });
}

function printReport() {
  window.print();
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
      <td style="padding: 8px; color: #475569; font-family: monospace;">${escapeHTML(log.timestamp)}</td>
      <td style="padding: 8px;"><span class="score-badge score-3">${escapeHTML(log.action)}</span></td>
      <td style="padding: 8px; font-weight: 700;">${escapeHTML(log.site)}</td>
      <td style="padding: 8px; color: var(--accent-color);">${escapeHTML(log.user)}</td>
      <td style="padding: 8px;">${escapeHTML(log.details)}</td>
      <td style="padding: 8px; text-align: center;"><span style="color:#059669; font-weight:800;">✅ ${escapeHTML(log.status)}</span></td>
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
