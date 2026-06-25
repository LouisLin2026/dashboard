/**
 * migrate_inbox.js — 宜蘭廠區工作控管系統 v11.4
 * WO-105 Rev.A | 2026-06-25
 *
 * 用途：在瀏覽器開發工具 Console 中貼入並執行，
 *       自動建立 Firebase /yilan/inbox 節點（若不存在）。
 *
 * 使用方式：
 *   1. 開啟 YPOS PWA（已登入狀態）
 *   2. F12 → Console
 *   3. 將此檔案全文貼入 → Enter
 *
 * 安全保證：
 *   - 若 /yilan/inbox 已存在，完全不執行任何寫入。
 *   - 只建立 _meta 初始標記，不觸碰其他節點。
 *   - Idempotent：重複執行零副作用。
 *
 * Rollback：
 *   - 執行 rollback_inbox() 函數（條件：inbox 只含 _meta）
 */

(async function YPOS_MigrateInbox() {

  /* ── 0. 取得 Firebase Base URL ── */
  const FB_URL = (typeof FB !== 'undefined')
    ? FB
    : 'https://evaluation-survey-form-default-rtdb.firebaseio.com';

  const INBOX_PATH = 'yilan/inbox';

  async function _get(path) {
    const r = await fetch(`${FB_URL}/${path}.json`);
    if (!r.ok) throw new Error(`GET ${path} failed: ${r.status}`);
    return r.json();
  }

  async function _put(path, value) {
    const r = await fetch(`${FB_URL}/${path}.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value)
    });
    if (!r.ok) throw new Error(`PUT ${path} failed: ${r.status}`);
    return r.json();
  }

  async function _delete(path) {
    const r = await fetch(`${FB_URL}/${path}.json`, { method: 'DELETE' });
    if (!r.ok) throw new Error(`DELETE ${path} failed: ${r.status}`);
    return true;
  }

  /* ── 1. Migration ── */
  async function migrate() {
    console.group('🚀 YPOS Inbox Migration v11.4');
    console.log('Firebase URL:', FB_URL);
    console.log('Target path:', INBOX_PATH);

    // Step 1: Check existing
    console.log('📡 Step 1: Checking existing node...');
    const existing = await _get(INBOX_PATH);

    if (existing !== null) {
      const keys = Object.keys(existing);
      console.log(`✅ /yilan/inbox already exists (${keys.length} keys: ${keys.slice(0,5).join(', ')})`);
      console.log('ℹ️  Migration not needed. No changes made.');
      console.groupEnd();
      return { status: 'already_exists', keys };
    }

    // Step 2: Create _meta marker
    console.log('📦 Step 2: Creating /yilan/inbox/_meta...');
    const meta = {
      initialized: true,
      version: 'v11.4',
      migratedAt: new Date().toISOString(),
      migratedBy: (typeof S !== 'undefined' && S.me) ? S.me : 'console-migration'
    };
    await _put(INBOX_PATH + '/_meta', meta);

    // Step 3: Verify
    console.log('🔍 Step 3: Verifying...');
    const verify = await _get(INBOX_PATH + '/_meta');
    if (!verify || !verify.initialized) {
      throw new Error('Verification failed: _meta not found after PUT');
    }

    console.log('✅ Migration successful!');
    console.log('   Created: /yilan/inbox/_meta', verify);
    console.log('');
    console.log('📋 Next steps:');
    console.log('   1. Refresh YPOS PWA and open 📬 收件匣');
    console.log('   2. Click "+ 手動新增" to add a test event');
    console.log('   3. Approve the event and verify Task is created');
    console.groupEnd();

    return { status: 'migrated', meta: verify };
  }

  /* ── 2. Rollback（條件執行） ── */
  window.rollback_inbox = async function() {
    console.group('⏪ YPOS Inbox Rollback');
    const existing = await _get(INBOX_PATH);

    if (existing === null) {
      console.log('ℹ️  /yilan/inbox does not exist. Nothing to rollback.');
      console.groupEnd();
      return { status: 'not_exists' };
    }

    const keys = Object.keys(existing);
    const realEvents = keys.filter(k => k.startsWith('EVT-'));

    if (realEvents.length > 0) {
      console.error(`❌ Rollback ABORTED: inbox contains ${realEvents.length} real event(s).`);
      console.error('   Real events found:', realEvents);
      console.error('   To preserve data integrity, rollback is only safe when inbox has no events.');
      console.groupEnd();
      return { status: 'aborted', reason: 'has_real_events', count: realEvents.length };
    }

    // Only _meta exists (and possibly other non-EVT keys) — safe to delete
    console.log(`⚠️  Deleting /yilan/inbox (keys: ${keys.join(', ')})...`);
    await _delete(INBOX_PATH);

    const verify = await _get(INBOX_PATH);
    if (verify !== null) {
      throw new Error('Rollback verification failed: node still exists');
    }

    console.log('✅ Rollback successful. /yilan/inbox deleted.');
    console.groupEnd();
    return { status: 'rolled_back' };
  };

  /* ── 3. Verification helper ── */
  window.verify_inbox = async function() {
    console.group('🔍 YPOS Inbox Verification');
    const node = await _get(INBOX_PATH);

    if (node === null) {
      console.warn('⚠️  /yilan/inbox does NOT exist. Run migration first.');
      console.groupEnd();
      return { exists: false };
    }

    const keys = Object.keys(node);
    const events = keys.filter(k => k.startsWith('EVT-'));
    const pending = events.filter(k => node[k]?.status === 'pending').length;
    const approved = events.filter(k => node[k]?.status === 'approved').length;
    const skipped = events.filter(k => node[k]?.status === 'skipped').length;

    console.log('✅ /yilan/inbox EXISTS');
    console.log(`   Total keys   : ${keys.length}`);
    console.log(`   Real events  : ${events.length}`);
    console.log(`   Pending      : ${pending}`);
    console.log(`   Approved     : ${approved}`);
    console.log(`   Skipped      : ${skipped}`);
    if (node._meta) console.log(`   Migration at : ${node._meta.migratedAt}`);
    console.groupEnd();

    return { exists: true, total: keys.length, events: events.length, pending, approved, skipped };
  };

  // Run migration
  try {
    const result = await migrate();
    window._migrationResult = result;
    console.log('\n💡 Helper functions available:');
    console.log('   verify_inbox()   — 驗證 inbox 狀態');
    console.log('   rollback_inbox() — 還原（僅在無真實事件時可用）');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    window._migrationResult = { status: 'error', error: err.message };
  }

})();
