# Button <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

主操作按钮,五种视觉变体与三档尺寸,solid 带发光。

> **[在展示站中打开 Button](https://magicood.github.io/magic-scope/#/button)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

完整覆盖 hover / active / focus-visible / disabled 状态与平滑过渡;solid 变体带可调发光(受顶栏「光影」开关控制)。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/button.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `"link" \| "solid" \| "soft" \| "outline" \| "ghost"` | `solid` | 视觉变体:实底(发光)/ 柔色 / 描边 / 幽灵 / 链接。默认 solid。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info"` | `primary` | 语义色调,经全库 tone resolver 派生配色。默认 primary。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `shape` | `"square" \| "default" \| "pill"` | `default` | 形状:默认圆角 / 胶囊 / 直角。默认 default。 |
| `loading` | `boolean` | `false` | 加载态:显示旋转图标、保持宽度防抖动、禁用交互、aria-busy。 |
| `leftIcon` | `ReactNode` | — | 前置图标。 |
| `rightIcon` | `ReactNode` | — | 后置图标。 |
| `iconOnly` | `boolean` | `false` | 仅图标(正方形紧凑);务必配 aria-label。 |
| `fullWidth` | `boolean` | `false` | 块级铺满容器。 |
| `glow` | `"off" \| "auto" \| "hover" \| "always"` | `auto` | 发光强度(实例级,覆盖全局 fx):auto 由变体决定 / off / hover 仅悬停 / always 常亮。 |
| `asChild` | `boolean` | `false` | 渲染为子元素(如 &lt;a&gt; / 路由 Link)并保留按钮样式(Radix Slot 风格;由子元素自带内容)。 |
| `...props` | `ComponentPropsWithoutRef<'button'>` | — | 透传原生 button 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<button>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `button` `button-group` `action` `form` `tone` `loading` `icon` `as-child` |

::: details 需求原文 / 设计意图
magic-scope 首个示例组件:验证 @magic-scope/tokens(--ms-&#42; 变量与主题引擎)与收录流水线端到端打通。自研、零依赖,完整覆盖 hover/active/focus-visible/disabled 状态与平滑过渡,solid 变体带发光,尊重 prefers-reduced-motion。
:::
