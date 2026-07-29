/* =========================================================================
   Auth.gs
   비밀번호 검증, 변경 및 이메일 OTP 인증 모듈
   ========================================================================= */

function checkAdminPassword_(password) {
  var props = PropertiesService.getScriptProperties();
  var realPwd = props.getProperty('Addpassword');

  if (!realPwd) {
    return { ok: true, isDefault: true, message: 'Addpassword 속성이 미설정되어 개발 모드로 통과합니다.' };
  }

  if (String(password || '').trim() === String(realPwd).trim()) {
    return { ok: true };
  } else {
    return { ok: false, error: '관리자 비밀번호가 올바르지 않습니다.' };
  }
}

function checkIndexPassword_(password) {
  var props = PropertiesService.getScriptProperties();
  var realPwd = props.getProperty('loginindex');

  if (!realPwd) {
    return { ok: true, isDefault: true, message: 'loginindex 속성이 미설정되어 접속을 허용합니다.' };
  }

  if (String(password || '').trim() === String(realPwd).trim()) {
    return { ok: true };
  } else {
    return { ok: false, error: '접속 비밀번호가 올바르지 않습니다.' };
  }
}

/**
 * 어드민 화면에서 비밀번호 변경 (Addpassword / loginindex)
 */
function changePassword_(currentAdminPassword, targetKey, newPassword) {
  var auth = checkAdminPassword_(currentAdminPassword);
  if (!auth.ok) {
    return { ok: false, error: '현재 관리자 비밀번호가 올바르지 않습니다.' };
  }

  var key = String(targetKey || '').trim();
  var newPwd = String(newPassword || '').trim();

  if (key !== 'Addpassword' && key !== 'loginindex') {
    return { ok: false, error: '유효하지 않은 비밀번호 변경 항목입니다.' };
  }

  if (!newPwd) {
    return { ok: false, error: '새 비밀번호를 입력해 주세요.' };
  }

  // PropertiesService 스크립트 속성 즉시 변경
  PropertiesService.getScriptProperties().setProperty(key, newPwd);

  var targetName = key === 'Addpassword' ? '관리자 비밀번호(Addpassword)' : '작성 페이지 접속 비밀번호(loginindex)';
  return { ok: true, message: targetName + '가 성공적으로 변경되었습니다.' };
}

function sendEmailOTP_(email) {
  var emailStr = String(email || '').trim();
  if (!emailStr || emailStr.indexOf('@') === -1) {
    return { ok: false, error: '유효한 이메일 주소를 입력해 주세요.' };
  }

  var otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  var cache = CacheService.getScriptCache();
  cache.put('OTP_' + emailStr, otpCode, 300);

  var subject = '[관리감독자 평가] 인증번호 [' + otpCode + '] 입력 안내';
  var body = [
    '안녕하세요. 관리감독자 업무수행 평가 본인인증 번호입니다.',
    '',
    '인증번호: ' + otpCode,
    '※ 본 인증번호는 5분간 유효합니다.',
    '',
    '감사합니다.'
  ].join('\n');

  GmailApp.sendEmail(emailStr, subject, body);

  return { ok: true, message: '이메일로 인증번호가 발송되었습니다.' };
}

function verifyEmailOTP_(email, otpCode) {
  var emailStr = String(email || '').trim();
  var inputOtp = String(otpCode || '').trim();

  var cache = CacheService.getScriptCache();
  var cachedOtp = cache.get('OTP_' + emailStr);

  if (!cachedOtp) {
    return { ok: false, error: '인증번호가 만료되었거나 발송 내역이 없습니다.' };
  }

  if (cachedOtp === inputOtp) {
    cache.remove('OTP_' + emailStr);
    return { ok: true, message: '이메일 본인 인증이 성공하였습니다.' };
  } else {
    return { ok: false, error: '인증번호가 일치하지 않습니다.' };
  }
}
