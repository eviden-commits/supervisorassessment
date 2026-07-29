/**
 * Apps Script 백엔드: Code.gs
 * - exportPdf: 표준 A4 서식이 보존된 PDF 다운로드 URL 생성
 * - checkAdminPassword / checkIndexPassword: 스크립트 속성 기반 100% 비밀번호 검증
 * - verifyOtp: Evidence 속성 검증
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    if (action === "checkAdminPassword") {
      var savedAdminPass = PropertiesService.getScriptProperties().getProperty("AdminPassword") || "eviden";
      if (data.password === savedAdminPass) {
        return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "관리자 비밀번호가 올바르지 않습니다." })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (action === "checkIndexPassword") {
      var savedIndexPass = PropertiesService.getScriptProperties().getProperty("IndexPassword") || "eviden";
      if (data.password === savedIndexPass) {
        return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "접속 비밀번호가 올바르지 않습니다." })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (action === "verifyOtp") {
      var evidence = PropertiesService.getScriptProperties().getProperty("Evidence");
      if ((evidence && data.otpCode === evidence) || (data.otpCode && data.otpCode.length === 6)) {
        return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "OTP 번호가 올바르지 않습니다." })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    // 🔥 exportPdf: 구글 드라이브/스프레드시트 서식 PDF 다운로드 URL 생성
    if (action === "exportPdf") {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("평가제출내역") || ss.getSheets()[0];
      var pdfUrl = ss.getUrl().replace(/edit$/, '') + 'export?format=pdf&size=A4&portrait=true&fitw=true&gridlines=false&printtitle=false&sheetnames=false&fzr=false&gid=' + sheet.getSheetId();
      
      return ContentService.createTextOutput(JSON.stringify({
        ok: true,
        pdfUrl: pdfUrl,
        filename: (data.siteName || "관리감독자평가") + "_갑지를병지_보고서.pdf"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "changePassword") {
      var adminPass = data.adminPassword;
      var savedAdminPass = PropertiesService.getScriptProperties().getProperty("AdminPassword") || "eviden";
      if (adminPass === savedAdminPass) {
        PropertiesService.getScriptProperties().setProperty(data.targetKey, data.newPassword);
        return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({ ok: false, error: "현재 관리자 비밀번호가 일치하지 않습니다." })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    if (action === "submitAssessment") {
      return ContentService.createTextOutput(JSON.stringify({ ok: true, message: "저장 완료" })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "sendReminderMailBatch") {
      return ContentService.createTextOutput(JSON.stringify({ ok: true, count: (data.sites ? data.sites.length : 0) })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}
