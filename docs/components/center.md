# Center <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

居中盒,把子内容在水平 / 垂直 / 双轴上居中,支持多态根标签与响应式。

> **[在展示站中打开 Center](https://magicood.github.io/magic-scope/#/center)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,底层用 flex + place-items,消费 @magic-scope/tokens 的间距 token。

多态 `as`(默认 div)+ `asChild`(Slot 风格,不额外包一层 DOM);`axis`(both / horizontal / vertical)、`inline`(inline-flex 收缩到内容)、`gap` / `padding`(间距档)、`minBlockSize`(撑高度,常用于整屏垂直居中)。

axis / gap / padding / minBlockSize 均支持「单值或断点对象」响应式;间距走 CSS 逻辑属性(gap / padding / min-block-size),RTL 友好。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `ElementType` | — | 多态根标签。默认 `div`。语义需要时换 `section` / `main` / `article` 等。<br>与 `asChild` 互斥(asChild 优先,渲染为传入的子元素)。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并把居中样式合并上去(Radix Slot 风格,由子元素自带内容)。<br>用于「让一个已有元素直接成为居中盒」,不额外包一层 DOM。 |
| `axis` | `Responsive<CenterAxis>` | `both` | 居中轴。`both`(默认,水平+垂直)/ `horizontal`(仅水平)/ `vertical`(仅垂直)。<br>支持断点对象,如 `{ base: 'vertical', md: 'both' }`。 |
| `inline` | `boolean` | `false` | 行内居中盒:用 `inline-flex` 而非 `flex`,宽度收缩到内容、可与文字同行。默认 false。 |
| `gap` | `Responsive<SpaceValue>` | — | 子项间距(多个子节点时)。数字 = 间距档(映射 `--ms-space-*`,档位 0/1/2/3/4/6/8),<br>字符串 = 任意 CSS 长度(逃生舱)。支持断点对象,如 `{ base: 2, md: 4 }`。 |
| `padding` | `Responsive<SpaceValue>` | — | 内边距(逻辑属性 `padding`,RTL 友好)。同 `gap` 取值规则。支持断点对象。 |
| `minBlockSize` | `Responsive<SizeValue>` | — | 撑起最小高度(逻辑属性 `min-block-size`)。数字按 px,字符串原样<br>(如 `'100dvh'` / `'var(--ms-viewport-h)'`)。支持断点对象。常用于整屏垂直居中。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `layout` `center` `centering` `flexbox` `place-items` `vertical-center` `responsive` `polymorphic` `rtl` |

::: details 需求原文 / 设计意图
需要一个纯结构性的居中盒:把子内容水平+垂直居中(display flex/grid place-items center),可选 inline(inline-flex)、axis(both/horizontal/vertical)切换居中轴、minBlockSize 撑高度。多态 as + asChild + ...rest 透传。对齐 magic-scope layout 标准:间距 token 化、CSS 逻辑属性 RTL 友好、axis/gap/padding/minBlockSize 支持断点对象响应式(断点对象解析在 logic.ts 零 React)。对标 Chakra/Mantine 的 Center,叠加响应式断点对象与多态留口的优势。
:::
