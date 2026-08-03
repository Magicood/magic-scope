# Mentions <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

@提及输入,敲触发前缀即弹候选浮层,键盘全可达、可异步搜索。

> **[在展示站中打开 Mentions](https://magicood.github.io/magic-scope/#/mentions)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,基于原生 textarea:输入触发前缀(默认 @,可配多前缀如 @ / #)即弹出候选浮层,本地按 query 实时过滤或交给 onSearch 异步加载(配 loading / 空态)。

选中候选后把光标前的触发段回填为「前缀 + 候选」并续接分隔符、光标落到其后;键盘 ↑↓ 移高亮(自动跳过禁用项)、Enter / Tab 选中、Esc 关闭。受控 / 非受控双通道,a11y 走 WAI-ARIA combobox + listbox/option 模型。三块纯算法(检测触发段 / 过滤 / 替换插入)抽到零 React 的 logic.ts,便于平移多框架与单测。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 当前文本(受控)。 |
| `defaultValue` | `string` | — | 默认文本(非受控)。 |
| `prefix` | `string \| string[]` | — | 触发前缀。单字符串或数组(多前缀,如 &#91;'@','#'])。默认 "@"。<br>注意:多前缀建议每个都为单字符;非单字符前缀请显式保证 split 不与之冲突。 |
| `options` | `MentionOption[]` | — | 候选项列表(静态)。与 onSearch 二选一;同时给时 onSearch 负责异步、options 作为当前可见集。 |
| `loading` | `boolean` | `false` | 异步加载中:建议列表显示加载文案(走 i18n select.loading)。 |
| `split` | `string` | — | 选中候选后,回填文本时追加的分隔符。默认空格 " "。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸。默认 md。(影响 font-size 与 min-block-size,min-block-size 随密度缩放) |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | `primary` | 聚焦发光环色调;invalid 时强制 danger。默认 primary。 |
| `invalid` | `boolean` | `false` | 校验失败态:染 danger 色并设 aria-invalid。 |
| `disabled` | `boolean` | `false` | 禁用整个控件。 |
| `className` | `string` | — | 根容器 className。 |
| `classNames` | `MentionsClassNames` | — | 各关键子部件 className(细粒度留口)。 |
| `...props` | `ComponentPropsWithoutRef<'textarea'>` | — | 透传原生 textarea 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string) => void` | 文本变化回调(受控 / 非受控均触发,含选中候选回填导致的变化)。<br>· `value` — 变化后的完整文本。 |
| `onSearch` | `(query: string) => void` | 异步加载候选:query 变化时调用,期间走 loading 态。调用方据 query 拉数据后更新 options。<br>· `query` — 当前 @ 之后、光标之前的查询文本。 |
| `onSelect` | `(option: MentionOption, prefix: string) => void` | 选中某个候选时触发(回填文本之外的副作用钩子)。<br>· `option` — 被选中的完整候选项。<br>· `prefix` — 本次触发所用的前缀。 |

此外透传原生 `<textarea>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `mentions` `mention` `textarea` `autocomplete` `combobox` `tag-people` `at-mention` |

::: details 需求原文 / 设计意图
聊天 / 评论 / 协作文档里高频的 @提及人(或 #话题)输入:用户在多行文本中敲 @ 即弹出可过滤的候选名单,键盘可全程操作并回填。把三块纯算法(检测光标前触发段、候选过滤、替换插入并定位光标)抽到零 React 的 logic.ts 便于平移其它框架与单测覆盖;前缀可配多组、候选可静态可异步(配 loading/空态),受控非受控双通道,a11y 走 combobox + listbox/option 模型。v1 候选浮层锚控件下方(近光标精确定位需镜像 textarea 算坐标,较复杂,留作后续增强)。
:::
