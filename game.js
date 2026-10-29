const $ = (s) => document.querySelector(s);
const SAVE_KEY = 'vuon-tho-hong-v1';
// sổ những lần ra đi lưu riêng khỏi bản lưu game nên chơi lại từ đầu vẫn còn
const DEATH_KEY = 'vuon-tho-hong-so-tu';
const DAY_MS = DAY_SECONDS * 1000;
const WET_MS = 30000;          // một lần tưới giữ ẩm 30 giây
const DRY_DIE_MS = 45000;      // hết ẩm mà để khô thêm 45 giây thì cây chết khô
const MUT_RATE = 0.07;         // 7% cây gieo xuống sẽ đột biến
const MORPH_MS = 90000;        // ăn đồ đột biến: thỏ biến đổi trong 90 giây
const MAX_ENERGY = 100;
const ENERGY_REGEN_MS = 8000;  // hồi 1 năng lượng mỗi 8 giây
const MAX_PLOTS = 20;
// Mảnh đất đặt theo lưới ô (cột c, hàng r) trên bản đồ; mỗi ô lệch & nghiêng nhẹ cho tự nhiên.
// Chỗ trống đủ rộng là đặt được.
const CELL_W = 140, CELL_H = 108, PLOT_W = 116, PLOT_H = 88;
const GRID_X = 14, GRID_Y = 470;
const cellRect = (c, r) => ({
  x: GRID_X + c * CELL_W + (((c * 37 + r * 53) % 13) + 13) % 13 - 6,
  y: GRID_Y + r * CELL_H + (((c * 29 + r * 41) % 11) + 11) % 11 - 5,
  w: PLOT_W, h: PLOT_H,
});
const cellTilt = (c, r) => ((((c * 17 + r * 31) % 7) + 7) % 7 - 3) * 0.8;
// tắt game quá 16 tiếng thì lửa trại tắt
const OFFLINE_FIRE_MS = 16 * 3600 * 1000;
const MAX_STOVES = 4;
const COST = { plant: 2, water: 1, harvest: 1, bug: 1, chop: 3, fish: 2, pick: 1, pave: 1 };
// Đồ hái lượm trên bản đồ: hái xong thì biến mất, regrow mili giây sau mọc lại ở 1 chỗ trống ngẫu nhiên.
// give/n = thu được gì, bao nhiêu; wood = được củi; cost = năng lượng (mặc định COST.pick); w = cỡ khi mọc mới
const FORAGE = {
  berry:   { give: 'quamong', n: 3, w: 66, regrow: 60000, title: 'Bụi quả mọng dại — bấm để hái quả' },
  flower:  { give: 'hoadai',  n: 1, w: 16, regrow: 40000, title: 'Hoa dại — bấm để hái' },
  grass:   { give: 'cokho',   n: 2, w: 36, regrow: 40000, title: 'Cỏ dại — bấm để cắt' },
  sapling: { give: 'canhcay', n: 2, w: 26, regrow: 50000, title: 'Cây non — bấm để bẻ cành' },
  boulder: { give: 'dacuoi',  n: 2, w: 52, regrow: 90000, cost: 2, title: 'Tảng đá — bấm để nhặt đá cuội' },
  log:     { wood: 2,               w: 62, regrow: 120000, cost: 2, title: 'Khúc gỗ mục — bấm để lấy củi' },
};
// lần đầu chơi: lấy đúng các bụi cây, hoa, đá… đang vẽ sẵn trên bản đồ
function initialForage() {
  const list = [];
  DECOR.forEach(([kind, x, y, w, v], i) => { if (FORAGE[kind]) list.push({ id: 'f' + i, kind, x, y, w, v }); });
  FLOWERS.forEach(([x, y, v], i) => list.push({ id: 'fl' + i, kind: 'flower', x, y, w: 16, v }));
  return list;
}
// ô trồng sen dưới ao (tâm ô, toạ độ bản đồ): chỗ nước trống cạnh cầu câu
const LOTUS_POS = [[700, 785], [790, 770], [862, 700]];
const emptyLotus = () => ({ crop: null, growth: 0 });
// Nấm dại: cứ 40 giây mọc thêm 1 cụm ở các chỗ dưới đây (tối đa 5 cụm), 30% cụm là nấm độc
const WILD_MS = 40000;
const WILD_MAX = 5;
const WILD_TOXIC = 0.3;
const WILD_SPOTS = [
  [752, 468], [104, 420], [36, 360], [640, 470], [300, 262], [915, 340],
  [240, 868], [430, 890], [540, 880], [600, 110], [150, 110], [820, 100],
];
// Bệnh: không chữa trong 3 phút hoặc nặng quá cấp 3 thì thỏ chết; nấu sai thuốc thì nặng thêm 1 cấp & mất nửa thời gian còn lại
const ILL_MS = 180000;
const ILL_MAX = 3;
const SNAKE_RATE = 0.12;  // mỗi nhát rìu chặt cây có 12% bị rắn cắn
const STING_RATE = 0.1;   // mỗi lần bắt sâu có 10% bị côn trùng đốt
// Cây nào trên bản đồ cũng chặt được lấy củi; 90 giây sau gốc cây mọc lại (trừ khi đã đặt đất đè lên)
const TREE_REGROW_MS = 90000;
const AXE_PRICE = 25;     // mỗi cây rìu chặt được 3–5 cây (ngẫu nhiên, không báo trước) rồi gãy
// Côn trùng phá rau: trung bình ~90 giây cây đang lớn sẽ bị 1 con bám (loại & thời gian ăn trụi xem PESTS)
const PEST_RATE = 1 / 90000;
// Câu cá: mỗi lần thả câu tốn năng lượng & 1 mồi; cần câu có thể gãy (xem CATCH[].snap)
const ROD_PRICE = 30;
const ROD_MISS_SNAP = 0.02;    // cá giật mất mồi cũng có thể làm gãy cần
// chọn ngẫu nhiên 1 khóa theo trọng số: pickWeighted({a: {w: 3}, b: {w: 1}}, 'w') hoặc pickWeighted({a: 3, b: 1})
function pickWeighted(table, key) {
  const entries = Object.entries(table).map(([id, v]) => [id, key ? v[key] : v]);
  let r = Math.random() * entries.reduce((s, [, w]) => s + w, 0);
  for (const [id, w] of entries) if ((r -= w) < 0) return id;
  return entries[0][0];
}
// Ngày & đêm: 1 vòng 6 phút tính từ lúc bắt đầu chơi: ngày 60%, chạng vạng 15%, đêm 25% (+ rạng sáng 4% đầu vòng)
const CYCLE_MS = 6 * 60000;
const DUSK_AT = 0.6, NIGHT_AT = 0.75, DAWN_END = 0.04;
// Lửa trại chỉ cháy từ chạng vạng tới sáng; đầy 100 thì cháy vừa đúng hết 1 đêm.
// Đêm mà lửa tắt thì cứ 20 giây kẻ trộm lấy 1 cây
const FIRE_MAX = 100;
const FIRE_BURN_MS = (CYCLE_MS * (1 - DUSK_AT + DAWN_END)) / FIRE_MAX;
const FIRE_LOW = 20;
const WOOD_FUEL = 25;
const WOOD_PRICE = 10;
const THIEF_MS = 20000;
const burnFuel = (id) => Math.min(40, 8 + GOODS[id].sell);

// ---------- Trạng thái ----------
function newState() {
  return {
    coins: 60, energy: MAX_ENERGY, energyAcc: 0, xp: 0, level: 1,
    seeds: { muong: 4, hanh: 2, cai: 2, ngaicuu: 2, tiato: 2 },
    produce: {}, dishes: {}, custom: [],
    plots: Array.from({ length: 8 }, (_, i) => ({ ...emptyPlot(), c: i % 4, r: Math.floor(i / 4) })),
    lotus: LOTUS_POS.map(emptyLotus),
    stoves: [null, null],
    fire: { fuel: FIRE_MAX, outMs: 0 }, wood: 3,
    orders: [], ordersDone: 0,
    toxic: {}, wild: {}, wildAcc: WILD_MS * 3,
    ills: {}, trees: {}, treesV: 7, axe: null, rod: null, landPaid: false, fert: 0,
    roads: {}, paving: 0, forage: initialForage(), forageWait: [], forageN: 0,
    born: Date.now(), last: Date.now(),
  };
}
// mảnh đất trống; vị trí c, r giữ nguyên nên luôn dùng Object.assign khi đổi trạng thái
function emptyPlot() {
  return { crop: null, growth: 0, wetUntil: 0, bug: false, bugMs: 0, fert: false, dryMs: 0, dead: false, mut: false };
}

function load() {
  try {
    // mở file game đã tải về lần đầu: dùng tiến trình được mang theo trong file (window.__SEED)
    if (!localStorage.getItem(SAVE_KEY) && window.__SEED) {
      if (window.__SEED.save) localStorage.setItem(SAVE_KEY, window.__SEED.save);
      if (window.__SEED.deaths && !localStorage.getItem(DEATH_KEY)) localStorage.setItem(DEATH_KEY, window.__SEED.deaths);
    }
    const s = JSON.parse(localStorage.getItem(SAVE_KEY));
    if (s && Array.isArray(s.plots)) {
      s.custom = s.custom || [];
      s.fire = s.fire || { fuel: FIRE_MAX, outMs: 0 };
      if (s.wood === undefined) s.wood = 3;
      s.orders = s.orders || [];
      s.ordersDone = s.ordersDone || 0;
      // bản lưu cũ: ô thứ k nằm ở cột k % 4, hàng k / 4; bỏ các chỗ chưa mở
      s.plots = s.plots.filter((p) => p && !p.locked).map((p, k) =>
        (p.c === undefined ? Object.assign(p, { c: k % 4, r: Math.floor(k / 4) }) : p));
      // bố trí cây trên bản đồ đã đổi (bản 7): làm mới trạng thái cây của bản lưu cũ
      if (s.treesV !== 7) { s.trees = {}; s.treesV = 7; }
      s.toxic = s.toxic || {};
      if (!s.wild) { s.wild = {}; s.wildAcc = WILD_MS * 3; }
      if (s.axe === undefined) s.axe = null;
      if (s.rod === undefined) s.rod = null;
      s.fert = s.fert || 0;
      s.roads = s.roads || {};
      s.paving = s.paving || 0;
      if (!s.forage) { s.forage = initialForage(); s.forageWait = []; s.forageN = 0; }
      s.lotus = s.lotus || LOTUS_POS.map(emptyLotus);
      s.born = s.born || s.last;
      s.landPaid = !!s.landPaid;
      // bản lưu cũ chưa có bệnh tật: tặng hạt cây thuốc để kịp trồng
      if (!s.ills) {
        s.ills = {};
        s.seeds.ngaicuu = (s.seeds.ngaicuu || 0) + 2;
        s.seeds.tiato = (s.seeds.tiato || 0) + 2;
      }
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
    if (!p.crop || p.dead) continue;
    const need = CROPS[p.crop].days * DAY_MS;
    // đất khô quá lâu mà chưa tưới thì cây đang lớn chết khô; vừa mở lại game luôn còn ít nhất 15 giây để tưới
    if (p.growth < need) {
      p.dryMs = (p.dryMs || 0) + Math.max(0, now - Math.max(from, p.wetUntil));
      if (offline) p.dryMs = Math.min(p.dryMs, DRY_DIE_MS - 15000);
      if (p.dryMs >= DRY_DIE_MS) {
        p.dead = true;
        p.bug = false;
        toast(`🍂 Cây ${CROPS[p.crop].name} chết khô vì không được tưới kịp!`, true);
        continue;
      }
    }
    // côn trùng đang bám: cây ngừng lớn, để lâu thì bị ăn trụi
    if (p.bug) {
      const pest = p.pest || 'sau';
      p.bugMs += dt;
      // vừa mở lại game thì luôn còn ít nhất 10 giây để bắt
      if (offline) p.bugMs = Math.min(p.bugMs, PESTS[pest].eat - 10000);
      if (p.bugMs >= PESTS[pest].eat) {
        toast(`${CATCH[pest].name} đã ăn trụi cây ${CROPS[p.crop].name}!`, true);
        Object.assign(p, emptyPlot());
      }
      continue;
    }
    if (p.growth >= need) continue;
    // cây chỉ lớn trong khoảng thời gian đất còn ẩm; được bón phân thì lớn nhanh hơn
    const wetMs = Math.max(0, Math.min(now, p.wetUntil) - from);
    p.growth = Math.min(need, p.growth + wetMs * (p.fert ? FERT_SPEED : 1));
    if (p.growth < need && Math.random() < 1 - Math.exp(-dt * PEST_RATE)) {
      p.bug = true;
      p.bugMs = 0;
      p.pest = pickWeighted(PESTS, 'weight');
      toast(`🐛 Có ${CATCH[p.pest].name.toLowerCase()} bám vào cây ${CROPS[p.crop].name}! Bắt nhanh lên.`);
    }
  }
  // sen sống dưới nước nên luôn lớn, không cần tưới
  for (const p of state.lotus) {
    if (p.crop) p.growth = Math.min(CROPS[p.crop].days * DAY_MS, p.growth + dt);
  }
  burnFire(from, now, offline);
  // cây bị chặt trên đất chưa mua tự mọc lại
  for (const t of Object.values(state.trees)) {
    if (t.down && now >= t.down) { t.down = 0; t.hits = 0; }
  }
  // nấm dại tự mọc dần (kể cả lúc tắt game, nhưng không quá số cụm tối đa)
  state.wildAcc = Math.min(WILD_MS * WILD_MAX, state.wildAcc + dt);
  while (state.wildAcc >= WILD_MS) { state.wildAcc -= WILD_MS; spawnWild(); }
  // đồ hái lượm đến lúc mọc lại (không tìm được chỗ trống thì để lần sau thử lại)
  state.forageWait = state.forageWait.filter((f) => now < f.at || !spawnForage(f.kind));
  // bệnh đếm ngược tới lúc chết; lúc tắt game vẫn chừa ít nhất 60 giây để kịp nấu thuốc
  for (const [k, ill] of Object.entries(state.ills)) {
    ill.left = offline ? Math.max(Math.min(ill.left, 60000), ill.left - dt) : ill.left - dt;
    if (ill.left <= 0) return die(`${ILLNESSES[k].icon} ${ILLNESSES[k].name} không được chữa kịp.`, k);
  }
  // đang bệnh thì không hồi năng lượng
  if (state.energy >= MAX_ENERGY || Object.keys(state.ills).length) {
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
      toast('🌑 Bạn đi vắng hơn 16 tiếng, lửa trại đã tắt… nhóm lửa lại ngay kẻo bị trộm!', true);
    }
    f.outMs = 0;
    return;
  }
  // ban ngày lửa được ủ: không hao củi, cũng không có trộm — chỉ chạng vạng & đêm mới cần giữ lửa
  if (darkness(dayClock().f) <= 0) { f.outMs = 0; return; }
  const before = f.fuel;
  f.fuel = Math.max(0, f.fuel - (now - from) / FIRE_BURN_MS);
  if (before >= FIRE_LOW && f.fuel < FIRE_LOW && f.fuel > 0) toast('🔥 Lửa trại sắp tắt! Thêm củi hoặc đốt nông sản đi.', true);
  if (before > 0 && f.fuel <= 0) toast('🌑 Lửa trại đã tắt… kẻ trộm sắp mò tới!', true);
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
  toast(`🦝 Lửa tắt — kẻ trộm đã lấy mất cây ${CROPS[state.plots[i].crop].name}!`, true);
  Object.assign(state.plots[i], emptyPlot());
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
  toast(`🔥 Đã đốt 1 ${GOODS[id].name} (+${burnFuel(id)})`);
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
    ? prod.map((id) => `<div class="card"><div class="title"><span class="ico">${goodIco(id)}</span>${GOODS[id].name} × ${state.produce[id]}</div>
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
  $('#fireBar').style.height = f * 100 + '%';
  $('#fireStat').classList.toggle('warn', f < FIRE_LOW / FIRE_MAX);
  $('#fireFuelBar').style.width = f * 100 + '%';
  const secs = Math.ceil(state.fire.fuel * FIRE_BURN_MS / 1000);
  $('#fireFuelText').textContent = f > 0 ? `Lửa còn ${Math.ceil(f * 100)}% · cháy thêm ~${secs}s` : '🌑 Lửa đã tắt! Kẻ trộm đang rình…';
}

// ---------- Tiện ích ----------
// Thông báo: chuyện lặt vặt (đã tưới, có sâu, đã mua…) hiện ở khung nhỏ bên phải (#feed);
// chuyện quan trọng (important = true: nguy hiểm, bệnh, sói, lửa sắp tắt…) thỏ nói trên đầu,
// riêng lúc đang mở bảng/cửa sổ thì hiện ở đáy màn hình cho khỏi bị che
function toast(msg, important = false) {
  const inPanel = ['#panel', '#seedModal', '#bookModal', '#deathModal'].some((s) => !$(s).hidden);
  const box = !important ? $('#feed') : inPanel ? $('#toasts') : $('#speech');
  const el = document.createElement('div');
  el.className = important ? 'toast' : 'note';
  el.textContent = msg;
  box.appendChild(el);
  while (box.children.length > (important ? 4 : 6)) box.firstChild.remove();
  setTimeout(() => el.remove(), important ? 2600 : 4000);
}
// lời thoại bám theo đầu thỏ; đồng thời xếp lớp thỏ với cây cối để thỏ đi được dưới tán cây
let lastDepth = null;
function followBunny() {
  const b = $('#bunny');
  const r = b.getBoundingClientRect(), s = $('#speech');
  s.style.left = r.left + r.width / 2 + 'px';
  s.style.top = r.top + 'px';
  // đồ vật trong bản đồ xếp lớp theo chân (footZ); thỏ cũng vậy, cùng chân thì thỏ ở trên
  const foot = b.offsetTop + b.offsetHeight;
  b.style.zIndex = Math.max(16, footZ(foot));
  // rừng mở rộng: chỉ khi thỏ đã ra hẳn ngoài khung bản đồ chính mới cần vẽ cây rừng đè lên thỏ
  // (ở dải cây viền thì cây viền tự che thỏ theo footZ, không kéo cây rừng lên kẻo cây "mọc" ra đột ngột)
  const inForest = b.offsetLeft < -20 || b.offsetLeft > 980 || foot < 0 || foot > 960;
  const key = inForest ? Math.round(b.offsetLeft / 12) + ',' + Math.round(foot / 12) : 'clear';
  if (key !== lastDepth) {
    lastDepth = key;
    setForestFront(inForest ? { x: b.offsetLeft - b.offsetWidth / 2 + stageOX, y: b.offsetTop + stageOY, w: b.offsetWidth, h: b.offsetHeight } : null);
  }
  requestAnimationFrame(followBunny);
}
function useEnergy(n) {
  if (state.energy < n) {
    toast('😴 Thỏ mệt rồi! Vào Kho cho thỏ ăn món đã nấu nhé.', true);
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
    toast(`🎉 Lên cấp ${state.level}!` + (unlocked.length ? ' Mở khóa: ' + unlocked.join(', ') : ''), true);
  }
}
const count = (bag, id) => bag[id] || 0;
// Đồ có thể độc mà trông y hệt đồ lành (nấm dại & món nấu từ nó): trong kho chỉ đếm riêng số cái độc
// ở state.toxic; lấy ra thì bốc ngẫu nhiên. take() trả về số cái độc vừa lấy ra.
const toxicKey = (bag, id) => (bag === state.produce ? 'p:' + id : bag === state.dishes ? 'd:' + id : null);
function take(bag, id, n) {
  const key = toxicKey(bag, id), total = count(bag, id);
  let bad = 0;
  for (let i = 0; key && state.toxic[key] && i < n; i++) {
    if (Math.random() < state.toxic[key] / (total - i)) { bad++; state.toxic[key]--; }
  }
  if (key && !state.toxic[key]) delete state.toxic[key];
  bag[id] = total - n;
  if (bag[id] <= 0) delete bag[id];
  return bad;
}
function give(bag, id, n, bad = 0) {
  bag[id] = count(bag, id) + n;
  const key = toxicKey(bag, id);
  if (bad && key) state.toxic[key] = (state.toxic[key] || 0) + bad;
}
function fmtSec(ms) { return Math.ceil(ms / 1000) + 's'; }

// ---------- Thỏ (SVG) ----------
// Thỏ kiểu Don't Starve: đầu to, viền mực đen, tay chân que, tai hơi xiêu vẹo
function bunnySVG(hat) {
  const K = '#1b1611', ol = `stroke="${K}" stroke-width="3.2" stroke-linejoin="round"`;
  const W = '#efe8da', P = '#d79aa4';
  return `<svg viewBox="0 0 120 140" aria-label="Thỏ trắng hồng">
    <ellipse cx="60" cy="136" rx="28" ry="4" fill="rgba(20,15,10,.35)"/>
    <path class="fur" d="M36 50 C24 30 28 6 41 6 C54 6 54 30 50 46 Z" fill="${W}" ${ol}/>
    <path class="fur" d="M70 46 C66 26 72 4 84 8 C96 12 92 34 84 50 Z" fill="${W}" ${ol}/>
    <path d="M40 42 C34 28 36 15 42 14 C48 14 47 30 46 40 Z" fill="${P}"/>
    <path d="M74 42 C72 28 76 16 82 16 C88 18 86 32 81 42 Z" fill="${P}"/>
    <path d="M47 120 L45 132 M73 120 L75 132 M36 96 L22 110 M84 96 L98 108" stroke="${K}" stroke-width="4.5" stroke-linecap="round"/>
    <ellipse cx="43" cy="133" rx="6" ry="3" fill="${K}"/><ellipse cx="77" cy="133" rx="6" ry="3" fill="${K}"/>
    <ellipse cx="60" cy="104" rx="26" ry="22" fill="${W}" ${ol}/>
    <ellipse cx="60" cy="108" rx="13" ry="11" fill="#e8c4c8"/>
    <path d="M38 112 Q46 122 60 124" stroke="#c9bfae" stroke-width="2.5" fill="none"/>
    <ellipse class="fur" cx="60" cy="63" rx="41" ry="33" fill="${W}" ${ol}/>
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

// ---------- Bệnh tật & thuốc ----------
function fmtTime(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}
// cause = thủ phạm để ghi vào sổ: 'snake' (rắn khi chặt cây), 'sting' (côn trùng khi bắt sâu), 'spoiled' (món hỏng)
function getSick(kind, msg, cause) {
  if (state.ills[kind]) {
    state.ills[kind].cause = cause;
    toast(msg, true);
    return worsen(kind);
  }
  state.ills[kind] = { sev: 1, left: ILL_MS, cause };
  toast(`${msg} Vào Bếp nấu ${MEDICINES[ILLNESSES[kind].cure].name} trong ${fmtTime(ILL_MS)}!`, true);
}
function worsen(kind) {
  const ill = state.ills[kind];
  if (!ill || state.dead) return;
  ill.sev++;
  ill.left = Math.round(ill.left / 2);
  if (ill.sev > ILL_MAX) return die(`${ILLNESSES[kind].icon} ${ILLNESSES[kind].name} trở nặng quá mức.`, kind);
  toast(`⚠️ ${ILLNESSES[kind].name} nặng thêm (cấp ${ill.sev}/${ILL_MAX})! Chỉ còn ${fmtTime(ill.left)} để chữa.`, true);
}
function die(reason, kind) {
  if (state.dead) return;
  state.dead = 'Thỏ đã ra đi vì ' + reason;
  const ill = state.ills[kind] || {};
  recordDeath({
    cause: ill.cause || kind, reason, level: state.level, at: Date.now(),
    lived: Date.now() - (state.born || Date.now()), plots: state.plots.length,
  });
  save();
  showDeath();
}
function showDeath() {
  $('#deathReason').textContent = state.dead;
  closePanel();
  closeModal();
  $('#deathModal').hidden = false;
}

// ---------- Sổ những lần ra đi ----------
const CAUSES = {
  snake:   'Bị rắn cắn khi chặt cây',
  sting:   'Bị côn trùng đốt khi bắt sâu',
  spoiled: 'Ăn phải món tự chế bị hỏng',
  mushroom: 'Ăn phải nấm độc',
  poison:  'Trúng độc',
  stomach: 'Đau bụng',
  fish:    'Bị cá khổng lồ kéo xuống ao khi hái sen',
};
function loadDeaths() {
  try { return JSON.parse(localStorage.getItem(DEATH_KEY)) || []; } catch (e) { return []; }
}
function recordDeath(entry) {
  const list = loadDeaths();
  list.push(entry);
  try { localStorage.setItem(DEATH_KEY, JSON.stringify(list)); } catch (e) {}
}
function fmtLife(ms) {
  const m = Math.floor(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)} giờ ${m % 60} phút` : m ? `${m} phút` : `${Math.ceil(ms / 1000)} giây`;
}

// tranh minh hoạ: bia mộ tai thỏ khắc cấp lúc chết, hồn thỏ bay lên và thủ phạm đứng cạnh
function deathArtSVG(cause, level) {
  const culprit = {
    snake: `<g transform="translate(132 92)">
        <path d="M0 30 C10 18 30 36 40 22 C48 10 36 4 48 -2" stroke="${K}" stroke-width="12" fill="none" stroke-linecap="round"/>
        <path d="M0 30 C10 18 30 36 40 22 C48 10 36 4 48 -2" stroke="#6f8a3a" stroke-width="8" fill="none" stroke-linecap="round"/>
        <path d="M0 30 C10 18 30 36 40 22 C48 10 36 4 48 -2" stroke="#c9b048" stroke-width="2" stroke-dasharray="3 6" fill="none"/>
        <ellipse cx="52" cy="-4" rx="9" ry="6.5" fill="#6f8a3a" ${ink(2)}/>
        <circle cx="55" cy="-6" r="1.6" fill="${K}"/>
        <path d="M60 -2 l7 1 m-7 -1 l6 -3" stroke="#b8332e" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>`,
    sting: `<g transform="translate(168 66)">
        <ellipse cx="-2" cy="-11" rx="9" ry="5" fill="rgba(235,240,245,.85)" ${ink(1.5)} transform="rotate(-25 -2 -11)"/>
        <ellipse cx="0" cy="0" rx="15" ry="9" fill="#d9b84a" ${ink(2)}/>
        <path d="M-4 -8 v16 M5 -8 v16" stroke="${K}" stroke-width="3.5"/>
        <circle cx="-17" cy="-1" r="6.5" fill="${K}"/>
        <path d="M15 0 l9 0" stroke="${K}" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M-34 10 h-10 M-30 18 h-8" stroke="${K}" stroke-width="1.6" stroke-linecap="round"/></g>`,
    spoiled: `<g transform="translate(138 100)">
        <path d="M0 0 Q24 30 48 0 Z" fill="#c9ab78" ${ink(2.5)}/>
        <ellipse cx="24" cy="0" rx="24" ry="6" fill="#7a9a3a" ${ink(2)}/>
        <circle cx="16" cy="-1" r="2.4" fill="#5e7a2a"/><circle cx="30" cy="1" r="2" fill="#5e7a2a"/>
        <path d="M12 -8 q-5 -8 1 -14 q6 -6 0 -14 M26 -8 q-5 -8 1 -14 q6 -6 0 -14 M38 -8 q-5 -8 1 -14"
          stroke="#7a9a3a" stroke-width="2.6" fill="none" stroke-linecap="round"/></g>`,
  };
  culprit.mushroom = `<g transform="translate(140 78)">
        <rect x="16" y="20" width="12" height="28" rx="4" fill="#e8dcc0" ${ink(2)}/>
        <path d="M0 24 Q0 0 22 0 Q44 0 44 24 Z" fill="#7a3f6e" ${ink(2.5)}/>
        <circle cx="12" cy="12" r="3" fill="#c9e08a"/><circle cx="30" cy="9" r="2.5" fill="#c9e08a"/><circle cx="34" cy="18" r="2" fill="#c9e08a"/>
        <path d="M18 34 l3 3 m0 -3 l-3 3 M24 34 l3 3 m0 -3 l-3 3" stroke="${K}" stroke-width="1.6"/></g>`;
  culprit.fish = giantFishSVG().replace('<svg ', '<svg x="126" y="70" width="72" height="45" ');
  const art = culprit[cause] || culprit[cause === 'stomach' ? 'spoiled' : 'snake'];
  return `<svg viewBox="0 0 200 140" aria-hidden="true">
    <ellipse cx="100" cy="130" rx="94" ry="10" fill="#8a7a55" ${ink(2)}/>
    <path d="M84 44 C78 22 84 6 91 8 C97 10 95 28 93 40 Z M108 40 C106 24 108 8 115 8 C121 10 120 24 114 44 Z" fill="#9c988f" ${ink(2.5)}/>
    <path d="M68 130 L68 66 Q68 36 100 36 Q132 36 132 66 L132 130 Z" fill="#9c988f" ${ink(3)}/>
    <text x="100" y="74" text-anchor="middle" font-family="'Grenze Gotisch',serif" font-weight="800" font-size="15" fill="${K}">R.I.P</text>
    <text x="100" y="96" text-anchor="middle" font-family="'Grenze Gotisch',serif" font-weight="800" font-size="14" fill="${K}">Cấp ${level}</text>
    <path d="M78 108 l7 6 l-3 9 M118 112 l-5 6" stroke="#6b6660" stroke-width="1.8" fill="none"/>
    <g opacity=".7"><path d="M26 64 Q22 40 34 36 Q30 22 35 18 Q39 22 38 34 Q42 22 46 22 Q48 30 42 38 Q52 44 48 64 Q44 58 40 64 Q36 58 32 64 Q28 58 26 64 Z" fill="#f4efe4" ${ink(1.8)}/>
      <path d="M32 46 l4 4 m0 -4 l-4 4 M40 46 l4 4 m0 -4 l-4 4" stroke="${K}" stroke-width="1.6"/></g>
    <circle cx="58" cy="124" r="4" fill="#c95b6a" ${ink(1.2)}/><circle cx="64" cy="127" r="3.4" fill="#d9b84a" ${ink(1.2)}/>
    ${art}
  </svg>`;
}

let bookSpread = 0;
function openBook() {
  const deaths = loadDeaths();
  bookSpread = Math.max(0, Math.floor(deaths.length / 2));   // mở tới trang mới nhất
  renderBook();
  $('#bookModal').hidden = false;
}
function closeBook() { $('#bookModal').hidden = true; }
// trang 0 là trang tổng kết; trang k (k ≥ 1) là lần chết thứ k
function bookPage(n, deaths) {
  if (n === 0) {
    if (!deaths.length) return `<h3>📖 Sổ những lần ra đi</h3><p class="empty-note">Chưa có trang nào được viết — thỏ vẫn sống khỏe mạnh! 🐰</p>`;
    const top = {};
    deaths.forEach((d) => { top[d.cause] = (top[d.cause] || 0) + 1; });
    const worst = Object.keys(top).sort((a, b) => top[b] - top[a])[0];
    return `<h3>📖 Sổ những lần ra đi</h3>
      <p>Nơi ghi lại những lần chú thỏ nhỏ không qua khỏi.</p>
      <ul class="book-stats"><li>💀 Đã ra đi <b>${deaths.length}</b> lần</li>
        <li>⭐ Cấp cao nhất từng đạt: <b>${Math.max(...deaths.map((d) => d.level))}</b></li>
        <li>⚠️ Hay gặp nhất: <b>${CAUSES[worst] || worst}</b> (${top[worst]} lần)</li></ul>
      <p class="hint">Lật trang để xem từng lần →</p>`;
  }
  const d = deaths[n - 1];
  if (!d) return '';
  return `<div class="entry"><div class="no">Lần thứ ${n}</div>
    <div class="art">${deathArtSVG(d.cause, d.level)}</div>
    <h4>${CAUSES[d.cause] || d.cause}</h4>
    <p class="why">${d.reason}</p>
    <ul><li>⭐ Ra đi ở cấp <b>${d.level}</b></li><li>⏳ Sống được ${fmtLife(d.lived)}</li>
      <li>🟫 Có ${d.plots} ô đất</li><li>📅 ${new Date(d.at).toLocaleString('vi-VN')}</li></ul></div>`;
}
function renderBook() {
  const deaths = loadDeaths(), spreads = Math.floor(deaths.length / 2) + 1;
  bookSpread = Math.min(bookSpread, spreads - 1);
  $('#bookLeft').innerHTML = bookPage(bookSpread * 2, deaths);
  $('#bookRight').innerHTML = bookPage(bookSpread * 2 + 1, deaths) || '<p class="empty-note book-blank">( trang còn trống )</p>';
  $('#bookNo').textContent = `${bookSpread + 1} / ${spreads}`;
  $('#bookPrev').disabled = bookSpread <= 0;
  $('#bookNext').disabled = bookSpread >= spreads - 1;
}

const MED_MAX = 5;
let medPot = {};          // nguyên liệu đang bỏ vào ấm thuốc (chưa trừ khỏi kho)
let medMethod = 'sac';

function addToMed(id) {
  if (Object.values(medPot).reduce((a, b) => a + b, 0) >= MED_MAX) return toast(`Ấm thuốc chỉ chứa tối đa ${MED_MAX} nguyên liệu`);
  if (count(medPot, id) >= count(state.produce, id)) return;
  give(medPot, id, 1);
  renderMedicine();
}
function removeFromMed(id) { take(medPot, id, 1); renderMedicine(); }

function cookMedicine() {
  const kinds = Object.keys(state.ills);
  if (!kinds.length) return toast('Thỏ đang khỏe, chưa cần uống thuốc 🐰');
  const keys = Object.keys(medPot);
  if (!keys.length) return toast('Chọn nguyên liệu bỏ vào ấm trước đã');
  const mid = Object.keys(MEDICINES).find((id) => {
    const m = MEDICINES[id];
    return m.method === medMethod && Object.keys(m.in).length === keys.length && keys.every((k) => m.in[k] === medPot[k]);
  });
  for (const [id, k] of Object.entries(medPot)) take(state.produce, id, k);
  medPot = {};
  const kind = mid && kinds.find((k) => ILLNESSES[k].cure === mid);
  if (kind) {
    delete state.ills[kind];
    state.energy = Math.min(MAX_ENERGY, state.energy + 10);
    toast(`💊 Uống ${MEDICINES[mid].name} — khỏi ${ILLNESSES[kind].name} rồi!`, true);
  } else {
    toast(mid ? `😵 ${MEDICINES[mid].name} không đúng bệnh! Thỏ mệt thêm…` : '😵 Nấu sai thuốc! Thỏ uống vào bệnh nặng thêm…', true);
    kinds.forEach(worsen);
  }
  renderAll();
}

function renderMedicine() {
  // bỏ khỏi ấm những nguyên liệu không còn đủ trong kho
  for (const id of Object.keys(medPot)) {
    const have = count(state.produce, id);
    if (medPot[id] > have) { if (have) medPot[id] = have; else delete medPot[id]; }
  }
  $('#medBook').innerHTML = Object.entries(MEDICINES).map(([id, m]) => {
    const ill = Object.values(ILLNESSES).find((x) => x.cure === id);
    const mm = MED_METHODS[m.method];
    return `<div class="card"><div class="title"><span class="ico">${m.icon}</span>${m.name}</div>
      <div class="meta">Chữa ${ill.icon} ${ill.name} · cách làm: ${mm.icon} ${mm.name}</div>
      <div class="ingr">${ingrHTML(m)}</div></div>`;
  }).join('');
  const n = Object.values(medPot).reduce((a, b) => a + b, 0);
  const sick = Object.keys(state.ills).length > 0;
  const items = Object.entries(medPot).map(([id, k]) =>
    `<button class="chip in-pot" data-mremove="${id}" title="Bấm để bỏ ra">${goodIco(id)} ${GOODS[id].name} ×${k} ✕</button>`).join('');
  const avail = Object.keys(state.produce).map((id) => {
    const left = count(state.produce, id) - count(medPot, id);
    return `<button class="chip" data-madd="${id}" ${left > 0 && n < MED_MAX ? '' : 'disabled'}>${goodIco(id)} ${GOODS[id].name} (${left})</button>`;
  }).join('');
  const methods = Object.entries(MED_METHODS).map(([id, m]) =>
    `<button class="chip ${id === medMethod ? 'on' : ''}" data-mmethod="${id}">${m.icon} ${m.name}</button>`).join('');
  $('#medicine').innerHTML = `
    <div class="pot-row"><span class="big-pot">🫖</span>
      <div class="pot-items">${items || '<span class="empty-note">Ấm thuốc đang trống — chọn nguyên liệu bên dưới</span>'}</div></div>
    <div class="row"><span class="label">Nguyên liệu trong kho (${n}/${MED_MAX}):</span>
      ${avail || '<span class="empty-note">Chưa có nông sản nào</span>'}</div>
    <div class="row"><span class="label">Cách làm:</span>${methods}</div>
    <div class="row"><button class="btn" data-mcook="1" ${sick && n ? '' : 'disabled'}>💊 Nấu thuốc & cho thỏ uống</button>
      ${sick ? '' : '<span class="meta">Thỏ đang khỏe, chưa cần uống thuốc</span>'}</div>`;
}

// phần thay đổi liên tục (gọi mỗi nhịp tick)
function updateIllView() {
  const kinds = Object.keys(state.ills);
  const sick = kinds.length > 0;
  $('#illStat').hidden = !sick;
  $('#illText').textContent = sick ? fmtTime(Math.min(...kinds.map((k) => state.ills[k].left))) : '';
  $('#illStat').title = sick ? `Đang bị ${kinds.map((k) => ILLNESSES[k].name.toLowerCase()).join(' & ')} — bấm để vào Bếp nấu thuốc` : '';
  // trúng độc: đầu thỏ xanh dần theo cấp bệnh; đau bụng: hiện mặt 🤢
  const poison = state.ills.poison || state.ills.mushroom;
  ['#avatar', '#bunny', '#chef'].forEach((s) => {
    const el = $(s);
    el.classList.toggle('stomach', !!state.ills.stomach);
    if (poison) el.dataset.poison = poison.sev; else delete el.dataset.poison;
  });
  $('#illStatus').innerHTML = sick
    ? kinds.map((k) => {
        const ill = state.ills[k], I = ILLNESSES[k];
        return `<span class="ill">${I.icon} ${I.name} · cấp ${ill.sev}/${ILL_MAX} · còn ${fmtTime(ill.left)} → cần ${MEDICINES[I.cure].name}</span>`;
      }).join('')
    : '<span class="meta">🐰 Thỏ đang khỏe mạnh.</span>';
}

// Toạ độ (x, y) của bunny là điểm giữa-trên của nó trên bản đồ #world
// trả về số mili giây thỏ cần để tới nơi; đi chỗ khác thì huỷ việc đang chờ làm ở chỗ cũ
let pendingAct = null;
function moveBunny(x, y) {
  clearTimeout(pendingAct);
  pendingAct = null;
  if (chasing) stopChase();   // đi chỗ khác thì thôi đuổi sói
  const bunny = $('#bunny');
  // đi xa thì lâu hơn & nhảy nhiều bước hơn (mỗi bước 0,45 giây)
  const secs = Math.min(3, Math.max(0.45, Math.hypot(x - bunny.offsetLeft, y - bunny.offsetTop) / 360));
  bunny.style.transitionDuration = secs + 's';
  bunny.style.setProperty('--hops', Math.round(secs / 0.45));
  bunny.classList.toggle('flip', x < bunny.offsetLeft);
  // chân thỏ ở dưới nước thì phải bơi; đổi dáng lúc tới gần mép nước
  const wet = inWater(x, y + bunny.offsetHeight);
  clearTimeout(moveBunny.swimT);
  if (wet !== bunny.classList.contains('swim')) {
    moveBunny.swimT = setTimeout(() => bunny.classList.toggle('swim', wet), secs * 1000 * (wet ? 0.7 : 0.3));
  }
  bunny.style.left = x + 'px';
  bunny.style.top = y + 'px';
  bunny.classList.remove('hop');
  void bunny.offsetWidth;
  bunny.classList.add('hop');
  return secs * 1000;
}
// điểm (x, chân) nằm trong ao mà không đứng trên cầu câu
function inWater(x, footY) {
  const d = $('#b-pond');
  const onDock = x > d.offsetLeft && x < d.offsetLeft + d.offsetWidth
    && footY > d.offsetTop - 10 && footY < d.offsetTop + d.offsetHeight;
  return !onDock && inPond(x, footY);
}
// thỏ tới nơi rồi mới làm việc (hái, chặt, mở nhà, đánh sói…)
function whenArrived(ms, fn) {
  pendingAct = setTimeout(() => {
    pendingAct = null;
    if (!state.dead) fn();
  }, ms);
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
let stageOX = 0, stageOY = 0;
let worldW = 960, worldH = 960;   // kích thước cả vùng bản đồ đang hiện trên màn hình (gồm rừng mở rộng)   // vị trí khung bản đồ 960 trong #world (để đặt đèn lúc đêm)
function layoutWorld() {
  const vp = $('.world-viewport');
  const vw = vp.clientWidth, vh = vp.clientHeight;
  if (!vw || !vh) return;
  // chừa chỗ cho cột công cụ bên trái & túi đồ ở đáy; đồng hồ góc trên được phép đè lên rừng viền
  const LEFT = 64, TOP = 10, BOTTOM = 66;
  // chỉ cần vừa khít vùng chính (nhà + ruộng), phần rừng viền ngoài được phép tràn ra mép → nhìn to hơn
  const CX = 480, CY = 500, CW = 900, CH = 860;
  // màn to (27", 34"…) thì không phóng to thêm nữa mà mở rộng tầm nhìn: rừng trải ra lấp kín màn hình
  const MAX_ZOOM = 1.2;
  const s = Math.min((vw - LEFT) / CW, (vh - TOP - BOTTOM) / CH, MAX_ZOOM);
  const W = vw / s, H = vh / s;
  const ox = (LEFT + (vw - LEFT) / 2) / s - CX, oy = (TOP + (vh - TOP - BOTTOM) / 2) / s - CY;
  stageOX = ox;
  stageOY = oy;
  worldW = W;
  worldH = H;
  worldScale = s;
  const world = $('#world');
  world.style.width = W + 'px';
  world.style.height = H + 'px';
  world.style.transform = `scale(${s})`;
  $('#stage').style.left = ox + 'px';
  $('#stage').style.top = oy + 'px';
  renderForest(W, H, ox, oy, treeStateOf);
  lastDepth = null;
}
function hopTo(i) {
  const tile = $('#garden').children[i];
  if (!tile) return 0;
  lastHop = i;
  const r = rectInWorld(tile);
  return moveBunny(r.x + r.w * 0.85, r.y + r.h - $('#bunny').offsetHeight * 0.85);
}
function walkToBuilding(el) {
  lastHop = null;
  const r = rectInWorld(el);
  return moveBunny(r.x + r.w / 2, r.y + r.h - $('#bunny').offsetHeight + 8);
}

// ---------- Các ngôi nhà ----------
const PANEL_TITLES = {
  kitchen: '🍳 Nhà bếp', storage: '🧺 Nhà kho', shop: '🏪 Cửa hàng', fire: '🔥 Lửa trại', orders: '📜 Bảng đơn hàng',
  pond: '🎣 Cầu câu cá',
};
function openPanel(name) {
  $('#panelTitle').textContent = PANEL_TITLES[name];
  document.querySelectorAll('#panel .view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
  $('#panel').hidden = false;
}
function closePanel() { $('#panel').hidden = true; }

// ---------- Vườn ----------
function plotClick(i) {
  whenArrived(hopTo(i), () => plotAction(i));
}
function plotAction(i) {
  const p = state.plots[i];
  if (!p.crop) return openSeedPicker(i);
  if (p.dead) return clearDead(i);
  if (p.bug) return catchBug(i);
  const c = CROPS[p.crop];
  const need = c.days * DAY_MS;
  if (p.growth >= need) return harvest(i, true);
  if (Date.now() < p.wetUntil) {
    if (!p.fert && state.fert > 0) return fertilize(i, true);
    const daysLeft = Math.ceil((need - p.growth) / DAY_MS);
    return toast(`${c.icon} ${c.name} đang lớn — còn ${daysLeft} ngày nữa`);
  }
  water(i, true);
}

function catchBug(i) {
  const p = state.plots[i];
  if (!useEnergy(COST.bug)) return;
  const pest = p.pest || 'sau';
  p.bug = false;
  p.bugMs = 0;
  give(state.produce, pest, 1);
  addXp(2);
  toast(`🫙 Bắt được 1 ${CATCH[pest].name.toLowerCase()} — cất vào kho làm mồi câu cá!`);
  if (Math.random() < STING_RATE) getSick('poison', '🐝 Ối! Thỏ bị côn trùng đốt khi bắt sâu.', 'sting');
  renderAll();
}

// ---------- Rìu & chặt cây ----------
// Cây nào trên bản đồ (data-tree trong #decor) cũng chặt được để lấy củi; chặt đổ còn gốc,
// 90 giây sau mọc lại. Đặt đất đè lên gốc cây thì cây mất hẳn.
const treeAt = (id) => (state.trees[id] = state.trees[id] || { hits: 0, down: 0 });
const treeHits = (el) => (el.offsetWidth >= 100 ? 4 : 3);   // cây to chặt lâu hơn
function axeText() {
  if (!state.axe) return 'chưa có rìu';
  return state.axe.left >= 3 ? 'rìu còn tốt' : state.axe.left === 2 ? 'rìu đã mòn' : 'rìu sắp gãy';
}

// trạng thái hiển thị của 1 cây theo id (dùng cho cả cây rừng mở rộng)
const treeStateOf = (id) => { const t = state.trees[id]; return !t ? 'up' : t.gone ? 'gone' : t.down ? 'stump' : 'up'; };
function chopTree(el) {
  chop(el.dataset.tree, treeHits(el), () => { el.classList.remove('chop'); void el.offsetWidth; el.classList.add('chop'); });
}
// cây rừng mở rộng (vẽ chung trong 1 SVG): tìm theo id vì đổi cỡ màn hình thì phần tử được vẽ lại
function chopOuter(id) {
  const ft = forestTrees.find((t) => t.id === id);
  if (ft) chop(id, ft.w >= 100 ? 4 : 3, () => {});
}
// cây rừng mở rộng ở điểm (x, y) toạ độ khung 960 (chọn cây gần người xem nhất nếu chồng nhau)
function outerTreeAt(x, y) {
  const wx = x + stageOX, wy = y + stageOY;
  let best = null;
  for (const t of forestTrees) {
    if (t.s === 'gone') continue;
    const top = t.s === 'stump' ? t.foot - t.w * 0.5 : t.y + t.w * 0.3;
    if (wx > t.x + t.w * 0.2 && wx < t.x + t.w * 0.8 && wy > top && wy < t.foot && (!best || t.foot > best.foot)) best = t;
  }
  return best;
}
function chop(id, need, shake) {
  const t = treeAt(id);
  if (t.gone) return;
  if (t.down) return toast(`🌱 Gốc cây đang đâm chồi — ${fmtSec(t.down - Date.now())} nữa sẽ mọc lại. Chuột phải vào đây để lát đường!`);
  if (!state.axe) return toast('🪓 Cần có rìu mới chặt được cây! Mua rìu ở Cửa hàng.');
  if (!useEnergy(COST.chop)) return;
  t.hits++;
  shake();
  if (Math.random() < SNAKE_RATE) getSick('poison', '🐍 Có rắn trong gốc cây — thỏ bị rắn cắn!', 'snake');
  if (t.hits < need) {
    toast(`🪓 Cộc! (${t.hits}/${need} nhát)`);
    return renderAll();
  }
  t.hits = 0;
  t.down = Date.now() + TREE_REGROW_MS;
  state.wood += 2;
  addXp(6);
  toast(state.landPaid ? '🌳 Cây đổ, +2 🪵 củi! Đặt đất vào chỗ trống ngay kẻo cây mọc lại.'
    : '🌳 Cây đổ, +2 🪵 củi. Một lúc sau cây sẽ mọc lại…');
  if (--state.axe.left <= 0) {
    state.axe = null;
    toast('💥 Rắc! Rìu gãy rồi — mua rìu mới ở Cửa hàng nhé.', true);
  }
  renderAll();
}
function walkToTree(el) {
  lastHop = null;
  return moveBunny(el.offsetLeft + el.offsetWidth / 2, el.offsetTop + el.offsetHeight - $('#bunny').offsetHeight);
}

// vẽ lại cây theo trạng thái (đứng / gốc / mất hẳn); trả về true nếu có cây đổi trạng thái
const treeArt = new Map();
function renderTrees() {
  let changed = false;
  document.querySelectorAll('#decor [data-tree]').forEach((el) => {
    const id = el.dataset.tree, t = state.trees[id];
    const s = !t ? 'up' : t.gone ? 'gone' : t.down ? 'stump' : 'up';
    if (el.dataset.state === s) return;
    if (!treeArt.has(id)) treeArt.set(id, el.innerHTML);
    el.dataset.state = s;
    el.hidden = s === 'gone';
    el.innerHTML = s === 'stump' ? stumpSVG(el.dataset.kind === 'birch' ? 125 : 170) : treeArt.get(id);
    changed = true;
  });
  return changed;
}

// ---------- Lát đường ----------
// chuột phải vào chỗ đất: thỏ chạy tới lát đường ở đó. Phải lát nối tiếp từ đường chính
// (đường mòn, quảng trường, sân trước nhà) hoặc từ đoạn đã lát. Cây đang đứng (kể cả cây rừng mở rộng)
// thì phải chặt trước; gặp gốc cây thì đào luôn, cây không mọc lại.
// Đường lát vẽ chung lớp & cùng kiểu với đường mòn (#roadEdge/#roadDirt) nên các đoạn nối liền vào nhau.
const PAVE_PRICE = 8;
const ROAD_W = 48;       // bề ngang đường (khoảng chiếm chỗ để kiểm tra vướng)
const ROAD_REACH = 90;   // điểm lát mới phải cách đường cũ không quá chừng này
const ROAD_LINK = 110;   // các điểm lát gần hơn chừng này thì vẽ nối liền
// điểm (x, y) đã nằm trên đường (đường mòn hoặc đường đã lát)
function onMainRoad(x, y) {
  const pt = new DOMPoint(x, y);
  return [...document.querySelectorAll('.paths .dirt')].some((p) => p.isPointInStroke(pt)) || $('.paths .plaza').isPointInFill(pt)
    || [...document.querySelectorAll('.paths .pad')].some((p) => p.isPointInFill(pt));
}
// các điểm dọc tâm đường mòn chính, quảng trường & sân trước nhà (để nối đường lát vào)
let mainPts = null;
function mainRoadPoints() {
  if (mainPts) return mainPts;
  mainPts = [];
  const main = $('.paths .dirt:not(#roadDirt)'), len = main.getTotalLength();
  for (let l = 0; l <= len; l += 6) { const p = main.getPointAtLength(l); mainPts.push({ x: p.x, y: p.y }); }
  for (let a = 0; a < 24; a++) mainPts.push({ x: 470 + Math.cos(a * Math.PI / 12) * 50, y: 390 + Math.sin(a * Math.PI / 12) * 50 });
  document.querySelectorAll('.paths .pad').forEach((e) => {
    const cx = +e.getAttribute('cx'), cy = +e.getAttribute('cy'), rx = +e.getAttribute('rx'), ry = +e.getAttribute('ry');
    for (let a = 0; a < 24; a++) mainPts.push({ x: cx + Math.cos(a * Math.PI / 12) * rx * 0.75, y: cy + Math.sin(a * Math.PI / 12) * ry * 0.6 });
  });
  return mainPts;
}
const nearest = (pts, x, y) => pts.reduce((b, p) => { const d = Math.hypot(p.x - x, p.y - y); return d < b.d ? { p, d } : b; }, { p: null, d: Infinity });
// điểm lát ở (x, y) có nối được với đường chính / đoạn đã lát không
function roadConnected(x, y) {
  return nearest(Object.values(state.roads), x, y).d < ROAD_REACH || nearest(mainRoadPoints(), x, y).d < ROAD_REACH;
}
// chỗ gốc cây rừng mở rộng chiếm (toạ độ khung 960)
const outerFoot = (t) => ({ x: t.x - stageOX + t.w * 0.2, y: t.foot - stageOY - t.w * 0.6, w: t.w * 0.6, h: t.w * 0.6 });
function tryPave(x, y) {
  if (state.paving <= 0) return toast('🛤️ Hết đá lát đường — mua ở Cửa hàng (mục Mở rộng).', true);
  if (onMainRoad(x, y) || nearest(Object.values(state.roads), x, y).d < 26) return toast('Chỗ này đã là đường rồi.');
  if (inWater(x, y)) return toast('Không lát đường xuống ao được!');
  const box = { x: x - ROAD_W / 2, y: y - 14, w: ROAD_W, h: 28 };
  if (state.plots.some((p) => hit(cellRect(p.c, p.r), box))) return toast('Chỗ này là ruộng, không lát đường được.');
  if ([...document.querySelectorAll('.building')].some((b) => hit(boxOf(b), box))) return toast('Vướng nhà rồi, lát chỗ khác nhé.');
  const trees = [...document.querySelectorAll('#decor [data-tree]')].filter((el) => !el.hidden && hit(treeFoot(el), box));
  const outer = forestTrees.filter((t) => t.s !== 'gone' && hit(outerFoot(t), box));
  if (trees.some((el) => el.dataset.state !== 'stump') || outer.some((t) => t.s !== 'stump')) {
    return toast('🌳 Có cây chắn đường — chặt cây trước rồi mới lát được.', true);
  }
  if (!roadConnected(x, y)) return toast('🛤️ Đường phải lát nối tiếp từ đường chính (hoặc từ đoạn đã lát) ra.', true);
  lastHop = null;
  const ids = trees.map((el) => el.dataset.tree).concat(outer.map((t) => t.id));
  whenArrived(moveBunny(x, y - $('#bunny').offsetHeight + 6), () => layRoad(x, y, ids));
}
// stumpIds = gốc cây nằm dưới chỗ lát: đào luôn, cây mất hẳn
function layRoad(x, y, stumpIds) {
  if (state.paving <= 0 || !useEnergy(COST.pave)) return;
  state.paving--;
  stumpIds.forEach((id) => Object.assign(treeAt(id), { gone: true, down: 0, hits: 0 }));
  state.roads['r' + Date.now()] = { x: Math.round(x), y: Math.round(y) };
  addXp(1);
  toast(`🛤️ Đã lát đường${stumpIds.length ? ' (đào luôn gốc cây)' : ''} — còn ${state.paving} đá lát`);
  renderAll();
}
// đá cuội nhặt ở tảng đá: 3 viên đổi được 1 đá lát đường
function craftPaving() {
  if (count(state.produce, 'dacuoi') < 3) return;
  take(state.produce, 'dacuoi', 3);
  state.paving++;
  toast(`🪨 Đã ghép 3 đá cuội thành 1 đá lát (có ${state.paving} đá lát)`);
  renderAll();
}
function buyPaving(n) {
  if (state.coins < PAVE_PRICE * n) return;
  state.coins -= PAVE_PRICE * n;
  state.paving += n;
  toast(`🛒 Đã mua ${n} đá lát đường`);
  renderAll();
}
// vẽ đường lát: mỗi điểm lát nối với các điểm lát gần nó và với đường chính gần nhất
function renderRoads() {
  const pts = Object.values(state.roads);
  const key = pts.map((r) => r.x + ',' + r.y).join(';');
  if (key === renderRoads.prev) return;
  renderRoads.prev = key;
  let d = '';
  pts.forEach((r, i) => {
    d += `M${r.x} ${r.y} l.1 0 `;
    for (let k = i + 1; k < pts.length; k++) {
      if (Math.hypot(pts[k].x - r.x, pts[k].y - r.y) < ROAD_LINK) d += `M${r.x} ${r.y} L${pts[k].x} ${pts[k].y} `;
    }
    const m = nearest(mainRoadPoints(), r.x, r.y);
    if (m.d < ROAD_LINK) d += `M${r.x} ${r.y} L${m.p.x.toFixed(1)} ${m.p.y.toFixed(1)} `;
  });
  $('#roadEdge').setAttribute('d', d);
  $('#roadDirt').setAttribute('d', d);
}
function buyAxe() {
  if (state.axe || state.coins < AXE_PRICE) return;
  state.coins -= AXE_PRICE;
  state.axe = { left: 3 + Math.floor(Math.random() * 3) };
  toast('🪓 Đã mua 1 cây rìu mới!');
  renderAll();
}

// ---------- Nấm dại ----------
// mỗi cụm 1–2 cây nấm; cụm độc thì cả cụm độc. Nhìn bề ngoài không phân biệt được.
function spawnWild() {
  if (Object.keys(state.wild).length >= WILD_MAX) return;
  const plots = state.plots.map((p) => cellRect(p.c, p.r));
  const free = WILD_SPOTS.map((_, i) => i).filter((i) => !state.wild[i]
    && !plots.some((b) => hit(b, { x: WILD_SPOTS[i][0], y: WILD_SPOTS[i][1], w: 30, h: 26 })));
  if (!free.length) return;
  state.wild[randOf(free)] = { n: Math.random() < 0.5 ? 2 : 1, bad: Math.random() < WILD_TOXIC, v: Math.floor(Math.random() * 4) };
}
// ăn phải món có nấm độc: lúc này mới lộ ra
function eatToxic() {
  state.energy = Math.max(0, state.energy - 20);
  getSick('mushroom', '😵‍💫 Ối, trong món có nấm độc! Thỏ chóng mặt buồn nôn.', 'mushroom');
}
function pickWild(i) {
  const w = state.wild[i];
  if (!w || !useEnergy(COST.pick)) return;
  delete state.wild[i];
  give(state.produce, 'nam', w.n, w.bad ? w.n : 0);
  addXp(1);
  toast(`🍄 Hái được ${w.n} nấm dại — trông ngon lắm, mà… có độc không nhỉ?`);
  renderAll();
}
function renderWild() {
  const html = Object.entries(state.wild).map(([i, w]) => {
    const [x, y] = WILD_SPOTS[i];
    return `<button class="wild" data-wild="${i}" title="Nấm dại — bấm để hái (⚡${COST.pick})"
      style="left:${x}px; top:${y}px; z-index:${footZ(y + 26)}">${wildShroomSVG(w.v)}</button>`;
  }).join('');
  if (html !== renderWild.prev) { renderWild.prev = html; $('#wild').innerHTML = html; }
}

// ---------- Hái lượm ----------
const forageFoot = (f) => f.y + f.w * artRatio(f.kind);   // y chân của món đồ
// tìm 1 chỗ trống ngẫu nhiên cho món đồ mới mọc: không trên đường, ruộng, nhà, ao, gốc cây, đồ vật khác
function freeSpot(kind) {
  const w = FORAGE[kind].w, h = w * artRatio(kind);
  const solid = [...document.querySelectorAll('.building')].map((el) => boxOf(el))
    .concat([...document.querySelectorAll('#decor [data-tree]')].filter((el) => !el.hidden).map(treeFoot))
    .concat([...document.querySelectorAll('#decor .decor:not([data-tree]):not([data-kind="pond"])')].map((el) => boxOf(el)))
    .concat(state.plots.map((p) => { const b = cellRect(p.c, p.r); return { x: b.x - 8, y: b.y - 8, w: b.w + 16, h: b.h + 16 }; }));
  for (let k = 0; k < 120; k++) {
    const fx = 50 + Math.random() * 860, fy = 150 + Math.random() * 740;   // chân món đồ
    const box = { x: fx - w / 2, y: fy - Math.min(h, 34), w, h: Math.min(h, 34) };
    if (inPond(fx, fy) || inPond(fx, fy - h / 2) || onPath(box)) continue;
    if (solid.some((b) => hit(b, box))) continue;
    if (nearest(Object.values(state.roads), fx, fy).d < 45) continue;
    if (state.forage.some((f) => Math.hypot(f.x + f.w / 2 - fx, forageFoot(f) - fy) < 40)) continue;
    if (WILD_SPOTS.some(([x, y]) => Math.hypot(x + 15 - fx, y + 26 - fy) < 36)) continue;
    return { x: Math.round(fx - w / 2), y: Math.round(fy - h), w };
  }
  return null;
}
function spawnForage(kind) {
  const spot = freeSpot(kind);
  if (!spot) return false;
  state.forage.push({ id: 'g' + (++state.forageN), kind, ...spot, v: Math.floor(Math.random() * 4) });
  return true;
}
function pickForage(id) {
  const i = state.forage.findIndex((f) => f.id === id);
  if (i < 0) return;
  const f = state.forage[i], F = FORAGE[f.kind];
  if (!useEnergy(F.cost || COST.pick)) return;
  state.forage.splice(i, 1);
  state.forageWait.push({ kind: f.kind, at: Date.now() + F.regrow });
  if (F.wood) {
    state.wood += F.wood;
    toast(`🪵 Nhặt được ${F.wood} bó củi từ khúc gỗ mục`);
  } else {
    give(state.produce, F.give, F.n);
    toast(`🧺 Hái được ${F.n} ${GOODS[F.give].name.toLowerCase()}`);
  }
  addXp(1);
  renderAll();
}
function renderForage() {
  const key = state.forage.map((f) => f.id).join();
  if (key === renderForage.prev) return;
  renderForage.prev = key;
  $('#forage').innerHTML = state.forage.map((f) =>
    `<button class="forage" data-forage="${f.id}" title="${FORAGE[f.kind].title} (⚡${FORAGE[f.kind].cost || COST.pick})"
      style="left:${f.x}px; top:${f.y}px; width:${f.w}px; z-index:${footZ(forageFoot(f))}">${forageArt(f.kind, f.v)}</button>`).join('');
}

// ---------- Câu cá ----------
// mắc mồi (côn trùng bắt trên ruộng) rồi thả câu ở cầu; 2,5–6 giây sau cá cắn hoặc rỉa mất mồi
let bait = 'sau';
let fishing = null;      // { bait, end } khi phao đang thả
function buyRod() {
  if (state.rod || state.coins < ROD_PRICE) return;
  state.coins -= ROD_PRICE;
  state.rod = true;
  toast('🎣 Đã mua 1 cần câu mới!');
  renderAll();
}
function castLine() {
  if (fishing) return;
  if (!state.rod) return toast('🎣 Cần có cần câu! Mua ở Cửa hàng.');
  if (!count(state.produce, bait)) return toast('Hết mồi rồi — bắt sâu, côn trùng trên ruộng để làm mồi.');
  if (!useEnergy(COST.fish)) return;
  take(state.produce, bait, 1);
  const dock = $('#b-pond');
  lastHop = null;
  const walk = moveBunny(dock.offsetLeft + dock.offsetWidth - 34, dock.offsetTop + 34 - $('#bunny').offsetHeight);
  // tính giờ chờ cá cắn từ lúc thỏ ra tới cuối cầu
  fishing = { bait, end: Date.now() + walk + 2500 + Math.random() * 3500 };
  // đóng bảng để xem thỏ ngồi câu; kết quả sẽ hiện trên đầu thỏ
  closePanel();
  toast(`🎣 Mắc ${CATCH[bait].name.toLowerCase()} rồi thả câu…`, true);
  renderAll();
}
function reelIn() {
  const b = BAITS[fishing.bait];
  fishing = null;
  let snap = ROD_MISS_SNAP;
  if (Math.random() < b.bite) {
    const fish = pickWeighted(b.fish);
    give(state.produce, fish, 1);
    addXp(CATCH[fish].xp);
    snap = CATCH[fish].snap;
    toast(`🐟 Câu được 1 ${CATCH[fish].name}!`, true);
  } else {
    toast('💨 Hụt rồi! Cá rỉa mất mồi chạy mất…', true);
  }
  if (Math.random() < snap) {
    state.rod = null;
    toast('💥 Cá giật mạnh quá — cần câu gãy rồi! Mua cần mới ở Cửa hàng.', true);
  }
  renderAll();
}
function renderPond() {
  const baits = Object.keys(BAITS);
  if (!count(state.produce, bait)) bait = baits.find((id) => count(state.produce, id)) || bait;
  $('#b-pond').classList.toggle('fishing', !!fishing);
  $('#fishStatus').textContent = fishing ? '🎣 Phao đang nhấp nhô… chờ cá cắn câu'
    : `Cần câu: ${state.rod ? 'đang có' : 'chưa có — mua ở Cửa hàng'} · Mồi đang mắc: ${CATCH[bait].name} (còn ${count(state.produce, bait)})`;
  $('#fishActions').innerHTML = `<button class="btn" data-cast="1" ${state.rod && count(state.produce, bait) && !fishing ? '' : 'disabled'}>
    🎣 Thả câu (⚡${COST.fish})</button>`;
  $('#baitList').innerHTML = baits.map((id) => {
    const n = count(state.produce, id), on = id === bait;
    return `<div class="card"><div class="title"><span class="ico">${goodIco(id)}</span>${CATCH[id].name} × ${n}</div>
      <div class="meta">Cá hay cắn: ${Object.keys(BAITS[id].fish).map((f) => CATCH[f].name).join(', ')}</div>
      <div class="actions"><button class="btn sm ${on ? '' : 'ghost'}" data-bait="${id}" ${n ? '' : 'disabled'}>
        ${on ? '✓ Đang mắc' : 'Mắc mồi này'}</button></div></div>`;
  }).join('');
  $('#fishInfo').innerHTML = ['tom', 'carophi', 'cachep', 'caloc'].map((id) => `<div class="card">
      <div class="title"><span class="ico">${goodIco(id)}</span>${CATCH[id].name}</div>
      <div class="meta">Bán 🪙${CATCH[id].sell} · ⭐${CATCH[id].xp} · ${CATCH[id].snap >= 0.1 ? 'rất khỏe, dễ làm gãy cần' : CATCH[id].snap >= 0.07 ? 'khá khỏe' : 'hiền'}</div></div>`).join('');
}

// ---------- Ao sen ----------
// thả ngó sen ở ô nước, sen nở thì hái; hái sen có thể gặp cá khổng lồ
const lotusRipe = (p) => !!p.crop && p.growth >= CROPS[p.crop].days * DAY_MS;
const isBig = () => !!(state.morph && state.morph.kind === 'big');

function lotusAction(i) {
  const p = state.lotus[i];
  if (!p.crop) return openSeedPicker(i, true);
  if (!lotusRipe(p)) {
    const daysLeft = Math.ceil((CROPS[p.crop].days * DAY_MS - p.growth) / DAY_MS);
    return toast(`🪷 Sen đang lớn — còn ${daysLeft} ngày nữa mới nở`);
  }
  harvestLotus(i);
}

function plantLotus(i, cropId) {
  if (count(state.seeds, cropId) <= 0 || state.lotus[i].crop) return;
  if (!useEnergy(COST.plant)) return;
  take(state.seeds, cropId, 1);
  state.lotus[i] = { crop: cropId, growth: 0 };
  toast(`🪷 Đã thả ngó sen xuống ao`);
  closeModal();
  renderAll();
}

function harvestLotus(i) {
  const p = state.lotus[i];
  if (!lotusRipe(p) || !useEnergy(COST.harvest + 1)) return;
  const c = CROPS[p.crop];
  const big = isBig();
  if (Math.random() < (big ? GIANT_FISH_RATE_BIG : GIANT_FISH_RATE)) {
    // thỏ bình thường không chống nổi cá khổng lồ
    if (!big) {
      state.lotus[i] = emptyLotus();
      return die('bị cá khổng lồ ngoi lên kéo xuống đáy ao lúc đang hái sen 🐟', 'fish');
    }
    give(state.produce, 'cakhonglo', 1);
    addXp(CATCH.cakhonglo.xp);
    toast('💪🐟 Cá khổng lồ ngoi lên đớp — nhưng thỏ khổng lồ đã đánh thắng và tóm gọn nó!', true);
  }
  give(state.produce, p.crop, c.yield);
  addXp(c.xp);
  state.lotus[i] = emptyLotus();
  toast(`🪷 Hái được ${c.yield} ${c.name.toLowerCase()}`);
  renderAll();
}

function renderLotus() {
  const html = state.lotus.map((p, i) => {
    const [x, y] = LOTUS_POS[i];
    const ripe = lotusRipe(p);
    const stage = !p.crop ? -1 : ripe ? 3 : Math.min(2, Math.floor((p.growth / (CROPS[p.crop].days * DAY_MS)) * 3));
    const title = !p.crop ? 'Ô nước trống — bấm để thả ngó sen'
      : ripe ? 'Sen đã nở! Bấm để hái (coi chừng cá khổng lồ)' : 'Sen đang lớn';
    return `<button class="lotus grow ${ripe ? 'ripe' : ''}" data-lotus="${i}" title="${title}" style="left:${x}px; top:${y}px">
      ${stage < 0 ? '<span class="lotus-empty">+</span>' : lotusSVG(stage)}</button>`;
  }).join('');
  // chỉ vẽ lại khi sen đổi giai đoạn (để hiệu ứng mọc chạy & không mất cú bấm)
  if (html !== renderLotus.prev) {
    renderLotus.prev = html;
    $('#lotus').innerHTML = html;
    document.querySelectorAll('#lotus svg').forEach(sketchStatic);
  }
}

// ---------- Mua & đặt đất ----------
// mua đất xong chọn ô lưới trống bất kỳ: không vướng nhà, đường, ao, đá, bụi quả, cây đang đứng hay ô đất khác
let placing = false;
const hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
const boxOf = (el, pad = 0) => ({ x: el.offsetLeft + pad, y: el.offsetTop + pad, w: el.offsetWidth - 2 * pad, h: el.offsetHeight - 2 * pad });
// chỗ gốc cây chiếm (nửa dưới thân & tán)
function treeFoot(el) {
  const b = boxOf(el);
  return { x: b.x + b.w * .2, y: b.y + b.h * .6, w: b.w * .6, h: b.h * .4 };
}
function obstacles() {
  const out = [...document.querySelectorAll('.building')].map((el) => ({ ...boxOf(el), h: el.offsetHeight + 8 }));
  document.querySelectorAll('#decor [data-tree]').forEach((el) => { if (el.dataset.state === 'up') out.push(treeFoot(el)); });
  document.querySelectorAll('#decor :is([data-kind="boulder"], [data-kind="berry"], [data-kind="torch"], [data-kind="pond"],'
    + ' [data-kind="barrel"], [data-kind="crate"], [data-kind="woodpile"], [data-kind="log"])')
    .forEach((el) => out.push(boxOf(el, 4)));
  // bụi quả, tảng đá, khúc gỗ… đang mọc trên bản đồ (hoa & cỏ nhỏ thì đặt đất đè lên được)
  document.querySelectorAll('#forage .forage').forEach((el) => { if (el.offsetWidth > 30) out.push(boxOf(el, 4)); });
  return out;
}
function onPath(b) {
  const edge = $('.paths .edge'), plaza = $('.paths .plaza-edge');
  for (let i = 0; i <= 4; i++) {
    for (let j = 0; j <= 3; j++) {
      const pt = new DOMPoint(b.x + (b.w * i) / 4, b.y + (b.h * j) / 3);
      if (edge.isPointInStroke(pt) || plaza.isPointInFill(pt)) return true;
    }
  }
  return false;
}
function freeCells() {
  const obs = obstacles(), out = [];
  for (let r = -4; r <= 4; r++) {
    for (let c = 0; c <= 6; c++) {
      const b = cellRect(c, r);
      // mép dưới bản đồ bị tán cây rừng phía trước che nên không cho đặt
      if (b.x < 8 || b.y < 30 || b.x + b.w > 952 || b.y + b.h > 860) continue;
      if (state.plots.some((p) => p.c === c && p.r === r)) continue;
      if (obs.some((o) => hit(o, b)) || onPath(b)) continue;
      out.push([c, r]);
    }
  }
  return out;
}

function plotCost() { return 40 + (state.plots.length - 8) * 30; }
function buyLand() {
  if (state.landPaid || state.plots.length >= MAX_PLOTS || state.coins < plotCost()) return;
  state.coins -= plotCost();
  state.landPaid = true;
  renderAll();
  startPlacing();
}
function startPlacing() {
  placing = true;
  closePanel();
  toast(renderPlacer() ? '📜 Bấm vào một ô sáng để đặt đất — chỗ vướng cây thì chặt cây trước!'
    : '🌲 Không còn chỗ trống — chặt bớt cây để có chỗ đặt đất!');
}
function stopPlacing() { placing = false; renderPlacer(); }
function renderPlacer() {
  const cells = placing && state.landPaid ? freeCells() : [];
  $('#placer').innerHTML = cells.map(([c, r]) => {
    const b = cellRect(c, r);
    return `<button class="slot" data-place="${c},${r}" title="Đặt đất ở đây"
      style="left:${b.x}px; top:${b.y}px; width:${b.w}px; height:${b.h}px; rotate:${cellTilt(c, r)}deg">+</button>`;
  }).join('');
  return cells.length;
}
function placePlot(c, r) {
  if (!state.landPaid || !freeCells().some(([x, y]) => x === c && y === r)) return toast('Chỗ này không đặt được đất');
  state.plots.push({ ...emptyPlot(), c, r });
  state.landPaid = false;
  placing = false;
  clearUnderPlots();
  toast('🟫 Đã đặt thêm 1 ô đất!');
  renderAll();
}
// gốc cây nằm dưới ô đất thì mất hẳn; cỏ, hoa, cây non bị ô đất đè thì ẩn đi
function clearUnderPlots() {
  const rects = state.plots.map((p) => cellRect(p.c, p.r));
  document.querySelectorAll('#decor [data-tree]').forEach((el) => {
    const t = state.trees[el.dataset.tree];
    if (t && t.gone) return;
    if (rects.some((b) => hit(b, treeFoot(el)))) state.trees[el.dataset.tree] = { gone: true };
  });
  document.querySelectorAll('#decor :is([data-kind="grass"], [data-kind="sapling"], [data-kind="flower"], [data-kind="mushroom"])').forEach((el) => {
    el.hidden = false;
    el.hidden = rects.some((b) => hit(b, boxOf(el)));
  });
}

// số ngẫu nhiên 0–1 cố định theo n: cỏ mọc lộn xộn nhưng không đổi chỗ mỗi lần vẽ lại
const hashRnd = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// cỏ dại mọc lộn xộn ở khe giữa các mảnh đất kề nhau (khe có khe không, cỡ & chỗ ngẫu nhiên),
// thỉnh thoảng mọc cả ở mép ngoài; xen lẫn cỏ xanh và cỏ khô
function renderWeeds() {
  const key = state.plots.map((p) => p.c + ',' + p.r).join(' ');
  if (key === renderWeeds.prev) return;
  renderWeeds.prev = key;
  const at = (c, r) => state.plots.find((p) => p.c === c && p.r === r);
  const out = [];
  const add = (x, y, w, n) => {
    const art = hashRnd(n + 0.5) < 0.25 ? grassSVG() : weedSVG(Math.floor(hashRnd(n + 0.7) * 6));
    const flip = hashRnd(n + 0.9) < 0.5 ? ' transform:scaleX(-1);' : '';
    out.push(`<span class="weed" style="left:${x - w / 2}px; top:${y - w * 0.9}px; width:${w}px;${flip}">${art}</span>`);
  };
  state.plots.forEach(({ c, r }) => {
    const b = cellRect(c, r), seed = (c + 9) * 131 + (r + 9) * 71;
    const R = (k) => hashRnd(seed + k * 13.7);
    const right = at(c + 1, r) && cellRect(c + 1, r), below = at(c, r + 1) && cellRect(c, r + 1);
    if (right) {
      const gx = (b.x + PLOT_W + right.x) / 2;
      for (let k = 0, n = Math.floor(R(1) * 3); k < n; k++) {
        add(gx + (R(2 + k) - 0.5) * 10, b.y + PLOT_H * (0.2 + R(5 + k) * 0.8), 14 + R(8 + k) * 20, seed + k);
      }
    }
    if (below) {
      const gy = (b.y + PLOT_H + below.y) / 2 + 6;
      for (let k = 0, n = Math.floor(R(11) * 3); k < n; k++) {
        add(b.x + PLOT_W * (0.1 + R(12 + k) * 0.8), gy + (R(15 + k) - 0.5) * 8, 14 + R(18 + k) * 18, seed + 20 + k);
      }
    }
    // chỗ 4 mảnh giáp nhau đôi khi có bụi to
    if (right && below && at(c + 1, r + 1) && R(21) < 0.6) {
      add((b.x + PLOT_W + right.x) / 2, (b.y + PLOT_H + below.y) / 2 + 10, 28 + R(22) * 10, seed + 30);
    }
    // mép ngoài: bên trái hoặc phía dưới chưa có đất bên cạnh
    if (!at(c - 1, r) && R(23) < 0.4) add(b.x - 6, b.y + PLOT_H * (0.4 + R(24) * 0.6), 16 + R(25) * 14, seed + 40);
    if (!below && R(26) < 0.45) add(b.x + PLOT_W * (0.15 + R(27) * 0.7), b.y + PLOT_H + 10, 16 + R(28) * 14, seed + 50);
  });
  $('#weeds').innerHTML = out.join('');
}

function water(i, verbose) {
  const p = state.plots[i];
  if (!useEnergy(COST.water)) return false;
  p.wetUntil = Date.now() + WET_MS;
  p.dryMs = 0;
  if (verbose) toast('💧 Đã tưới nước!');
  renderAll();
  return true;
}

function harvest(i, verbose) {
  const p = state.plots[i];
  const c = CROPS[p.crop];
  if (!useEnergy(COST.harvest)) return false;
  give(state.produce, p.mut ? p.crop + '_db' : p.crop, c.yield);
  addXp(c.xp);
  if (p.mut) toast(`🧬 Thu hoạch ${c.yield} ${c.name} ĐỘT BIẾN — phát sáng kỳ lạ…`, true);
  else if (verbose) toast(`✨ Thu hoạch ${c.yield} ${c.icon} ${c.name}`);
  Object.assign(p, emptyPlot());
  renderAll();
  return true;
}

function plant(i, cropId) {
  if (count(state.seeds, cropId) <= 0) return;
  if (!useEnergy(COST.plant)) return;
  take(state.seeds, cropId, 1);
  Object.assign(state.plots[i], emptyPlot(), { crop: cropId, wetUntil: Date.now() + WET_MS, mut: Math.random() < MUT_RATE });
  toast(`🌱 Đã gieo ${CROPS[cropId].name} và tưới nước`);
  closeModal();
  renderAll();
}

function waterAll() {
  const now = Date.now();
  let n = 0;
  state.plots.forEach((p, i) => {
    if (p.crop && !p.dead && p.growth < CROPS[p.crop].days * DAY_MS && now >= p.wetUntil) {
      if (state.energy >= COST.water) { water(i); n++; }
    }
  });
  toast(n ? `💧 Đã tưới ${n} ô đất` : 'Không có ô nào cần tưới');
}

// ---------- Xương cá & phân bón ----------
// mỗi con cá (không tính tôm) trong món ăn để lại 1 xương
const bonesOf = (ingr) => Object.entries(ingr).reduce((n, [id, k]) =>
  n + (!CATCH[id] ? 0 : CATCH[id].art === 'fish' ? k : CATCH[id].art === 'giantfish' ? 3 * k : 0), 0);
function gainBones(n) {
  if (!n) return;
  give(state.produce, 'xuongca', n);
  toast(`🦴 Còn lại ${n} xương cá — đem về Kho ủ làm phân bón nhé!`);
}
function makeFert() {
  if (!count(state.produce, 'xuongca')) return;
  take(state.produce, 'xuongca', 1);
  state.fert += FERT_USES;
  toast(`🌿 Ủ xong 1 phần phân bón (bón được ${FERT_USES} cây)`);
  renderAll();
}
const canFert = (p) => p.crop && !p.dead && !p.fert && !p.bug && p.growth < CROPS[p.crop].days * DAY_MS;

// ---------- Cây chết khô & đột biến ----------
// cây chết khô chỉ còn dọn đi làm củi khô (đốt lửa trại)
function clearDead(i) {
  const p = state.plots[i];
  if (!p.dead) return;
  const name = CROPS[p.crop].name;
  Object.assign(p, emptyPlot());
  state.wood += 1;
  toast(`🍂 Dọn cây ${name} chết khô — được 1 bó củi khô 🪵`);
  renderAll();
}
// ăn món có nông sản đột biến: thỏ biến đổi kỳ quặc một lúc
const MORPHS = {
  big:   '🧬 Thỏ phình to khổng lồ!',
  small: '🧬 Thỏ teo nhỏ xíu!',
  color: '🧬 Lông thỏ đổi sang màu lạ!',
  ghost: '🧬 Thỏ mờ dần như bóng ma!',
  flip:  '🧬 Thỏ lộn ngược đầu!',
};
const isMutant = (ingr) => Object.keys(ingr).some((id) => MUTANTS[id]);
function mutateBunny() {
  const kind = randOf(Object.keys(MORPHS));
  state.morph = { kind, hue: Math.floor(Math.random() * 360), until: Date.now() + MORPH_MS };
  toast(`${MORPHS[kind]} (${MORPH_MS / 1000} giây)`, true);
  updateMorph();
}
function updateMorph() {
  if (state.morph && Date.now() >= state.morph.until) {
    state.morph = null;
    toast('✨ Thỏ trở lại bình thường rồi.', true);
  }
  const m = state.morph;
  ['#avatar', '#bunny', '#chef'].forEach((s) => {
    const el = $(s);
    Object.keys(MORPHS).forEach((k) => el.classList.toggle('morph-' + k, !!m && m.kind === k));
    if (m) el.style.setProperty('--hue', m.hue + 'deg');
  });
}
function fertilize(i, verbose) {
  const p = state.plots[i];
  if (state.fert <= 0 || !canFert(p)) return false;
  p.fert = true;
  state.fert--;
  if (verbose) toast(`🌿 Đã bón phân cho ${CROPS[p.crop].name} — cây lớn nhanh gấp ${FERT_SPEED}!`);
  renderAll();
  return true;
}
function fertAll() {
  let n = 0;
  state.plots.forEach((p, i) => { if (state.fert > 0 && canFert(p) && fertilize(i)) n++; });
  toast(n ? `🌿 Đã bón phân cho ${n} cây` : 'Không có cây nào đang lớn cần bón');
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
    el.innerHTML = '<span class="plant"></span><span class="bug"></span><span class="badge"></span><div class="pbar"><span></span></div>';
    const idx = g.children.length;
    el.addEventListener('click', () => plotClick(idx));
    g.appendChild(el);
  }
  renderWeeds();
  const now = Date.now();
  state.plots.forEach((p, i) => {
    const el = g.children[i];
    const b = cellRect(p.c, p.r);
    el.style.left = b.x + 'px';
    el.style.top = b.y + 'px';
    el.style.rotate = cellTilt(p.c, p.r) + 'deg';
    const plantEl = el.querySelector('.plant');
    const badge = el.querySelector('.badge');
    const bar = el.querySelector('.pbar');
    const wet = p.crop && now < p.wetUntil;
    el.classList.toggle('wet', !!wet);
    el.classList.toggle('has-bug', !!(p.crop && p.bug));
    el.classList.toggle('fert', !!(p.crop && p.fert && p.growth < CROPS[p.crop].days * DAY_MS));
    const bugEl = el.querySelector('.bug'), pest = p.pest || 'sau';
    if (p.bug && bugEl.dataset.k !== pest) { bugEl.dataset.k = pest; bugEl.innerHTML = catchSVG(pest); sketchStatic(bugEl.firstElementChild); }
    el.classList.toggle('dead', !!(p.crop && p.dead));
    el.classList.toggle('thirsty', !!(p.crop && !p.dead && !wet && (p.dryMs || 0) > DRY_DIE_MS * 0.4));
    if (!p.crop) {
      el.classList.remove('ripe', 'mutant');
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
    const ripe = pct >= 1 && !p.dead;
    el.classList.toggle('ripe', ripe);
    // 4 giai đoạn mọc; chỉ vẽ lại khi đổi giai đoạn để chạy hiệu ứng "bật" lên
    const stage = ripe ? 3 : pct < 0.15 ? 0 : pct < 0.5 ? 1 : 2;
    // đột biến lộ ra khi cây đã lớn
    el.classList.toggle('mutant', !!(p.mut && !p.dead && stage >= 2));
    if (p.dead) {
      if (plantEl.dataset.k !== 'dead') {
        plantEl.dataset.k = 'dead';
        plantEl.className = 'plant';
        plantEl.innerHTML = cropSVG(p.crop, Math.max(1, stage));
        sketchStatic(plantEl.firstElementChild);
      }
      badge.textContent = '🍂';
      bar.style.display = 'none';
      el.title = `${c.name} đã chết khô — bấm để dọn lấy củi khô`;
      return;
    }
    const key = p.crop + stage;
    if (plantEl.dataset.k !== key) {
      plantEl.dataset.k = key;
      plantEl.className = 'plant';
      plantEl.innerHTML = cropSVG(p.crop, stage);
      sketchStatic(plantEl.firstElementChild);
      void plantEl.offsetWidth;
      plantEl.classList.add('grow');
    }
    const thirsty = el.classList.contains('thirsty');
    badge.textContent = p.bug ? '' : ripe ? '✨' : wet ? '' : thirsty ? '🥀' : '💧';
    bar.style.display = ripe ? 'none' : '';
    bar.firstChild.style.width = Math.min(100, pct * 100) + '%';
    const daysLeft = Math.ceil((c.days * DAY_MS - p.growth) / DAY_MS);
    const dryLeft = Math.ceil((DRY_DIE_MS - (p.dryMs || 0)) / 1000);
    el.title = p.bug ? `Có ${CATCH[pest].name.toLowerCase()}! Bấm để bắt (còn ${Math.ceil((PESTS[pest].eat - p.bugMs) / 1000)}s trước khi bị ăn trụi)`
      : ripe ? `${c.name}${p.mut ? ' ĐỘT BIẾN' : ''} đã chín!`
      : `${c.name}${p.mut && stage >= 2 ? ' (đột biến!)' : ''}: còn ${daysLeft} ngày`
        + (wet ? '' : ` (cần tưới — ${dryLeft}s nữa là chết khô)`)
        + (p.fert ? ' · đã bón phân' : state.fert > 0 ? ' · bấm lúc đất ẩm để bón phân' : '');
  });
}

// ---------- Chọn hạt giống ----------
// water = true: đang chọn cho ô sen dưới ao (chỉ thả được ngó sen)
let pickingLotus = false;
function openSeedPicker(i, water = false) {
  selectedPlot = i;
  pickingLotus = water;
  const owned = Object.keys(CROPS).filter((id) => count(state.seeds, id) > 0 && !!CROPS[id].water === water);
  $('#seedModal h3').textContent = water ? 'Chọn ngó sen để thả xuống ao' : 'Chọn hạt giống để gieo';
  $('#seedPick').innerHTML = owned.length
    ? owned.map((id) => {
        const c = CROPS[id];
        return `<div class="card"><div class="title"><span class="ico">${goodIco(id)}</span>${c.name}</div>
          <div class="meta">Có ${state.seeds[id]} hạt · 🕒 ${c.days} ngày · thu ${c.yield}</div>
          <div class="actions"><button class="btn sm" data-plant="${id}">Gieo (⚡${COST.plant})</button></div></div>`;
      }).join('')
    : `<p class="empty-note">${water ? 'Chưa có ngó sen giống! Mua "Hoa sen" ở Cửa hàng (từ cấp 2).'
      : 'Hết hạt giống rồi! Ghé Cửa hàng để mua thêm nhé.'}</p>`;
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
  let bad = 0;
  for (const [id, n] of Object.entries(r.in)) bad += take(state.produce, id, n);
  // lỡ cho nấm độc vào thì món nấu ra cũng độc (không ai biết cho tới khi ăn)
  state.stoves[slot] = { r: rid, end: Date.now() + r.time * 1000, toxic: bad > 0 };
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
  give(state.dishes, s.r, 1, s.toxic ? 1 : 0);
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
    // ghi rõ tên nguyên liệu: có / cần
    return `<span class="${have >= n ? '' : 'miss'}">${GOODS[id].name} <b>${have}/${n}</b></span>`;
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
// mỗi con côn trùng bỏ vào nồi làm tăng 10% khả năng món bị hỏng
function spoilChance() {
  const bugs = Object.entries(pot).reduce((n, [id, k]) => n + (GOODS[id].bug ? k : 0), 0);
  return Math.min(0.9, Math.max(0.05, METHODS[potMethod].spoil - (state.level - 1) * 0.02) + bugs * 0.1);
}
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
  const value = Object.entries(pot).reduce((sum, [id, k]) => sum + GOODS[id].sell * k, 0);
  const dish = rid
    ? { name: RECIPES[rid].name, icon: RECIPES[rid].icon, sell: RECIPES[rid].sell, energy: RECIPES[rid].energy }
    : { name: `${m.name} ${Object.keys(pot).map((id) => GOODS[id].name.toLowerCase()).join(' & ')}`,
        icon: m.icon, sell: Math.round(value * 1.3), energy: n * 9 };
  dish.spoiled = Math.random() < spoilChance();
  dish.bones = bonesOf(pot);
  let bad = 0;
  for (const [id, k] of Object.entries(pot)) bad += take(state.produce, id, k);
  dish.toxic = bad > 0;
  dish.mutant = isMutant(pot);
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
    `<button class="chip in-pot" data-remove="${id}" title="Bấm để bỏ ra">${goodIco(id)} ${GOODS[id].name} ×${k} ✕</button>`).join('');
  const avail = Object.keys(state.produce).map((id) => {
    const left = count(state.produce, id) - count(pot, id);
    return `<button class="chip" data-add="${id}" ${left > 0 && n < POT_MAX ? '' : 'disabled'}>${goodIco(id)} ${GOODS[id].name} (${left})</button>`;
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
    state.energy = Math.max(0, state.energy - 15);
    getSick('stomach', '🤢 Món bị hỏng! Thỏ đau bụng quằn quại.', 'spoiled');
  } else {
    state.energy = Math.min(MAX_ENERGY, state.energy + d.energy);
    toast(`😋 Ngon tuyệt! +⚡${d.energy}`);
  }
  if (d.toxic) eatToxic();
  if (d.mutant) mutateBunny();
  gainBones(d.bones || 0);
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
        const c = GOODS[id];
        return `<div class="card"><div class="title"><span class="ico">${goodIco(id)}</span>${c.name} × ${state.produce[id]}</div>
          <div class="meta">Giá bán 🪙${c.sell}/cái</div>
          <div class="actions"><button class="btn sm" data-sell="${id}">Bán 1</button>
          <button class="btn sm ghost" data-sellall="${id}">Bán hết</button></div></div>`;
      }).join('')
    : '<p class="empty-note">Chưa có nông sản. Ra vườn thu hoạch nhé!</p>';

  const bones = count(state.produce, 'xuongca');
  $('#fertBox').innerHTML = `<div class="card"><div class="title"><span class="ico">${goodIco('xuongca')}</span>Xương cá × ${bones}</div>
      <div class="meta">Ăn món có cá sẽ còn xương. Ủ 1 xương được 1 phần phân bón, bón được ${FERT_USES} cây —
        cây được bón lớn nhanh gấp ${FERT_SPEED}.<br>Phân bón đang có: <b>${state.fert}</b> lần bón</div>
      <div class="actions"><button class="btn sm" data-makefert="1" ${bones ? '' : 'disabled'}>🦴 Ủ 1 phần phân</button></div></div>`;

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
  state.coins += n * GOODS[id].sell;
  toast(`🪙 +${n * GOODS[id].sell}`);
  renderAll();
}
function eatDish(id) {
  const r = RECIPES[id];
  if (state.energy >= MAX_ENERGY) return toast('Thỏ no rồi! 🐰💕');
  const bad = take(state.dishes, id, 1);
  state.energy = Math.min(MAX_ENERGY, state.energy + r.energy);
  toast(`😋 Ngon quá! +⚡${r.energy}`);
  gainBones(bonesOf(r.in));
  if (bad) eatToxic();
  renderAll();
}
function sellDish(id) {
  take(state.dishes, id, 1);
  state.coins += RECIPES[id].sell;
  toast(`🪙 +${RECIPES[id].sell}`);
  renderAll();
}

// ---------- Bảng đơn hàng ----------
// Khách trong rừng đặt nông sản / món đã nấu; giao đủ được trả ~1,5 lần giá bán + thưởng XP
const ORDER_SLOTS = 3;
const ORDER_WAIT_MS = 45000;   // giao xong hoặc đổi đơn thì 45 giây sau có khách mới
const CUSTOMERS = [
  ['🐻', 'Bác Gấu'], ['🐱', 'Cô Mèo'], ['🦊', 'Chú Cáo'], ['🦔', 'Bà Nhím'],
  ['🐸', 'Cậu Ếch'], ['🐿️', 'Chị Sóc'], ['🦉', 'Ông Cú'], ['🐭', 'Bé Chuột'],
];
const randOf = (arr) => arr[Math.floor(Math.random() * arr.length)];
const unlockedCrops = () => Object.keys(CROPS).filter((id) => CROPS[id].level <= state.level);
const unlockedRecipes = () => Object.keys(RECIPES)
  .filter((id) => Object.keys(RECIPES[id].in).every((c) => (GOODS[c].level || 1) <= state.level));
const bagOf = (it) => (it.kind === 'd' ? state.dishes : state.produce);
const canDeliver = (o) => !!(o && o.items) && o.items.every((it) => count(bagOf(it), it.id) >= it.n);

function newOrder() {
  // cấp càng cao đơn càng nhiều dòng; từ cấp 2 khách bắt đầu đặt cả món đã nấu
  const lines = 1 + Math.floor(Math.random() * Math.min(3, state.level));
  const items = [];
  for (let k = 0; k < lines; k++) {
    const dish = state.level >= 2 && Math.random() < 0.35;
    const id = randOf(dish ? unlockedRecipes() : unlockedCrops());
    if (items.some((it) => it.id === id)) continue;
    items.push(dish
      ? { kind: 'd', id, n: 1 + Math.floor(Math.random() * 2) }
      : { kind: 'p', id, n: 2 + Math.floor(Math.random() * (2 + state.level)) });
  }
  const value = items.reduce((s, it) => s + it.n * (it.kind === 'd' ? RECIPES[it.id].sell : CROPS[it.id].sell), 0);
  const [face, who] = randOf(CUSTOMERS);
  return { face, who, items, coins: Math.round(value * 1.5 + 10), xp: Math.round(value / 4) + 5 };
}

// lấp các ô trống / hết giờ chờ bằng khách mới; trả về số khách mới tới
function fillOrders() {
  const now = Date.now();
  while (state.orders.length < ORDER_SLOTS) state.orders.push(null);
  let n = 0;
  state.orders.forEach((o, i) => {
    if (!o || (o.wait && now >= o.wait)) { state.orders[i] = newOrder(); n++; }
  });
  return n;
}

function deliver(i) {
  const o = state.orders[i];
  if (!canDeliver(o)) return toast('Chưa đủ hàng để giao');
  o.items.forEach((it) => take(bagOf(it), it.id, it.n));
  state.coins += o.coins;
  addXp(o.xp);
  state.ordersDone++;
  state.orders[i] = { wait: Date.now() + ORDER_WAIT_MS };
  toast(`📦 Đã giao hàng cho ${o.who}! +🪙${o.coins} +⭐${o.xp}`);
  renderAll();
}
function skipOrder(i) {
  const o = state.orders[i];
  if (!o || o.wait) return;
  state.orders[i] = { wait: Date.now() + ORDER_WAIT_MS };
  toast(`👋 ${o.who} buồn bã ra về…`);
  renderAll();
}

function orderItemHTML(it) {
  const have = count(bagOf(it), it.id);
  const [ico, name] = it.kind === 'd' ? [RECIPES[it.id].icon, RECIPES[it.id].name] : [goodIco(it.id), CROPS[it.id].name];
  return `<span class="${have >= it.n ? '' : 'miss'}">${ico} ${name} ${have}/${it.n}</span>`;
}
function renderOrders() {
  const now = Date.now();
  const html = state.orders.map((o, i) => {
    if (!o || o.wait) return `<div class="card order waiting"><div class="title"><span class="ico">⏳</span>Chưa có khách</div>
      <div class="meta">Khách mới sẽ tới sau ${fmtSec(Math.max(0, (o ? o.wait : now) - now))}</div></div>`;
    const ok = canDeliver(o);
    return `<div class="card order ${ok ? 'ready' : ''}"><div class="title"><span class="ico">${o.face}</span>${o.who} cần:</div>
      <div class="ingr">${o.items.map(orderItemHTML).join('')}</div>
      <div class="meta">Thưởng 🪙${o.coins} · ⭐${o.xp}</div>
      <div class="actions"><button class="btn sm" data-deliver="${i}" ${ok ? '' : 'disabled'}>📦 Giao hàng</button>
        <button class="btn sm ghost" data-skip="${i}">Đổi đơn</button></div></div>`;
  }).join('');
  // chỉ vẽ lại khi có thay đổi, tránh mất cú bấm giữa chừng
  if (html !== renderOrders.prev) { renderOrders.prev = html; $('#orderList').innerHTML = html; }
  $('#ordersDone').textContent = state.ordersDone;
}

// ---------- Cửa hàng ----------
function stoveCost() { return 120 * (state.stoves.length - 1); }

function renderShop() {
  $('#seedShop').innerHTML = Object.entries(CROPS).map(([id, c]) => {
    const locked = state.level < c.level;
    return `<div class="card ${locked ? 'locked' : ''}"><div class="title"><span class="ico">${goodIco(id)}</span>${c.name}</div>
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
    <div class="card"><div class="title"><span class="ico">📜</span>Mua thêm đất</div>
      <div class="meta">Hiện có ${state.plots.length}/${MAX_PLOTS} ô. ${state.landPaid
        ? 'Đã mua đất — bấm "📜 Đặt đất" trên thanh trên cùng để chọn chỗ.'
        : 'Mua xong chọn chỗ trống bất kỳ trên bản đồ để đặt; chỗ vướng cây thì chặt cây trước.'}</div>
      <div class="actions"><button class="btn sm" data-up="plot" ${plotMax || state.landPaid || state.coins < plotCost() ? 'disabled' : ''}>
        ${plotMax ? 'Đã tối đa' : 'Mua 🪙' + plotCost()}</button></div></div>
    <div class="card"><div class="title"><span class="ico">🪓</span>Rìu chặt cây</div>
      <div class="meta">Mỗi cây rìu chặt được 3–5 cây rồi gãy. Đang có: ${axeText()}.<br>Trong gốc cây có thể có rắn!</div>
      <div class="actions"><button class="btn sm" data-up="axe" ${state.axe || state.coins < AXE_PRICE ? 'disabled' : ''}>
        ${state.axe ? 'Đang có rìu' : 'Mua 🪙' + AXE_PRICE}</button></div></div>
    <div class="card"><div class="title"><span class="ico">🎣</span>Cần câu cá</div>
      <div class="meta">Ra cầu câu ở ao, mắc mồi là sâu/côn trùng bắt trên ruộng. Cá to giật mạnh có thể làm gãy cần!
        Đang có: ${state.rod ? 'cần câu' : 'chưa có'}.</div>
      <div class="actions"><button class="btn sm" data-up="rod" ${state.rod || state.coins < ROD_PRICE ? 'disabled' : ''}>
        ${state.rod ? 'Đang có cần' : 'Mua 🪙' + ROD_PRICE}</button></div></div>
    <div class="card"><div class="title"><span class="ico">🔥</span>Thêm bếp nấu</div>
      <div class="meta">Hiện có ${state.stoves.length}/${MAX_STOVES} bếp</div>
      <div class="actions"><button class="btn sm" data-up="stove" ${stoveMax || state.coins < stoveCost() ? 'disabled' : ''}>
        ${stoveMax ? 'Đã tối đa' : 'Mua 🪙' + stoveCost()}</button></div></div>
    <div class="card"><div class="title"><span class="ico">🪵</span>Củi đốt lửa trại</div>
      <div class="meta">Mỗi bó +${WOOD_FUEL} lửa · đang có ${state.wood} bó</div>
      <div class="actions"><button class="btn sm" data-buywood="1" ${state.coins >= WOOD_PRICE ? '' : 'disabled'}>Mua 🪙${WOOD_PRICE}</button>
        <button class="btn sm ghost" data-buywood="5" ${state.coins >= WOOD_PRICE * 5 ? '' : 'disabled'}>Mua 5</button></div></div>
    <div class="card"><div class="title"><span class="ico">🛤️</span>Đá lát đường</div>
      <div class="meta"><b>Chuột phải</b> vào chỗ đất để lát 1 mảng đường, phải nối tiếp từ đường chính ra.
        Cây chắn thì chặt trước, gốc cây sẽ được đào luôn. Đang có: ${state.paving} đá lát.</div>
      <div class="actions"><button class="btn sm" data-buypave="1" ${state.coins >= PAVE_PRICE ? '' : 'disabled'}>Mua 🪙${PAVE_PRICE}</button>
        <button class="btn sm ghost" data-buypave="5" ${state.coins >= PAVE_PRICE * 5 ? '' : 'disabled'}>Mua 5</button>
        <button class="btn sm ghost" data-pavecraft="1" ${count(state.produce, 'dacuoi') >= 3 ? '' : 'disabled'}>
          Đổi 3 đá cuội → 1 đá lát (có ${count(state.produce, 'dacuoi')})</button></div></div>`;
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
  if (kind === 'plot') return buyLand();
  if (kind === 'axe') return buyAxe();
  if (kind === 'rod') return buyRod();
  if (kind === 'stove' && state.stoves.length < MAX_STOVES && state.coins >= stoveCost()) {
    state.coins -= stoveCost();
    state.stoves.push(null);
    toast('🔥 Đã lắp thêm 1 bếp');
  }
  renderAll();
}

// ---------- Ngày & đêm ----------
// Đêm tối om, chỉ sáng quanh lửa, đuốc, cửa sổ bếp & đuốc thỏ cầm; lửa trại càng nhiều củi thì vùng sáng càng rộng.
function dayClock() {
  const t = Date.now() - (state.born || Date.now()) + CYCLE_MS * 0.05;   // ván mới bắt đầu vào buổi sáng
  return { n: Math.floor(t / CYCLE_MS) + 1, f: (t % CYCLE_MS) / CYCLE_MS };
}
// 0 = sáng rõ, 1 = tối hẳn
function darkness(f) {
  if (f < DAWN_END) return 1 - f / DAWN_END;                          // rạng sáng
  if (f < DUSK_AT) return 0;
  if (f < NIGHT_AT) return ((f - DUSK_AT) / (NIGHT_AT - DUSK_AT)) * 0.5; // chạng vạng
  return Math.min(1, 0.5 + ((f - NIGHT_AT) / 0.04) * 0.5);           // sập tối
}
function clockSVG() {
  const at = (a, r) => [Math.cos(a * 2 * Math.PI - Math.PI / 2) * r, Math.sin(a * 2 * Math.PI - Math.PI / 2) * r];
  const wedge = (a0, a1, c) => {
    const [x0, y0] = at(a0, 40), [x1, y1] = at(a1, 40);
    return `<path d="M0 0 L${x0.toFixed(1)} ${y0.toFixed(1)} A40 40 0 ${a1 - a0 > 0.5 ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z"
      fill="${c}" stroke="${K}" stroke-width="2.5"/>`;
  };
  const ticks = Array.from({ length: 16 }, (_, i) => {
    const [x0, y0] = at(i / 16, 34), [x1, y1] = at(i / 16, 40);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)} L${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }).join(' ');
  return `<svg viewBox="-50 -50 100 100" style="filter:url(#sketch)">
    <circle r="47" fill="#3a2e22" stroke="${K}" stroke-width="4"/>
    ${wedge(0, DUSK_AT, '#d9b84a')}${wedge(DUSK_AT, NIGHT_AT, '#b8532e')}${wedge(NIGHT_AT, 1, '#3f4a6e')}
    <path d="${ticks}" stroke="rgba(27,22,17,.5)" stroke-width="1.5"/>
    <g class="hand"><path d="M0 0 L0 -44" stroke="${K}" stroke-width="6" stroke-linecap="round"/>
      <path d="M0 -4 L0 -42" stroke="#efe8da" stroke-width="2.2" stroke-linecap="round"/></g>
    <circle r="17" fill="#efe2c2" stroke="${K}" stroke-width="3"/>
    <text class="day" y="6.5" text-anchor="middle" font-size="18" font-weight="800" font-family="'Grenze Gotisch',serif" fill="${K}">1</text>
  </svg>`;
}
function renderNight() {
  const { n, f } = dayClock();
  $('#clock .hand').setAttribute('transform', `rotate(${(f * 360).toFixed(1)})`);
  $('#clock .day').textContent = n;
  $('#clock').title = `Ngày thứ ${n} · ${f < DUSK_AT ? 'ban ngày' : f < NIGHT_AT ? 'chạng vạng' : 'ban đêm — giữ lửa trại cháy sáng!'}`;
  const dark = darkness(f), night = $('#night');
  night.style.opacity = (dark * 0.86).toFixed(3);
  // trời tối thì thỏ giơ đuốc; báo khi chuyển ngày ↔ đêm
  const b = $('#bunny'), torch = dark > 0;
  b.classList.toggle('torch', torch);
  if (renderNight.torch !== undefined && renderNight.torch !== torch) {
    toast(torch ? '🌒 Trời tối rồi! Thỏ thắp đuốc — nhớ giữ lửa trại cháy kẻo trộm mò tới.'
      : '🌅 Trời sáng rồi! Ban ngày lửa trại được ủ, không cần thêm củi.', true);
  }
  renderNight.torch = torch;
  if (dark <= 0) return;
  const fuel = state.fire.fuel / FIRE_MAX;
  const lights = [
    [470, 378, fuel > 0 ? 110 + 250 * fuel : 0],   // lửa trại
    [415, 308, 80], [543, 308, 80],                 // 2 ngọn đuốc
    [470, 130, 75],                                 // cửa sổ nhà bếp
    [b.offsetLeft, b.offsetTop + 34, 170],         // đuốc thỏ đang cầm
  ].filter(([, , r]) => r > 0);
  renderNight.lights = lights;
  const mask = lights.map(([x, y, r]) =>
    `radial-gradient(circle at ${(x + stageOX).toFixed(0)}px ${(y + stageOY).toFixed(0)}px, transparent ${(r * 0.5).toFixed(0)}px, #000 ${r.toFixed(0)}px)`).join(',');
  night.style.webkitMaskImage = mask;
  night.style.maskImage = mask;
}

// ---------- Sói đêm ----------
// Ban đêm thỉnh thoảng (mỗi đêm tối đa 1 con) có sói từ bìa rừng mò tới nhà kho trộm đồ rồi tha vào rừng.
// Bấm vào sói đủ 3 lần: chưa kịp trộm thì sói sợ bỏ chạy, đã trộm thì làm rơi lại đồ.
const WOLF_DEN = [-150, 200];         // chỗ sói ra/vào rừng (toạ độ bản đồ)
const WOLF_STORE = [178, 304];        // trước cửa nhà kho
const WOLF_HITS = 3, WOLF_LOOT = 3;
const WOLF_SPEED = 80, WOLF_FLEE = 110, WOLF_STEAL_MS = 2500;
const WOLF_STUN_MS = 700;             // bị đánh thì sói khựng lại một chút
const WOLF_RATE = 0.006;              // mỗi nhịp 0,25 giây lúc tối hẳn: trung bình ~40 giây sói xuất hiện
let wolf = null, wolfNight = 0, lastWolfFrame = 0;

const lootText = (loot) => Object.entries(loot).map(([id, n]) => `${n} ${GOODS[id].name.toLowerCase()}`).join(', ');
function spawnWolf() {
  wolf = { x: WOLF_DEN[0], y: WOLF_DEN[1], dir: 1, phase: 'come', hits: 0, loot: {}, bad: {}, t: 0 };
  $('#wolf').hidden = false;
  toast('🐺 Có tiếng sói hú ở bìa rừng… cầm đuốc đi tuần quanh nhà kho thôi!', true);
}
function wolfSteal() {
  const ids = Object.keys(state.produce);
  for (let k = 0; k < WOLF_LOOT && ids.length; k++) {
    const id = randOf(ids);
    // giữ nguyên số đồ độc (nấm độc) để lỡ lấy lại được thì vẫn đúng
    wolf.bad[id] = (wolf.bad[id] || 0) + take(state.produce, id, 1);
    give(wolf.loot, id, 1);
    if (!count(state.produce, id)) ids.splice(ids.indexOf(id), 1);
  }
  const names = lootText(wolf.loot);
  toast(names ? `🐺 Sói đã trộm ${names} trong kho!` : '🐺 Sói lục kho mà chẳng có gì, bỏ đi…', true);
  renderAll();
}
// bấm vào sói: thỏ đuổi bám theo sói (chạy nhanh hơn sói), bắt kịp thì đánh 1 cú
let chasing = false;
const CHASE_SPEED = 380;
function chaseWolf() {
  if (!wolf || wolf.hits >= WOLF_HITS) return;
  clearTimeout(pendingAct);
  pendingAct = null;
  lastHop = null;
  chasing = true;
  $('#bunny').classList.add('run');
}
function stopChase() {
  chasing = false;
  $('#bunny').classList.remove('run');
}
// gọi mỗi khung hình sau khi sói di chuyển
function chaseStep(dt) {
  const b = $('#bunny');
  const bx = b.offsetLeft, by = b.offsetTop + b.offsetHeight;          // chân thỏ
  const tx = wolf.x - wolf.dir * 28, ty = wolf.y;                       // đứng cạnh sói
  const dx = tx - bx, dy = ty - by, d = Math.hypot(dx, dy);
  if (d < 18) {
    stopChase();
    hitWolf();
    return;
  }
  const step = Math.min(d, (CHASE_SPEED * dt) / 1000);
  b.style.transitionDuration = '0s';
  b.classList.toggle('flip', dx < 0);
  b.style.left = bx + (dx / d) * step + 'px';
  b.style.top = by + (dy / d) * step - b.offsetHeight + 'px';
  b.classList.toggle('swim', inWater(b.offsetLeft, b.offsetTop + b.offsetHeight));
}
function hitWolf() {
  if (!wolf || wolf.hits >= WOLF_HITS) return;
  wolf.hits++;
  wolf.stun = WOLF_STUN_MS;
  const el = $('#wolf');
  el.classList.remove('hurt'); void el.offsetWidth; el.classList.add('hurt');
  if (wolf.hits < WOLF_HITS) return toast(`🐰 Đánh nè! (${wolf.hits}/${WOLF_HITS})`, true);
  const names = lootText(wolf.loot);
  for (const [id, n] of Object.entries(wolf.loot)) give(state.produce, id, n, wolf.bad[id] || 0);
  wolf.loot = {};
  wolf.bad = {};
  wolf.phase = 'flee';
  addXp(5);
  toast(names ? `🐺 Ẳng! Sói đau quá làm rơi lại ${names}!` : '🐺 Ẳng! Sói hoảng sợ cụp đuôi bỏ chạy!', true);
  renderAll();
}
// sói (và thỏ lúc đuổi sói) di chuyển mượt ~60 lần mỗi giây
function wolfFrame() {
  const ts = performance.now();
  const dt = lastWolfFrame ? Math.min(100, ts - lastWolfFrame) : 0;
  lastWolfFrame = ts;
  if (wolf && !state.dead) stepWolf(dt);
}
function stepWolf(dt) {
  const el = $('#wolf');
  if (wolf.stun > 0) {
    wolf.stun -= dt;                    // đang choáng: đứng yên, không trộm tiếp
  } else if (wolf.phase === 'steal') {
    wolf.t -= dt;
    if (wolf.t <= 0) { wolfSteal(); wolf.phase = 'flee'; }
  } else {
    const [tx, ty] = wolf.phase === 'come' ? WOLF_STORE : WOLF_DEN;
    const dx = tx - wolf.x, dy = ty - wolf.y, d = Math.hypot(dx, dy);
    const step = ((wolf.phase === 'come' ? WOLF_SPEED : WOLF_FLEE) * dt) / 1000;
    if (d <= step) {
      wolf.x = tx;
      wolf.y = ty;
      if (wolf.phase === 'come') {
        wolf.phase = 'steal';
        wolf.t = WOLF_STEAL_MS;
      } else {
        const names = lootText(wolf.loot);
        if (names) toast(`🐺 Sói đã tha mất ${names} vào rừng…`, true);
        wolf = null;
        el.hidden = true;
        stopChase();
        return;
      }
    } else {
      wolf.x += (dx / d) * step;
      wolf.y += (dy / d) * step;
      if (Math.abs(dx) > 1) wolf.dir = dx < 0 ? -1 : 1;
    }
  }
  el.classList.toggle('walk', wolf.phase !== 'steal');
  el.classList.toggle('left', wolf.dir < 0);
  el.style.left = wolf.x + stageOX + 'px';
  el.style.top = wolf.y + stageOY + 'px';
  if (chasing) chaseStep(dt);
  if (!wolf) return;
  // trong bóng tối chỉ thấy đôi mắt; đứng trong vùng sáng mới thấy rõ cả con
  const dark = darkness(dayClock().f);
  const lit = (renderNight.lights || []).some(([x, y, r]) => Math.hypot(x - wolf.x, y - wolf.y) < r * 0.8);
  el.style.setProperty('--dim', (1 - dark * (lit ? 0.1 : 0.85)).toFixed(2));
  el.style.setProperty('--glow', lit ? 0 : dark.toFixed(2));
}
// gọi mỗi nhịp: lúc tối hẳn thì thỉnh thoảng có sói; trời sáng thì sói bỏ chạy
function wolfTick() {
  const { n, f } = dayClock(), dark = darkness(f);
  if (!wolf && dark >= 0.9 && wolfNight !== n && Math.random() < WOLF_RATE) {
    wolfNight = n;
    spawnWolf();
  }
  if (wolf && dark === 0 && wolf.phase !== 'flee') wolf.phase = 'flee';
}

// ---------- Tải game về máy ----------
// gom index.html + style.css + các file js thành 1 file .html duy nhất (kèm tiến trình đang chơi)
// để mở bằng trình duyệt là chơi được, không cần mạng
const GAME_SCRIPTS = ['data.js', 'scene.js', 'crops.js', 'game.js'];
async function downloadGame() {
  try {
    const get = async (f) => {
      const r = await fetch(f, { cache: 'no-cache' });
      if (!r.ok) throw new Error(f);
      return r.text();
    };
    const [page, css, ...js] = await Promise.all([get('index.html'), get('style.css'), ...GAME_SCRIPTS.map(get)]);
    save();
    const seed = JSON.stringify({ save: localStorage.getItem(SAVE_KEY), deaths: localStorage.getItem(DEATH_KEY) });
    // dùng hàm thay thế để các ký tự $ trong code không bị hiểu nhầm
    let html = page.replace('<link rel="stylesheet" href="style.css">', () => `<style>\n${css}\n</style>`);
    GAME_SCRIPTS.forEach((f, i) => {
      html = html.replace(`<script src="${f}"></script>`, () => (i === 0 ? `<script>window.__SEED = ${seed.replace(/</g, '\\u003c')};</script>\n` : '')
        + `<script>\n${js[i].replace(/<\/script/gi, '<\\/script')}\n</script>`);
    });
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vuon-tho-hong.html';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    toast('⬇️ Đã tải file vuon-tho-hong.html — mở file là chơi được, không cần mạng.', true);
    toast('🖥️ Muốn có biểu tượng app trên máy thì bấm nút "Cài game thành app" ngay phía trên nhé!', true);
  } catch (e) {
    toast('Không tải được — hãy mở game từ trang web minhnhathotel.github.io/game rồi bấm tải lại nhé.', true);
  }
}

// ---------- Túi đồ ở đáy màn hình ----------
const INV_SLOTS = 12;
function renderInv() {
  const ids = Object.keys(state.produce);
  const cells = Array.from({ length: Math.max(INV_SLOTS, ids.length) }, (_, i) => ids[i]);
  const html = cells.map((id) => (id
    ? `<button class="inv-slot" data-inv="1" title="${GOODS[id].name} × ${state.produce[id]}">${goodIco(id)}<b>${state.produce[id]}</b></button>`
    : '<span class="inv-slot empty"></span>')).join('')
    + '<span class="sep"></span>'
    + `<span class="inv-slot equip ${state.axe ? '' : 'off'}" title="Rìu: ${axeText()}"><span>${uiIcon('axe')}</span></span>`
    + `<span class="inv-slot equip ${state.rod ? '' : 'off'}" title="Cần câu: ${state.rod ? 'đang có' : 'chưa có'}"><span>${uiIcon('rod')}</span></span>`;
  if (html !== renderInv.prev) { renderInv.prev = html; $('#inv').innerHTML = html; }
}

// ---------- HUD & vòng lặp ----------
function renderHud() {
  $('#coins').textContent = state.coins;
  $('#level').textContent = state.level;
  $('#energy').textContent = state.energy;
  $('#xpBar').parentElement.style.setProperty('--p', (state.xp / xpNeed(state.level)) * 100);
  $('#energyBar').style.height = (state.energy / MAX_ENERGY) * 100 + '%';
}

function renderAll() {
  renderHud();
  renderTrees();
  refreshForest(treeStateOf);
  renderRoads();
  renderGarden();
  renderPlacer();
  $('#placeLand').hidden = !state.landPaid;
  $('#fertAll').hidden = state.fert <= 0;
  $('#fertN').textContent = state.fert;
  renderStoves();
  renderRecipes();
  renderCustom();
  renderStorage();
  renderShop();
  renderFire();
  updateFireView();
  renderOrders();
  $('#b-orders').classList.toggle('notify', state.orders.some(canDeliver));
  renderMedicine();
  updateIllView();
  renderPond();
  renderLotus();
  renderWild();
  renderForage();
  renderInv();
  updateMorph();
  renderNight();
  save();
}

let stovesWereBusy = '';
function tick() {
  if (state.dead) return;
  simulate(Date.now());
  if (state.dead) return;
  updateIllView();
  renderHud();
  if (renderTrees()) renderPlacer();   // cây mọc lại thì chỗ đặt đất thay đổi
  refreshForest(treeStateOf);
  if (fishing && Date.now() >= fishing.end) reelIn();
  renderNight();
  wolfTick();
  renderWild();
  renderForage();
  renderLotus();
  if (state.morph) updateMorph();
  renderGarden();
  renderStoves();
  // khi một bếp nấu xong thì cập nhật lại danh sách công thức
  const busy = state.stoves.map((s) => (s && Date.now() < s.end ? 1 : 0)).join('');
  if (busy !== stovesWereBusy) { stovesWereBusy = busy; renderRecipes(); renderCustom(); }
  $('#b-kitchen').classList.toggle('notify', state.stoves.some((s) => s && Date.now() >= s.end));
  updateFireView();
  if (fillOrders()) toast('🔔 Có khách mới ghé Bảng đơn hàng!');
  renderOrders();
  $('#b-orders').classList.toggle('notify', state.orders.some(canDeliver));
}

// ---------- Sự kiện ----------
document.querySelectorAll('.building').forEach((b) => b.addEventListener('click', () => {
  whenArrived(walkToBuilding(b), () => openPanel(b.dataset.open));
}));
$('#closePanel').addEventListener('click', closePanel);
$('#panel').addEventListener('click', (e) => { if (e.target.id === 'panel') closePanel(); });
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#bookModal').hidden) closeBook();
  else if (!$('#seedModal').hidden) closeModal(); else if (!$('#panel').hidden) closePanel(); else stopPlacing();
});
// bấm vào cụm nấm dại để hái
$('#wild').addEventListener('click', (e) => {
  const el = e.target.closest('[data-wild]');
  if (!el) return;
  lastHop = null;
  const i = +el.dataset.wild;
  whenArrived(moveBunny(el.offsetLeft + 15, el.offsetTop + 26 - $('#bunny').offsetHeight), () => pickWild(i));
});
// bấm vào ô sen: thỏ lội xuống ao (bơi) tới chỗ đó rồi thả ngó sen / hái sen
$('#lotus').addEventListener('click', (e) => {
  const el = e.target.closest('[data-lotus]');
  if (!el) return;
  lastHop = null;
  const i = +el.dataset.lotus;
  const [x, y] = LOTUS_POS[i];
  whenArrived(moveBunny(x + 30, y - $('#bunny').offsetHeight * 0.86 + 6), () => lotusAction(i));
});
// bấm vào bụi quả, hoa, cỏ, cây non, tảng đá, khúc gỗ: thỏ chạy tới hái
$('#forage').addEventListener('click', (e) => {
  const el = e.target.closest('[data-forage]');
  if (!el) return;
  lastHop = null;
  const id = el.dataset.forage;
  whenArrived(moveBunny(el.offsetLeft + el.offsetWidth / 2, el.offsetTop + el.offsetHeight - $('#bunny').offsetHeight), () => pickForage(id));
});
// bấm vào cây trên bản đồ để chặt
$('#decor').addEventListener('click', (e) => {
  const el = e.target.closest('[data-tree]');
  if (!el) return;
  whenArrived(walkToTree(el), () => chopTree(el));
});
$('#placeLand').addEventListener('click', () => (placing ? stopPlacing() : startPlacing()));
// bấm xuống đất trống thì thỏ chạy tới chỗ đó
$('.world-viewport').addEventListener('click', (e) => {
  if (e.target.closest('.plot, .building, [data-tree], .slot, button')) return;
  const s = $('#stage').getBoundingClientRect();
  // đi được khắp màn hình, kể cả vào rừng mở rộng hai bên
  const rx = (e.clientX - s.left) / worldScale, ry = (e.clientY - s.top) / worldScale;
  lastHop = null;
  // bấm trúng cây rừng mở rộng: thỏ ra gốc cây rồi chặt
  const ft = outerTreeAt(rx, ry);
  if (ft) {
    const id = ft.id;
    return whenArrived(moveBunny(ft.x + ft.w / 2 - stageOX, ft.foot - stageOY - $('#bunny').offsetHeight), () => chopOuter(id));
  }
  const x = Math.min(worldW - stageOX - 30, Math.max(30 - stageOX, rx));
  const y = Math.min(worldH - stageOY - 20, Math.max(60 - stageOY, ry));
  moveBunny(x, y - $('#bunny').offsetHeight + 6);
});
// chuột phải xuống đất: lát 1 mảng đường ở chỗ đó (bấm cả lên gốc cây đã chặt được)
$('.world-viewport').addEventListener('contextmenu', (e) => {
  e.preventDefault();
  if (state.dead || e.target.closest('.plot, .building, .slot, .lotus, .wild, .forage')) return;
  const s = $('#stage').getBoundingClientRect();
  tryPave((e.clientX - s.left) / worldScale, (e.clientY - s.top) / worldScale);
});

document.body.addEventListener('click', (e) => {
  const t = e.target.closest('[data-plant],[data-cook],[data-collect],[data-sell],[data-sellall],[data-eat],[data-selldish],[data-buy],[data-buy5],[data-up],'
    + '[data-add],[data-remove],[data-method],[data-customcook],[data-eatc],[data-sellc],[data-tossc],'
    + '[data-wood],[data-buywood],[data-buypave],[data-pavecraft],[data-burn],[data-deliver],[data-skip],'
    + '[data-madd],[data-mremove],[data-mmethod],[data-mcook],[data-place],[data-cast],[data-bait],[data-makefert]');
  if (!t) return;
  const d = t.dataset;
  if (d.plant) (pickingLotus ? plantLotus : plant)(selectedPlot, d.plant);
  else if (d.makefert) makeFert();
  else if (d.cast) castLine();
  else if (d.bait) { bait = d.bait; renderPond(); }
  else if (d.place) placePlot(...d.place.split(',').map(Number));
  else if (d.wood) addWood();
  else if (d.buywood) buyWood(+d.buywood);
  else if (d.buypave) buyPaving(+d.buypave);
  else if (d.pavecraft) craftPaving();
  else if (d.burn) burnProduce(d.burn);
  else if (d.deliver) deliver(+d.deliver);
  else if (d.skip) skipOrder(+d.skip);
  else if (d.madd) addToMed(d.madd);
  else if (d.mremove) removeFromMed(d.mremove);
  else if (d.mmethod) { medMethod = d.mmethod; renderMedicine(); }
  else if (d.mcook) cookMedicine();
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
$('#fertAll').addEventListener('click', fertAll);
function resetGame() {
  state = newState();
  fillOrders();
  pot = {};
  medPot = {};
  placing = false;
  fishing = null;
  wolf = null;
  $('#wolf').hidden = true;
  renderWeeds.prev = null;
  $('#garden').innerHTML = '';
  $('#deathModal').hidden = true;
  renderTrees();
  clearUnderPlots();
  renderAll();
}
$('#resetBtn').addEventListener('click', () => {
  if (confirm('Xóa toàn bộ tiến trình và chơi lại?')) resetGame();
});
$('#reviveBtn').addEventListener('click', resetGame);
$('#bookBtn').addEventListener('click', openBook);
// cột công cụ: bấm biểu tượng nhà nào thì thỏ chạy tới nhà đó và mở bảng
document.querySelectorAll('.tab[data-go]').forEach((t) => t.addEventListener('click', () => $('#b-' + t.dataset.go).click()));
$('#inv').addEventListener('click', (e) => { if (e.target.closest('[data-inv]')) $('#b-storage').click(); });
$('#deathBook').addEventListener('click', openBook);
$('#closeBook').addEventListener('click', closeBook);
$('#bookModal').addEventListener('click', (e) => { if (e.target.id === 'bookModal') closeBook(); });
$('#bookPrev').addEventListener('click', () => { bookSpread--; renderBook(); });
$('#bookNext').addEventListener('click', () => { bookSpread++; renderBook(); });
$('#illStat').addEventListener('click', () => { walkToBuilding($('#b-kitchen')); openPanel('kitchen'); });
// dựng lại bản đồ mỗi khi khung màn hình đổi kích thước (kể cả lần đầu tải trang)
let resizeTimer;
new ResizeObserver(() => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => { layoutWorld(); if (lastHop !== null) hopTo(lastHop); }, 100);
}).observe($('.world-viewport'));
window.addEventListener('beforeunload', save);

renderScene();
document.querySelectorAll('[data-icon]').forEach((el) => { el.innerHTML = uiIcon(el.dataset.icon); });
$('#clock').innerHTML = clockSVG();
$('#wolf .wolf-body').innerHTML = wolfSVG();
$('#wolf').addEventListener('click', chaseWolf);
// đang chơi bằng file đã tải về rồi thì ẩn nút tải
if (location.protocol === 'file:') {
  $('#dlBtn').hidden = true;
  $('#dlBtn').previousElementSibling.previousElementSibling.hidden = true;   // đường kẻ ngăn cách phía trên
}
$('#dlBtn').addEventListener('click', downloadGame);

// Cài thành app (Chrome/Edge/Cốc Cốc): chơi trong cửa sổ riêng, có biểu tượng trên máy, mất mạng vẫn chơi được.
// Nút cài luôn hiện (trừ khi đang chơi trong app hoặc bằng file .html tải về); trình duyệt không tự bật
// hộp cài thì hiện hướng dẫn cài bằng tay.
const inApp = matchMedia('(display-mode: standalone)').matches;
if (inApp || location.protocol === 'file:') $('#installBtn').hidden = true;
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js');
let installPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installPrompt = e;
});
$('#installBtn').addEventListener('click', async () => {
  if (!installPrompt) { $('#installHelp').hidden = false; return; }
  installPrompt.prompt();
  const { outcome } = await installPrompt.userChoice;
  installPrompt = null;
  if (outcome === 'accepted') toast('🐰 Đã cài game thành app! Tìm biểu tượng Vườn Thỏ Hồng trên màn hình nền nhé.', true);
});
$('#closeInstall').addEventListener('click', () => { $('#installHelp').hidden = true; });
$('#installHelp').addEventListener('click', (e) => { if (e.target.id === 'installHelp') $('#installHelp').hidden = true; });
window.addEventListener('appinstalled', () => {
  $('#installBtn').hidden = true;
  toast('🐰 Đã cài game thành app! Tìm biểu tượng Vườn Thỏ Hồng trên màn hình nền nhé.', true);
});
layoutWorld();
followBunny();
setInterval(wolfFrame, 16);
$('#avatar').innerHTML = bunnySVG(false);
$('#bunny').innerHTML = bunnySVG(false) + `<span class="hand-torch">${torchSVG()}</span>`;
$('#chef').innerHTML = bunnySVG(true);
document.querySelectorAll('#avatar svg, #bunny svg, #chef svg').forEach(sketchStatic);

simulate(Date.now(), true);
fillOrders();
renderTrees();
clearUnderPlots();
renderAll();
if (state.dead) showDeath();
setInterval(tick, 250);
setInterval(save, 5000);
