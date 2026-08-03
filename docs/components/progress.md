# Progress <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

进度条,确定态按 value 驱动填充宽度,不确定态填充段左右往返流动。

> **[在展示站中打开 Progress](https://magicood.github.io/magic-scope/#/progress)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。

role="progressbar",aria-valuemin=0 / aria-valuemax=100;确定态设 aria-valuenow 并按 value% 平滑驱动填充宽度,不确定态(indeterminate 或缺省 value)让一段发光填充段左右往返流动。value 自动夹到 0-100,非法值回退 0,填充永不溢出轨道。尊重 reduced-motion(放慢往返,保留语义)。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/progress.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `number` | — | 进度值,0-100。确定态下设为 aria-valuenow 并驱动填充;省略或 indeterminate 时为不确定态。 |
| `indeterminate` | `boolean` | `false` | 不确定态:不知道具体进度,填充段流动(线性往返 / 环形旋转)。默认 false。 |
| `variant` | `"linear" \| "circular"` | `linear` | 形态:线性进度条 / 环形进度。默认 linear。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 只读 6 槽位(不写死配色)。默认 primary。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放):线性改条高、环形改直径与线宽。默认 md。 |
| `striped` | `boolean` | `false` | 条纹填充(repeating-linear-gradient 斜纹)。 |
| `animated` | `boolean` | `false` | 条纹流动动画(需 striped;受 data-ms-motion 与 prefers-reduced-motion 门控)。 |
| `buffer` | `number` | — | 缓冲段:已加载但未播放/未完成的进度(0-100,如视频缓冲)。仅线性变体,绘制在 fill 之下、track 之上。<br>兼容:小于当前 value 时视觉被 fill 覆盖,语义仍写入 aria-valuetext 由使用方自定义时另说。 |
| `showValue` | `boolean` | `false` | 显示进度百分比文本:线性显示在条旁(末尾),环形显示在环心。不确定态不显示。 |
| `label` | `ReactNode` | — | 自定义 label 槽位(ReactNode):覆盖 showValue 的纯百分比,可放任意内容。<br>线性显示在条旁,环形显示在环心。传入即生效(无需 showValue)。 |
| `glow` | `"off"` | — | 实例级发光强度:off 关闭装饰发光(覆盖全局 --ms-fx-glow);默认随全局。 |
| `classNames` | `ProgressClassNames` | — | 子部件 className 精修(track / fill / buffer / label)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `progress` `progressbar` `feedback` `loading` `indicator` `indeterminate` `status` `circular` `linear` `striped` `buffer` `spinner` `tone` |

::: details 需求原文 / 设计意图
发光的进度组件,role=progressbar。补强到生产级深度:linear/circular 两形态、tone 语义色(6 槽位)、size 随密度缩放、striped+animated 条纹、buffer 缓冲段、showValue/label 槽位、确定态/不确定态流动、classNames 子部件精修、实例级 glow。magic-scope 通用基础组件:自研、消费 tokens 的 --ms-* 变量,完整状态与过渡、发光,动效受 data-ms-motion / prefers-reduced-motion 一键降级。
:::
