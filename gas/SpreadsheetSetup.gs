/* =========================================================================
   SpreadsheetSetup.gs
   초기 스프레드시트 시트 구조 생성 및 초기 데이터 삽입 스크립트
   ========================================================================= */

function setupSpreadsheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Evaluations 시트 생성
  var evalSheet = ss.getSheetByName('Evaluations');
  if (!evalSheet) {
    evalSheet = ss.insertSheet('Evaluations');
  }

  if (evalSheet.getLastRow() === 0) {
    var evalHeaders = [
      '제출일시', '년도', '구분(상/하반기)', '현장명', '작성자(성명)', '생년월일'
    ];
    for (var i = 1; i <= 20; i++) {
      evalHeaders.push('Q' + i + '점수');
    }
    evalHeaders.push('총점', '평균점수', '서명이미지URL');

    evalSheet.appendRow(evalHeaders);
    evalSheet.getRange(1, 1, 1, evalHeaders.length).setFontWeight('bold').setBackground('#f1f5f9');
  }

  // 2. Users 시트 생성 및 초기 데이터 (테스트현장 - 최난새 - nschoi@sebangtec.com) 삽입
  var userSheet = ss.getSheetByName('Users');
  if (!userSheet) {
    userSheet = ss.insertSheet('Users');
  }

  if (userSheet.getLastRow() === 0) {
    var userHeaders = ['현장명', '사번', '성명', '이메일주소', '생년월일', '직종', '연락처'];
    userSheet.appendRow(userHeaders);
    userSheet.getRange(1, 1, 1, userHeaders.length).setFontWeight('bold').setBackground('#f1f5f9');

    // 요청하신 초기 데이터 등록
    userSheet.appendRow([
      '테스트현장', 'TEST001', '최난새', 'nschoi@sebangtec.com', '800101', '안전관리자', '010-0000-0000'
    ]);
  }
}
