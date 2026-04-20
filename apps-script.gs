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
const MAX_CAPACITY = 4;

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
    const currentCount = Math.max(0, sheet.getLastRow() - 1);

    if (currentCount >= MAX_CAPACITY) {
      return jsonResponse({
        status: 'full',
        message: '報名已額滿',
        total: currentCount,
        capacity: MAX_CAPACITY
      });
    }

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

    return jsonResponse({
      status: 'success',
      message: '報名成功！',
      total: currentCount + 1,
      capacity: MAX_CAPACITY
    });
  } catch (err) {
    return jsonResponse({ status: 'error', message: String(err) });
  } finally {
    lock.releaseLock();
  }
}

/**
 * 讓部署後能以 GET 測試是否正常回應
 * 另支援 ?action=list 回傳所有報名資料，供 dashboard.html 讀取
 */
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || '';
  if (action === 'list') {
    return getRegistrationsResponse();
  }
  return jsonResponse({
    status: 'ok',
    message: '教學訓練計畫主持人工作坊報名 API 正常運作中 🎉'
  });
}

/**
 * 讀取整個分頁資料，回傳 JSON 供 dashboard 使用
 */
function getRegistrationsResponse() {
  const sheet = getOrCreateSheet();
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();

  if (lastRow < 2) {
    return jsonResponse({
      status: 'success',
      headers: HEADERS,
      rows: [],
      total: 0,
      capacity: MAX_CAPACITY,
      remaining: MAX_CAPACITY,
      full: false
    });
  }

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0];
  const rows = values.slice(1)
    .filter(r => r.some(c => c !== '' && c !== null))
    .map(r => {
      const obj = {};
      headers.forEach((h, i) => {
        const v = r[i];
        obj[h] = v instanceof Date ? v.toISOString() : v;
      });
      return obj;
    });

  return jsonResponse({
    status: 'success',
    headers: headers,
    rows: rows,
    total: rows.length,
    capacity: MAX_CAPACITY,
    remaining: Math.max(0, MAX_CAPACITY - rows.length),
    full: rows.length >= MAX_CAPACITY
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
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      // 非 JSON 內容則回退到 form parameters
    }
  }
  return e.parameter || {};
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
