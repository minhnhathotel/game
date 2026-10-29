// Hình vẽ cây trồng theo phong cách Don't Starve, 4 giai đoạn:
// 0 = vừa gieo (ụ đất có hạt), 1 = nảy mầm, 2 = cây non, 3 = chín (thấy rõ củ/quả).
// Sen trồng dưới ao có bộ hình riêng (lotusSVG).

const CK = '#1b1611';
const ci = (w = 2.2) => `stroke="${CK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

// làm sáng/tối một màu hex theo hệ số f
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f))));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

const MOUND = `<path d="M7 56 Q9 45 30 44 Q51 45 53 56 Z" fill="#4a3426" ${ci()}/>
  <path d="M14 50 Q30 45.5 46 50" stroke="#6b4c36" stroke-width="2.6" fill="none" stroke-linecap="round"/>
  <circle cx="17" cy="53" r="1.4" fill="#2e2016"/><circle cx="43" cy="53" r="1.4" fill="#2e2016"/><circle cx="34" cy="54" r="1" fill="#7a5a42"/>`;

const LEAF_COLOR = {
  muong: '#6f9a3e', hanh: '#7fa64a', cai: '#4f8a3a', duachuot: '#5f8a3a', carot: '#76a446',
  catim: '#5a7e3a', cachua: '#5f8a3a', ngo: '#88a24a', khoaitay: '#5e843a', bido: '#6a8a3a',
  ngaicuu: '#8fa88a', tiato: '#7a3f6e',
};

// lá hai tông có gân giữa; gốc tại (x, y), quay theo góc ang (độ)
function leaf(x, y, len, ang, color, w = 0.42) {
  const a = len * w;
  return `<g transform="translate(${x} ${y}) rotate(${ang})">
    <path d="M0 0 C${len * .25} ${-a} ${len * .75} ${-a} ${len} 0 C${len * .75} ${a} ${len * .25} ${a} 0 0 Z" fill="${color}" ${ci(1.8)}/>
    <path d="M1.5 -.5 C${len * .3} ${-a * .78} ${len * .7} ${-a * .78} ${len - 2} -.5 Z" fill="${shade(color, 1.22)}"/>
    <path d="M2 0 Q${len * .5} ${len * .03} ${len - 3} 0" stroke="${shade(color, .68)}" stroke-width="1.2" fill="none"/>
  </g>`;
}
// lá tròn (bầu bí, dưa) có gân toả
function roundLeaf(x, y, r, color) {
  return `<g transform="translate(${x} ${y})">
    <path d="M0 ${r} C${-r * 1.3} ${r * .2} ${-r * .9} ${-r} 0 ${-r * .55} C${r * .9} ${-r} ${r * 1.3} ${r * .2} 0 ${r} Z" fill="${color}" ${ci(1.8)}/>
    <path d="M0 ${r * .8} C${-r * .9} ${r * .1} ${-r * .6} ${-r * .7} 0 ${-r * .4} Z" fill="${shade(color, 1.2)}"/>
    <path d="M0 ${r * .85} L0 ${-r * .45} M0 ${r * .2} L${-r * .55} ${-r * .3} M0 ${r * .2} L${r * .55} ${-r * .3}" stroke="${shade(color, .68)}" stroke-width="1.1" fill="none"/>
  </g>`;
}
function stem(x1, y1, x2, y2, color = '#6f8a4a', w = 4, bend = -2) {
  const d = `M${x1} ${y1} Q${x1 + bend} ${(y1 + y2) / 2} ${x2} ${y2}`;
  return `<path d="${d}" stroke="${CK}" stroke-width="${w + 2.4}" fill="none" stroke-linecap="round"/>
    <path d="${d}" stroke="${color}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
}
const shine = (x, y, rx, ry, rot = -30) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="rgba(255,255,255,.45)"/>`;

// ---------- cây non (giai đoạn 2), mỗi loại một dáng ----------
function youngSVG(id, L) {
  switch (id) {
    case 'hanh': case 'ngo':
      return [-8, -3, 3, 8].map((dx, i) => stem(30 + dx / 2, 50, 30 + dx * 1.6, 20 + (i % 2) * 6, L, 3)).join('');
    case 'carot':
      return [-125, -100, -78, -55].map((a) => {
        const r = a * Math.PI / 180, ex = 30 + Math.cos(r) * 20, ey = 46 + Math.sin(r) * 22;
        return stem(30, 47, ex, ey, L, 2.2) + `<circle cx="${ex}" cy="${ey}" r="4.5" fill="${L}" ${ci(1.5)}/>`;
      }).join('');
    case 'bido': case 'duachuot':
      return stem(30, 49, 30, 36, '#6f8a4a', 3) + roundLeaf(20, 34, 10, L) + roundLeaf(40, 32, 11, L) + roundLeaf(30, 26, 8, L);
    case 'cachua':
      return stem(30, 49, 31, 20, '#6f8a4a', 3.4) + leaf(30, 40, 13, -160, L, .5) + leaf(30, 34, 13, -20, L, .5) +
        leaf(31, 26, 11, -140, L, .5) + leaf(31, 22, 11, -40, L, .5);
    default:
      return stem(30, 49, 30, 32, '#6f8a4a', 3.2) +
        leaf(30, 44, 15, -165, L, .5) + leaf(30, 42, 15, -15, L, .5) + leaf(30, 35, 13, -125, L, .5) + leaf(30, 33, 13, -55, L, .5);
  }
}

// ---------- cây đã chín (giai đoạn 3) ----------
function ripeSVG(id, L) {
  const D = shade(L, .8);
  switch (id) {
    case 'muong':
      return [[-140, 24, D], [-118, 28, L], [-100, 31, D], [-82, 31, L], [-64, 28, D], [-42, 24, L], [-90, 22, L]]
        .map(([a, len, c]) => leaf(30, 48, len, a, c, .26)).join('') +
        `<path d="M27 48 L25 40 M33 48 L35 40" stroke="#c9d98a" stroke-width="2"/>`;
    case 'hanh':
      return [[16, -6, 12], [22, -3, 6], [28, 0, 2], [33, 2, 5], [39, 5, 9], [44, 8, 14]].map(([x, dx, top]) =>
        stem(x, 49, x + dx, top, L, 3.8, dx > 0 ? 2 : -2) +
        `<path d="M${x} 47 Q${x + dx / 2} ${(47 + top) / 2} ${x + dx} ${top + 2}" stroke="${shade(L, 1.3)}" stroke-width="1.2" fill="none"/>`).join('') +
        [20, 27, 34, 41].map((x) => `<ellipse cx="${x}" cy="50" rx="4.6" ry="4" fill="#f2ecdc" ${ci(1.6)}/>
          <path d="M${x - 2} 49 v2 M${x + 1} 48 v3" stroke="#c9bfae" stroke-width="1"/>`).join('');
    case 'ngaicuu':
      // bụi ngải cứu xanh bạc, lá xẻ thuỳ (mỗi lá kèm 1 thuỳ nhỏ)
      return [[22, 12], [30, 5], [38, 12]].map(([x, y]) => stem(30, 50, x, y, '#7a9a5a', 2.6)).join('') +
        [[21, 16, -150, L], [23, 27, -30, D], [29, 10, -120, L], [31, 22, -60, D], [38, 16, -40, L],
          [37, 29, -150, D], [24, 37, -160, L], [36, 39, -20, L], [30, 31, -95, D]]
          .map(([x, y, a, c]) => leaf(x, y, 13, a, c, .42) + leaf(x, y, 8, a + 38, shade(c, 1.12), .45)).join('');
    case 'tiato':
      // tía tô: các cặp lá tím mọc đối, ngọn có chùm nụ
      return stem(30, 52, 30, 12, '#6b4a5a', 3.4) +
        [[-165, 42, D], [-15, 42, D], [-150, 31, L], [-30, 31, L], [-125, 20, L], [-55, 20, L]]
          .map(([a, y, c]) => leaf(30, y, 17, a, c, .66)).join('') +
        `<path d="M30 13 C25 8 33 3 30 -1 C27 3 35 8 30 13 Z" fill="${shade(L, 1.15)}" ${ci(1.6)}/>`;
    case 'cai':
      return [[-150, D], [-110, D], [-70, D], [-30, D]].map(([a, c]) => leaf(30, 46, 22, a, c, .62)).join('') +
        [-128, -90, -52].map((a) => {
          const r = a * Math.PI / 180, x2 = 30 + Math.cos(r) * 14, y2 = 46 + Math.sin(r) * 14;
          return `<path d="M30 48 L${x2} ${y2}" stroke="${CK}" stroke-width="7.5" stroke-linecap="round"/>
            <path d="M30 48 L${x2} ${y2}" stroke="#eef3d6" stroke-width="5" stroke-linecap="round"/>` +
            leaf(x2, y2, 15, a, L, .7);
        }).join('');
    case 'duachuot':
      return roundLeaf(16, 30, 11, D) + roundLeaf(44, 28, 12, L) + roundLeaf(30, 20, 9, L) +
        `<path d="M24 40 q-6 -2 -4 -8 q2 -3 4 0" stroke="${CK}" stroke-width="1.4" fill="none"/>
         <circle cx="38" cy="40" r="3.2" fill="#e8c43a" ${ci(1.3)}/>` +
        [[20, 44, -18], [40, 46, 14]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})">
          <rect x="-13" y="-5.5" width="26" height="11" rx="5.5" fill="#4f7a2e" ${ci(2)}/>
          <rect x="-11" y="-4.5" width="22" height="4" rx="2" fill="#6f9a44"/>
          <circle cx="-6" cy="1.5" r=".9" fill="#d6e49a"/><circle cx="0" cy="2.5" r=".9" fill="#d6e49a"/><circle cx="6" cy="1.5" r=".9" fill="#d6e49a"/></g>`).join('');
    case 'carot':
      return [-132, -110, -90, -70, -48].map((a, i) => {
        const r = a * Math.PI / 180, ex = 30 + Math.cos(r) * 24, ey = 42 + Math.sin(r) * 28;
        const c = i % 2 ? L : D;
        return stem(30, 42, ex, ey, c, 2.2) +
          `<circle cx="${ex}" cy="${ey}" r="5.5" fill="${c}" ${ci(1.5)}/><circle cx="${ex - 4}" cy="${ey + 5}" r="4" fill="${c}" ${ci(1.5)}/>
           <circle cx="${ex - 1.5}" cy="${ey - 1.5}" r="2.2" fill="${shade(c, 1.25)}"/>`;
      }).join('') +
        `<path d="M19 45 Q30 37 41 45 L34 59 Q30 63 26 59 Z" fill="#e07a2a" ${ci()}/>
         <path d="M22 44 Q30 39 38 44" stroke="#f3a25a" stroke-width="3" fill="none" stroke-linecap="round"/>
         <path d="M24 50 h5 M30 54 h4 M27 57 h3" stroke="#9c4f1a" stroke-width="1.4" stroke-linecap="round"/>`;
    case 'catim':
      return stem(30, 50, 30, 16, '#6f8a4a', 3.6) + leaf(30, 30, 18, -165, D, .6) + leaf(30, 22, 18, -15, L, .6) +
        leaf(30, 16, 12, -100, L, .55) +
        [[19, 30, 10], [41, 33, -8]].map(([x, y, a]) => `<g transform="translate(${x} ${y}) rotate(${a})">
          <path d="M0 0 C9 0 11 11 9 18 C7 25 -7 25 -9 18 C-11 11 -9 0 0 0 Z" fill="#5b356e" ${ci(2)}/>
          <path d="M-3 4 C-6 9 -6 15 -3 20" stroke="#8a62a0" stroke-width="2.6" fill="none" stroke-linecap="round"/>
          <path d="M-6 1 L-2 -2 L0 -6 L2 -2 L6 1 L0 4 Z" fill="#6f8a4a" ${ci(1.4)}/></g>`).join('');
    case 'cachua':
      return `<path d="M46 56 L46 4" stroke="${CK}" stroke-width="5.4" stroke-linecap="round"/>
        <path d="M46 56 L46 4" stroke="#9b6b4b" stroke-width="3" stroke-linecap="round"/>
        <path d="M44 20 l4 2 M44 36 l4 2" stroke="${CK}" stroke-width="1.6"/>` +
        stem(30, 50, 34, 6, '#6f8a4a', 3.4) + leaf(31, 36, 15, -168, D, .55) + leaf(33, 22, 14, -20, L, .55) + leaf(33, 12, 11, -150, L, .55) +
        [[21, 28, '#c0392e'], [38, 18, '#c0392e'], [35, 38, '#c0392e'], [24, 42, '#8fae4a']].map(([x, y, c]) =>
          `<circle cx="${x}" cy="${y}" r="6.8" fill="${c}" ${ci(2)}/>${shine(x - 2.4, y - 2.4, 2.2, 1.4)}
           <path d="M${x - 3.5} ${y - 6} l3.5 2 l3.5 -2 M${x} ${y - 4} v-3" stroke="#3e5e30" stroke-width="1.8" fill="none" stroke-linecap="round"/>`).join('');
    case 'ngo':
      return stem(30, 54, 30, 4, '#8aa04a', 4.6) +
        `<path d="M30 6 l-4 -4 M30 6 l0 -5 M30 6 l4 -4" stroke="#d9b84a" stroke-width="2" stroke-linecap="round"/>` +
        leaf(30, 44, 24, -170, D, .2) + leaf(30, 36, 24, -12, L, .2) + leaf(30, 24, 18, -155, L, .2) + leaf(30, 16, 14, -30, D, .2) +
        `<g transform="translate(37 28) rotate(16)">
          <ellipse cx="0" cy="0" rx="6.5" ry="14" fill="#efc24e" ${ci(2)}/>
          <path d="M-3.5 -9 h7 M-5 -4 h10 M-5 1 h10 M-4.5 6 h9" stroke="#b48a2a" stroke-width="1.3"/>
          <path d="M-2 -10 v18 M2 -10 v18" stroke="#b48a2a" stroke-width="1"/>
          <path d="M-8 2 Q-9 13 0 16 Q-4 6 -8 2 Z M8 2 Q9 13 0 16 Q4 6 8 2 Z" fill="#7fa04a" ${ci(1.6)}/></g>`;
    case 'khoaitay':
      return `<ellipse cx="17" cy="51" rx="7.5" ry="5.5" fill="#b8925e" ${ci(2)}/><ellipse cx="43" cy="52" rx="6.5" ry="5" fill="#b8925e" ${ci(2)}/>
        <circle cx="15" cy="50" r=".9" fill="#6b4f33"/><circle cx="19" cy="52" r=".9" fill="#6b4f33"/><circle cx="44" cy="51" r=".9" fill="#6b4f33"/>` +
        [[19, 34, 12, D], [41, 34, 12, D], [30, 24, 13, L], [30, 38, 11, L], [21, 22, 8, L], [39, 22, 8, D]].map(([x, y, r, c]) =>
          `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}" ${ci(2)}/><path d="M${x - r * .5} ${y + r * .2} q${r * .5} ${r * .4} ${r} 0" stroke="${shade(c, .7)}" stroke-width="1.3" fill="none"/>`).join('') +
        [[24, 18], [37, 26], [20, 33], [33, 13]].map(([x, y]) =>
          `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-2.6" rx="1.7" ry="2.6" transform="rotate(${a})" fill="#ece4f2" ${ci(.9)}/>`).join('')}<circle r="1.3" fill="#e8b33a"/></g>`).join('');
    case 'bido':
      return roundLeaf(14, 30, 12, D) + roundLeaf(46, 28, 12, L) +
        `<path d="M44 40 q8 -4 6 -10 q-2 -4 -5 -1" stroke="${CK}" stroke-width="1.5" fill="none"/>
         <ellipse cx="30" cy="41" rx="21" ry="14.5" fill="#d9792a" ${ci(2.4)}/>
         <path d="M21 28 Q14 41 21 54 M39 28 Q46 41 39 54 M30 27 V55" stroke="#a5561c" stroke-width="2" fill="none"/>
         <path d="M14 36 Q12 42 15 48" stroke="#f0a050" stroke-width="3" fill="none" stroke-linecap="round"/>
         ${shine(24, 34, 3.5, 2)}
         <path d="M30 28 q1 -7 6 -9" stroke="${CK}" stroke-width="5.6" fill="none" stroke-linecap="round"/>
         <path d="M30 28 q1 -7 6 -9" stroke="#7a5a3a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  }
  return '';
}

function cropSVG(id, stage) {
  if (CROPS[id] && CROPS[id].water) return lotusSVG(stage);
  const L = LEAF_COLOR[id] || '#6f8a4a';
  let body = '';
  if (stage === 0) {
    body = `<circle cx="23" cy="47.5" r="2" fill="#d9bf8a" ${ci(1)}/><circle cx="30.5" cy="46.5" r="2" fill="#d9bf8a" ${ci(1)}/><circle cx="38" cy="48" r="2" fill="#d9bf8a" ${ci(1)}/>`;
  } else if (stage === 1) {
    body = stem(30, 48, 30, 38, '#86ac4e', 2.6) +
      `<ellipse cx="24" cy="36" rx="6.5" ry="3.8" transform="rotate(-25 24 36)" fill="#9cc25e" ${ci(1.6)}/>
       <ellipse cx="36" cy="36" rx="6.5" ry="3.8" transform="rotate(25 36 36)" fill="#9cc25e" ${ci(1.6)}/>
       <path d="M21 35 q3 -2 6 0 M33 35 q3 -2 6 0" stroke="#c4e08a" stroke-width="1.3" fill="none"/>`;
  } else if (stage === 2) {
    body = youngSVG(id, L);
  } else {
    body = ripeSVG(id, L);
  }
  return `<svg viewBox="0 0 60 60" class="crop">${MOUND}${body}</svg>`;
}

// ---------- Sen (trồng dưới ao) ----------
// lá sen hình tròn có khe; tâm (cx, cy), bán kính r, nghiêng rot
function lotusPad(cx, cy, r, rot = 0) {
  const ry = r * .55, s = Math.sin(.17), c = Math.cos(.17);
  return `<g transform="translate(${cx} ${cy}) rotate(${rot})">
    <path d="M0 0 L${r * c} ${-ry * s} A${r} ${ry} 0 1 0 ${r * c} ${ry * s} Z" fill="#5a8a44" ${ci(1.8)}/>
    <ellipse cx="${-r * .15}" cy="${-ry * .12}" rx="${r * .62}" ry="${ry * .55}" fill="#78a85a"/>
    <path d="M0 0 L${-r * .8} ${-ry * .4} M0 0 L${-r * .85} ${ry * .35} M0 0 L${-r * .2} ${-ry * .8} M0 0 L${-r * .2} ${ry * .8}" stroke="#46703a" stroke-width="1" fill="none"/>
  </g>`;
}
const RIPPLE = `<ellipse cx="30" cy="48" rx="24" ry="7" fill="none" stroke="rgba(220,240,245,.55)" stroke-width="1.6"/>`;

// 0 = 1 lá sen nhỏ, 1 = hai lá, 2 = có nụ hồng, 3 = hoa nở
function lotusSVG(stage) {
  let body = RIPPLE;
  if (stage === 0) body += lotusPad(30, 46, 10, -15);
  else if (stage === 1) body += lotusPad(22, 46, 12, -10) + lotusPad(40, 44, 9, 160);
  else {
    body += lotusPad(18, 47, 13, -12) + lotusPad(42, 46, 12, 170);
    if (stage === 2) {
      body += stem(30, 46, 30, 26, '#6f8a4a', 2.6) +
        `<path d="M30 10 C38 18 38 26 30 30 C22 26 22 18 30 10 Z" fill="#e690aa" ${ci(1.8)}/>
         <path d="M30 13 C34 19 34 25 30 28" stroke="#f6c4d2" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    } else {
      const petal = (a, len, w, fill) => `<path d="M0 0 C${w} ${-len * .4} ${w * .6} ${-len * .9} 0 ${-len} C${-w * .6} ${-len * .9} ${-w} ${-len * .4} 0 0 Z"
        transform="translate(30 36) rotate(${a})" fill="${fill}" ${ci(1.6)}/>`;
      body += stem(30, 46, 30, 36, '#6f8a4a', 2.6) +
        [-70, 70, -48, 48].map((a) => petal(a, 17, 7, '#e48aa6')).join('') +
        [-24, 24].map((a) => petal(a, 21, 8, '#f2b0c4')).join('') +
        petal(0, 23, 8.5, '#f8cad6') +
        `<path d="M30 33 C31 26 31 20 30 15" stroke="#fde4ec" stroke-width="2" fill="none" stroke-linecap="round"/>
         <ellipse cx="30" cy="32" rx="6" ry="3" fill="#d9c44a" ${ci(1.4)}/>
         <circle cx="28" cy="31.6" r=".9" fill="#6b5a1a"/><circle cx="31" cy="31" r=".9" fill="#6b5a1a"/><circle cx="32.5" cy="32.6" r=".9" fill="#6b5a1a"/>`;
    }
  }
  return `<svg viewBox="0 0 60 60" class="crop">${body}</svg>`;
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

// cá khổng lồ dưới ao sen: miệng đầy răng, mắt lồi, vây lưng nhọn
function giantFishSVG() {
  return `<svg viewBox="0 0 80 50">
    <path d="M58 25 L78 8 L74 25 L78 42 Z" fill="#4f6a62" ${ci(2.4)}/>
    <path d="M10 25 C14 6 44 2 60 18 C64 22 64 28 60 32 C44 48 14 44 10 25 Z" fill="#6f8a7c" ${ci(2.6)}/>
    <path d="M20 30 C30 40 48 38 58 30" fill="#c9d4b8" stroke="none"/>
    <path d="M30 6 L36 0 L42 8" fill="#4f6a62" ${ci(2)}/>
    <path d="M32 30 Q38 36 44 30" fill="#4f6a62" ${ci(1.8)}/>
    <path d="M12 26 L24 26" ${ci(2)}/>
    <path d="M13 26 L15 22 L17 26 L19 22 L21 26 L23 23" fill="#f2ecdc" ${ci(1.2)}/>
    <circle cx="20" cy="17" r="4.5" fill="#f2ecdc" ${ci(1.8)}/><circle cx="21" cy="17" r="2" fill="${CK}"/>
    <path d="M40 14 q3 4 0 8 M47 16 q3 4 0 8" stroke="#4f6a62" stroke-width="1.6" fill="none"/>
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
  return { worm: bugSVG, hopper: hopperSVG, beetle: beetleSVG, shrimp: shrimpSVG, bone: boneSVG,
    giantfish: giantFishSVG, mushroom: () => wildShroomSVG(0),
    berry: berrySVG, flower: () => flowerSVG(0), grass: grassSVG, twig: saplingSVG, stone: boulderSVG }[c.art]();
}

// biểu tượng nhỏ cho thẻ/nút: nông sản vẽ cây đã chín (đột biến thì đổi màu phát sáng), đồ bắt được vẽ con vật
function goodIco(id) {
  if (MUTANTS[id]) return `<span class="cico mutant">${cropSVG(MUTANTS[id].base, 3)}</span>`;
  return `<span class="cico">${CROPS[id] ? cropSVG(id, 3) : catchSVG(id)}</span>`;
}
