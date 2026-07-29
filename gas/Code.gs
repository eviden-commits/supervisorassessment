/**
 * gas/Code.gs
 * Google Apps Script 메인 웹앱 컨트롤러 (doGet, doPost 라우팅)
 */

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "running", message: "Supervisor Assessment API is active." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var result = { ok: false, error: "Invalid action" };

    if (action === "checkAdminPassword") {
      result = checkAdminPassword_(contents.password);
      if (result.ok) logAction_("관리자접속", "시스템", "관리자", "관리자 대시보드 로그인 성공");
    } else if (action === "checkIndexPassword") {
      result = checkIndexPassword_(contents.password);
    } else if (action === "changePassword") {
      result = changePassword_(contents.adminPassword, contents.targetKey, contents.newPassword);
      if (result.ok) logAction_("비밀번호변경", "시스템", "관리자", contents.targetKey + " 비밀번호 변경 적용 완료");
    } else if (action === "submitAssessment") {
      result = submitAssessment_(contents);
      if (result.ok) logAction_("평가제출", contents.siteName || "현장", contents.evaluatorName || "소장", contents.supervisorName + " 평가표 제출 완료");
    } else if (action === "uploadUsers") {
      result = uploadUsers_(contents.users);
    } else if (action === "sendReminderMail") {
      result = sendReminderMail_(contents.email, contents.otpCode);
      if (result.ok) logAction_("OTP발송", "현장", contents.email, "이메일 6자리 OTP 인증번호 발송 완료");
    } else if (action === "getAuditLogs") {
      result = getAuditLogs_();
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
