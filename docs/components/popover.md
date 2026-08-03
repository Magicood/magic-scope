# Popover <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

点击浮层,基于原生 Popover API + CSS Anchor Positioning,贴合触发器四向弹出。

> **[在展示站中打开 Popover](https://magicood.github.io/magic-scope/#/popover)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖。浮层进 top-layer 用原生 Popover API(popover="auto" 自带点外 / Esc 关闭,无需和 z-index 较劲)。

定位用 CSS Anchor Positioning:trigger 注入唯一 anchor-name,浮层以 position-area 贴合 placement,并以 @supports 降级为 fixed 居中。

支持受控(open + onOpenChange)与非受控两种用法;trigger 自动注入 aria-haspopup / aria-expanded / aria-controls。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/popover.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `trigger` * | `ReactElement<unknown, string \| JSXElementConstructor<any>>` | — | 触发元素(单个 React 元素)。会被注入 anchor / aria 属性,并按 triggerAction 合并交互事件。 |
| `children` * | `ReactNode` | — | 浮层内容。 |
| `placement` | `"left" \| "right" \| "bottom" \| "top" \| "top-end" \| "top-start" \| "bottom-end" \| "bottom-start" \| "left-start" \| "left-end" \| "right-start" \| "right-end"` | `bottom` | 浮层相对 trigger 的方位(12 向)。默认 bottom。 |
| `offset` | `number` | `8` | 浮层与 trigger 的间距(像素)。默认 8。 |
| `arrow` | `boolean` | `false` | 是否显示指向箭头。默认 false。 |
| `triggerAction` | `"manual" \| "hover" \| "click" \| "focus"` | `click` | 触发方式:点击 / 悬停 / 聚焦 / 完全手动(仅受控)。默认 click。 |
| `openDelay` | `number` | `0` | hover / focus 触发时,开启的延时(毫秒)。默认 0。 |
| `closeDelay` | `number` | `0` | hover / focus 触发时,关闭的延时(毫秒,hover 模式建议留余量防误关)。默认 0。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调,经全库 tone resolver 派生 panel 边框 / 发光 / 箭头。默认 neutral。 |
| `open` | `boolean` | — | 受控:是否打开。传入即进入受控模式。 |
| `className` | `string` | — | 浮层根容器附加 className。 |
| `classNames` | `PopoverClassNames` | — | 各部件细粒度 className 槽位。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | 显隐变化回调(受控 / 非受控均触发)。 |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | Esc 键按下回调;在回调内 preventDefault 可阻止默认的关闭。 |
| `onPointerDownOutside` | `(event: PointerEvent) => void` | 点击浮层外部(pointerdown)回调;preventDefault 可阻止关闭。 |
| `onInteractOutside` | `(event: KeyboardEvent \| PointerEvent) => void` | 任意外部交互(点外 / Esc)导致关闭前回调;preventDefault 可阻止关闭。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `popover` `overlay` `anchor` `popover-api` `top-layer` `placement` `arrow` `hover` `tone` `controllable` |

::: details 需求原文 / 设计意图
浮层,基于原生 Popover API(top-layer)+ CSS Anchor Positioning 锚定 trigger。补强到生产级深度:12 向定位 + offset + 指向箭头 + click/hover/focus/manual 触发(带延时与 hover 桥接区)+ tone 色调。事件留口对齐旗舰规范:trigger 全事件 compose、浮层根透传 ...rest、onEscapeKeyDown/onPointerDownOutside/onInteractOutside 可拦截关闭、classNames 槽位。fx/motion/density 一键降级,键盘可达,不支持锚定时优雅降级。
:::
