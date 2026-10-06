import { styles, layouts, defaults, clean, generate, validate, getNotice, noticeText, NOTICE_FOOTER, NOTICE_VERSION,
  sizeLabel, aspectRatio, formalCopy, scheduleCopy, formatDate, migrateDocument, exportDocument } from './engine.mjs';
import { styleCaptions, styleSketch, layoutSketch, illustrationMarkup } from './design.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const DRAFT = 'poster-studio-draft-v2', SAVED = 'poster-studio-presets-v2', CONTACTS = 'poster-studio-contacts-v2';
const contactKeys = ['location', 'phone', 'contact', 'lineId', 'organizer', 'signup'];
let state = clean(defaults), presets = [], contacts = [], activeTab = 'content', timer, migrated = false;

function el(tag, className = '', text = '') {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}
function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('show');
  clearTimeout(timer);
  timer = setTimeout(() => $('#toast').classList.remove('show'), 3500);
}
function download(content, name, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = el('a');
  link.href = url; link.download = name; document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function safeRead(key) {
  try { return JSON.parse(localStorage.getItem(key)); }
  catch { return null; }
}
function loadStored() {
  const current = safeRead(DRAFT), legacy = safeRead('poster-studio-draft-v1');
  try {
    if (current) state = migrateDocument(current).data;
    else if (legacy?.data) {
      state = migrateDocument({ ...legacy, app: 'poster-prompt-studio', version: 1 }).data;
      migrated = true;
    }
  } catch { toast('草稿無法讀取，原版資料仍保留在瀏覽器；可匯入備份。'); }
  const stored = safeRead(SAVED);
  const source = Array.isArray(stored) ? stored : safeRead('poster-studio-presets-v1');
  if (Array.isArray(source)) for (const item of source.slice(0, 100)) {
    if (!item || typeof item.id !== 'string' || typeof item.name !== 'string') continue;
    try {
      const result = migrateDocument({ app: 'poster-prompt-studio', version: Array.isArray(stored) ? 2 : 1, data: item.data, manual: item.manual, prompt: item.prompt });
      presets.push({ id: item.id.slice(0, 100), name: item.name.slice(0, 80), time: typeof item.time === 'string' ? item.time : '', data: result.data });
    } catch { /* Invalid individual records do not hide valid presets. */ }
  }
  contacts = cleanContacts(safeRead(CONTACTS));
}
function cleanContacts(raw) {
  return Array.isArray(raw) ? raw.filter(item => item && typeof item.id === 'string' && typeof item.name === 'string' && item.data).slice(0, 100)
    .map(item => ({ id: item.id.slice(0, 100), name: item.name.slice(0, 80), data: Object.fromEntries(contactKeys.map(key => [key, clean(item.data)[key]])) })) : [];
}
function storeDraft() {
  try {
    localStorage.setItem(DRAFT, JSON.stringify(exportDocument(state)));
    $('#saveState').textContent = '● 草稿已儲存在此瀏覽器';
  } catch { $('#saveState').textContent = '草稿未儲存，請匯出備份'; }
}
function storePresets(next) {
  try { localStorage.setItem(SAVED, JSON.stringify(next)); presets = next; $('#savedCount').textContent = presets.length; return true; }
  catch { toast('無法儲存設定，請匯出 JSON 備份。'); return false; }
}
function storeContacts(next) {
  try { localStorage.setItem(CONTACTS, JSON.stringify(next)); contacts = next; renderContactOptions(); return true; }
  catch { toast('聯絡資料無法儲存，請匯出設定備份。'); return false; }
}

function addField(container, spec, rowData) {
  const { key, label, type = 'text', wide = false, placeholder = '', list, index } = spec;
  const wrapper = el('label', wide ? 'wide' : '', label);
  const input = el(type === 'textarea' ? 'textarea' : 'input');
  if (type !== 'textarea') input.type = type;
  else input.rows = 2;
  input.maxLength = list ? 3000 : 10000;
  input.placeholder = placeholder;
  if (list) { input.dataset.list = list; input.dataset.index = index; input.dataset.key = key; input.value = rowData[key]; }
  else { input.name = key; input.id = `field-${key}`; }
  if (key === 'title') wrapper.append(el('em', '', '必填'));
  wrapper.append(input); container.append(wrapper);
}
const basic = [
  { key: 'purpose', label: '海報用途' }, { key: 'title', label: '課程／活動名稱', placeholder: '例如：凝膠彩繪實務班' },
  { key: 'subtitle', label: '副標題', wide: true }, { key: 'code', label: '課程代碼' }, { key: 'teacher', label: '講師' },
  { key: 'deadline', label: '報名截止日期', type: 'date' },
];
for (const spec of basic) {
  if (spec.key === 'purpose') {
    const label = el('label', '', spec.label), select = el('select'); select.name = 'purpose'; select.setAttribute('aria-label', spec.label);
    for (const text of ['課程招生', '活動宣傳', '成果展']) select.append(el('option', '', text));
    label.append(select); $('#basicFields').append(label);
  } else addField($('#basicFields'), spec);
}
for (const [key, label] of [['features', '課程特色'], ['audience', '適合對象'], ['outcomes', '完訓能力'], ['details', '其他正式文案']]) {
  addField($('#detailFields'), { key, label, type: 'textarea', wide: true, placeholder: '每行一項；依正式課程資料填寫' });
}
for (const [key, label, wide] of [['location', '上課地址', true], ['phone', '聯絡電話', false], ['contact', '聯絡人', false], ['lineId', 'Line ID', false], ['organizer', '主辦／訓練單位', true], ['signup', '報名方式／網址', true]]) {
  addField($('#contactFields'), { key, label, wide, type: key === 'phone' ? 'tel' : 'text' });
}
for (const [container, specs] of Object.entries({
  subsidizedFeeFields: [['totalFee', '全額訓練費用'], ['grantFee', '補助金額'], ['ownFee', '學員自付額'], ['prepayNote', '預繳說明'], ['sponsor', '補助單位']],
  singleFeeFields: [['selfFee', '課程費用']], discountFeeFields: [['originalFee', '原價'], ['offerFee', '優惠價']],
  materialFields: [['materials', '材料／工具說明'], ['materialsValue', '材料／工具價值'], ['feeNotes', '費用補充']],
})) for (const [key, label] of specs) addField($(`#${container}`), { key, label, placeholder: key.endsWith('Fee') || key === 'materialsValue' ? '金額數字，例如 20,000' : '', wide: ['prepayNote', 'sponsor', 'materials', 'feeNotes'].includes(key) });

const rowSpecs = {
  sessions: [{ key: 'start', label: '開始時間', type: 'time' }, { key: 'end', label: '結束時間', type: 'time' }],
  cohorts: [{ key: 'name', label: '梯次名稱', placeholder: '例如：第一梯次' }, { key: 'times', label: '此梯次時段', placeholder: '可留空，沿用共用時段' }, { key: 'dates', label: '完整日期，每行一個', type: 'textarea', wide: true, placeholder: '2026-12-08\n2026-12-15' }],
  days: [{ key: 'date', label: '上課日期', type: 'date' }, { key: 'topic', label: '當日主題' }, { key: 'topics', label: '學習重點', type: 'textarea', wide: true }, { key: 'visual', label: '這一天的配圖描述', wide: true }],
  works: [{ key: 'name', label: '作品標籤' }, { key: 'visual', label: '圖片描述' }],
};
function renderRows() {
  for (const [list, specs] of Object.entries(rowSpecs)) {
    const target = $(`#${list}Rows`); target.replaceChildren();
    state[list].forEach((row, index) => {
      const card = el('div', 'row-card');
      const heading = el('div', 'block-heading');
      heading.append(el('strong', '', `${{ sessions: '時段', cohorts: '梯次', days: 'Day', works: '作品' }[list]} ${index + 1}`));
      const remove = el('button', 'text-button', '移除'); remove.type = 'button'; remove.dataset.remove = list; remove.dataset.index = index;
      remove.setAttribute('aria-label', `移除${{ sessions: '時段', cohorts: '梯次', days: '課程日', works: '作品' }[list]} ${index + 1}`);
      heading.append(remove); card.append(heading);
      const grid = el('div', 'grid');
      specs.forEach(spec => addField(grid, { ...spec, list, index }, row));
      card.append(grid); target.append(card);
    });
    $(`[data-add="${list}"]`).disabled = state[list].length >= 20;
  }
}
for (let day = 0; day <= 6; day++) {
  const label = el('label', '', '日一二三四五六'[day]), input = el('input');
  input.type = 'checkbox'; input.dataset.day = day; label.prepend(input); $('#weekdayChoices').append(label);
}
for (const [key, style] of Object.entries(styles)) {
  const button = el('button', 'style-card'); button.type = 'button'; button.dataset.style = key;
  const sketch = el('span', 'style-sketch'); sketch.innerHTML = styleSketch(key);
  const description = el('small', '', styleCaptions[key]);
  button.append(sketch, el('strong', '', style.name), description); $('#styleCards').append(button);
}
for (const [key, layout] of Object.entries(layouts)) {
  const button = el('button', 'layout-card'); button.type = 'button'; button.dataset.layout = key;
  const demo = el('span', 'layout-sketch'); demo.innerHTML = layoutSketch(key);
  button.append(demo, el('span', '', layout.name)); $('#layoutCards').append(button);
}

function setTab(tab) {
  if (state.mode === 'edit' && ['design', 'layout'].includes(tab)) tab = 'content';
  activeTab = tab;
  $$('[data-tab]').forEach(button => { button.classList.toggle('active', button.dataset.tab === tab); button.setAttribute('aria-current', button.dataset.tab === tab ? 'step' : 'false'); });
  $$('.panel').forEach(panel => panel.hidden = panel.id !== `panel-${tab}`);
}
function syncForm() {
  for (const [key, value] of Object.entries(state)) {
    if (Array.isArray(value)) continue;
    const input = $(`#form [name="${key}"]`);
    if (input) { if (input.type === 'checkbox') input.checked = value; else input.value = value; }
  }
  $$('[data-day]').forEach(input => input.checked = state.weekdays.includes(Number(input.dataset.day)));
  renderRows();
}
function renderContactOptions() {
  const select = $('#contactProfile'); select.replaceChildren();
  const placeholder = el('option', '', '選擇已儲存資料'); placeholder.value = ''; select.append(placeholder);
  for (const item of contacts) { const option = el('option', '', item.name); option.value = item.id; select.append(option); }
}
function renderPreview() {
  const poster = $('#poster'), ratio = aspectRatio(state);
  poster.style.setProperty('--main', state.main); poster.style.setProperty('--accent', state.accent);
  poster.dataset.style = state.style; poster.dataset.decoration = state.decoration;
  poster.className = `poster ${state.layout} ${state.courseType === 'subsidized' ? 'with-notice' : ''}`;
  const width = Math.min(310, 410 * ratio);
  poster.style.width = `${width}px`; poster.style.height = `${width / ratio}px`;
  $('#posterTop').hidden = $('#posterFoot').hidden = state.courseType !== 'subsidized';
  $('#posterPlan').textContent = getNotice(state)?.header || '計畫年度待填';
  $('#posterTitle').textContent = state.title.trim() || '下一堂好課\n從這裡開始';
  $('#posterSubtitle').textContent = state.subtitle.trim() || '課程特色與招生主張';
  const schedule = scheduleCopy(state);
  $('#posterInfo').textContent = state.mode === 'background' ? '課程資訊留白'
    : schedule.length ? `${schedule[0][0]} · ${schedule[0][1].split('\n')[0]}` : '課表・費用・報名資訊';
  $('#logoSlot').hidden = !state.logo; $('#qrSlot').hidden = !state.qr;
  const art = $('#posterArt'); art.replaceChildren();
  const count = state.layout === 'works' ? Math.max(1, Math.min(4, state.works.length || 4)) : state.layout === 'days' ? Math.max(1, Math.min(4, state.days.length || 3)) : state.layout === 'columns' ? 3 : 1;
  art.style.setProperty('--tiles', count);
  if (['columns', 'days'].includes(state.layout)) {
    const hero = el('div', 'art-hero'), icon = el('span', 'art-symbol');
    icon.innerHTML = illustrationMarkup(state.style); hero.append(icon, el('small', '', '主視覺')); art.append(hero);
  }
  for (let i = 0; i < count; i++) {
    const tile = el('div', 'art-tile');
    if (state.layout !== 'columns') { const icon = el('span', 'art-symbol'); icon.innerHTML = illustrationMarkup(state.style); tile.append(icon); }
    else for (let line = 0; line < 3; line++) tile.append(el('i', 'tile-line'));
    tile.append(el('small', '', state.layout === 'days' ? `Day ${i + 1}` : state.layout === 'columns' ? ['課程內容', '適合對象', '完訓能力'][i] : count > 1 ? state.works[i]?.name.trim() || `作品 ${i + 1}` : '主視覺'));
    art.append(tile);
  }
}
function renderOutput() {
  const result = validate(state), prompt = generate(state), target = $('#validation');
  target.replaceChildren();
  if (result.errors.length) {
    target.append(el('strong', '', '補齊以下資料即可複製'));
    const list = el('ul');
    for (const issue of result.errors) {
      const item = el('li'), button = el('button', 'validation-link', issue.message);
      button.type = 'button'; button.onclick = () => focusIssue(issue.field); item.append(button); list.append(item);
    }
    target.append(list);
  }
  if (result.warnings.length) {
    const list = el('ul', 'warning-list'); result.warnings.forEach(text => list.append(el('li', '', text))); target.append(list);
  }
  target.hidden = !target.childElementCount;
  $('#prompt').value = prompt; $('#charCount').textContent = `${Array.from(prompt).length} 字`;
  $('#copy').disabled = $('#downloadText').disabled = !prompt;
  $('#uploadReminder').textContent = state.mode === 'edit' ? '把原海報與這段指令一起送到 ChatGPT。' : state.useReferenceImage ? '把自己的參考圖與這段指令一起送到 ChatGPT。' : '直接將提示詞貼到 ChatGPT 即可；風格與版型已寫入指令。';
  const formal = formalCopy(state), list = $('#formalList'); list.replaceChildren();
  for (const [label, text] of formal) list.append(el('dt', '', label), el('dd', '', label === '報名截止日期' ? formatDate(text, state.dateDisplay) : text));
  $('#formalCount').textContent = `(${formal.length} 項)`;
  $('#noticeReview').hidden = state.courseType !== 'subsidized';
  $('#noticeOutput').value = noticeText(state);
  $('#copyNotices').disabled = !getNotice(state);
  $('#noticeModeHelp').textContent = state.mode === 'background' ? '底圖提示詞只安排留白；這三段文字需要在後續排版加入。' : '完整海報與修改指令會帶入上述原文。生成後請逐字核對。';
  $('#legacyBackup').hidden = !state.legacyPrompt; $('#legacyPrompt').value = state.legacyPrompt;
  const checklist = $('#checklist'); checklist.replaceChildren();
  const checks = state.courseType === 'subsidized' ? ['左上角有「廣告」', '右上角年度與計畫名稱正確', '正下方須知全文完整、可讀且未裁切'] : ['沒有加入計畫與政府補助資訊'];
  checks.push('課名、日期、金額、聯絡方式與正式資料一致', '圖片符合實際課程，Logo 與 QR Code 使用正確素材');
  checks.forEach(text => checklist.append(el('li', '', text)));
}
function render() {
  const subsidy = state.courseType === 'subsidized', edit = state.mode === 'edit';
  $$('[data-type]').forEach(button => { button.classList.toggle('active', button.dataset.type === state.courseType); button.setAttribute('aria-pressed', button.dataset.type === state.courseType); });
  $('#yearField').hidden = $('#requiredNotice').hidden = !subsidy;
  $('#noticeHeader').textContent = getNotice(state)?.header || '請填寫民國年度後自動產生計畫名稱。';
  $('#noticeFooter').textContent = NOTICE_FOOTER;
  $('#typeHelp').textContent = subsidy ? '會加入左上角、右上角與正下方註記；所有風格與版型均適用。' : state.courseType === 'self' ? '不加入補助課程註記；已填的補助分項會保留在草稿中，並排除於本次輸出。' : '請先選擇，所有風格都可用於兩種辦理類別。';
  $$('[data-mode]').forEach(button => { button.classList.toggle('active', button.dataset.mode === state.mode); button.setAttribute('aria-pressed', button.dataset.mode === state.mode); });
  $('#modeHelp').textContent = edit ? '另外上傳原海報，描述要改的地方；註記依本次類別與年度處理。' : state.mode === 'background' ? '產生無文字底圖；補助課程仍保留註記空間，全文另列供排版。' : '一起生成圖像與繁體中文文案，完成後核對文字。';
  $('#editFields').hidden = !edit;
  $('#field-title').parentElement.querySelector('em').hidden = edit;
  $$('[data-tab]').forEach(button => button.disabled = edit && ['design', 'layout'].includes(button.dataset.tab));
  $$('[data-go]').forEach(button => button.hidden = edit);
  setTab(activeTab);
  $$('[data-schedule]').forEach(panel => panel.hidden = panel.dataset.schedule !== state.scheduleType);
  $('#subsidizedFees').hidden = !subsidy; $('#selfFees').hidden = state.courseType !== 'self';
  $('#singleFeeFields').hidden = state.feeMode !== 'single'; $('#discountFeeFields').hidden = state.feeMode !== 'discount';
  $('#feeTypeLabel').textContent = subsidy ? '補助與自付分項' : state.courseType === 'self' ? '自辦課程費用' : '先選擇課程類別';
  $('#form [name="orientation"]').disabled = ['square', 'story'].includes(state.size);
  $('#mainHex').textContent = state.main.toUpperCase(); $('#accentHex').textContent = state.accent.toUpperCase();
  for (const key of ['style', 'layout']) $$(`[data-${key}]`).forEach(button => { button.classList.toggle('active', button.dataset[key] === state[key]); button.setAttribute('aria-pressed', button.dataset[key] === state[key]); });
  $('#referenceOptions').hidden = !state.useReferenceImage;
  $('#previewStage').hidden = edit;
  $('#previewCaption').textContent = edit ? '修改模式沿用原圖構圖，不另套用版型。' : '示意配色與資訊位置；實際作品、人物與文字由 ChatGPT 生成。';
  $('#designSummary').textContent = edit ? '使用你另外附上的原海報' : `${styles[state.style].name} ＋ ${layouts[state.layout].name}`;
  $('#sizeTag').textContent = edit ? '沿用原圖' : sizeLabel(state).split('（')[0];
  renderPreview(); renderOutput();
  $('#savedCount').textContent = presets.length;
  $('#migrationBanner').hidden = !migrated;
  storeDraft();
}
function focusIssue(field) {
  const input = $(`#form [name="${field}"]`) || $(`#${field}Rows input`) || $(`#${field}Rows textarea`) || (field === 'weekdays' ? $('#weekdayChoices input') : null);
  const addButton = $(`[data-add="${field}"]`);
  if (!input && addButton) setTab(field === 'works' ? 'design' : 'schedule');
  const panel = input?.closest('.panel');
  if (panel) setTab(panel.id.replace('panel-', ''));
  input?.closest('details')?.setAttribute('open', '');
  const target = input || addButton || $('.course-section');
  target.scrollIntoView({ block: 'center', behavior: 'smooth' }); (input || addButton)?.focus();
}
async function copyText(text, target) {
  try { await navigator.clipboard.writeText(text); toast('已複製，可以貼到 ChatGPT。'); }
  catch {
    target.focus(); target.select();
    let copied = false; try { copied = document.execCommand('copy'); } catch { /* Manual selection remains available. */ }
    toast(copied ? '已複製。' : '請按 Ctrl+C（Mac：⌘C）複製已選取文字。');
  }
}
function finalPrompt() {
  const result = validate(state);
  if (result.errors.length) { focusIssue(result.errors[0].field); toast(result.errors[0].message); return ''; }
  const prompt = generate(state); $('#prompt').value = prompt; return prompt;
}

$('#form').addEventListener('submit', event => event.preventDefault());
$('#form').addEventListener('input', event => {
  const input = event.target;
  if (input.dataset.list) state[input.dataset.list][Number(input.dataset.index)][input.dataset.key] = input.value;
  else if (input.dataset.day !== undefined) state.weekdays = $$('[data-day]:checked').map(node => Number(node.dataset.day));
  else if (Object.prototype.hasOwnProperty.call(defaults, input.name) && !Array.isArray(defaults[input.name])) state[input.name] = input.type === 'checkbox' ? input.checked : input.value;
  else return;
  render();
});
$('#form').addEventListener('click', event => {
  const add = event.target.closest('[data-add]'), remove = event.target.closest('[data-remove]');
  if (add) {
    const list = add.dataset.add; if (state[list].length >= 20) return;
    state[list].push(Object.fromEntries(rowSpecs[list].map(spec => [spec.key, ''])));
    renderRows(); render(); $(`#${list}Rows .row-card:last-child input`)?.focus();
  }
  if (remove) { state[remove.dataset.remove].splice(Number(remove.dataset.index), 1); renderRows(); render(); }
});
$$('[data-type]').forEach(button => button.onclick = () => { state.courseType = button.dataset.type; migrated = false; render(); });
$$('[data-mode]').forEach(button => button.onclick = () => { state.mode = button.dataset.mode; render(); });
$$('[data-tab]').forEach(button => button.onclick = () => setTab(button.dataset.tab));
$$('[data-go]').forEach(button => button.onclick = () => { setTab(button.dataset.go); $('.tabs').scrollIntoView({ block: 'start', behavior: 'smooth' }); });
$$('[data-style]').forEach(button => button.onclick = () => { const key = button.dataset.style; Object.assign(state, { style: key, main: styles[key].main, accent: styles[key].accent }); syncForm(); render(); });
$$('[data-layout]').forEach(button => button.onclick = () => { state.layout = button.dataset.layout; render(); });
$('#copy').onclick = () => { const prompt = finalPrompt(); if (prompt) copyText(prompt, $('#prompt')); };
$('#downloadText').onclick = () => { const prompt = finalPrompt(); if (prompt) download(prompt, '課程海報提示詞.txt'); };
$('#copyNotices').onclick = () => { const text = noticeText(state); if (text) copyText(text, $('#noticeOutput')); };
$('#downloadLegacy').onclick = () => download(state.legacyPrompt, '舊版手動提示詞備份.txt');

function sample(choice) {
  const base = clean({ ...defaults, mode: 'full', title: '凝膠彩繪實務班', subtitle: '從基礎練習到作品完成', courseType: 'self', layout: 'works', visual: '美甲修補、延甲與婚紗美甲作品特寫',
    features: '基礎工具操作\n凝膠彩繪練習\n作品細節指導', date: '日期另行確認', selfFee: '3000' });
  if (choice === 'subsidy-denim') Object.assign(base, { courseType: 'subsidized', planYear: '116', title: '牛仔改造車縫設計實務班', style: 'denim', main: styles.denim.main, accent: styles.denim.accent,
    visual: '牛仔與帆布托特包、手提包及收納背包的作品攝影', scheduleType: 'weekly', startDate: '2027-10-01', endDate: '2027-11-12', weekdays: [5], sessions: [{ start: '09:30', end: '12:30' }, { start: '13:30', end: '16:30' }],
    date: '', hours: '42 小時', totalFee: '10000', grantFee: '8000', ownFee: '2000', selfFee: '', features: '車縫操作練習\n牛仔素材改造\n包款作品製作' });
  if (choice === 'self-sprint') Object.assign(base, { title: '美髮實作三日班', style: 'sprint', main: styles.sprint.main, accent: styles.sprint.accent, layout: 'days', visual: '沙龍造型人物、剪髮與捲髮教學場景，搭配工具材料展示',
    scheduleType: 'days', date: '', days: [{ date: '2027-01-08', topic: '剪髮重點練習', topics: '分區與剪髮基本操作', visual: '老師指導剪髮' }, { date: '2027-01-22', topic: '造型操作練習', topics: '髮型整理與造型技巧', visual: '假人頭練習' }, { date: '2027-01-29', topic: '綜合實作', topics: '完整流程與作品討論', visual: '學員實作' }] });
  return clean(base);
}
$('#sample').onclick = () => {
  if ((state.title || state.changes || state.legacyPrompt) && !confirm('載入範例會取代目前草稿。需要保留時，請先儲存設定。')) return;
  state = sample($('#sampleChoice').value); migrated = false; syncForm(); setTab('content'); render(); toast('已載入示範資料；日期、費用與招生內容請依實際課程修改。');
};
$('#reset').onclick = () => {
  if (!confirm('清空目前草稿並恢復預設？已儲存設定與聯絡資料會保留。')) return;
  state = clean(defaults); migrated = false; syncForm(); setTab('content'); render(); toast('已恢復空白草稿。');
};

function renderSaved() {
  const list = $('#savedList'); list.replaceChildren();
  if (!presets.length) list.append(el('p', 'empty', '還沒有儲存設定。'));
  for (const item of presets) {
    const row = el('div', 'saved-row'), name = el('div', 'saved-name', item.name);
    const date = new Date(item.time); name.append(el('small', '', Number.isNaN(+date) ? '已存設定' : date.toLocaleString('zh-TW')));
    const load = el('button', '', '載入'); load.onclick = () => {
      if (!confirm('載入此設定並取代目前草稿？')) return;
      state = migrateDocument({ ...exportDocument(item.data) }).data; migrated = !state.courseType;
      syncForm(); setTab('content'); render(); $('#savedDialog').close(); toast(`已載入「${item.name}」。`);
    };
    const remove = el('button', '', '刪除'); remove.setAttribute('aria-label', `刪除 ${item.name}`); remove.onclick = () => {
      if (confirm(`刪除「${item.name}」？`) && storePresets(presets.filter(value => value.id !== item.id))) renderSaved();
    };
    row.append(name, load, remove); list.append(row);
  }
}
function showSaved(focus) { $('#presetName').value = state.title; renderSaved(); $('#savedDialog').showModal(); if (focus) $('#presetName').focus(); }
$('#openSaved').onclick = () => showSaved(false); $('#savePreset').onclick = () => showSaved(true);
$('#closeSaved').onclick = () => $('#savedDialog').close();
$('#confirmSave').onclick = () => {
  const name = $('#presetName').value.trim(); if (!name) { $('#presetName').focus(); return; }
  if (presets.length >= 100) { toast('最多儲存 100 組設定，請先匯出備份或移除不用的設定。'); return; }
  if (storePresets([...presets, { id: crypto.randomUUID(), name, time: new Date().toISOString(), data: clean(state) }])) { renderSaved(); toast('設定已儲存。'); }
};
$('#export').onclick = () => download(JSON.stringify({ ...exportDocument(state), contacts }, null, 2), '海報提示詞設定-v2.json', 'application/json');
$('#import').onclick = () => $('#importFile').click();
$('#importFile').onchange = async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 2000000) throw new Error('設定檔超過 2 MB。');
    const obj = JSON.parse(await file.text()), result = migrateDocument(obj);
    if (!confirm('匯入會取代目前草稿；既有命名設定會保留。')) return;
    state = result.data; migrated = result.migrated;
    const importedContacts = cleanContacts(obj.contacts);
    if (importedContacts.length) storeContacts([...contacts, ...importedContacts.filter(item => !contacts.some(existing => existing.id === item.id))].slice(0, 100));
    syncForm(); setTab('content'); render(); $('#savedDialog').close(); toast(result.migrated ? '已保留 V1 資料，請補選課程辦理類別。' : '已匯入 V2 設定。');
  } catch (error) { toast(error instanceof SyntaxError ? '無法讀取 JSON，請選擇本工具匯出的設定檔。' : error.message); }
  finally { event.target.value = ''; }
};
function renderContactList() {
  const list = $('#contactList'); list.replaceChildren();
  for (const item of contacts) {
    const row = el('div', 'saved-row'); row.append(el('span', 'saved-name', item.name));
    const remove = el('button', '', '刪除'); remove.setAttribute('aria-label', `刪除聯絡資料 ${item.name}`);
    remove.onclick = () => { if (confirm(`刪除聯絡資料「${item.name}」？`) && storeContacts(contacts.filter(value => value.id !== item.id))) renderContactList(); };
    row.append(remove); list.append(row);
  }
}
$('#saveContact').onclick = () => { $('#contactName').value = state.organizer; renderContactList(); $('#contactDialog').showModal(); };
$('#closeContact').onclick = () => $('#contactDialog').close();
$('#confirmContact').onclick = () => {
  const name = $('#contactName').value.trim();
  if (!name) { $('#contactName').focus(); return; }
  if (!contactKeys.some(key => state[key].trim())) { toast('請先填寫至少一項聯絡資料。'); return; }
  if (contacts.length >= 100) { toast('最多儲存 100 組聯絡資料。'); return; }
  if (storeContacts([...contacts, { id: crypto.randomUUID(), name, data: Object.fromEntries(contactKeys.map(key => [key, state[key]])) }])) { $('#contactDialog').close(); toast('已儲存常用聯絡資料。'); }
};
$('#contactProfile').onchange = event => {
  const profile = contacts.find(item => item.id === event.target.value); if (!profile) return;
  if (contactKeys.some(key => state[key].trim()) && !confirm('套用這組資料，取代目前的聯絡欄位？')) { event.target.value = ''; return; }
  Object.assign(state, profile.data); syncForm(); render();
};

loadStored(); renderContactOptions(); syncForm(); setTab('content'); render();
