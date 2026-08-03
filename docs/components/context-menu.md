# ContextMenu <Badge type="tip" text="stable" /> <Badge type="info" text="v0.0.0" />

右键菜单,在光标处弹出,越界自动夹回视口,portal 到 body,键盘可达。

> **[在展示站中打开 ContextMenu](https://magicood.github.io/magic-scope/#/context-menu)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖。右键(contextmenu)在包裹区域内弹出,定位在光标处并在越界时自动夹回视口;浮层 portal 到 body。

点选 / 点外 / Esc / 滚动均关闭,菜单内支持 ↑↓ / Home / End / Enter 键盘导航。菜单项复用 Menu 的 .ms-menu__item 视觉(含 disabled / danger),区别于点击锚定的 Menu。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/context-menu.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` * | `MenuItem[]` | — | 菜单项列表(与 Menu 同结构:item / separator / group + icon / shortcut / checked / href)。 |
| `children` * | `ReactNode` | — | 响应右键的区域内容。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生 hover/focus/danger 配色与发光。默认 primary。 |
| `className` | `string` | — | 菜单浮层附加类名(作用于 .ms-context-menu)。 |
| `classNames` | `ContextMenuClassNames` | — | 关键子部件 className 定制。 |
| `renderItem` | `((ctx: ContextMenuItemRenderContext) => ReactNode)` | — | 自定义渲染每一项(render-prop)。返回的元素会替换默认项的内部内容。 |
| `overlayProps` | `(Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref"> & { [key: `data-${string}`]: string \| ... 2 more ...; })` | — | 浮层根上挂载的原生属性 / 事件(data-* / onScroll / aria-* 等)。 |
| `open` | `boolean` | — | 受控开合状态。传入即受控,需配合 onOpenChange。 |
| `defaultOpen` | `boolean` | `false` | 非受控初始开合。默认 false。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | 开合变化回调(受控 / 非受控双通道都会触发)。<br>· `open` — 变化后的开合状态:true=打开,false=关闭。 |
| `onContextMenu` | `(event: MouseEvent<HTMLDivElement, MouseEvent>) => void` | 菜单打开前回调(右键定位算出坐标后、open 置 true 前触发)。<br>可 `preventDefault()` 阻止本次打开(便于「按目标决定是否弹菜单」)。<br>· `event` — 包裹区右键的原始鼠标事件,可 `preventDefault()` 阻止本次打开。 |
| `onOpen` | `(event: MouseEvent<HTMLDivElement, MouseEvent>, position: { x: number; y: number; }) => void` | 菜单已打开回调,带原生事件与光标坐标(右键坐标对外)。<br>· `event` — 触发打开的原始右键鼠标事件。<br>· `position` — 菜单打开处的光标坐标 `{ x, y }`(视口坐标系,px)。 |
| `onSelect` | `(item: MenuItem, index: number) => void` | 菜单级统一选中回调(任一项被选中都触发,便于集中埋点 / 分发)。<br>· `item` — 被选中的菜单项数据。<br>· `index` — 该项在「可聚焦序列」里的序号。 |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | Esc 关闭前回调,可 `preventDefault()` 拦截阻止关闭。<br>· `event` — 触发关闭的 Esc 原生键盘事件,可 `preventDefault()` 拦截。 |
| `onPointerDownOutside` | `(event: PointerEvent) => void` | 点击浮层外部关闭前回调,可 `preventDefault()` 拦截阻止关闭。<br>· `event` — 浮层外部的原生 pointerdown 事件,可 `preventDefault()` 拦截。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `context-menu` `right-click` `menu` `overlay` `cursor` `tone` `typeahead` `controllable` `portal` `keyboard` |

::: details 需求原文 / 设计意图
补齐弹窗体系:右键菜单。原创实现,与点击锚定的 Menu 不重复——由 contextmenu 事件触发、定位在鼠标光标处(夹回视口),复用 Menu 的项结构与 .ms-menu__item 样式;点外/Esc/滚动关闭,键盘方向键可达。旗舰补强:复用 Menu MenuItem/logic(separator/group/icon/shortcut/checked/href + typeahead)、接 tone、事件全留口(onContextMenu 可拦截 / onOpen 带坐标 / onOpenChange 受控双通道 / onSelect / onEscapeKeyDown / onPointerDownOutside)、包裹根与浮层透传原生属性、classNames/renderItem。
:::
