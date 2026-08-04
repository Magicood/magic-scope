import { type CSSProperties, Fragment, type ReactNode, useId } from 'react';
import type { Product, ProductVisualSpec } from '../data/types';

/* ============================================================================
 * ProductVisual —— 艺术化商品视觉(art-directed,无位图、无第三方、无 clip-art)。
 *
 * 每款商品 = 色场底 + 一个「一眼能认出的器物剪影」(内联 SVG) + 接触阴影 + 颗粒。
 * 剪影按商品逐个造型(花瓶有颈腹足、碗有口沿与碗壁、灯有罩杆座……),
 * 而不是共用抽象几何体 —— 这是本组件与上一版最大的差别。
 *
 * 上色约定:SVG 里**不写任何色值**,一律挂 class,由 shop.css 的 .pv-c-/.pv-f-/.pv-k-
 * 原语用 var(--pv-body/shade/…) + color-mix(in oklab) 派生高光暗部。
 * (stop-color / fill / stroke 走 CSS 才能吃 var();写成 presentation attribute 不生效。)
 * ========================================================================== */

export type VisualAspect = 'portrait' | 'square' | 'wide';

/** 器物母题 —— 决定画哪一件东西。与 visual.shape(粗分类)解耦。 */
type Motif =
  | 'vase'
  | 'carafe'
  | 'bowls'
  | 'lamp-table'
  | 'sconce'
  | 'lamp-floor'
  | 'throw'
  | 'cushion'
  | 'runner'
  | 'bookend'
  | 'tray'
  | 'candle';

/** 具名商品 → 专属母题(同一 shape 下的两款商品因此不会撞形)。 */
const MOTIF_BY_PRODUCT: Record<string, Motif> = {
  'duna-vase': 'vase',
  'meno-carafe': 'carafe',
  'orbe-bowls': 'bowls',
  'halo-lamp': 'lamp-table',
  'ledge-sconce': 'sconce',
  'mica-floor-lamp': 'lamp-floor',
  'field-throw': 'throw',
  'grain-cushion': 'cushion',
  'strata-runner': 'runner',
  'arc-bookend': 'bookend',
  'pausa-tray': 'tray',
  'node-candleholder': 'candle',
};

/** 兜底:后台新建的商品只有 shape,按 shape 取一个合理母题。 */
const MOTIF_BY_SHAPE: Record<ProductVisualSpec['shape'], Motif> = {
  sphere: 'lamp-table',
  arch: 'vase',
  cylinder: 'carafe',
  stack: 'bowls',
  roll: 'cushion',
  disc: 'tray',
};

/* ------------------------------- 渐变原语 -------------------------------- */

type GradKey =
  | 'turn'
  | 'turnDeep'
  | 'drop'
  | 'fall'
  | 'well'
  | 'occ'
  | 'cast'
  | 'orb'
  | 'metal'
  | 'glow'
  | 'wash'
  | 'sheen'
  | 'shadow'
  | 'spill'
  | 'wax';

type Stop = { o: number; c: string; a?: number };

const stopsOf = (list: Stop[]) =>
  list.map((s, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: 静态渐变色标,顺序即身份
    <stop key={i} offset={s.o} className={s.c} stopOpacity={s.a} />
  ));

const linear = (id: string, horizontal: boolean, list: Stop[]) => (
  <linearGradient id={id} x1="0" y1="0" x2={horizontal ? '1' : '0'} y2={horizontal ? '0' : '1'}>
    {stopsOf(list)}
  </linearGradient>
);

const radial = (id: string, cx: string, cy: string, r: string, list: Stop[]) => (
  <radialGradient id={id} cx={cx} cy={cy} r={r}>
    {stopsOf(list)}
  </radialGradient>
);

const GRADIENTS: Record<GradKey, (id: string) => ReactNode> = {
  /** 圆柱转折:左暗 → 高光偏左 → 右侧收深。所有回转体的体积主力。 */
  turn: (id) =>
    linear(id, true, [
      { o: 0, c: 'pv-c-shade' },
      { o: 0.13, c: 'pv-c-body' },
      { o: 0.38, c: 'pv-c-hi' },
      { o: 0.68, c: 'pv-c-body' },
      { o: 1, c: 'pv-c-deep' },
    ]),
  /** 金属/深色件(灯杆、底座)的回转渐变。 */
  turnDeep: (id) =>
    linear(id, true, [
      { o: 0, c: 'pv-c-deep' },
      { o: 0.18, c: 'pv-c-shade' },
      { o: 0.44, c: 'pv-c-lit' },
      { o: 0.74, c: 'pv-c-shade' },
      { o: 1, c: 'pv-c-deep' },
    ]),
  /** 平放面:远端(上)暗 → 近端(下)亮。 */
  drop: (id) =>
    linear(id, false, [
      { o: 0, c: 'pv-c-shade' },
      { o: 0.5, c: 'pv-c-body' },
      { o: 1, c: 'pv-c-hi' },
    ]),
  /** 立面:顶亮 → 底暗。 */
  fall: (id) =>
    linear(id, false, [
      { o: 0, c: 'pv-c-hi' },
      { o: 0.52, c: 'pv-c-body' },
      { o: 1, c: 'pv-c-shade' },
    ]),
  /** 凹面(碗内 / 盘心):后壁最深,近端回亮。 */
  well: (id) =>
    linear(id, false, [
      { o: 0, c: 'pv-c-deep' },
      { o: 0.42, c: 'pv-c-shade' },
      { o: 1, c: 'pv-c-body' },
    ]),
  /** 自遮挡:整形叠一层下沉暗部。 */
  occ: (id) =>
    linear(id, false, [
      { o: 0.42, c: 'pv-c-shade', a: 0 },
      { o: 1, c: 'pv-c-shade', a: 0.34 },
    ]),
  /** 投影带:上深下透(用于叠层之间的落影)。 */
  cast: (id) =>
    linear(id, false, [
      { o: 0, c: 'pv-c-shade', a: 0.4 },
      { o: 1, c: 'pv-c-shade', a: 0 },
    ]),
  /** 球体:左上受光。 */
  orb: (id) =>
    radial(id, '36%', '30%', '74%', [
      { o: 0, c: 'pv-c-spec' },
      { o: 0.34, c: 'pv-c-hi' },
      { o: 0.72, c: 'pv-c-body' },
      { o: 1, c: 'pv-c-shade' },
    ]),
  /** 金属:窄而硬的高光 + 二次反光。 */
  metal: (id) =>
    linear(id, true, [
      { o: 0, c: 'pv-c-deep' },
      { o: 0.1, c: 'pv-c-shade' },
      { o: 0.26, c: 'pv-c-body' },
      { o: 0.4, c: 'pv-c-spec' },
      { o: 0.52, c: 'pv-c-body' },
      { o: 0.74, c: 'pv-c-shade' },
      { o: 0.9, c: 'pv-c-lit' },
      { o: 1, c: 'pv-c-shade' },
    ]),
  /** 灯具暖光晕。 */
  glow: (id) =>
    radial(id, '50%', '50%', '50%', [
      { o: 0, c: 'pv-c-lit', a: 0.6 },
      { o: 0.44, c: 'pv-c-body', a: 0.3 },
      { o: 1, c: 'pv-c-body', a: 0 },
    ]),
  /** 壁灯洗墙:从灯体向上散开的间接光。 */
  wash: (id) =>
    radial(id, '50%', '100%', '110%', [
      { o: 0, c: 'pv-c-lume', a: 1 },
      { o: 0.42, c: 'pv-c-lume', a: 0.62 },
      { o: 0.78, c: 'pv-c-spec', a: 0.24 },
      { o: 1, c: 'pv-c-body', a: 0 },
    ]),
  /** 柔和高光斑。 */
  sheen: (id) =>
    radial(id, '50%', '50%', '50%', [
      { o: 0, c: 'pv-c-spec', a: 0.62 },
      { o: 1, c: 'pv-c-spec', a: 0 },
    ]),
  /** 局部接触阴影(SVG 内,用于多件组合)。 */
  shadow: (id) =>
    radial(id, '50%', '50%', '50%', [
      { o: 0, c: 'pv-c-shade', a: 0.44 },
      { o: 1, c: 'pv-c-shade', a: 0 },
    ]),
  /** 灯罩下沿 / LED 灯槽的光溢出。 */
  spill: (id) =>
    radial(id, '50%', '46%', '66%', [
      { o: 0, c: 'pv-c-lume', a: 0.95 },
      { o: 0.5, c: 'pv-c-spec', a: 0.5 },
      { o: 1, c: 'pv-c-body', a: 0 },
    ]),
  /** 蜡烛(比器物本体明显更浅)。 */
  wax: (id) =>
    linear(id, true, [
      { o: 0, c: 'pv-c-lit' },
      { o: 0.3, c: 'pv-c-wax' },
      { o: 0.66, c: 'pv-c-lit' },
      { o: 1, c: 'pv-c-shade' },
    ]),
};

/* ------------------------------- 造型工具 -------------------------------- */

/** 一只碗:外壁(含后口沿轮廓)+ 碗内凹面 + 近口沿高光。 */
const bowl = (u: string, cx: number, cy: number, rx: number, ry: number, depth: number) => {
  const fx = rx * 0.3;
  const by = cy + depth;
  const wall = [
    `M ${cx - rx} ${cy}`,
    `A ${rx} ${ry} 0 0 1 ${cx + rx} ${cy}`,
    `C ${cx + rx * 0.99} ${cy + depth * 0.56}, ${cx + rx * 0.58} ${by}, ${cx + fx} ${by}`,
    `L ${cx - fx} ${by}`,
    `C ${cx - rx * 0.58} ${by}, ${cx - rx * 0.99} ${cy + depth * 0.56}, ${cx - rx} ${cy}`,
    'Z',
  ].join(' ');
  return (
    <g>
      <path d={wall} fill={`url(#${u}-turn)`} />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${u}-well)`} />
      <path
        className="pv-k pv-k-hi"
        d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`}
        strokeWidth={ry * 0.26}
        opacity="0.5"
      />
    </g>
  );
};

/** 一叠折好的织物:左端是软的折边,上下沿微微起伏,右端是裁边。 */
const foldedPanel = (l: number, r: number, t: number, h: number) => {
  const rr = h / 2;
  const m = t + rr;
  const b = t + h;
  const q = l + (r - l) * 0.35;
  const w = (r - l) * 0.72;
  return [
    `M ${l + rr} ${t}`,
    `C ${q} ${t - 2.5}, ${l + w} ${t + 2.5}, ${r} ${t}`,
    `L ${r} ${b}`,
    `L ${l + rr} ${b}`,
    `C ${l + rr * 0.4} ${b}, ${l} ${m + rr * 0.6}, ${l} ${m}`,
    `C ${l} ${m - rr * 0.62}, ${l + rr * 0.38} ${t}, ${l + rr} ${t}`,
    'Z',
  ].join(' ');
};

/* --------------------------------- 母题 ---------------------------------- */

type Scene = { vb: string; g: GradKey[]; art: (u: string) => ReactNode };

const SCENES: Record<Motif, Scene> = {
  /* 花瓶:收口的颈 → 饱满的腹 → 稳的底,口沿外撇。 */
  vase: {
    vb: '0 0 80 124',
    g: ['turn', 'well', 'occ', 'sheen'],
    art: (u) => {
      const body =
        'M 27 122 L 53 122 C 61 116 69 100 70 79 C 71 58 62 46 54 38 C 50 34 49 30 49 22 C 49 16 50 12 52 8 L 28 8 C 30 12 31 16 31 22 C 31 30 30 34 26 38 C 18 46 9 58 10 79 C 11 100 19 116 27 122 Z';
      return (
        <>
          <path d={body} fill={`url(#${u}-turn)`} />
          <ellipse cx="24" cy="72" rx="8" ry="30" fill={`url(#${u}-sheen)`} opacity="0.5" />
          <path d={body} fill={`url(#${u}-occ)`} />
          <ellipse cx="40" cy="8" rx="12" ry="3.6" fill={`url(#${u}-well)`} />
          <path
            className="pv-k pv-k-hi"
            d="M 28 8 A 12 3.6 0 0 0 52 8"
            strokeWidth="1.4"
            opacity="0.6"
          />
          <path
            className="pv-k pv-k-shade pv-detail"
            d="M 12 92 C 26 97 54 97 68 92"
            strokeWidth="0.9"
            opacity="0.4"
          />
        </>
      );
    },
  },

  /* 水瓶:矮而圆的腹 + 短颈 + 从颈壁一路拉出去的倾倒口(和花瓶的高瘦剪影拉开)。 */
  carafe: {
    vb: '0 0 80 112',
    g: ['turn', 'well', 'occ', 'sheen'],
    art: (u) => {
      const body =
        'M 22 110 L 54 110 C 63 105 71 94 71 80 C 71 62 61 52 51 44 C 48 41 47 38 47 33 L 47 22 C 49 16 52 13 57 11 C 52 16 43 18.2 34 18.4 L 29 18.4 L 29 33 C 29 38 28 41 25 44 C 15 52 5 62 5 80 C 5 94 13 105 22 110 Z';
      return (
        <>
          <path d={body} fill={`url(#${u}-turn)`} />
          <ellipse cx="21" cy="78" rx="7" ry="17" fill={`url(#${u}-sheen)`} opacity="0.5" />
          <path d={body} fill={`url(#${u}-occ)`} />
          <path
            d="M 29 18.4 L 34 18.4 C 43 18.2 52 16 57 11 C 53 17 45 21 35 22 C 31 22 29 20.6 29 18.4 Z"
            fill={`url(#${u}-well)`}
          />
          <path
            className="pv-k pv-k-hi"
            d="M 30 20.6 C 38 22 47 19 55 12.5"
            strokeWidth="1.2"
            opacity="0.5"
          />
          <path
            className="pv-k pv-k-shade pv-detail"
            d="M 8 66 C 22 71 54 71 68 66"
            strokeWidth="0.9"
            opacity="0.18"
          />
        </>
      );
    },
  },

  /* 碗组:左边三只互相套叠(口沿层层收小),右边一只单独摆开露出碗壁弧线。 */
  bowls: {
    vb: '0 0 148 82',
    g: ['turn', 'well', 'shadow'],
    art: (u) => (
      <>
        <ellipse cx="40" cy="79" rx="34" ry="5" fill={`url(#${u}-shadow)`} />
        <ellipse cx="110" cy="79" rx="30" ry="5" fill={`url(#${u}-shadow)`} />
        {bowl(u, 40, 50, 34, 9.5, 30)}
        {bowl(u, 40, 41, 26, 7.2, 22)}
        {bowl(u, 40, 33, 19, 5.4, 16)}
        {bowl(u, 110, 48, 32, 9, 32)}
      </>
    ),
  },

  /* 台灯:乳白玻璃球 + 收腰颈 + 压重底座,球外一圈暖光。 */
  'lamp-table': {
    vb: '0 0 108 118',
    g: ['orb', 'turn', 'turnDeep', 'glow', 'sheen'],
    art: (u) => (
      <>
        <ellipse className="pv-glow" cx="54" cy="46" rx="58" ry="56" fill={`url(#${u}-glow)`} />
        <path d="M 46 70 L 62 70 L 64 94 L 44 94 Z" fill={`url(#${u}-turnDeep)`} />
        <path
          d="M 26 116 L 82 116 C 82 100 71 92 54 92 C 37 92 26 100 26 116 Z"
          fill={`url(#${u}-turnDeep)`}
        />
        <ellipse cx="54" cy="93" rx="28" ry="4" className="pv-f-deep" opacity="0.4" />
        <circle cx="54" cy="44" r="33" fill={`url(#${u}-orb)`} />
        <ellipse
          cx="41"
          cy="29"
          rx="9"
          ry="6.5"
          fill={`url(#${u}-sheen)`}
          transform="rotate(-24 41 29)"
        />
        <path
          className="pv-k pv-k-shade pv-detail"
          d="M 60 108 L 72 108"
          strokeWidth="2"
          opacity="0.35"
        />
      </>
    ),
  },

  /* 壁灯:一块挂在墙上的折板搁架,LED 藏在后翻边里把上方墙面洗亮 ——
     顶面做成后窄前宽的透视梯形,才不会读成"三条叠起来的板"。 */
  sconce: {
    vb: '0 0 132 116',
    g: ['turn', 'turnDeep', 'wash', 'spill', 'shadow'],
    art: (u) => (
      <>
        <filter id={`${u}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <g className="pv-glow">
          <path
            d="M 40 58 L 92 58 L 132 -4 L 0 -4 Z"
            fill={`url(#${u}-wash)`}
            filter={`url(#${u}-soft)`}
          />
          <ellipse
            cx="66"
            cy="54"
            rx="52"
            ry="26"
            fill={`url(#${u}-glow)`}
            filter={`url(#${u}-soft)`}
          />
          <rect x="38" y="52" width="56" height="5" rx="2.5" fill={`url(#${u}-spill)`} />
        </g>
        <ellipse cx="66" cy="90" rx="44" ry="8" fill={`url(#${u}-shadow)`} />
        <path d="M 38 57 L 94 57 L 94 65 L 38 65 Z" fill={`url(#${u}-turnDeep)`} />
        <path d="M 38 65 L 94 65 L 110 73 L 22 73 Z" className="pv-f-hi" />
        <path
          d="M 22 73 L 110 73 L 110 80 C 110 82.5 108 84 105.5 84 L 26.5 84 C 24 84 22 82.5 22 80 Z"
          fill={`url(#${u}-turn)`}
        />
        <path d="M 26 84 L 106 84 L 103 87.5 L 29 87.5 Z" className="pv-f-deep" opacity="0.6" />
        <path
          className="pv-k pv-k-hi pv-detail"
          d="M 24 74.2 L 108 74.2"
          strokeWidth="1.1"
          opacity="0.5"
        />
        <path
          className="pv-k pv-k-shade pv-detail"
          d="M 94 87 C 99 97 96 106 92 116"
          strokeWidth="1.8"
          opacity="0.4"
        />
      </>
    ),
  },

  /* 落地灯:亚麻柱状灯罩 + 细灯杆 + 橡木圆底座,罩下沿有光溢出。 */
  'lamp-floor': {
    vb: '0 0 96 168',
    g: ['turn', 'turnDeep', 'glow', 'spill'],
    art: (u) => (
      <>
        <ellipse className="pv-glow" cx="48" cy="64" rx="56" ry="70" fill={`url(#${u}-glow)`} />
        <rect x="44" y="108" width="8" height="46" rx="2" fill={`url(#${u}-turnDeep)`} />
        <ellipse cx="48" cy="160" rx="26" ry="6.5" className="pv-f-shade" />
        <ellipse cx="48" cy="156" rx="26" ry="6.5" fill={`url(#${u}-turn)`} />
        <path
          d="M 26 16 A 22 5 0 0 1 70 16 L 76 112 A 28 7 0 0 1 20 112 Z"
          fill={`url(#${u}-turn)`}
        />
        <ellipse cx="48" cy="16" rx="22" ry="5" className="pv-f-lit" />
        <ellipse cx="48" cy="112" rx="28" ry="7" className="pv-f-lit" />
        <ellipse className="pv-glow" cx="48" cy="112" rx="28" ry="7" fill={`url(#${u}-spill)`} />
        <path
          className="pv-k pv-k-shade pv-detail"
          d="M 33 21 L 29 110"
          strokeWidth="0.9"
          opacity="0.3"
        />
        <path
          className="pv-k pv-k-shade pv-detail"
          d="M 63 21 L 67 110"
          strokeWidth="0.9"
          opacity="0.3"
        />
        <path
          className="pv-k pv-k-hi pv-detail"
          d="M 48 22 L 48 111"
          strokeWidth="1.2"
          opacity="0.28"
        />
      </>
    ),
  },

  /* 毛毯:三折叠放(边缘是软的、不是直尺切出来的),再从顶层垂下一角披到前面 ——
     垂坠 + 波浪毛边 + 流苏,是"这是块布"而不是"一摞纸"的关键。 */
  throw: {
    vb: '0 0 134 110',
    g: ['fall', 'cast', 'occ', 'turn'],
    art: (u) => (
      <>
        <path d={foldedPanel(8, 118, 78, 28)} fill={`url(#${u}-fall)`} />
        <rect x="15" y="76" width="98" height="9" fill={`url(#${u}-cast)`} />
        <path d={foldedPanel(15, 113, 52, 26)} fill={`url(#${u}-fall)`} />
        <rect x="22" y="50" width="86" height="9" fill={`url(#${u}-cast)`} />
        <path
          d="M 35 26 C 60 21, 88 29, 108 25 L 108 52 L 35 52 C 26 52, 20 46, 20 39 C 20 32, 26 26, 35 26 Z"
          fill={`url(#${u}-fall)`}
        />
        <path
          d="M 93 25 C 108 30, 116 44, 115 60 C 114 74, 110 84, 106 94 C 100 93, 93 88, 91 82 C 97 66, 96 43, 93 25 Z"
          fill={`url(#${u}-turn)`}
        />
        <path
          className="pv-k pv-k-shade pv-detail"
          d="M 101 33 C 106 47, 106 66, 101 84 M 108 40 C 111 52, 110 66, 107 78"
          strokeWidth="1"
          opacity="0.26"
        />
        <path
          className="pv-k pv-k-shade pv-detail"
          d="M 94 96 L 93 102 M 98 96 L 98 103 M 102 97 L 102 103 M 106 96 L 107 102 M 110 92 L 111 98"
          strokeWidth="1.2"
          opacity="0.4"
        />
        <path
          className="pv-k pv-k-hi pv-detail"
          d="M 36 29 C 60 24.5, 86 32, 106 28.5"
          strokeWidth="1.2"
          opacity="0.4"
        />
        <path
          className="pv-k pv-k-hi pv-detail"
          d="M 12 82 C 9 88, 9 95, 13 100"
          strokeWidth="1.4"
          opacity="0.32"
        />
        <path
          className="pv-k pv-k-hi pv-detail"
          d="M 19 56 C 16 62, 16 69, 20 74"
          strokeWidth="1.4"
          opacity="0.3"
        />
      </>
    ),
  },

  /* 靠垫:四角收紧、四边外鼓的方枕 + 一圈明线,不是胶囊。 */
  cushion: {
    vb: '0 0 118 110',
    g: ['fall', 'occ', 'sheen'],
    art: (u) => {
      const shell =
        'M 18 24 C 44 12, 76 12, 100 24 C 110 46, 110 74, 100 96 C 76 106, 44 106, 18 96 C 8 74, 8 46, 18 24 Z';
      return (
        <>
          <path d={shell} fill={`url(#${u}-fall)`} />
          <ellipse
            cx="46"
            cy="42"
            rx="32"
            ry="23"
            fill={`url(#${u}-sheen)`}
            opacity="0.55"
            transform="rotate(-14 46 42)"
          />
          <path d={shell} fill={`url(#${u}-occ)`} />
          <path
            className="pv-k pv-k-hi"
            d="M 25 31 C 46 21, 73 21, 93 31 C 102 50, 102 71, 93 89 C 73 98, 46 98, 25 89 C 16 71, 16 50, 25 31 Z"
            strokeWidth="1.3"
            opacity="0.5"
          />
          <path
            className="pv-k pv-k-shade pv-detail"
            d="M 20 27 C 29 35, 35 40, 42 43 M 98 27 C 89 35, 83 40, 76 43 M 20 93 C 29 85, 35 80, 42 77 M 98 93 C 89 85, 83 80, 76 77"
            strokeWidth="1.1"
            opacity="0.3"
          />
          <path
            className="pv-k pv-k-shade pv-detail"
            d="M 26 36 C 38 46, 44 58, 43 70 M 92 36 C 80 46, 74 58, 75 70"
            strokeWidth="0.9"
            opacity="0.16"
          />
        </>
      );
    },
  },

  /* 桌旗:平铺的长条织物(近宽远窄),横向色阶条纹 + 近端流苏。 */
  runner: {
    vb: '0 0 150 70',
    g: ['drop'],
    art: (u) => {
      const cloth = 'M 8 57 C 42 62, 108 62, 142 57 L 121 19 C 100 16, 50 16, 29 19 Z';
      const fringe = Array.from({ length: 24 }, (_, i) => {
        const x = 11 + i * 5.6;
        return `M ${x} 53 L ${x - 0.5} 66`;
      }).join(' ');
      return (
        <>
          <path className="pv-k pv-k-shade" d={fringe} strokeWidth="1.2" opacity="0.42" />
          <clipPath id={`${u}-clip`}>
            <path d={cloth} />
          </clipPath>
          <path d={cloth} fill={`url(#${u}-drop)`} />
          <g clipPath={`url(#${u}-clip)`}>
            <path
              className="pv-f-hi"
              opacity="0.4"
              d="M 0 24 C 50 27, 100 27, 150 24 L 150 32 C 100 35, 50 35, 0 32 Z"
            />
            <path
              className="pv-f-shade"
              opacity="0.28"
              d="M 0 34 C 50 37, 100 37, 150 34 L 150 36.5 C 100 39.5, 50 39.5, 0 36.5 Z"
            />
            <path
              className="pv-f-hi"
              opacity="0.28"
              d="M 0 40 C 50 43, 100 43, 150 40 L 150 50 C 100 53, 50 53, 0 50 Z"
            />
            <path
              className="pv-f-shade"
              opacity="0.3"
              d="M 0 52 C 50 55, 100 55, 150 52 L 150 55 C 100 58, 50 58, 0 55 Z"
            />
            <path
              className="pv-k pv-k-shade pv-detail"
              d="M 0 21.5 C 50 24.5, 100 24.5, 150 21.5 M 0 37.8 C 50 40.8, 100 40.8, 150 37.8"
              strokeWidth="0.7"
              opacity="0.26"
            />
          </g>
          <path
            className="pv-k pv-k-hi"
            d="M 8 57 C 42 62, 108 62, 142 57"
            strokeWidth="1.8"
            opacity="0.42"
          />
        </>
      );
    },
  },

  /* 书立:四分之一圆的实心黄铜块 —— 直角落地、有厚度、有机加工高光。 */
  bookend: {
    vb: '0 0 118 100',
    g: ['metal', 'turnDeep', 'fall'],
    art: (u) => {
      const face = 'M 24 96 L 24 20 A 76 76 0 0 1 100 96 Z';
      return (
        <>
          <path d="M 36 88 L 36 12 A 76 76 0 0 1 112 88 Z" className="pv-f-deep" />
          <path
            d="M 24 20 A 76 76 0 0 1 100 96 L 112 88 A 76 76 0 0 0 36 12 Z"
            fill={`url(#${u}-fall)`}
          />
          <path d="M 24 20 L 36 12 L 36 88 L 24 96 Z" className="pv-f-lit" />
          <path d={face} fill={`url(#${u}-metal)`} />
          <clipPath id={`${u}-clip`}>
            <path d={face} />
          </clipPath>
          <g clipPath={`url(#${u}-clip)`}>
            <rect x="0" y="52" width="118" height="7" className="pv-f-hi" opacity="0.26" />
            <rect x="0" y="61" width="118" height="4" className="pv-f-deep" opacity="0.2" />
            <rect x="0" y="88" width="118" height="8" className="pv-f-deep" opacity="0.18" />
          </g>
          <path
            className="pv-k pv-k-spec"
            d="M 34.6 20.7 A 76 76 0 0 1 64.3 31.5"
            strokeWidth="2.4"
            opacity="0.65"
          />
          <path
            className="pv-k pv-k-spec pv-detail"
            d="M 25.2 22 L 25.2 92"
            strokeWidth="1.6"
            opacity="0.4"
          />
        </>
      );
    },
  },

  /* 托盘:浅口木碟 —— 外沿有壁厚、盘心是可见的凹面,不是一块饼。 */
  tray: {
    vb: '0 0 140 70',
    g: ['drop', 'well', 'sheen'],
    art: (u) => (
      <>
        <ellipse cx="70" cy="48" rx="64" ry="20" className="pv-f-shade" />
        <ellipse cx="70" cy="42" rx="64" ry="20" fill={`url(#${u}-drop)`} />
        <ellipse cx="70" cy="44.5" rx="52" ry="14" fill={`url(#${u}-well)`} />
        <ellipse cx="60" cy="48" rx="30" ry="7" fill={`url(#${u}-sheen)`} opacity="0.35" />
        <path
          className="pv-k pv-k-hi"
          d="M 6 42 A 64 20 0 0 0 134 42"
          strokeWidth="2"
          opacity="0.5"
        />
        <path
          className="pv-k pv-k-shade pv-detail"
          d="M 28 44 A 44 11 0 0 0 112 44 M 34 45 A 38 13 0 0 1 106 45 M 44 43.5 A 28 8 0 0 0 96 43.5"
          strokeWidth="0.8"
          opacity="0.26"
        />
      </>
    ),
  },

  /* 烛台:铸铝球体 + 打孔 + 一支细蜡烛,金属高光要硬。 */
  candle: {
    vb: '0 0 86 138',
    g: ['orb', 'wax', 'sheen'],
    art: (u) => (
      <>
        <circle cx="43" cy="104" r="32" fill={`url(#${u}-orb)`} />
        <ellipse cx="43" cy="75" rx="9.5" ry="3.2" className="pv-f-deep" />
        <path d="M 37 18 C 37 14, 49 14, 49 18 L 49 76 L 37 76 Z" fill={`url(#${u}-wax)`} />
        <path
          className="pv-k pv-k-deep"
          d="M 43 15 C 43 11, 42 9, 41 7"
          strokeWidth="1.6"
          opacity="0.7"
        />
        <ellipse
          cx="31"
          cy="90"
          rx="7"
          ry="10"
          fill={`url(#${u}-sheen)`}
          transform="rotate(-20 31 90)"
        />
        <path
          className="pv-k pv-k-hi pv-detail"
          d="M 16 111 A 30 15 0 0 0 70 111"
          strokeWidth="1.8"
          opacity="0.3"
        />
      </>
    ),
  },
};

/* ------------------------------- 组件本体 -------------------------------- */

export function ProductVisual({
  product,
  aspect = 'portrait',
  className,
}: {
  product: Product;
  aspect?: VisualAspect;
  className?: string;
}) {
  // useId 的原始值含非 ASCII 分隔符,清洗后才能安全放进 url(#id)
  const uid = `pv${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const { visual } = product;
  const motif = MOTIF_BY_PRODUCT[product.id] ?? MOTIF_BY_SHAPE[visual.shape];
  const scene = SCENES[motif];
  const luminous = product.category === 'lighting';

  /**
   * 配色不再取商品数据里写死的色值(那套暖米色是给旧设计定的,放进 Chromatic Grid
   * 里像另一个网站的图),改为**由所属品类色派生**:色场是品类色的极浅版、器物本体
   * 是品类色本身。于是商品图天然属于这套色彩系统,且换主题时跟着走。
   * 具体的 color-mix 配比在 shop.css 的 .pv[data-cat] 里,这里只负责挂 data-cat。
   */
  const style = {
    // shape 仍决定器物的形体比例;颜色交给 CSS 按品类派生
    '--pv-seed': visual.body,
  } as CSSProperties;

  return (
    <div
      className={['pv', `pv-${aspect}`, className].filter(Boolean).join(' ')}
      style={style}
      data-motif={motif}
      data-cat={product.category}
      data-luminous={luminous || undefined}
      role="img"
      aria-label={`${product.name} — ${product.tagline}`}
    >
      <div className="pv-floor" aria-hidden="true" />
      <div className="pv-form" aria-hidden="true">
        {/* 外层 div 已挂 role="img" + aria-label,SVG 自身对读屏隐藏即可 */}
        <svg
          className="pv-svg"
          viewBox={scene.vb}
          preserveAspectRatio="xMidYMax meet"
          focusable="false"
          aria-hidden="true"
          role="presentation"
        >
          <defs>
            {scene.g.map((key) => (
              <Fragment key={key}>{GRADIENTS[key](`${uid}-${key}`)}</Fragment>
            ))}
          </defs>
          {scene.art(uid)}
        </svg>
      </div>
      <div className="pv-grain" aria-hidden="true" />
    </div>
  );
}
