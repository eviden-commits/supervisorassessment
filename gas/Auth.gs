/* =========================================================================
   Auth.gs
   대소문자 유연 지원 비밀번호 검증 (Addpassword / loginindex 호환)
   ========================================================================= */

function checkAdminPassword_(password) {
  var props = PropertiesService.getScriptProperties();
  // 대소문자 모두 호환 검사
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
  // 대소문자 및 변형 키 모두 지원 (loginindex, loginIndex, LOGININDEX)
  var realPwd = props.getProperty('loginindex') || props.getProperty('loginIndex') || props.getProperty('LOGININDEX');
  var inputPwd = String(password || '').trim();

  if (!realPwd) {
    if (inputPwd) {
      props.setProperty('loginindex', inputPwd);
    }
    return { ok: true, message: '접속 비밀번호가 최초 설정되었습니다.' };
  }

  if (inputPwd === String(realPwd).trim()) {
    return { ok: true };
  } else {
    return { ok: false, error: '접속 비밀번호가 일치하지 않습니다.' };
  }
}

function changePassword_(currentAdminPassword, targetKey, newPassword) {
  var auth = checkAdminPassword_(currentAdminPassword);
  if (!auth.ok) {
    return { ok: false, error: '현재 관리자 비밀번호가 올바르지 않습니다.' };
  }

  var key = String(targetKey || '').trim();
  var newPwd = String(newPassword || '').trim();

  if (!newPwd) {
    return { ok: false, error: '새 비밀번호를 입력해 주세요.' };
  }

  // 양쪽 모두 설정하여 안전성 확보
  if (key === 'loginindex' || key === 'loginIndex') {
    props.setProperty('loginindex', newPwd);
    props.setProperty('loginIndex', newPwd);
  } else {
    props.setProperty('Addpassword', newPwd);
    props.setProperty('addpassword', newPwd);
  }

  var targetName = (key === 'Addpassword' || key === 'addpassword') ? '관리자 비밀번호' : '작성 페이지 접속 비밀번호';
  return { ok: true, message: targetName + '가 성공적으로 변경되었습니다.' };
}
