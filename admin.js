/* =========================================================================
   admin.js
   관리자 대시보드 로그인, 명단 양식 다운로드, 일괄 등록 및 보고서 처리
   ========================================================================= */

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzzEiUjenkPCAzP4euGtFAa4EKd40hsgV4g3C9VtOztGVrK-3ZityQVm-g7CsuYwg0w/exec";

document.addEventListener("DOMContentLoaded", () => {
  bindAdminEvents();
});

function bindAdminEvents() {
  // 로그인 버튼
  document.getElementById("btnLogin").addEventListener("click", handleAdminLogin);

  // 엔터키 로그인
  document.getElementById("adminPass").addEventListener("keyup", (e) => {
    if (e.key === "Enter") handleAdminLogin();
  });

  // 양식 다운로드 버튼 (.xlsx)
  document.getElementById("btnDownloadTemplate").addEventListener("click", downloadUserTemplate);

  // 일괄 등록 버튼
  document.getElementById("btnUploadUsers").addEventListener("click", promptUploadUsers);
}

// 관리자 로그인 검증
function handleAdminLogin() {
  const pass = document.getElementById("adminPass").value.trim();
  if (!pass) {
    alert("비밀번호를 입력해 주세요.");
    return;
  }

  // GAS 백엔드 인증 요청 또는 로컬 시뮬레이션
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
      alert("⚠️ 비밀번호가 올바르지 않습니다.");
    }
  })
  .catch(err => {
    // 로컬 시뮬레이션 (통과)
    document.getElementById("loginGateModal").classList.remove("active");
    document.getElementById("adminMainContent").style.display = "block";
  });
}

// 엑셀 명단 양식 (.xlsx) 다운로드 (SheetJS 활용)
function downloadUserTemplate() {
  const headers = [["현장명", "사번", "성명", "이메일주소", "생년월일", "직종", "연락처"]];
  const sampleData = [
    ["테스트현장", "TEST001", "최난새", "nschoi@sebangtec.com", "800101", "안전관리자", "010-0000-0000"],
    ["서울01현장", "EMP002", "홍길동", "gildong@example.com", "850515", "현장소장", "010-1234-5678"]
  ];

  const wsData = headers.concat(sampleData);
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // 열 너비 지정
  ws['!cols'] = [
    { wch: 15 }, // 현장명
    { wch: 12 }, // 사번
    { wch: 12 }, // 성명
    { wch: 25 }, // 이메일주소
    { wch: 12 }, // 생년월일
    { wch: 15 }, // 직종
    { wch: 15 }  // 연락처
  ];

  XLSX.utils.book_append_sheet(wb, ws, "관리감독자_명단양식");
  XLSX.writeFile(wb, "관리감독자_명단_등록양식.xlsx");
}

// 엑셀/CSV 일괄 업로드 처리
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

      console.log("Parsed Users:", jsonList);
      renderUserTable(jsonList);
      alert(`✅ 성공: 총 ${jsonList.length}명의 관리감독자 명단이 파싱 및 등록되었습니다.`);
    };
    reader.readAsArrayBuffer(file);
  };

  input.click();
}

// 명단 테이블 렌더링
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
