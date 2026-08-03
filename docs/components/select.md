# Select <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

下拉选择,Popover API + CSS Anchor Positioning,键盘全可达。

> **[在展示站中打开 Select](https://magicood.github.io/magic-scope/#/select)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,用满平台原生能力:浮层进 top-layer 用 Popover API(popover="auto" 自带点外 / Esc 关闭),定位用 CSS Anchor Positioning,并以 @supports 降级为普通贴近,保证不支持时仍可用。

键盘交互(↑↓ / Enter / Space / Esc / Home / End)自实现,采用 WAI-ARIA listbox + aria-activedescendant 模型;受控 value,选项可逐个禁用,完整 focus-visible 发光与 disabled。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/select.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| string[]` | — | 当前选中值(受控)。单选传 string;多选传 string&#91;]。 |
| `defaultValue` | `string \| string[]` | — | 默认选中值(非受控)。 |
| `options` * | `SelectOption[]` | — | 选项列表。 |
| `placeholder` | `string` | — | 未选中时的占位文本。默认走 i18n select.placeholder。 |
| `size` | `"sm" \| "md" \| "lg"` | — | 尺寸。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | — | 语义色调,派生高亮/打勾/发光。默认 primary。 |
| `disabled` | `boolean` | — | 是否禁用整个选择器。 |
| `loading` | `boolean` | — | 加载态:listbox 显示加载文案、trigger 不可展开内容。 |
| `multiple` | `boolean` | — | 多选模式:trigger 显示 tag,select.removeTag/selected 文案。 |
| `searchable` | `boolean` | — | 可搜索:listbox 顶部内联搜索框,按 query 过滤。 |
| `clearable` | `boolean` | — | 有值时显示清除按钮(走 input.clear)。 |
| `prefix` | `ReactNode` | — | trigger 前置内容(图标 / 文字)。 |
| `renderOption` | `((option: SelectOption, state: { active: boolean; selected: boolean; }) => ReactNode)` | — | 自定义渲染 option 内容(覆盖默认 icon+label+description 布局)。 |
| `renderValue` | `((option: SelectOption) => ReactNode)` | — | 自定义渲染 trigger 内已选值(单选)。 |
| `classNames` | `SelectClassNames` | — | 部件级 className。 |
| `open` | `boolean` | — | 受控/非受控开合状态(受控时配 onOpenChange)。 |
| `aria-label` | `string` | — | trigger 的无障碍名称(无可见 label 时建议提供)。 |
| `aria-labelledby` | `string` | — | 关联可见 label 的 id。 |
| `className` | `string` | — | 附加类名(根 trigger / group)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string \| string[], option?: SelectOption) => void` | 选中变化回调。<br>· `value` — 选中后的新值;单选为 string,多选为 string&#91;]。<br>· `option` — 本次选中/切换涉及的完整 option;多选为被切换的那一项,清除时为 undefined。 |
| `onOpenChange` | `(open: boolean) => void` | 开合变化回调(受控/非受控双通道)。<br>· `open` — 变化后的开合状态;true 为展开,false 为收起。 |
| `onClose` | `(reason: SelectCloseReason) => void` | 关闭时回调。<br>· `reason` — 关闭来源,区分 select/trigger/escape/tab/outside 等触发路径,便于按来源分别处理。 |
| `onEscapeKeyDown` | `(event: KeyboardEvent<HTMLDivElement>) => void` | Esc 关闭可拦截:在回调里 preventDefault 阻断关闭。<br>· `event` — 触发关闭的键盘事件;调用 event.preventDefault() 可阻止本次 Esc 关闭。 |
| `onPointerDownOutside` | `(event: Event) => void` | 点外关闭可拦截:在回调里 preventDefault 阻断关闭。<br>· `event` — 点击浮层外部触发的原生 pointerdown 事件;调用 event.preventDefault() 可阻止本次点外关闭。 |
| `onHighlightChange` | `(index: number, option?: SelectOption) => void` | listbox 高亮项变化(高亮即预览类联动)。<br>· `index` — 当前高亮项在可见选项中的索引;无高亮时为 -1。<br>· `option` — 当前高亮项对应的完整 option;无高亮(index 为 -1)时为 undefined。 |
| `onSelect` | `(option: SelectOption) => void` | 拿到完整 option 的选中回调(选中即触发,多选每次切换都触发)。<br>· `option` — 本次被选中/切换的完整 option。 |
| `onClear` | `() => void` | 清除回调(点击清除按钮、清空已选值时触发,无参数)。 |
| `onSearch` | `(query: string) => void` | 搜索 query 变化回调。<br>· `query` — 搜索框当前的查询文本。 |
| `onFocus` | `(event: FocusEvent<HTMLButtonElement, Element>) => void` | trigger 获焦(表单聚焦校验)。 |
| `onBlur` | `(event: FocusEvent<HTMLButtonElement, Element>) => void` | trigger 失焦(表单 onBlur 校验)。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `select` `dropdown` `listbox` `combobox` `forms` `multiple` `searchable` `clearable` `tone` `i18n` `controlled` |

::: details 需求原文 / 设计意图
把最小版 Select 补强到生产级深度,对标旗舰 Button/Input/Text:接 tone 槽位系统、i18n 文案、clearable/loading/空态/searchable/multiple、render 槽位与 option icon/description、classNames 部件定制、密度缩放、motion/fx 一键降级、完整事件契约(onOpenChange 受控双通道 + onClose(reason) + 可拦截 Esc/点外 + onHighlightChange/onSelect/onClear/onSearch/onFocus/onBlur + 原生透传与 composeEventHandlers 合并)。magic-scope overlay 组件:用满平台原生能力(Popover API + CSS Anchor Positioning)自研,带降级、键盘可达、fx/motion 开关、入场动画。
:::
