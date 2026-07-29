/* =========================================================================
   Assessment.gs
   평가표 작성 데이터 저장 및 구글 스프레드시트 기록
   ========================================================================= */

function submitAssessment_(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Evaluations');

  if (!sheet) {
    setupSpreadsheet_();
    sheet = ss.getSheetByName('Evaluations');
  }

  var siteName = String(payload.siteName || '').trim();
  var supervisorName = String(payload.supervisorName || '').trim();
  var birthDate = String(payload.birthDate || '').trim();
  var term = String(payload.term || '상반기').trim();
  var scores = payload.scores || {};
  var rawSigDataUrl = payload.signatureDataUrl || '';

  if (!siteName || !supervisorName) {
    return { ok: false, error: '현장명과 소장 성명이 누락되었습니다.' };
  }

  // 구글 드라이브 Data 폴더에 서명 이미지 파일 저장
  var sigFileUrl = saveSignatureImage_(siteName, supervisorName, rawSigDataUrl);

  // 점수 계산 (Q1 ~ Q20)
  var scoreList = [];
  var totalScore = 0;
  for (var i = 1; i <= 20; i++) {
    var s = Number(scores['q_' + i] || 0);
    scoreList.push(s);
    totalScore += s;
  }

  var avgScore = (totalScore / 20).toFixed(2);
  var nowStr = Utilities.formatDate(new Date(), 'GMT+9', 'yyyy-MM-dd HH:mm:ss');
  var year = new Date().getFullYear();

  // 시트 행 생성: [제출일시, 년도, 반기, 현장명, 성명, 생년월일, Q1~Q20, 총점, 평균, 서명URL]
  var rowData = [
    nowStr, year, term, siteName, supervisorName, birthDate
  ];
  rowData = rowData.concat(scoreList);
  rowData.push(totalScore, avgScore, sigFileUrl);

  sheet.appendRow(rowData);

  return {
    ok: true,
    timestamp: nowStr,
    totalScore: totalScore,
    avgScore: avgScore,
    signatureUrl: sigFileUrl
  };
}
