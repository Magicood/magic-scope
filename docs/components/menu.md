# Menu <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

下拉菜单,Popover API + CSS Anchor Positioning,键盘可达,支持禁用项与危险项。

> **[在展示站中打开 Menu](https://magicood.github.io/magic-scope/#/menu)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

浮层进 top-layer 用 Popover API(popover="auto",自带点外 / Esc 的 light-dismiss),定位用 CSS Anchor Positioning 并以 @supports 降级为 absolute,保证不支持时仍可用。

键盘交互自实现:↑↓ 移动焦点(跳过 disabled)、Home / End 跳首尾、Enter / Space 触发、Esc 关闭、Tab 离开即收起;选中后菜单关闭并把焦点交还 trigger。danger 项用 danger 色高亮。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/menu.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `trigger` * | `ReactElement<unknown, string \| JSXElementConstructor<any>>` | — | 触发元素(通常是 Button)。点击展开菜单。 |
| `items` * | `MenuItem[]` | — | 菜单项列表(支持 item / separator / group)。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生 hover/focus/danger 配色与发光。默认 primary。 |
| `placement` | `"left" \| "right" \| "bottom" \| "top"` | `bottom` | 主轴方位:菜单出现在 trigger 的哪一侧。默认 bottom。 |
| `align` | `"center" \| "end" \| "start"` | `start` | 交叉轴对齐。默认 start。 |
| `offset` | `number` | `8` | 与 trigger 的间距(px)。默认 8。 |
| `open` | `boolean` | — | 受控开合状态。传入即受控,需配合 onOpenChange。 |
| `defaultOpen` | `boolean` | `false` | 非受控初始开合。默认 false。 |
| `renderItem` | `((ctx: MenuItemRenderContext) => ReactNode)` | — | 自定义渲染每一项(render-prop)。返回的元素会替换默认项的内部内容。 |
| `className` | `string` | — | 外部类名(作用于浮层根)。 |
| `classNames` | `{ root?: string; item?: string; separator?: string \| undefined; groupLabel?: string \| undefined; } \| undefined` | — | 关键子部件 className 定制。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | 开合变化回调(受控/非受控双通道都会触发)。<br>· `open` — 变化后的开合状态:true=打开,false=关闭。 |
| `onSelect` | `(item: MenuItem, index: number) => void` | 菜单级统一选中回调(任一项被选中都触发,便于集中埋点/分发)。<br>· `item` — 被选中的菜单项数据。<br>· `index` — 该项在「可聚焦序列」里的序号。 |
| `onEscapeKeyDown` | `(event: KeyboardEvent<HTMLElement>) => void` | Esc 关闭前回调,可 `preventDefault()` 拦截阻止关闭。<br>· `event` — 触发关闭的 Esc 键盘事件,可 `preventDefault()` 拦截。 |
| `onPointerDownOutside` | `(event: PointerEvent) => void` | 点击浮层外部关闭前回调,可 `preventDefault()` 拦截阻止关闭。<br>· `event` — 浮层外部的原生 pointerdown 事件,可 `preventDefault()` 拦截。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `menu` `dropdown` `popover` `overlay` `anchor-positioning` `tone` `checkbox` `radio` `group` `separator` `shortcut` `typeahead` `controlled` `composable` `keyboard` |

::: details 需求原文 / 设计意图
下拉菜单:Popover API 进 top-layer + CSS Anchor Positioning 锚定 trigger,支持 ↑↓/Enter/Esc 键盘操作、danger 项与禁用项,带发光入场动画,锚定位不支持时优雅降级。magic-scope overlay 组件:用满平台原生能力(Popover API + CSS Anchor Positioning)自研,带降级、键盘可达、fx/motion 开关、入场动画。补强到旗舰深度:对标 Button/Input/Text —— item/separator/group/icon/shortcut/checkbox/radio/href、tone 槽位、受控双通道、菜单级与项级回调、可拦截浮层关闭、trigger/根全事件 compose 与透传、组合式 API + renderItem、typeahead。
:::
