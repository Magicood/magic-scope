# Flex <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

通用 flexbox 布局原语,direction/align/justify/wrap/gap 全经 CSS 变量驱动,支持断点对象响应式。

> **[在展示站中打开 Flex](https://magicood.github.io/magic-scope/#/flex)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖的 flexbox 容器。direction / align / justify / wrap / gap 均接受「单值 或 断点对象」(如 gap=&#123;&#123; base: 2, md: 4 }}),响应式由预展开的静态 @media 块逐级覆盖。

间距走 --ms-space-&#42; token、对齐用逻辑值(flex-start/end)故 RTL 友好;多态 as(默认 div)+ asChild + forwardRef + 透传原生属性。配套 Flex.Item 做子项级 grow/shrink/basis/align/order。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `ElementType` | — | 多态根标签(默认 div)。语义场景可传 section / nav / ul 等。 |
| `asChild` | `boolean` | `false` | 渲染为子元素并保留 flex 容器样式(Slot 风格,子元素自带内容)。 |
| `inline` | `boolean` | `false` | 用 display:inline-flex(随内容收缩,不独占一行)。默认 false。 |
| `direction` | `Responsive<FlexDirection>` | — | 主轴方向。支持断点对象。默认 row。 |
| `align` | `Responsive<FlexAlign>` | — | 交叉轴对齐(align-items)。支持断点对象。 |
| `justify` | `Responsive<FlexJustify>` | — | 主轴分布(justify-content)。支持断点对象。 |
| `wrap` | `Responsive<FlexWrap>` | — | 换行。支持断点对象;布尔简写 true=wrap / false=nowrap。 |
| `gap` | `Responsive<GapValue>` | — | 行列统一间距(数字档映射 --ms-space-&#42;,或自定义 CSS 长度)。支持断点对象。 |
| `rowGap` | `Responsive<GapValue>` | — | 仅行间距(覆盖 gap 的纵向分量)。支持断点对象。 |
| `columnGap` | `Responsive<GapValue>` | — | 仅列间距(覆盖 gap 的横向分量)。支持断点对象。 |
| `grow` | `number \| boolean` | — | flex-grow:布尔简写 true=1 / false=0,或具体数值。 |
| `shrink` | `number \| boolean` | — | flex-shrink:布尔简写 true=1 / false=0,或具体数值。 |
| `basis` | `string \| number` | — | flex-basis:数字按 px,字符串原样(如 '20%' / 'auto')。 |
| `order` | `number` | — | 显示顺序(order)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `flex` `flexbox` `layout` `responsive` `gap` `direction` `align` `justify` `wrap` `as-child` `polymorphic` `rtl` |

::: details 需求原文 / 设计意图
magic-scope layout 分类的 flexbox 原语。对标主流库的 Flex/HStack/VStack:全部布局属性支持断点对象响应式(本库「多端适配」体现),响应式靠 JS 解析为带断点后缀的 CSS 变量 + 构建期预展开的静态 @media 块逐级提升(因 @media 条件里 var() 不生效)。间距 token 化(--ms-space-&#42;)、对齐走 flex-start/flex-end 逻辑值 RTL 友好、多态 as + asChild 留口。纯逻辑放 logic.ts 以便单测与跨框架平移。
:::
