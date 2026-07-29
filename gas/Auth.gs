/* =========================================================================
   Auth.gs
   상세 디버깅 에러 메시지 포함 비밀번호 검증
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
    return { ok: false, error: '관리자 비밀번호 불일치 (서버 저장값과 입력값이 다릅니다)' };
  }
}

function checkIndexPassword_(password) {
  var props = PropertiesService.getScriptProperties();
  var realPwd = props.getProperty('loginindex') || props.getProperty('loginIndex') || props.getProperty('LOGININDEX');
  var inputPwd = String(password || '').trim();

  if (!realPwd) {
    return { ok: false, error: '구글 스크립트 속성에 loginindex 키가 등록되어 있지 않습니다. 프로젝트 설정에서 loginindex 속성을 추가해 주세요.' };
  }

  if (inputPwd === String(realPwd).trim()) {
    return { ok: true };
  } else {
    return { ok: false, error: '접속 비밀번호 불일치 (입력하신 비밀번호가 설정된 loginindex 값과 다릅니다)' };
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
