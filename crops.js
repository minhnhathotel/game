// Hình vẽ cây trồng theo phong cách Don't Starve, 4 giai đoạn:
// 0 = vừa gieo (ụ đất có hạt), 1 = nảy mầm, 2 = cây non, 3 = chín (thấy rõ củ/quả).

const CK = '#1b1611';
const ci = (w = 2.2) => `stroke="${CK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const MOUND = `<path d="M10 54 Q12 46 30 45 Q48 46 50 54 Z" fill="#4a3426" ${ci()}/>`;

const LEAF_COLOR = {
  muong: '#6f9a3e', hanh: '#7fa64a', cai: '#4f7a3a', duachuot: '#5f8a3a', carot: '#7aa04a',
  catim: '#5a7a3a', cachua: '#5f8a3a', ngo: '#8aa04a', khoaitay: '#5e7e3a', bido: '#6a8a3a',
  ngaicuu: '#8fa88a', tiato: '#7a3f6e',
};
const TALL = { ngo: 1, cachua: 1, hanh: 1 };

// lá hình thoi bo tròn, có gân giữa; gốc tại (x, y), quay theo góc ang (độ)
function leaf(x, y, len, ang, color, w = 0.42) {
  return `<g transform="translate(${x} ${y}) rotate(${ang})">
    <path d="M0 0 Q${len * .5} ${-len * w} ${len} 0 Q${len * .5} ${len * w} 0 0 Z" fill="${color}" ${ci(1.8)}/>
    <path d="M2 0 L${len - 3} 0" stroke="rgba(255,255,220,.35)" stroke-width="1.2"/></g>`;
}
function stem(x1, y1, x2, y2, color = '#6f8a4a', w = 4) {
  const d = `M${x1} ${y1} Q${x1 - 2} ${(y1 + y2) / 2} ${x2} ${y2}`;
  return `<path d="${d}" stroke="${CK}" stroke-width="${w + 2.4}" fill="none" stroke-linecap="round"/>
    <path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
}

function ripeSVG(id, L) {
  switch (id) {
    case 'muong':
      return [-125, -105, -88, -72, -55].map((a, i) => leaf(30, 48, 24 + (i % 2) * 5, a, L, .32)).join('');
    case 'hanh':
      return [18, 24, 30, 36, 42].map((x, i) => stem(x, 50, x + (i - 2) * 3, 8 + (i % 2) * 6, L, 3.6)).join('') +
        [22, 30, 38].map((x) => `<ellipse cx="${x}" cy="49" rx="4.5" ry="3.5" fill="#efe8da" ${ci(1.6)}/>`).join('');
    case 'ngaicuu':
      return [[22, 14], [30, 8], [38, 14]].map(([x, y]) => stem(30, 50, x, y, '#7a9a5a', 2.6)).join('') +
        [[21, 18, -150], [23, 28, -30], [29, 12, -120], [31, 24, -60], [38, 18, -40], [37, 30, -150], [24, 38, -160], [36, 40, -20]]
          .map(([x, y, a]) => leaf(x, y, 12, a, L, .45)).join('');
    case 'tiato':
      return stem(30, 50, 30, 14, '#6b4a5a', 3.4) +
        [[-160, 40], [-20, 40], [-150, 29], [-30, 29], [-120, 19], [-60, 19]].map(([a, y]) => leaf(30, y, 16, a, L, .65)).join('') +
        `<ellipse cx="30" cy="13" rx="4" ry="5" fill="${L}" ${ci(1.6)}/>`;
    case 'cai':
      return [-165, -128, -90, -52, -15].map((a) => leaf(30, 46, 19, a, L, .7)).join('') +
        `<ellipse cx="30" cy="44" rx="5" ry="4" fill="#9fc07a" ${ci(1.6)}/>`;
    case 'duachuot':
      return leaf(30, 46, 18, -140, L, .8) + leaf(30, 46, 18, -40, L, .8) +
        [[18, 40, -25], [40, 42, 20]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})">
          <rect x="-12" y="-5" width="24" height="10" rx="5" fill="#4f7a2e" ${ci(2)}/>
          <circle cx="-5" cy="-1" r="1" fill="#c9d98a"/><circle cx="2" cy="2" r="1" fill="#c9d98a"/><circle cx="7" cy="-1" r="1" fill="#c9d98a"/></g>`).join('');
    case 'carot':
      return [-120, -95, -70].map((a) => stem(30, 44, 30 + Math.cos(a * Math.PI / 180) * 22, 44 + Math.sin(a * Math.PI / 180) * 26, L, 2.4)).join('') +
        [[18, 22], [30, 16], [42, 22], [24, 28], [37, 28]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="5" ry="3" fill="${L}" ${ci(1.4)}/>`).join('') +
        `<path d="M21 46 Q30 39 39 46 L33 58 Q30 62 27 58 Z" fill="#d9772e" ${ci()}/>
         <path d="M25 50 h4 M30 54 h4" stroke="${CK}" stroke-width="1.5"/>`;
    case 'catim':
      return stem(30, 50, 30, 18, '#6f8a4a') + leaf(30, 30, 16, -160, L, .6) + leaf(30, 24, 16, -20, L, .6) +
        [[20, 28], [40, 32]].map(([x, y]) => `<g transform="translate(${x} ${y})">
          <path d="M0 0 C8 0 10 10 8 17 C6 23 -6 23 -8 17 C-10 10 -8 0 0 0 Z" fill="#5b3a6e" ${ci(2)}/>
          <path d="M-5 1 L0 -4 L5 1 L0 4 Z" fill="#6f8a4a" ${ci(1.4)}/>
          <path d="M-4 8 q1 6 4 9" stroke="rgba(255,255,255,.3)" stroke-width="1.6" fill="none"/></g>`).join('');
    case 'cachua':
      return `<path d="M44 54 L44 4" stroke="${CK}" stroke-width="5" stroke-linecap="round"/>
        <path d="M44 54 L44 4" stroke="#9b6b4b" stroke-width="2.6" stroke-linecap="round"/>` +
        stem(30, 50, 34, 8, '#6f8a4a') + leaf(32, 34, 15, -165, L, .55) + leaf(33, 20, 14, -20, L, .55) +
        [[22, 26], [38, 18], [34, 38]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" fill="#b8332e" ${ci(2)}/>
          <path d="M${x - 3} ${y - 6} l3 2 l3 -2" stroke="#4b6a3e" stroke-width="2" fill="none"/>
          <circle cx="${x - 2}" cy="${y - 1}" r="1.6" fill="rgba(255,255,255,.4)"/>`).join('');
    case 'ngo':
      return stem(30, 52, 30, 2, '#8aa04a', 4.5) + leaf(30, 40, 22, -165, L, .25) + leaf(30, 30, 22, -15, L, .25) +
        leaf(30, 18, 16, -150, L, .25) +
        `<g transform="translate(36 26) rotate(18)">
          <ellipse cx="0" cy="0" rx="6" ry="13" fill="#e3b84a" ${ci(2)}/>
          <path d="M-3 -8 h6 M-4 -3 h8 M-4 2 h8 M-3 7 h6" stroke="#b08a2c" stroke-width="1.4"/>
          <path d="M-7 4 Q-8 12 0 15 Q-4 6 -7 4 Z M7 4 Q8 12 0 15 Q4 6 7 4 Z" fill="#7fa04a" ${ci(1.6)}/></g>`;
    case 'khoaitay':
      return `<ellipse cx="18" cy="50" rx="7" ry="5" fill="#b08a5a" ${ci(2)}/><ellipse cx="42" cy="51" rx="6" ry="4.5" fill="#b08a5a" ${ci(2)}/>` +
        [[20, 32, 12], [40, 32, 12], [30, 22, 14], [30, 38, 11]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${L}" ${ci(2)}/>`).join('') +
        [[24, 18], [38, 24], [20, 34]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#efe8da" ${ci(1.2)}/><circle cx="${x}" cy="${y}" r=".9" fill="#e8b33a"/>`).join('');
    case 'bido':
      return leaf(30, 40, 20, -150, L, .8) + leaf(30, 40, 18, -40, L, .8) +
        `<ellipse cx="30" cy="40" rx="20" ry="14" fill="#d07a2a" ${ci(2.4)}/>
         <path d="M22 28 Q16 40 22 53 M38 28 Q44 40 38 53 M30 26 V54" stroke="#9c5420" stroke-width="2" fill="none"/>
         <path d="M30 27 q1 -6 5 -8" stroke="${CK}" stroke-width="5" fill="none" stroke-linecap="round"/>
         <path d="M30 27 q1 -6 5 -8" stroke="#6b4f33" stroke-width="2.6" fill="none" stroke-linecap="round"/>
         <ellipse cx="22" cy="34" rx="3" ry="5" fill="rgba(255,255,255,.25)"/>`;
  }
  return '';
}

function cropSVG(id, stage) {
  const L = LEAF_COLOR[id] || '#6f8a4a';
  let body = '';
  if (stage === 0) {
    body = `<circle cx="24" cy="48" r="1.8" fill="#c9ab78"/><circle cx="31" cy="47" r="1.8" fill="#c9ab78"/><circle cx="37" cy="49" r="1.8" fill="#c9ab78"/>`;
  } else if (stage === 1) {
    body = stem(30, 49, 30, 38, '#7fa04a', 2.6) + leaf(30, 39, 9, -150, '#8fb05a', .5) + leaf(30, 39, 9, -30, '#8fb05a', .5);
  } else if (stage === 2) {
    const top = TALL[id] ? 18 : 30;
    body = stem(30, 49, 30, top, '#6f8a4a', 3.4) +
      leaf(30, top + 14, 14, -160, L, .5) + leaf(30, top + 10, 14, -20, L, .5) +
      leaf(30, top + 2, 12, -130, L, .5) + leaf(30, top, 12, -50, L, .5);
  } else {
    body = ripeSVG(id, L);
  }
  return `<svg viewBox="0 0 60 60" class="crop">${MOUND}${body}</svg>`;
}

// con sâu xanh bám trên cây
function bugSVG() {
  const body = [6, 13, 20, 27].map((x, i) =>
    `<circle cx="${x}" cy="${15 - (i % 2) * 2}" r="5.5" fill="${i % 2 ? '#8fae4a' : '#7a9a3a'}" ${ci(1.8)}/>`).join('');
  return `<svg viewBox="0 0 42 26">
    <path d="M6 20 l-1 4 M13 18 l0 5 M20 20 l1 4 M27 18 l1 5" stroke="${CK}" stroke-width="1.6" stroke-linecap="round"/>
    ${body}
    <circle cx="34" cy="10" r="6" fill="#a3c45a" ${ci(1.8)}/>
    <circle cx="36" cy="9" r="1.5" fill="${CK}"/>
    <path d="M33 4 l-2 -4 M37 4 l3 -3" stroke="${CK}" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`;
}

// bụi cỏ dại xanh mọc ở khe giữa các mảnh đất; v lẻ thì có bông hoa trắng nhỏ
function weedSVG(v = 0) {
  const c = ['#6f8a4a', '#5e7a3a', '#87a35a'][v % 3];
  return `<svg viewBox="0 0 40 36">
    <ellipse cx="20" cy="33" rx="14" ry="3" fill="rgba(20,15,10,.3)"/>
    <path d="M8 34 Q6 20 1 10 Q12 18 14 34 Z M15 34 Q15 14 19 2 Q24 16 22 34 Z M22 34 Q26 18 37 8 Q31 22 29 34 Z" fill="${c}" ${ci(1.8)}/>
    ${v % 2 ? `<circle cx="19" cy="4" r="2.8" fill="#e8e0cc" ${ci(1.2)}/>` : ''}
  </svg>`;
}

// châu chấu xanh, chân sau gập cao
function hopperSVG() {
  return `<svg viewBox="0 0 44 28">
    <path d="M14 18 L6 26 M20 19 L18 27 M28 19 L32 27" stroke="${CK}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M22 14 L34 4 L40 22" fill="none" stroke="${CK}" stroke-width="4.5" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M22 14 L34 4 L40 22" fill="none" stroke="#9cb84a" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>
    <path d="M4 14 Q8 8 24 9 Q34 10 34 15 Q30 20 14 19 Q6 19 4 14 Z" fill="#8fae3a" ${ci(1.8)}/>
    <path d="M12 10 Q20 6 30 11" fill="none" stroke="#6f8a2a" stroke-width="2"/>
    <circle cx="7" cy="13" r="1.6" fill="${CK}"/>
    <path d="M5 10 Q2 3 -1 1 M7 10 Q8 3 6 -1" stroke="${CK}" stroke-width="1.3" fill="none"/>
  </svg>`;
}

// bọ cánh cứng xanh đen bóng
function beetleSVG() {
  return `<svg viewBox="0 0 36 30">
    <path d="M8 10 L1 6 M7 16 L0 17 M8 22 L2 27 M28 10 L35 6 M29 16 L36 17 M28 22 L34 27" stroke="${CK}" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="18" cy="6" r="5" fill="#2e2a24" ${ci(1.6)}/>
    <ellipse cx="18" cy="18" rx="11" ry="10" fill="#3f5a6e" ${ci(1.8)}/>
    <path d="M18 8 V28" stroke="${CK}" stroke-width="1.6"/>
    <ellipse cx="13" cy="15" rx="2.5" ry="3.5" fill="rgba(255,255,255,.3)"/>
  </svg>`;
}

function fishSVG(color, belly) {
  return `<svg viewBox="0 0 60 36">
    <path d="M44 18 L58 6 L56 18 L58 30 Z" fill="${color}" ${ci(2)}/>
    <path d="M24 9 Q30 1 39 9" fill="${color}" ${ci(1.6)}/>
    <path d="M4 18 Q14 4 32 6 Q46 8 48 18 Q46 28 32 30 Q14 32 4 18 Z" fill="${color}" ${ci(2.2)}/>
    <path d="M10 22 Q24 30 42 22 Q30 27 10 22 Z" fill="${belly}"/>
    <circle cx="12" cy="15" r="2.4" fill="${CK}"/><circle cx="12.6" cy="14.4" r=".8" fill="#fff"/>
    <path d="M20 11 Q23 18 20 25" stroke="${CK}" stroke-width="1.4" fill="none"/>
  </svg>`;
}

function shrimpSVG() {
  return `<svg viewBox="0 0 50 40">
    <path d="M8 10 Q30 0 40 16 Q46 28 34 34 L30 28 Q38 22 32 16 Q24 10 10 16 Z" fill="#d98a5a" ${ci(2)}/>
    <path d="M34 34 L28 38 M34 34 L38 39" stroke="${CK}" stroke-width="2" stroke-linecap="round"/>
    <path d="M18 7 L20 15 M26 7 L27 14 M33 12 L31 18" stroke="#a85a32" stroke-width="1.6"/>
    <circle cx="12" cy="11" r="1.8" fill="${CK}"/>
    <path d="M9 11 Q0 5 2 -1 M10 10 Q6 1 12 -3" stroke="${CK}" stroke-width="1.2" fill="none"/>
  </svg>`;
}

// bộ xương cá: đầu, sống lưng, các nhánh xương sườn, đuôi
function boneSVG() {
  const ribs = [18, 25, 32, 39].map((x) => `M${x} 18 L${x - 4} 8 M${x} 18 L${x - 4} 28`).join(' ');
  return `<svg viewBox="0 0 60 36">
    <path d="M14 18 L50 18 ${ribs}" stroke="${CK}" stroke-width="4.6" stroke-linecap="round" fill="none"/>
    <path d="M14 18 L50 18 ${ribs}" stroke="#efe8da" stroke-width="2.2" stroke-linecap="round" fill="none"/>
    <path d="M48 18 L58 9 L56 18 L58 27 Z" fill="#efe8da" ${ci(1.8)}/>
    <path d="M3 18 Q6 8 15 10 L15 26 Q6 28 3 18 Z" fill="#efe8da" ${ci(2)}/>
    <circle cx="9" cy="16" r="2" fill="${CK}"/>
  </svg>`;
}

// hình của đồ bắt được (côn trùng, cá, tôm, xương cá)
function catchSVG(id) {
  const c = CATCH[id];
  if (c.art === 'fish') return fishSVG(c.color, c.belly);
  return { worm: bugSVG, hopper: hopperSVG, beetle: beetleSVG, shrimp: shrimpSVG, bone: boneSVG, mushroom: () => wildShroomSVG(0) }[c.art]();
}

// biểu tượng nhỏ cho thẻ/nút: nông sản vẽ cây đã chín (đột biến thì đổi màu phát sáng), đồ bắt được vẽ con vật
function goodIco(id) {
  if (MUTANTS[id]) return `<span class="cico mutant">${cropSVG(MUTANTS[id].base, 3)}</span>`;
  return `<span class="cico">${CROPS[id] ? cropSVG(id, 3) : catchSVG(id)}</span>`;
}
