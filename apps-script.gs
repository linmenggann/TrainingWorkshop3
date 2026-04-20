/**
 * 教學訓練計畫主持人工作坊 - 線上報名 Google Apps Script
 * ------------------------------------------------------------
 * 功能：接收 index.html 報名表單送出的資料，寫入 Google Sheets
 *
 * 綁定試算表：
 *   https://docs.google.com/spreadsheets/d/17oIoMn_V45j5-vHfIm0GioNcfvtXDktEpNtpLmM8fFo/edit
 * 分頁名稱：工作坊報名資料
 *
 * 部署方式：
 *   1. 開啟上方試算表 → 擴充功能 → Apps Script
 *   2. 將本檔案內容貼入，儲存
 *   3. 點選「部署」→「新增部署作業」→ 類型選「網頁應用程式」
 *   4. 執行身分：我；誰可以存取：所有人
 *   5. 複製部署後的「Web App URL」，貼回 index.html 的 APPS_SCRIPT_URL 常數
 */

const SPREADSHEET_ID = '17oIoMn_V45j5-vHfIm0GioNcfvtXDktEpNtpLmM8fFo';
const SHEET_NAME = '工作坊報名資料';

const HEADERS = [
  '時間戳記',
  '姓名',
  '機構名',
  '職稱',
  '負責的職類',
  '是否擔任教學訓練計畫主持人',
  '參與方式',
  'Email',
  '聯繫電話'
];

/**
 * 接收 POST 請求，將報名資料寫入試算表
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);

  try {
    const sheet = getOrCreateSheet();
    const data = parseIncomingData(e);

    const row = [
      new Date(),
      data.name || '',
      data.org || '',
      data.title || '',
      data.profession || '',
      data.isHost || '',
      data.mode || '',
      data.email || '',
      data.phone || ''
    ];

    sheet.appendRow(row);

    return jsonResponse({ status: 'success', message: '報名成功！' });
  } catch (err) {
    return jsonResponse({ status: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * 讓部署後能以 GET 測試是否正常回應
 */
function doGet() {
  return jsonResponse({
    status: 'ok',
    message: '教學訓練計畫主持人工作坊報名 API 正常運作中 🎉'
  });
}

/**
 * 初始化：手動執行一次以建立表頭
 */
function setupHeaders() {
  const sheet = getOrCreateSheet();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#6a11cb')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, HEADERS.length);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function parseIncomingData(e) {
  if (!e) return {};
  if (e.postData && e.postData.contents) {
    const type = e.postData.type || '';
    if (type.indexOf('application/json') !== -1) {
      try { return JSON.parse(e.postData.contents); } catch (err) { /* fallthrough */ }
    }
  }
  return e.parameter || {};
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
