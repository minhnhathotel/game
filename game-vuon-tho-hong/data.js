// Dữ liệu cây trồng & công thức nấu ăn.
// Thời gian sinh trưởng (từ gieo hạt/trồng đến thu hoạch) lấy theo số liệu phổ biến
// của các hướng dẫn trồng rau tại nhà; trong game: 1 ngày ngoài đời = DAY_SECONDS giây.
const DAY_SECONDS = 1.5;

const CROPS = {
  muong:    { name: 'Rau muống',  icon: '🍃', days: 25,  seed: 5,  sell: 4,  yield: 3, xp: 4,  level: 1, note: 'Ưa nước, thu hoạch sau ~25 ngày, cắt ngọn ăn được nhiều lứa.' },
  hanh:     { name: 'Hành lá',    icon: '🧅', days: 30,  seed: 6,  sell: 5,  yield: 3, xp: 4,  level: 1, note: 'Trồng bằng củ, cắt lá sau ~30 ngày.' },
  cai:      { name: 'Cải xanh',   icon: '🥬', days: 35,  seed: 8,  sell: 6,  yield: 3, xp: 5,  level: 1, note: 'Rau ăn lá ngắn ngày, thu sau 30–40 ngày.' },
  ngaicuu:  { name: 'Ngải cứu',   icon: '🌿', days: 30,  seed: 6,  sell: 5,  yield: 3, xp: 4,  level: 1, note: 'Cây thuốc nam, cắt ngọn sau ~30 ngày. Dùng sắc thuốc giải độc.' },
  tiato:    { name: 'Tía tô',     icon: '🍃', days: 40,  seed: 7,  sell: 5,  yield: 3, xp: 5,  level: 1, note: 'Lá tím thơm, hái sau ~40 ngày. Dùng nấu thuốc giải độc & cháo chữa đau bụng.' },
  duachuot: { name: 'Dưa chuột',  icon: '🥒', days: 55,  seed: 15, sell: 8,  yield: 4, xp: 8,  level: 2, note: 'Cây leo giàn, cho quả sau 50–60 ngày.' },
  carot:    { name: 'Cà rốt',     icon: '🥕', days: 70,  seed: 20, sell: 10, yield: 4, xp: 10, level: 2, note: 'Món khoái khẩu của thỏ! Thu củ sau 65–75 ngày.' },
  catim:    { name: 'Cà tím',     icon: '🍆', days: 70,  seed: 18, sell: 9,  yield: 4, xp: 10, level: 3, note: 'Ưa nắng, cho quả sau ~70 ngày từ khi trồng cây con.' },
  cachua:   { name: 'Cà chua',    icon: '🍅', days: 75,  seed: 22, sell: 9,  yield: 5, xp: 11, level: 3, note: 'Thu quả sau 70–80 ngày, cần cắm cọc đỡ.' },
  ngo:      { name: 'Ngô ngọt',   icon: '🌽', days: 80,  seed: 25, sell: 14, yield: 3, xp: 12, level: 4, note: 'Bẻ bắp sau 75–85 ngày khi râu chuyển nâu.' },
  khoaitay: { name: 'Khoai tây',  icon: '🥔', days: 90,  seed: 30, sell: 12, yield: 4, xp: 14, level: 4, note: 'Trồng bằng củ giống, đào củ sau ~90 ngày.' },
  bido:     { name: 'Bí đỏ',      icon: '🎃', days: 100, seed: 40, sell: 45, yield: 1, xp: 18, level: 5, note: 'Quả to, chín sau 90–110 ngày.' },
};

// Tự chế biến: tỷ lệ món bị hỏng theo cách nấu (giảm 2% mỗi cấp, tối thiểu 5%)
const METHODS = {
  luoc:  { name: 'Luộc',  icon: '🍲', spoil: 0.15 },
  ham:   { name: 'Hầm',   icon: '🥘', spoil: 0.20 },
  xao:   { name: 'Xào',   icon: '🍳', spoil: 0.25 },
  nuong: { name: 'Nướng', icon: '🍢', spoil: 0.30 },
  tron:  { name: 'Trộn',  icon: '🥗', spoil: 0.35 },
};

// Bệnh tật: phải tự nấu đúng thuốc (đúng nguyên liệu + đúng cách làm); nấu sai thì bệnh nặng thêm
const ILLNESSES = {
  poison:  { name: 'Trúng độc', icon: '🐍', cure: 'giaidoc' },   // rắn cắn, côn trùng đốt
  stomach: { name: 'Đau bụng',  icon: '🤢', cure: 'chaotiato' }, // ăn phải món tự chế bị hỏng
  mushroom:{ name: 'Ngộ độc nấm', icon: '🍄', cure: 'raumuong' },  // ăn phải món nấu từ nấm độc
};
const MED_METHODS = {
  sac:  { name: 'Sắc thuốc', icon: '🫖' },
  chao: { name: 'Nấu cháo',  icon: '🥣' },
  gia:  { name: 'Giã nát',   icon: '🪨' },
};
const MEDICINES = {
  giaidoc:   { name: 'Thuốc giải độc ngải cứu', icon: '🧪', in: { ngaicuu: 2, tiato: 1 }, method: 'sac' },
  chaotiato: { name: 'Cháo tía tô hành',        icon: '🥣', in: { tiato: 2, hanh: 1 },   method: 'chao' },
  // mẹo dân gian: nước rau muống giã giải độc nấm
  raumuong:  { name: 'Nước rau muống giã',      icon: '🥤', in: { muong: 3, tiato: 1 },  method: 'gia' },
};

// Công thức: in ={ cropId: số lượng }, time = giây nấu, energy = năng lượng khi thỏ ăn
const RECIPES = {
  muongxao:  { name: 'Rau muống xào tỏi',     icon: '🥗', in: { muong: 3 },                       time: 10, sell: 22,  energy: 15 },
  canhcai:   { name: 'Canh cải xanh nấu hành', icon: '🍲', in: { cai: 2, hanh: 1 },              time: 12, sell: 30,  energy: 18 },
  epcarot:   { name: 'Nước ép cà rốt',         icon: '🧃', in: { carot: 3 },                       time: 8,  sell: 50,  energy: 40 },
  nomdua:    { name: 'Nộm dưa chuột cà rốt',   icon: '🥙', in: { duachuot: 2, carot: 1 },          time: 12, sell: 42,  energy: 22 },
  canhchua:  { name: 'Canh chua rau muống',    icon: '🥘', in: { muong: 2, cachua: 2 },            time: 15, sell: 40,  energy: 25 },
  catimom:   { name: 'Cà tím om cà chua',      icon: '🍛', in: { catim: 2, cachua: 1, hanh: 1 },   time: 18, sell: 48,  energy: 28 },
  salad:     { name: 'Salad dưa chuột cà chua', icon: '🥗', in: { duachuot: 1, cachua: 2, hanh: 1 }, time: 10, sell: 40,  energy: 22 },
  supngo:    { name: 'Súp ngô cà rốt',         icon: '🍜', in: { ngo: 2, carot: 1 },               time: 20, sell: 60,  energy: 32 },
  khoaichien:{ name: 'Khoai tây chiên',        icon: '🍟', in: { khoaitay: 2 },                    time: 15, sell: 40,  energy: 25 },
  canhbi:    { name: 'Canh bí đỏ',             icon: '🍲', in: { bido: 1, hanh: 1 },               time: 20, sell: 75,  energy: 35 },
  supbi:     { name: 'Súp bí đỏ kem',          icon: '🥣', in: { bido: 1, khoaitay: 1, carot: 1 }, time: 25, sell: 100, energy: 45 },
  // món có cá, tôm câu ở ao
  cakho:     { name: 'Cá rô kho hành',         icon: '🐟', in: { carophi: 2, hanh: 1 },            time: 14, sell: 50,  energy: 30 },
  canhtom:   { name: 'Canh cải nấu tôm',       icon: '🦐', in: { tom: 2, cai: 1 },                 time: 12, sell: 45,  energy: 26 },
  chephap:   { name: 'Cá chép hấp tía tô',     icon: '🍱', in: { cachep: 1, tiato: 1, hanh: 1 },   time: 18, sell: 68,  energy: 36 },
  goicuon:   { name: 'Gỏi cuốn tôm',           icon: '🌯', in: { tom: 2, duachuot: 1, carot: 1 },  time: 12, sell: 70,  energy: 32 },
  canhchuaca:{ name: 'Canh chua cá lóc',       icon: '🍲', in: { caloc: 1, cachua: 1, muong: 1 },  time: 20, sell: 92,  energy: 42 },
  // món có nấm dại hái được (nấm có thể có độc — ăn vào mới biết)
  namxao:    { name: 'Nấm xào hành',           icon: '🍄', in: { nam: 2, hanh: 1 },                time: 12, sell: 40,  energy: 26 },
  canhnam:   { name: 'Canh nấm rau cải',       icon: '🍲', in: { nam: 2, cai: 1 },                 time: 14, sell: 44,  energy: 28 },
  chaonam:   { name: 'Cháo cá nấm',            icon: '🥣', in: { nam: 1, carophi: 1, hanh: 1 },    time: 16, sell: 58,  energy: 34 },
  launam:    { name: 'Lẩu nấm',                icon: '🍲', in: { nam: 3, cai: 1, cachua: 1 },      time: 22, sell: 86,  energy: 45 },
};

// Đồ bắt được: côn trùng phá rau (bắt trên ruộng, dùng làm mồi câu) & cá tôm câu ở ao.
// Cất chung trong kho với nông sản: bán, đốt lửa, tự chế biến đều được. snap = tỷ lệ gãy cần khi câu được con này.
const CATCH = {
  sau:      { name: 'Sâu xanh',     art: 'worm',   sell: 1, bug: true },
  chauchau: { name: 'Châu chấu',    art: 'hopper', sell: 2, bug: true },
  bocanh:   { name: 'Bọ cánh cứng', art: 'beetle', sell: 3, bug: true },
  tom:      { name: 'Tôm đồng',  art: 'shrimp', sell: 8,  xp: 4,  snap: 0.03 },
  carophi:  { name: 'Cá rô phi', art: 'fish', color: '#7d8a8c', belly: '#d8d0b8', sell: 12, xp: 5,  snap: 0.05 },
  cachep:   { name: 'Cá chép',   art: 'fish', color: '#c9963a', belly: '#e8d8a0', sell: 18, xp: 7,  snap: 0.09 },
  caloc:    { name: 'Cá lóc',    art: 'fish', color: '#4e5a48', belly: '#a8a890', sell: 26, xp: 10, snap: 0.16 },
  // ăn món có cá thì còn lại xương (mỗi con cá 1 xương); đem ủ làm phân bón
  xuongca:  { name: 'Xương cá',  art: 'bone', sell: 1 },
  // hái ở bãi cỏ, rìa rừng; nấm độc trông y hệt nấm lành
  nam:      { name: 'Nấm dại',   art: 'mushroom', sell: 4 },
};
// Phân bón: ủ 1 xương cá được 1 phần, mỗi phần bón được FERT_USES cây; cây được bón lớn nhanh gấp FERT_SPEED
const FERT_USES = 2;
const FERT_SPEED = 2;
// Nông sản đột biến: thỉnh thoảng cây trồng ra quả lạ phát sáng (bán gấp 3); nấu & ăn vào thì thỏ biến đổi kỳ quặc
const MUTANTS = Object.fromEntries(Object.entries(CROPS).map(([id, c]) =>
  [id + '_db', { name: c.name + ' đột biến', base: id, sell: c.sell * 3, mutant: true }]));
const GOODS = { ...CROPS, ...CATCH, ...MUTANTS };

// Côn trùng bám rau: eat = mili giây để ăn trụi cây, weight = độ hay gặp
const PESTS = {
  sau:      { eat: 25000, weight: 5 },
  chauchau: { eat: 18000, weight: 3 },
  bocanh:   { eat: 32000, weight: 2 },
};
// Mồi câu: bite = khả năng cá cắn câu, fish = tỷ lệ từng loại cá cắn mồi này
const BAITS = {
  sau:      { bite: 0.7,  fish: { tom: 3, carophi: 5, cachep: 2 } },
  chauchau: { bite: 0.75, fish: { carophi: 3, cachep: 4, caloc: 1 } },
  bocanh:   { bite: 0.8,  fish: { carophi: 1, cachep: 3, caloc: 3 } },
};
