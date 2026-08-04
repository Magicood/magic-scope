# Tag <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

语义色标签,六档 tone 柔和底色,可选关闭按钮,用于分类、过滤与可移除项。

> **[在展示站中打开 Tag](https://magicood.github.io/magic-scope/#/tag)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

tone 用 color-mix 调出 18% 柔和底 + tone 文字,紧凑内边距适合密集场景。

closable 时在末尾渲染移除按钮,hover 加深、focus-visible 显示发光环;移除逻辑由 onRemove 交给上层 state 控制。透传原生 span 属性(title / onClick 等)。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/tag.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调,经全库统一 tone resolver(`.ms-tone-*`)派生配色。默认 neutral。 |
| `variant` | `"solid" \| "soft" \| "outline"` | `soft` | 视觉变体:柔色底 / 实底(发光)/ 描边。默认 soft。 |
| `size` | `"sm" \| "md"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `closable` | `boolean` | `false` | 是否可关闭:为真时在末尾渲染移除按钮。 |
| `icon` | `ReactNode` | — | 前缀槽:图标 / 头像(`.ms-tag__icon`)。 |
| `closeIcon` | `ReactNode` | — | 自定义关闭图标(替代默认的 ×)。 |
| `closeButtonProps` | `Omit<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "ref">` | — | 透传给关闭按钮的原生属性(如 data-&#42; / title);其 onClick 会与内部隔离逻辑 compose。 |
| `checkable` | `boolean` | `false` | 可选标签(filter chip):为真时根可聚焦、可用 Enter/Space 激活,并暴露 `aria-pressed`。<br>配合 `selected` 表示选中态(选中时切到 tone 实底)。 |
| `selected` | `boolean` | `false` | 选中态(配合 `checkable`):tone 实底高亮,`aria-pressed=true`。 |
| `asChild` | `boolean` | `false` | 渲染为子元素(如 &lt;a&gt; / 路由 Link)并保留标签样式(Radix Slot 风格;由子元素自带内容)。 |
| `...props` | `ComponentPropsWithoutRef<'span'>` | — | 透传原生 span 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onRemove` | `(event: MouseEvent<HTMLButtonElement, MouseEvent>) => void` | 点击移除按钮时触发(关闭按钮内部已 `stopPropagation`,不会冒泡触发根 `onClick`)。<br>· `event` — 关闭按钮的原生鼠标点击事件(可据修饰键分支 / 进一步 stopPropagation) |

此外透传原生 `<span>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `tag` `chip` `label` `data-display` `tone` `variant` `soft` `solid` `outline` `size` `closable` `removable` `icon` `avatar` `checkable` `selectable` `filter-chip` `aria-pressed` `asChild` `i18n` |

::: details 需求原文 / 设计意图
语义色调标签,soft 底配 tone 文字,可选末尾的可关闭移除按钮(hover 加深、focus 发光环)。工程要求(magic-scope 通用基础组件):自研、消费 tokens 的 --ms-&#42; 变量,完整状态与过渡、发光,尊重 prefers-reduced-motion。
:::
