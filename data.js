// Dữ liệu cây trồng & công thức nấu ăn.
// Thời gian sinh trưởng (từ gieo hạt/trồng đến thu hoạch) lấy theo số liệu phổ biến
// của các hướng dẫn trồng rau tại nhà; trong game: 1 ngày ngoài đời = DAY_SECONDS giây.
const DAY_SECONDS = 1;

const CROPS = {
  muong:    { name: 'Rau muống',  icon: '🍃', days: 25,  seed: 5,  sell: 4,  yield: 3, xp: 4,  level: 1, note: 'Ưa nước, thu hoạch sau ~25 ngày, cắt ngọn ăn được nhiều lứa.' },
  hanh:     { name: 'Hành lá',    icon: '🧅', days: 30,  seed: 6,  sell: 5,  yield: 3, xp: 4,  level: 1, note: 'Trồng bằng củ, cắt lá sau ~30 ngày.' },
  cai:      { name: 'Cải xanh',   icon: '🥬', days: 35,  seed: 8,  sell: 6,  yield: 3, xp: 5,  level: 1, note: 'Rau ăn lá ngắn ngày, thu sau 30–40 ngày.' },
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
const DOCTOR_FEE = 30; // tiền chữa bệnh = DOCTOR_FEE + 5 × cấp

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
};
