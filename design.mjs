import { styles, layouts } from './engine.mjs';

// These illustrations contain only local vector shapes, never poster images or course data.
export const styleCaptions = {
  elegant: '淡粉・酒紅・柔光', salon: '米白・金棕・俐落', official: '藍白・資訊分區',
  minimal: '米灰・留白・細線', vibrant: '暖橙・幾何・活力', denim: '深藍・布紋・層次',
  training: '桃紅・白・圓角卡片', sprint: '桃紅・深紫・筆刷', pearl: '珠光粉・酒紅・金框',
};
const validKey = (catalog, key, fallback) => Object.hasOwn(catalog, key) ? key : fallback;
const svg = (body, viewBox) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" aria-hidden="true" focusable="false">${body}</svg>`;

export function illustrationMarkup(key) {
  key = validKey(styles, key, 'elegant');
  const shapes = {
    denim: '<rect x="19" y="19" width="54" height="54" rx="3" fill="currentColor" opacity=".12" stroke="none"/><rect x="27" y="27" width="54" height="54" rx="3"/><path d="M33 35h42M33 45h42M33 55h42M33 65h42M33 75h42M36 33v42M46 33v42M56 33v42M66 33v42" stroke-width="1" opacity=".45"/><path d="M19 61V19h42" stroke-dasharray="3 3"/>',
    elegant: '<circle cx="50" cy="50" r="30" opacity=".2"/><path d="M50 50q-31-5-19-25 23-2 19 25M50 50q5-31 25-19 2 23-25 19M50 50q31 5 19 25-23 2-19-25M50 50q-5 31-25 19-2-23 25-19"/><circle cx="50" cy="50" r="4" fill="currentColor" opacity=".4" stroke="none"/>',
    salon: '<path d="M21 81V46a29 29 0 0 1 58 0v35z" fill="currentColor" opacity=".1" stroke="none"/><path d="M21 81V46a29 29 0 0 1 58 0v35M31 81V46a19 19 0 0 1 38 0v35M17 81h66"/><circle cx="50" cy="54" r="10" opacity=".5"/><path d="M50 64v17M38 73h24" opacity=".4"/>',
    official: '<rect x="21" y="18" width="58" height="67" rx="5" fill="currentColor" opacity=".1" stroke="none"/><rect x="21" y="18" width="58" height="67" rx="5"/><path d="M31 32h38M31 45h12M31 58h12M31 71h12M51 45h18M51 58h18M51 71h18"/>',
    minimal: '<circle cx="52" cy="46" r="24" opacity=".35"/><path d="M22 81h57M51 70V20M51 60q-25-5-21-22 19 0 21 22M51 48q22-4 22-20-21 0-22 20"/>',
    vibrant: '<circle cx="33" cy="33" r="18" fill="currentColor" opacity=".25" stroke="none"/><rect x="49" y="49" width="34" height="34" rx="7" fill="currentColor" opacity=".45" stroke="none"/><path d="m66 14 18 30H48zM17 69h22M28 58v22"/><circle cx="66" cy="66" r="7" stroke="white"/>',
    training: '<path d="m50 18 27 32-27 32-27-32z" fill="currentColor" opacity=".2" stroke="none"/><path d="m50 18 27 32-27 32-27-32zM23 50h54M50 18 39 50l11 32 11-32z"/><path d="M13 24h10M18 19v10M77 79h10M82 74v10"/>',
    sprint: '<path d="m20 36 61-16M17 52l61-16M24 66l58-15" stroke-width="11" opacity=".18"/><path d="m23 34 51-14M24 50l48-12M31 64l40-10M27 82l50-13" stroke-width="3"/><circle cx="83" cy="77" r="4" fill="currentColor" opacity=".5" stroke="none"/>',
    pearl: '<circle cx="50" cy="50" r="32" opacity=".35"/><path d="m50 25 22 25-22 25-22-25zM28 50h44M50 25 41 50l9 25 9-25z"/><circle cx="18" cy="27" r="4" fill="currentColor" opacity=".4" stroke="none"/><circle cx="78" cy="80" r="5" fill="currentColor" opacity=".3" stroke="none"/>',
  };
  return svg(`<g fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${shapes[key]}</g>`, '0 0 100 100');
}

export function styleSketch(key) {
  key = validKey(styles, key, 'elegant');
  const { main, accent } = styles[key];
  const decor = {
    elegant: '<circle cx="67" cy="36" r="30" fill="white" opacity=".5"/><path d="M74 14h91v125H74z" fill="none" stroke="currentColor" stroke-width=".6" opacity=".5"/>',
    salon: '<path d="M62 125q62-92 110-99v115H62z" fill="currentColor" opacity=".08"/>',
    official: '<path d="M66 7h108v24H66z" fill="currentColor" opacity=".16"/><path d="M70 113h99v25H70z" fill="white" opacity=".7"/>',
    minimal: '<path d="M74 19h91M74 133h91" stroke="currentColor" stroke-width=".6" opacity=".4"/>',
    vibrant: '<circle cx="164" cy="29" r="29" fill="currentColor" opacity=".16"/><path d="m65 108 29 33H65z" fill="currentColor" opacity=".3"/>',
    denim: '<path d="M66 7h108v139H66z" fill="currentColor" opacity=".09"/><g stroke="currentColor" stroke-width=".6" opacity=".2"><path d="m66 27 108 39M66 47l108 39M66 67l108 39M66 87l108 39M66 107l108 39"/></g><path d="M72 13h96v127H72z" fill="none" stroke="#C8A668" stroke-dasharray="2 2"/>',
    training: '<circle cx="71" cy="23" r="20" fill="currentColor" opacity=".14"/><rect x="76" y="108" width="88" height="28" rx="7" fill="white" opacity=".8"/>',
    sprint: '<path d="m67 36 102-18M72 47l96-14" stroke="#66345C" stroke-width="7" opacity=".12" stroke-linecap="round"/>',
    pearl: '<circle cx="169" cy="15" r="32" fill="white" opacity=".6"/><circle cx="72" cy="129" r="27" fill="white" opacity=".45"/><rect x="72" y="13" width="96" height="127" fill="none" stroke="#C8A668" stroke-width="1"/>',
  };
  const illustration = illustrationMarkup(key).replace('viewBox="0 0 100 100"', 'x="90" y="52" width="60" height="60" viewBox="0 0 100 100"');
  return svg(`<rect width="240" height="154" rx="9" fill="${accent}"/><g color="${main}"><rect x="66" y="7" width="108" height="139" rx="2" fill="${accent}" stroke="currentColor" stroke-opacity=".18"/>${decor[key]}<path d="M82 34h62M82 42h44" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>${illustration}<path d="M83 119h73M83 126h51" stroke="currentColor" stroke-width="2" opacity=".45"/><circle cx="207" cy="109" r="9" fill="currentColor"/><circle cx="207" cy="132" r="9" fill="${accent}" stroke="currentColor" stroke-opacity=".25"/></g>`, '0 0 240 154');
}

export function layoutSketch(key) {
  key = validKey(layouts, key, 'classic');
  const block = (x, y, width, height, text, kind = 'info') => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="4" fill="${kind === 'image' ? '#E3D8EB' : '#F4EEF8'}" stroke="#C9B6D8" stroke-width=".8"/><text x="${x + width / 2}" y="${y + height / 2 + 4}" text-anchor="middle" fill="#766187" font-family="sans-serif" font-size="${width < 45 ? 8 : 10}">${text}</text>`;
  const parts = {
    classic: block(26, 18, 128, 33, '標題') + block(26, 58, 128, 68, '主視覺', 'image') + block(26, 133, 128, 38, '課程・報名資訊'),
    split: block(26, 18, 66, 51, '標題') + block(26, 76, 66, 95, '課程資訊') + block(99, 18, 55, 153, '人物／主圖', 'image'),
    frame: '<rect x="22" y="14" width="136" height="161" rx="4" fill="none" stroke="#DFD1E8" stroke-width="10"/>' + block(36, 40, 108, 42, '標題') + block(36, 96, 108, 57, '課程・報名資訊'),
    works: block(26, 18, 128, 28, '標題') + [[26, 53], [94, 53], [26, 96], [94, 96]].map(([x, y], i) => block(x, y, 60, 36, `作品 ${i + 1}`, 'image')).join('') + block(26, 139, 128, 32, '課程・報名資訊'),
    columns: block(26, 18, 128, 28, '標題') + block(26, 53, 128, 39, '主視覺', 'image') + ['內容', '對象', '能力'].map((text, i) => block(26 + i * 44, 99, 40, 37, text)).join('') + block(26, 143, 128, 28, '課表・報名'),
    days: block(26, 18, 128, 28, '標題') + block(26, 53, 128, 32, '主視覺', 'image') + ['Day 1', 'Day 2', 'Day 3'].map((text, i) => block(26 + i * 44, 92, 40, 49, text)).join('') + block(26, 148, 128, 23, '費用・報名'),
  };
  return svg(`<rect x="16" y="6" width="148" height="178" rx="5" fill="white" stroke="#D6C5E2"/>${parts[key]}`, '0 0 180 190');
}
