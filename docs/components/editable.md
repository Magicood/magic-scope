# Editable <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

行内编辑,点击 / 聚焦文本切换为输入态,Enter 或失焦提交、Esc 取消还原;支持多行、受控双通道与两态渲染留口。

> **[在展示站中打开 Editable](https://magicood.github.io/magic-scope/#/editable)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

把静态文本就地变成可编辑输入的轻控件:展示态看似纯文本(空值显示占位),点击或键盘进入编辑态,Enter / 失焦提交、Esc 取消还原,值变化才回调。

支持多行(multiline→textarea)、受控 / 非受控值(value / defaultValue)与编辑态(editing / defaultEditing)双通道、selectAllOnFocus、submitOnBlur / submitOnEnter 开关、maxLength。

能进 Form(invalid + aria-invalid),并给 renderPreview / renderEdit 完全替换两态渲染的口子;提交 / 取消的键盘语义抽成零 React 纯逻辑。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 受控值(传入即受控,配合 onChange)。 |
| `defaultValue` | `string` | — | 初始值(非受控)。默认空串。 |
| `placeholder` | `string` | — | 占位文本(值为空时展示态显示)。默认取 i18n select.placeholder。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随密度 data-ms-density 缩放)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | `primary` | 语义色调(编辑态聚焦发光环)。默认 primary。 |
| `disabled` | `boolean` | `false` | 禁用:不可进入编辑态,染禁用态。 |
| `invalid` | `boolean` | `false` | 校验失败态(供 Form):染 danger 环并设 aria-invalid。 |
| `multiline` | `boolean` | `false` | 编辑态用 textarea(多行)。诚实备注:multiline 渲染 textarea,裸 Enter 默认换行。 |
| `maxLength` | `number` | — | 字数上限(透传输入元素 + 提交时截断)。 |
| `startWithEditView` | `boolean` | `false` | 初次渲染即进入编辑态。默认 false。 |
| `selectAllOnFocus` | `boolean` | `false` | 进入编辑态时全选文本,便于整体替换。默认 false。 |
| `submitOnBlur` | `boolean` | `true` | 失焦即提交。默认 true。 |
| `submitOnEnter` | `boolean` | — | Enter 提交。单行默认 true;多行默认 false(裸 Enter 换行)。 |
| `editing` | `boolean` | — | 受控编辑态(传入即受控,配合 onEditingChange)。 |
| `defaultEditing` | `boolean` | — | 编辑态默认值(非受控初值)。默认 startWithEditView。 |
| `classNames` | `EditableClassNames` | — | 子部件类名插槽。 |
| `inputAriaLabel` | `string` | — | 展示态 input 的可访问名(aria-label)。默认取 i18n select.placeholder。 |
| `renderPreview` | `((props: EditablePreviewRenderProps) => ReactNode)` | — | 自定义展示态渲染(替换默认展示态)。 |
| `renderEdit` | `((props: EditableEditRenderProps) => ReactNode)` | — | 自定义编辑态渲染(替换默认 input / textarea)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string) => void` | 提交时触发(值变化才回调)。<br>· `value` — 提交后的最终值(经 maxLength 截断)。 |
| `onCancel` | `(value: string) => void` | 取消(Esc / 失焦不提交)时触发,值已还原。<br>· `value` — 还原后的值(即进入编辑前的初始值)。 |
| `onEditingChange` | `(editing: boolean) => void` | 编辑态变化(进入/退出编辑,受控/非受控双通道核心回调)。<br>· `editing` — 变化后是否处于编辑态。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 兼容性备注

透明披露的已知边界与契约(来自 `component.json` 的 `source.notes`):

进入编辑态的 seed(快照 editStartValue + 草稿 draft)由 editing 的 false→true 上升沿统一驱动(useLayoutEffect),受控编辑(父级直接翻 editing,不点击)与非受控(点击/键盘 enterEdit)共用同一套填充逻辑——保证受控通道下值未改不误触发 onChange、且进入编辑展示最新 currentValue(含『一次性 setState 既给新值又开编辑』)。invalid 语义:展示态与编辑态在 invalid 时都带 aria-invalid,校验失败态对辅助技术连续可感知。renderPreview 自定义展示态的两点透明边界:① 焦点回收依赖你把 render props 的 `ref` 接到一个可聚焦元素上,不接则退出编辑(提交/取消/Esc)后焦点会丢到 &lt;body&gt;;② invalid 语义需你自行用 render props 的 `invalid` 打 aria-invalid(默认展示态已内建)。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `editable` `inline-edit` `input` `textarea` `form` `controlled` |

::: details 需求原文 / 设计意图
需要一个把静态文本就地变成可编辑输入的轻控件:展示态看似纯文本(空值显示占位),点击或键盘进入编辑态,Enter/失焦提交、Esc 取消还原,值变化才回调。要能进 Form(invalid/maxLength),要给用户完全替换两态渲染的口子(renderPreview/renderEdit),并把提交/取消的键盘语义与值流转抽成零 React 的纯逻辑,便于平移多框架内核。
:::
