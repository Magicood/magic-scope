<!-- 本文件由 Claude Code 经 foundation-blueprint workflow(6 维并行探索 + 综合自检)生成,Magic 审定。
     配套:FOUNDATION.md(设计哲学/路线图)、CLAUDE.md(操作手册)。
     状态:地基蓝图 v0 —— 附录 A 的 17 项地基决策已于 2026-06-24 拍板定稿。-->

# DESIGN.md — magic-scope 设计语言架构 / 地基蓝图

> 本文件是 `magic-scope` 的**设计语言唯一权威**,与 `FOUNDATION.md`(项目背景 / 路线图)、`CLAUDE.md`(操作手册)三者构成开工前必读。
> 一句话定调:**唯一真相源是一份纯 TS 的「核心契约」对象;主题引擎把契约编译成一组 `--ms-*` CSS 变量,挂在 `<html>` 的 `data-*` 作用域上;一切变化(主题 / 配色 / 明暗 / 密度 / 动效强度 / 变体)都坍缩成「换一组变量值」或「改一个 `data-*` 属性」,组件零改动、零重渲染、可被 CSS 平滑过渡。**

---

## 1. 概述与设计哲学回顾

本架构是 `FOUNDATION.md`「设计哲学」9 条在工程层的兑现。整篇蓝图围绕五个支柱组织:

1. **可配置多主题引擎(核心)**:不锁色彩、配置驱动。一套核心契约派生一切配色 / 主题 / 变体 / 密度;「深色奥术 Arcane」是默认预设之一,而非唯一。
2. **核心契约(宪法)**:三层 token(primitive → semantic → component),semantic 层是一份固定形状的 TS 类型 `ThemeContract`,是「合法主题」的唯一判据;单向依赖由 lint / CI 强制。
3. **用满现代 Web 能力**:OKLCH、`color-mix()`、相对颜色语法、container queries、cascade layers、`@property`、View Transitions、scroll-driven animations、`@starting-style`、`svh/dvh`、`env(safe-area-*)`、`:has()`,全部带优雅降级。
4. **设备适配**:container queries 为默认、视口断点为例外;`clamp()` 流式派生排版与间距;触控命中区、密度、用户偏好媒体特性全覆盖。
5. **地基优先**:动效是一等公民,只动合成层属性、自研不 wrap;可访问性是不可逾越的底线(WCAG / APCA、键盘、ARIA、`prefers-reduced-motion`)。

**贯穿全篇的三条铁律(决定整套架构能否「可控」):**

- **单向依赖**:`component → semantic → primitive`,绝不反向、绝不跨层跳读。组件 CSS 里**只允许**出现 `var(--ms-color-*)` / `var(--ms-space-*)` / `var(--ms-radius-*)` / `var(--ms-dur-*)` 这类语义 / 系统变量,**禁止**出现 `--ms-arcane-500`(primitive 变量)或写死的 `#8B5CF6`。由 Biome 自定义规则 / 构建期 grep 闸强制。
- **契约即接口**:semantic 层是固定键名的 TS 类型。任何主题(预设或用户自定义)只要填满契约就「合法」,组件就能跑。
- **变量即开关**:所有变化最终都坍缩成「换一组 `--ms-*` 变量值」或「改一个 `data-ms-*` 属性」,而非换 class、换组件、换代码路径。

---

## 2. Token 三层架构与核心契约

### 2.1 三层模型与单向依赖

```
                ┌──────────────────────── 唯一真相源(纯 TS,无散落的颜色硬编码) ──────────────────────┐
  seed 输入      │  L1 primitive(原始调色板,魔法名)   L2 semantic(语义角色 = 核心契约)   L3 component(可选) │
  种子 / 刻度 ─▶ │  arcane.500 / void.900 / ember… ─▶   color.primary / color.bg / color.fg ─▶  button.bg  │
   (派生器)       │          ↑ 单向依赖                       ↑ 单向依赖(只引用 primitive)    ↑ 引用 semantic │
                └────────────────────────────────────────────────────────────────────────────────────────┘
                                              │ compileTheme()(构建期 or 运行期)
                                              ▼
        ┌───────────────────────────── 产物 ─────────────────────────────┐
        │  CSS:  [data-ms-theme="arcane"] { --ms-color-primary: …; … }    │
        │  TS :  themes.arcane(类型 = ThemeContract),供运行时切换使用    │
        └─────────────────────────────────────────────────────────────────┘
                                              │
                            组件只读 var(--ms-color-primary),永不读 primitive
```

| 层 | 职责 | 命名风格 | 允许引用 |
|---|---|---|---|
| **L1 primitive** | 客观、无语义的原子值:色阶(`arcane.50…950`)、间距 / 半径 / 字号刻度 | 纯魔法名 `arcane/ember/frost/void/moss/sun/danger` + 数字阶 | 无(最底层) |
| **L2 semantic** | 语义角色:`color.bg`/`color.fg`/`color.primary`…。**这层 = 核心契约。** | 标准角色名(对外零门槛) | 只能引用 primitive |
| **L3 component**(可选) | 组件私有 token:`button.bg`/`button.fgOnSolid`。仅当某槽位需脱离全局语义微调时才建 | `组件名.槽位` | 只能引用 semantic |

> **为什么 component 层可选**:大多数组件直接消费 semantic 即可。层级越少越可控,这是刻意的克制。

### 2.2 核心契约:`ThemeContract`(库的「宪法」)

契约故意保持小(MVP 约 24 个颜色角色),宁可让用户 / 派生器从少量种子补全,也不要一份 200 键的契约让自定义变成体力活。增删键 = 改契约 = 一次破坏性版本(major changeset)。

```ts
// packages/tokens/src/contract/contract.ts —— 整个库的宪法,增删键须慎重(major)
type ColorToken = string; // 任意 CSS 颜色;引擎在 compile 时落成 --ms-color-* 变量

export interface ThemeContract {
  meta: {
    name: string;                  // "arcane"(= data-ms-theme 的值,魔法名,唯一真相源)
    colorScheme: "light" | "dark"; // 影响 color-scheme CSS 属性与 UA 控件
    label?: string;                // 展示名 "深色奥术"
  };
  color: {
    // —— 表面 / 文字 ——
    bg: ColorToken;            surface: ColorToken;      surfaceRaised: ColorToken;
    fg: ColorToken;            fgMuted: ColorToken;      fgSubtle: ColorToken;
    // —— 边框 / 分隔 ——
    border: ColorToken;        borderStrong: ColorToken;
    // —— 主色族(3 态 + on 前景)——
    primary: ColorToken;       primaryHover: ColorToken; primaryActive: ColorToken; onPrimary: ColorToken;
    // —— 状态色族(各带 on 前景)——
    accent: ColorToken;        onAccent: ColorToken;
    info: ColorToken;          onInfo: ColorToken;
    success: ColorToken;       onSuccess: ColorToken;
    warning: ColorToken;       onWarning: ColorToken;
    danger: ColorToken;        onDanger: ColorToken;
    // —— 焦点 / 发光(魔法语义化入口)——
    focusRing: ColorToken;     glow: ColorToken;
  };
  dimension: {                 // 数值轴:不随明暗变,随密度(density)缩放
    radius: { sm: string; md: string; lg: string; full: string };
    space:  { "1": string; "2": string; "3": string; "4": string; "6": string; "8": string };
  };
  typography: { fontSans: string; fontDisplay: string; fontMono: string };
  motion: {                    // 动效契约接口(值由动效系统填,见 §6)
    durationFast: string; durationBase: string;
    easingStandard: string; easingEmphasized: string;
  };
}
```

配套运行时校验(派生产物与用户主题都过这一关,进 CI):

```ts
// packages/tokens/src/contract/roles.ts
export const COLOR_ROLES = [
  "bg","surface","surfaceRaised","fg","fgMuted","fgSubtle","border","borderStrong",
  "primary","primaryHover","primaryActive","onPrimary",
  "accent","onAccent","info","onInfo","success","onSuccess",
  "warning","onWarning","danger","onDanger","focusRing","glow",
] as const;
export type ColorRole = (typeof COLOR_ROLES)[number];

export function assertValidTheme(t: Partial<ThemeContract>): asserts t is ThemeContract {
  const missing = COLOR_ROLES.filter((r) => t.color?.[r] == null);
  if (missing.length) throw new Error(`[magic-scope] theme "${t.meta?.name}" 缺少角色: ${missing.join(", ")}`);
}
```

### 2.3 变量命名唯一映射(可逆)

token 路径 `color.primaryHover` ↔ 变量 `--ms-color-primary-hover`(camelCase → kebab,点 → `-`),由单点函数生成,保证可逆:

```ts
// packages/tokens/src/engine/varName.ts
const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
export const toVarName = (path: string) => "--ms-" + path.split(".").map(kebab).join("-");
// "color.primaryHover" -> "--ms-color-primary-hover"
```

---

## 3. 现代色彩系统(OKLCH + 派生 + 对比度保证 + 降级)

色彩系统是主题引擎的「化学层」:从最少的输入(一个 seed)程序化派生出感知均匀、对比度达标、可在 light/dark/多主题间一键切换的整套色阶与角色色。

### 3.1 色彩空间:OKLCH 为基准,hex 为降级

- **内部计算一律 OKLCH**:`L`(0~1,感知线性)、`C`(0~0.37 安全区)、`H`(0~360),统一保留 3 位小数。hex/sRGB 仅作 build 期产出的回退值,不参与派生。
- **每个 token 双值存储,纯 CSS 级联降级(无需 JS)**:

```css
:root { --ms-color-primary: #8B5CF6; }                      /* 老浏览器读这条 */
@supports (color: oklch(0% 0 0)) {
  :root { --ms-color-primary: oklch(0.606 0.224 295.5); }    /* 现代浏览器覆盖为 OKLCH(广色域)*/
}
```

> 先 hex、后 OKLCH + `@supports` 覆盖:不支持 `oklch()` 的浏览器丢弃无法解析的声明、自动落到先声明的 hex;支持的进入 `@supports` 覆盖。

### 3.2 从单一 seed 生成可访问色阶(50→950)

11 阶 `50 100 200 300 400 500 600 700 800 900 950`,**500 = seed 本体**。保留 seed 的 `H`,沿预设「目标 L 曲线」扫明度,`C` 受两端衰减包络约束并经 `clampChroma` 收进 sRGB:

```ts
// packages/tokens/src/generate/lightness-curve.ts —— L 曲线 / C 衰减是 TS+CSS 共用真相源
export const STEPS = [50,100,200,300,400,500,600,700,800,900,950] as const;
export type Step = (typeof STEPS)[number];
export const DEFAULT_L_CURVE: Record<Step, number> = {
  50: 0.971, 100: 0.936, 200: 0.885, 300: 0.808, 400: 0.704,
  500: 0.606, 600: 0.515, 700: 0.432, 800: 0.358, 900: 0.284, 950: 0.205,
};
```

```ts
// packages/tokens/src/generate/scale.ts(build-time 主路径,用 culori 做 OKLCH↔sRGB / gamut 映射)
import { oklch, formatHex, clampChroma, type Oklch } from 'culori';
import { STEPS, DEFAULT_L_CURVE, type Step } from './lightness-curve';

export function generateScale(opts: { seed: string; anchor?: Step; lCurve?: Record<Step, number>; chromaFalloff?: number; }) {
  const lCurve = opts.lCurve ?? DEFAULT_L_CURVE;
  const anchor = opts.anchor ?? 500;
  const falloff = opts.chromaFalloff ?? 0.85;
  const base = oklch(opts.seed)!;
  const h = base.h ?? 0, cAnchor = base.c, lAnchor = lCurve[anchor];
  return STEPS.map((step) => {
    const l = lCurve[step];
    // chroma 包络:离锚点明度越远(尤其向两端)chroma 越收敛,避免泛脏 / 死黑 / 溢色
    const dist = Math.abs(l - lAnchor) / Math.max(lAnchor, 1 - lAnchor);
    const cTarget = cAnchor * (1 - falloff * dist * dist);
    const m = clampChroma({ mode: 'oklch', l, c: cTarget, h }, 'oklch') as Oklch;
    const r = (n: number) => Math.round(n * 1000) / 1000;
    return { step, l: r(m.l), c: r(m.c ?? 0), h: r(m.h ?? h),
      oklch: `oklch(${r(m.l)} ${r(m.c ?? 0)} ${r(m.h ?? h)})`, hex: formatHex(m) };
  });
}
```

**三档派生优先级(级联自动选最高可用):**

| 档 | 机制 | 用途 |
|---|---|---|
| 1(最优) | 相对颜色语法 `oklch(from var(--seed) <L> calc(c * k) h)` | 用户运行时实时换色、无构建场景 |
| 2 | `color-mix(in oklch, seed, white/black k%)` | 相对语法不支持时的运行时退路(色相略不稳) |
| 3(地板) | build 期静态 hex 色阶 | 任何浏览器至少拿到正确近似 + 算好的对比前景 |

> **build-time TS 为主路径**(精确、可校验对比度);相对颜色语法 / color-mix 是运行时换色便捷路径。三档共用同一份 L 曲线 / C 衰减常量,保证观感一致。运行时 CSS 派生不做 gamut clamp,极端 seed 由浏览器裁。

### 3.3 light / dark 角色映射(同一 seed,不同取阶)

明暗差异**不在于换 seed,而在于取不同阶 + 不同对比方向**。映射写成纯数据,切主题 = 换映射表 + 换 palette,组件零改动:

| 角色 | dark 取阶 | light 取阶 | 说明 |
|---|---|---|---|
| `bg` / `surface.base` | `void.950` | `void.50` | 最底背景 |
| `surface` | `void.900` | `void.100` | 卡片 / 面板 |
| `surfaceRaised` | `void.800` | white / `void.50` | 浮层 / 抬升 |
| `border` | `void.700` | `void.200` | 常规分隔 |
| `borderStrong` | `void.500` | `void.400` | 强分隔 / 输入框 |
| `fg` / `text` | `void.50` | `void.900` | 主文字 |
| `fgMuted` | `void.200` | `void.600` | 次要文字 |
| `primary` | `arcane.500` | `arcane.600`(亮底更深保对比) | 主色 |
| `primaryHover` | `arcane.400`(发光感) | `arcane.500` | hover |
| `primaryActive` | `arcane.600` | `arcane.700` | active |
| `onPrimary` | 自动 ink/white(§3.4) | 自动 ink/white | 对比度求解 |
| `danger` | `danger.400` | `danger.600` | 状态色 light 普遍深 1 阶 |
| `focusRing` / `glow` | `arcane.400` | `arcane.500` | 发光基色 |

**核心原则**:dark 背景取色族暗端 / 文字取浅端,light 镜像翻转;品牌 / 状态色在 light 下普遍比 dark 深 1 阶以保对比。

### 3.4 对比度保证:WCAG 2.1(对外底线)+ APCA(内部调优)

- **WCAG 2.1 AA = 对外承诺 + CI 卡点**:生成期对每对「文字色 × 背景色」算对比比(4.5:1 正文 / 3:1 大字与 UI),不达标 build 失败。
- **APCA(Lc 值)= 内部选阶微调**:正文 Lc≥75、次要 Lc≥60、大字 / UI Lc≥45。
- **自动选前景(ink vs white)——Arcane「暗底实底用 ink、纯白不足」做成通用函数**:

```ts
export function pickForeground(bgHex: string, ink = '#0A0710', light = '#F2EEFB') {
  return apcaLc(ink, bgHex) >= apcaLc(light, bgHex) ? ink : light;
}
```

- **失败自愈**:某 seed 在某阶对比不达标时,生成器**自动加深 1 阶**(如 `primary` 600→700)而非报错卡死,并在 build log 标注。给用户「配一个色就开箱合规」的体验。`on*` 前景由对比度求解焊在派生层,用户无法配出不可读主题。

### 3.5 `@property` 让色彩可平滑动画

```css
@property --ms-color-primary { syntax: '<color>'; inherits: true; initial-value: #8B5CF6; }
```
注册后,主题 / 明暗切换时 `--ms-color-primary` 可被 `transition` 插值,无突兀跳变(衔接 §6 动效)。

---

## 4. 主题:定义 / 自定义 / 多主题 / 运行时切换

### 4.1 「深色奥术 Arcane」作为默认预设(非唯一)

引擎只认契约、不认 arcane;Arcane 是 `themes` map 里 `defaultTheme` 的那一员。既定色值用 OKLCH 表达并带 hex 对照:

```ts
// packages/tokens/src/themes/arcane.ts
export const arcane: ThemeContract = {
  meta: { name: "arcane", colorScheme: "dark", label: "深色奥术" },
  color: {
    bg:            "oklch(0.09 0.018 300)", // void.950  #0A0710
    surface:       "oklch(0.13 0.022 297)", // void.900  #13101C
    surfaceRaised: "oklch(0.17 0.026 295)", // void.800  #1C1828
    fg:            "oklch(0.96 0.012 300)", // void.50   #F2EEFB
    fgMuted:       "oklch(0.74 0.030 295)", // void.200  #A89FC4
    fgSubtle:      "oklch(0.56 0.040 295)", // void.500 提亮
    border:        "oklch(0.30 0.030 293)", // void.700  #2E2842
    borderStrong:  "oklch(0.48 0.045 293)", // void.500  #6B5C90
    primary:       "oklch(0.62 0.205 292)", // arcane.500 #8B5CF6
    primaryHover:  "oklch(0.72 0.175 290)", // arcane.400 #A78BFA(hover/发光/链接)
    primaryActive: "oklch(0.56 0.215 292)", // arcane.600 #7C3AED
    onPrimary:     "#0A0710",               // ink(暗底实底文字,纯白对比不足)
    accent:    "oklch(0.74 0.165 0)",   onAccent:  "#0A0710", // ember.400 #F472B6
    info:      "oklch(0.76 0.135 232)", onInfo:    "#0A0710", // frost.400 #38BDF8
    success:   "oklch(0.78 0.150 150)", onSuccess: "#0A0710", // moss
    warning:   "oklch(0.82 0.150 85)",  onWarning: "#0A0710", // sun
    danger:    "oklch(0.66 0.220 12)",  onDanger:  "#0A0710", // #F43F5E
    focusRing: "oklch(0.72 0.175 290)", glow: "oklch(0.72 0.175 290)", // arcane.400
  },
  dimension: {
    radius: { sm: "6px", md: "10px", lg: "16px", full: "9999px" },
    space:  { "1": "4px", "2": "8px", "3": "12px", "4": "16px", "6": "24px", "8": "32px" },
  },
  typography: {
    fontSans:    `"Inter", system-ui, sans-serif`,
    fontDisplay: `"Cinzel", "Inter", serif`,
    fontMono:    `"JetBrains Mono", ui-monospace, monospace`,
  },
  motion: { durationFast: "120ms", durationBase: "220ms",
    easingStandard: "cubic-bezier(0.2, 0, 0, 1)", easingEmphasized: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
};
```

Arcane 不写死整套色,而是作为生成体系的**首个实例**:`arcane#8B5CF6 / frost#38BDF8 / ember#F472B6 / danger#F43F5E` 等色族 seed 喂进 §3.2 生成器;`void` 中性带紫调阶(950=#0A0710 / 900=#13101C / 800=#1C1828 / 700=#2E2842 / 500=#6B5C90 / 200=#A89FC4 / 50=#F2EEFB)不靠 chroma falloff 自动生成(会发灰),用既定 7 阶作 `scaleOverrides` 硬锚、生成器在锚点间插值补全。既定色值已 WCAG 实测达标,纳入后成为**对比度回归基线**。

### 4.2 用户定义主题的两种方式

**方式 A:种子驱动(推荐,极省配置)**

```ts
import { deriveTheme } from "@magic-scope/tokens/derive";
const ocean = deriveTheme({
  name: "ocean", colorScheme: "dark",
  seed: { primary: "#0EA5E9", accent: "#22D3EE", neutral: "#0B1220" }, // accent 默认 = primary 旋转色相
  extraScales: { brand2: "#F59E0B" },                                  // 多色主题:每族补 hover/active/on
});
```

派生器定义输入 / 输出契约与挂载钩子,具体色彩数学交给 §3:派生只补颜色(`dimension/typography/motion` 用默认),`on*` 前景由对比度在 ink 与 white 间求解;派生产物 = 普通 `ThemeContract`,走同一条 `compileTheme → inject` 管线,与手写主题在引擎眼里无差别。

**方式 B:完整契约对象(精控,可部分覆盖预设)**

```ts
export const emerald: ThemeContract = {
  ...arcane,
  meta: { name: "emerald", colorScheme: "dark", label: "翡翠" },
  color: {
    ...arcane.color,
    primary: "oklch(0.72 0.17 158)", primaryHover: "oklch(0.80 0.15 158)",
    primaryActive: "oklch(0.64 0.18 158)", onPrimary: "#04140C",
    focusRing: "oklch(0.80 0.15 158)", glow: "oklch(0.80 0.15 158)",
    // bg/surface/fg/border 全继承 arcane → 换主色不换骨架
  },
};
```

> 多色主题 = 多填几个语义族(`primary/accent/info/...`)或走 `extraScales`,**契约不为无限色族买单**。

### 4.3 多主题共存与正交轴

主题(theme)× 明暗(scheme)× 密度(density)× 动效(motion)是**四条正交轴**,各占一个 `data-*` 属性,组合不爆炸。页面任意子树可独立挂主题:

```html
<body data-ms-theme="arcane" data-ms-scheme="dark" data-ms-density="comfortable" data-ms-motion="full">
  <aside data-ms-theme="emerald"> …这块用翡翠主题… </aside>
</body>
```

```css
@layer ms.theme {
  [data-ms-theme="arcane"] {
    color-scheme: dark;
    --ms-color-bg: oklch(0.09 0.018 300);
    --ms-color-primary: oklch(0.62 0.205 292);
    --ms-color-primary-hover: oklch(0.72 0.175 290);
    --ms-color-on-primary: #0A0710;
    --ms-color-focus-ring: oklch(0.72 0.175 290);
    /* …全部角色… */
  }
  [data-ms-theme="emerald"] { /* 同名变量,不同值 */ }
  [data-ms-theme="arcane"][data-ms-scheme="light"] { /* arcane-light 的变量 */ }
}
```

> **为何 data-attribute 而非 class**:① 正交轴各占一属性,组合不靠字符串拼接易错;② 属性选择器优先级低且稳定,配合 cascade layers 不压过用户;③ `dataset` API 切换无拼接,SSR 友好(服务端直接渲染 `data-ms-*` 无闪烁)。

---

## 5. 设备适配与响应式

> 立场:**组件级响应式(container queries)是默认,视口断点是例外**;一切尺寸 / 间距 / 排版由 `clamp()` 流式派生,断点只用于「布局重排」而非「逐档微调」。

### 5.1 双层断点(命名不复用,杜绝混淆)

| 用途 | 命名 | 含义 | 何时用 |
|---|---|---|---|
| 容器断点(默认) | `--ms-cq-*` | 组件自身可用宽度 | 组件内部所有响应式重排 |
| 视口断点(例外) | `--ms-bp-*` | viewport 宽度 | 仅页面级骨架、`matchMedia` |

魔法名为唯一真相源(`sigil→rune→ward→glyph→arc→vault`),标准别名(`xs..2xl`)为对外薄层:

```css
@layer ms.tokens {
  :where(:root) {
    --ms-bp-sigil: 30rem; --ms-bp-rune: 48rem; --ms-bp-ward: 64rem;
    --ms-bp-glyph: 80rem; --ms-bp-arc: 96rem;  --ms-bp-vault: 120rem;
    --ms-bp-xs: var(--ms-bp-sigil); --ms-bp-sm: var(--ms-bp-rune); --ms-bp-md: var(--ms-bp-ward);
    --ms-bp-lg: var(--ms-bp-glyph); --ms-bp-xl: var(--ms-bp-arc); --ms-bp-2xl: var(--ms-bp-vault);
    --ms-cq-sigil: 18rem; --ms-cq-rune: 28rem; --ms-cq-ward: 40rem; --ms-cq-glyph: 56rem;
  }
}
```

> 媒体查询里 `var()` 不生效。约定:组件源码用 `@custom-media`(PostCSS preset-env)或构建期常量展开,运行时只把 `--ms-bp-*` 暴露给 JS(`matchMedia`)与 container 上下文。

### 5.2 container queries 是默认

```css
@layer ms.components {
  .ms-card {
    container-type: inline-size; container-name: ms-card;
    display: grid; gap: var(--ms-space-3);
  }
  @container ms-card (inline-size >= 28rem) {  /* 与视口无关,放窄侧栏 / 宽主区都自适应 */
    .ms-card__body { grid-template-columns: var(--ms-card-media-w, 12rem) 1fr; align-items: center; }
    .ms-card__title { font-size: clamp(var(--ms-type-step-1), 4cqi, var(--ms-type-step-3)); }
  }
}
```

React 侧提供 `useContainerQuery`(基于 `ResizeObserver`,SSR 快照固定 false 避免 hydration 抖动),但**强调 CSS 优先**,JS 仅用于必须按尺寸切换 DOM / 逻辑的场景。

### 5.3 流式排版与间距(`clamp()`)

不做「每断点一套字号」,而是一条连续曲线。`clamp` 系数由 `gen-clamp.ts` 按 min/max viewport 计算生成、不手写:

```ts
// packages/tokens/src/scripts/gen-clamp.ts
export function fluidClamp(minRem: number, maxRem: number, minVw = 320, maxVw = 1920): string {
  const slope = (maxRem - minRem) / (maxVw / 16 - minVw / 16);
  const interceptRem = minRem - slope * (minVw / 16);
  return `clamp(${minRem}rem, ${+interceptRem.toFixed(3)}rem + ${+(slope * 100).toFixed(2)}vw, ${maxRem}rem)`;
}
```

```css
@layer ms.tokens {
  :where(:root) {
    --ms-type-ratio: 1.2; --ms-type-base: 1rem;
    --ms-type-step-0: clamp(1rem,    0.95rem + 0.25vw, 1.125rem);
    --ms-type-step-1: clamp(1.2rem,  1.12rem + 0.40vw, 1.40rem);
    --ms-type-step-2: clamp(1.44rem, 1.30rem + 0.70vw, 1.80rem);
    --ms-type-step-3: clamp(1.728rem,1.50rem + 1.10vw, 2.40rem);
    --ms-text-body: var(--ms-type-step-0); --ms-text-h2: var(--ms-type-step-3);
    --ms-space-section: clamp(2rem, 1.2rem + 4vw, 6rem);
  }
}
```

### 5.4 触控与指针

`--ms-target-min` 默认 44px(WCAG 2.5.5 / Apple HIG),粗指针下抬到 48px(Material)。视觉可紧凑,但用隐形伪元素把命中区补足 `--ms-target-min`,密度缩放也不退化触控:

```css
@layer ms.tokens { :where(:root) { --ms-target-min: 2.75rem; } }      /* 44px */
@media (pointer: coarse) { :where(:root) { --ms-target-min: 3rem; } } /* 48px */

.ms-icon-button { inline-size: var(--ms-control-size, 2rem); block-size: var(--ms-control-size, 2rem); position: relative; }
.ms-icon-button::before {
  content: ""; position: absolute; inset: 50%;
  inline-size: max(100%, var(--ms-target-min)); block-size: max(100%, var(--ms-target-min));
  translate: -50% -50%;
}
```

hover / glow 一律包在 `@media (hover: hover) and (pointer: fine)`,触屏改 `:active` 按压反馈,避免「粘滞 hover」。

### 5.5 高 DPI / 安全区 / 视口单位

```css
@layer ms.tokens {
  :where(:root) {
    --ms-viewport-h: 100vh;          /* 兜底 */
    --ms-safe-top: env(safe-area-inset-top, 0px); --ms-safe-bottom: env(safe-area-inset-bottom, 0px);
    --ms-safe-left: env(safe-area-inset-left, 0px); --ms-safe-right: env(safe-area-inset-right, 0px);
    --ms-hairline: max(1px, 0.0625rem);
  }
  @supports (height: 100svh) {
    :where(:root) { --ms-viewport-h: 100dvh; --ms-viewport-h-stable: 100svh; --ms-viewport-h-large: 100lvh; }
  }
}
@media (min-resolution: 2dppx) { :where(:root) { --ms-hairline: 0.5px; } }
/* 容器内边距取 max(设计内边距, 安全区),刘海 / 灵动岛 / Home 条不遮挡(需 viewport-fit=cover)*/
.ms-sheet--bottom { padding-block-end: max(var(--ms-space-4), var(--ms-safe-bottom)); }
```

### 5.6 密度(comfortable / compact / spacious 一键切)

单因子缩放:一个 `--ms-density-scale` + 控件尺寸 token,经 `[data-ms-density]` 一键切,落 `ms.density` layer(晚于 tokens,可覆盖基础间距而不动 token):

```css
@layer ms.density {
  :where([data-ms-density="comfortable"], :root) { --ms-density-scale: 1;     --ms-control-h: 2.75rem; }
  [data-ms-density="compact"]                    { --ms-density-scale: 0.85;  --ms-control-h: 2.25rem; }
  [data-ms-density="spacious"]                   { --ms-density-scale: 1.15;  --ms-control-h: 3.25rem; }
  :where(:root) {
    --ms-space-d-3: calc(var(--ms-space-3) * var(--ms-density-scale));
    --ms-space-d-4: calc(var(--ms-space-4) * var(--ms-density-scale));
  }
}
```

> 约束:密度缩放**不缩小命中区**,compact 下控件命中区仍 ≥ `--ms-target-min`(用 §5.4 隐形扩展)。

### 5.7 用户偏好媒体特性

统一原则:**默认值在 token 层 → `prefers-*` 在媒体层覆盖 → 用户显式开关(`data-ms-*`)落 `ms.overrides` 可强制压过系统**。

| 偏好 | 接法 |
|---|---|
| `prefers-color-scheme`(dark 默认) | `color-scheme: dark` 默认;`@media (prefers-color-scheme: light) :root:not([data-ms-theme])` 切 light;`[data-ms-scheme]` 用户覆盖 |
| `prefers-reduced-motion` | 改 `--ms-motion-scale`(见 §6.5);View Transitions 在 reduce 下禁用 `::view-transition-*` 动画 |
| `prefers-contrast: more` | 加粗 `--ms-hairline`、关 glow 改实边框、提高 border/text 对比;同时声明 `forced-colors`(WHCM)用系统色兜底 |
| `prefers-reduced-data` | `--ms-decor-enabled: 0` 跳过背景符文 / 噪点贴图,顺带降动效省 CPU |

---

## 6. 动效系统

> 动效是一等公民、自研不 wrap、只动合成层属性、一键切强度、核心契约派生一切。命名双轨:底层 token / keyframes / 内部 API 用魔法名(`cast`/`conjure`/`sigil`/`shimmer`/`glow`)且为唯一真相源;React 原语对外用标准名(`<Reveal>`/`<Skeleton>`)+ 魔法别名(`<Conjure>`/`<Shimmer>`)opt-in。

### 6.1 动效 token(唯一真相源 + CSS 映射)

```ts
// packages/tokens/src/motion/tokens.ts —— 唯一真相源
export const duration = {
  instant: 0, swift: 80, quick: 140, base: 220, smooth: 320, flow: 480, epic: 720,
} as const;
export const easing = {
  linear: 'linear',
  standard:   'cubic-bezier(0.2, 0, 0, 1)',       // 通用进出
  decelerate: 'cubic-bezier(0, 0, 0, 1)',         // 入场(缓出落定)
  accelerate: 'cubic-bezier(0.3, 0, 1, 1)',       // 离场(缓入抽离)
  cast:       'cubic-bezier(0.34, 1.56, 0.64, 1)',// 施法弹出(轻 overshoot)
  castSoft:   'cubic-bezier(0.22, 1.2, 0.36, 1)',
  castHard:   'cubic-bezier(0.5, 1.8, 0.5, 1)',   // 戏剧化(modal/toast)
  anticipate: 'cubic-bezier(0.7, -0.4, 0.4, 1.4)',// 蓄力施法(先回拉再弹出)
} as const;
export const spring = {                            // 预留给 WAAPI / core 内核物理求解
  gentle: { stiffness: 170, damping: 26, mass: 1 },
  snappy: { stiffness: 320, damping: 30, mass: 1 },
  bouncy: { stiffness: 280, damping: 14, mass: 1 },
} as const;
```

```css
@layer ms.motion {
  :root {
    --ms-dur-instant: 0ms; --ms-dur-swift: 80ms; --ms-dur-quick: 140ms; --ms-dur-base: 220ms;
    --ms-dur-smooth: 320ms; --ms-dur-flow: 480ms; --ms-dur-epic: 720ms;
    --ms-ease-standard: cubic-bezier(0.2,0,0,1); --ms-ease-decelerate: cubic-bezier(0,0,0,1);
    --ms-ease-accelerate: cubic-bezier(0.3,0,1,1); --ms-ease-cast: cubic-bezier(0.34,1.56,0.64,1);
    --ms-ease-cast-soft: cubic-bezier(0.22,1.2,0.36,1); --ms-ease-cast-hard: cubic-bezier(0.5,1.8,0.5,1);
    --ms-motion-scale: 1;  /* 强度总闸(见 §6.5)*/
  }
}
```

> **关键设计**:组件不写死时长,统一写 `calc(var(--ms-dur-base) * var(--ms-motion-scale))`。强度档调 `--ms-motion-scale` 即可全库一键变速 / 静默,无需改组件。

### 6.2 统一 transition 约定(每个状态都有完整过渡)

按状态语义提供过渡配方,组件按需引用而非各写各的:

```ts
export const transitionRecipe = {
  interactive: { props: ['color','background-color','border-color','box-shadow','--ms-glow'], duration: 'quick',  easing: 'standard' },
  press:       { props: ['transform','box-shadow'],                                           duration: 'swift',  easing: 'cast-soft' },
  disabled:    { props: ['opacity','filter'],                                                  duration: 'base',   easing: 'standard' },
  reveal:      { props: ['opacity','transform','clip-path'],                                   duration: 'smooth', easing: 'decelerate' },
  theme:       { props: ['color','background-color','border-color'],                           duration: 'epic',   easing: 'standard' },
} as const;
```

```css
.ms-button {
  transition:
    background-color calc(var(--ms-dur-quick) * var(--ms-motion-scale)) var(--ms-ease-standard),
    box-shadow       calc(var(--ms-dur-quick) * var(--ms-motion-scale)) var(--ms-ease-standard),
    transform        calc(var(--ms-dur-swift) * var(--ms-motion-scale)) var(--ms-ease-cast-soft);
}
.ms-button:hover  { background-color: var(--ms-color-primary-hover); --ms-glow: 24px; }
.ms-button:focus-visible { box-shadow: 0 0 0 3px var(--ms-color-focus-ring); } /* 焦点环用 box-shadow(可过渡可发光)*/
.ms-button:active { transform: scale(0.97); will-change: transform; }          /* 按压用 transform,合成层不触发 layout */
.ms-button:disabled { opacity: 0.5; filter: saturate(0.6); pointer-events: none; }
.ms-button { box-shadow: 0 0 var(--ms-glow, 0px) var(--ms-color-glow); }        /* glow 半径经 @property 平滑补间 */
```

### 6.3 性能纪律(合成层 only,写进 lint / review checklist)

1. **动画属性白名单**:只允许补间 `transform` / `opacity` / `filter` 及 `@property` 注册的自定义属性(`--ms-glow` / `--ms-angle`)。**禁止**补间 `width`/`height`/`top/left`/`margin`/`padding` 的尺寸抖动(改用 `transform: scale()` + `clip-path`)。
2. **`will-change` 克制**:绝不在静止态全局挂;只在「即将动 / 正在动」的瞬时态挂,动画结束移除。
3. **入场用 `@starting-style`** 做「从无到有」初始值,避免 JS 挂 class 的额外 reflow。
4. **大列表用 `content-visibility: auto`** + scroll-driven(§6.4)而非 IntersectionObserver + 手动 class。

### 6.4 用满现代 Web 能力

**View Transitions**(主题切换 / 路由 / 列表 FLIP):

```css
@layer ms.motion {
  ::view-transition-old(root) { animation: ms-dissolve-out var(--ms-dur-epic) var(--ms-ease-accelerate) both; }
  ::view-transition-new(root) { animation: ms-conjure-in   var(--ms-dur-epic) var(--ms-ease-decelerate) both; }
}
```

**scroll-driven animations**(纯 CSS,零 JS,在合成器线程):

```css
@layer ms.motion {
  @supports (animation-timeline: view()) {
    .ms-reveal-on-scroll { animation: ms-conjure-in linear both; animation-timeline: view(); animation-range: entry 0% entry 60%; }
    .ms-scroll-progress  { transform-origin: left; animation: ms-scalex linear both; animation-timeline: scroll(root block); }
  }
}
```

**`@property` 注册可动画自定义属性**(发光 / 渐变角 / 流光 / 符文进度的丝滑底座):

```css
@property --ms-angle      { syntax: '<angle>';      inherits: false; initial-value: 0deg; }
@property --ms-glow       { syntax: '<length>';     inherits: false; initial-value: 0px;  }
@property --ms-shimmer-x  { syntax: '<percentage>'; inherits: false; initial-value: -100%;}
@property --ms-sigil      { syntax: '<number>';     inherits: false; initial-value: 0;    }
@property --ms-motion-scale { syntax: '<number>';   inherits: true;  initial-value: 1;    }
```

**WAAPI 使用边界**:优先 CSS(95% 场景);WAAPI 仅用于 (a) 运行时动态目标值(FLIP delta、拖拽回弹)、(b) `animation.finished` Promise 编排时序、(c) spring 物理求解逐帧采样。绝不用 JS 逐帧改 `style.left`,WAAPI 同样只动 transform/opacity/filter。

### 6.5 标志性魔法动效(自研 keyframes)

```css
@layer ms.motion {
  /* ① pulse-glow 呼吸光 */
  @keyframes ms-pulse-glow { 0%,100% { --ms-glow: 8px; } 50% { --ms-glow: 22px; } }
  .ms-pulse-glow { box-shadow: 0 0 var(--ms-glow) var(--ms-color-glow); animation: ms-pulse-glow 2.4s var(--ms-ease-standard) infinite; }
  /* ② shimmer 流光(skeleton)*/
  @keyframes ms-shimmer { to { --ms-shimmer-x: 200%; } }
  .ms-shimmer { background: linear-gradient(100deg, transparent 0 40%, var(--ms-color-glow) 50%, transparent 60%) var(--ms-shimmer-x) 0 / 200% 100% no-repeat; animation: ms-shimmer 1.6s linear infinite; }
  /* ③ sigil-in 符文旋入(配合 SVG pathLength=1 描边)*/
  @keyframes ms-sigil-in { from { transform: rotate(-90deg) scale(0.6); opacity: 0; --ms-sigil: 0; } to { transform: rotate(0) scale(1); opacity: 1; --ms-sigil: 1; } }
  /* ④ conjure 通用入场 */
  @keyframes ms-conjure-in { from { opacity: 0; transform: translateY(10px) scale(0.98); filter: blur(4px); } to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } }
  .ms-conjure { animation: ms-conjure-in var(--ms-dur-flow) var(--ms-ease-cast) both; }
  .ms-stagger > * { animation: ms-conjure-in var(--ms-dur-flow) var(--ms-ease-decelerate) both; animation-delay: calc(var(--ms-i, 0) * 40ms * var(--ms-motion-scale)); }
  @keyframes ms-dissolve-out { to { opacity: 0; filter: blur(6px); } }
  .ms-toast { opacity: 1; transform: translateY(0); transition: opacity var(--ms-dur-flow) var(--ms-ease-decelerate), transform var(--ms-dur-flow) var(--ms-ease-cast); @starting-style { opacity: 0; transform: translateY(8px); } }
}
```

### 6.6 动效强度一键切换(full / subtle / off)

三层级联:**系统偏好 → 用户显式档(`data-ms-motion`)→ 组件局部覆盖**。核心是改 `--ms-motion-scale`,而非每组件加判断:

```css
@layer ms.motion {
  [data-ms-motion='full']   { --ms-motion-scale: 1; }
  [data-ms-motion='subtle'] { --ms-motion-scale: 0.6; }     /* 提速 40% */
  [data-ms-motion='subtle'] .ms-pulse-glow,
  [data-ms-motion='subtle'] .ms-shimmer { animation: none; }/* 关装饰性循环,保留功能性过渡 */
  [data-ms-motion='off'] { --ms-motion-scale: 0.001; }      /* 近瞬时,保留 transitionend 不丢 */
  [data-ms-motion='off'] *, [data-ms-motion='off'] *::before, [data-ms-motion='off'] *::after {
    animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important;
  }
  @media (prefers-reduced-motion: reduce) {  /* reduce 默认等价 off,除非用户显式选 full(知情同意,待 Magic 拍板)*/
    :root:not([data-ms-motion='full']) { --ms-motion-scale: 0.001; }
    :root:not([data-ms-motion='full']) .ms-pulse-glow,
    :root:not([data-ms-motion='full']) .ms-shimmer { animation: none; }
  }
}
```

---

## 7. 一键切换运行时 API

> 一切切换最终都收敛成对 `<html>` 少量 `data-ms-*` 属性的写入 + 少量 `--ms-anchor-*` 变量覆盖。**唯一真相源是框架无关的纯数据 `ThemeState`**(在 `@magic-scope/core`,基础阶段可先寄居 `@magic-scope/tokens` 的 `./runtime` 子导出);React 层只是「写 attribute + 持久化 + 动画」的薄壳,未来 Vue / Web Component 复用同一 core。

### 7.1 框架无关核心:`ThemeState` + `ThemeEngine`

```ts
// packages/core/src/theme/types.ts
export type ThemeName = 'arcane' | (string & {});
export type ColorMode = 'light' | 'dark';
export type ModeSetting = ColorMode | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type MotionLevel = 'full' | 'subtle' | 'off';
export type MotionSetting = MotionLevel | 'system';

export interface ThemeState {           // 唯一真相源(纯数据,非 DOM、非 React state)
  theme: ThemeName;
  mode: ColorMode; modeSetting: ModeSetting;       // 已解析 + 用户意图
  density: Density;
  motion: MotionLevel; motionSetting: MotionSetting;
  palette: Record<string, string | undefined>;     // 运行时配色锚点覆盖(空 = 用预设)
}
```

```ts
// packages/core/src/theme/engine.ts —— 框架无关
export interface ThemeEngine {
  getState(): Readonly<ThemeState>;
  subscribe(l: (s: Readonly<ThemeState>) => void): () => void;
  setTheme(name: ThemeName, o?: SwitchOptions): void;
  setMode(m: ModeSetting, o?: SwitchOptions): void;
  toggleMode(o?: SwitchOptions): void;
  setDensity(d: Density, o?: SwitchOptions): void;
  setMotion(m: MotionSetting, o?: SwitchOptions): void;
  setPalette(p: Record<string, string>, o?: SwitchOptions): void;
  patch(partial: Partial<ThemeIntent>, o?: SwitchOptions): void; // 一次 apply 一次动画,"一键换皮肤"
  reset(o?: SwitchOptions): void;
  destroy(): void;
}
export interface SwitchOptions { animate?: boolean | 'auto'; origin?: { x: number; y: number }; }
```

唯一一处写 DOM:

```ts
// packages/core/src/theme/apply.ts
export function applyState(s: ThemeState, root: HTMLElement) {
  root.dataset.msTheme = s.theme; root.dataset.msScheme = s.mode;
  root.dataset.msDensity = s.density; root.dataset.msMotion = s.motion;
  for (const [role, v] of Object.entries(s.palette)) {
    if (v) root.style.setProperty(`--ms-anchor-${role}`, v);
    else root.style.removeProperty(`--ms-anchor-${role}`);
  }
}
```

> **注意**:setter 操作的是「意图」(`modeSetting`/`motionSetting`,可为 `system`),引擎内部解析出实际 `mode`/`motion` 再 apply,使「跟随系统」与「显式覆盖」走同一路径。运行时配色覆盖只写「锚点」变量,CSS 用相对颜色语法派生整族(`--ms-color-primary-hover: oklch(from var(--ms-color-primary) calc(l + 0.08) c h)`)。

### 7.2 Cascade Layers(全库唯一一次声明顺序 = 地基脊柱)

```css
/* @magic-scope/tokens 入口 CSS 顶部 */
@layer ms.reset, ms.tokens, ms.theme, ms.density, ms.motion, ms.components, ms.utilities, ms.overrides;
```

| layer | 内容 | 谁写 |
|---|---|---|
| `ms.reset` | 极简 box-sizing / margin 归零 | tokens |
| `ms.tokens` | primitive 调色板 + 流式 scale(type/space)+ 常量 + `@property` | tokens |
| `ms.theme` | semantic 映射 + 主题 / 明暗的 `data-*` 块 | tokens |
| `ms.density` | 密度缩放(晚于 tokens,可覆盖基础间距) | tokens |
| `ms.motion` | 动效 token / keyframes / 强度档 | tokens |
| `ms.components` | 组件样式,**只读语义变量** | react |
| `ms.utilities` | 原子类 / 强覆盖 | tokens |
| `ms.overrides` | 使用者最终覆盖入口(`prefers-*` 强制开关也可落这) | 用户 / tokens |

> 用户在任何 layer 之外写的普通样式天然胜过库样式(未分层 > 任何 layer),无需 `!important` 军备竞赛。

### 7.3 View Transitions 切换动画(三层降级)

```ts
// packages/core/src/theme/transition.ts —— 框架无关
export function withViewTransition(mutate: () => void, opts: { animate: boolean; origin?: { x: number; y: number } }) {
  const root = document.documentElement;
  if (!opts.animate || !('startViewTransition' in document)) { mutate(); return; } // 降级①:不支持直接切
  if (opts.origin) { root.style.setProperty('--ms-vt-x', `${opts.origin.x}px`); root.style.setProperty('--ms-vt-y', `${opts.origin.y}px`); }
  root.dataset.vtActive = 'mode';
  const vt = (document as any).startViewTransition(() => mutate());
  vt.finished.finally(() => { delete root.dataset.vtActive; });
}
```

```css
/* 明暗切换从点击点圆形涟漪扩散 */
@keyframes ms-vt-reveal {
  from { clip-path: circle(0 at var(--ms-vt-x, 50%) var(--ms-vt-y, 50%)); }
  to   { clip-path: circle(150vmax at var(--ms-vt-x, 50%) var(--ms-vt-y, 50%)); }
}
@media (prefers-reduced-motion: reduce) {  /* 降级②:reduce 强制无过渡 */
  ::view-transition-group(*), ::view-transition-old(*), ::view-transition-new(*) { animation: none !important; }
}
```

> 三层降级:① 不支持 `startViewTransition` 直接切;② `prefers-reduced-motion: reduce` CSS 强制无动画;③ 用户 `data-ms-motion=off/subtle` → 引擎 `resolveAnimate` 返回 false。

### 7.4 SSR / 首屏无闪烁(no-FOUC,双保险)

1. **SSR 框架走 cookie 适配器**:服务端渲染时直接把正确的 `data-ms-*` 写进 `<html>`。
2. **纯静态走 `<head>` 内联同步 script**:首帧绘制前读 localStorage / matchMedia 写好 `data-ms-*`:

```ts
// @magic-scope/core/theme/ssr —— 生成内联进 <head> 的同步脚本字符串
export function themeInitScript(c?: { storageKey?: string; fallbackMode?: ColorMode }): string {
  const key = c?.storageKey ?? 'ms-theme'; const fb = c?.fallbackMode ?? 'dark';
  return `(function(){try{
    var d=document.documentElement, s=JSON.parse(localStorage.getItem('${key}')||'{}');
    var sysDark=matchMedia('(prefers-color-scheme: dark)').matches;
    var mode = s.modeSetting && s.modeSetting!=='system' ? s.modeSetting : (sysDark?'dark':'${fb}');
    var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    var motion = s.motionSetting && s.motionSetting!=='system' ? s.motionSetting : (reduce?'subtle':'full');
    d.dataset.msTheme=s.theme||'arcane'; d.dataset.msScheme=mode;
    d.dataset.msDensity=s.density||'comfortable'; d.dataset.msMotion=motion;
    d.dataset.msReady='1';
  }catch(e){}})();`;
}
```

> `<html suppressHydrationWarning>` 必加(inline script 在 hydrate 前改了 `data-*`,预期内不一致)。引擎检测 `data-ms-ready==='1'` 则跳过首帧冗余 apply,只把 DOM 现状读回 `ThemeState`。配色覆盖(`palette`)较重,**不进 inline script**,hydrate 后补。

### 7.5 持久化 与 跟随系统 优先级链

```
1. 运行时显式 setter(本会话点了按钮)            —— 最高
2. localStorage / cookie 持久化的"意图"(modeSetting 非 system)
3. modeSetting === 'system' → 实时跟随 prefers-color-scheme
4. config.defaultMode / fallbackMode(系统无法判定时,Arcane → dark) —— 兜底
```

**关键**:持久化的是「意图」(`modeSetting`)而非「结果」(`mode`)。显式选 dark 后 OS 切 light 不动;选「跟随系统」则挂 `matchMedia` 实时跟。跨标签页用 `storage` 事件同步。

### 7.6 React 薄封装

```tsx
// packages/react/src/theme/
export function ThemeProvider({ children, engine: injected, ...config }: ThemeProviderProps) {
  const engine = React.useMemo(() => injected ?? createThemeEngine(config), []);
  React.useEffect(() => () => { if (!injected) engine.destroy(); }, [engine]);
  return <ThemeContext.Provider value={engine}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Readonly<ThemeState> {            // useSyncExternalStore → SSR + 并发安全
  const engine = useThemeEngine();
  return React.useSyncExternalStore(engine.subscribe, engine.getState, engine.getState);
}
export function useThemeSwitch();                              // 稳定引用的动作集
export function useColorMode(): [ColorMode, (m: ModeSetting, o?: SwitchOptions) => void]; // 细粒度选择器
export function useDensity(): [Density, (d: Density, o?: SwitchOptions) => void];
```

调用示例(明暗切换把点击坐标传给涟漪原点):

```tsx
const { toggleMode, patch } = useThemeSwitch();
<button onClick={(e) => toggleMode({ origin: { x: e.clientX, y: e.clientY } })}>☾</button>
<button onClick={() => patch({ theme: 'emerald', palette: { primary: 'oklch(0.7 0.2 30)' } })}>换皮肤</button>
```

---

## 8. 命名体系(双轨词典 + `--ms-` 变量规范)

### 8.1 双轨原则

魔法名是第一公民(唯一真相源),标准名是对外官方映射;二者由同一 token 派生,不各自硬编码。魔法别名是 opt-in 薄包装,**不复制逻辑、不翻倍 API**。

### 8.2 双轨词典(单向 alias 表)

**色族(palette family → 语义角色):**

| 魔法名(真相源) | hex 基准 | 标准语义角色 | 用途 |
|---|---|---|---|
| `arcane` | #8B5CF6 | `primary` | 主操作 |
| `ember` | #F472B6 | `accent` | 强调 |
| `frost` | #38BDF8 | `info` | 信息 |
| `moss` | — | `success` | 成功 |
| `sun` | — | `warning` | 警示 |
| `danger` | #F43F5E | `danger` | 危险 / 错误 |
| `void` | #0A0710… | `surface`/`bg`/`border`/`fg` | 中性结构色 |

**动效(魔法关键帧 / 曲线 → 语义角色):**

| 魔法名(真相源) | 标准角色 | 含义 |
|---|---|---|
| `cast` | `transition`/`default` | 通用平滑过渡 |
| `conjure` | `enter` | 元素出现 |
| `dispel` | `exit` | 元素消失 |
| `shimmer` | `loading`/`skeleton` | 微光 / 加载 |
| `pulse` | `emphasis` | 脉冲强调 |
| `glow` | `focus`/`highlight` | 发光焦点 |

```ts
// packages/tokens/src/dictionary/color-aliases.ts —— 单向映射真相源
export const colorAlias = { arcane: 'primary', ember: 'accent', frost: 'info', moss: 'success', sun: 'warning', danger: 'danger' } as const;
export type MagicTone = keyof typeof colorAlias;
export type SemanticTone = (typeof colorAlias)[MagicTone];
export function resolveTone(tone: MagicTone | SemanticTone): SemanticTone {
  return (colorAlias as Record<string, SemanticTone>)[tone] ?? (tone as SemanticTone);
}
```

> 组件公共 API 默认收标准名,魔法别名作 opt-in:`<Button tone="primary">` 与 `<Button tone="arcane">` 等价,内部都经 `resolveTone` 落到同一 `--ms-color-*` 变量。魔法皮肤包 `@magic-scope/react/arcane` 再导出 `<ArcaneButton>` 等纯重命名薄别名。

### 8.3 `--ms-` 变量命名规范

统一范式 `--ms-<domain>-<role>[-<scale|state>]`,domain 固定枚举:

| domain | 范式 | 示例 |
|---|---|---|
| 颜色(语义) | `--ms-color-<role>[-<variant>]` | `--ms-color-primary`、`--ms-color-primary-hover`、`--ms-color-surface-raised`、`--ms-color-text-muted` |
| 颜色(原始,**internal**) | `--ms-palette-<family>-<step>` | `--ms-palette-arcane-500`(组件禁读) |
| 间距 / 圆角 | `--ms-space-<step>` / `--ms-radius-<size>` | `--ms-space-4`、`--ms-radius-md` |
| 字号 / 字族 | `--ms-type-step-<n>` / `--ms-font-family-<role>` | `--ms-type-step-2`、`--ms-font-family-display` |
| 阴影 / 发光 | `--ms-shadow-<size>` / `--ms-glow-<size>` | `--ms-glow-md`(基色取 `--ms-color-glow`) |
| 动效曲线 / 时长 | `--ms-ease-<name>` / `--ms-dur-<name>` | `--ms-ease-cast`、`--ms-dur-base` |
| 强度 / 密度乘子 | `--ms-motion-scale` / `--ms-density-scale` | 全局乘子,可一键调 |
| 断点 | `--ms-bp-<name>` / `--ms-cq-<name>` | `--ms-bp-md`、`--ms-cq-rune` |
| 焦点环 | `--ms-color-focus-ring` | 默认色 arcane.400 |

> 公共契约只承诺 **semantic 层(`--ms-color-*` 等)稳定**;primitive 层(`--ms-palette-*`)标为 internal/unstable,深度定制可读但不受 breaking 保护。

---

## 9. `@magic-scope/tokens` 工程化

### 9.1 包结构(本架构落地的目录)

```
packages/tokens/
├── src/
│   ├── primitive/        # L1:palette.ts(OKLCH 色阶)/ scale.ts(space/radius/size/font)
│   ├── contract/         # L2:contract.ts(ThemeContract)/ roles.ts(COLOR_ROLES + assertValidTheme)
│   ├── component/        # L3(可选):button.ts …
│   ├── generate/         # lightness-curve.ts / scale.ts(culori)/ contrast.ts(WCAG+APCA)/ emit.ts
│   ├── derive/           # deriveTheme.ts(seed → 整套契约)
│   ├── engine/           # compile.ts / inject.ts / varName.ts / property.ts
│   ├── themes/           # arcane.ts(默认预设)/ arcane-light.ts / index.ts / _contract.ts
│   ├── motion/           # tokens.ts / tokens.css / keyframes.css / properties.css / transitions.ts / reduced-motion.css
│   ├── breakpoints/      # breakpoints.css / breakpoints.media.css(@custom-media)
│   ├── dictionary/       # color-aliases.ts / motion-aliases.ts(双轨词典真相源)
│   ├── css/              # layers.ts(@layer 顺序)/ generate-vars.ts / generate-property.ts
│   ├── scripts/          # gen-clamp.ts(流式 clamp 系数)
│   └── index.ts
├── styles/               # prebuild 产物:tokens.css / theme-arcane-dark.css / theme-arcane-light.css / reset.css
├── scripts/build-css.ts  # tsx 脚本:import src → 写 styles/*.css(不走 tsup)
├── tsup.config.ts
└── package.json
```

### 9.2 构建产物(三种消费方式)

| 产物 | 生成方式 | 消费方 |
|---|---|---|
| TS `as const` | tsup(ESM+CJS+`.d.ts`) | 类型推导、SSR 内联、JS 读取 |
| CSS(`styles/*.css`) | `scripts/build-css.ts` 从 TS token 生成(prebuild) | react 运行时主消费(hex + `@supports oklch` 双值 + `@property` + `@layer`) |
| JSON(`dist/tokens.json`,可选) | tsup 之外单独 emit | Figma / 其他框架 / 设计工具(Style Dictionary 兼容) |

### 9.3 tsup / exports / sideEffects

```ts
// tsup.config.ts
export default defineConfig({
  entry: { index: 'src/index.ts', contract: 'src/contract/index.ts', engine: 'src/engine/index.ts',
           themes: 'src/themes/index.ts', derive: 'src/derive/index.ts', motion: 'src/motion/index.ts',
           breakpoints: 'src/breakpoints/index.ts', dictionary: 'src/dictionary/index.ts' },
  format: ['esm', 'cjs'], dts: true, clean: true, treeshake: true, // CSS 由 prebuild 生成,不走 tsup
});
```

```jsonc
// packages/tokens/package.json
{
  "name": "@magic-scope/tokens", "type": "module",
  "sideEffects": ["**/*.css"],                    // 只有 CSS 有副作用,JS 全可摇树
  "files": ["dist", "styles"],
  "scripts": { "prebuild": "tsx scripts/build-css.ts", "build": "tsup" },
  "exports": {
    ".":          { "types": "./dist/index.d.ts",     "import": "./dist/index.js",     "require": "./dist/index.cjs" },
    "./contract": { "types": "./dist/contract.d.ts",  "import": "./dist/contract.js",  "require": "./dist/contract.cjs" },
    "./engine":   { "types": "./dist/engine.d.ts",    "import": "./dist/engine.js",    "require": "./dist/engine.cjs" },
    "./themes":   { "types": "./dist/themes.d.ts",    "import": "./dist/themes.js",    "require": "./dist/themes.cjs" },
    "./derive":   { "types": "./dist/derive.d.ts",    "import": "./dist/derive.js",    "require": "./dist/derive.cjs" },
    "./motion":   { "types": "./dist/motion.d.ts",    "import": "./dist/motion.js",    "require": "./dist/motion.cjs" },
    "./dictionary": { "types": "./dist/dictionary.d.ts", "import": "./dist/dictionary.js", "require": "./dist/dictionary.cjs" },
    "./css":                     "./styles/tokens.css",
    "./css/reset.css":           "./styles/reset.css",
    "./themes/arcane-dark.css":  "./styles/theme-arcane-dark.css",
    "./themes/arcane-light.css": "./styles/theme-arcane-light.css",
    "./tokens.json":             "./dist/tokens.json"
  },
  "publishConfig": { "access": "public" }
}
```

### 9.4 react 如何消费 token(运行时零 re-render)

```ts
// app 入口 import 一次 CSS(side-effect)
import '@magic-scope/tokens/css';
import '@magic-scope/tokens/themes/arcane-dark.css';
```

```css
@layer ms.components {
  .ms-button {
    background: var(--ms-color-primary); color: var(--ms-color-on-primary);
    border-radius: var(--ms-radius-md);
    padding: calc(var(--ms-space-2) * var(--ms-density-scale)) var(--ms-space-4);
    transition: background var(--ms-dur-base) var(--ms-ease-cast);
  }
  .ms-button[data-glow] {  /* 魔法皮肤:发光 opt-in,color-mix 调透明,合成层不抖 layout */
    box-shadow: 0 0 0 1px var(--ms-color-glow), 0 0 16px color-mix(in oklch, var(--ms-color-glow) 60%, transparent);
  }
}
```

> 切主题 `setTheme("emerald")` 时按钮**一行不改**就变色并平滑过渡。**值不在 JS 硬编码**,JS 只持有变量名 / 角色枚举与类型。

### 9.5 与 component.json / registry 的关系

- tokens 本体登记为一条 `category: "foundation"` 条目,每个主题预设各自登记为 `category: "theme"` 条目(便于「主题市场」式浏览 / 溯源)。
- `registry/build-index.ts` 扫描范围扩大到 `packages/*/src/**/component.json`(含 tokens 与各 theme);`component.schema.ts` 的 `category` 枚举新增 `foundation` 与 `theme`,`frameworks` 含 `tokens`(此 schema 改动由 registry 维度统一收口)。
- 每次改 tokens / 新增主题预设都要 `pnpm changeset`(版本级溯源,呼应 CLAUDE.md 硬性约定)。

---

## 10. 可访问性与性能纪律小结

### 10.1 可访问性底线(进 CI)

- **对比度**:对外承诺 WCAG 2.1 AA(4.5:1 正文 / 3:1 大字与 UI),生成期对每个预设主题的关键色对计算对比度,不达标 build 失败;内部用 APCA 选阶微调;`on*` 前景由对比度求解焊在派生层,用户配不出不可读主题。
- **键盘可达 + ARIA**:焦点环用 `box-shadow`(可过渡可发光)+ `:focus-visible`;WHCM(`forced-colors`)下焦点环 / 边框用系统色兜底可见。
- **`prefers-reduced-motion`**:reduce 默认等价 off(显式 `data-ms-motion=full` 是否视为知情同意待 Magic 拍板),View Transitions 在 reduce 下禁用,状态仍可切换(保留 `transitionend` 不丢)。
- **触控**:命中区 ≥ 44px(粗指针 ≥ 48px),compact 密度下仍达标。

### 10.2 性能纪律(进 lint / review checklist)

- 只补间 `transform`/`opacity`/`filter` 及 `@property` 注册的自定义属性;禁止补间尺寸 / 位置属性。
- `will-change` 仅瞬时态挂,动画结束移除。
- 入场用 `@starting-style`,大列表用 `content-visibility: auto` + scroll-driven。
- 切主题 / 明暗 / 密度靠改 `data-ms-*` 属性,**零 re-render**;配合 `@property` + transition 平滑过渡。
- 组件 CSS 只读语义变量,禁读 primitive / 裸色值(Biome / CI 闸强制)。

### 10.3 强制约束(让「可控」不靠自觉)

1. **Biome 自定义规则 / 构建期 grep 闸**:组件 CSS 禁出现 `--ms-palette-*`/`--ms-arcane`/裸 hex/oklch 字面量;违者 lint 失败无法提交。
2. **契约校验入 CI**:所有 `themes/*` 与派生器产物跑 `assertValidTheme`,缺角色 fail。
3. **对比度测试入 CI**:每个预设主题的关键色对计算 WCAG 对比度,低于阈值 fail(既定 Arcane 色值作回归基线)。
4. **契约改动 = 破坏性版本**:`contract.ts` 任何键增删改必须 major changeset。

### 10.4 优雅降级矩阵(总表)

| 能力 | 现代浏览器 | 降级落点 |
|---|---|---|
| `oklch()` 色值 | 广色域 OKLCH | `@supports` 外的 hex |
| `oklch(from … l c h)` 相对语法 | 运行时单 seed 派生整阶 | `color-mix(in oklch)` → build 期静态 hex |
| `color-mix(in oklch)` | OKLCH 空间混色 | build 期静态色阶 |
| `@property` | 颜色 / 数值可补间过渡 | 瞬跳(功能不降级,只降平滑) |
| `@starting-style` | 首次渲染即入场过渡 | 直接以终态出现 |
| `startViewTransition` | crossfade / 涟漪过场 | 直接 mutate,状态正确 |
| `animation-timeline: view()` | 滚动驱动动画 | `@supports` 包裹,元素直接显示终态 |
| cascade layers | 可预测覆盖 | 按源码顺序生效,优先级略变不破坏 |
| container queries | 组件级响应式 | 需 polyfill 或退化到视口断点(地基期默认要求支持) |
| `svh/dvh` | 动态视口 | `@supports` 降级到 `100vh` |
| P3 广色域 | 更饱和显示 | 浏览器从 OKLCH 自动裁剪到 sRGB |

---

## 附录 A:地基决策(已拍板 · 2026-06-24)

> 4 项战略决策由 Magic 拍板,其余 13 项由 Magic 授权按推荐默认定稿;结论见 A.1,原始问题见 A.2 供追溯。

### A.1 决策结论表

| # | 决策点 | 结论 |
|---|---|---|
| 1 | 核心契约角色集 | **现在补齐常用角色**:在 ~24 个 MVP 基础上加入 `overlay`(模态遮罩 scrim)、`selection`(选区)、`link`/`linkVisited`、`surfaceSunken`(凹陷面),一次定准,降低后续破坏性升级。 |
| 2 | dimension/typography 归属 | **确认纳入 `ThemeContract`,由 `@magic-scope/tokens` 统管**,不拆独立维度。 |
| 3 | 密度实现 | **单因子 `calc(base * var(--ms-density-scale))` 同比缩放**;默认档固定 `comfortable`(不按 pointer 自动切);三档 `comfortable / compact / spacious` 作正式 API。 |
| 4 | 主题引擎落点 | **先寄居 `@magic-scope/tokens` 的 `./runtime` 子导出**;框架无关核心已隔离,Phase 2 再低成本迁出独立 `@magic-scope/core`。 |
| 5 | reduced-motion 与 full | 系统 `prefers-reduced-motion: reduce` 时**默认强制降到 `subtle`(底线优先)**;仅当应用层显式 `data-ms-motion=full` 才视为知情同意保留全动效(默认不开)。 |
| 6 | 对比度底线 | **WCAG 2.1 AA(正文 4.5:1 / 大字·UI 3:1)为对外底线 + 派生器自动自愈**(冲突时微调明度达标并在 build log 提示)。 |
| 7 | 首屏 no-FOUC 范围 | **明暗 + 选定预设主题名进首屏 inline script 防闪**;运行时 palette 微调 hydrate 后应用(重品牌站建议把自定义主题编译成静态 CSS 内联,文档提示)。 |
| 8 | toggleMode 交互 | 从 `system` 点击 → **切到与当前系统相反的显式值**(直觉默认);另提供 `system→light→dark→system` 三态循环作可选 API。 |
| 9 | 色阶档位 | **固定 11 阶 50→950**(Tailwind 风格,对齐生态 / 利于 AI 检索);primitive **完整存 50–950 全阶**。 |
| 10 | type scale 比例 | **默认 1.2(minor third)** 稳健;展示标题层可用更大跳;比例作 token 可一键切 1.25 / 1.333。 |
| 11 | 构建链 | **引入 `culori` 作 build-only devDependency** 做精确 OKLCH↔sRGB / gamut 映射;**不引入 PostCSS**,媒体查询断点值改**构建期 TS 常量注入**(规避 `var()` in media query 失效)。 |
| 12 | 容器断点默认值 | **先用 `sigil/rune/ward/glyph = 288/448/640/896px` 起步**,随首批组件(Card/Dialog/Table)实测校准。 |
| 13 | data-* 前缀 | **采纳带 `ms-` 前缀**:`data-ms-theme / data-ms-scheme / data-ms-density / data-ms-motion / data-ms-tone`(避免与宿主应用属性冲突)。 |
| 14 | JSON 产物 | **首发提供 `dist/tokens.json`(Style Dictionary 兼容)**,低成本利于未来 Figma / 多框架;魔法别名(`tone=arcane` 等)清单与组件维度对齐时细化。 |
| 15 | spring 物理 | **Phase 0 用 `cast.*` 的 cubic-bezier 近似**;真 spring(JS 采样转 WAAPI)推到 `@magic-scope/core` 内核阶段。 |
| 16 | arcane-light | **授权按 OKLCH 从 dark 反推一套 `arcane-light` 作默认 light 预设**;void 中性「紫调」chroma 做成**可配参数**(用户中性也可带品牌色相),Arcane 默认锚定既有值。 |
| 17 | APCA 用途 | **APCA 仅作内部调优、不对外承诺;对外以 WCAG 2.1 兜底**(自实现,无 license 风险)。 |

### A.2 原始问题(供追溯)

1. 【契约最小角色集是否一次定准】MVP 颜色角色约 24 个,是否现在就加 surfaceSunken / overlay(模态遮罩)/ selection(选区)/ link 这几个常见角色?加键 = 后续所有主题都要填或派生器补默认,且契约改动 = major 破坏性版本,宜在地基期一次定准而非日后频繁加键。
2. 【dimension / typography 数值轴归属】space/radius/size 与 type scale 当前纳入 ThemeContract 并由 tokens 包统管,是否确认归属边界(而非拆出独立的间距/排版维度)?这决定契约的形状是否稳定。
3. 【密度实现选型】用单因子 calc(base * --ms-density-scale) 缩放(简单,所有 space 同比),还是每档密度给一套独立 space 值(更精细但配置量大)?且密度默认档:固定 comfortable,还是 @media (pointer: coarse) 自动切 comfortable / fine 默认 compact(更聪明但可能违背预期)?并确认 spacious 第三档是否作为正式 API。
4. 【核心引擎落点与发布粒度】框架无关主题引擎在地基阶段先寄居 @magic-scope/tokens 的 ./runtime 子导出,还是直接按 FOUNDATION Phase 2 新建独立 @magic-scope/core 包?影响 exports map 与发布粒度。
5. 【a11y vs 动效:reduced-motion 时的 full 覆盖】prefers-reduced-motion: reduce 时,用户显式选择 data-ms-motion='full' 是否视为「知情同意」保留全动效(当前草案如此),还是无障碍底线要求系统偏好永远优先(reduce 时至少强制 subtle)?需对 a11y 立场拍板。
6. 【对比度阈值与失败策略】对外定 WCAG AA(4.5:1 / 3:1)还是 AAA?派生器在无法同时满足对比度与品牌色相时:自动微调明度自愈(当前草案)还是报警让用户改种子?
7. 【配色覆盖是否进首屏 no-FOUC 链路】当前 palette 运行时覆盖被视为「非首屏闪烁敏感、hydrate 后补」,不进 inline script。若用户做强品牌定制(整站主色非默认紫),首屏会闪一下默认紫——是否可接受?
8. 【toggleMode 从 system 的交互直觉】从 system 状态点击切换:切到「与当前系统相反的显式值」(当前默认),还是 system→light→dark→system 三态循环?
9. 【色阶档位】固定 11 阶(50→950,Tailwind 风格,对齐生态 / AI 可检索)还是引入更细阶(如 25/925/975)以服务极深色主题?并确认 primitive 完整 50–950 全存还是只存语义用到的几阶。
10. 【type scale 基准比例】默认 1.2(minor third,稳健)是否符合 Arcane「亮眼」气质,还是默认更戏剧化的 1.25 / 1.333、由使用者一键切?
11. 【构建链是否引入 PostCSS / culori】tokens 包 CSS 是否为 @custom-media 引入 PostCSS preset-env(否则媒体查询 var 失效需改构建期 TS 常量注入)?是否引入 culori 作 build-only devDependency 做精确 OKLCH↔sRGB / gamut 映射(否则需自研,精度与维护成本上升)?
12. 【容器断点默认档位】--ms-cq-sigil/rune/ward/glyph = 288/448/640/896px 无行业标准,需结合首批组件(Card/Dialog/Table)实测校准——是否先用此值起步?
13. 【data-* 命名前缀已统一加 ms-】本整合稿已统一为 data-ms-theme / data-ms-scheme / data-ms-density / data-ms-motion(避免与宿主应用属性冲突),确认采纳。
14. 【JSON 产物与魔法别名清单】dist/tokens.json(Style Dictionary 兼容)首发是否需要、目标消费方(Figma 插件 / 其他框架)是否已定?魔法别名皮肤(tone=arcane 等)经 data-ms-tone / resolveTone 的具体清单与作用域待与组件维度对齐。
15. 【spring 物理求解落地时机】Phase 0 仅用 cast.* 的 cubic-bezier 近似,把真 spring(JS 采样转 WAAPI keyframes)推到 packages/core 内核阶段?
16. 【arcane-light 既定色值】FOUNDATION 只给了 dark,light 模式色阶需 Magic 确认或授权按 OKLCH 反推一套;void 中性「紫调」chroma 强度是否做成可配参数(让用户自定义中性也带品牌色相)还是 Arcane 专属硬锚。
17. 【APCA 用途边界】APCA(W3C 测试版,尚未正式进 WCAG 3)作为「内部调优 + 不对外承诺」用途,license / 稳定性可接受吗?对外仍以 WCAG 2.1 兜底。

## 附录 B:已知缺口(gaps)

- 排版系统(字族 / 字重 / 行高 / 字距 / 展示字体 Cinzel 的授权与子集化)只在契约里占位,没有独立深入展开;FOUNDATION 也把展示字体选型列为待定。
- elevation / shadow 体系(阴影 token 与发光的关系、暗底下阴影如何表达)只在变量规范里出现 --ms-shadow-*,缺具体配方与 dark 模式策略。
- 焦点管理 / 键盘交互细节(focus trap、roving tabindex、Esc / 方向键约定)未覆盖——属组件层,但地基应给一套 a11y 原语约定。
- 国际化 / RTL:全篇用了 inline-size / block-size / padding-inline 等逻辑属性(方向无关,利好 RTL),但没有显式声明 RTL 策略与 dir 属性接入。
- 图标系统 / sigil 几何装饰资源(SVG 规范、pathLength=1 描边约定)只在 sigil-in 动效里被引用,缺独立资产规范。
- registry component.schema.ts 的 category/frameworks 枚举扩展(foundation/theme)需 registry 维度落地,本架构只提出需求未给最终 schema diff,存在两边各改冲突风险(已在 §9.5 标注收口归属)。
- z-index / layering(模态、popover、toast 的层级 token)与 portal 策略未涉及。

## 附录 C:现代 API 降级存疑项

- container queries 被定为「地基期默认要求支持」且未给 JS polyfill 方案——若需兼容不支持的旧环境,组件级响应式会整体失效,降级路径(退化到视口断点)只是口头描述、未落地实现。
- @custom-media 依赖 PostCSS preset-env 构建步骤,而 FOUNDATION 技术栈是 tsup(不含 PostCSS);若不引入 PostCSS,媒体查询里 var() 失效问题没有已落地的替代(构建期 TS 常量注入)——属待拍板项但当前是降级缺口。
- 运行时相对颜色语法派生「不做 gamut clamp」,极端 seed 可能溢出 P3 由浏览器裁,视觉可能偏离设计意图——build-time 路径精确,但纯运行时换色路径的色准是已知存疑项。
- forced-colors(WHCM)只声明了「关键边框 / 焦点环用系统色兜底」原则,具体哪些组件元素如何映射系统色(Canvas/CanvasText/Highlight)未逐项给出。
- @property 在不支持的浏览器下颜色 / 数值变量退化为瞬跳——已声明「功能不降级只降平滑」,但依赖 @property initial-value 的某些动画(如 shimmer 的 --ms-shimmer-x 从 -100% 起)在不注册时初值行为需实测验证。
- scroll-driven animations 的 @supports 包裹会让不支持的浏览器「直接显示终态」,意味着 reveal-on-scroll 元素在旧浏览器永远可见(无入场)——可接受但需确认不会出现初始隐藏却无法显现的情况(若用 opacity:0 起手且无降级会有此风险)。

## 附录 D:架构 / 性能风险

- 契约故意保持小(24 角色)+ 「增删键 = major」的硬约束,意味着早期角色集若没定准,后续补 surfaceSunken/overlay/selection/link 都会触发破坏性版本——地基期决策压力集中,decisions_for_magic 第 1 条是最高优先级风险点。
- 六维度对 cascade layer 顺序与 data-* 命名曾不一致(有的用 data-theme / data-mode 无前缀、layer 名有 ms.base vs ms.density 差异),本稿已统一为带 ms- 前缀 + 八层顺序 ms.reset/tokens/theme/density/motion/components/utilities/overrides,但需在实际代码里全仓库一次性对齐,否则样式优先级会出微妙 bug。
- --ms-motion-scale 既被动效维度用 0.001(保留 transitionend)也被响应式维度用 0(reduced-data),两处对「归零」的取值不同(0 会丢 transitionend 事件)——本稿统一倾向 0.001,但需确认所有引用点一致,否则 off 档下依赖 transitionend 的逻辑会静默失效。
- 运行时主题引擎落点未定(tokens/runtime vs 独立 core),exports map 与包依赖图会因此不同;若先寄居 tokens 再迁出 core,是一次潜在破坏性迁移。
- 性能纪律靠 lint / review checklist 强制,但「禁止补间尺寸属性」「will-change 仅瞬时」这类规则 Biome 未必有现成 CSS 规则,可能需要自研 lint 或构建期 grep,落地成本与覆盖度存疑。
- 派生器的对比度自愈(自动加深 1 阶)可能让用户给的品牌主色在 UI 上偏离预期(被悄悄改深),若不在 build log / 文档充分提示,会造成「我配的色怎么不对」的困惑。
- View Transitions 列表 FLIP 需为每项分配唯一 view-transition-name,在 React 并发渲染 / key 复用下可能冲突或抖动,自动生成 vs 要求使用方显式提供尚未定,属实现期隐患。
