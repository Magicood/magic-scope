# Table <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

数据表格,列定义 + 行数据驱动,支持斑马纹与行 hover 高亮。

> **[在展示站中打开 Table](https://magicood.github.io/magic-scope/#/table)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

列定义(key / header / align / 自定义 render)+ 行数据驱动;斑马纹、行 hover、粘性表头等按需开启。逻辑属性,设备适配。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/table.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `columns` * | `TableColumn<T>[]` | — |  |
| `data` * | `T[]` | — |  |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调(选中行/hover 强调条/排序箭头激活态读 tone 槽位)。默认 primary。 |
| `size` | `"sm" \| "md" \| "lg"` | — | 行高密度三档(组件级,叠加在 token 密度上)。默认 md。 |
| `stripe` | `boolean` | — | 斑马纹。默认 false。 |
| `hoverable` | `boolean` | — | 行 hover 高亮。默认 false。 |
| `getRowKey` | `((row: T, index: number) => RowKey)` | — | 行 key 派生,默认行索引。 |
| `caption` | `ReactNode` | — | 无障碍标题。 |
| `className` | `string` | — |  |
| `classNames` | `TableClassNames` | — | 关键子部件类名注入。 |
| `tableProps` | `Omit<DetailedHTMLProps<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>, "ref">` | — | 透传给内层 &lt;table&gt; 的属性(rest 默认落到外层 wrap)。 |
| `sortState` | `SortState \| null` | — | —— 排序(受控:传 sortState 含 null;非受控:用 defaultSortState)。 |
| `defaultSortState` | `SortState \| null` | — |  |
| `rowSelection` | `RowSelection<T>` | — | —— 行选择(受控)。 |
| `expandable` | `Expandable<T>` | — | —— 可展开行(受控/非受控)。 |
| `loading` | `boolean` | — | —— 加载态:覆盖一层 Spinner 遮罩(aria-busy)。 |
| `empty` | `ReactNode` | — | —— 空态内容,缺省走 i18n table.empty。 |
| `skeletonRows` | `number` | — | —— 空数据 + loading 时渲染 N 行骨架,默认 0(仅遮罩)。 |
| `summary` | `boolean` | — | —— 汇总/页脚行:渲染在 tfoot,接 column.renderSummary。 |
| `footer` | `ReactNode` | — | —— 自定义页脚内容(覆盖 summary 的列式渲染,整行自渲染)。 |
| `stickyHeader` | `boolean` | — | —— 粘性表头:开启即限高可滚、表头吸顶。 |
| `maxHeight` | `string \| number` | — | 配合 stickyHeader 的最大高度;缺省随动态视口。 |
| `ref` | `Ref<HTMLTableElement>` | — |  |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onSortChange` | `(next: SortState \| null) => void` | 排序状态变化回调。<br>· `next` — 新的排序状态(含 columnKey 与 direction);取消排序时为 null |
| `onRowClick` | `(row: T, index: number, e: MouseEvent<HTMLTableRowElement, MouseEvent>) => void` | —— 行级点击。<br>· `row` — 被点击的行数据<br>· `index` — 该行在当前渲染数据中的下标<br>· `e` — 原生鼠标点击事件 |
| `onRowDoubleClick` | `(row: T, index: number, e: MouseEvent<HTMLTableRowElement, MouseEvent>) => void` | —— 行级双击(双击编辑场景)。<br>· `row` — 被双击的行数据<br>· `index` — 该行在当前渲染数据中的下标<br>· `e` — 原生鼠标双击事件 |
| `onRowContextMenu` | `(row: T, index: number, e: MouseEvent<HTMLTableRowElement, MouseEvent>) => void` | —— 行级右键(右键菜单场景)。<br>· `row` — 触发右键菜单的行数据<br>· `index` — 该行在当前渲染数据中的下标<br>· `e` — 原生右键(contextmenu)事件 |
| `onRow` | `(row: T, index: number) => RowEventHandlers` | —— Ant 式行事件工厂:返回该行的多个事件处理器。<br>· `row` — 当前行数据<br>· `index` — 该行在当前渲染数据中的下标 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `table` `data-display` `data-table` `grid` `sort` `selection` `expandable` `fixed-column` `summary` `tone` `density` `sticky` `loading` `empty` `stripe` `row-events` `react` |

::: details 需求原文 / 设计意图
数据表格:列定义 + 行数据驱动,支持排序/行选择/可展开行/列固定/行高密度/汇总行,斑马纹与行 hover 高亮,圆角描边外框与横向 overflow,采用逻辑属性。magic-scope 数据展示组件:自研、消费 tokens,接 tone resolver 6 槽位、魔法动效(行 stagger 进场/排序脉冲/选中 inset glow)、完整状态、键盘可达、fx/motion 开关、i18n 文案、行级事件留口与 ...rest 透传、逻辑属性、设备适配。
:::
