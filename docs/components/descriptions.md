# Descriptions <Badge type="tip" text="stable" /> <Badge type="info" text="v0.0.0" />

描述列表,键值对成组展示,支持多列折行、跨列 span、bordered 表格态与语义色调。

> **[在展示站中打开 Descriptions](https://magicood.github.io/magic-scope/#/descriptions)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

数据驱动双通道:items 数组或 Descriptions.Item 复合子组件;span 跨列、行末 filler 补齐由纯逻辑层计算(可单测、可平移其它框架)。

CSS Grid 布局:horizontal(标签内容同行)/ vertical(标签在上内容在下);列数支持响应式断点对象(每断点一个 CSS 变量 + 静态 @media 级联)。

bordered 表格态、size 三档随密度缩放、colon 冒号、tone 七色语义(标签底 / 强调描边 / 发光);title / extra / emptyText 为 ReactNode 槽,空态走 i18n。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | `DescriptionsItem[]` | — | 描述项数据(也可改用 Descriptions.Item 复合子组件;两者择一,items 优先)。 |
| `columns` | `ResponsiveColumns` | — | 列数:<br>- `number` → 固定逻辑列数(默认 3);<br>- 断点对象 → 各断点列数(如 `{ base: 1, md: 2, lg: 3 }`),随屏收窄,<br>  靠每断点一个 CSS 变量 + Descriptions.css 静态<br>@media 级联(条件里 var() 不生效)。 |
| `bordered` | `boolean` | — | 带边框表格态(单元描边 + 标签底色)。默认 false。 |
| `size` | `"sm" \| "md" \| "lg"` | — | 尺寸(随密度缩放间距与字号)。默认 md。 |
| `layout` | `"horizontal" \| "vertical"` | — | 排布:horizontal(标签内容同行)默认 / vertical(标签在上、内容在下)。 |
| `colon` | `boolean` | — | 标签后是否带冒号(horizontal 态生效)。默认 true。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调:派生标签底色 / 描边强调 / 发光。默认 neutral。 |
| `title` | `ReactNode` | — | 标题(ReactNode 槽,放在头部左侧)。 |
| `extra` | `ReactNode` | — | 头部右侧附加内容(操作 / 状态 ReactNode 槽)。 |
| `classNames` | `DescriptionsClassNames` | — | 部件级 className。 |
| `emptyText` | `ReactNode` | — | 空数据时的占位文案(默认走 i18n empty.description)。 |
| `as` | `"div" \| "article" \| "aside" \| "dl" \| "section"` | — | 多态:渲染为指定标签(默认 div)。 |
| `children` | `ReactNode` | — | 项内容(value 的 JSX 形态;value/children 二者择一,value 优先)。 |
| `key` | `string \| number` | — | 唯一键(列表渲染用;缺省回退索引)。 |
| `label` | `ReactNode` | — | 项标签(键)。 |
| `value` | `ReactNode` | — | 项内容(值)。`children` 是 `value` 的别名,二者择一。 |
| `span` | `number` | — | 跨列数(占用多少逻辑列;默认 1)。超过本行剩余列会被收窄到剩余宽度。 |
| `className` | `string` | — | 该项的内容部件附加 className。 |
| `labelClassName` | `string` | — | 该项标签部件附加 className。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `descriptions` `description-list` `key-value` `data-display` `grid` `responsive` `bordered` `definition-list` `detail` |

::: details 需求原文 / 设计意图
描述列表(键值展示,对标 AntD Descriptions):items {label,value/children,span?}&#91;] 或复合 Descriptions.Item 子组件;columns(number 默认 3,或响应式断点对象,随屏收窄)、bordered(带边框表格态)、size(sm/md/lg)、layout(horizontal 默认 / vertical)、title?/extra? 槽、colon。用 CSS grid 排布,span 跨列。多态 as。logic.ts 放 columns 响应式 + span 布局解析。遵循 magic-scope 旗舰标准(tone 6 槽位 / 密度缩放 / 减动降级 / strict TS / i18n 空态 / 留口)。
:::
