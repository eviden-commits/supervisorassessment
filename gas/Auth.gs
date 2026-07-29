/* =========================================================================
   Auth.gs
   속성명 Login_Index 명시적 지원 및 대소문자 호환 비밀번호 검증
   ========================================================================= */

function checkAdminPassword_(password) {
  var props = PropertiesService.getScriptProperties();
  var realPwd = props.getProperty('Addpassword') || props.getProperty('addpassword') || props.getProperty('ADDPASSWORD');
  var inputPwd = String(password || '').trim();

  if (!realPwd) {
    if (inputPwd) {
      props.setProperty('Addpassword', inputPwd);
    }
    return { ok: true, message: '관리자 비밀번호가 최초 설정되었습니다.' };
  }

  if (inputPwd === String(realPwd).trim()) {
    return { ok: true };
  } else {
    return { ok: false, error: '관리자 비밀번호가 일치하지 않습니다.' };
  }
}

function checkIndexPassword_(password) {
  var props = PropertiesService.getScriptProperties();
  // 요청하신 속성명 'Login_Index' 최우선 검색
  var realPwd = props.getProperty('Login_Index') || props.getProperty('login_index') || props.getProperty('LOGIN_INDEX') || props.getProperty('loginindex') || props.getProperty('loginIndex');
  var inputPwd = String(password || '').trim();

  if (!realPwd) {
    return { ok: false, error: '구글 스크립트 속성에 Login_Index 키가 등록되어 있지 않습니다. 프로젝트 설정에서 Login_Index 속성을 추가해 주세요.' };
  }

  if (inputPwd === String(realPwd).trim()) {
    return { ok: true };
  } else {
    return { ok: false, error: '접속 비밀번호 불일치 (입력하신 비밀번호가 설정된 Login_Index 값과 다릅니다)' };
  }
}

function changePassword_(currentAdminPassword, targetKey, newPassword) {
  var auth = checkAdminPassword_(currentAdminPassword);
  if (!auth.ok) {
    return { ok: false, error: '현재 관리자 비밀번호가 올바르지 않습니다.' };
  }

  var props = PropertiesService.getScriptProperties();
  var key = String(targetKey || '').trim();
  var newPwd = String(newPassword || '').trim();

  if (!newPwd) {
    return { ok: false, error: '새 비밀번호를 입력해 주세요.' };
  }

  if (key === 'Login_Index' || key === 'login_index' || key === 'loginindex') {
    props.setProperty('Login_Index', newPwd);
    props.setProperty('loginindex', newPwd);
  } else {
    props.setProperty('Addpassword', newPwd);
    props.setProperty('addpassword', newPwd);
  }

  var targetName = (key === 'Addpassword' || key === 'addpassword') ? '관리자 비밀번호' : '작성 페이지 접속 비밀번호(Login_Index)';
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

  GmailApp.sendEmail(emailStr, '[관리감독자 평가] 인증번호 [' + otpCode + '] 입력 안내', '인증번호: ' + otpCode);
  return { ok: true, message: '이메일로 인증번호가 발송되었습니다.' };
}

function verifyEmailOTP_(email, otpCode) {
  var emailStr = String(email || '').trim();
  var inputOtp = String(otpCode || '').trim();
  var cache = CacheService.getScriptCache();
  var cachedOtp = cache.get('OTP_' + emailStr);

  if (!cachedOtp) return { ok: false, error: '인증번호가 만료되었습니다.' };
  if (cachedOtp === inputOtp) {
    cache.remove('OTP_' + emailStr);
    return { ok: true, message: '이메일 본인 인증 성공' };
  } else {
    return { ok: false, error: '인증번호가 일치하지 않습니다.' };
  }
}
