# RELEASE_CHECKLIST.md — YPOS v11.5 RC1
# WO-107 Rev.A | 2026-06-25

## Build
- [ ] node --check: SYNTAX OK (131,473 chars JS)
- [ ] HTML 行數: 3,046 (v11.4=2,781, 增量+265)

## Register Center
- [ ] 📋 Register nav 按鈕（管理者登入後顯示）
- [ ] PMO Summary 4 Cards（Task/Risk/Decision/Schedule）數字正確
- [ ] Task Register 顯示 /yilan/tasks 資料
- [ ] Risk Register 顯示嚴重度 badge 與供應商/設備
- [ ] Decision Register 顯示資料或「尚無資料」
- [ ] Schedule Register 顯示資料或「尚無資料」

## 搜尋/排序
- [ ] 搜尋即時過濾
- [ ] 日期排序 ↓↑ 正確
- [ ] Risk 嚴重度排序正確

## Traceability
- [ ] ↗ 來源 按鈕出現在有 sourceEventId 的紀錄
- [ ] 點擊跳回 Inbox 正確 Tab

## Migration（Idempotent）
- [ ] /yilan/risks/_meta 存在
- [ ] /yilan/decisions/_meta 存在
- [ ] /yilan/schedule/_meta 存在
- [ ] 重複登入無副作用

## Zero Regression
- [ ] 看板正常
- [ ] Inbox / Approval 正常
- [ ] Meeting Import 正常
- [ ] Console 無紅色 Error

## Final Status
□ PASS  □ FAIL
執行人：_______  日期：_______  PMO：_______
