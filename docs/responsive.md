# 多端 / 设备适配

magic-scope 的设备适配是**一套代码 + 流式 token + 容器查询自适应**:同一个组件在桌面、平板、手机、触屏、高 DPI 上自适应,而不是为某设备单独维护一套组件库。落地对齐 `DESIGN.md` §5(设备适配)与 §7.2(cascade layers)。

> **为什么不为手机单独做一套?** 那会让同一 UI 分裂成两条 `component.json` 档案、两份 git 历史、两套硬编码尺寸,破坏「溯源一致 + 核心契约派生」的根本。本库的变化统一坍缩为「换一组 `--ms-*` 变量值」或「改一个 `data-ms-*` 属性」。唯一例外是**浮层形态**(Dialog / Menu / Select 在窄屏切到底部抽屉 / 全屏)——那是**同一组件的响应式变体**,不是第二份代码。

## 断点 token

唯一真相源在 `@magic-scope/tokens` 的 `breakpoints`(`packages/tokens/src/primitive/breakpoints.ts`),与主题无关、不进主题契约:

| 类别 | 名称 | 值(rem / px) | 用途 |
|---|---|---|---|
| 视口 `viewport` | `sm` / `md` / `lg` / `xl` / `2xl` | 30/48/64/80/96rem = 480/768/1024/1280/1536px | 页面级骨架、`matchMedia` |
| 容器 `container` | `sigil` / `rune` / `ward` / `glyph` | 18/28/40/56rem = 288/448/640/896px | 组件内部响应式默认 |

**约定:组件内部重排一律用 `@container`(对父容器自适应),仅页面骨架 / 浮层窗口级形态用 `@media`。**

## 横向 token(一处定义、全组件复用)

定义在 `packages/react/src/device.css`,组件只引用、禁止各写魔法值:

| token | 默认值 | 触屏 / 升级 | 用途 |
|---|---|---|---|
| `--ms-target-min` | `2.75rem`(44px) | `@media (pointer: coarse)` → `3rem`(48px) | 触控目标尺寸(WCAG 2.5.5) |
| `--ms-safe-top/right/bottom/left` | `env(safe-area-inset-*, 0px)` | — | 刘海 / Home 条安全区 |
| `--ms-viewport-h` | `100vh` | `@supports (height:100svh)` → `100dvh` | 视口高度,治移动端地址栏抽风 |
| `--ms-viewport-h-stable` | `100vh` | → `100svh` | 稳定视口高度 |
| `--ms-hairline` | `max(1px, 0.0625rem)` | `@media (min-resolution: 2dppx)` → `0.5px` | 高 DPI 发丝线 |

还提供 `.ms-hit-area` 工具类:视觉尺寸不变、用隐形 `::before` 把命中区扩到 `--ms-target-min`(用于小图标 / 关闭钮 / 页码)。

## 触控热区与 pointer / hover

- 触控热区基线 **44px**(触屏 48px),全部由 `--ms-target-min` 驱动。
- 放大热区只在 `@media (pointer: coarse)` 内发生——**桌面(精确指针)逐像素不变**。
- 手机 sm 输入框字号在 `pointer: coarse` 下抬到 ≥16px,防 iOS 聚焦自动放大整页。

## 密度

`setDensity('comfortable' | 'compact' | 'spacious')` 写 `data-ms-density`,在 `@layer ms.density` 闭环为 `--ms-density-scale` 与 `--ms-control-h`,组件按需消费:

```html
<html data-ms-density="compact">  <!-- --ms-density-scale: 0.85 -->
```

## Cascade layers

`packages/react/src/styles.css` 顶部一次声明 8 层(靠后者优先级更高):

```css
@layer ms.reset, ms.tokens, ms.theme, ms.density, ms.motion, ms.components, ms.utilities, ms.overrides;
```

组件入 `ms.components`,响应式覆盖(`@media` / `@container`)天然高于基础值;**使用方应用层未分层样式天然胜过库样式**,避免 specificity 战争。

> **这把刀是双刃的(已实测)。** 「未分层胜过分层」对使用方的 **CSS reset** 同样成立:Tailwind v3 的 preflight(`button { background-color: transparent }`,没包在 `@layer` 里)会连 `ms.components` 里 `Button` solid 变体的底色和描边一起抹掉。三种组合实测结果:
>
> | 宿主 reset 写法 | 结果 |
> |---|---|
> | 未分层(Tailwind v3 preflight / 多数 normalize) | 宿主 reset 赢,组件底色被抹 |
> | 在 `@layer` 里,且声明**早于**本库样式 | 库赢,组件正常 |
> | 在 `@layer` 里,但声明**晚于**本库样式 | 宿主 reset 赢(层序按首次声明先后,后声明者优先级更高) |
>
> 规避:把宿主 reset 也放进一个 layer 并让它先于 `@magic-scope/react/styles.css` 声明(Tailwind v4 的 preflight 本身就在 `@layer base`,只要库样式在其之后引入即可;v3 可写 `@import "tailwindcss/base" layer(base);`)。

反过来,**本库不假设宿主页有 reset**:每个直接渲染的原生控件(`<button>` / `<input>` / …)都在自己的组件规则里显式重置了 UA 默认 `background` / `border` / `font` / `color` —— 否则裸宿主页里 `Button` 的 ghost / outline / link 会渲染成 Chrome 的 ButtonFace 灰药丸。`@layer ms.reset` 因此**故意留空**给使用方(组件库不该替宿主页 reset 别人的 `button`),这条由 `packages/react/src/css-contract.test.ts` 的 CI 红线守着。

## 各组件的设备适配行为

| 组件 | 适配 |
|---|---|
| Dialog | 面板限高可滚(`--ms-viewport-h`)、内建关闭钮(触屏可达)、安全区内边距、打开时锁背景滚动 |
| Popover / Select / Menu | 锚定回退链(贴边翻转)、`max-block-size` + 内部滚动、窄屏宽度上限、触屏放大热区 |
| Tooltip | 触屏改 tap-to-toggle(此前触屏完全唤不出)、非可聚焦 children 补 `tabindex` |
| Table | 既有 `.ms-table-wrap` 横向滚动兜底、`min-inline-size: max-content` 防挤垮、长串 `overflow-wrap` |
| Tabs | 标签横向滚动 + scroll-snap(防后段标签不可达)、当前标签 `scrollIntoView` |
| Pagination | 页码 `flex-wrap` 防溢出、触屏热区达标 |
| Button / Input / Textarea / Checkbox / Switch | 触屏热区抬到 44/48px、`min-block-size` 弹性、iOS 字号防缩放、Textarea 补 `box-sizing` |
| Accordion / Breadcrumb | 触屏头部 / 链接热区、长内容 `overflow-wrap` |

> sheet / 全屏变体、Table 卡片化、Breadcrumb 折叠、容器查询全面化属后续阶段(P1 / P2)。

## 多框架对等

设备适配契约是**框架无关**的:断点 token、横向 token、`data-ms-*`、容器查询语义、pointer/hover 约定都是唯一真相源。当前以 **React** 为基准落地;后续接入的主流框架(Vue / Web Component 等)必须**同步对齐同一套适配语义**,不得各自写一套。见 `CLAUDE.md` 硬性约定 7 与 `FOUNDATION.md` Phase 2。

## 如何验证

- playground(`playground/`)已 `viewport-fit=cover` + 内边距随屏收敛;窄屏拖窗口即可看自适应。
- 用 Chrome DevTools 的设备模拟(`emulate` iPhone / Pixel + coarse pointer + 2dppx)回归触控热区与浮层视口行为。
