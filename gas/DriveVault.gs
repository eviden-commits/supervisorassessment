/* =========================================================================
   DriveVault.gs
   구글 드라이브 Vault/Data 폴더 관리 및 서명 이미지 PNG 파일 저장
   ========================================================================= */

const ROOT_FOLDER_NAME = "SupervisorAssessment_Vault";
const DATA_FOLDER_NAME = "Data";

/**
 * 구글 드라이브 내 Data 폴더 생성 또는 가져오기
 */
function getOrCreateDataFolder_() {
  var rootIterator = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
  var rootFolder;

  if (rootIterator.hasNext()) {
    rootFolder = rootIterator.next();
  } else {
    rootFolder = DriveApp.createFolder(ROOT_FOLDER_NAME);
  }

  var dataIterator = rootFolder.getFoldersByName(DATA_FOLDER_NAME);
  var dataFolder;

  if (dataIterator.hasNext()) {
    dataFolder = dataIterator.next();
  } else {
    dataFolder = rootFolder.createFolder(DATA_FOLDER_NAME);
  }

  return dataFolder;
}

/**
 * Base64 서명 이미지를 Data 폴더에 PNG 파일로 저장 후 보기 URL 반환
 */
function saveSignatureImage_(siteName, supervisorName, base64DataUrl) {
  if (!base64DataUrl || base64DataUrl.indexOf('data:image') === -1) {
    return "";
  }

  var folder = getOrCreateDataFolder_();
  var base64Str = base64DataUrl.split(',')[1];
  var decoded = Utilities.base64Decode(base64Str);
  var dateStr = Utilities.formatDate(new Date(), 'GMT+9', 'yyyyMMdd_HHmmss');
  var fileName = siteName + '_' + supervisorName + '_' + dateStr + '_서명.png';

  var blob = Utilities.newBlob(decoded, 'image/png', fileName);
  var file = folder.createFile(blob);

  // 파일 공유 권한 설정 (링크 가진 사용자 열람 가능)
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return file.getUrl();
}
