# Grid <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

CSS Grid 布局原语,columns/gap/对齐全经 CSS 变量驱动,支持 minChildWidth 自适应列、容器查询与断点对象响应式。

> **[在展示站中打开 Grid](https://magicood.github.io/magic-scope/#/grid)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖的 CSS Grid 容器,消费 @magic-scope/tokens 的 --ms-&#42; 间距变量。

columns 接受「数字(等宽 repeat) / 模板字符串(如 "1fr auto 2fr") / 断点对象」;minChildWidth 提供时切换为 auto-fit 自适应列、放不下自动折行(优先级高于 columns)。

gap / rowGap / columnGap、align / justify、alignContent / justifyContent、autoFlow(含 dense 回填) / autoRows / autoColumns 均支持「单值或断点对象」响应式;响应式由预展开的静态 @media 块逐级覆盖(条件里 var() 不生效故每断点一个变量)。

container 开启后改用 @container 对父容器宽度自适应而非视口;多态 as(默认 div)+ asChild + forwardRef + 透传原生属性。配套 Grid.Item 做子项级 colSpan / rowSpan / colStart / rowStart 与 alignSelf / justifySelf。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `colSpan` | `Responsive<GridLineValue>` | — | 跨列:数字 → `span n`,或原生关键字(如 `"auto"`),响应式。 |
| `rowSpan` | `Responsive<GridLineValue>` | — | 跨行:数字 → `span n`,或原生关键字,响应式。 |
| `colStart` | `Responsive<GridLineValue>` | — | 起始列网格线(数字或关键字),响应式。 |
| `rowStart` | `Responsive<GridLineValue>` | — | 起始行网格线(数字或关键字),响应式。 |
| `alignSelf` | `Responsive<AlignValue>` | — | 自身块向对齐(align-self,覆盖父 align),响应式。 |
| `justifySelf` | `Responsive<AlignValue>` | — | 自身行向对齐(justify-self,覆盖父 justify),响应式。 |
| `as` | `"div" \| "article" \| "aside" \| "footer" \| "header" \| "li" \| "section"` | — | 多态:渲染为指定标签(默认 div)。 |
| `asChild` | `boolean` | — | 渲染为子元素并把样式/属性合并下去(Slot 风格)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `grid` `layout` `css-grid` `columns` `gap` `responsive` `container-query` `auto-fit` `min-child-width` `polymorphic` `as-child` `grid-item` `col-span` `row-span` `rtl` |

::: details 需求原文 / 设计意图
新增 layout 基础组件 Grid:CSS Grid 原语。需求:columns 支持 number(→repeat(n,minmax(0,1fr)))/模板字符串/响应式断点对象;gap/rowGap/columnGap 接间距 token 且响应式;align/justify(items 与 content);autoFlow;autoRows;minChildWidth(repeat(auto-fit,minmax(minChildWidth,1fr)) 做自适应列);子部件 Grid.Item(colSpan/rowSpan/colStart/rowStart,响应式);多态 as;响应式靠 CSS 变量 + 容器查询/媒体查询。对齐 magic-scope 布局组件标准:多态 + asChild(mergeAsChildProps + composeRefs)、间距 token 化(--ms-space-N)、CSS 逻辑属性 RTL 友好、断点对象响应式(对齐 @magic-scope/tokens 视口断点 sm/md/lg/xl/2xl)、strict TS(exactOptionalPropertyTypes/noUncheckedIndexedAccess,纯逻辑下沉 logic.ts)。自研、零依赖,消费 tokens 的 --ms-&#42; 变量。
:::
