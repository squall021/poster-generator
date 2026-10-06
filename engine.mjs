export const SCHEMA_VERSION = 2;
export const NOTICE_VERSION = 'user-2026-10-06';
export const NOTICE_FOOTER = '年滿15歲以上，具就業保險、勞工保險、勞工職業災害保險或農民健康保險被保險人身份之在職勞工均可報名上課，一般身份政府補助80%訓練費，中低收入戶、原住民、身心障礙者、45歲以上中高齡者、獨力負擔家計者...等特定對象全額補助。';

export const styles = {
  elegant: { name: '柔和優雅', desc: '淡粉與酒紅、細框、柔光，呈現柔和細緻的視覺氣氛', main: '#993148', accent: '#FFF0EF' },
  salon: { name: '溫暖質感', desc: '米白與金棕、柔和光線、俐落標題與細緻層次', main: '#735022', accent: '#FAF4E8' },
  official: { name: '清楚招生', desc: '資訊易讀、整齊分區、清楚的標題與報名資訊層級', main: '#466EA4', accent: '#E9F0F7' },
  minimal: { name: '極簡留白', desc: '簡約現代、充分留白、低裝飾密度', main: '#8D7562', accent: '#F2ECE4' },
  vibrant: { name: '活潑創意', desc: '明亮有活力、圓潤幾何形、清楚對比', main: '#E38762', accent: '#FFF1D7' },
  denim: { name: '沉穩紋理', desc: '深藍與米色、細緻布紋、金色細節，呈現沉穩的層次感', main: '#18364C', accent: '#F0E7D4' },
  training: { name: '鮮明醒目', desc: '桃紅與白色、鮮明色彩對比、圓角資訊卡片，突出關鍵訊息', main: '#DB165A', accent: '#FFF3F7' },
  sprint: { name: '動感筆刷', desc: '米白、桃紅與深紫、斜向筆刷裝飾，呈現動感與視覺節奏', main: '#993A68', accent: '#FFF5F2' },
  pearl: { name: '精緻光澤', desc: '柔和珠光粉色、酒紅標題、細金框與精緻細節', main: '#992C3D', accent: '#FAE9E7' },
};
export const layouts = {
  classic: { name: '上標題・下資訊', text: '可用主內容區中，上方約25%為標題，中間約45%為主視覺，下方約30%為課程與報名資訊' },
  split: { name: '左文字・右主圖', text: '可用主內容區中，左側約55%放標題與資訊，右側約45%放主視覺' },
  frame: { name: '中央留白', text: '可用主內容區中央約70%放標題與資訊，裝飾位於周邊，避免侵入文字區' },
  works: { name: '四格作品', text: '上方大標題，中間四格作品圖片與各自標籤，下方課程特色、課表、費用與報名資訊' },
  columns: { name: '三欄課程', text: '上方標題與主視覺，中間將課程內容、適合對象、完訓能力分成三欄，下方課表、費用及報名資訊' },
  days: { name: '分日課程卡', text: '上方標題與人物主視覺，中間依實際課程日數建立日期、主題、重點與圖片卡片，下方費用、材料與報名資訊；不得自行增加課程日數' },
};
export const fields = [
  ['title', '課程／活動名稱'], ['subtitle', '副標題'], ['code', '課程代碼'],
  ['teacher', '講師'], ['features', '課程特色'], ['audience', '適合對象'],
  ['outcomes', '完訓能力'], ['hours', '總時數'], ['capacity', '招生名額'],
  ['deadline', '報名截止日期'], ['location', '上課／活動地點'],
  ['phone', '聯絡電話'], ['contact', '聯絡人'], ['lineId', 'Line ID'],
  ['organizer', '主辦／訓練單位'], ['signup', '報名方式'], ['details', '其他正式文案'],
];

export const defaults = {
  mode: 'full', purpose: '課程招生', courseType: '', planYear: '',
  noticeVersion: NOTICE_VERSION, previousNoticeVersion: '',
  size: 'A4', orientation: 'portrait', style: 'elegant', main: '#993148', accent: '#FFF0EF',
  decoration: '少量', layout: 'classic', visual: '課程相關作品與實作場景',
  useReferenceImage: false, referenceNotes: '',
  logo: true, qr: false, detailLevel: 'complete',
  title: '', subtitle: '', code: '', teacher: '', features: '', audience: '', outcomes: '',
  hours: '', capacity: '', deadline: '', location: '', phone: '', contact: '', lineId: '', organizer: '', signup: '', details: '',
  scheduleType: 'simple', dateDisplay: 'roc', date: '', startDate: '', endDate: '', weekdays: [],
  sessions: [], cohorts: [], days: [], works: [],
  fee: '', feeMode: 'single', selfFee: '', originalFee: '', offerFee: '', totalFee: '', grantFee: '', ownFee: '',
  prepayNote: '', feeNotes: '', materials: '', materialsValue: '', sponsor: '',
  changes: '', preserve: '原有配色、背景、裝飾與未指定修改的課程資訊', extra: '', legacyPrompt: '',
};
const own = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const str = (value, max = 10000) => typeof value === 'string' ? value.slice(0, max) : '';
const enumValue = (value, allowed, fallback) => allowed.includes(value) ? value : fallback;
const rowSchemas = {
  sessions: ['start', 'end'], cohorts: ['name', 'dates', 'times'],
  days: ['date', 'topic', 'topics', 'visual'], works: ['name', 'visual'],
};

export function clean(raw) {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
  const d = {};
  for (const [key, value] of Object.entries(defaults)) {
    if (Array.isArray(value)) continue;
    d[key] = typeof value === 'boolean' ? (typeof source[key] === 'boolean' ? source[key] : value)
      : typeof source[key] === 'string' ? str(source[key], key === 'legacyPrompt' ? 50000 : 10000) : value;
  }
  for (const [key, keys] of Object.entries(rowSchemas)) {
    d[key] = Array.isArray(source[key]) ? source[key].filter(row => row && typeof row === 'object' && !Array.isArray(row)).slice(0, 20)
      .map(row => Object.fromEntries(keys.map(k => [k, str(row[k], 3000)]))) : [];
  }
  d.weekdays = Array.isArray(source.weekdays) ? [...new Set(source.weekdays.filter(n => Number.isInteger(n) && n >= 0 && n <= 6))].sort() : [];
  for (const [key, allowed] of Object.entries({
    mode: ['background', 'full', 'edit'], courseType: ['', 'subsidized', 'self'],
    purpose: ['課程招生', '活動宣傳', '成果展'], scheduleType: ['simple', 'weekly', 'cohorts', 'days'],
    dateDisplay: ['roc', 'ad'], feeMode: ['single', 'discount'], detailLevel: ['complete', 'compact'],
    size: ['A4', 'A3', 'A1', 'ratio34', 'ratio23', 'square', 'story'],
    orientation: ['portrait', 'landscape'], decoration: ['無裝飾', '少量', '適中', '豐富'],
  })) d[key] = enumValue(d[key], allowed, defaults[key]);
  if (!own(styles, d.style)) d.style = defaults.style;
  if (!own(layouts, d.layout)) d.layout = defaults.layout;
  for (const key of ['main', 'accent']) if (!/^#[0-9a-f]{6}$/i.test(d[key])) d[key] = defaults[key];
  return d;
}

export function migrateDocument(payload) {
  if (!payload || payload.app !== 'poster-prompt-studio' || ![1, 2].includes(payload.version)
      || !payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)) {
    throw new Error('請選擇本工具匯出的 V1 或 V2 JSON 設定檔。');
  }
  const d = clean(payload.data);
  if (payload.version === 1) {
    d.courseType = '';
    d.planYear = '';
    d.scheduleType = 'simple';
    if (payload.manual === true) d.legacyPrompt = str(payload.prompt, 50000);
  }
  if (d.noticeVersion !== NOTICE_VERSION) d.previousNoticeVersion = d.noticeVersion;
  d.noticeVersion = NOTICE_VERSION;
  return { data: d, migrated: payload.version === 1 };
}

export function exportDocument(raw) {
  return { app: 'poster-prompt-studio', version: SCHEMA_VERSION, data: clean(raw) };
}

export function validYear(value) { return /^[1-9]\d{1,3}$/.test(value.trim()); }
export function getNotice(raw) {
  const d = clean(raw);
  if (d.courseType !== 'subsidized' || !validYear(d.planYear)) return null;
  return { ad: '廣告', header: `${d.planYear.trim()}年下半年勞動部勞動力發展署-產業人才投資計畫補助課程`, footer: NOTICE_FOOTER };
}
export function noticeText(raw) {
  const n = getNotice(raw);
  return n ? `左上角：${n.ad}\n右上角：${n.header}\n正下方：${n.footer}` : '';
}
export function validDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day));
  return year > 1911 && dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day;
}
export function formatDate(value, format = 'roc') {
  if (!validDate(value)) return value;
  const [year, month, day] = value.split('-').map(Number);
  const weekday = '日一二三四五六'[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
  return `${format === 'roc' ? year - 1911 : year}年${month}月${day}日（${weekday}）`;
}
const dateTokens = value => value.trim().split(/[\s,，、;；]+/).filter(Boolean);
const activeRows = rows => rows.filter(row => Object.values(row).some(value => value.trim()));
const timeValue = value => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
const moneyValue = value => /^\d+(?:,\d{3})*(?:\.\d{1,2})?$/.test(value.trim());
const moneyNumber = value => Number(value.replaceAll(',', ''));
const moneyText = value => `${value.trim()} 元`;

export function scheduleCopy(raw) {
  const d = clean(raw), lines = [];
  const times = activeRows(d.sessions).map(row => `${row.start}–${row.end}`).join('、');
  if (d.scheduleType === 'simple' && d.date.trim()) lines.push(['日期與時間', d.date.trim()]);
  if (d.scheduleType === 'weekly') {
    if (d.startDate || d.endDate) lines.push(['上課日期', `${formatDate(d.startDate, d.dateDisplay)} 至 ${formatDate(d.endDate, d.dateDisplay)}`]);
    if (d.weekdays.length) lines.push(['每週上課日', d.weekdays.map(n => `星期${'日一二三四五六'[n]}`).join('、')]);
  }
  if (d.scheduleType === 'cohorts') activeRows(d.cohorts).forEach((row, index) => {
    lines.push([row.name.trim() || `第${index + 1}梯次`, dateTokens(row.dates).map(v => formatDate(v, d.dateDisplay)).join('、') + (row.times.trim() ? `；${row.times.trim()}` : '')]);
  });
  if (d.scheduleType === 'days') activeRows(d.days).forEach((row, index) => {
    lines.push([`Day ${index + 1}`, [formatDate(row.date, d.dateDisplay), row.topic.trim(), row.topics.trim()].filter(Boolean).join('\n')]);
  });
  if (times) lines.push(['上課時段', times]);
  return lines;
}
export function feeCopy(raw) {
  const d = clean(raw), lines = [];
  const add = (key, label) => { if (d[key].trim()) lines.push([label, moneyText(d[key])]); };
  if (d.courseType === 'subsidized') {
    add('totalFee', '全額訓練費用'); add('grantFee', '補助金額'); add('ownFee', '學員自付額');
    if (d.prepayNote.trim()) lines.push(['預繳說明', d.prepayNote.trim()]);
    if (d.sponsor.trim()) lines.push(['補助單位', d.sponsor.trim()]);
  } else if (d.courseType === 'self') {
    if (d.feeMode === 'discount') { add('originalFee', '原價'); add('offerFee', '優惠價'); }
    else add('selfFee', '課程費用');
  }
  if (d.fee.trim()) lines.push(['費用與補助', d.fee.trim()]);
  if (d.feeNotes.trim()) lines.push(['費用補充', d.feeNotes.trim()]);
  if (d.materials.trim()) lines.push(['材料／工具說明', d.materials.trim()]);
  if (d.materialsValue.trim()) lines.push(['材料／工具價值', moneyText(d.materialsValue)]);
  return lines;
}
export function formalCopy(raw) {
  const d = clean(raw);
  return [...fields.filter(([key]) => d[key].trim()).map(([key, label]) => [label, d[key].trim()]), ...scheduleCopy(d), ...feeCopy(d)];
}

export function validate(raw) {
  const d = clean(raw), errors = [], warnings = [];
  const add = (field, message) => errors.push({ field, message });
  if (!d.courseType) add('courseType', '請先選擇補助課程或自辦課程。');
  if (d.courseType === 'subsidized' && !validYear(d.planYear)) add('planYear', '請填寫民國計畫年度，例如 115 或 116。');
  if (d.mode === 'edit') { if (!d.changes.trim()) add('changes', '請填寫要修改的內容。'); }
  else if (!d.title.trim()) add('title', '請填寫課程／活動名稱。');
  if (d.scheduleType === 'weekly') {
    if (!validDate(d.startDate)) add('startDate', '請填寫完整的課程開始日期。');
    if (!validDate(d.endDate)) add('endDate', '請填寫完整的課程結束日期。');
    if (validDate(d.startDate) && validDate(d.endDate) && d.endDate < d.startDate) add('endDate', '結束日期不能早於開始日期。');
    if (!d.weekdays.length) add('weekdays', '請選擇每週上課日。');
  }
  if (d.scheduleType === 'cohorts') {
    const rows = activeRows(d.cohorts);
    if (!rows.length) add('cohorts', '請至少新增一個梯次並填寫完整日期。');
    rows.forEach((row, i) => {
      const tokens = dateTokens(row.dates);
      if (!tokens.length || tokens.some(v => !validDate(v))) add('cohorts', `第 ${i + 1} 個梯次的日期請使用 YYYY-MM-DD，每行一個。`);
    });
  }
  if (d.scheduleType === 'days') {
    const rows = activeRows(d.days);
    if (!rows.length) add('days', '請至少新增一個課程日。');
    rows.forEach((row, i) => {
      if (!validDate(row.date)) add('days', `Day ${i + 1} 請填寫完整日期。`);
      if (!row.topic.trim()) add('days', `Day ${i + 1} 請填寫當日主題。`);
    });
  }
  activeRows(d.sessions).forEach((row, i) => {
    if (!timeValue(row.start) || !timeValue(row.end) || row.end <= row.start) add('sessions', `時段 ${i + 1} 請填寫正確的開始與結束時間，結束須晚於開始。`);
  });
  if (d.deadline && !validDate(d.deadline)) add('deadline', '報名截止日期須為完整日期。');
  const activeMoney = d.courseType === 'subsidized' ? ['totalFee', 'grantFee', 'ownFee']
    : d.courseType === 'self' ? d.feeMode === 'discount' ? ['originalFee', 'offerFee'] : ['selfFee'] : [];
  for (const key of [...activeMoney, 'materialsValue']) if (d[key].trim() && !moneyValue(d[key])) add(key, '金額請輸入數字，可使用千分位逗號。');
  if (d.fee.trim() && activeMoney.some(key => d[key].trim())) warnings.push('另有費用原文，請核對是否與分項金額重複；可在「自訂費用原文」調整。');
  if (d.courseType === 'subsidized' && ['totalFee', 'grantFee', 'ownFee'].every(key => moneyValue(d[key]))) {
    if (Math.abs(moneyNumber(d.totalFee) - moneyNumber(d.grantFee) - moneyNumber(d.ownFee)) > 0.01) warnings.push('全額費用與「補助＋自付」不一致，請核對；系統不會自動改動金額。');
  }
  if (d.courseType === 'self') {
    const subsidyWords = /產業人才投資計畫|勞動部勞動力發展署|政府補助|全額補助/;
    const textPairs = [...fields.map(([key]) => [key, d[key]]), ['fee', d.fee], ['feeNotes', d.feeNotes], ['materials', d.materials],
      ...(d.scheduleType === 'days' ? d.days.map(row => ['days', `${row.topic}\n${row.topics}`]) : []),
      ...(d.scheduleType === 'cohorts' ? d.cohorts.map(row => ['cohorts', row.name]) : []),
      ...d.works.map(row => ['works', row.name])];
    for (const [field, value] of textPairs) if (subsidyWords.test(value)) add(field, '自辦課程文案仍含計畫或政府補助文字，請修改此欄位。');
  }
  if (!d.phone.trim() && !d.signup.trim() && !d.lineId.trim()) warnings.push('尚未填寫電話、Line ID 或報名方式。');
  if (d.previousNoticeVersion) warnings.push('此草稿來自不同須知版本；目前輸出採用最新註記，請核對全文。');
  return { errors, warnings };
}

export function sizeLabel(raw) {
  const d = clean(raw);
  if (d.size === 'square') return '社群正方形，1:1比例';
  if (d.size === 'story') return '限時動態，直式9:16比例';
  if (['ratio34', 'ratio23'].includes(d.size)) {
    const ratio = d.size === 'ratio34' ? ['3:4', '4:3'] : ['2:3', '3:2'];
    return `${d.orientation === 'portrait' ? '直式' : '橫式'}，${ratio[d.orientation === 'portrait' ? 0 : 1]}比例`;
  }
  const mm = { A4: [210, 297], A3: [297, 420], A1: [594, 841] };
  const dims = d.orientation === 'portrait' ? mm[d.size] : [...mm[d.size]].reverse();
  return `${d.size} ${d.orientation === 'portrait' ? '直式，寬高比約1:1.414' : '橫式，寬高比約1.414:1'}（目標紙張尺寸 ${dims.join(' × ')} mm）`;
}
export function aspectRatio(raw) {
  const d = clean(raw);
  const ratio = { square: 1, story: 9 / 16, ratio34: 3 / 4, ratio23: 2 / 3 }[d.size] || 1 / Math.SQRT2;
  return !['square', 'story'].includes(d.size) && d.orientation === 'landscape' ? 1 / ratio : ratio;
}
const quote = value => JSON.stringify(value);
const copyLines = d => formalCopy(d).map(([label, text]) => `${label}：${quote(label === '報名截止日期' ? formatDate(text, d.dateDisplay) : text)}`);

function referenceRules(d) {
  return d.useReferenceImage ? ['【我另外提供的參考圖片】', '我會另外附上自己的參考圖片，請參考其配色、材質、攝影氣氛與構圖；本次指定的風格、版型與正式資料優先。',
    ...(d.referenceNotes.trim() ? [`希望參考的部分：${quote(d.referenceNotes.trim())}`] : []),
    '參考圖中的舊課名、日期、價格、補助、電話、Line ID、單位名稱及人物署名不得帶入本次海報；本次正式資料以下方清單為準。'] : [];
}
function noticeRules(d) {
  if (d.courseType === 'self') return ['【自辦課程】',
    '不加入左上角廣告註記、產業人才投資計畫名稱、政府補助須知、補助標章或補助宣稱。',
    ...(d.useReferenceImage || d.mode === 'edit' ? ['原圖或參考圖中的上述註記、標章與宣稱也不得沿用。'] : []),
    '移除上述註記的保留區，將可用空間重新分配給課程內容及報名資訊。'];
  if (d.mode === 'background') return ['【必要註記留白】',
    '這是補助課程的無文字底圖。頂部預留左上角短註記與右上角長計畫名稱的位置；正下方預留完整長段須知的排版空間。',
    '上述位置只留乾淨空間，不畫文字、標籤或佔位符；正式註記之後另行排版。'];
  const n = getNotice(d);
  return ['【必須完整呈現的註記與位置】', `海報左上角：${quote(n.ad)}`, `海報右上角：${quote(n.header)}`, `海報正下方：${quote(n.footer)}`,
    d.mode === 'edit' ? '保留或補齊上述三段註記，舊年度改成此處提供的年度。此要求優先於保留原圖文字的要求。' : '這三段為固定正式文字，逐字保留，不改寫、不縮寫、不省略。',
    '可依版面換行，不可刪字；計畫名稱位於右上方，須知位於報名資訊下方、海報底部中央，跨越可用寬度。',
    '字體清楚、對比足夠，保留安全邊界，不得裁切或被照片及裝飾遮擋。'];
}

export function generate(raw) {
  const d = clean(raw);
  if (validate(d).errors.length) return '';
  const bg = d.mode === 'background';
  if (d.mode === 'edit') return [
    '請以我另外附上的原始海報為基礎進行局部修改。',
    '【要修改的內容】', d.changes.trim(),
    ...(formalCopy(d).length ? ['【修改時需使用的正確文案】', ...copyLines(d)] : []),
    '【必須保留】', d.preserve.trim() || '保留所有未明確要求修改的部分。',
    '保持原圖比例與整體構圖。新課程文案僅用於明確指定的修改項目；必要註記依本次辦理類別處理。不得自行新增資訊。',
    ...(d.extra.trim() ? ['【設計補充】', d.extra.trim()] : []), ...noticeRules(d),
  ].join('\n');
  return [
    `請設計一張用於「${d.purpose}」的${bg ? '海報底圖' : '完整海報'}。`,
    `主題：${quote(d.title.trim())}${bg ? '（僅供理解主題，不要把這些文字畫入底圖）' : ''}`,
    '', ...referenceRules(d),
    '【尺寸與構圖】', sizeLabel(d) + '。',
    ...(d.courseType === 'subsidized' ? ['先保留獨立頂部註記列和底部須知區，再於剩餘主內容區安排以下版型；不得在滿版主內容之外擠入註記。'] : []),
    layouts[d.layout].text + '。',
    ...(d.layout === 'works' && activeRows(d.works).length ? [`作品區依下方提供的 ${activeRows(d.works).length} 項作品安排，不額外增加作品。`] : []),
    '重要元素與四周保留安全距離，避免裁切。',
    d.detailLevel === 'compact' ? '主次簡潔，減少裝飾；提供的正式文字仍完整保留，必要註記不得省略。' : '以清楚分區呈現完整課程內容。',
    '', '【視覺方向】', `${styles[d.style].name}：${styles[d.style].desc}。`,
    `主色 ${d.main}，輔色 ${d.accent}。裝飾密度：${d.decoration}。`,
    '風格名稱用於描述設計語氣；圖片內容以本次課程主題與主視覺描述為準，不自行增加其他課程的作品或人物。',
    ...(d.visual.trim() ? [`主視覺：${d.visual.trim()}。`] : []),
    ...activeRows(d.works).map((row, i) => `作品圖片 ${i + 1}：${row.name.trim()}；${row.visual.trim()}`),
    ...(d.scheduleType === 'days' ? activeRows(d.days).filter(row => row.visual.trim()).map((row, i) => `分日課程配圖：${row.topic.trim() || `課程日 ${i + 1}`}；${row.visual.trim()}`) : []),
    ...(bg ? ['圖片名稱僅描述圖像內容，不生成任何作品標籤文字。'] : activeRows(d.works).filter(row => row.name.trim()).map((row, i) => `作品 ${i + 1} 的正式標籤：${quote(row.name.trim())}`)),
    '', bg ? '【文字留白規則】' : '【必須呈現的繁體中文文案】',
    ...(bg ? ['只生成背景與圖像，不生成任何文字、字母、數字、假文字或浮水印。標題區與資訊區保持乾淨，不繪製提示標籤、虛線或佔位框。',
      `資訊區需預留約 ${Math.max(3, formalCopy(d).filter(([label]) => !['課程／活動名稱', '副標題'].includes(label)).length)} 組資訊的排版空間。`]
      : [...copyLines(d), '以上文案逐字呈現，使用繁體中文，保留日期、代碼、金額與電話的原始格式。欄位標籤用於指示區塊，除閱讀需要外不必照印。空白欄位不新增資訊。',
        '標題最醒目，副標題次之，資訊區清楚易讀，文字不得超出範圍。不得自行補出補助資格、通過率或保證就業等承諾。']),
    ...(d.logo ? ['右下角預留 Logo 空間，不自行生成或仿造 Logo。'] : []),
    ...(d.qr ? ['下方預留乾淨的 QR code 空間，不生成假的 QR code，之後會另外加入。'] : []),
    ...(d.extra.trim() ? ['', '【設計補充】', d.extra.trim()] : []), '', ...noticeRules(d),
  ].join('\n');
}
