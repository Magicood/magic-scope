# ScrollArea <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

自定义滚动区,原生 overflow 滚动 + 自绘 track / thumb 叠在内容上不占布局,几何与原生 scrollTop / scrollHeight 实时同步。

> **[在展示站中打开 ScrollArea](https://magicood.github.io/magic-scope/#/scroll-area)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

尺寸受限的滚动容器:原生 overflow:auto 承载滚动(保留键盘可达与惯性),隐藏系统滚动条后自绘一条与主题一致、叠在内容上不占布局的滚动条。

thumb 尺寸 / 位置随真实 scrollTop / scrollHeight 同步、可拖拽反向滚动;type(auto / always / hover / scroll)控制显隐策略,orientation 支持纵 / 横 / 双向。

几何换算抽成零依赖纯函数便于平移;尊重 reduced-motion 与 data-ms-motion=off。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `"auto" \| "hover" \| "always" \| "scroll"` | `auto` | 滚动条显隐策略:<br>- `auto`:仅当内容溢出时常驻(默认);<br>- `always`:永远显示(即便不溢出也占位提示);<br>- `hover`:悬停滚动区时才显示;<br>- `scroll`:滚动时显示,停止后经 `scrollHideDelay` 淡出。 |
| `scrollHideDelay` | `number` | `600` | `type="scroll"` 时停止滚动到隐藏的延时(毫秒)。默认 600。 |
| `orientation` | `"both" \| "horizontal" \| "vertical"` | `vertical` | 可滚动方向:纵 / 横 / 双向。默认 vertical。 |
| `children` | `ReactNode` | — | 视口内的滚动内容。 |
| `classNames` | `ScrollAreaClassNames` | — | 细粒度槽位类名。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `scroll` `scrollbar` `overlay` `viewport` `overflow` `layout` `a11y` |

::: details 需求原文 / 设计意图
需要一块尺寸受限的滚动容器,原生滚动条在跨平台下样式不一致、且会挤占内容宽度造成布局抖动。目标:用原生 overflow:auto 承载滚动(保留键盘可达与惯性),隐藏系统滚动条后自绘一条与主题一致、叠在内容上不占布局的滚动条;滑块尺寸/位置随真实 scrollTop/scrollHeight 同步、可拖拽反向滚动;支持 auto/always/hover/scroll 四种显隐策略与纵/横/双向;几何换算抽成零依赖纯函数便于平移到其它框架壳;尊重 reduced-motion 与 data-ms-motion=off。
:::
