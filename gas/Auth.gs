/* =========================================================================
   Auth.gs
   관리자 비밀번호 (Addpassword) 및 메인 작성 비밀번호 (loginindex) 검증
   ========================================================================= */

/**
 * ScriptProperties의 'Addpassword' (관리자 비밀번호) 검증
 */
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

/**
 * ScriptProperties의 'loginindex' (메인 작성 접속 비밀번호) 검증
 */
function checkIndexPassword_(password) {
  var props = PropertiesService.getScriptProperties();
  var realPwd = props.getProperty('loginindex');

  // loginindex 미설정 시 개발 편의를 위해 통과
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
 * 6자리 이메일 OTP 번호 생성 및 발송
 */
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
