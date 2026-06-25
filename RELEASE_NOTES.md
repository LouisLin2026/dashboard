# RELEASE_NOTES.md — YPOS v11.5
# WO-107 Rev.A | 2026-06-25

---

## Release Information

| 項目 | 內容 |
|---|---|
| Version | v11.5 |
| WO Number | WO-107 Rev.A |
| Sprint | Register Center |
| Status | RC1 — 待 PMO 驗收 |

---

## Summary

建立 Register Center 作為 PMO 每日工作入口。所有由 Event Approval 衍生的 Task / Risk / Decision / Schedule 紀錄，均可在 Register Center 統一查看、搜尋、篩選、排序，並透過 Traceability 一鍵回溯來源 Inbox Event。

---

## Added

- `📋 Register` 導航按鈕（管理者限定）
- `renderRegister()` — Register Center 主頁面
- `_migrateRegisters()` — 登入時自動建立 `/yilan/risks`、`/yilan/decisions`、`/yilan/schedule` 節點（Idempotent）
- `loadRegister()` — 載入三個 Register 資料（首次載入後快取）
- PMO Summary Cards — Task / Risk / Decision / Schedule 四張統計卡（總計 / 待處理 / 本週新增 / 逾期）
- `_renderTaskReg()` — Task Register（搜尋 / 排序 / 逾期標示 / Traceability）
- `_renderRiskReg()` — Risk Register（嚴重度 / 狀態 / 供應商 / 設備 / Traceability）
- `_renderDecisionReg()` — Decision Register（狀態 / 決策者 / Traceability）
- `_renderScheduleReg()` — Schedule Register（備註 / Traceability）
- `jumpToInboxEvent()` — 從 Register 一鍵跳回來源 Inbox Event
- `_riskSev()` — Risk 嚴重度計算（緊急/高/中/低）
- `_regStats()` — Register 統計計算
- `_regApply()` — 搜尋 + 排序邏輯
- `_srcLink()` — Traceability 來源事件連結
- `_isThisWeek()` — 本週判斷輔助函數
- State: `registerTab`, `registerSearch`, `registerSort`, `risks`, `decisions`, `schedule`, `_registerLoaded`
- Firebase 路徑: `P_SCHEDULE = 'yilan/schedule'`

## Changed

- `swTab()` / `renderTab()` — 新增 'register' 分支
- `_doLogin()` — 新增 `_migrateRegisters()` 呼叫
- 管理者 nav tabs — 新增 'register'

## Fixed

無

## Known Limitations

| # | 限制 | 影響 | 預計解決 |
|---|---|---|---|
| KL-001 | Schedule Register 顯示 /yilan/schedule（目前為空），Inbox fan-out 的 Schedule 備註仍寫入 /yilan/meta/scheduleNotes | Schedule Register 暫無資料 | V11.6 |
| KL-002 | Risk 無到期日，「逾期」欄位恆為 0 | 統計不完整 | V11.6 |
| KL-003 | Register 資料首次登入後快取，同一 Session 中 Inbox 新核准的紀錄需重新整理 Register 才顯示 | 輕微延遲 | V11.6（即時更新） |

## Rollback

回退至 v11.4 RC2 HTML 即可。Firebase /yilan/risks、/yilan/decisions、/yilan/schedule 節點保留不影響舊版功能。
