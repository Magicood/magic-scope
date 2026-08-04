# Tabs <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

标签页,受控 / 非受控双模式,完整 ARIA 与方向键导航,underline / pill 两变体。

> **[在展示站中打开 Tabs](https://magicood.github.io/magic-scope/#/tabs)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

role="tablist" / "tab" / "tabpanel" 全套 ARIA 关联,采用 roving tabIndex(仅选中项进 Tab 序)。键盘 ← → ↑ ↓ 在可用标签间循环切换(跳过 disabled),Home / End 跳首尾。underline 变体选中项下方主色条带发光,pill 变体选中项 primary 实底。省略 content 时只切换标签、不渲染 tabpanel,适合外部自管内容区。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/tabs.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` * | `TabItem[]` | — | 标签项列表。 |
| `value` | `string` | — | 受控选中值。传入则由外部托管,需配合 onChange。 |
| `defaultValue` | `string` | — | 非受控初始选中值。缺省取第一个可用项。 |
| `variant` | `"underline" \| "pill"` | `underline` | 视觉变体:underline(下划线)\| pill(实底胶囊),默认 underline。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生配色(读 6 槽位)。默认 primary。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `orientation` | `"horizontal" \| "vertical"` | `horizontal` | 朝向:horizontal(横向)\| vertical(竖排),默认 horizontal。竖排时方向键改 ↑/↓。 |
| `keepMounted` | `boolean` | `false` | 渲染所有 panel(未选隐藏不卸载,保留滚动 / 表单态)。默认 false。 |
| `addable` | `boolean` | `false` | 是否在 tablist 末尾渲染「新增标签」按钮,点击触发 onEdit('', 'add')。默认 false。 |
| `addLabel` | `ReactNode` | — | 新增按钮文案 / 内容(ReactNode);默认为「+」符号。 |
| `className` | `string` | — | 外部类名(作用于最外层容器)。 |
| `classNames` | `TabsClassNames` | — | 关键子部件类名。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string) => void` | 选中变化回调。<br>· `value` — 新选中项的 value。 |
| `onTabClick` | `(value: string, event: MouseEvent<HTMLDivElement, MouseEvent>) => void` | 点击 tab 的瞬间副作用入口(点已选中 tab 时 onChange 不触发,但此处仍触发)。<br>在内部切换之前调用;你可 event.preventDefault() 阻断切换。<br>· `value` — 被点击 tab 的 value。<br>· `event` — 该次点击的原始鼠标事件,可 `preventDefault()` 阻断内部切换。 |
| `onEdit` | `(value: string, action: TabsEditAction) => void` | 增删标签回调(对标 editable-card)。<br>· `value` — remove 时为被关闭项的 value;add 时为空串 ''。<br>· `action` — 动作类别:'remove'=点关闭按钮,'add'=点新增按钮。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `tabs` `navigation` `tablist` `tabpanel` `controlled` `uncontrolled` `keyboard` `aria` `underline` `pill` `tone` `vertical` `orientation` `size` `indicator` `editable` `closable` `addable` `badge` `icon` `keep-mounted` `render-prop` `compose-events` `arcane` `dark` |

::: details 需求原文 / 设计意图
标签页组件,支持受控/非受控、方向键切换与 underline / pill 两种风格变体。补强到旗舰深度(对标 Button/Input/Text):tone 7 色调读 6 槽位、横向/竖排、size、魔法滑块 indicator、可编辑(closable/addable/onEdit)、icon/badge/renderTab、keepMounted、onTabClick、根透传原生事件 + composeEventHandlers。magic-scope 结构/导航组件:自研、消费 tokens,完整状态、键盘可达、fx/motion 开关、逻辑属性。
:::
