/**
 * gas/Admin.gs
 * 관리감독자 명단 관리, 독려 이메일 발송 및 감사 로그(Audit Logs) 처리
 */

/**
 * 엑셀 파싱 명단 Users 시트 일괄 저장
 */
function uploadUsers_(users) {
  if (!users || !Array.isArray(users) || users.length === 0) {
    return { ok: false, error: "업로드할 사용자 데이터가 비어 있습니다." };
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Users");
  
  if (!sheet) {
    sheet = ss.insertSheet("Users");
    sheet.appendRow(["현장명", "사번", "성명", "이메일주소", "생년월일", "직종", "등록일시"]);
  }

  const now = new Date();
  let count = 0;

  users.forEach(function(u) {
    sheet.appendRow([
      u.siteName || u.site || "미지정",
      u.employeeId || u.id || "",
      u.name || "",
      u.email || "",
      u.birthDate || u.birth || "",
      u.jobCategory || u.job || "관리감독자",
      now
    ]);
    count++;
  });

  // 감사 로그 기록
  logAction_("명단업로드", users[0].siteName || "전체현장", users[0].email || "관리자", count + "명의 관리감독자 명단 시트 업로드 완료");

  return { ok: true, count: count };
}

/**
 * 📜 감사 로그(Audit Logs) 시트 기록 함수
 */
function logAction_(action, site, user, details, status) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("Logs");
    if (!sheet) {
      sheet = ss.insertSheet("Logs");
      sheet.appendRow(["일시", "작업구분", "현장명/반기", "작성자/담당자", "상세작업내역", "상태"]);
    }
    const nowStr = Utilities.formatDate(new Date(), "GMT+9", "yyyy-MM-dd HH:mm:ss");
    sheet.appendRow([nowStr, action || "일반작업", site || "시스템", user || "사용자", details || "-", status || "성공"]);
  } catch (err) {
    Logger.log("Log error: " + err.toString());
  }
}

/**
 * 📜 감사 로그 전체 조회 API
 */
function getAuditLogs_() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Logs");
    if (!sheet) return { ok: true, logs: [] };

    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { ok: true, logs: [] };

    const logs = [];
    for (let i = data.length - 1; i >= 1; i--) {
      logs.push({
        timestamp: Utilities.formatDate(new Date(data[i][0]), "GMT+9", "yyyy-MM-dd HH:mm:ss"),
        action: data[i][1],
        site: data[i][2],
        user: data[i][3],
        details: data[i][4],
        status: data[i][5]
      });
    }
    return { ok: true, logs: logs };
  } catch (err) {
    return { ok: false, error: err.toString() };
  }
}
