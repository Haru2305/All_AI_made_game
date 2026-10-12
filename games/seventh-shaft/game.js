(() => {
  'use strict';

  const SAVE_KEY = 'seventh-shaft-save-v1';
  const SAVE_VERSION = 1;
  const OFFLINE_BASE_CAP = 2 * 60 * 60;
  const MACHINE_MILESTONES = [10, 25, 50, 100];

  const STRATA = [
    { name: '天蓋杭', subtitle: '地表支持層', hue: 'copper', note: '保守班は退室済み。監督者欄は事故記録ごと削除される。' },
    { name: '鉄骨層', subtitle: '旧躯体の埋設域', hue: 'iron', note: '軌道支持杭を一本外した。崩落は帳簿上、今夜もゼロ件。' },
    { name: '呼吸断層', subtitle: '揮発性ガス帯', hue: 'amber', note: '岩盤が鳴る周期を管制へ送った。返信は請求書だけだった。' },
    { name: '黒塩帯', subtitle: '高圧結晶域', hue: 'salt', note: '防塵マスクの配給が止まった。塩はよく売れる。' },
    { name: '肉厚層', subtitle: '生体反応未確認', hue: 'rust', note: '壁面に脈拍計を当てた者がいる。結果は機密扱いになった。' },
    { name: '核外殻', subtitle: '最終掘削区', hue: 'core', note: 'ここより下の地図は、採掘前に廃棄する規則だ。' },
    { name: '境界外', subtitle: '契約対象外の領域', hue: 'void', note: '座標系が崩れた。会社は掘削量だけを受け取っている。' }
  ];

  const MACHINES = [
    { id: 'jack', name: '打撃ジャッキ', short: 'J-01', glyph: '╱', desc: '旧式の手動打撃機。交換部品はまだ社内にある。', baseCost: 42, growth: 1.17, power: 0.85, unlock: 0, unit: '基' },
    { id: 'crusher', name: '顎式破砕機', short: 'C-04', glyph: '⋈', desc: '岩盤を噛み砕いて搬送路へ押し込む。騒音記録は未提出。', baseCost: 205, growth: 1.18, power: 4.7, unlock: 1, unit: '基' },
    { id: 'rail', name: '軌道式削岩列', short: 'R-12', glyph: '⊞', desc: '軌条ごと地層を引き裂く長尺の採掘編成。', baseCost: 1680, growth: 1.19, power: 21, unlock: 3, unit: '列' },
    { id: 'thermal', name: '熱穿孔ランス', short: 'T-08', glyph: 'ϟ', desc: '岩石を溶かし、冷えて固まる前に回収する。', baseCost: 14600, growth: 1.20, power: 96, unlock: 6, unit: '基' },
    { id: 'crawler', name: '自走式マントル機', short: 'M-22', glyph: '⌁', desc: '無人機。帰還ログは十三日前から途切れている。', baseCost: 152000, growth: 1.21, power: 465, unlock: 9, unit: '台' },
    { id: 'fracture', name: '連鎖破砕アレイ', short: 'F-31', glyph: '⋇', desc: '亀裂を隣の亀裂へ伝える。止める手順は存在しない。', baseCost: 1850000, growth: 1.22, power: 2320, unlock: 12, unit: '基' },
    { id: 'auger', name: '重力反転オーガ', short: 'G-77', glyph: '⦿', desc: '掘削屑が上へ落ちる。異常ではなく仕様とされた。', baseCost: 35500000, growth: 1.23, power: 11800, unlock: 15, unit: '基' },
    { id: 'event', name: '事象境界タップ', short: 'X-00', glyph: '◉', desc: '観測班は全員退職。計器だけを回線に残している。', baseCost: 920000000, growth: 1.24, power: 78000, unlock: 18, unit: '基' }
  ];

  const TECH = [
    { id: 'teeth', branch: '機械', glyph: '╱', name: '焼結タングステン歯', desc: '全採掘機の出力を 15% 増加。', cost: 2, effect: '生産 ×1.15' },
    { id: 'clutch', branch: '機械', glyph: '╱', name: '二重クラッチ', desc: '手動打撃の出力を 35% 増加。', cost: 4, effect: '打撃 ×1.35', prev: 'teeth' },
    { id: 'blackoxide', branch: '機械', glyph: '╱', name: '黒色酸化皮膜', desc: '摩耗を抑え、全出力を 25% 増加。', cost: 7, effect: '生産 ×1.25', prev: 'clutch' },
    { id: 'inverter', branch: '機械', glyph: '╱', name: '逆相インバータ', desc: '駆動列を同期。全出力を 40% 増加。', cost: 11, effect: '生産 ×1.40', prev: 'blackoxide' },
    { id: 'overtime', branch: '機械', glyph: '╱', name: '無期限残業協定', desc: '違約金で買った余力。全出力を 60% 増加。', cost: 16, effect: '生産 ×1.60', prev: 'inverter' },
    { id: 'nightcrew', branch: '物流', glyph: '⇢', name: '名簿外の夜勤班', desc: '閉鎖中の操業記録を最大 4 時間保持。', cost: 2, effect: '放置上限 +4h' },
    { id: 'railgauge', branch: '物流', glyph: '⇢', name: '狭軌標準化', desc: '全設備の調達費を 6% 削減。', cost: 4, effect: '設備費 −6%', prev: 'nightcrew' },
    { id: 'sidedoor', branch: '物流', glyph: '⇢', name: '裏口荷受け', desc: '外部契約の支払額を 25% 増加。', cost: 7, effect: '契約報酬 ×1.25', prev: 'railgauge' },
    { id: 'standingorder', branch: '物流', glyph: '⇢', name: '自動発注枠', desc: '再操業時の初期資金を 180 増やす。', cost: 11, effect: '初期資金 +180', prev: 'sidedoor' },
    { id: 'deepaccounts', branch: '物流', glyph: '⇢', name: '深部勘定', desc: '売却益を 18% 増やす。', cost: 16, effect: '売却益 ×1.18', prev: 'standingorder' },
    { id: 'venturi', branch: '熱管理', glyph: '⌇', name: 'ベンチュリ排気', desc: '毎秒の自然冷却量を 0.55 上げる。', cost: 2, effect: '冷却 +0.55/s' },
    { id: 'ceramic', branch: '熱管理', glyph: '⌇', name: '多孔質セラミック', desc: '採掘出力が熱へ変わる比率を 20% 抑える。', cost: 4, effect: '発熱 −20%', prev: 'venturi' },
    { id: 'faultisolation', branch: '熱管理', glyph: '⌇', name: '系統分離弁', desc: '高熱時の出力低下を半分にする。', cost: 7, effect: '熱効率 改善', prev: 'ceramic' },
    { id: 'patchfile', branch: '熱管理', glyph: '⌇', name: '当直修繕票', desc: '熱圧による設備損耗を半分にする。', cost: 11, effect: '損耗 −50%', prev: 'faultisolation' },
    { id: 'dontask', branch: '熱管理', glyph: '⌇', name: '記録しないでくれ', desc: '危険域で自動排気。過熱による停止を防ぐ。', cost: 16, effect: '自動排気', prev: 'patchfile' },
    { id: 'pulsechain', branch: '管制', glyph: '⌘', name: '反動吸収器', desc: '手動打撃の反動熱を半減する。', cost: 2, effect: '打撃熱 −50%' },
    { id: 'ledger', branch: '管制', glyph: '⌘', name: '欠番台帳', desc: '区画突破時の記録片を 1 枚追加。', cost: 4, effect: '突破データ +1', prev: 'pulsechain' },
    { id: 'cashflow', branch: '管制', glyph: '⌘', name: '出来高連動債', desc: '操業資金への換金率を 20% 上げる。', cost: 7, effect: '換金率 ×1.20', prev: 'ledger' },
    { id: 'redundancy', branch: '管制', glyph: '⌘', name: '二重記録系', desc: '事故記録の獲得報酬を 2 倍にする。', cost: 11, effect: '記録報酬 ×2', prev: 'cashflow' },
    { id: 'erasedname', branch: '管制', glyph: '⌘', name: '消された署名', desc: '全採掘機の出力を 35% 増加。', cost: 16, effect: '生産 ×1.35', prev: 'redundancy' }
  ];

  const LEGACY = [
    { id: 'drive', name: '駆動免許', desc: '全設備の出力 +12% / 段階。', cost: [1, 2, 4, 7, 11], max: 5 },
    { id: 'float', name: '浮動資金枠', desc: '再操業時の資金 +120 / 段階。', cost: [1, 2, 3, 5], max: 4 },
    { id: 'coolant', name: '冷媒優先券', desc: '自然冷却 +0.45 / 秒 / 段階。', cost: [1, 2, 4, 6], max: 4 },
    { id: 'broker', name: '特別仲介資格', desc: '外部契約の報酬 +12% / 段階。', cost: [1, 3, 5, 8], max: 4 },
    { id: 'weld', name: '高圧溶接資格', desc: '設備健全度の最大値を +15 / 段階。', cost: [2, 3, 5], max: 3 },
    { id: 'pulse', name: '過給運転許可', desc: '手動打撃の出力 +20% / 段階。', cost: [1, 2, 4, 7, 10], max: 5 },
    { id: 'salvage', name: '横流し口座', desc: '換金率 +10% / 段階。', cost: [1, 2, 3, 5], max: 4 },
    { id: 'insurance', name: '事故免責特約', desc: '熱による設備損耗 −20% / 段階。', cost: [1, 3, 5], max: 3 },
    { id: 'retainer', name: '記録保全契約', desc: '区画突破データ +1 / 段階。', cost: [2, 4, 7], max: 3 },
    { id: 'terms', name: '永久就業条項', desc: '記録片を消費していない場合、全出力 +8% / 段階。', cost: [3, 5, 8], max: 3 }
  ];

  const CONTRACT_TYPES = [
    { id: 'freight', code: 'FRT-09', title: '鉱滓輸送枠', issuer: '東環状資材公社', copy: '指定量を抽出すること。輸送車両の所在は当局では把握しない。' },
    { id: 'audit', code: 'THM-17', title: '熱圧監査', issuer: '坑道保険互助会', copy: '排気値を規定内に保て。未達でも保険料は返還されない。' },
    { id: 'frontier', code: 'DRL-33', title: '境界掘進権', issuer: '地質権利管理局', copy: '新しい区画を一つ開けること。地質図の保証は契約に含まれない。' }
  ];

  const RECORDS = [
    { id: 'first_shift', title: '初回当直', desc: '打撃機を 1 基以上、保有する。', reward: '生産 +1.5%' },
    { id: 'ore_1000', title: '千単位の出荷', desc: '生涯抽出量 1,000 を超える。', reward: '生産 +1.5%' },
    { id: 'ore_million', title: '帳簿の桁が増えた', desc: '生涯抽出量 100 万を超える。', reward: '生産 +1.5%' },
    { id: 'depth_1', title: '最初の切羽', desc: '第 2 区画へ到達する。', reward: '生産 +1.5%' },
    { id: 'depth_6', title: '六枚目の地図', desc: '第 7 区画へ到達する。', reward: '生産 +1.5%' },
    { id: 'depth_12', title: '境界の外へ', desc: '第 13 区画へ到達する。', reward: '生産 +1.5%' },
    { id: 'depth_24', title: '圧壊域', desc: '第 25 区画へ到達する。', reward: '生産 +1.5%' },
    { id: 'depth_48', title: '契約対象外', desc: '第 49 区画へ到達する。', reward: '生産 +1.5%' },
    { id: 'machine_10', title: '交換部品はない', desc: 'いずれかの設備を 10 基保有する。', reward: '生産 +1.5%' },
    { id: 'machine_100', title: '百台目の無人機', desc: 'いずれかの設備を 100 基保有する。', reward: '生産 +1.5%' },
    { id: 'all_rigs', title: '設備一覧の末尾', desc: '8 種類すべての設備を保有する。', reward: '生産 +1.5%' },
    { id: 'contract_1', title: '署名欄は空白', desc: '外部契約を 1 件完了する。', reward: '生産 +1.5%' },
    { id: 'contract_10', title: '継続取引', desc: '外部契約を 10 件完了する。', reward: '生産 +1.5%' },
    { id: 'contract_50', title: '専属運送人', desc: '外部契約を 50 件完了する。', reward: '生産 +1.5%' },
    { id: 'tech_5', title: '仕様書は読まない', desc: '技術台帳を 5 項目、実装する。', reward: '生産 +1.5%' },
    { id: 'tech_20', title: '頁の裏にも書いた', desc: '技術台帳を 20 項目、すべて実装する。', reward: '生産 +1.5%' },
    { id: 'prestige_1', title: '免許の更新', desc: '操業免許を 1 回、更新する。', reward: '生産 +1.5%' },
    { id: 'prestige_5', title: '再雇用手続き', desc: '操業免許を 5 回、更新する。', reward: '生産 +1.5%' },
    { id: 'heat_80', title: '赤域記録', desc: '熱圧が 80 を超える。', reward: '生産 +1.5%' },
    { id: 'heat_110', title: '警報を黙らせた', desc: '熱圧が 110 を超える。', reward: '生産 +1.5%' },
    { id: 'integrity', title: '始業点検', desc: '健全度を 100 に保って区画を 6 つ進める。', reward: '生産 +1.5%' },
    { id: 'pulse_100', title: '打撃痕', desc: '手動打撃を 100 回使う。', reward: '生産 +1.5%' },
    { id: 'play_hour', title: '交代要員なし', desc: '累計 1 時間、操業する。', reward: '生産 +1.5%' },
    { id: 'ore_billion', title: '市場が先に壊れた', desc: '生涯抽出量 10 億を超える。', reward: '生産 +1.5%' },
    { id: 'prestige_12', title: '免許番号の欠落', desc: '操業免許を 12 回、更新する。', reward: '生産 +1.5%' }
  ];

  const INITIAL = {
    version: SAVE_VERSION, depth: 0, depthProgress: 0, shiftOre: 0, lifetimeOre: 0,
    cash: 128, data: 0, heat: 8, integrity: 100, mandates: 0, prestigeCount: 0,
    machines: { jack: 1, crusher: 0, rail: 0, thermal: 0, crawler: 0, fracture: 0, auger: 0, event: 0 },
    tech: [], legacy: {}, achievements: [], history: [], activeContract: null,
    contractsCompleted: 0, pulseCount: 0, maxDepth: 0, maxHeat: 8, playSeconds: 0,
    buyMode: 1, lastSeen: Date.now(), lastPulse: 0, lastVent: 0
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const finite = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);

  function migrate(raw) {
    const state = { ...INITIAL, ...(raw && typeof raw === 'object' ? raw : {}) };
    state.version = SAVE_VERSION;
    state.machines = { ...INITIAL.machines, ...(raw?.machines || {}) };
    state.legacy = { ...(raw?.legacy || {}) };
    state.tech = Array.isArray(raw?.tech) ? [...new Set(raw.tech.filter((id) => TECH.some((tech) => tech.id === id)))] : [];
    state.achievements = Array.isArray(raw?.achievements) ? [...new Set(raw.achievements.filter((id) => RECORDS.some((record) => record.id === id)))] : [];
    state.history = Array.isArray(raw?.history) ? raw.history.filter((entry) => entry && typeof entry === 'object' && typeof entry.title === 'string' && typeof entry.detail === 'string' && Number.isFinite(Number(entry.at))).slice(-120).map((entry) => ({ type: String(entry.type || 'note').slice(0, 24), title: entry.title.slice(0, 160), detail: entry.detail.slice(0, 400), at: Number(entry.at), depth: Math.max(0, Math.floor(finite(Number(entry.depth), 0))) })) : [];
    for (const key of ['depth', 'depthProgress', 'shiftOre', 'lifetimeOre', 'cash', 'data', 'heat', 'integrity', 'mandates', 'prestigeCount', 'contractsCompleted', 'pulseCount', 'maxDepth', 'maxHeat', 'playSeconds', 'lastSeen', 'lastPulse', 'lastVent']) {
      state[key] = Math.max(0, finite(Number(state[key]), Number(INITIAL[key] || 0)));
    }
    state.depth = Math.floor(state.depth);
    state.prestigeCount = Math.floor(state.prestigeCount);
    state.contractsCompleted = Math.floor(state.contractsCompleted);
    state.pulseCount = Math.floor(state.pulseCount);
    state.buyMode = [1, 10, 25, 'max'].includes(state.buyMode) ? state.buyMode : 1;
    if (!state.activeContract || !['freight', 'audit', 'frontier'].includes(state.activeContract.type) || !Number.isFinite(Number(state.activeContract.goal))) state.activeContract = null;
    else {
      const contract = state.activeContract;
      contract.title = String(contract.title || '契約').slice(0, 80);
      contract.code = String(contract.code || '—').slice(0, 32);
      contract.issuer = String(contract.issuer || '—').slice(0, 80);
      contract.goal = Math.max(1, Number(contract.goal));
      contract.progress = Math.max(0, finite(Number(contract.progress), 0));
      contract.threshold = clamp(finite(Number(contract.threshold), 40), 0, 120);
      contract.startOre = Math.max(0, finite(Number(contract.startOre), 0));
      contract.startDepth = Math.max(0, Math.floor(finite(Number(contract.startDepth), 0)));
      contract.targetDepth = Math.max(0, Math.floor(finite(Number(contract.targetDepth), 0)));
      contract.rewardCash = Math.max(0, finite(Number(contract.rewardCash), 0));
      contract.rewardData = Math.max(0, Math.floor(finite(Number(contract.rewardData), 0)));
    }
    state.integrity = clamp(state.integrity, 0, 100 + (state.legacy.weld || 0) * 15);
    state.heat = clamp(state.heat, 0, 120);
    return state;
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      return raw ? migrate(JSON.parse(raw)) : migrate(null);
    } catch (error) {
      console.warn('Save could not be read:', error);
      return migrate(null);
    }
  }

  let state = load();
  let activeTab = 'rig';
  let lastRenderAt = 0;
  let lastPersistAt = Date.now();
  let lastTickAt = Date.now();
  let pendingModalAction = null;
  let toastTimer = 0;
  let offlineReport = null;

  function strataAt(depth = state.depth) {
    return STRATA[Math.min(Math.floor(depth / 6), STRATA.length - 1)];
  }

  function sectionNumber(depth = state.depth) {
    return String(depth + 1).padStart(2, '0');
  }

  function quotaAt(depth = state.depth) {
    const exponent = Math.min(depth, 620);
    const value = 88 * Math.pow(1.58, exponent) * (1 + Math.floor(depth / 6) * 0.18);
    return Number.isFinite(value) ? value : Number.MAX_VALUE;
  }

  function techOwned(id) { return state.tech.includes(id); }
  function legacyLevel(id) { return Math.max(0, Math.floor(finite(Number(state.legacy[id]), 0))); }
  function legacyCost(upgrade) { return upgrade.cost[legacyLevel(upgrade.id)] ?? null; }
  function ownedCount() { return Object.values(state.machines).reduce((sum, count) => sum + Math.max(0, finite(Number(count))), 0); }

  function short(value, decimals = 2) {
    value = Math.max(0, finite(value));
    if (value < 1000) return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: value < 10 ? 1 : 0 }).format(value);
    const units = [
      [1e20, '垓'], [1e16, '京'], [1e12, '兆'], [1e8, '億'], [1e4, '万'], [1e3, '千']
    ];
    for (const [threshold, suffix] of units) {
      if (value >= threshold) {
        const result = value / threshold;
        if (result >= 1e4) continue;
        return `${new Intl.NumberFormat('ja-JP', { maximumFractionDigits: decimals, notation: 'standard' }).format(result)}${suffix}`;
      }
    }
    const exponent = Math.floor(Math.log10(value));
    return `${(value / Math.pow(10, exponent)).toFixed(1)}e${exponent}`;
  }

  function compact(value) {
    value = Math.max(0, finite(value));
    if (value < 1e6) return short(value, 1);
    const exponent = Math.floor(Math.log10(value));
    const mantissa = value / Math.pow(10, exponent);
    return `${mantissa.toFixed(2)}e${exponent}`;
  }

  function productionMultiplier() {
    let multiplier = 1 + legacyLevel('drive') * 0.12;
    multiplier *= 1 + state.achievements.length * 0.015;
    multiplier *= 1 + Math.floor(state.depth / 6) * 0.12;
    if (state.mandates > 0) multiplier *= 1 + legacyLevel('terms') * 0.08;
    if (techOwned('teeth')) multiplier *= 1.15;
    if (techOwned('blackoxide')) multiplier *= 1.25;
    if (techOwned('inverter')) multiplier *= 1.4;
    if (techOwned('overtime')) multiplier *= 1.6;
    if (techOwned('erasedname')) multiplier *= 1.35;
    return multiplier;
  }

  function machineMilestoneCount(count) { return MACHINE_MILESTONES.filter((threshold) => count >= threshold).length; }

  function machineCost(machine, offset = 0) {
    const owned = Math.max(0, finite(Number(state.machines[machine.id]))) + offset;
    let multiplier = 1 + state.depth * 0.045;
    if (techOwned('railgauge')) multiplier *= 0.94;
    return machine.baseCost * Math.pow(machine.growth, owned) * multiplier;
  }

  function geometricTotal(machine, count) {
    if (count <= 0) return 0;
    const first = machineCost(machine);
    const ratio = machine.growth;
    const power = Math.pow(ratio, count);
    if (!Number.isFinite(power)) return Number.MAX_VALUE;
    return first * (power - 1) / (ratio - 1);
  }

  function maxAffordable(machine) {
    const first = machineCost(machine);
    if (!(first > 0) || first > state.cash) return { count: 0, cost: 0 };
    const ratio = machine.growth;
    let count = Math.max(1, Math.floor(Math.log1p((state.cash / first) * (ratio - 1)) / Math.log(ratio)));
    count = Math.min(count, 1000000);
    let cost = geometricTotal(machine, count);
    while (count > 0 && cost > state.cash) {
      count -= 1;
      cost = geometricTotal(machine, count);
    }
    while (count < 1000000) {
      const nextCost = machineCost(machine, count);
      if (!Number.isFinite(nextCost) || cost + nextCost > state.cash) break;
      cost += nextCost;
      count += 1;
    }
    return { count, cost };
  }

  function salePrice() {
    let value = 0.47 * (1 + state.depth * 0.13);
    if (techOwned('deepaccounts')) value *= 1.18;
    if (techOwned('cashflow')) value *= 1.2;
    value *= 1 + legacyLevel('salvage') * 0.1;
    return value;
  }

  function rawProduction() {
    let total = 0;
    for (const machine of MACHINES) {
      const owned = Math.max(0, finite(Number(state.machines[machine.id])));
      if (!owned) continue;
      total += machine.power * owned * Math.pow(2, machineMilestoneCount(owned));
    }
    return total * productionMultiplier();
  }

  function heatEfficiency() {
    const start = techOwned('faultisolation') ? 75 : 55;
    const slope = techOwned('faultisolation') ? 0.003 : 0.006;
    return Math.max(0.28, 1 - Math.max(0, state.heat - start) * slope);
  }

  function integrityEfficiency() { return 0.55 + 0.0045 * clamp(state.integrity, 0, 100 + legacyLevel('weld') * 15); }

  function coolingRate() {
    return 0.46 + (techOwned('venturi') ? 0.55 : 0) + legacyLevel('coolant') * 0.45;
  }

  function currentRate() { return rawProduction() * heatEfficiency() * integrityEfficiency(); }

  function pulseYield() {
    let value = 1.7 + currentRate() * 0.38;
    if (techOwned('clutch')) value *= 1.35;
    value *= 1 + legacyLevel('pulse') * 0.2;
    return value;
  }

  function contractProgress(contract = state.activeContract) {
    if (!contract) return 0;
    if (contract.type === 'freight') return Math.max(0, state.shiftOre - contract.startOre);
    if (contract.type === 'audit') return Math.max(0, contract.progress || 0);
    if (contract.type === 'frontier') return Math.max(0, state.depth - contract.startDepth);
    return 0;
  }

  function contractComplete(contract = state.activeContract) {
    if (!contract) return false;
    if (contract.type === 'frontier') return state.depth >= contract.targetDepth;
    return contractProgress(contract) >= contract.goal;
  }

  function contractBoard() {
    const offset = state.contractsCompleted % CONTRACT_TYPES.length;
    const ordered = [...CONTRACT_TYPES.slice(offset), ...CONTRACT_TYPES.slice(0, offset)];
    return ordered.map((type, index) => {
      const depth = state.depth;
      const quota = quotaAt(depth);
      const dataBase = 2 + Math.floor(depth / 5);
      const cashBase = Math.max(35, quota * (type.id === 'frontier' ? 0.52 : 0.34));
      const brokerMultiplier = (1 + legacyLevel('broker') * 0.12) * (techOwned('sidedoor') ? 1.25 : 1);
      if (type.id === 'freight') return { ...type, slot: index, goal: Math.max(80, quota * 0.42), cash: cashBase * 1.28 * brokerMultiplier, data: dataBase, unit: '抽出量' };
      if (type.id === 'audit') return { ...type, slot: index, goal: 36 + Math.min(42, depth * 1.4), threshold: Math.max(34, 48 - Math.floor(depth / 4)), cash: cashBase * 1.05 * brokerMultiplier, data: dataBase + 1, unit: '連続秒' };
      return { ...type, slot: index, goal: 1, targetDepth: depth + 1, cash: cashBase * 1.85 * brokerMultiplier, data: dataBase + 2, unit: '区画突破' };
    });
  }

  function historyPush(type, title, detail) {
    state.history.push({ type, title, detail, at: Date.now(), depth: state.depth });
    if (state.history.length > 120) state.history.splice(0, state.history.length - 120);
  }

  function toast(title, message) {
    const stack = $('#toast-stack');
    if (!stack) return;
    const item = document.createElement('div');
    item.className = 'toast';
    item.innerHTML = `<strong>${escapeHtml(title)}</strong>${escapeHtml(message)}`;
    stack.appendChild(item);
    window.setTimeout(() => item.remove(), 4300);
    while (stack.children.length > 4) stack.firstElementChild.remove();
  }

  function checkRecords(silent = false) {
    const totalMachines = ownedCount();
    const nowDepth = state.maxDepth;
    const checks = {
      first_shift: state.machines.jack >= 1,
      ore_1000: state.lifetimeOre >= 1e3,
      ore_million: state.lifetimeOre >= 1e6,
      depth_1: nowDepth >= 1,
      depth_6: nowDepth >= 6,
      depth_12: nowDepth >= 12,
      depth_24: nowDepth >= 24,
      depth_48: nowDepth >= 48,
      machine_10: Object.values(state.machines).some((count) => count >= 10),
      machine_100: Object.values(state.machines).some((count) => count >= 100),
    all_rigs: MACHINES.every((machine) => state.machines[machine.id] > 0),
      contract_1: state.contractsCompleted >= 1,
      contract_10: state.contractsCompleted >= 10,
      contract_50: state.contractsCompleted >= 50,
      tech_5: state.tech.length >= 5,
      tech_20: state.tech.length >= 20,
      prestige_1: state.prestigeCount >= 1,
      prestige_5: state.prestigeCount >= 5,
      heat_80: state.maxHeat >= 80,
      heat_110: state.maxHeat >= 110,
      integrity: state.maxDepth >= 6 && state.integrity >= 99.9,
      pulse_100: state.pulseCount >= 100,
      play_hour: state.playSeconds >= 3600,
      ore_billion: state.lifetimeOre >= 1e9,
      prestige_12: state.prestigeCount >= 12
    };
    const unlocked = [];
    for (const record of RECORDS) {
      if (checks[record.id] && !state.achievements.includes(record.id)) {
        state.achievements.push(record.id);
        unlocked.push(record);
      }
    }
    if (!silent) for (const record of unlocked) toast('記録更新', `${record.title} — ${record.reward}`);
    return unlocked.length > 0;
  }

  function depthBreakthrough(offline = false) {
    const clearedDepth = state.depth;
    const clearedQuota = quotaAt(clearedDepth);
    state.depth += 1;
    state.maxDepth = Math.max(state.maxDepth, state.depth);
    state.cash += Math.max(12, clearedQuota * 0.028);
    const dataGain = 1 + (techOwned('ledger') ? 1 : 0) + Math.floor(legacyLevel('retainer'));
    state.data += dataGain;
    state.heat = Math.max(0, state.heat - 5);
    if (state.activeContract?.type === 'frontier' && state.depth >= state.activeContract.targetDepth) {
      state.activeContract.progress = 1;
    }
    if (state.depth % 6 === 0) {
      const region = strataAt(state.depth);
      historyPush('stratum', `${region.name} の採掘権を取得`, `第 ${sectionNumber(state.depth - 1)} 区を放棄。${region.subtitle}への穿孔を承認。`);
      if (!offline) toast('地層境界を突破', `${region.name}を離脱。新しい切羽で採掘倍率が上がりました。`);
    } else if (!offline && state.depth % 3 === 0) {
      toast('区画を確保', `第 ${sectionNumber(state.depth)} 区への経路が開通。記録片 +${dataGain}。`);
    }
    checkRecords(offline);
  }

  function simulateStep(dt, offline = false) {
    if (dt <= 0) return false;
    const rate = currentRate();
    const mined = rate * dt;
    state.shiftOre += mined;
    state.lifetimeOre += mined;
    state.depthProgress += mined;
    state.cash += mined * salePrice();
    state.playSeconds += offline ? 0 : dt;

    const heatLoad = rate * 0.0105 * (techOwned('ceramic') ? 0.8 : 1);
    state.heat = clamp(state.heat + (heatLoad - coolingRate()) * dt, 0, 120);
    state.maxHeat = Math.max(state.maxHeat, state.heat);
    if (state.heat > 99) {
      let wear = (state.heat - 99) * 0.0035 * dt;
      if (techOwned('patchfile')) wear *= 0.5;
      wear *= Math.max(0.2, 1 - legacyLevel('insurance') * 0.2);
      state.integrity = Math.max(0, state.integrity - wear);
    } else if (state.heat < 40 && state.integrity < 100 + legacyLevel('weld') * 15) {
      state.integrity = Math.min(100 + legacyLevel('weld') * 15, state.integrity + 0.035 * dt);
    }

    if (state.activeContract?.type === 'audit') {
      if (state.heat <= state.activeContract.threshold) state.activeContract.progress = Math.min(state.activeContract.goal, (state.activeContract.progress || 0) + dt);
      else state.activeContract.progress = 0;
    }

    let breached = false;
    let transitions = 0;
    while (state.depthProgress >= quotaAt() && transitions < 500) {
      state.depthProgress -= quotaAt();
      depthBreakthrough(offline);
      transitions += 1;
      breached = true;
    }
    if (techOwned('dontask') && state.heat >= 112) {
      state.heat = 67;
      state.integrity = Math.min(100 + legacyLevel('weld') * 15, state.integrity + 7);
      if (!offline) toast('自動排気', '圧力室を強制開放。冷却弁の記録が破損しました。');
    }
    checkRecords(offline);
    return breached;
  }

  function simulate(seconds, offline = false) {
    let remaining = Math.max(0, finite(seconds));
    let majorChange = false;
    while (remaining > 0) {
      const step = Math.min(1, remaining);
      majorChange = simulateStep(step, offline) || majorChange;
      remaining -= step;
    }
    return majorChange;
  }

  function offlineCap() {
    let cap = OFFLINE_BASE_CAP;
    if (techOwned('nightcrew')) cap += 4 * 60 * 60;
    cap += legacyLevel('coolant') * 30 * 60;
    return Math.min(cap, 12 * 60 * 60);
  }

  function applyOfflineProgress() {
    const awaySeconds = Math.max(0, (Date.now() - state.lastSeen) / 1000);
    const applied = Math.min(awaySeconds, offlineCap());
    if (applied >= 30) {
      const beforeOre = state.lifetimeOre;
      const beforeDepth = state.depth;
      simulate(applied, true);
      offlineReport = { seconds: applied, ore: state.lifetimeOre - beforeOre, depth: state.depth - beforeDepth };
    }
    state.lastSeen = Date.now();
  }

  function saveNow() {
    try {
      state.lastSeen = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      const indicator = $('#save-indicator');
      if (indicator) {
        indicator.classList.add('saving');
        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => indicator.classList.remove('saving'), 500);
      }
      lastPersistAt = Date.now();
      return true;
    } catch (error) {
      console.error('Save failed:', error);
      toast('保存失敗', 'ブラウザの保存領域が使えません。設定からデータを書き出してください。');
      return false;
    }
  }

  function dateClock() {
    const seconds = Math.floor(state.playSeconds);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  function addMachine(machine, requested) {
    if (state.depth < machine.unlock) {
      toast('区画未到達', `第 ${sectionNumber(machine.unlock)} 区まで進むと発注できます。`);
      return;
    }
    const affordable = maxAffordable(machine);
    const amount = requested === 'max' ? affordable.count : Math.min(requested, affordable.count);
    const totalCost = amount === affordable.count ? affordable.cost : geometricTotal(machine, amount);
    if (!amount) {
      toast('資金不足', `次の ${machine.name} には ${short(machineCost(machine))} が必要です。`);
      return;
    }
    state.cash = Math.max(0, state.cash - totalCost);
    state.machines[machine.id] = (state.machines[machine.id] || 0) + amount;
    checkRecords();
    toast('設備受領', `${machine.name} ×${amount}。保守契約は別途。`);
    renderAll();
  }

  function pulse() {
    const now = Date.now();
    const cooldown = 900;
    if (now - state.lastPulse < cooldown) return;
    state.lastPulse = now;
    const output = pulseYield();
    state.shiftOre += output;
    state.lifetimeOre += output;
    state.depthProgress += output;
    state.cash += output * salePrice();
    state.heat = clamp(state.heat + (techOwned('pulsechain') ? 1.05 : 2.1), 0, 120);
    state.maxHeat = Math.max(state.maxHeat, state.heat);
    state.pulseCount += 1;
    const shaft = $('.shaft-panel');
    if (shaft) {
      shaft.classList.remove('pulse-hit');
      void shaft.offsetWidth;
      shaft.classList.add('pulse-hit');
      window.setTimeout(() => shaft.classList.remove('pulse-hit'), 360);
    }
    const reached = simulateStep(0, false);
    let clear = false;
    let transitions = 0;
    while (state.depthProgress >= quotaAt() && transitions < 500) {
      state.depthProgress -= quotaAt();
      depthBreakthrough(false);
      transitions += 1;
      clear = true;
    }
    checkRecords();
    if (!clear && state.pulseCount % 10 === 0) toast('手動打撃', `抽出 +${short(output)}。反動熱 ${techOwned('pulsechain') ? '+1' : '+2'}。`);
    updateLiveBindings();
    if (clear || Date.now() - lastRenderAt > 3000) renderAll();
  }

  function vent() {
    const now = Date.now();
    const cooldown = techOwned('venturi') ? 38000 : 52000;
    if (state.heat < 24) { toast('排気不要', '圧力室は規定温度内です。'); return; }
    if (now - state.lastVent < cooldown) { toast('弁が冷却中', '開放弁の再使用まで待機してください。'); return; }
    state.lastVent = now;
    state.heat = Math.max(6, state.heat - 42);
    state.integrity = Math.min(100 + legacyLevel('weld') * 15, state.integrity + 4);
    toast('強制排気', '熱圧を逃がしました。防塵区画は 40 秒封鎖。');
    saveNow();
    renderAll();
  }

  function buyTech(id) {
    const item = TECH.find((tech) => tech.id === id);
    if (!item || techOwned(id)) return;
    if (item.prev && !techOwned(item.prev)) { toast('前提技術なし', 'ひとつ前の台帳項目を先に実装してください。'); return; }
    if (state.data < item.cost) { toast('記録片が不足', `実装には記録片 ${item.cost} 枚が必要です。`); return; }
    state.data -= item.cost;
    state.tech.push(id);
    checkRecords();
    toast('技術実装', `${item.name} — ${item.effect}`);
    renderAll();
  }

  function acceptContract(slot) {
    if (state.activeContract) { toast('契約中', '現在の契約を完了してから次を受諾してください。'); return; }
    const offer = contractBoard()[Number(slot)];
    if (!offer) return;
    state.activeContract = {
      type: offer.id, title: offer.title, code: offer.code, issuer: offer.issuer,
      goal: offer.goal, threshold: offer.threshold, progress: 0,
      startOre: state.shiftOre, startDepth: state.depth, targetDepth: offer.targetDepth,
      rewardCash: offer.cash, rewardData: offer.data, acceptedAt: Date.now()
    };
    historyPush('contract', `${offer.title}を受諾`, `${offer.issuer} / ${offer.code}`);
    toast('契約受諾', `${offer.issuer}との取引を記録しました。違約金は記載されていません。`);
    renderAll();
  }

  function claimContract() {
    const contract = state.activeContract;
    if (!contract || !contractComplete(contract)) return;
    state.cash += contract.rewardCash;
    state.data += contract.rewardData;
    state.contractsCompleted += 1;
    historyPush('contract', `${contract.title}を履行`, `操業資金 +${short(contract.rewardCash)} / 記録片 +${contract.rewardData}`);
    state.activeContract = null;
    checkRecords();
    toast('契約履行', `操業資金 +${short(contract.rewardCash)}、記録片 +${contract.rewardData}。`);
    renderAll();
  }

  function buyLegacy(id) {
    const upgrade = LEGACY.find((item) => item.id === id);
    if (!upgrade) return;
    const cost = legacyCost(upgrade);
    if (cost === null || state.mandates < cost) return;
    state.mandates -= cost;
    state.legacy[id] = legacyLevel(id) + 1;
    toast('免許特記を追記', `${upgrade.name} — 段階 ${state.legacy[id]}`);
    renderAll();
  }

  function prestigeGain() { return Math.max(0, Math.floor(state.depth / 8)); }

  function performPrestige() {
    const gain = prestigeGain();
    if (state.depth < 8 || gain < 1) { closeModal(); return; }
    state.mandates += gain;
    state.prestigeCount += 1;
    const nextShift = state.prestigeCount + 1;
    state.depth = 0;
    state.depthProgress = 0;
    state.shiftOre = 0;
    state.cash = 128 + legacyLevel('float') * 120 + (techOwned('standingorder') ? 180 : 0);
    state.heat = 8;
    state.integrity = 100 + legacyLevel('weld') * 15;
    state.activeContract = null;
    state.machines = { ...INITIAL.machines };
    state.maxDepth = Math.max(state.maxDepth, 0);
    historyPush('prestige', `操業免許を ${nextShift} 号へ更新`, `特記印 +${gain}。設備を接収、技術台帳と事故記録は継続。`);
    checkRecords();
    closeModal();
    toast('免許更新完了', `操業免許 ${nextShift} 号。特記印 +${gain}。設備は再調達してください。`);
    saveNow();
    renderAll();
  }

  function openModal(title, content, confirmLabel = null, action = null) {
    pendingModalAction = action;
    const root = $('#modal-root');
    root.innerHTML = `<div class="modal-backdrop" data-action="dismiss-modal"><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="eyebrow">当直管制 // 確認</div><h2 id="modal-title">${escapeHtml(title)}</h2><div class="modal-copy">${content}</div><div class="modal-actions"><button class="action-button quiet" data-action="close-modal">戻る</button>${confirmLabel ? `<button class="action-button ${action === 'reset-save' ? 'danger' : ''}" data-action="confirm-modal">${escapeHtml(confirmLabel)}</button>` : ''}</div></section></div>`;
    $('[data-action="close-modal"]', root)?.focus();
  }

  function closeModal() {
    pendingModalAction = null;
    $('#modal-root').innerHTML = '';
  }

  function exportSave() {
    saveNow();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `dainanako-save-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    toast('操業記録を出力', 'JSON 形式で保存しました。');
  }

  function importSave() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const imported = migrate(JSON.parse(await file.text()));
        openModal('記録を読み込む', '<p>現在の操業記録を選択したファイルで置き換えます。現在の記録を先に書き出しましたか。</p>', '置き換える', 'import-confirm');
        pendingImport = imported;
      } catch (error) {
        toast('読込失敗', '有効な第七坑の JSON 記録ではありません。');
      }
    });
    input.click();
  }

  let pendingImport = null;

  function setTab(tab) {
    if (!['rig', 'research', 'contracts', 'mandate', 'records', 'settings'].includes(tab)) return;
    activeTab = tab;
    $('#sidebar').classList.remove('open');
    renderAll();
    if (tab === 'settings') $('#main-content').focus({ preventScroll: true });
    else $('#main-content').scrollTo({ top: 0, behavior: 'smooth' });
  }

  function heading(eyebrow, title, description, side = '') {
    return `<div class="page-heading"><div><div class="eyebrow">${eyebrow}</div><h1>${title}</h1><p>${description}</p></div>${side ? `<div class="heading-actions">${side}</div>` : ''}</div>`;
  }

  function machineCard(machine) {
    const owned = state.machines[machine.id] || 0;
    const unlocked = state.depth >= machine.unlock;
    const milestones = MACHINE_MILESTONES.map((value, index) => `<i class="${owned >= value ? 'done' : ''}" title="${value} 基で出力 2 倍"></i>`).join('');
    const unitRate = machine.power * Math.pow(2, machineMilestoneCount(owned)) * productionMultiplier();
    const price = machineCost(machine);
    const mode = state.buyMode;
    const affordable = maxAffordable(machine);
    const buyCount = Math.min(mode === 'max' ? affordable.count : mode, affordable.count);
    const purchaseCost = buyCount === affordable.count ? affordable.cost : geometricTotal(machine, buyCount);
    const lockedText = `第 ${sectionNumber(machine.unlock)} 区で解禁`;
    return `<article class="machine-card ${unlocked ? '' : 'locked'}">
      <div class="machine-symbol" aria-hidden="true">${machine.glyph}</div>
      <div class="machine-info"><div class="machine-name">${machine.name} <span class="micro-label">${machine.short}</span></div><div class="machine-caption">${unlocked ? machine.desc : lockedText}</div><div class="machine-meta"><span>保有 <b>${short(owned)} ${machine.unit}</b></span><span>基礎 <b>${short(unitRate)}/秒</b></span></div><div class="milestone-strip" aria-label="設備出力倍率の節目">${milestones}</div></div>
      <div class="machine-buy"><button class="buy-button" data-action="buy-machine" data-id="${machine.id}" ${!unlocked || !buyCount ? 'disabled' : ''}>${unlocked ? `${state.buyMode === 'max' ? `最大 ×${buyCount}` : `発注 ×${buyCount || mode}`}` : '未解禁'}</button><span class="machine-cost">${unlocked ? `¥ ${short(buyCount ? purchaseCost : price)}` : `深度 ${machine.unlock}`}</span></div>
    </article>`;
  }

  function renderRig() {
    const depth = state.depth;
    const quota = quotaAt(depth);
    const progress = clamp(state.depthProgress / quota * 100, 0, 100);
    const heatLabel = state.heat >= 105 ? '危険域' : state.heat >= 70 ? '警戒域' : '安定域';
    const heatColor = state.heat >= 100 ? 'danger' : '';
    const nextPulse = Math.max(0, 900 - (Date.now() - state.lastPulse));
    const ventReady = Date.now() - state.lastVent >= (techOwned('venturi') ? 38000 : 52000);
    return `${heading(`現場 // 第 ${sectionNumber()} 区`, '坑内管制', '操業資金は抽出量に応じて入金される。納期だけは変わらない。', `<span class="tag green"><i class="mini-dot"></i>回線稼働中</span>`)}
      <div class="dashboard-grid">
        <section class="panel shaft-panel">
          <div class="shaft-copy"><div><h2>切羽映像 // ${strataAt().subtitle}</h2><p>監視カメラ 04　/　映像遅延 2.8 秒</p></div><div class="depth-readout"><small>掘進深度</small><span>${short(state.depth * 120 + state.depthProgress / Math.max(1, quota) * 120)} m</span></div></div>
          <div class="shaft-art" aria-hidden="true"><div class="shaft-grid"></div><div class="strata s1"></div><div class="strata s2"></div><div class="strata s3"></div><div class="strata s4"></div><div class="rotor-wrap"><svg class="rotor" viewBox="0 0 180 180" fill="none"><circle cx="90" cy="90" r="77" stroke="#675847" stroke-width="1" stroke-dasharray="3 7"/><circle cx="90" cy="90" r="67" stroke="#a16c40" stroke-width="1.5"/><circle cx="90" cy="90" r="53" stroke="#49433b" stroke-width="6" stroke-dasharray="23 9"/><circle cx="90" cy="90" r="38" stroke="#c3844e" stroke-width="1"/><path d="M90 14 102 69 90 90 78 69 90 14ZM166 90 111 102 90 90 111 78 166 90ZM90 166 78 111 90 90 102 111 90 166ZM14 90 69 78 90 90 69 102 14 90Z" fill="#282522" stroke="#8a5c38" stroke-width="1"/><circle cx="90" cy="90" r="27" stroke="#d99a5e" stroke-width="1.5" stroke-dasharray="2 3"/></svg><div class="rotor-needle"></div><div class="rotor-core"></div></div></div>
          <div class="shaft-foot"><span><i class="pulse-mark">◆</i><b>${escapeHtml(strataAt().name)}</b> / ${escapeHtml(strataAt().subtitle)}</span><span>稼働設備 <b>${short(ownedCount())}</b></span></div>
        </section>
        <section class="panel quota-panel"><div class="panel-header"><div class="panel-title"><span class="panel-index">A—01</span> 区画掘進</div><span class="panel-header-note">目標量</span></div><div class="quota-body"><span class="micro-label">第 ${sectionNumber()} 区 // 掘進ノルマ</span><div class="quota-main"><span data-bind="depth-progress">${short(state.depthProgress)}</span><span style="font-size:12px;color:var(--muted)"> / ${short(quota)}</span></div><div class="quota-sub">抽出量は消費されず、累計計上されます。</div><div class="progress-track"><div class="progress-fill" data-width="quota" style="width:${progress}%"></div></div><div class="quota-meta"><span data-bind="quota-percent">${progress.toFixed(1)}%</span><span>${short(quota)} 単位</span></div><button class="pulse-button ${nextPulse ? 'on-cooldown' : ''}" data-action="pulse" ${nextPulse ? 'disabled' : ''}><span><span class="pulse-title">手動打撃 // IMPACT</span><small>${nextPulse ? `${(nextPulse / 1000).toFixed(1)} 秒後に再装填` : 'SPACE キーでも打撃可能'}</small></span><strong>+${short(pulseYield())} ◆</strong></button><div class="vent-row"><div class="vent-info"><b>強制排気弁</b><small>熱圧 −42 / 健全度 +4</small></div><button class="button-small" data-action="vent" ${!ventReady || state.heat < 24 ? 'disabled' : ''}>${ventReady ? '排気' : '弁冷却中'}</button></div></div></section>
      </div>
      <div class="lower-grid"><section class="panel metric-panel"><div class="metric-top"><span>熱圧 // THERMAL LOAD</span><span data-bind="heat-label">${heatLabel}</span></div><div class="metric-value"><span data-bind="heat">${state.heat.toFixed(1)}</span><small> / 120</small></div><div class="heat-gauge"><span data-width="heat" class="${heatColor}" style="width:${state.heat / 120 * 100}%"></span></div></section><section class="panel metric-panel"><div class="metric-top"><span>設備健全度 // INTEGRITY</span><span data-bind="cooling">自然冷却 ${coolingRate().toFixed(2)}/s</span></div><div class="metric-value"><span data-bind="integrity">${state.integrity.toFixed(1)}</span><small> / ${100 + legacyLevel('weld') * 15}</small></div><div class="heat-gauge integrity-gauge"><span data-width="integrity" style="width:${state.integrity / (100 + legacyLevel('weld') * 15) * 100}%"></span></div></section></div>
      <div class="section-row"><div><h2>設備発注</h2><p>保有数 10 / 25 / 50 / 100 で各設備の出力が倍増する。</p></div><div class="buy-mode" aria-label="発注数">${[1, 10, 25, 'max'].map((mode) => `<button data-action="buy-mode" data-mode="${mode}" class="${state.buyMode === mode ? 'active' : ''}">${mode === 'max' ? '最大' : `×${mode}`}</button>`).join('')}</div></div>
      <div class="machine-list">${MACHINES.map(machineCard).join('')}</div>
      <div class="section-row"><div><h2>運行指標</h2><p>地層ごとの資材市況が換金率に反映される。</p></div><button class="plain-link" data-tab="records">事故記録を見る ↗</button></div>`;
  }

  function renderResearch() {
    const branches = ['機械', '物流', '熱管理', '管制'];
    const grouped = branches.map((branch) => {
      const items = TECH.filter((item) => item.branch === branch);
      const count = items.filter((item) => techOwned(item.id)).length;
      return `<div class="section-row" style="margin-top:19px"><div><h2>${branch}</h2><p>${branch === '機械' ? '駆動・切削・交換周期' : branch === '物流' ? '搬送・契約・再操業' : branch === '熱管理' ? '排熱・損耗・保全' : '手順・換金・記録'}</p></div><span class="tag">${count} / ${items.length} 実装</span></div><div class="tech-grid">${items.map((item) => {
        const owned = techOwned(item.id);
        const locked = item.prev && !techOwned(item.prev);
        const can = !owned && !locked && state.data >= item.cost;
        return `<article class="tech-card ${owned ? 'owned' : can ? 'available' : ''}"><div class="tech-branch"><span class="branch-mark">${item.glyph}</span>${item.branch} // ${String(items.indexOf(item) + 1).padStart(2, '0')}</div><h3>${item.name}</h3><p>${item.desc}</p><div class="tech-bottom"><span class="tech-cost">▥ ${owned ? '実装済' : `${item.cost} 枚`}</span><button class="tech-button" data-action="buy-tech" data-id="${item.id}" ${owned || locked || state.data < item.cost ? 'disabled' : ''}>${owned ? '実装済' : locked ? '前提待ち' : '実装する'}</button></div></article>`;
      }).join('')}</div>`;
    }).join('');
    return `${heading(`技術部 // 記録片 ${short(state.data)} 枚`, '技術台帳', '採掘区画と契約で回収した記録片を、操業手順へ転用する。免許更新後も残る。', `<span class="tag blue">▥ ${short(state.data)} 記録片</span>`)}<div class="callout">各系統は前の項目から順に実装。20 件すべてを揃えると、全設備の長期効率が変わる。</div>${grouped}`;
  }

  function renderContracts() {
    const active = state.activeContract;
    const offers = contractBoard();
    const activeHeader = active ? `<div class="contract-active-banner"><div><b>受諾中：${escapeHtml(active.title)}</b><div style="margin-top:5px;color:var(--muted);font-size:9px">${escapeHtml(active.issuer)} / ${escapeHtml(active.code)}</div></div><span>${contractComplete(active) ? '履行可能 // 報酬を受け取れます' : '契約履行中'}</span></div>` : '<div class="callout">同時に保持できる契約は一件。長納期の境界掘進と、短い熱圧監査を比較して選ぶ。</div>';
    const offerCards = offers.map((offer) => {
      const isActive = active?.code === offer.code && active?.title === offer.title;
      const isComplete = isActive && contractComplete(active);
      const progress = isActive ? contractProgress(active) : 0;
      const objective = offer.id === 'freight' ? `契約受諾後に ${short(offer.goal)} 単位を抽出する。` : offer.id === 'audit' ? `熱圧 ${offer.threshold} 以下を ${short(offer.goal)} 秒維持する。超過時は計測をやり直す。` : `第 ${sectionNumber(offer.targetDepth - 1)} 区を突破し、第 ${sectionNumber(offer.targetDepth)} 区へ進む。`;
      const progressText = offer.id === 'frontier' ? `${isComplete ? 1 : 0} / 1 区画` : `${short(progress)} / ${short(offer.goal)} ${offer.unit}`;
      const action = isActive ? (isComplete ? `<button class="action-button good" data-action="claim-contract">報酬を受領</button>` : `<button class="action-button quiet" disabled>進行中</button>`) : `<button class="action-button" data-action="accept-contract" data-slot="${offer.slot}" ${active ? 'disabled' : ''}>${active ? '他契約を履行中' : 'この条件で受諾'}</button>`;
      const width = isComplete ? 100 : Math.min(100, offer.id === 'frontier' ? 0 : progress / offer.goal * 100);
      return `<article class="contract-card ${isActive ? (isComplete ? 'complete' : 'active') : ''}"><div class="contract-top"><div><div class="contract-code">${offer.code} // ${offer.issuer}</div><h3>${offer.title}</h3></div><div class="contract-reward"><span>¥ ${short(offer.cash)}</span><small>▥ ${offer.data} 記録片</small></div></div><p>${offer.copy}<br>${objective}</p>${isActive ? `<div class="progress-track"><div class="progress-fill" style="width:${width}%"></div></div><div class="contract-progress-meta"><span>${isComplete ? '条件達成' : '履行状況'}</span><span>${progressText}</span></div>` : ''}<div class="contract-actions">${action}</div></article>`;
    }).join('');
    return `${heading(`取引窓口 // 契約完了 ${state.contractsCompleted} 件`, '外部契約', '会社の外にある予算を引き出す。免許更新をまたいでも取引履歴は消えない。', `<span class="tag">同時受諾 01 件</span>`)}${activeHeader}<div class="contract-grid">${offerCards}</div><div class="section-row"><div><h2>契約履歴</h2><p>最後に完了した取引。</p></div></div>${state.history.filter((entry) => entry.type === 'contract').length ? `<div class="records-list">${state.history.filter((entry) => entry.type === 'contract').slice(-6).reverse().map((entry) => `<article class="record-row unlocked"><div class="record-icon">▤</div><div class="record-copy"><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.detail)}</p></div><div class="record-reward">履行記録<br>${new Date(entry.at).toLocaleDateString('ja-JP')}</div></article>`).join('')}</div>` : '<div class="empty-note">まだ契約履歴はありません。受諾前に条件と報酬を照合してください。</div>'}`;
  }

  function renderMandate() {
    const gain = prestigeGain();
    const eligible = state.depth >= 8;
    const cards = LEGACY.map((upgrade) => {
      const level = legacyLevel(upgrade.id);
      const cost = legacyCost(upgrade);
      const maxed = cost === null;
      return `<article class="mandate-card"><h3>${upgrade.name} <span class="micro-label">${level} / ${upgrade.max}</span></h3><p>${upgrade.desc}</p><div class="mandate-bottom"><small>${maxed ? '最大段階' : `⊙ ${cost} 特記印`}</small><button class="action-button ${maxed ? 'quiet' : ''}" data-action="buy-legacy" data-id="${upgrade.id}" ${maxed || state.mandates < cost ? 'disabled' : ''}>${maxed ? '完了' : '追記する'}</button></div></article>`;
    }).join('');
    return `${heading(`人事・権利 // 更新 ${state.prestigeCount} 回`, '操業免許', '区画を深く進めて免許を更新する。設備は接収されるが、研究・免許特記・事故記録は残る。', `<span class="tag orange">⊙ ${short(state.mandates)} 特記印</span>`)}<section class="mandate-panel"><div class="mandate-top"><div><div class="eyebrow">CHARTER RENEWAL // 第 ${state.prestigeCount + 1} 号</div><div class="mandate-number">⊙ ${gain}<span style="font-size:11px;color:#9c8066"> 特記印</span></div><p class="mandate-description">第 8 区から更新可能。深度 8 区画ごとに特記印を 1 枚獲得。採掘機・現区画の進捗・現金を失い、技術台帳と事故記録は保持。</p></div><span class="tag ${eligible ? 'green' : ''}">${eligible ? '更新可能' : `第 08 区まで ${Math.max(0, 8 - state.depth)} 区`}</span></div><div class="mandate-eligibility"><span class="micro-label">現在の区画 // ${sectionNumber()}</span><span class="micro-label">最大到達 // ${sectionNumber(state.maxDepth)}</span><span class="micro-label">更新履歴 // ${state.prestigeCount} 回</span></div><div style="margin-top:14px"><button class="action-button ${eligible ? '' : 'quiet'}" data-action="begin-prestige" ${eligible ? '' : 'disabled'}>免許を更新し、設備を接収する</button></div></section><div class="section-row"><div><h2>免許特記</h2><p>特記印を使い、次の操業条件を恒久的に書き換える。</p></div><span class="tag orange">残数 ${state.mandates}</span></div><div class="mandate-shop">${cards}</div><div class="section-row"><div><h2>更新時の保持内容</h2><p>記録台帳と営業履歴は操業免許を越えて保存される。</p></div></div><div class="lower-grid"><article class="panel metric-panel"><div class="metric-top">引き継ぐもの</div><div style="margin-top:12px;color:#9cb9a1;font-size:10px;line-height:1.8">技術台帳 / 免許特記 / 記録片 / 事故記録 / 契約履歴 / 総抽出量</div></article><article class="panel metric-panel"><div class="metric-top">接収されるもの</div><div style="margin-top:12px;color:#c58a7e;font-size:10px;line-height:1.8">全設備 / 現金 / 現区画 / 掘進進捗 / 稼働中の契約</div></article></div>`;
  }

  function recordUnlocked(id) { return state.achievements.includes(id); }

  function renderRecords() {
    const cards = RECORDS.map((record, index) => `<article class="record-row ${recordUnlocked(record.id) ? 'unlocked' : ''}"><div class="record-icon">${recordUnlocked(record.id) ? '✳' : String(index + 1).padStart(2, '0')}</div><div class="record-copy"><h3>${record.title}</h3><p>${record.desc}</p></div><div class="record-reward">${recordUnlocked(record.id) ? '獲得済' : '未確認'}<br>${record.reward}</div></article>`).join('');
    const logs = [...state.history].reverse().map((entry) => `<article class="archive-entry"><div class="archive-time">${new Date(entry.at).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })} // ${entry.type.toUpperCase()}</div><h3>${escapeHtml(entry.title)}</h3><p>${escapeHtml(entry.detail)}</p></article>`).join('');
    return `${heading(`記録保全課 // ${state.achievements.length} / ${RECORDS.length} 件`, '事故記録', '報告された件数ではなく、会社が保存した記録の一覧。各記録は全設備の出力を 1.5% 押し上げる。', `<span class="tag">生涯抽出 ${short(state.lifetimeOre)}</span>`)}<div class="lower-grid" style="margin:0 0 15px"><section class="panel metric-panel"><div class="metric-top"><span>総記録</span><span>${RECORDS.length} 件</span></div><div class="metric-value">${state.achievements.length}<small> / ${RECORDS.length}</small></div></section><section class="panel metric-panel"><div class="metric-top"><span>記録による生産倍率</span><span>累計</span></div><div class="metric-value">×${(1 + state.achievements.length * 0.015).toFixed(3)}</div></section></div><div class="records-list">${cards}</div><div class="section-row"><div><h2>坑内アーカイブ</h2><p>地層境界、契約、免許更新の時刻印。</p></div><span class="micro-label">${state.history.length} / 120</span></div>${logs ? `<div class="records-list">${logs}</div>` : '<div class="empty-note">記録はまだ作成されていません。</div>'}`;
  }

  function renderSettings() {
    return `${heading('端末保全 // LOCAL STORAGE', '保全・保存', '記録はこのブラウザ内へ自動保存される。端末変更の前に書き出すこと。', `<span class="tag green"><i class="mini-dot"></i>自動保存</span>`)}<div class="callout">最終保存 <span data-bind="saved-at">${new Date(state.lastSeen).toLocaleString('ja-JP')}</span>　/　閉鎖中は最大 ${Math.floor(offlineCap() / 3600)} 時間分を記録に反映。</div><div class="settings-grid"><section class="panel setting-row"><div><b>操業記録を書き出す</b><p>別のブラウザへ移すための JSON ファイルを保存する。</p></div><button class="action-button" data-action="export-save">書き出し</button></section><section class="panel setting-row"><div><b>操業記録を読み込む</b><p>保存済み JSON で現在の記録を置き換える。先に現在の記録を書き出す。</p></div><button class="action-button quiet" data-action="import-save">読み込み</button></section><section class="panel setting-row"><div><b>今すぐ保存</b><p>ブラウザの保存領域に現時点の状態を書き込む。</p></div><button class="action-button quiet" data-action="save-now">保存</button></section><section class="panel setting-row danger-zone"><div><b>新規操業を開始</b><p>記録を削除して第 01 区から始める。実行前に JSON を書き出すこと。</p></div><button class="action-button danger" data-action="confirm-reset-save">記録を消去</button></section></div><div class="section-row"><div><h2>操業仕様</h2><p>第七坑 // 深層採掘局</p></div></div><div class="panel" style="padding:14px;color:#939693;font-size:9px;line-height:1.9">設備は採掘量に応じた資金で発注。抽出量が区画ノルマへ積算される。熱圧が高いと出力と健全度が低下する。区画を 8 つ進めるごとに免許を更新できる。更新すると採掘設備を接収される。</div>`;
  }

  function renderRail() {
    const region = strataAt();
    const active = state.activeContract;
    const quote = `<div class="rail-block"><div class="rail-kicker"><span>地質連絡票</span><span>${sectionNumber()} // ${region.hue.toUpperCase()}</span></div><p class="rail-quote">“${escapeHtml(region.note)}”<cite>— 第 ${sectionNumber()} 区 / 採掘班から</cite></p></div>`;
    const contract = active ? `<div class="rail-block"><div class="rail-kicker"><span>稼働契約</span><span class="tag ${contractComplete(active) ? 'green' : 'orange'}"><i class="mini-dot"></i>${contractComplete(active) ? 'READY' : 'ACTIVE'}</span></div><div class="rail-contract"><b>${escapeHtml(active.title)}</b><p>${escapeHtml(active.issuer)} / ${escapeHtml(active.code)}</p><div class="progress-track"><div class="progress-fill" style="width:${active.type === 'frontier' ? (contractComplete(active) ? 100 : 0) : Math.min(100, contractProgress(active) / active.goal * 100)}%"></div></div><div class="tiny-chart-caption"><span>${contractComplete(active) ? '履行可能' : '進行中'}</span><span>${short(contractProgress(active))} / ${short(active.goal)}</span></div></div></div>` : `<div class="rail-block"><div class="rail-kicker"><span>契約回線</span><span>OPEN</span></div><p class="rail-quote">外部契約は一件だけ有効化できます。運賃表はいつでも変わる。</p><button class="plain-link" style="margin-top:10px;padding:0" data-tab="contracts">契約一覧を開く　↗</button></div>`;
    const last = [...state.history].reverse().find((item) => item.type === 'stratum' || item.type === 'prestige');
    const lastHtml = last ? `<div class="rail-block"><div class="rail-kicker"><span>直近の記録</span><span>${new Date(last.at).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span></div><p class="rail-quote"><em>${escapeHtml(last.title)}</em><br>${escapeHtml(last.detail)}</p></div>` : '';
    return `<div class="rail-heading"><b>SHIFT MONITOR</b><span>NO. ${String(state.prestigeCount + 1).padStart(2, '0')}</span></div><div class="rail-block"><div class="rail-kicker"><span>採掘速度</span><span>毎秒</span></div><div style="font:500 20px var(--mono);color:#e5a06a" data-bind="rate">${short(currentRate())}<span style="font:9px var(--mono);color:var(--muted)"> ◆/s</span></div><svg class="rail-chart" viewBox="0 0 240 47" preserveAspectRatio="none" aria-label="採掘速度の履歴"><defs><linearGradient id="chartFade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#ee7d35" stop-opacity=".24"/><stop offset="1" stop-color="#ee7d35" stop-opacity="0"/></linearGradient></defs><path class="chart-gridline" d="M0 12.5H240M0 24.5H240M0 36.5H240"/><path class="chart-area" d="${chartPath(true)}"/><path class="chart-line" d="${chartPath(false)}"/></svg><div class="tiny-chart-caption"><span>過去 90 秒</span><span data-bind="heat-rail">熱圧 ${state.heat.toFixed(0)}</span></div></div><div class="rail-stat-grid"><div class="rail-stat"><small>現在区画</small><b data-bind="depth-rail">${sectionNumber()}</b></div><div class="rail-stat"><small>免許更新</small><b>${state.prestigeCount} 回</b></div><div class="rail-stat"><small>累計設備</small><b>${short(ownedCount())}</b></div><div class="rail-stat"><small>記録片</small><b>${short(state.data)}</b></div></div>${quote}${contract}${lastHtml}<div class="rail-footer-note">第七坑 / DEEP EXTRACTION DIVISION<br>勤務記録は給与査定に使用されます。</div>`;
  }

  const rateSamples = Array(24).fill(0);
  function chartPath(area) {
    const values = rateSamples;
    const max = Math.max(1, ...values);
    const pts = values.map((value, index) => [index * (240 / (values.length - 1)), 40 - (value / max) * 33]);
    const line = `M ${pts.map((pt) => `${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(' L ')}`;
    return area ? `${line} L 240 47 L 0 47 Z` : line;
  }

  function renderAll() {
    const screen = $('#screen');
    if (!screen) return;
    lastRenderAt = Date.now();
    screen.innerHTML = activeTab === 'rig' ? renderRig() : activeTab === 'research' ? renderResearch() : activeTab === 'contracts' ? renderContracts() : activeTab === 'mandate' ? renderMandate() : activeTab === 'records' ? renderRecords() : renderSettings();
    $('#right-rail').innerHTML = renderRail();
    updateShell();
    updateNav();
  }

  function updateNav() {
    $$('[data-tab]').forEach((button) => {
      const selected = button.dataset.tab === activeTab;
      button.classList.toggle('active', selected);
      if (button.tagName === 'BUTTON') button.setAttribute('aria-current', selected ? 'page' : 'false');
    });
  }

  function updateShell() {
    const ore = $('#resource-ore');
    const cash = $('#resource-cash');
    const data = $('#resource-data');
    if (ore) ore.textContent = short(state.lifetimeOre);
    if (cash) cash.textContent = short(state.cash);
    if (data) data.textContent = short(state.data);
    const depth = $('#header-depth');
    if (depth) depth.textContent = `${strataAt().name}・第 ${sectionNumber()} 区`;
    const shift = $('#shift-no');
    if (shift) shift.textContent = String(state.prestigeCount + 1).padStart(2, '0');
    const clock = $('#shift-clock');
    if (clock) clock.textContent = dateClock();
    const status = $('#shift-state');
    if (status) status.textContent = state.heat >= 105 ? '熱圧警報' : state.integrity < 35 ? '設備損耗' : '通常操業';
    const note = $('#shift-note');
    if (note) note.textContent = state.heat >= 105 ? '警報音量は査定に影響する。' : '班員は全員、記録上は在籍。';
  }

  function updateLiveBindings() {
    updateShell();
    const quota = quotaAt();
    const quotaProgress = clamp(state.depthProgress / quota * 100, 0, 100);
    const updates = {
      'depth-progress': short(state.depthProgress), 'quota-percent': `${quotaProgress.toFixed(1)}%`,
      'heat': state.heat.toFixed(1), 'heat-label': state.heat >= 105 ? '危険域' : state.heat >= 70 ? '警戒域' : '安定域',
      'cooling': `自然冷却 ${coolingRate().toFixed(2)}/s`, 'integrity': state.integrity.toFixed(1),
      'rate': `${short(currentRate())}<span style="font:9px var(--mono);color:var(--muted)"> ◆/s</span>`,
      'heat-rail': `熱圧 ${state.heat.toFixed(0)}`, 'depth-rail': sectionNumber()
    };
    for (const [key, value] of Object.entries(updates)) {
      const target = $(`[data-bind="${key}"]`);
      if (target) {
        if (key === 'rate') target.innerHTML = value;
        else target.textContent = value;
      }
    }
    const quotaBar = $('[data-width="quota"]');
    if (quotaBar) quotaBar.style.width = `${quotaProgress}%`;
    const heatBar = $('[data-width="heat"]');
    if (heatBar) { heatBar.style.width = `${state.heat / 120 * 100}%`; heatBar.classList.toggle('danger', state.heat >= 100); }
    const integrityBar = $('[data-width="integrity"]');
    if (integrityBar) integrityBar.style.width = `${state.integrity / (100 + legacyLevel('weld') * 15) * 100}%`;
    const pulseButton = $('.pulse-button');
    if (pulseButton) {
      const cooldown = Math.max(0, 900 - (Date.now() - state.lastPulse));
      pulseButton.disabled = cooldown > 0;
      pulseButton.classList.toggle('on-cooldown', cooldown > 0);
      const small = $('small', pulseButton);
      if (small) small.textContent = cooldown ? `${(cooldown / 1000).toFixed(1)} 秒後に再装填` : 'SPACE キーでも打撃可能';
      const strong = $('strong', pulseButton);
      if (strong) strong.textContent = `+${short(pulseYield())} ◆`;
    }
    if (activeTab === 'contracts') {
      if (state.activeContract && contractComplete() && !$('.contract-card.complete')) {
        renderAll();
      } else if (state.activeContract) {
        const progress = contractProgress();
        const bar = $('.contract-card.active .progress-fill, .contract-card.complete .progress-fill');
        if (bar) bar.style.width = `${contractComplete() ? 100 : Math.min(100, progress / state.activeContract.goal * 100)}%`;
        const meta = $('.contract-card.active .contract-progress-meta span:last-child, .contract-card.complete .contract-progress-meta span:last-child');
        if (meta) meta.textContent = state.activeContract.type === 'frontier' ? `${contractComplete() ? 1 : 0} / 1 区画` : `${short(progress)} / ${short(state.activeContract.goal)} ${state.activeContract.type === 'audit' ? '連続秒' : '抽出量'}`;
      }
    }
  }

  function handleAction(action, button) {
    switch (action) {
      case 'pulse': pulse(); break;
      case 'vent': vent(); break;
      case 'buy-machine': {
        const machine = MACHINES.find((item) => item.id === button.dataset.id);
        if (machine) addMachine(machine, state.buyMode);
        break;
      }
      case 'buy-mode':
        state.buyMode = button.dataset.mode === 'max' ? 'max' : Number(button.dataset.mode);
        renderAll();
        break;
      case 'buy-tech': buyTech(button.dataset.id); break;
      case 'accept-contract': acceptContract(button.dataset.slot); break;
      case 'claim-contract': claimContract(); break;
      case 'buy-legacy': buyLegacy(button.dataset.id); break;
      case 'begin-prestige': {
        const gain = prestigeGain();
        openModal('操業免許を更新する', `<p>第 ${state.depth} 区までの掘進を記録し、特記印 ${gain} 枚を獲得します。</p><div class="report-list"><div><span>接収</span><b>設備 / 現金 / 現区画 / 稼働契約</b></div><div><span>保持</span><b>記録片 / 技術 / 特記 / 実績</b></div><div><span>次回操業資金</span><b>¥ ${short(128 + legacyLevel('float') * 120 + (techOwned('standingorder') ? 180 : 0))}</b></div></div><p style="margin-top:14px">更新は取り消せません。実行後、設備を再発注してください。</p>`, '免許を更新', 'prestige');
        break;
      }
      case 'open-settings': setTab('settings'); break;
      case 'export-save': exportSave(); break;
      case 'import-save': importSave(); break;
      case 'import-confirm':
        if (pendingImport) {
          state = pendingImport;
          pendingImport = null;
          state.lastSeen = Date.now();
          saveNow();
          closeModal();
          renderAll();
          toast('記録を読み込み', '操業状態を復元しました。');
        }
        break;
      case 'save-now': saveNow(); toast('保存完了', '現在の状態を記録しました。'); break;
      case 'confirm-reset-save':
        openModal('操業記録を消去する', '<p>このブラウザにある免許・技術・契約・全記録を削除します。復元できません。必要な場合は先に JSON を書き出してください。</p>', '全記録を消去', 'reset-save');
        break;
      case 'reset-save':
        localStorage.removeItem(SAVE_KEY);
        state = migrate(null);
        closeModal();
        renderAll();
        toast('新規操業', '第 01 区の当直を開始しました。');
        break;
      case 'prestige': performPrestige(); break;
      case 'close-modal': closeModal(); break;
      case 'confirm-modal': {
        const target = pendingModalAction;
        if (target) handleAction(target, button);
        else closeModal();
        break;
      }
      case 'dismiss-modal': if (button.classList.contains('modal-backdrop')) closeModal(); break;
      default: break;
    }
  }

  document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-tab], [data-tab-link]');
    if (tab) {
      event.preventDefault();
      setTab(tab.dataset.tab || tab.dataset.tabLink);
      return;
    }
    const button = event.target.closest('[data-action]');
    if (button && button.dataset.action !== 'dismiss-modal') {
      if (button.disabled) return;
      event.preventDefault();
      handleAction(button.dataset.action, button);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !event.repeat && !$('#modal-root .modal')) {
      const active = document.activeElement;
      if (!active?.matches?.('button, a, input, textarea, select, [contenteditable="true"]')) {
        event.preventDefault();
        pulse();
      }
    }
    if (event.key === 'Escape' && $('#modal-root .modal')) closeModal();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      simulate(Math.min(60, (Date.now() - lastTickAt) / 1000), false);
      saveNow();
    } else {
      const away = Math.max(0, (Date.now() - state.lastSeen) / 1000);
      const capped = Math.min(away, offlineCap());
      if (capped > 10) {
        const before = state.lifetimeOre;
        const beforeDepth = state.depth;
        simulate(capped, true);
        offlineReport = { seconds: capped, ore: state.lifetimeOre - before, depth: state.depth - beforeDepth };
      }
      lastTickAt = Date.now();
      state.lastSeen = Date.now();
      if (offlineReport) showOfflineReport();
      renderAll();
    }
  });

  function showOfflineReport() {
    if (!offlineReport) return;
    const report = offlineReport;
    offlineReport = null;
    const hours = Math.floor(report.seconds / 3600);
    const minutes = Math.floor((report.seconds % 3600) / 60);
    openModal('閉鎖中の操業記録', `<p>班員が ${hours} 時間 ${minutes} 分、記録上の操業を継続しました。</p><div class="report-list"><div><span>抽出量</span><b>+${short(report.ore)} ◆</b></div><div><span>区画突破</span><b>+${report.depth} 区</b></div><div><span>現在深度</span><b>第 ${sectionNumber()} 区</b></div><div><span>適用上限</span><b>${Math.floor(offlineCap() / 3600)} 時間</b></div></div>`, '記録を確認', null);
  }

  function tick() {
    const now = Date.now();
    const elapsed = Math.max(0, (now - lastTickAt) / 1000);
    lastTickAt = now;
    if (!document.hidden && elapsed > 0) {
      const capped = Math.min(elapsed, 5);
      const major = simulate(capped, false);
      rateSamples.push(currentRate());
      rateSamples.shift();
      if (major) renderAll();
      else if (activeTab === 'contracts' && state.activeContract && contractComplete() && !$('.contract-card.complete')) renderAll();
      else updateLiveBindings();
    }
    if (now - lastPersistAt > 10000) saveNow();
  }

  function start() {
    applyOfflineProgress();
    if (!state.history.length && state.lifetimeOre === 0) historyPush('system', '第七坑 / 夜勤記録開始', '第 01 区。送風機は回っている。保全担当は未配置。');
    checkRecords(true);
    renderAll();
    window.setInterval(tick, 250);
    saveNow();
    if (offlineReport) window.setTimeout(showOfflineReport, 280);
    window.addEventListener('beforeunload', saveNow);
  }

  start();
})();
