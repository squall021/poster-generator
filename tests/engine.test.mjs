import test from 'node:test';
import assert from 'node:assert/strict';
import { defaults, clean, generate, sizeLabel, styles, layouts, NOTICE_FOOTER, getNotice, noticeText, validate,
  formatDate, validDate, scheduleCopy, feeCopy, migrateDocument, exportDocument, NOTICE_VERSION } from '../engine.mjs';
import { styleSketch, layoutSketch } from '../design.mjs';

const self = { ...defaults, courseType: 'self', title: '測試課程' };
const subsidy = { ...self, courseType: 'subsidized', planYear: '115' };
const required = '年滿15歲以上，具就業保險、勞工保險、勞工職業災害保險或農民健康保險被保險人身份之在職勞工均可報名上課，一般身份政府補助80%訓練費，中低收入戶、原住民、身心障礙者、45歲以上中高齡者、獨力負擔家計者...等特定對象全額補助。';

test('background omits exact contact and price copy and rejects fake QR codes', () => {
  const p = generate({ ...self, mode: 'background', title: '美甲課程', phone: '02-8765-4321', fee: '限定費用XYZ', qr: true });
  assert.ok(p.includes('不生成任何文字')); assert.ok(!p.includes('02-8765-4321'));
  assert.ok(!p.includes('限定費用XYZ')); assert.ok(p.includes('不生成假的 QR code'));
});
test('full poster preserves exact text and punctuation', () => {
  const p = generate({ ...self, date: '115/11/15 09:00–16:00', code: 'N-001', fee: '3,000 元' });
  assert.ok(p.includes('日期與時間："115/11/15 09:00–16:00"'));
  assert.ok(p.includes('課程代碼："N-001"')); assert.ok(p.includes('費用與補助："3,000 元"')); assert.ok(!p.includes('聯絡電話：'));
});
test('edit ignores unrelated style, size and layout', () => {
  const p = generate({ ...self, mode: 'edit', changes: '移除左上角 TNL', preserve: '背景與其他文字', layout: 'split', style: 'salon', size: 'A1' });
  assert.ok(p.includes('移除左上角 TNL')); assert.ok(p.includes('背景與其他文字')); assert.ok(p.includes('原始海報'));
  assert.ok(!p.includes('55%')); assert.ok(!p.includes('沙龍')); assert.ok(!p.includes('A1'));
});
test('sizes reflect orientation including actual paper dimensions', () => {
  assert.ok(sizeLabel({ ...self, size: 'square', orientation: 'landscape' }).includes('1:1'));
  assert.ok(sizeLabel({ ...self, size: 'story', orientation: 'landscape' }).includes('直式9:16'));
  assert.ok(sizeLabel({ ...self, orientation: 'landscape' }).includes('297 × 210'));
  assert.ok(sizeLabel({ ...self, size: 'ratio34', orientation: 'landscape' }).includes('4:3'));
});
test('sanitization validates enums, prototype names, strings and structured rows', () => {
  const d = clean({ mode: 'bogus', style: 'constructor', layout: '__proto__', main: 'url(x)', logo: 'yes', title: 'X'.repeat(20000), days: [null, 'x', { date: 123, topic: '主題', extra: 'drop' }], weekdays: [2, 2, 9, '3'] });
  assert.equal(d.mode, defaults.mode); assert.equal(d.main, defaults.main); assert.equal(d.logo, true); assert.equal(d.title.length, 10000);
  assert.ok(styles[d.style]); assert.ok(layouts[d.layout]); assert.deepEqual(d.days, [{ date: '', topic: '主題', topics: '', visual: '' }]); assert.deepEqual(d.weekdays, [2]);
});
test('all valid course/mode/style/layout combinations generate without placeholders', () => {
  for (const courseType of ['self', 'subsidized']) for (const mode of ['full', 'background', 'edit']) for (const style of Object.keys(styles)) for (const layout of Object.keys(layouts)) {
    const p = generate({ ...self, courseType, planYear: '116', changes: '修改日期', mode, style, layout });
    assert.ok(!p.includes('undefined')); assert.ok(!p.includes('XXX')); assert.ok(p.length > 50);
  }
});
test('required notice remains verbatim and has exact positions', () => {
  assert.equal(NOTICE_FOOTER, required);
  const p = generate(subsidy);
  assert.ok(p.includes('海報左上角："廣告"')); assert.ok(p.includes('海報右上角："115年下半年勞動部勞動力發展署-產業人才投資計畫補助課程"'));
  assert.ok(p.includes(`海報正下方："${required}"`)); assert.ok(p.includes('先保留獨立頂部註記列'));
});
test('year changes immediately update output while preserving design additions', () => {
  const original = { ...subsidy, extra: '背景更簡潔' };
  const p = generate({ ...original, planYear: '116', title: '新的課程' });
  assert.ok(p.includes('116年下半年')); assert.ok(!p.includes('115年下半年')); assert.ok(p.includes('背景更簡潔')); assert.ok(p.includes('新的課程'));
});
test('unselected course, missing year and placeholder years cannot produce final output', () => {
  for (const planYear of ['', 'XXX', '115年', '0', '-115', '1.15']) assert.equal(generate({ ...subsidy, planYear }), '');
  assert.equal(generate({ ...self, courseType: '' }), ''); assert.equal(getNotice({ ...subsidy, planYear: '' }), null);
});
test('switching to self excludes stored subsidy data and includes removal instructions', () => {
  const d = { ...subsidy, courseType: 'self', totalFee: '10000', grantFee: '8000', ownFee: '2000', sponsor: '測試補助單位', selfFee: '3000' };
  const p = generate(d);
  assert.ok(!p.includes(required)); assert.ok(!p.includes('115年下半年')); assert.ok(!p.includes('8000')); assert.ok(!p.includes('測試補助單位'));
  assert.ok(p.includes('課程費用："3000 元"')); assert.ok(p.includes('不加入左上角廣告註記')); assert.equal(noticeText(d), '');
});
test('background reserves notice areas without asking AI to draw the footer', () => {
  const d = { ...subsidy, mode: 'background' }, p = generate(d);
  assert.ok(p.includes('頂部預留')); assert.ok(p.includes('正下方預留')); assert.ok(!p.includes(required));
  assert.ok(!p.includes('115年下半年')); assert.ok(noticeText(d).includes(required));
});
test('edit replaces old notice year and permits instructions to remove old subsidies', () => {
  const p = generate({ ...subsidy, mode: 'edit', changes: '更新年度', preserve: '保留原圖文字' });
  assert.ok(p.includes(required)); assert.ok(p.includes('此要求優先'));
  const selfEdit = generate({ ...self, mode: 'edit', changes: '移除政府補助標語', preserve: '其餘文字' });
  assert.ok(selfEdit.includes('移除政府補助標語')); assert.ok(selfEdit.includes('【自辦課程】'));
});
test('self course flags stale subsidy copy without blocking inactive data', () => {
  assert.ok(validate({ ...self, details: '政府補助80%' }).errors.some(error => error.field === 'details'));
  assert.equal(validate({ ...self, grantFee: 'invalid', days: [{ date: '', topic: '政府補助', topics: '', visual: '' }] }).errors.length, 0);
});
test('dates use full year, correct weekday and validate leap days', () => {
  assert.equal(formatDate('2026-12-08'), '115年12月8日（二）');
  assert.equal(formatDate('2027-01-04', 'ad'), '2027年1月4日（一）');
  assert.equal(validDate('2026-02-29'), false); assert.equal(validDate('2028-02-29'), true);
  assert.equal(formatDate('12/08'), '12/08');
});
test('multiple cohorts keep independent years and are distinct from days', () => {
  const d = { ...subsidy, scheduleType: 'cohorts', cohorts: [{ name: '第一梯次', dates: '2026-12-08\n2026-12-15', times: '09:30–16:30' }, { name: '第二梯次', dates: '2027-01-04', times: '' }] };
  const copy = scheduleCopy(d); assert.ok(copy[0][1].includes('115年')); assert.ok(copy[1][1].includes('116年')); assert.ok(!generate(d).includes('Day 1'));
  assert.equal(validate({ ...d, cohorts: [{ name: '第一梯次', dates: '12/08', times: '' }] }).errors[0].field, 'cohorts');
});
test('daily course themes and shared morning/afternoon slots are preserved', () => {
  const d = { ...self, scheduleType: 'days', days: [{ date: '2027-01-08', topic: '剪髮練習', topics: '分區操作', visual: '老師示範' }], sessions: [{ start: '09:30', end: '12:30' }, { start: '13:30', end: '16:30' }] };
  const p = generate(d); assert.ok(p.includes('Day 1')); assert.ok(p.includes('剪髮練習')); assert.ok(p.includes('09:30–12:30、13:30–16:30')); assert.ok(!p.includes('Day 2'));
  assert.ok(validate({ ...d, sessions: [{ start: '16:30', end: '09:30' }] }).errors.some(error => error.field === 'sessions'));
});
test('weekly end before start, missing weekday and partial dates are rejected', () => {
  const d = { ...self, scheduleType: 'weekly', startDate: '2027-02-02', endDate: '2027-01-01', weekdays: [] };
  const errors = validate(d).errors; assert.ok(errors.some(error => error.field === 'endDate')); assert.ok(errors.some(error => error.field === 'weekdays')); assert.equal(generate(d), '');
});
test('explicit zero fees are retained and inconsistent sums only warn', () => {
  assert.deepEqual(feeCopy({ ...subsidy, totalFee: '10000', grantFee: '10000', ownFee: '0' }).slice(0, 3), [['全額訓練費用', '10000 元'], ['補助金額', '10000 元'], ['學員自付額', '0 元']]);
  const d = { ...subsidy, totalFee: '10000', grantFee: '8000', ownFee: '1000' };
  assert.ok(validate(d).warnings.some(message => message.includes('不一致'))); assert.ok(generate(d));
});
test('discount mode excludes inactive single fees', () => {
  const copy = feeCopy({ ...self, feeMode: 'discount', selfFee: '5000', originalFee: '8000', offerFee: '3000' });
  assert.deepEqual(copy, [['原價', '8000 元'], ['優惠價', '3000 元']]);
});
test('V1 migration preserves all course text and original manual prompt without guessing type', () => {
  const result = migrateDocument({ app: 'poster-prompt-studio', version: 1, data: { ...defaults, title: '舊課程', date: '115/12/08', fee: '政府補助80%', details: '舊原文' }, manual: true, prompt: '自訂手動原文\n不得丟失' });
  assert.equal(result.data.courseType, ''); assert.equal(result.data.date, '115/12/08'); assert.equal(result.data.fee, '政府補助80%');
  assert.equal(result.data.details, '舊原文'); assert.equal(result.data.legacyPrompt, '自訂手動原文\n不得丟失'); assert.equal(generate(result.data), '');
});
test('V2 JSON round trip retains arrays, inactive subsidy fields and design supplement', () => {
  const d = { ...self, planYear: '116', grantFee: '8000', extra: '背景簡潔', works: [{ name: '托特包', visual: '牛仔與帆布' }] };
  const migrated = migrateDocument(JSON.parse(JSON.stringify(exportDocument(d)))).data;
  assert.equal(migrated.grantFee, '8000'); assert.equal(generate(migrated), generate(d));
});
test('notice version migration records old version and exports current version', () => {
  const d = migrateDocument({ app: 'poster-prompt-studio', version: 2, data: { ...subsidy, noticeVersion: 'old' } }).data;
  assert.equal(d.previousNoticeVersion, 'old'); assert.equal(d.noticeVersion, NOTICE_VERSION); assert.ok(generate(d).includes(required));
});
test('unknown JSON versions and invalid payloads fail rather than clearing course data', () => {
  for (const payload of [null, { app: 'other', version: 2, data: {} }, { app: 'poster-prompt-studio', version: 99, data: {} }, { app: 'poster-prompt-studio', version: 2, data: [] }]) assert.throws(() => migrateDocument(payload));
});
test('built-in style and layout instructions work without an attached reference image', () => {
  const p = generate({ ...self, style: 'denim', layout: 'works' });
  assert.ok(p.includes('深藍與米色')); assert.ok(p.includes('中間四格作品圖片'));
  assert.ok(!p.includes('【我另外提供的參考圖片】')); assert.ok(!p.includes('另外附上自己的參考圖片'));
  for (const key of Object.keys(styles)) assert.ok(!/<image|href=|<script/i.test(styleSketch(key)));
  for (const key of Object.keys(layouts)) assert.ok(!/<image|href=|<script/i.test(layoutSketch(key)));
});
test('own reference image is opt-in, notes stay out of output when disabled', () => {
  const d = { ...self, referenceNotes: '只參考金色細框，不沿用人物' };
  assert.ok(!generate(d).includes(d.referenceNotes));
  const p = generate({ ...d, useReferenceImage: true });
  assert.ok(p.includes('【我另外提供的參考圖片】')); assert.ok(p.includes(d.referenceNotes));
  assert.ok(p.includes('舊課名、日期、價格')); assert.ok(p.includes('不得沿用'));
  const restored = migrateDocument(JSON.parse(JSON.stringify(exportDocument({ ...d, useReferenceImage: true })))).data;
  assert.equal(restored.useReferenceImage, true); assert.equal(restored.referenceNotes, d.referenceNotes);
  const bg = generate({ ...d, useReferenceImage: true, mode: 'background' });
  assert.ok(bg.includes('參考圖片')); assert.ok(bg.includes('不生成任何文字'));
  const edit = generate({ ...d, useReferenceImage: true, mode: 'edit', changes: '更改課名' });
  assert.ok(edit.includes('原始海報')); assert.ok(!edit.includes('【我另外提供的參考圖片】'));
});
test('existing V2 image selections retain design and course fields without requiring old images', () => {
  const original = { ...subsidy, reference: 'denim', style: 'denim', layout: 'works', main: '#18364C', accent: '#F0E7D4', title: '保留課名', visual: '牛仔托特包', extra: '保留設計補充' };
  const d = migrateDocument({ app: 'poster-prompt-studio', version: 2, data: original }).data;
  for (const key of ['style', 'layout', 'main', 'accent', 'title', 'visual', 'extra', 'planYear']) assert.equal(d[key], original[key]);
  assert.equal(d.useReferenceImage, false); assert.ok(!Object.hasOwn(d, 'reference'));
  const p = generate(d); assert.ok(!p.includes('參考圖片】')); assert.ok(p.includes(required));
});
