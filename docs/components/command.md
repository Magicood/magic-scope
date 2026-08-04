# Command <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

命令面板(⌘K),带模糊 / 子串过滤、命中高亮、键盘导航与分组的可组合命令搜索框,可独立内嵌或包成 Command.Dialog 模态。

> **[在展示站中打开 Command](https://magicood.github.io/magic-scope/#/command)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

对标 cmdk / raycast / macOS Spotlight 的命令面板:输入即时过滤命令(连续子串与允许跳字符的模糊匹配),命中字符高亮;↑↓ 在结果间移动且跳过禁用项与分组标题,Enter 执行,Home/End 跳首尾。

命令可分组(组头不可选)、可加关键词别名参与匹配、可挂图标与快捷键提示;既能作页内内嵌控件,也能一键包进模态对话框(复用 Dialog 的焦点陷阱 / Esc / top-layer,可监听 mod+k 唤起)。

a11y 走 combobox + listbox + option 组合角色。复合 Command / Command.Input / Command.List / Command.Group / Command.Item / Command.Empty / Command.Dialog。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 受控查询串。传入即受控,需配合 onValueChange。 |
| `defaultValue` | `string` | — | 非受控初始查询串。默认空串。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生高亮 / 发光配色。默认 primary。 |
| `filterMode` | `"substring" \| "fuzzy"` | `substring` | 过滤模式:substring(默认,连续子串)\| fuzzy(允许跳字符)。 |
| `shouldFilter` | `boolean` | `true` | 是否禁用内置过滤(由外部数据源自行过滤,组件只渲染传入项)。默认 false。 |
| `filter` | `CommandFilterFn` | — | 自定义过滤判定(覆盖内置 substring / fuzzy)。返回 true 表示命中。 |
| `loop` | `boolean` | `true` | 是否循环导航(到端点回绕)。默认 true。 |
| `classNames` | `{ root?: string; }` | — | 关键子部件 className 定制。 |
| `icon` | `ReactNode` | — | 前置图标(装饰性,aria-hidden)。 |
| `label` | `string` | — | 无障碍标签(listbox 的可读名)。 |
| `heading` | `ReactNode` | — | 分组标题(组头,不可选)。 |
| `keywords` | `readonly string[]` | — | 额外匹配关键词(命中算入过滤,不参与 label 高亮)。 |
| `disabled` | `boolean` | `false` | 是否禁用(渲染但不可选、键盘跳过)。 |
| `shortcut` | `ReactNode` | — | 右侧附属内容(如快捷键 / 标签)。 |
| `open` * | `boolean` | — | 是否打开(受控)。 |
| `hotkey` | `boolean` | `false` | 监听 mod+k(⌘K / Ctrl+K)全局切换打开。默认 false(由调用方自行控制 open)。 |
| `dialogProps` | `Omit<DialogProps, "children" \| "onClose" \| "open" \| "onOpenChange">` | — | 透传给底层 Dialog 的属性(size / placement / classNames 等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onValueChange` | `(value: string) => void` | 查询串变化回调(受控 / 非受控双通道都会触发)。<br>· `value` — 变化后的查询串。 |
| `onSelect` | `(value: string) => void` | 任一项被选中时的统一回调(集中埋点 / 分发)。<br>· `value` — 被选中项的 value。 |
| `onOpenChange` | `(open: boolean) => void` | 开合变化回调(Esc / 点遮罩 / mod+k 切换)。<br>· `open` — 变化后的目标显隐:true 打开,false 关闭。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | inspired · 受外部启发重做 |
| 收录日期 | 2026-06-26 |
| 来源链接 | <https://cmdk.paco.me/> |
| 标签 | `command` `command-palette` `cmdk` `search` `spotlight` `navigation` `keyboard` `combobox` `fuzzy` |

::: details 需求原文 / 设计意图
需要一个对标 cmdk / raycast / macOS Spotlight 的命令面板:用户按 ⌘K 唤起,输入即时过滤命令(支持连续子串与允许跳字符的模糊匹配),命中字符要高亮;↑↓ 在结果间移动且跳过禁用项与分组标题,Enter 执行,Home/End 跳首尾;命令可分组(组头不可选)、可加关键词别名参与匹配、可挂图标与快捷键提示;既能作为页内内嵌控件,也能一键包进模态对话框(复用 Dialog 的焦点陷阱 / Esc / top-layer)。过滤 / 分组拍平 / 键盘落点等算法必须抽成框架无关纯逻辑以便平移 core。a11y 走 combobox + listbox + option 组合角色(aria-expanded / aria-controls / aria-activedescendant / aria-selected)。
:::
