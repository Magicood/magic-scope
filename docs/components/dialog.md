# Dialog <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

模态对话框,基于原生 &lt;dialog&gt; + showModal(),自带焦点陷阱与 top-layer。

> **[在展示站中打开 Dialog](https://magicood.github.io/magic-scope/#/dialog)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

原生 &lt;dialog&gt; 提供焦点陷阱、Esc 关闭、::backdrop 遮罩、top-layer(永远最上,无需 z-index)。自研封装受控 open、点遮罩关闭、@starting-style 入场动画(受顶栏动效开关控制)。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/dialog.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` * | `boolean` | — | 是否打开(受控)。 |
| `dismissable` | `boolean` | `true` | 点击遮罩是否关闭。默认 true。 |
| `size` | `"sm" \| "md" \| "lg" \| "full"` | `md` | 尺寸:sm / md(默认)/ lg / full(铺满视口)。 |
| `placement` | `"center" \| "top"` | `center` | 位置:center(默认,垂直居中)/ top(贴顶,长表单更稳)。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调:设置后根元素加 ms-tone-*,focus 环 / 面板发光走 tone 槽位。 |
| `hideCloseButton` | `boolean` | `false` | 隐藏内建关闭按钮(自定义头部时)。 |
| `closeIcon` | `ReactNode` | — | 自定义关闭按钮图标。 |
| `classNames` | `{ backdrop?: string; panel?: string; close?: string \| undefined; } \| undefined` | — | 分部位 className:遮罩(根 dialog)/ 面板 / 关闭按钮。 |
| `panelProps` | `Omit<DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "ref">` | — | 透传到 panel 外壳的原生属性 / 事件。 |
| `asChild` | `boolean` | `false` | 用单个子元素替换 panel 外壳(保留 ms-dialog__panel 样式与 children),Slot 风格。 |
| `renderPanel` | `DialogPanelRender` | — | render-prop 替换 panel 外壳(优先级低于 asChild)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onClose` | `() => void` | 关闭时回调(Esc / 点击遮罩 / 内建关闭按钮 / 原生 close)。 |
| `onOpenChange` | `(open: boolean) => void` | 开合双通道:open 变化时回调,传入下一个 open 值。与受控 open 配合使用。 |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | Esc 触发关闭前回调(原生 cancel)。可 preventDefault 拦截关闭(如未保存内容时)。 |
| `onPointerDownOutside` | `(event: MouseEvent<HTMLDialogElement, MouseEvent>) => void` | 遮罩按下(点击遮罩关闭前)回调。可 preventDefault 拦截关闭。 |
| `onInteractOutside` | `(event: MouseEvent<HTMLDialogElement, MouseEvent>) => void` | 外部交互(遮罩点击)回调,与 onPointerDownOutside 同时触发;可 preventDefault 拦截关闭。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `dialog` `modal` `overlay` `tone` `compound` `a11y` `controlled` `asChild` |

::: details 需求原文 / 设计意图
magic-scope overlay 首个组件:模态对话框。用满平台原生能力——原生 &lt;dialog&gt; + showModal() 自带焦点陷阱 / Esc / ::backdrop / top-layer;自研封装受控 open、点遮罩关闭、@starting-style + allow-discrete 入场动画(光影/动效受 fx/motion 开关控制)。
:::
