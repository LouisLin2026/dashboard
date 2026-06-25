DEMO_V11.5.md — Register Center 操作手冊
WO-107 Rev.A | 2026-06-25
---
前置條件
YPOS v11.5 已部署至 GitHub Pages
已有 Inbox 事件並完成至少一次 Approval（建立 Task / Risk）
管理者（Louis）身份登入
---
Demo 流程（5 分鐘）
Step 1：登入觸發自動 Migration
開啟 YPOS PWA → 以「Louis」登入
觀察 Console：`[MigrateRegisters] Created: yilan/risks`（若首次部署）
Firebase Console 確認：`yilan/risks/_meta`、`yilan/decisions/_meta`、`yilan/schedule/_meta` 存在
---
Step 2：開啟 Register Center
點擊 nav「📋 Register」
預期結果：
頁面標題：「📋 Register Center — PMO Daily Working Portal」
四張 Summary Cards：Task / Risk / Decision / Schedule
預設 Tab：Task
---
Step 3：查看 PMO Summary Cards
Card	說明
Task 總計	等於 /yilan/tasks 下的任務數量
Risk 待處理	等於 status=Open 的風險數量（橘色顯示若 >0）
Task 逾期	截止日 < 今天且狀態非完成（橘色顯示若 >0）
本週新增	近 7 天 createdAt 的筆數
點擊 Risk Card → 自動切換至 Risk Register Tab。
---
Step 4：Risk Register
點擊「⚠️ Risk」Tab
確認每筆 Risk 顯示：
嚴重度 badge（緊急/高/中/低）
狀態 badge（Open 紅色 / Closed 藍色）
供應商 🏭 / 設備 ⚙️ 標籤
P: / I: 機率/衝擊
建立日期
---
Step 5：搜尋功能
在搜尋框輸入「TNA」
預期結果：只顯示 supplier="TNA" 的 Risk 紀錄
清除搜尋 → 所有紀錄恢復顯示
---
Step 6：排序功能
在 Risk Tab 下，排序下拉選擇「嚴重度 ↓」
預期結果：「緊急」> 「高」> 「中」> 「低」排序
---
Step 7：Traceability — 跳回 Inbox
在 Risk Register 找到含 `↗ 來源` 按鈕的紀錄
點擊「↗ 來源」
預期結果：
自動切換至收件匣
Toast：「已切換至收件匣：EVT-xxxxx」
顯示該 Event 所在的 Tab（approved）
---
Step 8：Decision / Schedule Register
切換至「🏛️ Decision」Tab → 顯示「Decision 尚無資料」（若無核准的 Decision）
切換至「📅 Schedule」Tab → 顯示「Schedule 尚無資料」
---
PMO Acceptance Checklist
#	項目	預期	結果
R-01	📋 Register nav 按鈕出現	管理者登入後顯示	⬜
R-02	四張 Summary Cards 顯示	Task/Risk/Decision/Schedule 各一張	⬜
R-03	Summary Card 數字正確	與 Firebase 資料一致	⬜
R-04	點擊 Card 切換 Tab	點擊 Risk Card → Risk Tab	⬜
R-05	Task Register 載入	顯示 /yilan/tasks 任務	⬜
R-06	Risk Register 載入	顯示 /yilan/risks 風險	⬜
R-07	Decision Register	顯示資料或「尚無資料」	⬜
R-08	Schedule Register	顯示資料或「尚無資料」	⬜
R-09	搜尋功能	即時過濾結果	⬜
R-10	排序（日期↓/↑、標題、嚴重度）	順序正確	⬜
R-11	Risk 嚴重度 badge 顏色	緊急=紅/高=橘/中=藍/低=青	⬜
R-12	Traceability ↗ 來源 按鈕	有 sourceEventId 的紀錄顯示	⬜
R-13	jumpToInboxEvent 跳轉	切換至 Inbox 正確 Tab	⬜
R-14	Firebase risks/_meta 存在	Migration 自動建立	⬜
R-15	Firebase decisions/_meta 存在	Migration 自動建立	⬜
R-16	Firebase schedule/_meta 存在	Migration 自動建立	⬜
R-17	零回歸：看板正常	Board tab 功能不受影響	⬜
R-18	零回歸：Inbox 正常	Approval flow 不受影響	⬜
R-19	零回歸：Meeting Import 正常	匯入功能不受影響	⬜
R-20	零回歸：Console 無紅色 Error	F12 → Console 查看	⬜
通過標準：R-01 ~ R-20 全數 ✅ → v11.5 Release
---
Open Items
OI	說明	Sprint
OI-001	Schedule Register 與 Inbox fan-out 的 schedule 資料路徑對齊	V11.6
OI-002	Register 資料即時更新（Inbox 核准後不需重新整理）	V11.6
OI-003	Risk 到期日欄位（目前無）	V11.6
