# AutoComplete <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

自由文本输入 + 下拉补全建议;Popover API + CSS Anchor Positioning,键盘全可达。

> **[在展示站中打开 AutoComplete](https://magicood.github.io/magic-scope/#/auto-complete)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

与 Select 的区别是「值就是输入串」——候选项只作补全提示,不强制从中选取。输入即开下拉,键盘 ↑↓ 高亮 / Enter 选中填入 / Esc 关闭。

自研、零依赖:浮层进 top-layer 用原生 Popover API(popover="auto" 自带点外 / Esc 关闭),定位用 CSS Anchor Positioning 并以 @supports 降级。生产特性齐备:options 平铺 / 分组、filterOption(false 关内置过滤配 onSearch 做远程异步搜索,或传谓词自定义命中)、loading 加载态、空态、allowClear、disabled、size、invalid(供 Form)、tone 槽位与 i18n;留口 prefix / renderOption / classNames 部件定制、原生属性透传。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 当前输入值(受控,自由文本)。 |
| `defaultValue` | `string` | — | 默认输入值(非受控)。 |
| `options` | `AutoCompleteOptions` | — | 候选项(平铺或分组)。 |
| `filterOption` | `false \| ((inputValue: string, option: AutoCompleteOption) => boolean)` | — | 过滤候选:`false` 关闭内置过滤(配 onSearch 做受控远程搜索);<br>传谓词 `(inputValue, option) => boolean` 自定义命中;缺省走子串大小写不敏感匹配。 |
| `loading` | `boolean` | — | 加载态:列表显示加载文案(走 i18n select.loading),input 标记 aria-busy。 |
| `allowClear` | `boolean` | — | 有值时显示清除按钮(走 i18n input.clear)。 |
| `size` | `"sm" \| "md" \| "lg"` | — | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | — | 语义色调,派生高亮/发光(只读 tone 槽位)。invalid 时强制 danger。默认 primary。 |
| `disabled` | `boolean` | — | 是否禁用。 |
| `invalid` | `boolean` | — | 校验失败态(供 Form):染 danger 发光环并设 aria-invalid。 |
| `renderOption` | `((option: AutoCompleteOption, state: { active: boolean; }) => ReactNode)` | — | 自定义渲染 option 内容(覆盖默认 label 文本)。 |
| `prefix` | `ReactNode` | — | 输入框前置内容(图标 / 文字)。 |
| `open` | `boolean` | — | 受控/非受控开合状态(受控时配 onOpenChange)。 |
| `classNames` | `AutoCompleteClassNames` | — | 部件级 className(细粒度槽位)。 |
| `className` | `string` | — | 外层根容器附加 className。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string) => void` | 输入值变化回调(受控/非受控均触发)。值就是输入串。<br>· `value` — 输入框变化后的最新文本。 |
| `onSelect` | `(value: string, option: AutoCompleteOption) => void` | 选中某个候选项回调(点选 / Enter 选中高亮项)。选中后输入框填入该 value。<br>· `value` — 被选中候选项的 value(已填入输入框)。<br>· `option` — 被选中的完整候选项。 |
| `onSearch` | `(value: string) => void` | 输入回调(每次键入触发,异步加载时在此发起请求,配 `loading` 展示加载态)。<br>· `value` — 输入框当前文本。 |
| `onClear` | `() => void` | 点击清除回调(无参数)。 |
| `onOpenChange` | `(open: boolean) => void` | 开合变化回调(受控/非受控双通道)。<br>· `open` — 变化后的开合状态;true 为展开,false 为收起。 |
| `onFocus` | `(event: FocusEvent<HTMLInputElement, Element>) => void` | input 获焦(表单聚焦校验)。 |
| `onBlur` | `(event: FocusEvent<HTMLInputElement, Element>) => void` | input 失焦(表单 onBlur 校验)。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `autocomplete` `combobox` `typeahead` `input` `suggestion` `forms` `filter` `async` `clearable` `tone` `i18n` `controlled` |

::: details 需求原文 / 设计意图
需要一个「自由文本 + 补全建议」的自动完成控件,补 Select(强制从选项选取)之外的空缺:值即输入串、候选项只作补全提示不强制选取,典型用于搜索框联想、远程异步搜索(filterOption=false + onSearch + loading)。要达到与旗舰 Input/Select 对齐的生产级深度:options 平铺/分组、内置/自定义/关闭三档过滤、loading/空态/allowClear/disabled/size/invalid(供 Form)、tone 槽位与 i18n、完整键盘(↑↓/Enter/Esc)与 combobox a11y(aria-autocomplete=list / aria-expanded / aria-activedescendant / option aria-selected)、受控+非受控双通道、prefix/renderOption/classNames 留口、motion/fx 一键降级。overlay 用满平台原生能力(Popover API + CSS Anchor Positioning)自研并带降级。纯过滤/导航逻辑抽进 logic.ts(零 React)以便平移到 vue/core。
:::
