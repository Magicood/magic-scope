# Popconfirm <Badge type="tip" text="stable" /> <Badge type="info" text="v0.0.0" />

锚定在元素旁的轻量确认气泡,内建确认 / 取消按钮流,常用于内联删除确认。

> **[在展示站中打开 Popconfirm](https://magicood.github.io/magic-scope/#/popconfirm)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

compose 了 Popover(原生 Popover API + CSS Anchor Positioning,自带点外 / 取消 / Esc 关闭)与 Button(确认 / 取消按钮),在 trigger 旁弹出确认气泡而非全屏模态。

danger 变体把确认按钮染危险色;点外 / Esc 关闭等同取消(触发 onCancel)。适合列表内联删除等不打断上下文的二次确认。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/popconfirm.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `trigger` * | `ReactElement<unknown, string \| JSXElementConstructor<any>>` | — | 触发元素(单个 React 元素),点击弹出确认气泡。 |
| `title` | `ReactNode` | — | 确认标题 / 主问题(ReactNode 槽位,覆盖原生 title 属性)。 |
| `description` | `ReactNode` | — | 次级描述。 |
| `icon` | `ReactNode` | — | 标题前的警示图标槽。 |
| `confirmText` | `ReactNode` | — | 确认按钮文案。默认走 i18n popconfirm.confirm(「确定」)。 |
| `cancelText` | `ReactNode` | — | 取消按钮文案。默认走 i18n popconfirm.cancel(「取消」)。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调,派生确认按钮配色与浮层发光。默认 primary。 |
| `variant` | `"danger" \| "default"` | `default` |  |
| `confirmLoading` | `boolean` | — | 受控:确认按钮是否处于 loading(异步确认期间内部也会自动置 loading)。 |
| `placement` | `"left" \| "right" \| "bottom" \| "top" \| "top-end" \| "top-start" \| "bottom-end" \| "bottom-start" \| "left-start" \| "left-end" \| "right-start" \| "right-end"` | `top` | 气泡相对 trigger 的方位。默认 top。 |
| `open` | `boolean` | — | 受控:是否打开。传入即进入受控模式。 |
| `defaultOpen` | `boolean` | `false` | 非受控初始打开态。默认 false。 |
| `confirmButtonProps` | `ButtonProps` | — | 透传给确认按钮的属性(覆盖内部默认,事件 compose)。 |
| `cancelButtonProps` | `ButtonProps` | — | 透传给取消按钮的属性。 |
| `className` | `string` | — | 浮层根容器附加 className。 |
| `classNames` | `PopconfirmClassNames` | — | 浮层内各部件细粒度 className 槽位。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onConfirm` | `() => void \| Promise<void>` | 点击确认时触发。返回 Promise 时进入异步态:确认按钮 loading + 禁用,<br>resolve 后自动关闭,reject(失败)则保持打开,便于重试。 |
| `onCancel` | `() => void` | 点击取消 / 点外 / Esc 关闭时触发。 |
| `onOpenChange` | `(open: boolean) => void` | 显隐变化回调(受控 / 非受控均触发)。<br>· `open` — 变化后的目标显隐状态:true 为打开,false 为关闭。 |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | Esc 键按下回调;在回调内 preventDefault 可阻止默认的关闭。<br>· `event` — 触发关闭的原生键盘事件(Esc),在其上调用 preventDefault 可拦截默认关闭。 |
| `onPointerDownOutside` | `(event: PointerEvent) => void` | 点击浮层外部(pointerdown)回调;preventDefault 可阻止关闭。<br>· `event` — 浮层外部按下的原生指针事件,在其上调用 preventDefault 可拦截关闭。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `popconfirm` `confirm` `popover` `overlay` `inline` `tone` `async` `controlled` `i18n` |

::: details 需求原文 / 设计意图
补齐弹窗体系:气泡确认。原创实现,不另造定位——直接包一层已有的 Popover(锚定 + 点外/Esc 关闭),只叠加确认/取消 UI 与回调;区别于全屏的 AlertDialog confirm() 与装任意内容的 Popover。常见于内联删除确认。
:::
