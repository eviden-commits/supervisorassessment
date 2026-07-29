/* =========================================================================
   Admin.gs
   관리자 인원 등록 및 automail 미제출 알림 메일 발송
   ========================================================================= */

/**
 * 관리감독자 인원 일괄 등록 (Users 시트 저장)
 */
function uploadUsers_(password, usersList) {
  var auth = checkAdminPassword_(password);
  if (!auth.ok) return auth;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');

  if (!sheet) {
    setupSpreadsheet_();
    sheet = ss.getSheetByName('Users');
  }

  if (!Array.isArray(usersList) || usersList.length === 0) {
    return { ok: false, error: '등록할 인원 목록이 올바르지 않습니다.' };
  }

  // 기존 헤더 유지 후 데이터 추가
  for (var i = 0; i < usersList.length; i++) {
    var u = usersList[i];
    sheet.appendRow([
      String(u['현장명'] || u.siteName || ''),
      String(u['사번'] || u.empId || ''),
      String(u['성명'] || u.name || ''),
      String(u['이메일주소'] || u['이메일'] || u.email || ''),
      String(u['생년월일'] || u.birthDate || ''),
      String(u['직종'] || u.jobTitle || ''),
      String(u['연락처'] || u.phone || '')
    ]);
  }

  return { ok: true, count: usersList.length };
}

/**
 * 미제출 현장 소장에게 automail 독려 이메일 발송
 */
function sendReminderMail_(password, targetEmails) {
  var auth = checkAdminPassword_(password);
  if (!auth.ok) return auth;

  if (!Array.isArray(targetEmails) || targetEmails.length === 0) {
    return { ok: false, error: '발송 대상 이메일 목록이 없습니다.' };
  }

  var subject = '[안전보건 독려] 관리감독자 업무수행 평가표 작성 요청 안내';
  var body = [
    '안녕하십니까, 관리감독자님.',
    '',
    '산업안전보건법 관련 2026년 상반기 관리감독자 업무수행 평가표 작성을 요청드립니다.',
    '아래 시스템 접속 링크를 통해 제출을 진행해 주시기 바랍니다.',
    '',
    '▶ 평가 작성 시스템 접속 링크: https://your-github-repo.github.io/supervisorassessment/',
    '',
    '감사합니다. (안전보건관리팀)'
  ].join('\n');

  var sentCount = 0;
  for (var i = 0; i < targetEmails.length; i++) {
    var email = targetEmails[i];
    if (email && email.indexOf('@') !== -1) {
      GmailApp.sendEmail(email, subject, body);
      sentCount++;
    }
  }

  return { ok: true, sentCount: sentCount };
}
