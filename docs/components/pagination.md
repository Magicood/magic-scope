# Pagination <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

分页导航,首尾恒显、当前页两侧对称展开,页数过多时省略号折叠。

> **[在展示站中打开 Pagination](https://magicood.github.io/magic-scope/#/pagination)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。

&lt;nav aria-label="pagination"&gt; 内含上一页 / 页码 / 下一页:当前页 primary 实底 + aria-current,其余 ghost;页数超出可展示槽位时用省略号占位折叠;首尾页禁用对应方向键。键盘可达,focus-visible 显示发光环。受控 page,翻页走 onPageChange。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/pagination.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `page` * | `number` | — | 当前页(1 起)。 |
| `total` | `number` | — | 总页数。当传 `total`(条目数)+ `pageSize` 时可不传,内部据此推算。 |
| `siblingCount` | `number` | `1` | 当前页两侧各显示的页码数。默认 1。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生配色。默认 primary。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `simple` | `boolean` | `false` | 精简变体:仅「上一页 当前/总 下一页」,移动端友好。 |
| `totalItems` | `number` | — | 总条目数(配合 pageSize 推算总页数、显示 showTotal / 区间)。 |
| `pageSize` | `number` | — | 每页条数。传入即受控;不传则使用 pageSizeOptions&#91;0] 作非受控默认。 |
| `pageSizeOptions` | `number[]` | `[10, 20, 50, 100]` | 每页条数候选,提供时渲染 page size 选择器。默认 &#91;10, 20, 50, 100]。 |
| `showSizeChanger` | `boolean` | — | 是否显示每页条数选择器(需 totalItems 才有意义)。默认在提供 pageSizeOptions 且有 totalItems 时显示。 |
| `showTotal` | `((total: number, range: [number, number]) => ReactNode)` | — | 显示总数/区间文案。`(total, range) =&gt; ReactNode`,range 为当前页覆盖的 &#91;start, end]。 |
| `showQuickJumper` | `boolean` | `false` | 显示快速跳页输入框。 |
| `prevIcon` | `ReactNode` | — | 上一页图标(替换默认 CSS 箭头)。 |
| `nextIcon` | `ReactNode` | — | 下一页图标。 |
| `renderItem` | `((item: PaginationRenderItem) => ReactNode)` | — | 自定义渲染单个分页项(页码 / 箭头 / 省略号)。返回的节点替换默认内容,<br>仍由组件包裹 `&lt;li&gt;` 与按钮容器并接管点击。返回 `null` 用默认渲染。 |
| `itemRender` | `((page: number, type: PaginationItemType, originalElement: ReactNode) => ReactNode)` | — | 包装页码项为自定义元素(如 `&lt;a href&gt;`)。优先级高于内部按钮:<br>返回的元素由你负责承载内容,组件仍会 compose 其 onClick 触发翻页。 |
| `className` | `string` | — | 组件根 nav 自身 className。 |
| `classNames` | `PaginationClassNames` | — | 细分槽位 className。 |
| `...props` | `ComponentPropsWithoutRef<'nav'>` | — | 透传原生 nav 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onPageChange` | `(page: number) => void` | 翻页回调。<br>· `page` — 目标页码(1 起)。 |
| `onPageSizeChange` | `(pageSize: number) => void` | 每页条数变化回调。<br>· `pageSize` — 新的每页条数。 |
| `onChange` | `(page: number, pageSize: number) => void` | 聚合回调:页码或每页条数变化都会触发,便于直接驱动数据请求。<br>· `page` — 变化后的目标页码(1 起)。<br>· `pageSize` — 变化后的每页条数。 |
| `onQuickJump` | `(page: number) => void` | 快速跳页(回车 / 失焦提交)回调。<br>· `page` — 跳页输入框提交的目标页码(已夹取到合法范围,1 起)。 |
| `onItemClick` | `(page: number, type: PaginationItemType, event: MouseEvent<Element, MouseEvent>) => void` | 页码项点击(在内部翻页之前),可 `preventDefault()` 阻断内部翻页。<br>· `page` — 该项对应的目标页码(prev/next 为相邻页)。<br>· `type` — 该项类型:'page' / 'prev' / 'next'(ellipsis 不触发点击)。<br>· `event` — 该次点击的原始鼠标事件,可 `preventDefault()` 阻断内部翻页。 |

此外透传原生 `<nav>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `navigation` `pagination` `pager` `page` `nav` `page-size` `quick-jumper` `simple` `tone` `size` `render-item` `i18n` `dark` `arcane` |

::: details 需求原文 / 设计意图
分页导航:上一页/下一页 + 页码,当前页主色实底发光,过多页用省略号折叠,键盘可达且 focus-visible 显示发光环。工程要求(magic-scope 结构/导航组件):自研、消费 tokens,完整状态、键盘可达、fx/motion 开关、逻辑属性。
:::
