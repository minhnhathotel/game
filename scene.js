// Hình vẽ bản đồ theo phong cách Don't Starve: nét mực đen run tay, màu đất trầm, hình méo mó xiêu vẹo.

const K = '#1b1611'; // màu mực
const ink = (w = 3) => `stroke="${K}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

const SCENE_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
  <filter id="sketch" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="4" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <pattern id="gDirt" width="40" height="40" patternUnits="userSpaceOnUse">
    <rect width="40" height="40" fill="#8a6e4b"/>
    <circle cx="6" cy="8" r="2.2" fill="#6e553a"/><circle cx="26" cy="5" r="1.6" fill="#a3865e"/>
    <circle cx="33" cy="22" r="2.6" fill="#6e553a"/><circle cx="14" cy="28" r="1.8" fill="#a3865e"/>
    <circle cx="22" cy="36" r="1.4" fill="#5e4630"/><path d="M2 20 l6 -2 M30 34 l5 1" stroke="#5e4630" stroke-width="1.5"/>
  </pattern>
</defs></svg>`;

const SHADOW = '<ellipse class="sh" cx="112" cy="188" rx="100" ry="12" fill="rgba(20,15,10,.35)"/>';

// ---------- Ngôi nhà ----------
function kitchenSVG() {
  const win = (pts, cx, cy) => `<polygon points="${pts}" fill="#e3b85a"/>
    <path d="M${cx} ${cy - 12} L${cx + 1} ${cy + 12} M${cx - 12} ${cy + 1} L${cx + 12} ${cy - 1}" stroke="${K}" stroke-width="2"/>`;
  return `<svg viewBox="0 0 220 200">${SHADOW}
    <polygon points="160,94 198,80 201,164 165,183" fill="#5e4430"/>
    <polygon points="42,100 160,94 165,183 38,185" fill="#86663f"/>
    <path d="M62 99 L60 184 M84 98 L83 184 M128 96 L130 184 M146 95 L148 183 M178 88 L180 174" stroke="#5e4430" stroke-width="2.5"/>
    <polygon points="104,24 178,100 214,84 142,8" fill="#5a2a22"/>
    <path d="M120 30 L190 98 M134 20 L202 90 M112 40 L170 102" stroke="#3e1d17" stroke-width="2"/>
    <polygon points="150,34 170,30 174,72 153,76" fill="#8d8a83"/>
    <path d="M152 46 L172 44 M153 58 L173 56 M160 33 L161 45 M166 44 L167 57" stroke="#5f5c56" stroke-width="2"/>
    <g class="smoke"><circle cx="162" cy="22" r="8"/><circle cx="162" cy="22" r="8"/><circle cx="162" cy="22" r="8"/></g>
    <polygon points="26,108 102,24 180,102" fill="#7d3b2c"/>
    <path d="M50 88 L156 86 M68 68 L136 66 M84 48 L118 47" stroke="#5a2a22" stroke-width="2.5"/>
    ${win('90,54 112,53 113,73 91,74', 101, 63)}
    ${win('54,122 78,119 80,144 56,146', 67, 132)}
    ${win('126,118 150,117 151,141 127,142', 138, 129)}
    <polygon points="88,185 86,136 114,132 118,185" fill="#3e2c1f"/>
    <circle cx="110" cy="160" r="2.5" fill="#c99a3a"/>
    <polygon points="80,106 124,103 126,120 82,122" fill="#c9ab78"/>
    <text x="103" y="117" font-size="12" fill="${K}" text-anchor="middle" font-family="'Grenze Gotisch',serif" font-weight="800">BẾP</text>
    <path d="M8 198 L16 178 M44 198 L36 178 M26 200 L26 182" stroke="${K}" stroke-width="3.5" stroke-linecap="round"/>
    <ellipse cx="26" cy="170" rx="21" ry="15" fill="#8d8a83"/>
    <path d="M10 172 Q26 182 42 172" stroke="#5f5c56" stroke-width="2" fill="none"/>
    <ellipse cx="26" cy="158" rx="15" ry="5" fill="#a8a39a"/>
    <rect x="22" y="147" width="8" height="8" rx="2" fill="#6b675f"/>
  </svg>`;
}

function barnSVG() {
  return `<svg viewBox="0 0 220 200">${SHADOW}
    <polygon points="160,100 198,86 200,166 164,184" fill="#5e4430"/>
    <polygon points="46,104 160,100 164,184 42,186" fill="#7a5a3a"/>
    <path d="M46 124 L161 121 M45 144 L162 142 M44 164 L163 163" stroke="#5e4430" stroke-width="2.5"/>
    <polygon points="172,44 176,104 212,88 206,32" fill="#4e4036"/>
    <polygon points="30,110 50,54 172,44 178,104" fill="#6e5b48"/>
    <path d="M60 52 L44 108 M90 50 L80 107 M120 47 L116 106 M150 45 L150 104" stroke="#54453a" stroke-width="2.5"/>
    <polygon points="178,112 190,108 191,128 179,132" fill="#2a2018"/>
    <polygon points="82,186 80,128 128,126 130,186" fill="#4e3a26"/>
    <path d="M84 130 L127 183 M126 129 L84 183" stroke="${K}" stroke-width="9" stroke-linecap="round"/>
    <path d="M84 130 L127 183 M126 129 L84 183" stroke="#8a6a45" stroke-width="5" stroke-linecap="round"/>
    <polygon points="84,107 126,105 127,121 85,123" fill="#c9ab78"/>
    <text x="106" y="118" font-size="12" fill="${K}" text-anchor="middle" font-family="'Grenze Gotisch',serif" font-weight="800">KHO</text>
    <rect x="2" y="166" width="42" height="26" rx="3" fill="#8a5a2c"/>
    <path d="M2 166 Q23 154 44 166" fill="#9c6a36"/>
    <path d="M12 160 V192 M34 160 V192" stroke="#64615b" stroke-width="4"/>
    <rect x="19" y="170" width="8" height="8" rx="1" fill="#c99a3a"/>
  </svg>`;
}

function shopSVG() {
  const n = 8, x0 = 22, x1 = 198, w = (x1 - x0) / n;
  const ty = (x) => 112 - (x - x0) * 0.045, by = (x) => 128 + (x - x0) * 0.03;
  const stripes = Array.from({ length: n }, (_, i) => {
    const a = x0 + i * w, b = a + w;
    return `<polygon points="${a},${ty(a)} ${b},${ty(b)} ${b},${by(b)} ${a + w / 2},${by(a + w / 2) + 9} ${a},${by(a)}"
      fill="${i % 2 ? '#d9c9a3' : '#8e2a24'}"/>`;
  }).join('');
  return `<svg viewBox="0 0 220 200">${SHADOW}
    <polygon points="110,30 190,118 214,106 140,22" fill="#a8936a"/>
    <polygon points="30,120 110,30 190,118" fill="#c9b48a"/>
    <polygon points="56,96 76,92 78,110 58,112" fill="#9c7a50"/>
    <path d="M56 96 L76 92 L78 110 L58 112 Z" fill="none" stroke="${K}" stroke-width="1.5" stroke-dasharray="3 3"/>
    <polygon points="130,80 146,82 145,98 129,96" fill="#8a6e4b"/>
    <path d="M86 52 L84 70 M136 54 L138 70" stroke="${K}" stroke-width="2"/>
    <polygon points="60,68 160,64 162,88 62,92" fill="#c9ab78"/>
    <text x="111" y="84" font-size="15" fill="${K}" text-anchor="middle" font-family="'Grenze Gotisch',serif" font-weight="800">CỬA HÀNG</text>
    <polygon points="30,128 37,127 38,188 31,188" fill="#6b4f33"/>
    <polygon points="184,126 191,125 192,186 185,186" fill="#6b4f33"/>
    ${stripes}
    <polygon points="36,150 186,146 188,188 34,190" fill="#7a5a3a"/>
    <path d="M35 164 L187 160 M35 176 L188 173" stroke="#5e4430" stroke-width="2.5"/>
    <path d="M52 146 L60 128 L68 146 Z M70 146 L78 126 L86 146 Z" fill="#d9772e"/>
    <path d="M60 128 l-3 -6 M60 128 l3 -7 M78 126 l-3 -6 M78 126 l3 -7" stroke="#4b6a3e" stroke-width="3" stroke-linecap="round"/>
    <circle cx="104" cy="140" r="5" fill="#b8332e"/><circle cx="114" cy="142" r="5" fill="#b8332e"/><circle cx="109" cy="134" r="5" fill="#b8332e"/>
    <ellipse cx="150" cy="136" rx="17" ry="12" fill="#d07a2a"/>
    <path d="M144 126 Q150 136 144 147 M156 126 Q150 136 156 147" stroke="#9c5420" stroke-width="2" fill="none"/>
    <path d="M150 124 l2 -7" stroke="#4b6a3e" stroke-width="3.5" stroke-linecap="round"/>
  </svg>`;
}

// Bảng gỗ ghim giấy đặt hàng
function boardSVG() {
  const note = (x, y, r, c = '#efe8da') => `<g transform="translate(${x} ${y}) rotate(${r})">
    <polygon points="-14,-16 14,-17 15,16 -13,17" fill="${c}"/>
    <path d="M-8 -6 h15 M-8 0 h13 M-8 6 h10" stroke="#8a7a5e" stroke-width="2"/>
    <circle cx="0" cy="-13" r="3" fill="#b8332e"/></g>`;
  return `<svg viewBox="0 0 160 150">
    <ellipse class="sh" cx="80" cy="142" rx="64" ry="8" fill="rgba(20,15,10,.35)"/>
    <polygon points="30,40 40,40 42,142 32,142" fill="#5e4430"/>
    <polygon points="120,38 130,38 128,142 118,142" fill="#5e4430"/>
    <polygon points="12,30 150,24 152,102 10,108" fill="#86663f"/>
    <path d="M12 56 L151 51 M11 82 L152 77" stroke="#5e4430" stroke-width="2.5"/>
    <polygon points="4,30 80,6 156,24 150,32 80,16 10,38" fill="#5a2a22"/>
    ${note(40, 66, -6)}${note(80, 62, 4, '#e3d39a')}${note(120, 68, -3)}
  </svg>`;
}

// Cầu gỗ câu cá chìa ra ao: ván gỗ trên các cọc, cuối cầu có cần câu cắm sẵn
function dockSVG() {
  const planks = Array.from({ length: 8 }, (_, i) => {
    const x = 6 + i * 20;
    return `<polygon points="${x},34 ${x + 19},33 ${x + 20},56 ${x + 1},57" fill="${i % 2 ? '#8a6a45' : '#7a5a3a'}"/>`;
  }).join('');
  const post = 'M18 56 L18 82 M62 56 L62 84 M106 56 L106 84 M150 56 L150 82';
  return `<svg viewBox="0 0 170 90">
    <ellipse class="sh" cx="90" cy="82" rx="76" ry="7" fill="rgba(20,15,10,.25)"/>
    <path d="${post}" stroke="${K}" stroke-width="8" stroke-linecap="round"/>
    <path d="${post}" stroke="#5e4430" stroke-width="4" stroke-linecap="round"/>
    ${planks}
    <path d="M10 40 L164 38 M10 50 L164 49" stroke="#5e4430" stroke-width="1.5"/>
    <path d="M152 36 L160 4" stroke="${K}" stroke-width="5" stroke-linecap="round"/>
    <path d="M152 36 L160 4" stroke="#b08a5a" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M160 4 Q170 30 168 62" stroke="#e8e0cc" stroke-width="1.2" fill="none"/>
    <rect x="118" y="24" width="18" height="12" rx="2" fill="#6b675f"/>
  </svg>`;
}

// ---------- Cây cối & vật trang trí ----------
// Cụm hình tròn có viền mực liền mạch
function cloud(circles, fill, outline, w = 6) {
  const cs = circles.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('');
  return `<g fill="${outline}" stroke="${outline}" stroke-width="${w}">${cs}</g><g fill="${fill}">${cs}</g>`;
}

// Cây thông nhọn nhiều tầng — biểu tượng của Don't Starve
function pineSVG(v = 0) {
  const [dark, light] = [['#2e4638', '#3f5d48'], ['#34503f', '#48684f'], ['#283d31', '#3a5543']][v % 3];
  const tier = (cx, top, w, h) => {
    const l = cx - w / 2, r = cx + w / 2, b = top + h;
    return `<path d="M${cx} ${top} L${cx + w * .2} ${top + h * .42} L${cx + w * .1} ${top + h * .44} L${r} ${b - 4}
      L${cx + w * .28} ${b - h * .1} L${cx + w * .12} ${b + 2} L${cx - w * .06} ${b - h * .12} L${cx - w * .26} ${b + 1}
      L${l} ${b - 3} L${cx - w * .12} ${top + h * .46} L${cx - w * .22} ${top + h * .4} Z" fill="${dark}" ${ink()}/>
      <path d="M${cx - 2} ${top + 8} L${cx - w * .16} ${top + h * .4} M${cx - w * .12} ${top + h * .55} L${cx - w * .34} ${b - 6}"
      stroke="${light}" stroke-width="5" stroke-linecap="round"/>`;
  };
  return `<svg viewBox="0 0 100 170">
    <ellipse cx="50" cy="160" rx="38" ry="8" fill="rgba(20,15,10,.35)"/>
    <path d="M45 160 L47 118 L54 118 L56 160 Z" fill="#5a4030" ${ink()}/>
    ${tier(50, 64, 92, 62)}${tier(50, 34, 70, 50)}${tier(50, 6, 48, 42)}
  </svg>`;
}

// Cây tròn thân vặn (kiểu birchnut), có 3 màu lá
function birchSVG(v = 0) {
  const [base, lit, line] = [['#b08a3c', '#c9a352', '#8a6a2a'], ['#6f8a4a', '#87a35a', '#55703a'], ['#a3542e', '#bf6a3c', '#7f3f22']][v % 3];
  const C = [[34, 62, 24], [84, 62, 24], [60, 40, 32], [60, 72, 22], [40, 28, 16], [80, 28, 16]];
  return `<svg viewBox="0 0 120 150">
    <ellipse cx="60" cy="142" rx="40" ry="7" fill="rgba(20,15,10,.35)"/>
    <path d="M52 142 C56 120 46 104 54 82 L65 82 C60 104 70 120 67 142 Z" fill="#6b4f33" ${ink()}/>
    <path d="M56 100 C50 92 40 90 34 80 M62 96 C70 90 78 90 84 80" fill="none" ${ink(3.5)}/>
    ${cloud(C, base, K)}
    <g fill="${lit}">${C.map(([x, y, r]) => `<circle cx="${x - r * .15}" cy="${y - r * .2}" r="${r * .72}"/>`).join('')}</g>
    ${C.map(([x, y, r]) => `<path d="M${x - r * .7} ${y + r * .3} q${r * .7} ${r * .45} ${r * 1.4} 0" stroke="${line}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`).join('')}
  </svg>`;
}

function berrySVG() {
  const C = [[22, 36, 16], [58, 36, 16], [40, 26, 20], [40, 42, 16]];
  const berries = [[18, 34], [30, 22], [46, 18], [56, 32], [40, 40], [26, 44], [62, 42]];
  return `<svg viewBox="0 0 80 62">
    <ellipse cx="40" cy="56" rx="34" ry="5" fill="rgba(20,15,10,.35)"/>
    ${cloud(C, '#4b6a3e', K, 5)}
    <g fill="#5e8048">${C.map(([x, y, r]) => `<circle cx="${x - 2}" cy="${y - 3}" r="${r * .7}"/>`).join('')}</g>
    ${berries.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.6" fill="#b8332e" ${ink(1.5)}/>`).join('')}
  </svg>`;
}

// ---------- Biểu tượng giao diện (vẽ tay cùng nét mực với bản đồ) ----------
function uiIcon(name) {
  const o = (w = 2.4) => `stroke="${K}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const art = {
    storage: `<path d="M8 16 L32 16 L29 34 L11 34 Z" fill="#a8835a" ${o()}/><path d="M10 22 H30 M11 28 H29" stroke="#6b4f33" stroke-width="2"/>
      <path d="M12 16 Q20 4 28 16" fill="none" ${o(3)}/>`,
    kitchen: `<path d="M7 18 H33 L31 32 Q20 37 9 32 Z" fill="#6b675f" ${o()}/><path d="M5 18 H35" ${o(3)}/>
      <path d="M14 14 q-2 -4 1 -8 M20 14 q-2 -4 1 -8 M26 14 q-2 -4 1 -8" fill="none" stroke="#efe8da" stroke-width="2" stroke-linecap="round"/>`,
    shop: `<path d="M14 10 L26 10 L23 15 Q34 20 32 30 Q30 36 20 36 Q10 36 8 30 Q6 20 17 15 Z" fill="#c9a36b" ${o()}/><path d="M15 15 H25" ${o(2)}/>
      <circle cx="20" cy="27" r="5" fill="#d9b84a" ${o(1.6)}/>`,
    fire: `<path d="M20 4 C30 14 32 24 26 32 C22 37 18 37 14 32 C8 24 12 16 16 12 C16 18 18 20 20 20 C22 14 18 10 20 4 Z" fill="#e8742a" ${o()}/>
      <path d="M20 22 C24 26 24 31 20 34 C16 31 16 26 20 22 Z" fill="#ffd36b"/>`,
    pond: `<path d="M28 20 L37 13 L36 20 L37 27 Z" fill="#7d8a8c" ${o(2)}/><path d="M4 20 Q12 9 24 11 Q30 13 30 20 Q30 27 24 29 Q12 31 4 20 Z" fill="#7d8a8c" ${o()}/>
      <circle cx="10" cy="18" r="1.8" fill="${K}"/><path d="M14 23 Q20 27 26 23" stroke="#d8d0b8" stroke-width="2" fill="none"/>`,
    orders: `<rect x="9" y="8" width="22" height="26" rx="2" fill="#efe8da" ${o()}/><path d="M13 15 H27 M13 20 H27 M13 25 H22" stroke="#8a7a5e" stroke-width="2"/>
      <circle cx="20" cy="8" r="3" fill="#b8332e" ${o(1.5)}/>`,
    book: `<path d="M6 10 Q13 7 20 11 Q27 7 34 10 L34 32 Q27 29 20 33 Q13 29 6 32 Z" fill="#efe2c2" ${o()}/><path d="M20 11 V33" ${o(2)}/>
      <path d="M9 15 Q13 13 17 15 M23 15 Q27 13 31 15 M9 20 Q13 18 17 20 M23 20 Q27 18 31 20" stroke="#8a7a5e" stroke-width="1.6" fill="none"/>`,
    water: `<path d="M8 16 H26 L25 33 H9 Z" fill="#7d8a8c" ${o()}/><path d="M26 20 L35 12" ${o(3)}/><path d="M12 16 Q17 8 22 16" fill="none" ${o(2.4)}/>
      <path d="M37 17 l1 3 M34 21 l0 3" stroke="#6fa0c8" stroke-width="2.2" stroke-linecap="round"/>`,
    harvest: `<path d="M9 35 L19 24" ${o(4.5)}/><path d="M9 35 L19 24" stroke="#8a6a45" stroke-width="2"/>
      <path d="M19 24 C10 14 18 3 31 5 C23 8 19 14 23 22 Z" fill="#b8b4ab" ${o(2)}/>`,
    fert: `<path d="M7 31 H33" ${o(2.4)}/><path d="M20 31 V18" ${o(2.4)}/>
      <path d="M20 20 C14 20 10 16 10 11 C16 11 20 14 20 20 Z M20 18 C26 18 30 14 30 9 C24 9 20 12 20 18 Z" fill="#7fa04a" ${o(1.8)}/>
      <circle cx="12" cy="34" r="1.8" fill="#efe8da" ${o(1)}/><circle cx="27" cy="34" r="1.8" fill="#efe8da" ${o(1)}/>`,
    land: `<path d="M30 5 L17 22" ${o(4.5)}/><path d="M30 5 L17 22" stroke="#8a6a45" stroke-width="2"/>
      <path d="M14 18 L22 26 L14 35 Q6 33 6 26 Z" fill="#9c988f" ${o(2)}/><path d="M27 3 L34 9" ${o(3.2)}/>`,
    energy: `<path d="M25 12 C31 16 31 21 27 25 L10 36 L16 18 C18 14 21 11 25 12 Z" fill="#d9772e" ${o()}/>
      <path d="M25 12 L28 4 M26 13 L34 8 M26 13 L33 15" stroke="#4b6a3e" stroke-width="3" stroke-linecap="round"/>`,
    poison: `<path d="M8 18 Q8 6 20 6 Q32 6 32 18 Q32 24 28 26 L28 33 H12 L12 26 Q8 24 8 18 Z" fill="#9cc46c" ${o()}/>
      <circle cx="15" cy="18" r="3.4" fill="${K}"/><circle cx="25" cy="18" r="3.4" fill="${K}"/><path d="M16 33 V28 M20 33 V28 M24 33 V28" ${o(1.6)}/>`,
    axe: `<path d="M12 36 L26 8" ${o(4.5)}/><path d="M12 36 L26 8" stroke="#8a6a45" stroke-width="2.2"/><path d="M22 6 Q35 6 36 19 L26 16 Z" fill="#9c988f" ${o(2)}/>`,
    rod: `<path d="M6 36 L30 4" ${o(4)}/><path d="M6 36 L30 4" stroke="#b08a5a" stroke-width="2"/><path d="M30 4 Q37 16 34 28" stroke="${K}" stroke-width="1.2" fill="none"/>
      <circle cx="34" cy="30" r="3" fill="#c94a3a" ${o(1.4)}/><circle cx="12" cy="28" r="3.5" fill="#6b675f" ${o(1.5)}/>`,
    install: `<rect x="5" y="7" width="30" height="21" rx="2" fill="#4f6f78" ${o(2.4)}/><path d="M14 34 H26 M20 28 V34" ${o(2.6)}/>
      <path d="M20 10 V22 M15 17 L20 22 L25 17" fill="none" stroke="#efe8da" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    download: `<path d="M16 4 H24 V17 H30 L20 28 L10 17 H16 Z" fill="#7fa04a" ${o(2.2)}/>
      <path d="M6 26 V34 H34 V26" fill="none" ${o(3.2)}/>`,
    coin: `<circle cx="20" cy="20" r="14" fill="#d9b84a" ${o()}/><circle cx="20" cy="20" r="9" fill="none" stroke="#a8862a" stroke-width="2"/>
      <path d="M16 16 H24 M20 16 V26" stroke="#a8862a" stroke-width="2.6" stroke-linecap="round"/>`,
  }[name] || '';
  return `<svg viewBox="0 0 40 40" aria-hidden="true">${art}</svg>`;
}

// ---------- Đồ đạc quanh nhà & bãi cỏ ----------
function barrelSVG() {
  return `<svg viewBox="0 0 40 46">
    <ellipse cx="20" cy="43" rx="16" ry="3" fill="rgba(20,15,10,.35)"/>
    <path d="M6 8 Q4 24 6 40 L34 40 Q36 24 34 8 Z" fill="#86663f" ${ink(2.4)}/>
    <path d="M5 16 H35 M5 32 H35" stroke="${K}" stroke-width="3"/>
    <ellipse cx="20" cy="8" rx="14" ry="4" fill="#a8835a" ${ink(2.2)}/>
  </svg>`;
}
// sọt gỗ đựng cà rốt, cà chua
function crateSVG() {
  return `<svg viewBox="0 0 44 40">
    <ellipse cx="22" cy="37" rx="19" ry="3" fill="rgba(20,15,10,.35)"/>
    <circle cx="14" cy="11" r="5" fill="#d9772e" ${ink(1.6)}/><circle cx="25" cy="10" r="5" fill="#b8332e" ${ink(1.6)}/>
    <polygon points="4,12 38,10 40,36 6,37" fill="#9c7a50" ${ink(2.4)}/>
    <path d="M6 14 L38 34 M38 12 L7 35" stroke="#6b4f33" stroke-width="3"/>
  </svg>`;
}
// đống củi xếp, có cây rìu dựng bên cạnh
function woodpileSVG() {
  const log = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="7" ry="6.5" fill="#c9a36b" ${ink(2)}/>
    <circle cx="${x}" cy="${y}" r="2.5" fill="none" stroke="#8a6a45" stroke-width="1.3"/>`;
  return `<svg viewBox="0 0 60 44">
    <ellipse cx="28" cy="41" rx="26" ry="3.5" fill="rgba(20,15,10,.35)"/>
    ${log(10, 32)}${log(24, 33)}${log(38, 32)}${log(17, 20)}${log(31, 20)}${log(24, 9)}
    <path d="M46 40 L54 8" stroke="${K}" stroke-width="5" stroke-linecap="round"/>
    <path d="M46 40 L54 8" stroke="#8a6a45" stroke-width="2.4" stroke-linecap="round"/>
    <path d="M50 10 L58 4 L60 16 Z" fill="#8d8a83" ${ink(1.6)}/>
  </svg>`;
}
function logSVG() {
  return `<svg viewBox="0 0 90 40">
    <ellipse cx="45" cy="35" rx="40" ry="5" fill="rgba(20,15,10,.3)"/>
    <path d="M10 14 L74 10 Q82 20 74 30 L10 32 Z" fill="#6b4f33" ${ink(2.5)}/>
    <path d="M18 18 L64 15 M20 25 L60 23" stroke="#4e3a26" stroke-width="2"/>
    <ellipse cx="10" cy="23" rx="7" ry="9" fill="#c9a36b" ${ink(2.5)}/>
    <ellipse cx="10" cy="23" rx="3.5" ry="4.5" fill="none" stroke="#8a6a45" stroke-width="1.5"/>
    <path d="M44 11 q4 -8 10 -6" stroke="#6f8a4a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  </svg>`;
}
// cụm nấm mũ đỏ & vàng chấm trắng
function mushroomSVG() {
  const cap = (x, y, r, c) => `<path d="M${x - r} ${y} Q${x - r} ${y - r * 1.1} ${x} ${y - r * 1.1} Q${x + r} ${y - r * 1.1} ${x + r} ${y} Z" fill="${c}" ${ink(2)}/>
    <circle cx="${x - r * 0.4}" cy="${y - r * 0.6}" r="${r * 0.18}" fill="#efe8da"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.45}" r="${r * 0.14}" fill="#efe8da"/>`;
  const stalk = (x, y, h) => `<rect x="${x - 3}" y="${y}" width="6" height="${h}" rx="2" fill="#e8dcc0" ${ink(1.8)}/>`;
  return `<svg viewBox="0 0 50 40">
    <ellipse cx="25" cy="37" rx="20" ry="3.5" fill="rgba(20,15,10,.3)"/>
    ${stalk(16, 22, 15)}${stalk(33, 26, 11)}${cap(16, 24, 11, '#a8382f')}${cap(33, 28, 8, '#c9963a')}
  </svg>`;
}

// cụm nấm dại hái được: mọi cụm cùng một màu mũ, v chỉ đổi số cây trong cụm —
// nhìn hoàn toàn không phân biệt được nấm độc hay nấm lành
function wildShroomSVG(v = 0) {
  const one = (x, y, r, h) => `<rect x="${x - 2.5}" y="${y}" width="5" height="${h}" rx="2" fill="#e8dcc0" ${ink(1.6)}/>
    <path d="M${x - r} ${y + 1} Q${x - r} ${y - r} ${x} ${y - r} Q${x + r} ${y - r} ${x + r} ${y + 1} Z" fill="#a8683a" ${ink(1.8)}/>
    <circle cx="${x - r * 0.35}" cy="${y - r * 0.45}" r="${r * 0.18}" fill="#efe8da"/><circle cx="${x + r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.14}" fill="#efe8da"/>`;
  return `<svg viewBox="0 0 40 34">
    <ellipse cx="20" cy="31" rx="16" ry="3" fill="rgba(20,15,10,.3)"/>
    ${one(13, 18, 8, 12)}${one(27, 22, 6, 8)}${v % 2 ? one(21, 26, 4, 5) : ''}
  </svg>`;
}

// sói xám đứng thẳng hai chân, cao lêu nghêu, mõm dài, mí mắt sụp ngái ngủ, tay khoanh sau lưng,
// đuôi dài xù chấm đất; nhìn sang phải (mắt phát sáng trong đêm vẽ riêng bằng .wolf-eye)
function wolfSVG() {
  const G = '#8d8f8c', G2 = '#74766f';
  const legs = 'M39 94 L35 121 M48 94 L51 121';
  const arm = 'M41 50 C31 58 29 70 37 79';
  return `<svg viewBox="0 0 80 130">
    <ellipse cx="42" cy="126" rx="32" ry="4" fill="rgba(0,0,0,.35)"/>
    <path d="M35 86 C20 90 8 104 3 121 C13 117 21 112 28 104 C25 112 26 119 24 125 C33 117 38 105 41 96 Z" fill="${G}" ${ink(2.5)}/>
    <path d="M14 110 l5 -4 M20 116 l4 -5" stroke="${G2}" stroke-width="1.6"/>
    <path d="${legs}" stroke="${K}" stroke-width="7.5" stroke-linecap="round"/>
    <path d="${legs}" stroke="${G}" stroke-width="3.8" stroke-linecap="round"/>
    <ellipse cx="38" cy="123" rx="7.5" ry="3.2" fill="#56584f" ${ink(1.8)}/>
    <ellipse cx="55" cy="123" rx="7.5" ry="3.2" fill="#56584f" ${ink(1.8)}/>
    <path d="M42 37 C55 41 59 60 57 78 C56 90 52 98 45 100 C35 101 30 92 31 80 C32 64 32 45 42 37 Z" fill="${G}" ${ink(3)}/>
    <path d="M49 52 C55 62 55 80 49 94 C45 82 45 64 49 52 Z" fill="#b8b8b0"/>
    <path d="${arm}" fill="none" stroke="${K}" stroke-width="7" stroke-linecap="round"/>
    <path d="${arm}" fill="none" stroke="${G2}" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M40 34 C40 22 48 16 56 18 L74 33 C79 36 79 42 74 43 L58 42 C48 44 40 42 40 34 Z" fill="${G}" ${ink(3)}/>
    <path d="M44 23 L41 2 L52 18 Z" fill="${G}" ${ink(2.5)}/>
    <path d="M51 19 L57 3 L61 22 Z" fill="${G2}" ${ink(2.5)}/>
    <path d="M45 18 L43 8 M54 17 L57 9" stroke="#b8b8b0" stroke-width="1.6"/>
    <ellipse cx="75.5" cy="38" rx="3.6" ry="3" fill="${K}"/>
    <path d="M60 41.5 Q67 43.5 73 41.5" stroke="${K}" stroke-width="1.6" fill="none"/>
    <ellipse cx="59" cy="28.5" rx="4.6" ry="3" fill="#efe8da" ${ink(1.4)}/>
    <circle cx="60.6" cy="29.6" r="1.4" fill="${K}"/>
    <path d="M54 27.5 Q59 23.5 64 27.5 L64 26 Q59 21 54 26 Z" fill="${G2}" ${ink(1.6)}/>
    <path d="M53 22.5 L64.5 24.5" stroke="${K}" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M42 39 l-5 4 l6 0 l-4 4 l7 -2" fill="${G}" ${ink(1.6)}/>
  </svg>`;
}

// sỏi nhỏ rải hai bên mép đường mòn
function renderPebbles() {
  const edge = document.querySelector('.paths .edge');
  const len = edge.getTotalLength();
  seed = 23;
  let html = '';
  for (let s = 12; s < len - 2; s += rnd(24, 58)) {
    const p = edge.getPointAtLength(s), q = edge.getPointAtLength(s + 1);
    const n = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    const off = (rnd(0, 1) < 0.5 ? -1 : 1) * rnd(15, 25);
    const x = p.x - ((q.y - p.y) / n) * off, y = p.y + ((q.x - p.x) / n) * off;
    html += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rnd(2.5, 5).toFixed(1)}" ry="${rnd(2, 3.5).toFixed(1)}"
      fill="${rnd(0, 1) < 0.5 ? '#9c988f' : '#7f7c75'}" stroke="${K}" stroke-width="1.5"/>`;
  }
  document.querySelector('.paths').insertAdjacentHTML('beforeend', `<g class="pebbles">${html}</g>`);
}

// gốc cây vừa bị chặt, có chồi non đang mọc lại; H = chiều cao khung (170 như pineSVG, 125 như birchSVG)
function stumpSVG(H = 170) {
  return `<svg viewBox="0 0 100 ${H}"><g transform="translate(0 ${H - 170})">
    <ellipse cx="50" cy="160" rx="30" ry="7" fill="rgba(20,15,10,.35)"/>
    <path d="M30 160 L33 132 L67 132 L70 160 Z" fill="#6b4f33" ${ink()}/>
    <ellipse cx="50" cy="132" rx="17" ry="6" fill="#c9a36b" ${ink(2.5)}/>
    <ellipse cx="50" cy="132" rx="9" ry="3" fill="none" stroke="#8a6a45" stroke-width="1.6"/>
    <path d="M60 146 q8 -6 10 -16" stroke="${K}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M60 146 q8 -6 10 -16" stroke="#6f8a4a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="71" cy="128" rx="5" ry="3" fill="#6f8a4a" ${ink(1.4)}/>
  </g></svg>`;
}

function grassSVG() {
  return `<svg viewBox="0 0 50 46">
    <ellipse cx="25" cy="42" rx="20" ry="4" fill="rgba(20,15,10,.3)"/>
    <path d="M10 42 Q8 22 2 8 Q14 20 18 42 Z M18 42 Q18 18 22 2 Q28 20 26 42 Z M26 42 Q30 20 44 10 Q36 26 34 42 Z"
      fill="#b9a55c" ${ink(2)}/>
    <path d="M14 40 Q13 26 9 16 M23 40 Q23 24 22 12 M31 40 Q33 28 39 18" stroke="#8c7a3c" stroke-width="1.5" fill="none"/>
  </svg>`;
}

function saplingSVG() {
  const twig = 'M20 52 Q18 32 22 10 M20 34 Q12 28 8 20 M21 26 Q28 20 32 12';
  return `<svg viewBox="0 0 40 56">
    <ellipse cx="20" cy="52" rx="14" ry="3.5" fill="rgba(20,15,10,.3)"/>
    <path d="${twig}" fill="none" stroke="${K}" stroke-width="5" stroke-linecap="round"/>
    <path d="${twig}" fill="none" stroke="#7a5a3a" stroke-width="2.4" stroke-linecap="round"/>
    <ellipse cx="8" cy="18" rx="5" ry="3" fill="#6f8a4a" ${ink(1.5)}/><ellipse cx="32" cy="10" rx="5" ry="3" fill="#6f8a4a" ${ink(1.5)}/>
    <ellipse cx="22" cy="8" rx="4" ry="2.6" fill="#6f8a4a" ${ink(1.5)}/>
  </svg>`;
}

function boulderSVG() {
  return `<svg viewBox="0 0 70 60">
    <ellipse cx="36" cy="54" rx="32" ry="5" fill="rgba(20,15,10,.35)"/>
    <path d="M8 50 L4 30 L16 12 L40 6 L60 16 L66 38 L58 52 Z" fill="#7f7c75" ${ink()}/>
    <path d="M16 14 L40 8 L58 18 L46 26 L22 26 Z" fill="#9c988f"/>
    <path d="M30 26 L34 40 L28 48 M46 26 L52 36" stroke="${K}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <circle cx="18" cy="38" r="2.4" fill="#4a4844"/><circle cx="50" cy="44" r="2" fill="#4a4844"/>
  </svg>`;
}

function campfireSVG() {
  const stones = Array.from({ length: 8 }, (_, i) => {
    const a = (i / 8) * Math.PI * 2;
    return `<ellipse cx="${45 + Math.cos(a) * 28}" cy="${60 + Math.sin(a) * 11}" rx="7" ry="5" fill="#8d8a83" ${ink(2)}/>`;
  }).join('');
  return `<svg viewBox="0 0 90 80">
    <circle class="fireglow" cx="45" cy="50" r="44" fill="#ffb347"/>
    ${stones}
    <path d="M26 64 L62 52 M28 52 L64 64" stroke="${K}" stroke-width="9" stroke-linecap="round"/>
    <path d="M26 64 L62 52 M28 52 L64 64" stroke="#6b4f33" stroke-width="5" stroke-linecap="round"/>
    <g class="flamewrap"><g class="flame">
      <path d="M45 14 C58 30 60 46 45 58 C30 46 32 30 45 14 Z" fill="#e8742a" ${ink(2.5)}/>
      <path d="M45 30 C52 38 53 48 45 55 C37 48 38 38 45 30 Z" fill="#ffd36b"/>
    </g></g>
    <g class="ash"><circle cx="40" cy="50" r="4" fill="#6b6660"/><circle cx="50" cy="48" r="3" fill="#6b6660"/></g>
  </svg>`;
}

function torchSVG() {
  return `<svg viewBox="0 0 26 70">
    <circle class="fireglow" cx="13" cy="12" r="13" fill="#ffb347"/>
    <path d="M12 68 L13 22" stroke="${K}" stroke-width="7" stroke-linecap="round"/>
    <path d="M12 68 L13 22" stroke="#7a5a3a" stroke-width="3.5" stroke-linecap="round"/>
    <g class="flame"><path d="M13 2 C20 10 20 18 13 24 C6 18 6 10 13 2 Z" fill="#e8742a" ${ink(2)}/>
      <path d="M13 10 C16 14 16 18 13 21 C10 18 10 14 13 10 Z" fill="#ffd36b"/></g>
  </svg>`;
}

// ---------- Ao ----------
// Bờ ao theo toạ độ bản đồ (đi theo chiều kim đồng hồ). Mép trái chừa đường mòn ra cầu câu;
// phần bên phải vượt khỏi khung 960 và lấn vào rừng ngoài (cây ở đó được bỏ đi).
const POND_PTS = [
  [648, 562], [700, 548], [760, 556], [830, 552], [900, 560], [950, 546], [990, 530], [1060, 524], [1130, 534],
  [1200, 538], [1262, 558], [1320, 600], [1360, 662], [1386, 742], [1390, 830], [1372, 910], [1320, 972],
  [1240, 1008], [1100, 1020], [960, 1012], [820, 1008], [700, 998], [640, 972], [608, 918], [590, 840],
  [584, 764], [604, 712], [640, 680], [644, 640], [642, 600],
];
const POND_BOX = { x: 560, y: 500, w: 850, h: 540 };   // khung vẽ ao (có chừa bờ bùn)
function inPond(x, y) {
  let inside = false;
  for (let i = 0, j = POND_PTS.length - 1; i < POND_PTS.length; j = i++) {
    const [xi, yi] = POND_PTS[i], [xj, yj] = POND_PTS[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
// đường cong khép kín mềm mại đi qua các điểm (Catmull-Rom → Bézier)
function smoothClosed(pts) {
  const n = pts.length, f = (v) => v.toFixed(1);
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)}`
      + ` ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
}

function pondSVG() {
  const { x: ox, y: oy, w, h } = POND_BOX;
  const local = POND_PTS.map(([x, y]) => [x - ox, y - oy]);
  const cx = local.reduce((s, p) => s + p[0], 0) / local.length, cy = local.reduce((s, p) => s + p[1], 0) / local.length;
  // vùng nước sâu: co bờ ao vào giữa, mỗi điểm co một chút khác nhau cho méo
  const deep = local.map(([x, y], i) => [cx + (x - cx) * (0.5 + (i % 3) * 0.05), cy + (y - cy) * (0.52 + (i % 2) * 0.05)]);
  const shore = smoothClosed(local);
  const reed = (x, y, hh) => `<path d="M${x} ${y} Q${x - 3} ${y - hh / 2} ${x + 2} ${y - hh}" stroke="${K}" stroke-width="2.5" fill="none"/>
    <ellipse cx="${x + 2}" cy="${y - hh + 6}" rx="4" ry="9" fill="#6b4f33" ${ink(1.5)}/>`;
  const fish = (x, y, cls) => `<g class="fishshadow ${cls}">
    <path d="M${x} ${y} q16 -8 28 0 q-12 8 -28 0 z M${x + 26} ${y} l10 -6 l0 12 z" fill="rgba(20,32,38,.45)"/></g>`;
  const lily = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.45}" fill="#6f8a4a" ${ink(1.5)}/>`;
  return `<svg viewBox="0 0 ${w} ${h}">
    <path d="${shore}" fill="none" stroke="${K}" stroke-width="18" stroke-linejoin="round"/>
    <path d="${shore}" fill="none" stroke="#8f7f58" stroke-width="13" stroke-linejoin="round"/>
    <path d="${shore}" fill="#4f6f78" ${ink(3.5)}/>
    <path d="${smoothClosed(deep)}" fill="#45646e"/>
    <path d="M130 130 q18 -8 36 0 M300 210 q20 -8 40 0 M210 330 q16 -6 32 0 M420 150 q18 -7 36 0 M540 320 q20 -8 40 0
      M640 160 q16 -6 32 0 M420 420 q18 -7 36 0" stroke="#7a99a0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    ${fish(220, 220, 'a')}${fish(340, 300, 'b')}${fish(150, 180, 'b')}${fish(520, 240, 'a')}
    ${lily(240, 140, 18)}${lily(120, 300, 12)}${lily(380, 260, 14)}${lily(600, 200, 16)}${lily(470, 380, 12)}
    ${reed(44, 360, 36)}${reed(54, 378, 28)}${reed(66, 396, 32)}${reed(700, 66, 34)}${reed(714, 76, 26)}${reed(260, 62, 28)}
  </svg>`;
}

function flowerSVG(v = 0) {
  const c = ['#c95b6a', '#d9b84a', '#9a7ec9', '#e8e0cc'][v % 4];
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    return `<circle cx="${12 + Math.cos(a) * 5}" cy="${10 + Math.sin(a) * 5}" r="4" fill="${c}" ${ink(1.4)}/>`;
  }).join('');
  return `<svg viewBox="0 0 24 34">
    <path d="M12 32 Q10 22 12 12" stroke="${K}" stroke-width="2.4" fill="none"/>
    <ellipse cx="8" cy="24" rx="4" ry="2" fill="#6f8a4a" ${ink(1.2)}/>
    ${petals}<circle cx="12" cy="10" r="2.6" fill="#e8b33a" ${ink(1.2)}/>
  </svg>`;
}

// ---------- Bố cục bản đồ 960 × 960 ----------
let seed = 11;
const rnd = (a, b) => a + ((seed = (seed * 9301 + 49297) % 233280) / 233280) * (b - a);
const pick = () => (rnd(0, 1) < 0.78 ? 'pine' : 'birch');

// Rừng bao quanh (luôn nằm phía sau)
const FRAME = [];
for (let x = -60; x < 1000; x += 58) FRAME.push([pick(), x + rnd(-10, 10), rnd(-150, -110), rnd(80, 110)]);
for (let x = -30; x < 1000; x += 76) FRAME.push([pick(), x + rnd(-12, 12), rnd(-80, -50), rnd(70, 95)]);
for (let y = 20; y < 960; y += 62) {
  FRAME.push([pick(), rnd(-60, -40), y + rnd(-10, 10), rnd(80, 105)]);
  FRAME.push([pick(), rnd(900, 925), y + rnd(-10, 10), rnd(80, 105)]);
}
for (let y = 60; y < 900; y += 110) {
  FRAME.push([pick(), rnd(-10, 10), y + rnd(0, 30), rnd(64, 80)]);
  FRAME.push([pick(), rnd(880, 900), y + rnd(0, 30), rnd(64, 80)]);
}
for (let x = -40; x < 1000; x += 60) FRAME.push([pick(), x + rnd(-10, 10), rnd(830, 870), rnd(80, 110)]);

// Cây rừng cạnh trái ruộng: chỉ nhích nhẹ để gốc cây không nằm trên cột đất đầu tiên (tán vẫn che bớt mép ruộng)
FRAME.forEach((d) => {
  const [t, x, y, w] = d, h = w * (t === 'pine' ? 1.7 : 1.25);
  if (y + h > 455 && y + h * 0.6 < 790 && x + w * 0.8 > 0 && x < 60) d[1] = -w * 0.8;
});
// cây không mọc dưới ao: bỏ cây rừng có gốc hoặc thân nằm trong ao
const treeInPond = (cx, top, h) => inPond(cx, top + h) || inPond(cx, top + h * 0.6);
for (let i = FRAME.length - 1; i >= 0; i--) {
  const [t, x, y, w] = FRAME[i];
  if (treeInPond(x + w / 2, y, w * (t === 'pine' ? 1.7 : 1.25))) FRAME.splice(i, 1);
}
// cây phía dưới bản đồ xếp lớp theo chân cây giống cây trang trí, để cây gần người xem đè lên cây xa
const frameZ = (d) => (d[2] > 600 ? 20 + Math.round(d[2] / 10) : 5 + Math.round((d[2] + 160) / 80));

// [loại, x, y, chiều rộng px, biến thể]
const DECOR = [
  ['boulder', 286, 186, 66], ['boulder', 728, 520, 54], ['boulder', 100, 340, 44],
  ['torch', 404, 300, 22], ['torch', 532, 300, 22],
  ['berry', 190, 318, 70], ['berry', 255, 322, 66], ['berry', 318, 316, 70],
  ['berry', 592, 318, 70], ['berry', 656, 322, 66], ['berry', 720, 316, 70],
  ['birch', 205, 60, 80, 1], ['birch', 668, 58, 84, 0],
  ['pond', POND_BOX.x, POND_BOX.y, POND_BOX.w],   // bờ ao xem POND_PTS
  // đồ đạc cạnh nhà kho, nhà bếp, cửa hàng & trên bãi cỏ
  ['barrel', 234, 262, 30], ['barrel', 256, 276, 26], ['woodpile', 578, 180, 54], ['crate', 682, 266, 38],
  ['log', 650, 418, 62],
  ['sapling', 566, 548, 28], ['sapling', 860, 300, 26], ['sapling', 340, 250, 26],
  ['grass', 250, 250, 40], ['grass', 640, 250, 40], ['grass', 700, 440, 40],
  ['grass', 552, 640, 34], ['grass', 140, 410, 34],
  // cây mọc ở hàng dưới ruộng: chặt đi mới có chỗ đặt thêm đất
  ['pine', 22, 628, 92], ['pine', 98, 676, 70], ['birch', 165, 650, 100, 0], ['pine', 240, 690, 66],
  ['pine', 300, 632, 90], ['birch', 372, 680, 84, 1], ['pine', 448, 630, 92], ['pine', 522, 676, 72],
  ['pine', 60, 740, 80], ['birch', 270, 760, 90, 2], ['pine', 470, 744, 78],
  // lớp cây dày phía dưới, giáp bìa rừng
  ['pine', 136, 722, 74], ['birch', 196, 742, 86, 1], ['pine', 336, 726, 70], ['pine', 404, 762, 84],
  ['birch', 536, 734, 80, 2],['pine', 14, 792, 88], ['birch', 108, 802, 96, 0],
  ['pine', 228, 806, 80], ['pine', 300, 790, 72], ['pine', 356, 818, 90], ['birch', 448, 800, 92, 1],
  ['pine', 518, 812, 84],
];
const FLOWERS = [
  [380, 230, 0], [552, 236, 1], [720, 470, 2], [660, 470, 3], [566, 700, 2],
];
const DRAW = {
  pine: () => pineSVG(Math.floor(rnd(0, 3))), birch: (v) => birchSVG(v ?? Math.floor(rnd(0, 3))),
  berry: berrySVG, grass: grassSVG, sapling: saplingSVG, boulder: boulderSVG,
  campfire: campfireSVG, torch: torchSVG, pond: pondSVG,
  barrel: barrelSVG, crate: crateSVG, woodpile: woodpileSVG, log: logSVG, mushroom: mushroomSVG,
};

// Rừng lấp kín phần màn hình ngoài khung 960×960 (vẽ chung trong 1 SVG để nhẹ máy)
function renderForest(W, H, ox, oy) {
  seed = 97;
  const trees = [];
  for (let y = -90; y < H; y += 64) {
    for (let x = -50; x < W; x += 62) {
      const tx = x + rnd(-14, 14), ty = y + rnd(-12, 12);
      const inside = tx > ox - 30 && tx < ox + 900 && ty > oy - 60 && ty < oy + 860;
      const w = rnd(80, 110), kind = pick();
      // khung cây cao w × 1.7, cây vẽ sát đáy khung; toạ độ ao tính theo khung bản đồ 960
      if (!inside && !treeInPond(tx + w / 2 - ox, ty - oy, w * 1.7)) trees.push([tx, ty, w, kind]);
    }
  }
  trees.sort((a, b) => a[1] - b[1]);
  const svg = trees.map(([x, y, w, t]) =>
    (t === 'pine' ? pineSVG(Math.floor(rnd(0, 3))) : birchSVG(Math.floor(rnd(0, 3))))
      .replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${w * 1.7}" preserveAspectRatio="xMidYMax meet" `)).join('');
  document.getElementById('forest').innerHTML =
    `<svg width="${W}" height="${H}" style="position:absolute;left:0;top:0;overflow:visible"><g filter="url(#sketch)">${svg}</g></svg>`;
}

function renderScene() {
  document.body.insertAdjacentHTML('afterbegin', SCENE_DEFS);
  document.querySelector('#b-kitchen .bsvg').innerHTML = kitchenSVG();
  document.querySelector('#b-storage .bsvg').innerHTML = barnSVG();
  document.querySelector('#b-shop .bsvg').innerHTML = shopSVG();
  document.querySelector('#b-fire .bsvg').innerHTML = campfireSVG();
  document.querySelector('#b-orders .bsvg').innerHTML = boardSVG();
  document.querySelector('#b-pond .bsvg').innerHTML = dockSVG();

  // cây (pine/birch) có data-tree để game.js cho chặt; mọi vật đều có data-kind để tính chỗ trống đặt đất
  const item = ([t, x, y, w, v], z, id) =>
    `<div class="decor" data-kind="${t}"${t === 'pine' || t === 'birch' ? ` data-tree="${id}"` : ''}
      style="left:${x}px; top:${y}px; width:${w}px; z-index:${z}">${DRAW[t](v)}</div>`;
  const items = FRAME.map((d, k) => item(d, frameZ(d), 'f' + k))
    // ao nằm sát mặt đất (dưới cầu câu & cây cối)
    .concat(DECOR.map((d, k) => item(d, d[0] === 'pond' ? 3 : 20 + Math.round(d[2] / 10), 'd' + k)));
  const flowers = FLOWERS.map(([x, y, v]) =>
    `<div class="decor" data-kind="flower" style="left:${x}px; top:${y}px; width:16px; z-index:${20 + Math.round(y / 10)}">${flowerSVG(v)}</div>`);
  // lá rơi & đom đóm
  const leaves = Array.from({ length: 12 }, (_, i) =>
    `<span class="leaf" style="left:${(i * 83) % 960}px; animation-delay:${(i * 1.7) % 14}s; animation-duration:${11 + (i % 4) * 2}s"></span>`);
  const flies = Array.from({ length: 10 }, (_, i) =>
    `<span class="firefly" style="left:${120 + ((i * 97) % 720)}px; top:${260 + ((i * 53) % 560)}px; animation-delay:${i * .8}s"></span>`);
  document.getElementById('decor').innerHTML = items.join('') + flowers.join('') + leaves.join('') + flies.join('');
  renderPebbles();
}
