# Timeline <Badge type="tip" text="stable" /> <Badge type="info" text="v0.0.0" />

时间线 / 信息流,语义化 &lt;ol&gt;,竖向轴 + 节点圆点 + 连线,节点可换图标按变体着色。

> **[在展示站中打开 Timeline](https://magicood.github.io/magic-scope/#/timeline)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

compose 了 Timeline(语义化 &lt;ol&gt;)+ TimelineItem(单条节点)两件。

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。每条 = 节点(圆点或自定义图标)+ 连线(非末项)+ 内容(标题 / 时间 / 正文);节点按 variant(default / primary / success / warning / danger / info)语义着色。

适合历史记录、进度推进与动态流;长内容在节点右侧自然换行,不撑破轴线。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/timeline.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `mode` | `"alternate" \| "left" \| "right"` | `left` | 左右轴排布。默认 left。 |
| `reverse` | `boolean` | `false` | 反向(最新在上 / 视觉倒序)。仅翻转视觉顺序,不改 DOM 语义顺序。默认 false。 |
| `lineStyle` | `"dashed" \| "solid"` | `solid` | 连线样式(可被单条 Item 覆盖)。默认 solid。 |
| `pending` | `ReactNode` | — | 末尾「进行中」节点:虚线连线 + 呼吸圆点。<br>传 ReactNode 作为该节点内容(如「加载更多…」),自动追加在所有 Item 之后。 |
| `variant` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral" \| "default"` | `default` | 节点圆点的语义色。默认 default(中性,不上色)。 |
| `icon` | `ReactNode` | — | 自定义节点内容(图标等),替代默认圆点。 |
| `time` | `ReactNode` | — | 次级元信息(时间 / 日期),渲染为 &lt;time&gt;。 |
| `title` | `ReactNode` | — | 条目标题。 |
| `children` | `ReactNode` | — | 条目正文内容。 |
| `pulse` | `boolean` | `false` | 圆点呼吸发光(进行中 / 强调当前节点)。默认 false。 |
| `interactive` | `boolean` | — | 标记为可交互(可聚焦、hover/active 态、Enter/Space 触发 onSelect)。<br>传了 onSelect 时自动视为可交互。 |
| `active` | `boolean` | — | 选中态(受控)。交互式时间线高亮当前条目。 |
| `...props` | `ComponentPropsWithoutRef<'ol'>` | — | 透传原生 ol 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<ol>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `timeline` `feed` `activity` `history` `data-display` `list` `tone` `alternate` `pending` `pulse` `interactive` `selectable` |

::: details 需求原文 / 设计意图
补齐信息流 / 历史记录展示:时间线,并补强到生产级深度对标旗舰 Button/Input/Text。原创实现,声明式 Timeline + TimelineItem 组合(语义 &lt;ol&gt;/&lt;li&gt;);节点圆点接 tone resolver(8 色,只读 6 槽位)+ 真实 .ms-timeline&#95;&#95;line 连线(末项不画);mode 左右轴 / 交替排布 + reverse;pending 进行中末节点 + pulse 呼吸发光;lineStyle 实/虚线;交互式选择(interactive/active/onSelect + 键盘)。复用 --ms-&#42; token、tone 槽位、密度 / 动效 / 发光总闸,逻辑属性 RTL 友好,composeEventHandlers 留口不丢用户处理器。
:::
