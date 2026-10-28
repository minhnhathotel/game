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

function pondSVG() {
  const reed = (x, y, h) => `<path d="M${x} ${y} Q${x - 2} ${y - h / 2} ${x + 1} ${y - h}" stroke="${K}" stroke-width="2.5" fill="none"/>
    <ellipse cx="${x + 1}" cy="${y - h + 4}" rx="3" ry="6" fill="#6b4f33" ${ink(1.5)}/>`;
  return `<svg viewBox="0 0 200 120">
    <path d="M14 66 C10 34 60 18 104 22 C150 24 196 40 192 70 C188 98 140 110 96 106 C50 104 18 96 14 66 Z" fill="#4f6f78" ${ink(3.5)}/>
    <path d="M40 56 Q60 50 80 56 M110 72 Q130 66 150 72 M70 84 Q86 80 100 84" stroke="#7a99a0" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <ellipse cx="140" cy="44" rx="12" ry="5" fill="#6f8a4a" ${ink(1.5)}/>
    ${reed(22, 70, 34)}${reed(30, 76, 28)}${reed(180, 60, 36)}${reed(172, 66, 26)}
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

// [loại, x, y, chiều rộng px, biến thể]
const DECOR = [
  ['boulder', 286, 186, 66], ['boulder', 728, 520, 54], ['boulder', 100, 340, 44],
  ['torch', 404, 300, 22], ['torch', 532, 300, 22],
  ['berry', 190, 318, 70], ['berry', 255, 322, 66], ['berry', 318, 316, 70],
  ['berry', 592, 318, 70], ['berry', 656, 322, 66], ['berry', 720, 316, 70],
  ['birch', 612, 720, 110, 0], ['birch', 790, 730, 100, 2], ['birch', 205, 60, 80, 1], ['birch', 668, 58, 84, 0],
  ['pond', 690, 590, 210],
  ['sapling', 620, 580, 28], ['sapling', 860, 300, 26], ['sapling', 340, 250, 26],
  ['grass', 250, 250, 40], ['grass', 640, 250, 40], ['grass', 700, 440, 40], ['grass', 780, 450, 40],
  ['grass', 840, 520, 36], ['grass', 640, 640, 34], ['grass', 690, 860, 38], ['grass', 140, 410, 34],
];
const FLOWERS = [
  [380, 230, 0], [552, 236, 1], [720, 470, 2], [800, 480, 0], [660, 470, 3], [640, 790, 1], [660, 690, 2],
];
const DRAW = {
  pine: () => pineSVG(Math.floor(rnd(0, 3))), birch: (v) => birchSVG(v ?? Math.floor(rnd(0, 3))),
  berry: berrySVG, grass: grassSVG, sapling: saplingSVG, boulder: boulderSVG,
  campfire: campfireSVG, torch: torchSVG, pond: pondSVG,
};

// Rừng lấp kín phần màn hình ngoài khung 960×960 (vẽ chung trong 1 SVG để nhẹ máy)
function renderForest(W, H, ox, oy) {
  seed = 97;
  const trees = [];
  for (let y = -90; y < H; y += 64) {
    for (let x = -50; x < W; x += 62) {
      const tx = x + rnd(-14, 14), ty = y + rnd(-12, 12);
      const inside = tx > ox - 30 && tx < ox + 900 && ty > oy - 60 && ty < oy + 860;
      if (!inside) trees.push([tx, ty, rnd(80, 110), pick()]);
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

  const item = ([t, x, y, w, v], z) =>
    `<div class="decor" style="left:${x}px; top:${y}px; width:${w}px; z-index:${z}">${DRAW[t](v)}</div>`;
  const items = FRAME.map((d) => item(d, 2 + Math.round((d[2] + 160) / 80)))
    .concat(DECOR.map((d) => item(d, 20 + Math.round(d[2] / 10))));
  const flowers = FLOWERS.map(([x, y, v]) =>
    `<div class="decor" style="left:${x}px; top:${y}px; width:16px; z-index:${20 + Math.round(y / 10)}">${flowerSVG(v)}</div>`);
  // lá rơi & đom đóm
  const leaves = Array.from({ length: 12 }, (_, i) =>
    `<span class="leaf" style="left:${(i * 83) % 960}px; animation-delay:${(i * 1.7) % 14}s; animation-duration:${11 + (i % 4) * 2}s"></span>`);
  const flies = Array.from({ length: 10 }, (_, i) =>
    `<span class="firefly" style="left:${120 + ((i * 97) % 720)}px; top:${260 + ((i * 53) % 560)}px; animation-delay:${i * .8}s"></span>`);
  document.getElementById('decor').innerHTML = items.join('') + flowers.join('') + leaves.join('') + flies.join('');
}
