/* =========================================================================
   Code.gs
   Google Apps Script REST API Web App 엔드포인트 및 라우팅
   ========================================================================= */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'ping';
  var result = {};

  try {
    if (action === 'getInitialData') {
      result = getInitialData_();
    } else if (action === 'getQuestions') {
      result = { ok: true, questions: QUESTIONS_DATA };
    } else {
      result = { ok: true, message: 'SupervisorAssessment GAS Web App Ready' };
    }
  } catch (err) {
    result = { ok: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var result = {};
  try {
    var contents = e.postData ? e.postData.contents : '{}';
    var data = JSON.parse(contents);
    var action = data.action;

    if (action === 'checkAdminPassword') {
      result = checkAdminPassword_(data.password);
    } else if (action === 'checkIndexPassword') {
      result = checkIndexPassword_(data.password);
    } else if (action === 'changePassword') {
      result = changePassword_(data.currentAdminPassword, data.targetKey, data.newPassword);
    } else if (action === 'sendOTP') {
      result = sendEmailOTP_(data.email);
    } else if (action === 'verifyOTP') {
      result = verifyEmailOTP_(data.email, data.otpCode);
    } else if (action === 'submitAssessment') {
      result = submitAssessment_(data);
    } else if (action === 'uploadUsers') {
      result = uploadUsers_(data.password, data.users);
    } else if (action === 'sendReminderMail') {
      result = sendReminderMail_(data.password, data.targetEmails);
    } else {
      result = { ok: false, error: '유효하지 않은 Action입니다: ' + action };
    }
  } catch (err) {
    result = { ok: false, error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getInitialData_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Users');
  var sites = [];
  var users = [];

  if (sheet) {
    var values = sheet.getDataRange().getValues();
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (!row[0]) continue;
      users.push({
        siteName: String(row[0]),
        empId: String(row[1] || ''),
        name: String(row[2] || ''),
        email: String(row[3] || ''),
        birthDate: String(row[4] || ''),
        jobTitle: String(row[5] || ''),
        phone: String(row[6] || '')
      });
      if (sites.indexOf(String(row[0])) === -1) {
        sites.push(String(row[0]));
      }
    }
  }

  return { ok: true, sites: sites, users: users };
}
