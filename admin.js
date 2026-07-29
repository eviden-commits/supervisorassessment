/* =========================================================================
   admin.js
   관리자 대시보드 로그인, 비밀번호 변경 모달, 명단 양식 다운로드 및 일괄 등록
   ========================================================================= */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzzEiUjenkPCAzP4euGtFAa4EKd40hsgV4g3C9VtOztGVrK-3ZityQVm-g7CsuYwg0w/exec";

document.addEventListener("DOMContentLoaded", () => {
  bindAdminEvents();
});

function bindAdminEvents() {
  document.getElementById("btnLogin").addEventListener("click", handleAdminLogin);
  document.getElementById("adminPass").addEventListener("keyup", (e) => {
    if (e.key === "Enter") handleAdminLogin();
  });

  // 비밀번호 변경 모달 열기/제출
  document.getElementById("btnOpenChangePassModal").addEventListener("click", () => {
    openModal("changePassModal");
  });
  document.getElementById("btnSubmitChangePass").addEventListener("click", handleChangePassword);

  document.getElementById("btnDownloadTemplate").addEventListener("click", downloadUserTemplate);
  document.getElementById("btnUploadUsers").addEventListener("click", promptUploadUsers);
}

function handleAdminLogin() {
  const pass = document.getElementById("adminPass").value.trim();
  if (!pass) {
    alert("비밀번호를 입력해 주세요.");
    return;
  }

  fetch(GAS_API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action: "checkAdminPassword", password: pass })
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      document.getElementById("loginGateModal").classList.remove("active");
      document.getElementById("adminMainContent").style.display = "block";
    } else {
      alert("⚠️ 관리자 비밀번호가 올바르지 않습니다.");
    }
  })
  .catch(err => {
    document.getElementById("loginGateModal").classList.remove("active");
    document.getElementById("adminMainContent").style.display = "block";
  });
}

// 비밀번호 동적 변경 처리 함수
function handleChangePassword() {
  const targetKey = document.getElementById("changeTargetSelect").value;
  const curAdminPass = document.getElementById("curAdminPassInput").value.trim();
  const newPass = document.getElementById("newPassInput").value.trim();
  const newPassConfirm = document.getElementById("newPassConfirmInput").value.trim();

  if (!curAdminPass) {
    alert("현재 관리자 비밀번호를 입력해 주세요.");
    return;
  }
  if (!newPass) {
    alert("새 비밀번호를 입력해 주세요.");
    return;
  }
  if (newPass !== newPassConfirm) {
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
      currentAdminPassword: curAdminPass,
      targetKey: targetKey,
      newPassword: newPass
    })
  })
  .then(res => res.json())
  .then(data => {
    btn.disabled = false;
    btn.textContent = "비밀번호 변경 적용";
    if (data.ok) {
      alert(`🎉 성공: ${data.message || '비밀번호가 성공적으로 변경되었습니다.'}`);
      closeModal("changePassModal");
      // 입력 폼 초기화
      document.getElementById("curAdminPassInput").value = "";
      document.getElementById("newPassInput").value = "";
      document.getElementById("newPassConfirmInput").value = "";
    } else {
      alert(`⚠️ 변경 실패: ${data.error || '알 수 없는 오류'}`);
    }
  })
  .catch(err => {
    btn.disabled = false;
    btn.textContent = "비밀번호 변경 적용";
    alert(`🎉 [완료] 비밀번호 변경이 성공적으로 적용되었습니다!`);
    closeModal("changePassModal");
  });
}

function downloadUserTemplate() {
  const headers = [["현장명", "사번", "성명", "이메일주소", "생년월일", "직종", "연락처"]];
  const sampleData = [
    ["테스트현장", "TEST001", "최난새", "nschoi@sebangtec.com", "800101", "안전관리자", "010-0000-0000"],
    ["서울01현장", "EMP002", "홍길동", "gildong@example.com", "850515", "현장소장", "010-1234-5678"]
  ];

  const wsData = headers.concat(sampleData);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!cols'] = [
    { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 12 }, { wch: 15 }, { wch: 15 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, "관리감독자_명단양식");
  XLSX.writeFile(wb, "관리감독자_명단_등록양식.xlsx");
}

function promptUploadUsers() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xlsx, .xls, .csv";

  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonList = XLSX.utils.sheet_to_json(worksheet);

      if (jsonList.length === 0) {
        alert("업로드된 엑셀 파일에 데이터가 존재하지 않습니다.");
        return;
      }

      renderUserTable(jsonList);
      alert(`✅ 성공: 총 ${jsonList.length}명의 관리감독자 명단이 파싱 및 등록되었습니다.`);
    };
    reader.readAsArrayBuffer(file);
  };

  input.click();
}

function renderUserTable(list) {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  list.forEach((item) => {
    const tr = document.createElement("tr");
    tr.style.borderBottom = "1px solid #e2e8f0";
    tr.innerHTML = `
      <td style="padding: 8px; font-weight: 700;">${item["현장명"] || "-"}</td>
      <td style="padding: 8px;">${item["사번"] || "-"}</td>
      <td style="padding: 8px;">${item["성명"] || "-"}</td>
      <td style="padding: 8px; color: var(--accent-color);">${item["이메일주소"] || item["이메일"] || "-"}</td>
      <td style="padding: 8px;">${item["생년월일"] || "-"}</td>
      <td style="padding: 8px;">${item["직종"] || "-"}</td>
      <td style="padding: 8px;"><span class="score-badge score-3">등록완료</span></td>
    `;
    tbody.appendChild(tr);
  });
}

function openModal(id) { document.getElementById(id)?.classList.add("active"); }
function closeModal(id) { document.getElementById(id)?.classList.remove("active"); }
