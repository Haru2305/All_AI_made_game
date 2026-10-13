(() => {
  "use strict";

  const SAVE_KEY = "ashline-atlas-v1";
  const RADIUS = 8;
  const SIZE = 28;
  const CENTER = { x: 650, y: 386 };
  const HEX_DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  const RESOURCE_META = {
    scrap: { label: "鉄屑", short: "SCRAP", icon: "▰", color: "acid" },
    power: { label: "電力", short: "POWER", icon: "ϟ", color: "amber" },
    data: { label: "測量", short: "DATA", icon: "⌁", color: "blue" },
    marks: { label: "刻印", short: "MARKS", icon: "◆", color: "rust" }
  };

  const ZONES = {
    salt: { name: "白塵平原", en: "THE PALE REACH", color: "#625d45", desc: "風が削った塩の殻。乾いた機械だけが残る。" },
    rust: { name: "旧環状工業帯", en: "THE RUST BELT", color: "#654438", desc: "炉と搬送路が地表を縫う。いまも熱を持つ鉄屑が眠る。" },
    glass: { name: "硝子樹海", en: "GLASSWOOD", color: "#3e6256", desc: "灰嵐が砂を焼いた森。薄い電荷が枝の間に走る。" },
    drowned: { name: "沈降区", en: "THE SUNKEN WORKS", color: "#3d5962", desc: "水没した工区と、まだ応答する低周波信号。" },
    black: { name: "黒潮縁", en: "BLACK TIDELINE", color: "#4b4d59", desc: "陸の輪郭が崩れる外縁。地図の精度が急に落ちる。" }
  };
  const LANDMARKS = {
    "-5,1": { name: "百三号塩橋", kind: "構造物", story: "橋脚の一本ごとに、切り取られた作業員名が刻まれている。崩落した橋桁の奥で、塩がまだ赤く光る。", resource: "scrap", reward: 74, mark: true },
    "-3,-4": { name: "無灯の鋳造所", kind: "旧施設", story: "停止した炉の内部に、誰かが交代勤務表を貼ったままにしている。最後の欄だけ、名前の代わりに黒い指紋がある。", resource: "scrap", reward: 98, mark: false },
    "-1,4": { name: "降灰観測塔", kind: "観測点", story: "塔の記録は灰嵐の到達時刻を一分刻みで残している。最後のページには『風向きは内側から来た』とある。", resource: "data", reward: 68, mark: true },
    "2,-4": { name: "第九受電殻", kind: "電力遺構", story: "地中の受電殻が、地図にない発電所から周期的に電流を受けている。接続元は海の向こうを指す。", resource: "power", reward: 82, mark: true },
    "3,2": { name: "空洞樹の墓標", kind: "信号遺構", story: "硝子樹の幹に、別々の時代の航路図が幾重にも焼き付いている。どの地図にも同じ空白がある。", resource: "data", reward: 96, mark: true },
    "5,-1": { name: "ミレニアム搬送路", kind: "搬送路", story: "無人の貨物列車が停止したまま、車輪だけを回している。貨物標識はすべて同じ町の名前だ。", resource: "scrap", reward: 120, mark: true },
    "5,3": { name: "水没第八工区", kind: "浸水施設", story: "水面下の誘導灯が今も点滅する。区画番号の先に、設計図には存在しない階段が沈んでいる。", resource: "power", reward: 115, mark: true },
    "-6,-1": { name: "骨粉採掘場", kind: "採掘場", story: "掘削跡の白い層は石灰ではなかった。作業日誌の最後の一行には『採掘対象を変更』とだけ残る。", resource: "scrap", reward: 108, mark: true },
    "-2,-6": { name: "折れた方位局", kind: "通信塔", story: "アンテナは北ではなく地面を向いている。復旧した信号は、こちらの現在地を呼び続ける。", resource: "data", reward: 90, mark: false },
    "0,6": { name: "黒水門", kind: "水門", story: "閉じた水門の向こう側で、金属を叩く音が一晩に三度だけ聞こえる。開閉記録は百年前に止まった。", resource: "power", reward: 86, mark: true },
    "7,-2": { name: "零マイルの合唱", kind: "音響異常", story: "風の音が、ここだけ複数の声に聞こえる。録音を再生すると、ひとつだけ未来の日付を告げていた。", resource: "data", reward: 132, mark: true },
    "-7,3": { name: "終端貨車ヤード", kind: "車両墓場", story: "貨車の側面には避難区の行先が並ぶ。どの区もこの大陸の外にはない。", resource: "scrap", reward: 145, mark: true },
    "1,-7": { name: "灰雨の針穴", kind: "気象遺構", story: "灰が空へ向かって降る直径数十メートルの穴。計器はこの場所を『上空』として記録する。", resource: "data", reward: 138, mark: true },
    "6,5": { name: "残響採水所", kind: "採水施設", story: "採水器から上がる水には、聞き覚えのない駅名が混じっている。現存する路線図にその駅はない。", resource: "power", reward: 150, mark: true },
    "-4,6": { name: "低層避難庫", kind: "避難施設", story: "内扉の向こうは空だった。壁一面に、外へ出た人々の帰還予定時刻が書かれている。", resource: "scrap", reward: 116, mark: false },
    "4,-6": { name: "無線封鎖域", kind: "通信異常", story: "通話記録は自分の声で始まり、まだ言っていない返答で終わる。送信者の位置は記録されていない。", resource: "data", reward: 155, mark: true },
    "8,0": { name: "外縁標識・七号", kind: "境界標", story: "大陸の端に立つ標識は、外を『復旧済み』と示している。こちらの地図だけが、その外側を空白にしている。", resource: "data", reward: 188, mark: true },
    "-8,0": { name: "旧境界・西", kind: "境界標", story: "西の境界線は、地図に記されたより二百キロ内側にある。地面の測量鋲はまだ先へ続いている。", resource: "scrap", reward: 165, mark: true },
    "0,-8": { name: "降灰前線記録所", kind: "気象記録", story: "記録は灰嵐の予報ではなく、到達後に誰がどの窓を閉めたかを残していた。", resource: "data", reward: 180, mark: true }
  };
  const SMALL_SITES = [
    { name: "転倒した測距器", kind: "残置機材", resource: "data", reward: 24 },
    { name: "切断された給電幹線", kind: "電力遺構", resource: "power", reward: 32 },
    { name: "錆びた荷役車", kind: "残置車両", resource: "scrap", reward: 38 },
    { name: "灰に埋もれた工具箱", kind: "回収点", resource: "scrap", reward: 27 },
    { name: "封鎖された測候壕", kind: "観測点", resource: "data", reward: 35 },
    { name: "焼けた変電箱", kind: "電力遺構", resource: "power", reward: 30 }
  ];
  const FACTIONS = [
    { id: "convoy", name: "連絡車列組合", short: "THE HAUL", color: "#d0a16a", creed: "荷を動かす者だけが、線路の先を決める。", blurb: "輸送路をつなぎ、車列の通行料を払う。遠くへ走るほど条件がよくなる。" },
    { id: "register", name: "白紙台帳局", short: "THE REGISTER", color: "#a6b5a1", creed: "記録されないものは、二度目には存在しない。", blurb: "測量データと遺構の記録を求める。地図を広げるほど大きな刻印を出す。" },
    { id: "union", name: "炉心労務連盟", short: "THE UNION", color: "#d47b59", creed: "止まった炉を起こせ。代価は後で決める。", blurb: "前哨基地と産出量を求める。長く続く産業網に報いる。" },
    { id: "wardens", name: "地層監視員", short: "THE WARDENS", color: "#83aaa7", creed: "断層は国境より長く記憶する。", blurb: "汚染地帯や境界標を調べる。遠征の危険を引き受ける仕事が多い。" }
  ];
  const RESEARCH = [
    { id: "seismic", name: "地層反響計", group: "測量系", cost: { data: 18, scrap: 22 }, text: "走査半径を1六角ぶん拡張する。", req: 0 },
    { id: "etching", name: "等高線焼き込み", group: "測量系", cost: { data: 22, power: 16 }, text: "新たに記録した地形から得る測量データが増える。", req: 0 },
    { id: "longwave", name: "長波受信機", group: "測量系", cost: { data: 42, scrap: 28 }, text: "走査半径をさらに1拡張。遠い遺構の反応も拾う。", req: 2 },
    { id: "parallax", name: "視差補正レンズ", group: "測量系", cost: { data: 72, power: 40 }, text: "走査効率が上がり、パルスごとに測量データを得る。", req: 4 },
    { id: "induction", name: "誘導コイル再巻線", group: "動力系", cost: { data: 20, scrap: 27 }, text: "本部の基礎電力生産を大きく上げる。", req: 0 },
    { id: "tread", name: "泥濘用ダブルトラック", group: "動力系", cost: { data: 34, scrap: 40 }, text: "1六角の航行所要時間を短縮する。", req: 1 },
    { id: "ceramic", name: "灰陶装甲", group: "動力系", cost: { data: 55, scrap: 62 }, text: "汚染地帯で車体が受ける損耗を抑える。", req: 3 },
    { id: "capacitor", name: "蓄電器再生計画", group: "動力系", cost: { data: 66, power: 30 }, text: "全前哨基地の電力産出を強化する。", req: 4 },
    { id: "foundry", name: "分散式誘導炉", group: "産業系", cost: { data: 26, scrap: 34 }, text: "鉄屑産出量を恒久的に増やす。", req: 0 },
    { id: "relay", name: "中継炉規格", group: "産業系", cost: { data: 43, power: 31 }, text: "前哨基地が周辺の産出を拾い、全資源の出力が伸びる。", req: 2 },
    { id: "scavenger", name: "解体腕・第三規格", group: "産業系", cost: { data: 60, scrap: 58 }, text: "遺構の回収量が増え、危険域でも作業を続けられる。", req: 3 },
    { id: "ledger", name: "統合資源台帳", group: "産業系", cost: { data: 86, scrap: 70, power: 48 }, text: "前哨網と本部の産出をまとめて強化する。", req: 5 },
    { id: "pressure", name: "圧力計校正", group: "遠征系", cost: { data: 36, scrap: 22 }, text: "危険地帯の記録から測量データを回収できる。", req: 1 },
    { id: "fieldmed", name: "現地装甲補修", group: "遠征系", cost: { data: 41, power: 28 }, text: "修理で回復する車体耐久が増える。", req: 2 },
    { id: "autonomy", name: "自律測量端末", group: "遠征系", cost: { data: 70, scrap: 62, power: 40 }, text: "到着時の自動測量半径を1六角ぶん広げる。", req: 4 },
    { id: "deepfield", name: "深層電磁断層計", group: "遠征系", cost: { data: 115, scrap: 90, power: 70 }, text: "黒潮縁で走査すると測量半径とデータ収入が増える。", req: 7 }
  ];
  const MODULES = [
    { id: "mast", name: "折畳み電波塔", cost: { scrap: 45, power: 20 }, text: "走査半径 +1。折り畳んでも、頂部の碍子だけはいつも焼けている。" },
    { id: "flywheel", name: "慣性蓄電輪", cost: { scrap: 62, power: 42 }, text: "本部の電力産出 +0.22 / 秒。" },
    { id: "crusher", name: "前部破砕ブレード", cost: { scrap: 78, power: 22 }, text: "全前哨基地の産出 +18%。廃材に混じった骨も砕く。" },
    { id: "armor", name: "珪灰二重装甲", cost: { scrap: 88, power: 32, data: 16 }, text: "汚染地帯から受ける損耗を3点軽減。" },
    { id: "winch", name: "傾斜地用巻上げ機", cost: { scrap: 66, power: 30, data: 20 }, text: "航行中の電力消費を30%減らす。" },
    { id: "archive", name: "車載音響保管器", cost: { scrap: 74, power: 27, data: 27 }, text: "遺構の回収量 +25%。見つけた声を消さずに持ち帰る。" },
    { id: "drill", name: "回転式岩盤穿孔器", cost: { scrap: 112, power: 50, data: 40 }, text: "前哨基地の各レベルが生む資源をさらに増やす。" }
  ];

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const keyOf = (q, r) => q + "," + r;
  const parseKey = (key) => key.split(",").map(Number);
  const hexDistance = (a, b) => {
    const dq = a.q - b.q, dr = a.r - b.r;
    return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
  };
  const fract = (n) => n - Math.floor(n);
  const hash = (q, r, salt) => fract(Math.sin(q * 127.1 + r * 311.7 + salt * 74.7) * 43758.5453);
  const round1 = (n) => Math.round(n * 10) / 10;
  const esc = (value) => String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const fmt = (n, digits = 1) => {
    if (!Number.isFinite(n)) return "0";
    if (n >= 1e9) return (n / 1e9).toFixed(2) + "G";
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e4) return (n / 1e3).toFixed(1) + "K";
    if (n >= 1000) return Math.floor(n).toLocaleString("ja-JP");
    if (n < 10) return n.toFixed(digits);
    return Math.floor(n).toLocaleString("ja-JP");
  };
  const durationLabel = (seconds) => {
    const s = Math.max(0, Math.floor(seconds));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0 ? h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0") + ":" + sec.toString().padStart(2, "0") : m.toString().padStart(2, "0") + ":" + sec.toString().padStart(2, "0");
  };
  const svgPoint = (q, r) => ({
    x: CENTER.x + SIZE * Math.sqrt(3) * (q + r / 2),
    y: CENTER.y + SIZE * 1.5 * r
  });
  const hexPoints = (x, y) => Array.from({ length: 6 }, (_, i) => {
    const a = Math.PI / 180 * (60 * i - 90);
    return (x + SIZE * Math.cos(a)).toFixed(1) + "," + (y + SIZE * Math.sin(a)).toFixed(1);
  }).join(" ");

  function zoneFor(q, r) {
    const x = q + r * .34;
    if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) >= 8) return ZONES.black;
    if (r >= 3 && q >= 0) return ZONES.drowned;
    if (x <= -3.4) return ZONES.salt;
    if (x >= 3.1) return ZONES.glass;
    return ZONES.rust;
  }
  function makeTile(q, r) {
    const zone = zoneFor(q, r);
    const seed = hash(q, r, 13), variant = hash(q, r, 23), richness = .7 + hash(q, r, 37) * 1.15;
    const site = LANDMARKS[keyOf(q, r)] || null;
    let terrain;
    if (site) terrain = site.resource === "data" ? "relay" : site.resource === "power" ? "vent" : "scrap";
    else if (zone === ZONES.salt) terrain = seed < .42 ? "salt" : seed < .65 ? "scarp" : "scrap";
    else if (zone === ZONES.glass) terrain = seed < .42 ? "glass" : seed < .65 ? "relay" : "vent";
    else if (zone === ZONES.drowned) terrain = seed < .43 ? "flood" : seed < .67 ? "vent" : "scrap";
    else if (zone === ZONES.black) terrain = seed < .34 ? "rift" : seed < .57 ? "relay" : seed < .75 ? "scarp" : "flood";
    else terrain = seed < .39 ? "scrap" : seed < .60 ? "scarp" : seed < .79 ? "vent" : "relay";
    const resource = site ? site.resource : terrain === "vent" || terrain === "flood" || terrain === "glass" || terrain === "salt" ? "power" : terrain === "relay" || terrain === "rift" ? "data" : "scrap";
    const terrainName = {
      salt: "白塵塩床", scarp: "断層崖", scrap: "鋼滓棚", glass: "硝子樹叢",
      relay: "信号溜り", vent: "排熱口", flood: "浸水工区", rift: "沈降亀裂"
    }[terrain];
    const suffixes = ["標高線", "第", "無番", "東斜面", "沈下区", "外縁"];
    const name = site ? site.name : terrainName + "・" + (suffixes[Math.floor(variant * suffixes.length)] === "第" ? "第" + (Math.floor(hash(q, r, 48) * 11) + 1) + "区" : suffixes[Math.floor(variant * suffixes.length)]);
    const hazard = clamp(Math.floor(hash(q, r, 59) * 4 + (zone === ZONES.black ? 1 : 0)), 0, 4);
    let smallSite = null;
    if (!site && hash(q, r, 88) > .84) smallSite = SMALL_SITES[Math.floor(hash(q, r, 97) * SMALL_SITES.length)];
    const siteData = site || smallSite || null;
    return { q, r, key: keyOf(q, r), zone, terrain, terrainName, name, resource, richness, hazard, site: siteData, landmark: !!site };
  }
  const WORLD = [];
  const TILE_BY_KEY = Object.create(null);
  for (let q = -RADIUS; q <= RADIUS; q++) {
    for (let r = -RADIUS; r <= RADIUS; r++) {
      if (Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= RADIUS) {
        const tile = makeTile(q, r);
        WORLD.push(tile);
        TILE_BY_KEY[tile.key] = tile;
      }
    }
  }

  const newRunStats = () => ({
    tilesMapped: 0, sitesRecovered: 0, outpostsBuilt: 0, outpostsUpgraded: 0,
    longestRange: 0, dangerVisits: 0, elapsed: 0,
    gained: { scrap: 0, power: 0, data: 0 }
  });
  const newCareer = () => ({
    tilesMapped: 0, sitesRecovered: 0, outpostsBuilt: 0, contracts: 0,
    charters: 0, relics: 0, elapsed: 0, gained: { scrap: 0, power: 0, data: 0 },
    archive: []
  });
  function newState() {
    const discovered = {};
    WORLD.forEach((tile) => {
      if (hexDistance(tile, { q: 0, r: 0 }) === 0) discovered[tile.key] = true;
    });
    return {
      version: 1, tab: "world", selected: "0,0", pos: { q: 0, r: 0 }, route: [], routeRemaining: 0,
      resources: { scrap: 118, power: 76, data: 24, marks: 0 }, hull: 100,
      discovered, outposts: {}, recovered: {}, tech: {}, modules: {}, rep: { convoy: 0, register: 0, union: 0, wardens: 0 },
      activeOrder: null, run: newRunStats(),
      career: newCareer(), meta: { charters: 1, permanentMarks: 0, bestMapped: 0, landmarks: {}, notes: [] },
      createdAt: Date.now(), savedAt: Date.now(),
      logs: [{ time: Date.now(), text: "灰線号、旧環状工業帯の観測点を離脱。地図の白紙部分へ航路を引け。" }]
    };
  }

  let state;
  let lastTick = Date.now();
  let toastTimer = null;
  let saveLabelTimer = null;
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));

  function normalizeState(raw) {
    if (!raw || typeof raw !== "object" || !raw.resources || !raw.pos || !raw.discovered) return null;
    const fresh = newState();
    const out = Object.assign(fresh, raw);
    out.resources = Object.assign(fresh.resources, raw.resources);
    ["scrap", "power", "data", "marks"].forEach((key) => { out.resources[key] = clamp(Number(out.resources[key]) || 0, 0, 1e12); });
    out.run = Object.assign(newRunStats(), raw.run || {});
    out.run.gained = Object.assign(newRunStats().gained, (raw.run || {}).gained || {});
    ["tilesMapped", "sitesRecovered", "outpostsBuilt", "outpostsUpgraded", "longestRange", "dangerVisits", "elapsed"].forEach((key) => { out.run[key] = Math.max(0, Number(out.run[key]) || 0); });
    ["scrap", "power", "data"].forEach((key) => { out.run.gained[key] = Math.max(0, Number(out.run.gained[key]) || 0); });
    out.career = Object.assign(newCareer(), raw.career || {});
    out.career.gained = Object.assign(newCareer().gained, (raw.career || {}).gained || {});
    ["tilesMapped", "sitesRecovered", "outpostsBuilt", "contracts", "charters", "relics", "elapsed"].forEach((key) => { out.career[key] = Math.max(0, Number(out.career[key]) || 0); });
    ["scrap", "power", "data"].forEach((key) => { out.career.gained[key] = Math.max(0, Number(out.career.gained[key]) || 0); });
    out.meta = Object.assign(fresh.meta, raw.meta || {});
    out.meta.landmarks = {};
    Object.keys((raw.meta || {}).landmarks || {}).forEach((key) => { if (LANDMARKS[key] && raw.meta.landmarks[key]) out.meta.landmarks[key] = true; });
    out.meta.notes = Array.isArray(out.meta.notes) ? out.meta.notes.filter((n) => n && typeof n === "object").slice(0, 100).map((n) => ({ time: Number(n.time) || Date.now(), title: String(n.title || "").slice(0, 120), text: String(n.text || "").slice(0, 1200), zone: String(n.zone || "").slice(0, 80) })) : [];
    out.tech = {};
    RESEARCH.forEach((item) => { out.tech[item.id] = !!(raw.tech && raw.tech[item.id]); });
    out.modules = {};
    MODULES.forEach((item) => { out.modules[item.id] = !!(raw.modules && raw.modules[item.id]); });
    out.outposts = {};
    Object.keys(raw.outposts || {}).forEach((key) => {
      if (!TILE_BY_KEY[key] || key === "0,0") return;
      const level = clamp(Math.floor(Number(raw.outposts[key].level) || 1), 1, 20);
      out.outposts[key] = { key, level, builtAt: Number(raw.outposts[key].builtAt) || Date.now() };
    });
    out.recovered = {};
    Object.keys(raw.recovered || {}).forEach((key) => { if (TILE_BY_KEY[key] && raw.recovered[key]) out.recovered[key] = true; });
    out.discovered = {};
    Object.keys(raw.discovered || {}).forEach((key) => { if (TILE_BY_KEY[key] && raw.discovered[key]) out.discovered[key] = true; });
    out.rep = { convoy: 0, register: 0, union: 0, wardens: 0 };
    FACTIONS.forEach((f) => { out.rep[f.id] = Math.max(0, Number(raw.rep && raw.rep[f.id]) || 0); });
    out.logs = Array.isArray(out.logs) ? out.logs.slice(0, 20) : [];
    out.route = [];
    out.routeRemaining = 0;
    out.tab = ["world", "fleet", "network", "research", "orders", "archive"].includes(out.tab) ? out.tab : "world";
    const safeQ = Math.round(Number(out.pos.q) || 0), safeR = Math.round(Number(out.pos.r) || 0);
    out.pos = TILE_BY_KEY[keyOf(safeQ, safeR)] ? { q: safeQ, r: safeR } : { q: 0, r: 0 };
    out.selected = TILE_BY_KEY[out.selected] && out.discovered[out.selected] ? out.selected : keyOf(out.pos.q, out.pos.r);
    const importedOrder = raw.activeOrder;
    if (importedOrder && FACTIONS.some((f) => f.id === importedOrder.faction) && importedOrder.spec) {
      const allowedKinds = ["distance", "range", "scrap", "data", "mapped", "sites", "outposts", "upgrades", "danger", "landmarks"];
      const source = importedOrder.spec;
      const spec = {
        faction: importedOrder.faction, id: String(source.id || "").slice(0, 60), tier: clamp(Math.floor(Number(source.tier) || 1), 1, 999),
        kind: allowedKinds.includes(source.kind) ? source.kind : "mapped",
        target: clamp(Number(source.target) || 1, 1, 1e9), title: String(source.title || "").slice(0, 120),
        text: String(source.text || "").slice(0, 1200), reward: clamp(Number(source.reward) || 1, 1, 1e6)
      };
      const startSource = importedOrder.start || {}, start = {};
      ["range", "scrap", "data", "mapped", "sites", "outposts", "upgrades", "danger", "landmarks"].forEach((k) => { start[k] = Math.max(0, Number(startSource[k]) || 0); });
      out.activeOrder = { id: spec.id, faction: importedOrder.faction, start, spec };
    } else out.activeOrder = null;
    out.career.archive = Array.isArray(out.career.archive) ? out.career.archive.filter((n) => n && typeof n === "object").slice(0, 100).map((n) => ({ time: Number(n.time) || Date.now(), title: String(n.title || "").slice(0, 120), text: String(n.text || "").slice(0, 1200) })) : [];
    out.hull = clamp(Number(out.hull) || 100, 0, 100);
    out.meta.charters = Math.max(1, Number(out.meta.charters) || 1);
    out.run.elapsed = Math.max(0, Number(out.run.elapsed) || 0);
    return out;
  }
  function loadGame() {
    try {
      const rawText = localStorage.getItem(SAVE_KEY);
      if (!rawText) {
        state = newState();
        save();
        return;
      }
      const raw = JSON.parse(rawText);
      state = normalizeState(raw) || newState();
      const gap = clamp((Date.now() - (Number(state.savedAt) || Date.now())) / 1000, 0, 28800);
      if (gap >= 20) {
        const rate = productionRates();
        const offline = {};
        ["scrap", "power", "data"].forEach((k) => {
          offline[k] = (rate[k] || 0) * gap;
          state.resources[k] += offline[k];
          state.run.gained[k] += offline[k];
          state.career.gained[k] += offline[k];
        });
        state.run.elapsed += gap;
        state.career.elapsed += gap;
        state.logs.unshift({ time: Date.now(), text: "不在中も前哨網が稼働。最大8時間分の産出を受領した。" });
        state._offline = { seconds: gap, amounts: offline };
      }
      state.savedAt = Date.now();
      lastTick = Date.now();
      save();
    } catch (err) {
      state = newState();
      try { save(); } catch (_) {}
      console.warn("ASHLINE save could not be read", err);
    }
  }

  function addLog(text) {
    state.logs.unshift({ time: Date.now(), text: String(text) });
    state.logs = state.logs.slice(0, 30);
    const line = $("#latest-log");
    if (line) line.textContent = text;
  }
  function showToast(text) {
    const node = $("#toast");
    node.textContent = text;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove("show"), 2400);
  }
  function save() {
    state.savedAt = Date.now();
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
      const label = $("#save-state");
      if (label) {
        label.textContent = "記録済";
        clearTimeout(saveLabelTimer);
        saveLabelTimer = setTimeout(() => { if ($("#save-state")) $("#save-state").textContent = "自動記録"; }, 1100);
      }
    } catch (err) {
      console.warn("ASHLINE save failed", err);
      if ($("#save-state")) $("#save-state").textContent = "記録不可";
    }
  }
  function activeTech(id) { return !!state.tech[id]; }
  function activeModule(id) { return !!state.modules[id]; }
  function countTech() { return Object.keys(state.tech).filter((k) => state.tech[k]).length; }
  function countDiscovered() { return Object.keys(state.discovered).filter((k) => state.discovered[k]).length; }
  function countRecovered() { return Object.keys(state.recovered).filter((k) => state.recovered[k]).length; }
  function countLandmarks() { return Object.keys(state.meta.landmarks).filter((k) => state.meta.landmarks[k]).length; }
  function countOutposts() { return Object.keys(state.outposts).length; }
  function tileAt(key) { return TILE_BY_KEY[key] || TILE_BY_KEY["0,0"]; }

  function revealAround(center, radius, initial = false) {
    let found = 0, data = 0;
    WORLD.forEach((tile) => {
      if (hexDistance(tile, center) <= radius && !state.discovered[tile.key]) {
        state.discovered[tile.key] = true;
        found += 1;
        const bonus = 1 + (activeTech("etching") ? 1 : 0) + (zoneFor(tile.q, tile.r) === ZONES.black && activeTech("pressure") ? 1 : 0) + (zoneFor(tile.q, tile.r) === ZONES.black && activeTech("deepfield") ? 2 : 0);
        data += bonus;
      }
    });
    if (!initial && found > 0) {
      state.run.tilesMapped += found;
      state.career.tilesMapped += found;
      state.resources.data += data;
      state.run.gained.data += data;
      state.career.gained.data += data;
      state.meta.bestMapped = Math.max(state.meta.bestMapped, countDiscovered());
      const sites = WORLD.filter((t) => state.discovered[t.key] && t.site && !state.recovered[t.key]);
      if (sites.length > 0 && !initial) addLog(found + "区画を地図に記録。未回収の反応点 " + sites.length + "。");
    }
    return found;
  }

  function getTechScanBonus() { return (activeTech("seismic") ? 1 : 0) + (activeTech("longwave") ? 1 : 0) + (activeModule("mast") ? 1 : 0) + (activeTech("deepfield") && zoneFor(state.pos.q, state.pos.r) === ZONES.black ? 1 : 0); }
  function getStepTime() { return Math.max(.6, 1.55 - (activeTech("tread") ? .35 : 0)); }
  function damageBuffer() { return (activeTech("ceramic") ? 1.5 : 0) + (activeModule("armor") ? 3 : 0); }
  function outputMultiplier() {
    return 1 + (activeTech("foundry") ? .18 : 0) + (activeTech("relay") ? .12 : 0) + (activeTech("ledger") ? .22 : 0) + (activeModule("crusher") ? .18 : 0) + (activeModule("drill") ? .15 : 0) + (state.meta.charters - 1) * .055;
  }
  function productionRates() {
    const rate = {
      scrap: .18 + (activeTech("foundry") ? .12 : 0) + (activeTech("ledger") ? .06 : 0),
      power: (.16 + (activeTech("induction") ? .17 : 0) + (activeModule("flywheel") ? .22 : 0)) * (activeTech("capacitor") ? 1.2 : 1),
      data: .025 + (activeTech("ledger") ? .025 : 0)
    };
    const mult = outputMultiplier();
    Object.values(state.outposts).forEach((outpost) => {
      const tile = tileAt(outpost.key);
      const base = (.22 + tile.richness * .12) * outpost.level * mult;
      rate[tile.resource] += base;
    });
    return rate;
  }
  function addResource(resource, amount) {
    if (!state.resources.hasOwnProperty(resource) || amount <= 0) return;
    state.resources[resource] += amount;
    if (resource !== "marks") {
      state.run.gained[resource] = (state.run.gained[resource] || 0) + amount;
      state.career.gained[resource] = (state.career.gained[resource] || 0) + amount;
    }
  }
  function afford(cost) {
    return Object.keys(cost).every((k) => (state.resources[k] || 0) + 1e-6 >= cost[k]);
  }
  function pay(cost) {
    if (!afford(cost)) return false;
    Object.keys(cost).forEach((k) => { state.resources[k] -= cost[k]; });
    return true;
  }
  function costLabel(cost) {
    return Object.entries(cost).map(([k, v]) => {
      const meta = RESOURCE_META[k];
      return meta ? meta.icon + " " + fmt(v, 0) + " " + meta.label : fmt(v, 0) + " " + k;
    }).join("　");
  }
  function amountMarkup(resource, value) {
    const meta = RESOURCE_META[resource];
    return '<span class="cost-line">' + meta.icon + " <b>" + fmt(value, 0) + "</b> " + meta.label + "</span>";
  }

  function neighborKeys(key) {
    const [q, r] = parseKey(key);
    return HEX_DIRS.map(([dq, dr]) => keyOf(q + dq, r + dr)).filter((k) => TILE_BY_KEY[k]);
  }
  function findRoute(fromKey, toKey) {
    if (fromKey === toKey) return [];
    const queue = [fromKey], previous = new Map([[fromKey, null]]);
    for (let i = 0; i < queue.length; i++) {
      const current = queue[i];
      if (current === toKey) break;
      neighborKeys(current).forEach((next) => {
        if (state.discovered[next] && !previous.has(next)) {
          previous.set(next, current);
          queue.push(next);
        }
      });
    }
    if (!previous.has(toKey)) return null;
    const path = [];
    let k = toKey;
    while (k !== fromKey) { path.unshift(k); k = previous.get(k); }
    return path;
  }

  function startRoute(key) {
    if (!state.discovered[key]) return showToast("未踏地には、まず走査パルスを送る。");
    if (state.hull <= 0) return showToast("車体が航行不能。装甲を補修してから発進する。");
    const route = findRoute(keyOf(state.pos.q, state.pos.r), key);
    if (route === null) return showToast("既知の航路がない。地図上の踏査済み区画をつないで進む。");
    if (!route.length) return showToast("灰線号はすでにその区画にいる。");
    const charge = route.length * 1.3 * (activeModule("winch") ? .7 : 1);
    if (state.resources.power < charge) return showToast("電力不足。必要量 " + fmt(charge) + "。");
    state.route = route;
    state.routeRemaining = .5;
    state.selected = key;
    addLog("航路設定: " + route.length + "六角 / 推定電力 " + fmt(charge) + "。");
    save();
    render();
  }
  function arriveStep() {
    if (!state.route.length) return false;
    const nextKey = state.route[0];
    const nextTile = tileAt(nextKey);
    const moveCost = 1.3 * (activeModule("winch") ? .7 : 1);
    if (state.resources.power < moveCost) {
      state.route = [];
      addLog("電力が尽き、航行を中断した。近隣の中継点を探せ。");
      showToast("電力不足で航行を中断。");
      return true;
    }
    state.resources.power -= moveCost;
    const hazard = nextTile.hazard;
    const hit = Math.max(0, Math.ceil(hazard * 2.1 - damageBuffer()));
    if (hit > 0) {
      state.hull = clamp(state.hull - hit, 0, 100);
      if (activeTech("pressure")) addResource("data", hazard * .35);
      if (hazard >= 3) state.run.dangerVisits += 1;
    }
    state.pos = { q: nextTile.q, r: nextTile.r };
    state.selected = nextKey;
    if (!state.discovered[nextKey]) {
      state.discovered[nextKey] = true;
      state.run.tilesMapped += 1;
      state.career.tilesMapped += 1;
    }
    const discoveredAtArrival = revealAround(nextTile, activeTech("autonomy") ? 2 : 1);
    const distance = hexDistance(nextTile, { q: 0, r: 0 });
    state.run.longestRange = Math.max(state.run.longestRange, distance);
    state.route.shift();
    state.routeRemaining = getStepTime();
    if (state.hull <= 0) {
      state.route = [];
      const lost = Math.min(state.resources.scrap, Math.floor(state.resources.scrap * .12));
      state.resources.scrap -= lost;
      state.pos = { q: 0, r: 0 };
      state.selected = "0,0";
      state.hull = 30;
      addLog("灰線号が汚染層で停止。回収班が観測所まで曳航した。鉄屑 " + fmt(lost, 0) + " を放棄。");
      showToast("車体停止。観測所まで曳航された。");
    } else if (state.route.length === 0) {
      addLog("到着: " + nextTile.name + " / " + nextTile.zone.name + "。");
      if (nextTile.hazard >= 3) addLog("警告: 放射圧が高い。車体耐久 " + Math.floor(state.hull) + "%。");
      if (activeTech("autonomy") && discoveredAtArrival) addLog("自律測量端末が周辺 " + discoveredAtArrival + " 区画を記録。");
    }
    return true;
  }

  function tick() {
    const now = Date.now();
    let dt = clamp((now - lastTick) / 1000, 0, 2);
    lastTick = now;
    if (dt <= 0) return;
    const rates = productionRates();
    ["scrap", "power", "data"].forEach((k) => addResource(k, rates[k] * dt));
    state.run.elapsed += dt;
    state.career.elapsed += dt;
    let moved = false;
    if (state.route.length) {
      state.routeRemaining -= dt;
      while (state.route.length && state.routeRemaining <= 0) {
        moved = arriveStep() || moved;
        if (state.route.length) state.routeRemaining += getStepTime();
      }
    }
    if (state.run.elapsed % 5 < dt) save();
    renderHeader();
    renderDynamic();
    if (moved) { save(); render(); }
  }

  function selectTab(tab) {
    state.tab = tab;
    render();
    save();
  }
  function setSelected(key) {
    if (!state.discovered[key]) return showToast("この区画は未踏。広域走査で地形を記録する。");
    state.selected = key;
    render();
  }
  function scan() {
    if (state.resources.power < 8) return showToast("走査パルスに電力が足りない。");
    const radius = 1 + getTechScanBonus();
    const origin = state.pos;
    state.resources.power -= 8;
    const found = revealAround(origin, radius);
    if (found <= 0) {
      addResource("data", activeTech("parallax") ? 2.5 : 1.2);
      addLog("走査範囲に未踏区画なし。反響記録のみ回収した。");
      showToast("新しい地形はなし。測量データを回収。");
    } else {
      const bonus = activeTech("parallax") ? 4 : 0;
      if (bonus) addResource("data", bonus);
      const landmarks = WORLD.filter((tile) => state.discovered[tile.key] && tile.landmark && !state.meta.landmarks[tile.key]).length;
      addLog("走査完了: " + found + "区画を記録。大陸図 " + countDiscovered() + " / " + WORLD.length + "。");
      if (landmarks > 0) showToast(found + "区画を記録。強い反応点を検出。");
      else showToast(found + "区画を地図に記録。");
    }
    save();
    render();
  }

  function recoverSite(key) {
    const tile = tileAt(key);
    if (state.route.length) return showToast("回収作業は車列が停車してから行う。");
    if (!tile.site) return showToast("回収できる遺構がない。");
    if (state.recovered[key]) return showToast("回収記録あり。ここに残るのは空の殻だけだ。");
    if (key !== keyOf(state.pos.q, state.pos.r)) return showToast("現地に到着してから回収できる。");
    const bonus = (activeTech("scavenger") ? 1.3 : 1) * (activeModule("archive") ? 1.25 : 1);
    const reward = Math.floor(tile.site.reward * tile.richness * bonus);
    const resource = tile.site.resource;
    addResource(resource, reward);
    addResource("data", 5 + (tile.landmark ? 7 : 0));
    const markReward = tile.landmark && tile.site.mark ? (tile.site.reward >= 120 ? 3 : 1) : 0;
    if (markReward) state.resources.marks += markReward;
    state.recovered[key] = true;
    state.run.sitesRecovered += 1;
    state.career.sitesRecovered += 1;
    if (tile.landmark) {
      state.meta.landmarks[key] = true;
      state.career.relics += 1;
      state.meta.notes.unshift({ time: Date.now(), title: tile.site.name, text: tile.site.story, zone: tile.zone.name });
      state.meta.notes = state.meta.notes.slice(0, 100);
    }
    const hit = Math.max(0, Math.ceil(tile.hazard * 1.6 - damageBuffer()));
    if (hit) state.hull = clamp(state.hull - hit, 0, 100);
    addLog(tile.site.name + "を回収。+" + fmt(reward, 0) + " " + RESOURCE_META[resource].label + (markReward ? " · 刻印 +" + markReward : "") + "。");
    showToast(tile.landmark ? "航海誌に固有記録を追加。" : "現地回収完了。");
    save();
    render();
  }

  function buildOutpost(key) {
    const tile = tileAt(key);
    if (state.route.length) return showToast("前哨設営は車列が停車してから行う。");
    if (key !== keyOf(state.pos.q, state.pos.r)) return showToast("前哨基地の設営には灰線号の到着が必要。");
    if (key === "0,0") return showToast("観測所にはすでに車列本部がある。");
    if (state.outposts[key]) return showToast("この区画には前哨基地が稼働中。");
    const cost = { scrap: 46, power: 18 };
    if (!pay(cost)) return showToast("前哨設営資材が足りない。必要: " + costLabel(cost));
    state.outposts[key] = { key, level: 1, builtAt: Date.now() };
    state.run.outpostsBuilt += 1;
    state.career.outpostsBuilt += 1;
    addLog(tile.name + "に前哨基地を設営。地形資源: " + RESOURCE_META[tile.resource].label + "。");
    showToast("前哨基地を開設。帰還後も産出が続く。");
    save();
    render();
  }
  function upgradeOutpost(key) {
    const outpost = state.outposts[key];
    if (!outpost) return;
    const level = outpost.level;
    const cost = { scrap: Math.floor(48 * Math.pow(1.62, level - 1)), power: Math.floor(20 * Math.pow(1.45, level - 1)) };
    if (!pay(cost)) return showToast("増設資材が足りない。必要: " + costLabel(cost));
    outpost.level += 1;
    state.run.outpostsUpgraded += 1;
    addLog(tileAt(key).name + "前哨をレベル " + outpost.level + " に増設。");
    showToast("産出モジュールを増設。");
    save();
    render();
  }
  function repair() {
    if (state.route.length) return showToast("補修には安全な停車場所が必要。");
    if (state.hull >= 100) return showToast("車体は損耗していない。");
    const heal = activeTech("fieldmed") ? 48 : 34;
    const cost = { scrap: Math.ceil((100 - state.hull) * .42), power: Math.ceil((100 - state.hull) * .18) };
    if (!pay(cost)) return showToast("補修部材が不足。必要: " + costLabel(cost));
    state.hull = Math.min(100, state.hull + heal);
    addLog("現地補修を実施。車体耐久 " + Math.floor(state.hull) + "%。");
    showToast("装甲を補修した。");
    save();
    render();
  }

  function buyTech(id) {
    const item = RESEARCH.find((t) => t.id === id);
    if (!item || activeTech(id)) return;
    if (countTech() < item.req) return showToast("研究局の前提技術が不足。");
    if (!pay(item.cost)) return showToast("技術購入資材が足りない。");
    state.tech[id] = true;
    addLog("研究完了: " + item.name + "。");
    showToast(item.name + "を実装。");
    save();
    render();
  }
  function buyModule(id) {
    const item = MODULES.find((m) => m.id === id);
    if (!item || activeModule(id)) return;
    if (!pay(item.cost)) return showToast("車両部品の資材が足りない。");
    state.modules[id] = true;
    addLog("車両改造: " + item.name + "を搭載。");
    showToast("車両装備を更新。");
    save();
    render();
  }

  function faction(id) { return FACTIONS.find((f) => f.id === id) || FACTIONS[0]; }
  function contractSpec(fid) {
    const rep = state.rep[fid] || 0;
    const tier = Math.floor(rep / 12) + 1;
    const scale = 1 + Math.floor((tier - 1) / 3);
    const templates = {
      convoy: [
        { kind: "distance", target: 8 * scale, title: "運行票・外縁便", text: "観測所から離れた地形へ車列を通す。帰り道は別に確保すること。", reward: 10 + 2 * scale },
        { kind: "scrap", target: 70 * scale, title: "鋼材搬入・第三便", text: "鉄屑を組合の荷揚げ所へ割り当てる。現地回収と産業網の合算でよい。", reward: 11 + 2 * scale },
        { kind: "outposts", target: 2 * scale, title: "中継路の敷設", text: "前哨基地を建て、通行可能な線を延ばす。", reward: 12 + 2 * scale }
      ],
      register: [
        { kind: "mapped", target: 11 * scale, title: "白紙の追補", text: "既知の測量記録を増やし、地形図の空白を埋める。", reward: 11 + 2 * scale },
        { kind: "sites", target: 2 * scale, title: "欠落した証拠物", text: "現地へ赴き、未整理の遺構を回収する。", reward: 13 + 2 * scale },
        { kind: "data", target: 34 * scale, title: "反響波形の納入", text: "走査と回収で得た測量データを送信する。", reward: 10 + 2 * scale }
      ],
      union: [
        { kind: "outposts", target: 2 * scale, title: "炉をつなぐ", text: "資源地形に前哨基地を設置し、連盟規格の産業網に加える。", reward: 13 + 2 * scale },
        { kind: "scrap", target: 95 * scale, title: "鋼滓割当量", text: "再生可能な鉄屑産出を増やす。所持量ではなく累計搬入を記録する。", reward: 12 + 2 * scale },
        { kind: "upgrades", target: 2 * scale, title: "現地炉の増圧", text: "稼働前哨基地のレベルを上げる。", reward: 14 + 2 * scale }
      ],
      wardens: [
        { kind: "danger", target: 3 * scale, title: "断層境界の記録", text: "危険度3以上の地形に入り、圧力の変化を測る。", reward: 14 + 2 * scale },
        { kind: "landmarks", target: 1 * scale, title: "標識をひとつ持ち帰る", text: "固有名のある遺構を調査する。", reward: 16 + 2 * scale },
        { kind: "range", target: 6 * scale, title: "外縁線の測量", text: "観測所から離れた区画まで車列を進める。", reward: 15 + 2 * scale }
      ]
    };
    const order = templates[fid][(tier - 1) % templates[fid].length];
    return Object.assign({ faction: fid, tier, id: fid + "-" + tier }, order);
  }
  function contractValue(spec, order) {
    if (!order) return 0;
    const start = order.start || {};
    switch (spec.kind) {
      case "distance": return Math.max(0, state.run.longestRange - (start.range || 0));
      case "range": return Math.max(0, state.run.longestRange - (start.range || 0));
      case "scrap": return Math.max(0, state.run.gained.scrap - (start.scrap || 0));
      case "data": return Math.max(0, state.run.gained.data - (start.data || 0));
      case "mapped": return Math.max(0, state.run.tilesMapped - (start.mapped || 0));
      case "sites": return Math.max(0, state.run.sitesRecovered - (start.sites || 0));
      case "outposts": return Math.max(0, state.run.outpostsBuilt - (start.outposts || 0));
      case "upgrades": return Math.max(0, state.run.outpostsUpgraded - (start.upgrades || 0));
      case "danger": return Math.max(0, state.run.dangerVisits - (start.danger || 0));
      case "landmarks": return Math.max(0, Object.keys(state.meta.landmarks).length - (start.landmarks || 0));
      default: return 0;
    }
  }
  function currentContractProgress() {
    if (!state.activeOrder) return { value: 0, ratio: 0, done: false };
    const spec = contractSpec(state.activeOrder.faction);
    if (spec.id !== state.activeOrder.id) {
      const snap = state.activeOrder.spec;
      if (snap) {
        const value = contractValue(snap, state.activeOrder);
        return { value, ratio: clamp(value / snap.target, 0, 1), done: value >= snap.target };
      }
    }
    const value = contractValue(spec, state.activeOrder);
    return { value, ratio: clamp(value / spec.target, 0, 1), done: value >= spec.target };
  }
  function takeContract(fid) {
    if (state.activeOrder) return showToast("進行中の依頼を完了させる。");
    const spec = contractSpec(fid);
    const start = {
      range: state.run.longestRange, scrap: state.run.gained.scrap, data: state.run.gained.data,
      mapped: state.run.tilesMapped, sites: state.run.sitesRecovered, outposts: state.run.outpostsBuilt,
      upgrades: state.run.outpostsUpgraded, danger: state.run.dangerVisits, landmarks: Object.keys(state.meta.landmarks).length
    };
    state.activeOrder = { id: spec.id, faction: fid, start, spec };
    addLog(faction(fid).name + "の依頼を受領: " + spec.title + "。");
    showToast("依頼を受領。進行状況は走行と回収で更新される。");
    save();
    render();
  }
  function claimContract() {
    if (!state.activeOrder) return;
    const progress = currentContractProgress();
    if (!progress.done) return showToast("依頼条件がまだ満たされていない。");
    const spec = state.activeOrder.spec || contractSpec(state.activeOrder.faction);
    const f = faction(state.activeOrder.faction);
    state.resources.marks += spec.reward;
    state.rep[f.id] = (state.rep[f.id] || 0) + 12;
    state.career.contracts += 1;
    addLog(f.name + "の依頼を完了。刻印 +" + spec.reward + "。");
    state.activeOrder = null;
    showToast("依頼完了。刻印を獲得。");
    save();
    render();
  }

  function canRecharter() {
    return countDiscovered() >= 55 && countRecovered() >= 8 && state.run.outpostsBuilt >= 3 && state.resources.marks >= 42;
  }
  function recharter() {
    if (!canRecharter()) return showToast("大陸踏査・遺構回収・前哨網・刻印の条件を満たす。");
    const summary = {
      tiles: countDiscovered(), sites: countRecovered(), landmarks: countLandmarks(),
      marks: state.resources.marks, charter: state.meta.charters
    };
    state.meta.charters += 1;
    state.meta.permanentMarks += Math.floor(state.resources.marks * .55);
    state.career.charters += 1;
    state.career.archive.unshift({
      time: Date.now(), title: "第" + summary.charter + "次遠征の管轄返上",
      text: "踏査 " + summary.tiles + "区画 / 遺構 " + summary.sites + "件 / 固有記録 " + summary.landmarks + "件。刻印 " + summary.marks + "の55%を次の契約へ持ち越した。"
    });
    state.resources = { scrap: 128 + state.meta.charters * 18, power: 82 + state.meta.charters * 8, data: 28, marks: state.meta.permanentMarks };
    state.hull = 100;
    state.outposts = {};
    state.tech = {};
    state.modules = {};
    state.rep = { convoy: 0, register: 0, union: 0, wardens: 0 };
    state.activeOrder = null;
    state.run = newRunStats();
    state.route = [];
    state.routeRemaining = 0;
    state.pos = { q: 0, r: 0 };
    state.selected = "0,0";
    addLog("管轄権を返上。地図と固有記録を保持して、第" + state.meta.charters + "次チャーターを開始。");
    showToast("新規チャーター開始。地図と航海誌は引き継いだ。");
    save();
    render();
  }

  function renderHeader() {
    const resources = $("#resource-strip");
    if (resources) {
      resources.innerHTML = ["scrap", "power", "data", "marks"].map((key) => {
        const meta = RESOURCE_META[key];
        return '<div class="resource-pill" data-resource="' + key + '"><span class="resource-icon">' + meta.icon + '</span><span class="resource-name">' + meta.short + '</span><span class="resource-value">' + fmt(state.resources[key], key === "marks" ? 0 : 1) + '</span></div>';
      }).join("");
    }
    const charter = $("#charter-count");
    if (charter) charter.textContent = String(state.meta.charters).padStart(2, "0");
    const runTime = $("#run-time");
    if (runTime) runTime.textContent = durationLabel(state.run.elapsed);
    const outposts = $("#nav-outposts"); if (outposts) outposts.textContent = String(countOutposts()).padStart(2, "0");
    const tech = $("#nav-tech"); if (tech) tech.textContent = String(countTech()).padStart(2, "0");
    const orders = $("#nav-orders"); if (orders) orders.textContent = state.activeOrder ? "●" : "04";
    const archive = $("#nav-archive"); if (archive) archive.textContent = String(countLandmarks()).padStart(2, "0");
    const signal = $("#signal-quality"); if (signal) signal.textContent = state.route.length ? "ROUTING" : state.hull < 30 ? "WEAK" : "LOCAL";
    const distance = $("#distance-home"); if (distance) distance.textContent = String(hexDistance(state.pos, { q: 0, r: 0 }));
    const latest = $("#latest-log"); if (latest && state.logs.length) latest.textContent = state.logs[0].text;
  }
  function renderDynamic() {
    const routeStatus = $("#route-status");
    if (routeStatus) {
      routeStatus.textContent = state.route.length ? "移動中 · 残り " + state.route.length + " 六角 / 次の到着 " + Math.max(0, state.routeRemaining).toFixed(1) + " 秒" : "停車中 · 次の移動先を地図で選択";
    }
    const p = currentContractProgress();
    const bar = $("#active-order-bar");
    if (bar) bar.style.width = Math.floor(p.ratio * 100) + "%";
    const value = $("#active-order-value");
    if (value && state.activeOrder) value.textContent = fmt(p.value, 0) + " / " + fmt(state.activeOrder.spec.target, 0);
  }
  function setHeading(kicker, title, subtitle) {
    $("#view-kicker").innerHTML = kicker;
    $("#view-title").textContent = title;
    $("#view-subtitle").textContent = subtitle;
  }

  function renderWorld() {
    const oldViewport = $("#map-viewport");
    const oldLeft = oldViewport ? oldViewport.scrollLeft : null;
    const oldTop = oldViewport ? oldViewport.scrollTop : null;
    const selected = tileAt(state.selected);
    const activeKey = keyOf(state.pos.q, state.pos.r);
    const width = 1300, height = 780;
    let tileMarkup = "";
    const routeKeys = new Set(state.route);
    WORLD.forEach((tile) => {
      const point = svgPoint(tile.q, tile.r);
      const known = !!state.discovered[tile.key];
      const classes = ["tile", known ? "known" : "unknown"];
      if (tile.key === activeKey) classes.push("current");
      if (tile.key === state.selected) classes.push("selected");
      if (routeKeys.has(tile.key)) classes.push("route-target");
      const fill = known ? tile.zone.color : "#1a1d1b";
      const title = known ? tile.name + " / " + tile.zone.name : "未踏区画";
      const glyph = !known ? "·" : tile.key === activeKey ? "◆" : tile.site && !state.recovered[tile.key] ? "✦" : state.outposts[tile.key] ? "⌘" : tile.terrain === "glass" ? "⌁" : tile.terrain === "flood" ? "≈" : tile.terrain === "vent" ? "ϟ" : tile.terrain === "relay" ? "◉" : tile.terrain === "salt" ? "⁙" : "·";
      const label = tile.key === activeKey ? '<text class="tile-rover" x="' + point.x + '" y="' + (point.y + 1) + '">◆</text>' :
        tile.site && !state.recovered[tile.key] && known ? '<text class="tile-mark" x="' + point.x + '" y="' + (point.y + 1) + '">✦</text>' :
        '<text class="tile-glyph" x="' + point.x + '" y="' + (point.y + 1) + '">' + glyph + '</text>';
      tileMarkup += '<g class="' + classes.join(" ") + '" data-action="select-tile" data-key="' + tile.key + '" tabindex="' + (known ? "0" : "-1") + '" role="button" aria-label="' + title + '" style="--terrain:' + fill + '"><title>' + title + '</title><polygon points="' + hexPoints(point.x, point.y) + '"></polygon>' + label + '</g>';
    });
    const routePoints = [state.pos, ...state.route.map((k) => {
      const [q, r] = parseKey(k); return { q, r };
    })].map((p) => {
      const pt = svgPoint(p.q, p.r);
      return pt.x + "," + pt.y;
    }).join(" ");
    const svg = '<svg id="world-map" viewBox="0 0 ' + width + " " + height + '" role="group" aria-label="六角形の大陸踏査地図">' +
      '<ellipse class="map-coast" cx="650" cy="385" rx="615" ry="365"></ellipse>' +
      '<text class="map-region-label" x="165" y="330">PALE REACH</text><text class="map-region-label" x="475" y="210">RUST BELT</text><text class="map-region-label" x="895" y="320">GLASSWOOD</text><text class="map-region-label" x="740" y="610">SUNKEN WORKS</text>' +
      (state.route.length ? '<polyline class="map-route" points="' + routePoints + '"></polyline>' : "") + tileMarkup + '</svg>';
    const landmarkContacts = WORLD.filter((tile) => tile.landmark && state.discovered[tile.key]).length;
    const rates = productionRates();
    const targetKnown = state.discovered[state.selected];
    let inspector = "";
    if (!targetKnown) {
      inspector = '<div class="inspect-card selected-card"><div class="inspect-tag">NO SIGNAL</div><div class="inspector-placeholder"><div><b>地図の余白</b>走査パルスを放ち、<br>空白地形を記録する。</div></div><button class="action-button primary" data-action="scan" style="width:100%">⌁　広域走査　⌁ 8 電力</button></div>';
    } else {
      const tile = selected;
      const atLocation = tile.key === activeKey;
      const stoppedHere = atLocation && !state.route.length;
      const hazardText = ["安定", "軽度", "中程度", "重度", "極度"][tile.hazard];
      const outpost = state.outposts[tile.key];
      const siteDone = !!state.recovered[tile.key];
      let buttons = "";
      if (!atLocation) {
        const path = findRoute(activeKey, tile.key);
        const distance = path ? path.length : 0;
        const charge = distance * 1.3 * (activeModule("winch") ? .7 : 1);
        buttons += '<button class="action-button primary" data-action="travel" data-key="' + tile.key + '" ' + (path && state.resources.power >= charge && state.hull > 0 ? "" : "disabled") + '>⇢　航路を設定 <small>' + (path ? distance + "六角 · ϟ " + fmt(charge, 0) : "航路なし") + '</small></button>';
      }
      if (tile.site && !siteDone) {
        buttons += '<button class="action-button" data-action="recover" data-key="' + tile.key + '" ' + (stoppedHere ? "" : "disabled") + '>⌕　遺構を回収</button>';
      }
      if (!outpost && tile.key !== "0,0") {
        const canBuild = stoppedHere && state.resources.scrap >= 46 && state.resources.power >= 18;
        buttons += '<button class="action-button" data-action="build-outpost" data-key="' + tile.key + '" ' + (canBuild ? "" : "disabled") + '>⌘　前哨を設営</button>';
      } else if (outpost) {
        const cost = { scrap: Math.floor(48 * Math.pow(1.62, outpost.level - 1)), power: Math.floor(20 * Math.pow(1.45, outpost.level - 1)) };
        buttons += '<button class="action-button" data-action="upgrade-outpost" data-key="' + tile.key + '" ' + (afford(cost) ? "" : "disabled") + '>＋　前哨 LV.' + outpost.level + ' → ' + (outpost.level + 1) + '</button>';
      }
      const siteBody = tile.site ? (siteDone ? "回収記録あり。現地に残るのは空の殻だけだ。" : tile.site.story || "機材が灰の中に埋まっている。車列が到着すれば回収できる。") : tile.zone.desc;
      const yieldText = outpost ? "LV." + outpost.level + " · " + RESOURCE_META[tile.resource].label + " +" + round1((.22 + tile.richness * .12) * outpost.level * outputMultiplier()) + "/秒" : RESOURCE_META[tile.resource].label + "地形";
      const status = atLocation ? (state.route.length ? "航行中" : "現在地") : "既知区画";
      inspector = '<div class="inspect-card selected-card"><div class="inspect-tag">' + status + '　/　' + tile.zone.en + '</div><h2>' + tile.name + '</h2><div class="inspect-sub">' + tile.zone.name + ' · ' + tile.terrainName + '</div><p class="inspect-desc">' + siteBody + '</p><div class="tile-metrics"><div class="metric">資源地形<b>' + yieldText + '</b></div><div class="metric">汚染圧<b style="color:' + (tile.hazard >= 3 ? "var(--red)" : "var(--acid)") + '">' + hazardText + ' · ' + tile.hazard + '/4</b></div><div class="metric">地質品質<b>' + Math.round(tile.richness * 100) + '%</b></div><div class="metric">観測状態<b>' + (tile.landmark ? "固有遺構" : state.discovered[tile.key] ? "記録済" : "未踏") + '</b></div></div><div class="tile-actions">' + buttons + '</div></div>';
    }
    const bar = Math.min(100, state.hull);
    const active = state.activeOrder;
    const contractText = active ? faction(active.faction).name + " · " + esc(active.spec.title) : "依頼を受けると航行目標が表示される";
    const mapLayout = '<div class="map-layout"><section class="map-card"><div class="card-cap"><h2>外縁大陸 <span class="cap-code">MAP / 217 HEXES</span></h2><div class="world-summary"><span>記録 <b>' + countDiscovered() + '</b> / ' + WORLD.length + '</span><span>固有反応 <b>' + landmarkContacts + '</b> / ' + Object.keys(LANDMARKS).length + '</span></div></div><div class="map-viewport"><div class="map-coord">N 04° / SURVEY GRID 11-A</div>' + svg + '<div class="map-controls"><button class="map-control" data-action="map-center" title="現在地へ">⌖</button><button class="map-control" data-action="scan" title="広域走査">⌁</button></div></div><div class="map-foot"><div class="legend"><span><i class="legend-current"></i>灰線号</span><span><i class="legend-poi"></i>回収点</span><span><i></i>既知地形</span></div><span>クリックして区画を選択 / 経路は既知地形を自動接続</span></div></section><aside class="inspect-column">' + inspector +
      '<div class="inspect-card mini-card"><div class="mini-card-head"><span>車体耐久</span><b>' + Math.floor(state.hull) + '%</b></div><div class="progress-track"><i style="width:' + bar + '%;background:' + (bar < 35 ? "var(--red)" : "") + '"></i></div><div class="mini-note">' + (state.hull < 100 ? '<button class="mini-button" data-action="repair">補修　' + costLabel({ scrap: Math.ceil((100 - state.hull) * .42), power: Math.ceil((100 - state.hull) * .18) }) + '</button>' : "耐久損耗なし · 汚染圧は航行時に蓄積") + '</div></div>' +
      '<div class="inspect-card mini-card"><div class="mini-card-head"><span>受注中の運行票</span><b>' + (active ? "ACTIVE" : "—") + '</b></div><div id="active-order-value" class="mini-note" style="margin-top:7px">' + contractText + '</div><div class="progress-track"><i id="active-order-bar" style="width:' + (active ? Math.floor(currentContractProgress().ratio * 100) : 0) + '%"></i></div><div class="mini-note" id="route-status">' + (state.route.length ? "移動中 · 残り " + state.route.length + " 六角 / 次の到着 " + state.routeRemaining.toFixed(1) + " 秒" : "停車中 · 次の移動先を地図で選択") + '</div></div></aside></div>';
    $("#main-view").innerHTML = mapLayout;
    $("#main-view").dataset.renderedTab = "world";
    const viewport = $("#map-viewport");
    if (viewport && oldLeft !== null) {
      viewport.scrollLeft = oldLeft; viewport.scrollTop = oldTop;
    } else if (viewport) {
      const svgNode = $("#world-map");
      viewport.scrollLeft = Math.max(0, svgNode.clientWidth * CENTER.x / width - viewport.clientWidth / 2);
      viewport.scrollTop = Math.max(0, svgNode.clientHeight * CENTER.y / height - viewport.clientHeight / 2);
    }
  }

  function renderFleet() {
    const hull = Math.floor(state.hull);
    const moduleCards = MODULES.map((item) => {
      const owned = activeModule(item.id);
      const disabled = !owned && !afford(item.cost);
      return '<div class="module-row"><div class="module-info"><b>' + item.name + (owned ? ' <span class="tag ready">搭載済</span>' : "") + '</b><p>' + item.text + '</p></div><div class="module-cost">' + (owned ? '<span class="cost-line">INSTALLED</span>' : costLabel(item.cost) + '<button class="mini-button" data-action="buy-module" data-id="' + item.id + '" ' + (disabled ? "disabled" : "") + '>装備</button>') + '</div></div>';
    }).join("");
    $("#main-view").innerHTML = '<div class="view-grid"><section class="view-card"><div class="card-cap"><h2>装甲探査車　灰線号</h2><span class="cap-code">ASH-07 / FIELD CONFIGURATION</span></div><div class="view-card-pad"><p class="view-intro">走査機材と回収腕を積んだ六輪装甲車。移動中の燃料と汚染圧が、踏査可能な距離を決める。遠征中も前哨網は稼働を続ける。</p><div class="vehicle-art"><svg class="vehicle-svg" viewBox="0 0 500 170" aria-label="灰線号の車体図"><defs><linearGradient id="armor" x1="0" x2="0" y1="0" y2="1"><stop stop-color="#77765a"/><stop offset="1" stop-color="#34392e"/></linearGradient><linearGradient id="glass" x1="0" x2="1"><stop stop-color="#9bad8e"/><stop offset="1" stop-color="#4a6258"/></linearGradient></defs><path d="M66 110 L91 80 L155 72 L185 42 L326 45 L359 75 L414 83 L444 111 L435 125 L72 125 Z" fill="url(#armor)" stroke="#a1a07b" stroke-width="2"/><path d="M190 48 L222 22 L309 25 L331 50 Z" fill="#4c5141" stroke="#9a9c77" stroke-width="2"/><path d="M230 30 L268 29 L270 48 L213 48 Z M277 29 L305 30 L321 49 L277 48 Z" fill="url(#glass)" opacity=".9"/><path d="M98 83 L151 78 L169 89 L102 96 Z" fill="#b37856"/><path d="M357 81 L406 90 L420 106 L364 101 Z" fill="#54594a"/><path d="M84 112 L439 112" stroke="#161916" stroke-width="9"/><g fill="#171a17" stroke="#8d8f70" stroke-width="2"><circle cx="127" cy="124" r="17"/><circle cx="207" cy="124" r="17"/><circle cx="294" cy="124" r="17"/><circle cx="376" cy="124" r="17"/></g><g fill="#a8a37a"><circle cx="127" cy="124" r="5"/><circle cx="207" cy="124" r="5"/><circle cx="294" cy="124" r="5"/><circle cx="376" cy="124" r="5"/></g><path d="M278 24 L280 3 L285 3 L286 25" stroke="#a4a784" stroke-width="2"/><path d="M111 78 L94 54 L97 52 L124 79" stroke="#b5ad83" stroke-width="3"/><text x="248" y="101" fill="#d1d19a" font-family="IBM Plex Mono" font-size="10" letter-spacing="3">ASHLINE / 07</text><path d="M424 97 L454 93 L458 99 L434 105" fill="#a5a07b"/></svg></div><div class="vehicle-stats"><div class="stat-cell"><span>車体耐久</span><b style="color:' + (hull < 35 ? "var(--red)" : "var(--text)") + '">' + hull + '<em> / 100</em></b></div><div class="stat-cell"><span>汚染圧耐性</span><b>' + fmt(damageBuffer(), 0) + '<em> 軽減</em></b></div><div class="stat-cell"><span>航行速度</span><b>' + fmt(getStepTime(), 2) + '<em> 秒 / 六角</em></b></div></div><div class="section-title">搭載部品 <span>' + Object.keys(state.modules).length + " / " + MODULES.length + '</span></div><div class="module-list">' + moduleCards + '</div></div></section><aside class="inspect-column"><div class="inspect-card"><div class="inspect-tag">ROUTE STATUS</div><h2>航路計画</h2><p class="inspect-desc" id="route-status">' + (state.route.length ? "移動中 · 残り " + state.route.length + " 六角" : "停車中。大陸図で既知区画を選び、航路を設定する。") + '</p>' + (state.route.length ? '<button class="action-button danger" data-action="cancel-route">航行を中断</button>' : '<button class="action-button" data-action="switch-tab" data-tab="world">⌖　大陸図を開く</button>') + '</div><div class="inspect-card"><div class="inspect-tag">FIELD REPAIR</div><h2>現地補修</h2><p class="inspect-desc">車体耐久が0になると観測所まで曳航され、鉄屑の一部を失う。危険地形へ入る前に余裕を残す。</p><div class="tile-metrics"><div class="metric">耐久<b>' + hull + '%</b></div><div class="metric">修理回復量<b>' + (activeTech("fieldmed") ? 48 : 34) + ' pt</b></div></div><button class="action-button" data-action="repair" ' + (hull >= 100 || state.route.length ? "disabled" : "") + '>⌑　装甲を補修　' + (hull < 100 ? costLabel({ scrap: Math.ceil((100 - state.hull) * .42), power: Math.ceil((100 - state.hull) * .18) }) : "損耗なし") + '</button></div><div class="inspect-card"><div class="inspect-tag">PERFORMANCE</div><h2>産出レート</h2><div class="tile-metrics"><div class="metric">鉄屑<b>+' + round1(productionRates().scrap) + ' / 秒</b></div><div class="metric">電力<b>+' + round1(productionRates().power) + ' / 秒</b></div><div class="metric">測量<b>+' + round1(productionRates().data) + ' / 秒</b></div><div class="metric">前哨網<b>' + countOutposts() + ' 局</b></div></div><p class="mini-note">離席中も前哨網は最大8時間ぶん稼働する。</p></div></aside></div>';
  }

  function renderNetwork() {
    const entries = Object.values(state.outposts).sort((a, b) => {
      const ta = tileAt(a.key), tb = tileAt(b.key);
      return ta.zone.name.localeCompare(tb.zone.name, "ja");
    });
    const cards = entries.length ? entries.map((o) => {
      const tile = tileAt(o.key), rates = productionRates();
      const base = (.22 + tile.richness * .12) * o.level * outputMultiplier();
      const cost = { scrap: Math.floor(48 * Math.pow(1.62, o.level - 1)), power: Math.floor(20 * Math.pow(1.45, o.level - 1)) };
      return '<article class="outpost-card"><div class="outpost-symbol">' + (tile.resource === "scrap" ? "▰" : tile.resource === "power" ? "ϟ" : "⌁") + '</div><div><h3>' + tile.name + ' <span class="tag">LV.' + o.level + '</span></h3><p>' + tile.zone.name + ' / 品質 ' + Math.round(tile.richness * 100) + '% / 汚染 ' + tile.hazard + '</p></div><div style="text-align:right"><div class="outpost-yield">+' + round1(base) + ' ' + RESOURCE_META[tile.resource].label + '/秒</div><button class="mini-button" data-action="upgrade-outpost" data-key="' + o.key + '" ' + (afford(cost) ? "" : "disabled") + '>増設 ' + costLabel(cost) + '</button></div></article>';
    }).join("") : '<div class="empty-state"><b>前哨網は未設置</b>装甲車を資源地形に移動させ、現地調査の後に前哨基地を設営する。<br>その区画にいる間に出力が立ち上がる。</div>';
    const rates = productionRates();
    $("#main-view").innerHTML = '<div class="view-grid"><section class="view-card"><div class="card-cap"><h2>前哨網管理</h2><span class="cap-code">AUTONOMOUS EXTRACTION / ' + countOutposts() + ' ACTIVE</span></div><div class="view-card-pad"><p class="view-intro">灰線号を置き去りにしても、前哨基地はその場の資源を採り続ける。地形の産出品を見てから場所を決め、増設する。</p><div class="vehicle-stats"><div class="stat-cell"><span>鉄屑 / 秒</span><b>' + fmt(rates.scrap, 2) + '</b></div><div class="stat-cell"><span>電力 / 秒</span><b>' + fmt(rates.power, 2) + '</b></div><div class="stat-cell"><span>測量 / 秒</span><b>' + fmt(rates.data, 2) + '</b></div></div><div class="section-title">稼働局 <span>' + entries.length + ' LOCATIONS</span></div><div class="outpost-list">' + cards + '</div></div></section><aside class="inspect-column"><div class="inspect-card"><div class="inspect-tag">NETWORK RULE</div><h2>地形を選ぶ</h2><p class="inspect-desc">鉄屑・電力・測量はタイル固有の産出資源。品質が高い地形ほど毎秒の出力が増える。特定の資源だけを積み増さず、遠征コストと釣り合わせる。</p><div class="tile-metrics"><div class="metric">基本設営<b>▰ 46 / ϟ 18</b></div><div class="metric">初期出力<b>0.3〜0.5 / 秒</b></div></div><button class="action-button" data-action="switch-tab" data-tab="world">⌖　地図で次の場所を探す</button></div><div class="inspect-card"><div class="inspect-tag">INDUSTRIAL MULTIPLIER</div><h2>統合効率</h2><p class="inspect-desc">研究・車両部品・前回チャーターの記録は、前哨網全体の出力に乗算される。</p><div class="tile-metrics"><div class="metric">総合倍率<b>×' + fmt(outputMultiplier(), 2) + '</b></div><div class="metric">チャーター<b>' + state.meta.charters + ' 回</b></div></div></div></aside></div>';
  }

  function renderResearch() {
    const numTech = countTech();
    const remainingResearch = RESEARCH.filter((item) => !activeTech(item.id));
    const prerequisiteGap = remainingResearch.length ? Math.max(0, Math.min(...remainingResearch.map((item) => item.req)) - numTech) : 0;
    const groups = [...new Set(RESEARCH.map((t) => t.group))];
    let body = "";
    groups.forEach((group) => {
      body += '<div class="section-title">' + group + '<span>TECH TREE / ' + numTech + ' COMPLETED</span></div><div class="tech-list">';
      body += RESEARCH.filter((t) => t.group === group).map((item) => {
        const done = activeTech(item.id), locked = !done && numTech < item.req, canBuy = !done && !locked && afford(item.cost);
        return '<div class="tech-row"><div class="tech-info"><b>' + item.name + ' ' + (done ? '<span class="tag ready">実装済</span>' : locked ? '<span class="tag locked">前提 ' + item.req + ' 技術</span>' : "") + '</b><p>' + item.text + '</p></div><div class="tech-cost">' + (done ? '<span class="cost-line">ONLINE</span>' : '<span class="cost-line">' + costLabel(item.cost) + '</span><button class="mini-button" data-action="buy-tech" data-id="' + item.id + '" ' + (canBuy ? "" : "disabled") + '>研究を実装</button>') + '</div></div>';
      }).join("");
      body += "</div>";
    });
    $("#main-view").innerHTML = '<div class="view-grid"><section class="view-card"><div class="card-cap"><h2>現地技術局</h2><span class="cap-code">FIELD RESEARCH / ' + numTech + ' OF ' + RESEARCH.length + '</span></div><div class="view-card-pad"><p class="view-intro">技術はこのチャーターの前哨網と灰線号に実装される。管轄を返上すると基礎技術は解除されるが、発見済み地形と恒久記録は残る。</p>' + body + '</div></section><aside class="inspect-column"><div class="inspect-card"><div class="inspect-tag">RESEARCH INPUT</div><h2>観測データ</h2><p class="inspect-desc">地形の新規記録、走査パルス、現地回収から測量データが得られる。資源地形の前哨も測量出力を持つ。</p><div class="tile-metrics"><div class="metric">現在データ<b>⌁ ' + fmt(state.resources.data, 1) + '</b></div><div class="metric">基礎出力<b>+' + round1(productionRates().data) + ' / 秒</b></div><div class="metric">実装済技術<b>' + numTech + ' / ' + RESEARCH.length + '</b></div><div class="metric">次の前提条件<b>' + prerequisiteGap + ' 件</b></div></div></div><div class="inspect-card"><div class="inspect-tag">FIELD NOTE</div><h2>選択肢の代価</h2><p class="inspect-desc">早い走査は地図を開くが、電力を前哨増設から奪う。産業研究に寄せれば素材は早く貯まるが、外縁の遺構は汚染圧で車体を削る。</p></div></aside></div>';
  }

  function renderOrders() {
    const progress = currentContractProgress();
    let activeHtml = "";
    if (state.activeOrder) {
      const spec = state.activeOrder.spec || contractSpec(state.activeOrder.faction);
      const f = faction(state.activeOrder.faction);
      activeHtml = '<article class="order-card" style="--order-accent:' + f.color + '"><div><div class="order-faction">' + f.short + ' / TIER ' + String(spec.tier).padStart(2, "0") + ' / 受注中</div><h3>' + esc(spec.title) + '</h3><p>' + esc(spec.text) + '</p><div class="order-progress"><div class="mini-note">進行 <span id="active-order-value">' + fmt(progress.value, 0) + " / " + fmt(spec.target, 0) + '</span></div><div class="progress-track"><i id="active-order-bar" style="width:' + Math.floor(progress.ratio * 100) + '%"></i></div></div></div><div class="order-reward"><span class="reward-readout">◆ ' + spec.reward + ' 刻印</span>' + (progress.done ? '<button class="mini-button" data-action="claim-contract">報酬を受領</button>' : '<span class="tag">FIELD OPERATION</span>') + '</div></article>';
    }
    const cards = FACTIONS.map((f) => {
      const spec = contractSpec(f.id);
      const rep = state.rep[f.id] || 0;
      const blocked = !!state.activeOrder;
      const canTake = !blocked;
      return '<article class="order-card" style="--order-accent:' + f.color + '"><div><div class="order-faction">' + f.short + ' / TIER ' + String(spec.tier).padStart(2, "0") + '</div><h3>' + esc(spec.title) + '</h3><p>' + esc(spec.text) + '</p><div class="order-progress"><div class="mini-note">' + f.blurb + '</div></div></div><div class="order-reward"><span class="reward-readout">◆ ' + spec.reward + ' 刻印</span><button class="mini-button" data-action="take-contract" data-faction="' + f.id + '" ' + (canTake ? "" : "disabled") + '>依頼を受ける</button><span class="tag">評判 ' + rep + '</span></div></article>';
    }).join("");
    const factions = FACTIONS.map((f) => '<div class="faction-row" style="--faction-color:' + f.color + '"><div class="faction-row-head"><b>' + f.name + '</b><span>' + f.short + '</span></div><p>' + f.creed + '</p></div>').join("");
    $("#main-view").innerHTML = '<div class="view-grid"><section class="view-card"><div class="card-cap"><h2>現地依頼書</h2><span class="cap-code">CONTRACTS / CHOOSE ONE ACTIVE</span></div><div class="view-card-pad"><p class="view-intro">各勢力の依頼は同時にひとつだけ受けられる。条件と遠征距離を見比べてから署名する。報酬の刻印は再編後も残る。</p><div class="order-list">' + (activeHtml || "") + cards + '</div></div></section><aside class="inspect-column"><div class="inspect-card"><div class="inspect-tag">FOUR CLAIMS ON THE ROAD</div><h2>四つの勢力</h2><p class="inspect-desc">契約を重ねると評判が上がり、次の段階の運行票が開く。勢力ごとに要求する遠征の形が異なる。</p><div class="faction-summary">' + factions + '</div></div><div class="inspect-card"><div class="inspect-tag">CURRENT RESERVE</div><h2>刻印　◆ ' + fmt(state.resources.marks, 0) + '</h2><p class="inspect-desc">管轄返上のとき刻印の一部を恒久資産へ変換する。さらに、次のチャーターの初期出力が増える。</p><div class="tile-metrics"><div class="metric">全期間契約<b>' + state.career.contracts + ' 件</b></div><div class="metric">恒久刻印<b>' + fmt(state.meta.permanentMarks, 0) + ' ◆</b></div></div></div></aside></div>';
  }

  function renderArchive() {
    const charters = (state.career.archive || []).map((item) => '<article class="archive-entry"><div class="archive-date">' + new Date(item.time).toLocaleDateString("ja-JP") + '<br>CHARTER</div><div><h3>' + esc(item.title) + '</h3><p>' + esc(item.text) + '</p></div></article>').join("");
    const sites = WORLD.filter((t) => t.landmark && state.discovered[t.key]).map((t) => {
      const found = !!state.meta.landmarks[t.key];
      return '<article class="archive-entry"><div class="archive-date">' + t.zone.name + '<br>' + (found ? "回収済" : "地図記録") + '</div><div><h3>' + t.name + (found ? ' <span class="tag ready">RECOVERED</span>' : "") + '</h3><p>' + (found ? t.site.story : "固有遺構の反応を地図に記録した。現地で回収すれば、記録と刻印が追加される。") + '</p></div></article>';
    }).join("");
    const canReset = canRecharter();
    const requirementText = [
      "記録地形 " + countDiscovered() + " / 55",
      "遺構回収 " + countRecovered() + " / 8",
      "前哨建設 " + state.run.outpostsBuilt + " / 3",
      "所持刻印 " + fmt(state.resources.marks, 0) + " / 42"
    ].join("　·　");
    $("#main-view").innerHTML = '<div class="view-grid"><section class="view-card"><div class="card-cap"><h2>航海誌・大陸記録</h2><span class="cap-code">FIELD ARCHIVE / ' + countLandmarks() + ' UNIQUE RECORDS</span></div><div class="view-card-pad"><p class="view-intro">地図の外縁に同じ測量記号が繰り返される。遺構から回収した声と、チャーターごとの記録はこの航海誌に蓄積される。</p><div class="section-title">固有遺構と音声記録 <span>' + countLandmarks() + ' / ' + Object.keys(LANDMARKS).length + '</span></div><div class="archive-list">' + (sites || '<div class="empty-state"><b>まだ固有記録はない</b>地図を走査し、✦の反応点へ進む。</div>') + '</div><div class="section-title">管轄返上の履歴 <span>' + state.career.archive.length + ' CHARTERS</span></div><div class="archive-list">' + (charters || '<div class="empty-state">最初の管轄返上で航海誌に遠征記録が加わる。</div>') + '</div></div></section><aside class="inspect-column"><div class="inspect-card"><div class="inspect-tag">CUMULATIVE RECORD</div><h2>遠征記録</h2><div class="tile-metrics"><div class="metric">地形記録<b>' + state.career.tilesMapped + '区画</b></div><div class="metric">固有遺構<b>' + state.career.relics + '件</b></div><div class="metric">前哨建設<b>' + state.career.outpostsBuilt + '局</b></div><div class="metric">依頼完了<b>' + state.career.contracts + '件</b></div><div class="metric">経過時間<b>' + durationLabel(state.career.elapsed) + '</b></div><div class="metric">全記録<b>' + Object.keys(state.discovered).length + '区画</b></div></div></div><div class="recharter-box"><h3>管轄権を返上する</h3><p>前哨網・研究・車両部品・勢力評判を手放し、新しい遠征を開始する。地図、固有遺構の記録、航海誌、刻印の55%は引き継がれる。チャーターごとに全生産が5.5%増加。</p><p class="small-note">' + requirementText + '</p><button class="action-button ' + (canReset ? "primary" : "") + '" data-action="confirm-recharter" ' + (canReset ? "" : "disabled") + '>↻　新規チャーターを開始</button></div><div class="inspect-card"><div class="inspect-tag">SAVE ARCHIVE</div><h2>データ保管</h2><p class="inspect-desc">端末内記録をファイルへ書き出すか、別端末から読み込む。</p><button class="action-button" data-action="open-settings">記録庫を開く</button></div></aside></div>';
  }

  function render() {
    renderHeader();
    const nav = $$(".nav-item");
    nav.forEach((node) => node.classList.toggle("active", node.dataset.tab === state.tab));
    const tabs = {
      world: { kicker: "FIELD CARTOGRAPHY <span>///</span> SECTOR 01", title: "大陸踏査図", subtitle: "誰も所有していない土地が、まだ地図の外にある。", fn: renderWorld },
      fleet: { kicker: "MOBILE OPERATIONS <span>///</span> VEHICLE 07", title: "灰線号・運用", subtitle: "航行、汚染圧、搭載装備。遠征の限界は車体が決める。", fn: renderFleet },
      network: { kicker: "INDUSTRIAL NETWORK <span>///</span> AUTOMATED YIELDS", title: "前哨網管理", subtitle: "地形資源を読み、戻らなくても稼働する基地網を組む。", fn: renderNetwork },
      research: { kicker: "FIELD OFFICE <span>///</span> TECHNICAL BUREAU", title: "技術局", subtitle: "一度の開発で、地図の読み方と生産の仕組みが変わる。", fn: renderResearch },
      orders: { kicker: "FACTION RELATIONS <span>///</span> CONTRACT BOARD", title: "諸派閥との取引", subtitle: "どの仕事に遠征資源を割くか。依頼は同時にひとつだけ。", fn: renderOrders },
      archive: { kicker: "CUMULATIVE RECORD <span>///</span> CHARTER LOG", title: "航海誌", subtitle: "失われた場所の記録と、返上した管轄の履歴。", fn: renderArchive }
    };
    const view = tabs[state.tab] || tabs.world;
    setHeading(view.kicker, view.title, view.subtitle);
    $("#main-view").dataset.renderedTab = state.tab;
    view.fn();
  }

  function openModal(title, body) {
    $("#modal-title").textContent = title;
    $("#modal-body").innerHTML = body;
    const modal = $("#modal");
    if (modal.showModal) modal.showModal();
    else modal.setAttribute("open", "");
  }
  function closeModal() {
    const modal = $("#modal");
    if (modal.close) modal.close();
    else modal.removeAttribute("open");
  }
  function openSettings() {
    const data = JSON.stringify(state, null, 2);
    openModal("航海誌・データ保管", '<div class="modal-section"><h3>この端末の記録</h3><p class="modal-copy">進行状況は自動でこのブラウザーに保存されます。バックアップを書き出すと、端末を変えても遠征を続けられます。</p><div class="modal-actions"><button class="action-button primary" data-action="export-save">⇩　JSONを書き出す</button><button class="action-button" data-action="import-save">⇧　JSONを読み込む</button></div></div><div class="modal-section"><h3>記録の内容</h3><textarea class="modal-textarea" readonly spellcheck="false">' + data.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</textarea></div><p class="small-note">このファイルにはゲーム内セーブデータだけが含まれる。アカウント情報や個人情報は含まれない。</p><div class="modal-actions"><button class="mini-button" data-action="reset-save" style="border-color:#704333;color:#d28e75">全記録を初期化</button><button class="mini-button" data-action="close-modal">閉じる</button></div>');
  }
  function confirmRecharterModal() {
    const retained = "航海誌・" + countDiscovered() + "区画の地図・" + countLandmarks() + "件の固有記録・刻印の55%・全生産+5.5%";
    const lost = "前哨網・研究・車両部品・勢力評判・今回の所持資源";
    openModal("管轄権を返上する", '<div class="modal-section"><h3>引き継ぐ記録</h3><p class="modal-copy">' + retained + '</p></div><div class="modal-section"><h3>手放す設備</h3><p class="modal-copy danger-copy">' + lost + '</p></div><p class="modal-copy">第' + state.meta.charters + "次チャーターの記録を閉じ、第" + (state.meta.charters + 1) + "次遠征を開始する。返上後の取り消しはできない。</p><div class=\"modal-actions\"><button class=\"action-button danger\" data-action=\"recharter\">管轄権を返上</button><button class=\"action-button\" data-action=\"close-modal\">続行しない</button></div>");
  }
  function confirmResetModal() {
    openModal("ゲーム記録を初期化する", '<p class="modal-copy danger-copy">現在の地図、資源、研究、航海誌、全チャーターをこのブラウザーから削除する。書き出したバックアップがあれば、あとから読み戻せる。</p><div class="modal-actions"><button class="action-button danger" data-action="reset-save-confirm">すべて初期化</button><button class="action-button" data-action="close-modal">戻る</button></div>');
  }

  function exportSave() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ashline-atlas-charter-" + state.meta.charters + ".json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("航海誌のJSONを保存した。");
  }
  function importSave(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const loaded = normalizeState(JSON.parse(String(reader.result)));
        if (!loaded) throw new Error("invalid");
        state = loaded;
        save();
        closeModal();
        render();
        showToast("セーブデータを読み込んだ。");
      } catch (_) {
        showToast("記録を読めなかった。対応するJSONを選び直す。");
      }
    };
    reader.readAsText(file);
  }
  function resetSave() {
    localStorage.removeItem(SAVE_KEY);
    state = newState();
    lastTick = Date.now();
    save();
    closeModal();
    render();
    addLog("新しい航海誌を作成した。");
    showToast("初期記録を開始。");
  }

  function handleAction(target) {
    const button = target.closest("[data-action]");
    if (!button || button.disabled) return;
    const action = button.dataset.action;
    switch (action) {
      case "switch-tab": selectTab(button.dataset.tab); break;
      case "select-tile": setSelected(button.dataset.key); break;
      case "travel": startRoute(button.dataset.key); break;
      case "scan": scan(); break;
      case "recover": recoverSite(button.dataset.key); break;
      case "build-outpost": buildOutpost(button.dataset.key); break;
      case "upgrade-outpost": upgradeOutpost(button.dataset.key); break;
      case "repair": repair(); break;
      case "buy-tech": buyTech(button.dataset.id); break;
      case "buy-module": buyModule(button.dataset.id); break;
      case "take-contract": takeContract(button.dataset.faction); break;
      case "claim-contract": claimContract(); break;
      case "confirm-recharter": confirmRecharterModal(); break;
      case "recharter": closeModal(); recharter(); break;
      case "open-settings": openSettings(); break;
      case "close-modal": closeModal(); break;
      case "export-save": exportSave(); break;
      case "import-save": $("#import-file").click(); break;
      case "reset-save": confirmResetModal(); break;
      case "reset-save-confirm": resetSave(); break;
      case "cancel-route":
        state.route = []; state.routeRemaining = 0;
        addLog("航路を中断。灰線号は現在地に停車した。");
        save(); render(); break;
      case "map-center": {
        const viewport = $("#map-viewport"), svg = $("#world-map");
        const point = svgPoint(state.pos.q, state.pos.r);
        if (viewport && svg) {
          viewport.scrollTo({ left: Math.max(0, svg.clientWidth * point.x / 1300 - viewport.clientWidth / 2), top: Math.max(0, svg.clientHeight * point.y / 780 - viewport.clientHeight / 2), behavior: "smooth" });
        }
        break;
      }
      default: break;
    }
  }
  document.addEventListener("click", (event) => handleAction(event.target));
  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches(".tile[data-action='select-tile']")) {
      event.preventDefault();
      setSelected(event.target.dataset.key);
    }
    if (event.key === "Escape") closeModal();
  });
  $("#import-file").addEventListener("change", (event) => importSave(event.target.files && event.target.files[0]));
  $("#modal").addEventListener("click", (event) => { if (event.target === $("#modal")) closeModal(); });

  loadGame();
  if (state._offline) {
    const info = state._offline;
    delete state._offline;
    setTimeout(() => showToast("離席産出 " + durationLabel(info.seconds) + " · 鉄屑 +" + fmt(info.amounts.scrap) + " / 電力 +" + fmt(info.amounts.power)), 400);
  }
  render();
  window.setInterval(tick, 250);
  window.setInterval(save, 5000);
})();
