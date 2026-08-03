# Tooltip <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

提示气泡,Popover API 进 top-layer + CSS Anchor 定位,hover / focus 触发,触屏 tap-to-toggle。

> **[在展示站中打开 Tooltip](https://magicood.github.io/magic-scope/#/tooltip)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

气泡进 top-layer 用 Popover API(popover="manual" 手动控制,无需 z-index),定位用 CSS Anchor Positioning 并以 @supports 降级为相对定位。

hover / focus 延时显示(delay),leave / blur / Esc 隐藏;trigger 与气泡用 aria-describedby 关联,非原生可聚焦元素自动注入 tabindex,键盘可达。

触屏(无 hover)环境自动切到 tap-to-toggle:点 trigger 切换显隐、点外部关闭,桌面行为零变化。content 接受任意 ReactNode,可放富文本。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/tooltip.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` * | `ReactNode` | — | 提示内容。 |
| `children` * | `ReactElement<unknown, string \| JSXElementConstructor<any>>` | — | 单个触发元素(将被克隆以注入事件 / anchor / aria)。 |
| `placement` | `"left" \| "right" \| "bottom" \| "top" \| "top-end" \| "top-start" \| "bottom-end" \| "bottom-start" \| "left-start" \| "left-end" \| "right-start" \| "right-end"` | `top` | 气泡相对 trigger 的方位。支持四主轴 ×(居中 / -start / -end)共 12 向。默认 "top"。<br>旧值 "top" / "bottom" 仍合法,向后兼容。 |
| `offset` | `number` | `8` | 气泡与 trigger 的间距(像素)。默认 8。 |
| `arrow` | `boolean` | `false` | 是否显示指向箭头。默认 false。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调,经全库 tone resolver 派生气泡边框 / 发光 / 箭头(如 danger 警示气泡)。默认 neutral。 |
| `delay` | `number` | `150` | hover / focus 到显示的延时(毫秒)。默认 150。<br>仅作 openDelay 的兜底默认;若显式传 openDelay 则以 openDelay 为准。 |
| `openDelay` | `number` | — | hover / focus 触发到显示的延时(毫秒)。未传则回退到 delay。 |
| `closeDelay` | `number` | `0` | 离开 / 失焦到隐藏的延时(毫秒)。默认 0(即时隐藏)。 |
| `disabled` | `boolean` | `false` | 禁用:不弹出提示(常用于禁用态的 trigger)。 |
| `open` | `boolean` | — | 受控:是否打开。传入即进入受控模式(如常驻打开的引导提示)。 |
| `defaultOpen` | `boolean` | `false` | 非受控初始打开态。默认 false。 |
| `className` | `string` | — | 透传到气泡容器的额外 className。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | 显隐变化回调(受控 / 非受控均触发)。 |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | Esc 键按下回调;在回调内 preventDefault 可阻止默认的关闭。 |
| `onPointerDownOutside` | `(event: PointerEvent) => void` | 触屏 tap-to-toggle 模式下点击气泡外部(pointerdown)回调;preventDefault 可阻止关闭。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `tooltip` `popover` `overlay` `hint` `anchor-positioning` `tone` `arrow` `controlled` `placement` `accessible` |

::: details 需求原文 / 设计意图
提示气泡:用 Popover API 进 top-layer + CSS Anchor Positioning 贴位,hover/focus 延时触发、aria-describedby 关联,深色微光入场,零第三方依赖并带锚定降级。工程要求(magic-scope overlay 组件):用满平台原生能力(Popover API + CSS Anchor Positioning)自研,带降级、键盘可达、fx/motion 开关、入场动画。补强到生产级深度:12 向 placement(四主轴)+ 箭头、tone 槽位配色、受控 open/onOpenChange/defaultOpen 双通道、disabled、openDelay/closeDelay 拆分、...rest 透传气泡根、trigger 事件 compose、onEscapeKeyDown/onPointerDownOutside 拦截关闭。
:::
