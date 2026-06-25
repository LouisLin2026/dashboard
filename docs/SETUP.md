# SETUP.md
# 宜蘭廠區工作控管系統 v11.4 — 完整部署指南
# Version: v1.0 | Sprint: V11.4 | Date: 2026-06-25

---

## 必要環境

| 項目 | 規格 | 備註 |
|---|---|---|
| 瀏覽器 | Chrome 100+ / Safari 16+ / Edge 100+ | 需支援 `crypto.subtle` |
| Firebase 帳號 | Google Account | 免費 Spark Plan 即可 |
| GitHub 帳號 | 任意 | 用於 GitHub Pages 靜態部署 |
| Microsoft 365 | Business Basic 以上 | Power Automate + Outlook |
| Power Automate | Premium（含 HTTP connector） | HTTP connector 需 Premium Plan |

---

## Part 1：Firebase RTDB 設定

### 1.1 建立 Firebase 專案

若你已有 `evaluation-survey-form` 專案，跳至 1.3。

1. 前往 [Firebase Console](https://console.firebase.google.com/)
2. 點擊「新增專案」→ 輸入專案名稱 `evaluation-survey-form`
3. 停用 Google Analytics（不需要）→ 建立專案

### 1.2 啟用 Realtime Database

1. 左側選單 → Build → Realtime Database
2. 點擊「建立資料庫」
3. 選擇「在測試模式下啟動」（之後再設定 Rules）
4. 選擇資料庫位置：`asia-east1`（台灣最近）
5. 完成後取得 URL：`https://evaluation-survey-form-default-rtdb.firebaseio.com`

### 1.3 設定 Security Rules

進入 Firebase Console → Realtime Database → Rules，貼入以下設定：

```json
{
  "rules": {
    "yilan": {
      ".read": true,
      ".write": true,
      "inbox": {
        ".indexOn": ["dedupeKey", "status", "source", "receivedAt"]
      },
      "tasks": {
        ".indexOn": ["status", "deptId"]
      }
    }
  }
}
```

⚠️ **注意**：以上規則為開發版（`true` 對所有人開放）。
上線前請改為：

```json
{
  "rules": {
    "yilan": {
      ".read": "auth != null",
      ".write": "auth != null",
      "inbox": {
        ".indexOn": ["dedupeKey", "status", "source"]
      }
    }
  }
}
```

### 1.4 正式環境部署規範（WO-105 修訂）

> ⚠️ **禁止使用 Firebase Import JSON 功能**
> Import JSON 會**覆蓋同路徑下所有資料**，在正式環境中使用有毀損既有資料的風險。

**正式環境只允許以下三種操作**：

| 操作 | 方法 | 用途 |
|---|---|---|
| Migration | PUT 新增不存在的節點 | 建立 /yilan/inbox |
| Append | PUT 新增個別紀錄 | 新增事件/Task/Risk |
| Patch | PATCH 更新部分欄位 | 更新狀態/審核 |

**建立 /yilan/inbox 的正確方式**：
登入 YPOS PWA（管理者） → 系統自動執行 `_runMigration()`
- 若節點不存在 → 自動建立 `_meta` 初始標記
- 若節點已存在 → 靜默跳過，零副作用

詳見 `FIRST_RUN.md` 與 `DEPLOY_V11.4.md`。

---

## Part 2：GitHub Pages 部署

### 2.1 建立 Repository

1. 前往 [GitHub](https://github.com/) → New Repository
2. Repository name：`ypos`（或任意名稱）
3. Visibility：Public（GitHub Pages 免費版需要 Public）
4. 初始化：勾選 Add README

### 2.2 上傳 HTML 檔案

```bash
git clone https://github.com/{你的帳號}/ypos.git
cd ypos

# 複製 HTML 檔案
cp 宜蘭廠區工作控管_全整合版_v11_4.html index.html

git add index.html
git commit -m "Deploy YPOS v11.4"
git push origin main
```

### 2.3 啟用 GitHub Pages

1. Repository → Settings → Pages
2. Source：Deploy from a branch
3. Branch：`main` → 目錄：`/ (root)`
4. Save

完成後 URL：`https://{你的帳號}.github.io/ypos/`

### 2.4 驗證部署

開啟 URL → 應看到登入畫面 → 以「Louis」（管理者）登入 → 確認「收件匣」分頁出現。

---

## Part 3：Power Automate 設定（Outlook → Firebase）

### 3.1 前置作業

**在 Outlook 建立子資料夾**（建議）：
1. Outlook → 右鍵「收件匣」→ 新增子資料夾
2. 命名：`BFY-廠務`
3. 建立規則：寄件人包含 `@tna.com` 或 `@raypak.com` 等廠商域名 → 移至此資料夾

### 3.2 建立 Power Automate Flow

1. 前往 [Power Automate](https://make.powerautomate.com/)
2. 建立 → Automated cloud flow
3. 選擇觸發器：「Office 365 Outlook — When a new email arrives (V3)」
4. 設定信箱資料夾：`BFY-廠務`（或 Inbox）

### 3.3 新增 Variables（步驟依序）

**Compose 1 — 計算 EventId**
```
Action: Data Operation → Compose
Name: Compose_EventId
Inputs: @{concat('EVT-', formatDateTime(triggerOutputs()?['body/receivedDateTime'],'yyyyMMdd'), '-', toUpper(substring(triggerOutputs()?['body/id'],sub(length(triggerOutputs()?['body/id']),8),8)))}
```

**Compose 2 — 清理 rawText**
```
Action: Data Operation → Compose
Name: Compose_RawText
Inputs: @{concat(triggerOutputs()?['body/subject'], '\n\n', substring(body('Get_Email_Body'),0,min(length(body('Get_Email_Body')),400)))}
```
（先用 Get Email (V2) action 取得純文字版本）

### 3.4 新增 Dedup 檢查

**Action: HTTP**
```
Name: Check_Dedup
Method: GET
URI: https://evaluation-survey-form-default-rtdb.firebaseio.com/yilan/inbox.json?orderBy="dedupeKey"&equalTo="@{triggerOutputs()?['body/id']}"&limitToFirst=1
Headers: Content-Type: application/json
```

**Action: Condition**
```
Name: Is_Duplicate
Condition: body('Check_Dedup') is equal to null
  YES → Continue to next step
  NO  → Terminate (Status: Succeeded, Comment: Duplicate email skipped)
```

### 3.5 新增 Firebase 寫入

**Action: HTTP**
```
Name: Write_To_Firebase
Method: PUT
URI: https://evaluation-survey-form-default-rtdb.firebaseio.com/yilan/inbox/@{outputs('Compose_EventId')}.json
Headers: Content-Type: application/json
Body:
{
  "eventId":        "@{outputs('Compose_EventId')}",
  "source":         "outlook",
  "dedupeKey":      "@{triggerOutputs()?['body/id']}",
  "rawText":        "@{outputs('Compose_RawText')}",
  "receivedAt":     "@{triggerOutputs()?['body/receivedDateTime']}",
  "status":         "pending",
  "lifecycle":      "received",
  "retryCount":     0,
  "eventHash":      "",
  "revision":       1,
  "suggestedTitle": "@{triggerOutputs()?['body/subject']}",
  "suggestedType":  [],
  "matchStrength":  "low",
  "supplier":       "",
  "equipment":      "",
  "derivedIds":     {"tasks":[],"risks":[],"decisions":[],"schedule":[]},
  "audit":          {"createdBy":"Copilot-Outlook","approvedBy":"","approvedAt":""}
}
```

### 3.6 啟用並測試

1. Flow 右上角 → Save
2. 點擊「Turn on」啟用
3. 寄一封測試郵件到監聽信箱（主旨含 "TNA" 或 "Robag"）
4. 等待 1～5 分鐘（Flow 輪詢間隔）
5. 開啟 YPOS PWA → 管理者登入 → 收件匣 → 確認 pending 事件出現

---

## Part 4：常見問題（FAQ）

**Q：Power Automate 寫入 Firebase 失敗，HTTP 回傳 401**
A：Firebase RTDB rules 設定為需要驗證，改為 `".write": true` 先測試，之後加入 Firebase Auth。

**Q：dedup 查詢回傳 Permission denied**
A：需在 Firebase Rules 加入 `.indexOn: ["dedupeKey"]`（見 1.3）。

**Q：收件匣顯示「沒有待審核事件」但 Firebase 有資料**
A：確認 Firebase 路徑：資料應在 `/yilan/inbox/`，不是 `/inbox/`。

**Q：手機上 eventHash 顯示 `NOHASH:...`**
A：`window.crypto.subtle` 需要 HTTPS。確認使用 GitHub Pages（https），不是 `file://` 本地開啟。

**Q：Power Automate HTTP connector 顯示需要 Premium**
A：HTTP connector 確實需要 Power Automate Premium（約 USD 15/月/使用者）。
替代方案：使用 Azure Logic Apps（按使用量計費，少量呼叫約 USD 1～3/月）。

---

## 版本紀錄

| 版本 | 日期 | 說明 |
|---|---|---|
| v1.0 | 2026-06-25 | 初版，覆蓋 Firebase / GitHub Pages / Power Automate |
