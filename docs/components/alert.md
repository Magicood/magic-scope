# Alert <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

语义提示框,四种变体(信息 / 成功 / 警告 / 危险),起始边强调条 + 柔和底色。

> **[在展示站中打开 Alert](https://magicood.github.io/magic-scope/#/alert)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

role="alert" 会向辅助技术主动播报内容;按变体用 color-mix 渲染柔和底色与起始边强调条,适合表单校验、操作结果、风险警示等场景。正文 overflow-wrap: anywhere,超长内容换行收在边界内。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/alert.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `"success" \| "warning" \| "danger" \| "info"` | `info` | 语义变体:信息 / 成功 / 警告 / 危险。映射到统一 tone 槽位。默认 info。 |
| `icon` | `ReactNode` | — | 图标:不传按 variant 给默认图标;传 ReactNode 覆盖;传 false 完全关闭图标列。 |
| `title` | `ReactNode` | — | 标题行(渲染在正文上方,加粗)。 |
| `action` | `ReactNode` | — | 行动区(按钮 / 链接等),渲染在正文下方。 |
| `dismissible` | `boolean` | `false` | 是否可关闭(右上角关闭钮)。默认 false。 |
| `role` | `AriaRole` | — | role 覆盖。默认按语义分流:danger/warning → "alert"(打断式播报),<br>info/success → "status"(礼貌播报)。 |
| `classNames` | `AlertClassNames` | — | 各部件细粒度 className。 |
| `asChild` | `boolean` | `false` | 渲染为子元素(合并样式 / props 到子元素,Radix Slot 风格)。与子部件槽位互斥。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onClose` | `() => void` | 关闭回调(点击关闭钮时触发)。仅在 dismissible 时渲染关闭钮。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `alert` `feedback` `notification` `banner` `message` `status` `dismissible` `tone` `icon` `a11y` |

::: details 需求原文 / 设计意图
语义化提示框,按 info/success/warning/danger 渲染柔和底色与起始边强调条,role="alert" 向辅助技术播报。工程要求(magic-scope 通用基础组件):自研、消费 tokens 的 --ms-&#42; 变量,完整状态与过渡、发光,尊重 prefers-reduced-motion。
:::
