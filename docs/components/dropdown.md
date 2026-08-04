# Dropdown <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

下拉菜单便捷封装,trigger 元素 + 数据驱动菜单项(或 children 复合),点击 / 悬停展开;复用 Popover 定位与 Menu 渲染契约。

> **[在展示站中打开 Dropdown](https://magicood.github.io/magic-scope/#/dropdown)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

比裸 Menu 更省事的下拉入口:trigger 注入 aria-haspopup=menu / aria-expanded / aria-controls,items 数据驱动(label / icon / onClick / disabled / danger / separator / group / checked / href)或 children 复合二选一。

支持 click 与 hover 两种触发、12 向 placement、选中即关(closeOnSelect)、Enter / ↓ 打开与菜单内 ↑↓ / Home / End / typeahead / Esc 全键盘、受控与非受控开合。

子菜单先支持一层(hover 或 → 展开,← 收起);浮层定位与配色复用 Popover / Menu 语义,与全库一致。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `trigger` * | `ReactElement<unknown, string \| JSXElementConstructor<any>>` | — | 触发元素(单个 React 元素,通常是 Button)。会被注入<br>`aria-haspopup=menu` / `aria-expanded` / `aria-controls`,并按 triggerAction 合并交互事件与 ref。 |
| `items` | `DropdownItem[]` | — | 数据驱动的菜单项(item / separator / group + 一层 submenu)。与 children 二选一,优先 items。 |
| `children` | `ReactNode` | — | 复合用法:直接塞自定义菜单内容(如 &lt;Menu.Item&gt;)。仅在不传 items 时生效。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生 hover/focus/danger 配色与发光。默认 primary。 |
| `placement` | `"left" \| "right" \| "bottom" \| "top" \| "top-end" \| "top-start" \| "bottom-end" \| "bottom-start" \| "left-start" \| "left-end" \| "right-start" \| "right-end"` | `bottom-start` | 菜单方位(12 向,与 Popover 对齐)。默认 bottom-start。 |
| `triggerAction` | `"hover" \| "click"` | `click` | 触发方式:点击 / 悬停。默认 click。 |
| `offset` | `number` | `6` | 与 trigger 的间距(px)。默认 6。 |
| `arrow` | `boolean` | `false` | 是否显示指向箭头。默认 false。 |
| `closeOnSelect` | `boolean` | `true` | 选中项后是否关闭菜单。默认 true。<br>选中态项(任意 `checked !== undefined` 的项,无论是否显式给 `selectionRole`)始终保持打开便于连续切换——<br>因为这类项会被渲染成 menuitemcheckbox / menuitemradio,口径与此一致。 |
| `disabled` | `boolean` | `false` | 整体禁用:trigger 不可交互、菜单不展开。<br>非受控用法下置为 true 会同步把内部开合态归零,「禁用→再启用」不会自动复现上次的打开态(需用户重新触发)。 |
| `closeDelay` | `number` | `120` | hover 触发时,移出关闭的延时(ms,留余量防误关)。默认 120。 |
| `open` | `boolean` | — | 受控开合。传入即受控,需配合 onOpenChange。 |
| `defaultOpen` | `boolean` | `false` | 非受控初始开合。默认 false。 |
| `className` | `string` | — | 浮层根附加 className。 |
| `classNames` | `DropdownClassNames` | — | 各部件细粒度 className 槽位。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | 开合变化回调(受控 / 非受控双通道都触发)。<br>· `open` — 变化后的开合状态:true=打开,false=关闭。 |
| `onSelect` | `(item: DropdownItem, index: number) => void` | 菜单级统一选中回调(任一项被选中都触发,便于集中埋点 / 分发)。<br>· `item` — 被选中的菜单项数据。<br>· `index` — 该项在「可聚焦序列」里的序号(子菜单项为 -1)。 |
| `onEscapeKeyDown` | `(event: KeyboardEvent<HTMLElement>) => void` | Esc 关闭前回调,可 `preventDefault()` 拦截阻止关闭。<br>· `event` — 触发关闭的 Esc 键盘事件,可 `preventDefault()` 拦截。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 兼容性备注

透明披露的已知边界与契约(来自 `component.json` 的 `source.notes`):

选中态项口径:任意 `checked !== undefined` 的项(无论是否显式给 selectionRole)都按 menuitemcheckbox/menuitemradio 渲染,且选中后保持菜单打开便于连续切换——渲染推导与 keepOpen 判定同一口径,父项与子菜单项一致。disabled 行为:非受控用法下置 disabled 会同步把内部开合态归零,『禁用→再启用』不自动复现上次打开态。菜单内 Tab 关闭时 preventDefault 并把焦点显式交还 trigger,避免 top-layer 同步隐藏导致焦点落空。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `dropdown` `menu` `navigation` `popover` `overlay` `submenu` `keyboard` `a11y` |

::: details 需求原文 / 设计意图
需要一个比裸 Menu 更省事的下拉入口:业务多数场景就是『一个按钮 + 一组动作项』,不想每次手接 trigger 注入、浮层、roving 焦点。于是做一层便捷封装——trigger 注入 aria-haspopup=menu/aria-expanded/aria-controls,items 数据驱动(label/icon/onClick/disabled/danger/separator/group/checked/href)或 children 复合二选一;支持 click 与 hover 两种触发、12 向 placement、选中即关(closeOnSelect)、Enter/↓ 打开与菜单内 ↑↓/Home/End/typeahead/Esc 全键盘、受控与非受控开合。子菜单先支持一层(hover 或 → 展开,← 收起),深层嵌套留 TODO,诚实备注不藏坑。浮层定位与配色复用已落地的 Popover/Menu 语义,保证与全库一致。
:::
