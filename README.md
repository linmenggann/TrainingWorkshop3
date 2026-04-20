# TrainingWorkshop3

教學訓練計畫主持人工作坊 — 活動資訊視覺化網頁與線上報名系統

## 📂 檔案說明

| 檔案 | 用途 |
| --- | --- |
| `index.html` | 活動資訊與報名表單網頁（紫色漸層 + 活潑 emoji 風格） |
| `dashboard.html` | 報名現況儀表板（KPI、職類分布、參與方式圓環、最新名單，每 30 秒自動更新） |
| `apps-script.gs` | Google Apps Script 後端：`doPost` 寫入報名、`doGet?action=list` 提供 dashboard 資料 |
| `教學訓練計畫主持人工作坊.docx` | 原始活動企劃文件 |

## 📝 Google Sheets 表頭設定

試算表：<https://docs.google.com/spreadsheets/d/17oIoMn_V45j5-vHfIm0GioNcfvtXDktEpNtpLmM8fFo/edit>
分頁名稱：**工作坊報名資料**

請在第 1 列依序填入以下表頭（或執行 Apps Script 中的 `setupHeaders()` 自動建立）：

| A | B | C | D | E | F | G | H | I |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 時間戳記 | 姓名 | 機構名 | 職稱 | 負責的職類 | 是否擔任教學訓練計畫主持人 | 參與方式 | Email | 聯繫電話 |

## 🚀 部署步驟

### 1. 建立 Apps Script

1. 開啟 Google 試算表 → **擴充功能** → **Apps Script**
2. 將 `apps-script.gs` 內容貼入，儲存
3. 於編輯器上方選擇函式 `setupHeaders` 並點選「執行」，完成表頭與樣式初始化（需授權）

### 2. 部署為 Web App

1. Apps Script 右上角點選 **部署** → **新增部署作業**
2. 類型：**網頁應用程式**
3. 執行身分：**我**
4. 誰可以存取：**所有人**
5. 按下「部署」並複製顯示的 **Web App URL**

### 3. 連結前端網頁

編輯 `index.html`，將 `APPS_SCRIPT_URL` 的值替換為你剛複製的 Web App URL：

```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/你的部署ID/exec';
```

完成後開啟 `index.html`，填寫表單送出即會自動寫入試算表 🎉

## 🔁 更新 Apps Script 後

若修改了 `apps-script.gs`，記得於 Apps Script 編輯器中 **部署 → 管理部署作業 → 編輯 → 新版本** 以套用變更（同一個 Web App URL 會繼續有效）。
