# Cascader <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

级联选择,多列同屏展开沿一条路径逐级收窄,键盘四向全可达。

> **[在展示站中打开 Cascader](https://magicood.github.io/magic-scope/#/cascader)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,从省/市/区、商品多级分类这类层级数据里逐级选出一条路径。trigger 显示选中路径(`浙江 / 杭州 / 西湖`)或占位,复用 Popover 浮层承载多列级联菜单:hover / 点击非叶子即展开下一列(多列同屏而非逐级弹窗),点叶子提交 `value: string[]` 并关闭,沿途 optionPath 一并回传供业务取每级数据。

changeOnSelect 允许选中非叶子边选边走;value / open 双通道受控;键盘 ↑↓ 列内移动、→ 进下一列、← 回上一列、Enter 选中 / 展开、Esc 关闭,采用 WAI-ARIA menu / menuitem + aria-expanded 模型;tone × size(随 data-ms-density 缩放),留口 classNames / displayRender,尊重 prefers-reduced-motion。纯路径算法抽到 logic.ts 以便平移到其它框架内核。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `options` * | `CascaderOption[]` | — | 级联选项树(`{ value, label, children?, disabled? }`)。 |
| `value` | `string[]` | — | 受控选中路径(各层 value 串成数组)。传入即进入受控模式。 |
| `defaultValue` | `string[]` | — | 非受控初始路径。 |
| `open` | `boolean` | — | 受控:浮层是否打开。 |
| `changeOnSelect` | `boolean` | `false` | 允许选中非叶子节点:点击 / Enter 任一节点都立即提交并触发 onChange(边选边走)。<br>关闭时仅叶子可提交,非叶子只展开下一列。默认 false。 |
| `placeholder` | `string` | — | 未选中时的占位文本。默认走 i18n select.placeholder。 |
| `separator` | `string` | `/` | 路径分隔串(显示与默认 aria-label)。默认 ` / `。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生高亮 / 发光。默认 primary。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `placement` | `"left" \| "right" \| "bottom" \| "top" \| "top-end" \| "top-start" \| "bottom-end" \| "bottom-start" \| "left-start" \| "left-end" \| "right-start" \| "right-end"` | `bottom-start` | 浮层相对 trigger 的方位。默认 bottom-start。 |
| `disabled` | `boolean` | `false` | 整体禁用。 |
| `fullWidth` | `boolean` | `false` | 块级铺满容器。 |
| `displayRender` | `((labels: string[], optionPath: CascaderOption[]) => ReactNode)` | — | 自定义路径显示(覆盖默认的 label 拼接)。 |
| `classNames` | `CascaderClassNames` | — | 各部件细粒度 className 槽位。 |
| `className` | `string` | — | trigger 附加 className(等价于原生 className)。 |
| `...props` | `ComponentPropsWithoutRef<'button'>` | — | 透传原生 button 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string[], optionPath: CascaderOption[]) => void` | 路径变化回调。`value` 为选中路径的 value 数组,`optionPath` 为沿途选项数组。<br>选叶子(或 changeOnSelect 选非叶子)时触发。<br>· `value` — 选中路径的各层 value 串成的数组。<br>· `optionPath` — 与 value 对应的沿途选项对象数组(从根到选中节点)。 |
| `onOpenChange` | `(open: boolean) => void` | 浮层显隐回调。<br>· `open` — 浮层变化后的开合状态(true 为打开,false 为关闭)。 |

此外透传原生 `<button>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `cascader` `级联` `多级选择` `树形` `路径选择` `select` `forms` |

::: details 需求原文 / 设计意图
省/市/区、商品多级分类这类层级数据,需要让用户沿一条路径逐级收窄、最终落到一个叶子(或允许 changeOnSelect 半路落点)。要点:多列同屏展开而非逐级弹窗,鼠标 hover 即预览下一级、键盘四向(↑↓ 列内、← → 跨列)可达,禁用节点既不可选也不可作为中转;选中结果以 string&#91;] 路径表达,沿途 optionPath 一并回传供业务取每级数据;路径查找/列展开等纯算法抽到 logic.ts 以便平移到其它框架内核。
:::
