const $ = (s) => document.querySelector(s);
const SAVE_KEY = 'vuon-tho-hong-v1';
const DAY_MS = DAY_SECONDS * 1000;
const WET_MS = 30000;          // một lần tưới giữ ẩm 30 giây
const MAX_ENERGY = 100;
const ENERGY_REGEN_MS = 8000;  // hồi 1 năng lượng mỗi 8 giây
const MAX_PLOTS = 12;
// vị trí [x, y, độ xoay] của từng mảnh đất trong khu trồng — lệch nhau cho tự nhiên
const PLOT_POS = [
  [10, 8, -3], [148, 0, 2], [292, 10, -2], [432, 2, 3],
  [38, 150, 2], [182, 158, -3], [318, 148, 1], [462, 156, -2],
  [12, 300, -2], [150, 306, 3], [290, 298, -1], [430, 304, 2],
];
// tắt game quá 16 tiếng thì lửa trại tắt
const OFFLINE_FIRE_MS = 16 * 3600 * 1000;
const MAX_STOVES = 4;
const COST = { plant: 2, water: 1, harvest: 1, bug: 1 };
// Sâu phá hoại: trung bình ~90 giây cây đang lớn sẽ bị 1 con bám; để 25 giây là ăn trụi cây
const PEST_RATE = 1 / 90000;
const PEST_EAT_MS = 25000;
// Lửa trại: đầy 100, cháy 1 điểm / 4 giây; lửa tắt thì cứ 20 giây kẻ trộm lấy 1 cây
const FIRE_MAX = 100;
const FIRE_BURN_MS = 4000;
const FIRE_LOW = 20;
const WOOD_FUEL = 25;
const WOOD_PRICE = 10;
const THIEF_MS = 20000;
const burnFuel = (id) => Math.min(40, 8 + CROPS[id].sell);

// ---------- Trạng thái ----------
function newState() {
  return {
    coins: 60, energy: MAX_ENERGY, energyAcc: 0, xp: 0, level: 1,
    seeds: { muong: 4, hanh: 2, cai: 2 },
    produce: {}, dishes: {}, custom: [],
    plots: Array.from({ length: 8 }, emptyPlot),
    stoves: [null, null],
    fire: { fuel: FIRE_MAX, outMs: 0 }, wood: 3,
    last: Date.now(),
  };
}
function emptyPlot() { return { crop: null, growth: 0, wetUntil: 0, bug: false, bugMs: 0 }; }

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && Array.isArray(s.plots)) {
      s.custom = s.custom || [];
      s.fire = s.fire || { fuel: FIRE_MAX, outMs: 0 };
      if (s.wood === undefined) s.wood = 3;
      return s;
    }
  } catch (e) {}
  return newState();
}
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch (e) {}
}

let state = load();
let selectedPlot = null;
let lastHop = null;

// ---------- Mô phỏng thời gian (kể cả khi tắt game) ----------
// offline = true khi tính bù khoảng thời gian tắt game: không bị trộm, sâu không ăn trụi cây
function simulate(now, offline = false) {
  const from = state.last;
  if (now <= from) return;
  const dt = now - from;
  for (const p of state.plots) {
    if (!p.crop) continue;
    const need = CROPS[p.crop].days * DAY_MS;
    // sâu đang bám: cây ngừng lớn, để lâu thì bị ăn trụi
    if (p.bug) {
      p.bugMs += dt;
      // vừa mở lại game thì luôn còn ít nhất 10 giây để bắt sâu
      if (offline) p.bugMs = Math.min(p.bugMs, PEST_EAT_MS - 10000);
      if (p.bugMs >= PEST_EAT_MS) {
        toast(`🐛 Sâu đã ăn trụi cây ${CROPS[p.crop].name}!`);
        Object.assign(p, emptyPlot());
      }
      continue;
    }
    if (p.growth >= need) continue;
    // cây chỉ lớn trong khoảng thời gian đất còn ẩm
    p.growth = Math.min(need, p.growth + Math.max(0, Math.min(now, p.wetUntil) - from));
    if (p.growth < need && Math.random() < 1 - Math.exp(-dt * PEST_RATE)) {
      p.bug = true;
      p.bugMs = 0;
      toast(`🐛 Có sâu bám vào cây ${CROPS[p.crop].name}! Bắt nhanh lên.`);
    }
  }
  burnFire(from, now, offline);
  if (state.energy >= MAX_ENERGY) {
    state.energyAcc = 0;
  } else {
    state.energyAcc += now - from;
    const gain = Math.floor(state.energyAcc / ENERGY_REGEN_MS);
    if (gain) {
      state.energy = Math.min(MAX_ENERGY, state.energy + gain);
      state.energyAcc -= gain * ENERGY_REGEN_MS;
    }
  }
  state.last = now;
}

// ---------- Lửa trại & kẻ trộm ----------
function burnFire(from, now, offline) {
  const f = state.fire;
  // lúc tắt game: lửa giữ nguyên, chỉ tắt nếu vắng mặt quá 16 tiếng; không có kẻ trộm
  if (offline) {
    if (now - from >= OFFLINE_FIRE_MS && f.fuel > 0) {
      f.fuel = 0;
      toast('🌑 Bạn đi vắng hơn 16 tiếng, lửa trại đã tắt… nhóm lửa lại ngay kẻo bị trộm!');
    }
    f.outMs = 0;
    return;
  }
  const before = f.fuel;
  f.fuel = Math.max(0, f.fuel - (now - from) / FIRE_BURN_MS);
  if (before >= FIRE_LOW && f.fuel < FIRE_LOW && f.fuel > 0) toast('🔥 Lửa trại sắp tắt! Thêm củi hoặc đốt nông sản đi.');
  if (before > 0 && f.fuel <= 0) toast('🌑 Lửa trại đã tắt… kẻ trộm sắp mò tới!');
  if (f.fuel > 0) { f.outMs = 0; return; }
  // chỉ tính khoảng thời gian sau khi lửa tắt
  const outFrom = before > 0 ? from + before * FIRE_BURN_MS : from;
  f.outMs += Math.max(0, now - outFrom);
  while (f.outMs >= THIEF_MS) {
    f.outMs -= THIEF_MS;
    steal();
  }
}

function steal() {
  const planted = state.plots.map((p, i) => i).filter((i) => state.plots[i].crop);
  if (!planted.length) return;
  const ripe = planted.filter((i) => state.plots[i].growth >= CROPS[state.plots[i].crop].days * DAY_MS);
  const pool = ripe.length ? ripe : planted;
  const i = pool[Math.floor(Math.random() * pool.length)];
  toast(`🦝 Lửa tắt — kẻ trộm đã lấy mất cây ${CROPS[state.plots[i].crop].name}!`);
  state.plots[i] = emptyPlot();
  const tile = $('#garden') && $('#garden').children[i];
  if (tile) { tile.classList.remove('stolen'); void tile.offsetWidth; tile.classList.add('stolen'); }
}

function addWood() {
  if (state.wood <= 0) return toast('Hết củi rồi! Mua thêm ở Cửa hàng nhé.');
  if (state.fire.fuel >= FIRE_MAX - 1) return toast('🔥 Lửa đang cháy to rồi.');
  state.wood--;
  state.fire.fuel = Math.min(FIRE_MAX, state.fire.fuel + WOOD_FUEL);
  toast(`🪵 Thêm củi, lửa bùng lên! (+${WOOD_FUEL})`);
  renderAll();
}
function burnProduce(id) {
  if (!count(state.produce, id)) return;
  if (state.fire.fuel >= FIRE_MAX - 1) return toast('🔥 Lửa đang cháy to rồi.');
  take(state.produce, id, 1);
  state.fire.fuel = Math.min(FIRE_MAX, state.fire.fuel + burnFuel(id));
  toast(`🔥 Đã đốt 1 ${CROPS[id].name} (+${burnFuel(id)})`);
  renderAll();
}
function buyWood(n) {
  if (state.coins < WOOD_PRICE * n) return;
  state.coins -= WOOD_PRICE * n;
  state.wood += n;
  toast(`🛒 Đã mua ${n} bó củi`);
  renderAll();
}

function renderFire() {
  $('#fireActions').innerHTML = `
    <span>🪵 Củi đang có: <b>${state.wood}</b></span>
    <button class="btn sm" data-wood="1" ${state.wood > 0 ? '' : 'disabled'}>Thêm 1 bó củi (+${WOOD_FUEL})</button>
    <button class="btn sm ghost" data-buywood="1" ${state.coins >= WOOD_PRICE ? '' : 'disabled'}>Mua củi 🪙${WOOD_PRICE}</button>`;
  const prod = Object.keys(state.produce);
  $('#burnList').innerHTML = prod.length
    ? prod.map((id) => `<div class="card"><div class="title"><span class="ico">${cropIco(id)}</span>${CROPS[id].name} × ${state.produce[id]}</div>
        <div class="meta">Đốt 1 cái được +${burnFuel(id)} lửa</div>
        <div class="actions"><button class="btn sm" data-burn="${id}">🔥 Đốt 1</button></div></div>`).join('')
    : '<p class="empty-note">Kho chưa có nông sản để đốt.</p>';
}
// phần thay đổi liên tục (gọi mỗi nhịp tick)
function updateFireView() {
  const f = state.fire.fuel / FIRE_MAX;
  const fire = $('#b-fire');
  fire.style.setProperty('--f', f);
  fire.classList.toggle('out', f <= 0);
  fire.classList.toggle('notify', f < FIRE_LOW / FIRE_MAX);
  $('#fireBar').style.width = f * 100 + '%';
  $('#fireStat').classList.toggle('warn', f < FIRE_LOW / FIRE_MAX);
  $('#fireFuelBar').style.width = f * 100 + '%';
  const secs = Math.ceil(state.fire.fuel * FIRE_BURN_MS / 1000);
  $('#fireFuelText').textContent = f > 0 ? `Lửa còn ${Math.ceil(f * 100)}% · cháy thêm ~${secs}s` : '🌑 Lửa đã tắt! Kẻ trộm đang rình…';
}

// ---------- Tiện ích ----------
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('#toasts').appendChild(el);
  setTimeout(() => el.remove(), 2600);
}
function useEnergy(n) {
  if (state.energy < n) {
    toast('😴 Thỏ mệt rồi! Vào Kho cho thỏ ăn món đã nấu nhé.');
    return false;
  }
  state.energy -= n;
  return true;
}
function xpNeed(level) { return level * 50; }
function addXp(n) {
  state.xp += n;
  while (state.xp >= xpNeed(state.level)) {
    state.xp -= xpNeed(state.level);
    state.level++;
    const unlocked = Object.values(CROPS).filter((c) => c.level === state.level).map((c) => c.icon + ' ' + c.name);
    toast(`🎉 Lên cấp ${state.level}!` + (unlocked.length ? ' Mở khóa: ' + unlocked.join(', ') : ''));
  }
}
const count = (bag, id) => bag[id] || 0;
function take(bag, id, n) {
  bag[id] = count(bag, id) - n;
  if (bag[id] <= 0) delete bag[id];
}
function give(bag, id, n) { bag[id] = count(bag, id) + n; }
function fmtSec(ms) { return Math.ceil(ms / 1000) + 's'; }

// ---------- Thỏ (SVG) ----------
// Thỏ kiểu Don't Starve: đầu to, viền mực đen, tay chân que, tai hơi xiêu vẹo
function bunnySVG(hat) {
  const K = '#1b1611', ol = `stroke="${K}" stroke-width="3.2" stroke-linejoin="round"`;
  const W = '#efe8da', P = '#d79aa4';
  return `<svg viewBox="0 0 120 140" aria-label="Thỏ trắng hồng">
    <ellipse cx="60" cy="136" rx="28" ry="4" fill="rgba(20,15,10,.35)"/>
    <path d="M36 50 C24 30 28 6 41 6 C54 6 54 30 50 46 Z" fill="${W}" ${ol}/>
    <path d="M70 46 C66 26 72 4 84 8 C96 12 92 34 84 50 Z" fill="${W}" ${ol}/>
    <path d="M40 42 C34 28 36 15 42 14 C48 14 47 30 46 40 Z" fill="${P}"/>
    <path d="M74 42 C72 28 76 16 82 16 C88 18 86 32 81 42 Z" fill="${P}"/>
    <path d="M47 120 L45 132 M73 120 L75 132 M36 96 L22 110 M84 96 L98 108" stroke="${K}" stroke-width="4.5" stroke-linecap="round"/>
    <ellipse cx="43" cy="133" rx="6" ry="3" fill="${K}"/><ellipse cx="77" cy="133" rx="6" ry="3" fill="${K}"/>
    <ellipse cx="60" cy="104" rx="26" ry="22" fill="${W}" ${ol}/>
    <ellipse cx="60" cy="108" rx="13" ry="11" fill="#e8c4c8"/>
    <path d="M38 112 Q46 122 60 124" stroke="#c9bfae" stroke-width="2.5" fill="none"/>
    <ellipse cx="60" cy="63" rx="41" ry="33" fill="${W}" ${ol}/>
    <path d="M26 74 Q34 90 54 94" stroke="#c9bfae" stroke-width="3" fill="none"/>
    <ellipse cx="32" cy="74" rx="8" ry="5" fill="${P}" opacity=".75"/>
    <ellipse cx="88" cy="74" rx="8" ry="5" fill="${P}" opacity=".75"/>
    <g class="blink">
      <ellipse cx="46" cy="63" rx="5.5" ry="7" fill="${K}"/><ellipse cx="74" cy="63" rx="5.5" ry="7" fill="${K}"/>
      <circle cx="48" cy="60" r="1.8" fill="#fff"/><circle cx="76" cy="60" r="1.8" fill="#fff"/>
    </g>
    <g fill="none" stroke="${K}" stroke-width="2.8">
      <circle cx="46" cy="63" r="12"/><circle cx="74" cy="63" r="12"/><path d="M58 61 q2 -3 4 0"/>
    </g>
    <ellipse cx="60" cy="73" rx="3.6" ry="2.6" fill="#b86a78" stroke="${K}" stroke-width="1.6"/>
    <path d="M53 77 q7 10 14 0 z" fill="#8e2a24" stroke="${K}" stroke-width="2" stroke-linejoin="round"/>
    ${hat ? `<g fill="${W}" ${ol}>
      <path d="M40 34 C30 30 32 12 44 14 C46 2 72 0 74 12 C88 10 92 30 80 34 Z"/>
      <path d="M42 34 L80 34 L79 42 L43 42 Z"/></g>` : ''}
  </svg>`;
}

function makeSick() {
  const els = ['#avatar', '#bunny', '#chef'].map($);
  els.forEach((el) => el.classList.add('sick'));
  clearTimeout(makeSick.timer);
  makeSick.timer = setTimeout(() => els.forEach((el) => el.classList.remove('sick')), 10000);
}

// Toạ độ (x, y) của bunny là điểm giữa-trên của nó trên bản đồ #world
function moveBunny(x, y) {
  const bunny = $('#bunny');
  bunny.classList.toggle('flip', x < bunny.offsetLeft);
  bunny.style.left = x + 'px';
  bunny.style.top = y + 'px';
  bunny.classList.remove('hop');
  void bunny.offsetWidth;
  bunny.classList.add('hop');
}
// toạ độ trong khung #stage (đơn vị chưa phóng to/thu nhỏ)
function rectInWorld(el) {
  const w = $('#stage').getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const s = worldScale;
  return { x: (r.left - w.left) / s, y: (r.top - w.top) / s, w: r.width / s, h: r.height / s };
}

// Phóng bản đồ vừa khít màn hình; phần thừa hai bên được lấp bằng rừng
let worldScale = 1;
function layoutWorld() {
  const hudH = $('.hud').offsetHeight + 20;
  const vp = $('.world-viewport');
  const vw = vp.clientWidth, vh = vp.clientHeight;
  if (!vw || !vh) return;
  // chỉ cần vừa khít vùng chính (nhà + ruộng), phần rừng viền ngoài được phép tràn ra mép → nhìn to hơn
  const CX = 480, CY = 500, CW = 900, CH = 860;
  const s = Math.min(vw / CW, (vh - hudH) / CH);
  const W = vw / s, H = vh / s;
  const ox = W / 2 - CX, oy = hudH / s + (H - hudH / s) / 2 - CY;
  worldScale = s;
  const world = $('#world');
  world.style.width = W + 'px';
  world.style.height = H + 'px';
  world.style.transform = `scale(${s})`;
  $('#stage').style.left = ox + 'px';
  $('#stage').style.top = oy + 'px';
  renderForest(W, H, ox, oy);
}
function hopTo(i) {
  const tile = $('#garden').children[i];
  if (!tile) return;
  lastHop = i;
  const r = rectInWorld(tile);
  moveBunny(r.x + r.w * 0.85, r.y + r.h - $('#bunny').offsetHeight * 0.85);
}
function walkToBuilding(el) {
  lastHop = null;
  const r = rectInWorld(el);
  moveBunny(r.x + r.w / 2, r.y + r.h - $('#bunny').offsetHeight + 8);
}

// ---------- Các ngôi nhà ----------
const PANEL_TITLES = { kitchen: '🍳 Nhà bếp', storage: '🧺 Nhà kho', shop: '🏪 Cửa hàng', fire: '🔥 Lửa trại' };
function openPanel(name) {
  $('#panelTitle').textContent = PANEL_TITLES[name];
  document.querySelectorAll('#panel .view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
  $('#panel').hidden = false;
}
function closePanel() { $('#panel').hidden = true; }

// ---------- Vườn ----------
function plotClick(i) {
  const p = state.plots[i];
  hopTo(i);
  if (!p.crop) return openSeedPicker(i);
  if (p.bug) return catchBug(i);
  const c = CROPS[p.crop];
  const need = c.days * DAY_MS;
  if (p.growth >= need) return harvest(i, true);
  if (Date.now() < p.wetUntil) {
    const daysLeft = Math.ceil((need - p.growth) / DAY_MS);
    return toast(`${c.icon} ${c.name} đang lớn — còn ${daysLeft} ngày nữa`);
  }
  water(i, true);
}

function catchBug(i) {
  const p = state.plots[i];
  if (!useEnergy(COST.bug)) return;
  p.bug = false;
  p.bugMs = 0;
  addXp(2);
  toast('🐛 Bắt được sâu rồi! Cây lại tiếp tục lớn.');
  renderAll();
}

function water(i, verbose) {
  const p = state.plots[i];
  if (!useEnergy(COST.water)) return false;
  p.wetUntil = Date.now() + WET_MS;
  if (verbose) toast('💧 Đã tưới nước!');
  renderAll();
  return true;
}

function harvest(i, verbose) {
  const p = state.plots[i];
  const c = CROPS[p.crop];
  if (!useEnergy(COST.harvest)) return false;
  give(state.produce, p.crop, c.yield);
  addXp(c.xp);
  if (verbose) toast(`✨ Thu hoạch ${c.yield} ${c.icon} ${c.name}`);
  state.plots[i] = emptyPlot();
  renderAll();
  return true;
}

function plant(i, cropId) {
  if (count(state.seeds, cropId) <= 0) return;
  if (!useEnergy(COST.plant)) return;
  take(state.seeds, cropId, 1);
  state.plots[i] = { crop: cropId, growth: 0, wetUntil: Date.now() + WET_MS };
  toast(`🌱 Đã gieo ${CROPS[cropId].name} và tưới nước`);
  closeModal();
  renderAll();
}

function waterAll() {
  const now = Date.now();
  let n = 0;
  state.plots.forEach((p, i) => {
    if (p.crop && p.growth < CROPS[p.crop].days * DAY_MS && now >= p.wetUntil) {
      if (state.energy >= COST.water) { water(i); n++; }
    }
  });
  toast(n ? `💧 Đã tưới ${n} ô đất` : 'Không có ô nào cần tưới');
}

function harvestAll() {
  let n = 0;
  state.plots.forEach((p, i) => {
    if (p.crop && p.growth >= CROPS[p.crop].days * DAY_MS && state.energy >= COST.harvest) {
      harvest(i); n++;
    }
  });
  toast(n ? `✨ Đã thu hoạch ${n} ô` : 'Chưa có cây nào chín');
}

function renderGarden() {
  const g = $('#garden');
  while (g.children.length < state.plots.length) {
    const el = document.createElement('div');
    el.className = 'plot';
    el.innerHTML = '<span class="plant"></span><span class="bug">' + bugSVG() + '</span><span class="badge"></span><div class="pbar"><span></span></div>';
    const idx = g.children.length;
    const [x, y, rot] = PLOT_POS[idx] || [0, 0, 0];
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.rotate = rot + 'deg';
    el.addEventListener('click', () => plotClick(idx));
    g.appendChild(el);
  }
  const now = Date.now();
  state.plots.forEach((p, i) => {
    const el = g.children[i];
    const plantEl = el.querySelector('.plant');
    const badge = el.querySelector('.badge');
    const bar = el.querySelector('.pbar');
    const wet = p.crop && now < p.wetUntil;
    el.classList.toggle('wet', !!wet);
    el.classList.toggle('has-bug', !!(p.crop && p.bug));
    if (!p.crop) {
      el.classList.remove('ripe');
      if (plantEl.dataset.k !== 'empty') {
        plantEl.dataset.k = 'empty';
        plantEl.className = 'plant empty';
        plantEl.textContent = '+';
      }
      badge.textContent = '';
      bar.style.display = 'none';
      el.title = 'Đất trống — bấm để gieo hạt';
      return;
    }
    const c = CROPS[p.crop];
    const pct = p.growth / (c.days * DAY_MS);
    const ripe = pct >= 1;
    el.classList.toggle('ripe', ripe);
    // 4 giai đoạn mọc; chỉ vẽ lại khi đổi giai đoạn để chạy hiệu ứng "bật" lên
    const stage = ripe ? 3 : pct < 0.15 ? 0 : pct < 0.5 ? 1 : 2;
    const key = p.crop + stage;
    if (plantEl.dataset.k !== key) {
      plantEl.dataset.k = key;
      plantEl.className = 'plant';
      plantEl.innerHTML = cropSVG(p.crop, stage);
      void plantEl.offsetWidth;
      plantEl.classList.add('grow');
    }
    badge.textContent = p.bug ? '' : ripe ? '✨' : wet ? '' : '💧';
    bar.style.display = ripe ? 'none' : '';
    bar.firstChild.style.width = Math.min(100, pct * 100) + '%';
    const daysLeft = Math.ceil((c.days * DAY_MS - p.growth) / DAY_MS);
    el.title = p.bug ? `Có sâu! Bấm để bắt (còn ${Math.ceil((PEST_EAT_MS - p.bugMs) / 1000)}s trước khi bị ăn trụi)`
      : ripe ? `${c.name} đã chín!` : `${c.name}: còn ${daysLeft} ngày` + (wet ? '' : ' (cần tưới)');
  });
}

// ---------- Chọn hạt giống ----------
function openSeedPicker(i) {
  selectedPlot = i;
  const owned = Object.keys(CROPS).filter((id) => count(state.seeds, id) > 0);
  $('#seedPick').innerHTML = owned.length
    ? owned.map((id) => {
        const c = CROPS[id];
        return `<div class="card"><div class="title"><span class="ico">${cropIco(id)}</span>${c.name}</div>
          <div class="meta">Có ${state.seeds[id]} hạt · 🕒 ${c.days} ngày · thu ${c.yield}</div>
          <div class="actions"><button class="btn sm" data-plant="${id}">Gieo (⚡${COST.plant})</button></div></div>`;
      }).join('')
    : '<p class="empty-note">Hết hạt giống rồi! Ghé Cửa hàng để mua thêm nhé.</p>';
  $('#seedModal').hidden = false;
}
function closeModal() { $('#seedModal').hidden = true; selectedPlot = null; }

// ---------- Bếp ----------
function canCook(r) {
  return Object.entries(r.in).every(([id, n]) => count(state.produce, id) >= n);
}
function cook(rid) {
  const r = RECIPES[rid];
  const slot = state.stoves.findIndex((s) => !s);
  if (slot < 0) return toast('🔥 Các bếp đều đang bận');
  if (!canCook(r)) return toast('Chưa đủ nguyên liệu');
  for (const [id, n] of Object.entries(r.in)) take(state.produce, id, n);
  state.stoves[slot] = { r: rid, end: Date.now() + r.time * 1000 };
  toast(`🍳 Đang nấu ${r.name}...`);
  renderAll();
}
function collect(i) {
  const s = state.stoves[i];
  if (!s || Date.now() < s.end) return;
  if (s.custom) {
    state.custom.push(s.custom);
    addXp(Math.round(s.custom.sell / 5));
    state.stoves[i] = null;
    toast(`${s.custom.icon} ${s.custom.name} đã xong! Cất vào Kho → Món tự chế.`);
    return renderAll();
  }
  const r = RECIPES[s.r];
  give(state.dishes, s.r, 1);
  addXp(Math.round(r.sell / 4));
  state.stoves[i] = null;
  toast(`${r.icon} ${r.name} đã xong! Món ăn đã cất vào Kho.`);
  renderAll();
}

function renderStoves() {
  const now = Date.now();
  const html = state.stoves.map((s, i) => {
    if (!s) return `<div class="stove"><div class="pot">🍳</div>Bếp trống</div>`;
    const r = s.custom || RECIPES[s.r];
    const left = s.end - now;
    if (left <= 0) return `<div class="stove done" data-collect="${i}"><div class="pot">${r.icon}</div>${r.name}<small>Bấm để lấy món</small></div>`;
    const pct = 100 - (left / ((s.time || r.time) * 1000)) * 100;
    return `<div class="stove busy"><div class="pot">🍲</div>${r.name}
      <span class="bar"><span style="width:${pct}%"></span></span><small>còn ${fmtSec(left)}</small></div>`;
  }).join('');
  // chỉ vẽ lại khi có thay đổi, tránh mất cú bấm giữa chừng
  if (html !== renderStoves.prev) { renderStoves.prev = html; $('#stoves').innerHTML = html; }
}

function ingrHTML(r) {
  return Object.entries(r.in).map(([id, n]) => {
    const have = count(state.produce, id);
    return `<span class="${have >= n ? '' : 'miss'}">${cropIco(id)} ${have}/${n}</span>`;
  }).join('');
}

function renderRecipes() {
  const freeStove = state.stoves.some((s) => !s);
  $('#recipes').innerHTML = Object.entries(RECIPES).map(([id, r]) => `
    <div class="card"><div class="title"><span class="ico">${r.icon}</span>${r.name}</div>
      <div class="ingr">${ingrHTML(r)}</div>
      <div class="meta">🕒 ${r.time}s · bán 🪙${r.sell} · ăn +⚡${r.energy}</div>
      <div class="actions"><button class="btn sm" data-cook="${id}" ${canCook(r) && freeStove ? '' : 'disabled'}>Nấu</button></div>
    </div>`).join('');
}

// ---------- Tự chế biến ----------
const POT_MAX = 5;
let pot = {};            // nguyên liệu đang bỏ vào nồi (chưa trừ khỏi kho)
let potMethod = 'luoc';

function potCount() { return Object.values(pot).reduce((a, b) => a + b, 0); }
function spoilChance() { return Math.max(0.05, METHODS[potMethod].spoil - (state.level - 1) * 0.02); }
function matchRecipe() {
  const keys = Object.keys(pot);
  return Object.keys(RECIPES).find((id) => {
    const need = RECIPES[id].in;
    return Object.keys(need).length === keys.length && keys.every((k) => need[k] === pot[k]);
  });
}

function addToPot(id) {
  if (potCount() >= POT_MAX) return toast(`Nồi chỉ chứa tối đa ${POT_MAX} nguyên liệu`);
  if (count(pot, id) >= count(state.produce, id)) return;
  give(pot, id, 1);
  renderCustom();
}
function removeFromPot(id) { take(pot, id, 1); renderCustom(); }

function cookCustom() {
  const n = potCount();
  if (n < 2) return toast('Cần ít nhất 2 nguyên liệu');
  const slot = state.stoves.findIndex((s) => !s);
  if (slot < 0) return toast('🔥 Các bếp đều đang bận');
  const m = METHODS[potMethod];
  const rid = matchRecipe();
  const value = Object.entries(pot).reduce((sum, [id, k]) => sum + CROPS[id].sell * k, 0);
  const dish = rid
    ? { name: RECIPES[rid].name, icon: RECIPES[rid].icon, sell: RECIPES[rid].sell, energy: RECIPES[rid].energy }
    : { name: `${m.name} ${Object.keys(pot).map((id) => CROPS[id].name.toLowerCase()).join(' & ')}`,
        icon: m.icon, sell: Math.round(value * 1.3), energy: n * 9 };
  dish.spoiled = Math.random() < spoilChance();
  for (const [id, k] of Object.entries(pot)) take(state.produce, id, k);
  const time = 6 + n * 3;
  state.stoves[slot] = { custom: dish, end: Date.now() + time * 1000, time };
  pot = {};
  toast(rid ? `👩‍🍳 Thỏ tự nấu trúng công thức ${dish.name}!` : `🧪 Đang thử món ${dish.name}...`);
  renderAll();
}

function renderCustom() {
  // bỏ khỏi nồi những nguyên liệu không còn đủ trong kho
  for (const id of Object.keys(pot)) {
    const have = count(state.produce, id);
    if (pot[id] > have) { if (have) pot[id] = have; else delete pot[id]; }
  }
  const n = potCount();
  const rid = matchRecipe();
  const freeStove = state.stoves.some((s) => !s);
  const items = Object.entries(pot).map(([id, k]) =>
    `<button class="chip in-pot" data-remove="${id}" title="Bấm để bỏ ra">${cropIco(id)} ${CROPS[id].name} ×${k} ✕</button>`).join('');
  const avail = Object.keys(state.produce).map((id) => {
    const left = count(state.produce, id) - count(pot, id);
    return `<button class="chip" data-add="${id}" ${left > 0 && n < POT_MAX ? '' : 'disabled'}>${cropIco(id)} ${CROPS[id].name} (${left})</button>`;
  }).join('');
  const methods = Object.entries(METHODS).map(([id, m]) =>
    `<button class="chip ${id === potMethod ? 'on' : ''}" data-method="${id}">${m.icon} ${m.name}</button>`).join('');

  $('#custom').innerHTML = `
    <div class="pot-row"><span class="big-pot">🫕</span>
      <div class="pot-items">${items || '<span class="empty-note">Nồi đang trống — chọn nguyên liệu bên dưới</span>'}</div></div>
    <div class="row"><span class="label">Nguyên liệu trong kho (${n}/${POT_MAX}):</span>
      ${avail || '<span class="empty-note">Chưa có nông sản nào</span>'}</div>
    <div class="row"><span class="label">Cách nấu:</span>${methods}</div>
    <div class="row">
      <span>Tỷ lệ hỏng: <span class="risk">${Math.round(spoilChance() * 100)}%</span></span>
      ${rid ? `<span class="meta">✨ Hình như giống món ${RECIPES[rid].name}...</span>` : ''}
    </div>
    <div class="row"><button class="btn" data-customcook="1" ${n >= 2 && freeStove ? '' : 'disabled'}>🔥 Nấu thử</button>
      ${freeStove ? '' : '<span class="meta">Các bếp đều đang bận</span>'}</div>`;
}

function eatCustom(i) {
  const d = state.custom[i];
  if (!d) return;
  if (!d.spoiled && state.energy >= MAX_ENERGY) return toast('Thỏ no rồi! 🐰💕');
  state.custom.splice(i, 1);
  if (d.spoiled) {
    const fee = Math.min(state.coins, DOCTOR_FEE + state.level * 5);
    state.coins -= fee;
    state.energy = Math.max(0, state.energy - 15);
    makeSick();
    toast(`🤢 Món bị hỏng! Thỏ đau bụng, tốn 🪙${fee} tiền chữa bệnh`);
  } else {
    state.energy = Math.min(MAX_ENERGY, state.energy + d.energy);
    toast(`😋 Ngon tuyệt! +⚡${d.energy}`);
  }
  renderAll();
}
function sellCustom(i) {
  const d = state.custom[i];
  if (!d) return;
  state.custom.splice(i, 1);
  if (d.spoiled) {
    const paid = Math.round(d.sell * 0.2);
    state.coins += paid;
    toast(`😖 Khách chê món bị hỏng, chỉ trả 🪙${paid}`);
  } else {
    state.coins += d.sell;
    toast(`🪙 +${d.sell}`);
  }
  renderAll();
}
function tossCustom(i) {
  state.custom.splice(i, 1);
  toast('🗑️ Đã bỏ món');
  renderAll();
}

// ---------- Kho ----------
function renderStorage() {
  const prod = Object.keys(state.produce);
  $('#produceList').innerHTML = prod.length
    ? prod.map((id) => {
        const c = CROPS[id];
        return `<div class="card"><div class="title"><span class="ico">${cropIco(id)}</span>${c.name} × ${state.produce[id]}</div>
          <div class="meta">Giá bán 🪙${c.sell}/cái</div>
          <div class="actions"><button class="btn sm" data-sell="${id}">Bán 1</button>
          <button class="btn sm ghost" data-sellall="${id}">Bán hết</button></div></div>`;
      }).join('')
    : '<p class="empty-note">Chưa có nông sản. Ra vườn thu hoạch nhé!</p>';

  const dishes = Object.keys(state.dishes);
  $('#dishList').innerHTML = dishes.length
    ? dishes.map((id) => {
        const r = RECIPES[id];
        return `<div class="card"><div class="title"><span class="ico">${r.icon}</span>${r.name} × ${state.dishes[id]}</div>
          <div class="meta">Ăn +⚡${r.energy} · bán 🪙${r.sell}</div>
          <div class="actions"><button class="btn sm" data-eat="${id}">Cho thỏ ăn</button>
          <button class="btn sm ghost" data-selldish="${id}">Bán</button></div></div>`;
      }).join('')
    : '<p class="empty-note">Chưa nấu món nào. Vào Bếp thử nhé!</p>';

  $('#customList').innerHTML = state.custom.length
    ? state.custom.map((d, i) => `<div class="card"><div class="title"><span class="ico">${d.icon}</span>${d.name}</div>
        <div class="meta">❓ Món tự chế — chưa biết có hỏng không<br>Ăn +⚡${d.energy} · bán 🪙${d.sell}</div>
        <div class="actions"><button class="btn sm" data-eatc="${i}">Cho thỏ ăn</button>
        <button class="btn sm ghost" data-sellc="${i}">Bán</button>
        <button class="btn sm ghost" data-tossc="${i}">Bỏ</button></div></div>`).join('')
    : '<p class="empty-note">Chưa có món tự chế. Vào Bếp → Tự chế biến nhé!</p>';
}

function sellProduce(id, all) {
  const n = all ? count(state.produce, id) : 1;
  if (!n) return;
  take(state.produce, id, n);
  state.coins += n * CROPS[id].sell;
  toast(`🪙 +${n * CROPS[id].sell}`);
  renderAll();
}
function eatDish(id) {
  const r = RECIPES[id];
  if (state.energy >= MAX_ENERGY) return toast('Thỏ no rồi! 🐰💕');
  take(state.dishes, id, 1);
  state.energy = Math.min(MAX_ENERGY, state.energy + r.energy);
  toast(`😋 Ngon quá! +⚡${r.energy}`);
  renderAll();
}
function sellDish(id) {
  take(state.dishes, id, 1);
  state.coins += RECIPES[id].sell;
  toast(`🪙 +${RECIPES[id].sell}`);
  renderAll();
}

// ---------- Cửa hàng ----------
function plotCost() { return 40 + (state.plots.length - 8) * 30; }
function stoveCost() { return 120 * (state.stoves.length - 1); }

function renderShop() {
  $('#seedShop').innerHTML = Object.entries(CROPS).map(([id, c]) => {
    const locked = state.level < c.level;
    return `<div class="card ${locked ? 'locked' : ''}"><div class="title"><span class="ico">${cropIco(id)}</span>${c.name}</div>
      <div class="meta">🕒 ${c.days} ngày · thu ${c.yield} · bán 🪙${c.sell}/cái<br>${c.note}</div>
      <div class="meta">Đang có: ${count(state.seeds, id)} hạt</div>
      <div class="actions">${locked
        ? `<span class="meta">🔒 Cần cấp ${c.level}</span>`
        : `<button class="btn sm" data-buy="${id}" ${state.coins >= c.seed ? '' : 'disabled'}>Mua 🪙${c.seed}</button>
           <button class="btn sm ghost" data-buy5="${id}" ${state.coins >= c.seed * 5 ? '' : 'disabled'}>Mua 5</button>`}
      </div></div>`;
  }).join('');

  const plotMax = state.plots.length >= MAX_PLOTS;
  const stoveMax = state.stoves.length >= MAX_STOVES;
  $('#upgrades').innerHTML = `
    <div class="card"><div class="title"><span class="ico">🟫</span>Thêm ô đất</div>
      <div class="meta">Hiện có ${state.plots.length}/${MAX_PLOTS} ô</div>
      <div class="actions"><button class="btn sm" data-up="plot" ${plotMax || state.coins < plotCost() ? 'disabled' : ''}>
        ${plotMax ? 'Đã tối đa' : 'Mua 🪙' + plotCost()}</button></div></div>
    <div class="card"><div class="title"><span class="ico">🔥</span>Thêm bếp nấu</div>
      <div class="meta">Hiện có ${state.stoves.length}/${MAX_STOVES} bếp</div>
      <div class="actions"><button class="btn sm" data-up="stove" ${stoveMax || state.coins < stoveCost() ? 'disabled' : ''}>
        ${stoveMax ? 'Đã tối đa' : 'Mua 🪙' + stoveCost()}</button></div></div>
    <div class="card"><div class="title"><span class="ico">🪵</span>Củi đốt lửa trại</div>
      <div class="meta">Mỗi bó +${WOOD_FUEL} lửa · đang có ${state.wood} bó</div>
      <div class="actions"><button class="btn sm" data-buywood="1" ${state.coins >= WOOD_PRICE ? '' : 'disabled'}>Mua 🪙${WOOD_PRICE}</button>
        <button class="btn sm ghost" data-buywood="5" ${state.coins >= WOOD_PRICE * 5 ? '' : 'disabled'}>Mua 5</button></div></div>`;
}

function buySeed(id, n) {
  const c = CROPS[id];
  if (state.level < c.level || state.coins < c.seed * n) return;
  state.coins -= c.seed * n;
  give(state.seeds, id, n);
  toast(`🛒 Đã mua ${n} hạt ${c.name}`);
  renderAll();
}
function buyUpgrade(kind) {
  if (kind === 'plot' && state.plots.length < MAX_PLOTS && state.coins >= plotCost()) {
    state.coins -= plotCost();
    state.plots.push(emptyPlot());
    toast('🟫 Đã mở thêm 1 ô đất');
  } else if (kind === 'stove' && state.stoves.length < MAX_STOVES && state.coins >= stoveCost()) {
    state.coins -= stoveCost();
    state.stoves.push(null);
    toast('🔥 Đã lắp thêm 1 bếp');
  }
  renderAll();
}

// ---------- HUD & vòng lặp ----------
function renderHud() {
  $('#coins').textContent = state.coins;
  $('#level').textContent = state.level;
  $('#energy').textContent = state.energy;
  $('#xpBar').style.width = (state.xp / xpNeed(state.level)) * 100 + '%';
  $('#energyBar').style.width = (state.energy / MAX_ENERGY) * 100 + '%';
}

function renderAll() {
  renderHud();
  renderGarden();
  renderStoves();
  renderRecipes();
  renderCustom();
  renderStorage();
  renderShop();
  renderFire();
  updateFireView();
  save();
}

let stovesWereBusy = '';
function tick() {
  simulate(Date.now());
  renderHud();
  renderGarden();
  renderStoves();
  // khi một bếp nấu xong thì cập nhật lại danh sách công thức
  const busy = state.stoves.map((s) => (s && Date.now() < s.end ? 1 : 0)).join('');
  if (busy !== stovesWereBusy) { stovesWereBusy = busy; renderRecipes(); renderCustom(); }
  $('#b-kitchen').classList.toggle('notify', state.stoves.some((s) => s && Date.now() >= s.end));
  updateFireView();
}

// ---------- Sự kiện ----------
document.querySelectorAll('.building').forEach((b) => b.addEventListener('click', () => {
  walkToBuilding(b);
  setTimeout(() => openPanel(b.dataset.open), 480);
}));
$('#closePanel').addEventListener('click', closePanel);
$('#panel').addEventListener('click', (e) => { if (e.target.id === 'panel') closePanel(); });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#seedModal').hidden) closeModal(); else closePanel();
});

document.body.addEventListener('click', (e) => {
  const t = e.target.closest('[data-plant],[data-cook],[data-collect],[data-sell],[data-sellall],[data-eat],[data-selldish],[data-buy],[data-buy5],[data-up],'
    + '[data-add],[data-remove],[data-method],[data-customcook],[data-eatc],[data-sellc],[data-tossc],'
    + '[data-wood],[data-buywood],[data-burn]');
  if (!t) return;
  const d = t.dataset;
  if (d.plant) plant(selectedPlot, d.plant);
  else if (d.wood) addWood();
  else if (d.buywood) buyWood(+d.buywood);
  else if (d.burn) burnProduce(d.burn);
  else if (d.add) addToPot(d.add);
  else if (d.remove) removeFromPot(d.remove);
  else if (d.method) { potMethod = d.method; renderCustom(); }
  else if (d.customcook) cookCustom();
  else if (d.eatc) eatCustom(+d.eatc);
  else if (d.sellc) sellCustom(+d.sellc);
  else if (d.tossc) tossCustom(+d.tossc);
  else if (d.cook) cook(d.cook);
  else if (d.collect) collect(+d.collect);
  else if (d.sell) sellProduce(d.sell, false);
  else if (d.sellall) sellProduce(d.sellall, true);
  else if (d.eat) eatDish(d.eat);
  else if (d.selldish) sellDish(d.selldish);
  else if (d.buy) buySeed(d.buy, 1);
  else if (d.buy5) buySeed(d.buy5, 5);
  else if (d.up) buyUpgrade(d.up);
});

$('#closeModal').addEventListener('click', closeModal);
$('#seedModal').addEventListener('click', (e) => { if (e.target.id === 'seedModal') closeModal(); });
$('#waterAll').addEventListener('click', waterAll);
$('#harvestAll').addEventListener('click', harvestAll);
$('#resetBtn').addEventListener('click', () => {
  if (!confirm('Xóa toàn bộ tiến trình và chơi lại?')) return;
  state = newState();
  $('#garden').innerHTML = '';
  renderAll();
});
// dựng lại bản đồ mỗi khi khung màn hình đổi kích thước (kể cả lần đầu tải trang)
let resizeTimer;
new ResizeObserver(() => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { layoutWorld(); if (lastHop !== null) hopTo(lastHop); }, 100);
}).observe($('.world-viewport'));
window.addEventListener('beforeunload', save);

renderScene();
layoutWorld();
$('#avatar').innerHTML = bunnySVG(false);
$('#bunny').innerHTML = bunnySVG(false);
$('#chef').innerHTML = bunnySVG(true);

simulate(Date.now(), true);
renderAll();
setInterval(tick, 250);
setInterval(save, 5000);
