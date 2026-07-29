/**
 * =========================================================================
 * Code.gs
 * Google Apps Script 백엔드 웹앱 메인 엔트리포인트 및 OTP 검증 라우터
 * =========================================================================
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === "checkAdminPassword") {
      return checkAdminPassword_(data.password);
    } else if (action === "checkIndexPassword") {
      return checkIndexPassword_(data.password);
    } else if (action === "changePassword") {
      return changePassword_(data.adminPassword, data.targetKey, data.newPassword);
    } else if (action === "submitAssessment") {
      return submitAssessment_(data);
    } else if (action === "uploadUsers") {
      return uploadUsers_(data.users);
    } else if (action === "sendReminderMail") {
      return sendReminderMail_(data.email, data.otpCode);
    } else if (action === "verifyOtp") {
      return verifyOtp_(data.otpCode);
    } else if (action === "getAuditLogs") {
      return getAuditLogs_();
    }

    return responseJSON_({ ok: false, error: "알 수 없는 요청 액션: " + action });
  } catch (err) {
    return responseJSON_({ ok: false, error: err.message });
  }
}

function doGet(e) {
  return HtmlService.createHtmlOutput("<h3>관리감독자 평가표 GAS 백엔드 웹앱이 정상 실행 중입니다.</h3>");
}

// 🔥 OTP 인증 검증 함수 (스크립트 속성 'Evidence' 저장 값과 비교)
function verifyOtp_(inputOtp) {
  var props = PropertiesService.getScriptProperties();
  var evidencePass = props.getProperty("Evidence") || "123456";

  // 스크립트 속성의 'Evidence' 저장 값과 비교하거나 6자리 유효 번호인 경우 통과
  if (inputOtp === evidencePass || (inputOtp && inputOtp.length === 6)) {
    logAction_("OTP인증", "이메일OTP", "Quick 테스트 OTP 인증 통과", "성공");
    return responseJSON_({ ok: true });
  } else {
    return responseJSON_({ ok: false, error: "OTP 인증번호가 올바르지 않습니다." });
  }
}

function responseJSON_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
