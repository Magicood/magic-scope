# Drawer <Badge type="tip" text="stable" /> <Badge type="info" text="v0.0.0" />

侧边抽屉,基于原生 &lt;dialog&gt; + showModal(),支持四向滑入与焦点陷阱。

> **[在展示站中打开 Drawer](https://magicood.github.io/magic-scope/#/drawer)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

原生 &lt;dialog&gt; 提供焦点陷阱、Esc 关闭、::backdrop 遮罩、top-layer(永远最上,无需 z-index)。自研封装受控 open、四个方向滑入(start/end/top/bottom)、点遮罩关闭、内建关闭按钮(有标题时在头部、无标题时浮动)、锁背景滚动、安全区避让,并尊重 reduced-motion(入场动画受顶栏动效开关控制)。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/drawer.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `open` * | `boolean` | — | 是否打开(受控)。 |
| `side` | `"end" \| "start" \| "bottom" \| "top"` | — | 滑入边:start(左)/ end(右,默认)/ top / bottom。 |
| `size` | `"sm" \| "md" \| "lg"` | — | 尺寸:sm / md(默认)/ lg。控横向(start/end)或纵向(top/bottom)尺寸档位。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调,经全库 tone resolver 派生(focus 环 / 贴边描边 / 发光)。默认 primary。 |
| `header` | `ReactNode` | — | 头部整块(ReactNode)。优先于 title;传入后自行负责头部布局,<br>仍会在其右侧渲染关闭按钮(除非 hideCloseButton)。 |
| `title` | `ReactNode` | — | 标题(可选);设置后渲染默认头部并与抽屉 aria-labelledby 关联。 |
| `footer` | `ReactNode` | — | 底栏(固定底部、安全区避让),常放主/次操作按钮。 |
| `dismissable` | `boolean` | — | 点击遮罩是否关闭。默认 true。 |
| `hideCloseButton` | `boolean` | — | 隐藏内建关闭按钮(自带关闭入口时)。默认 false。 |
| `closeIcon` | `ReactNode` | — | 自定义关闭图标(覆盖默认 ✕ 图标)。 |
| `classNames` | `DrawerClassNames` | — | 各部件细粒度 className。 |
| `asChild` | `boolean` | — | 把 panel 渲染为子元素(合并样式 / props 到子元素,Radix Slot 风格)。 |
| `...props` | `ComponentPropsWithoutRef<'dialog'>` | — | 透传原生 dialog 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onClose` | `() => void` | 关闭时回调(Esc / 点击遮罩 / 关闭按钮 / 原生 close)。 |
| `onOpenChange` | `(open: boolean) => void` | 开合状态变更(开合标配的受控/非受控双通道)。任意关闭路径都会以 false 触发;<br>与 onClose 同时存在时两者都调用(onOpenChange 语义更通用)。<br>· `open` — 变化后的目标显隐状态:true 为打开,false 为关闭(任意关闭路径均以 false 触发)。 |
| `onEscapeKeyDown` | `(event: KeyboardEvent) => void` | 按下 Esc 时触发(关闭前)。用于「抽屉内表单未保存」二次确认。<br>· `event` — 触发关闭的原生键盘事件(Esc),在其上调用 preventDefault 可阻止关闭。 |
| `onPointerDownOutside` | `(event: PointerEvent<HTMLDialogElement>) => void` | 在遮罩(面板之外)按下指针时触发(关闭前)。<br>· `event` — 遮罩上按下的 React 指针事件,在其上调用 preventDefault 可阻止关闭。 |
| `onInteractOutside` | `(event: PointerEvent<HTMLDialogElement>) => void` | 与外部(遮罩)发生交互时触发(关闭前),是 onPointerDownOutside 的语义别名。<br>便于与其它库的 onInteractOutside 习惯对齐。<br>· `event` — 遮罩交互的 React 指针事件,在其上调用 preventDefault 可阻止关闭。 |

此外透传原生 `<dialog>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `drawer` `sidebar` `panel` `overlay` `sheet` `dialog` `tone` `footer` `controlled` `dismissable` `accessible` |

::: details 需求原文 / 设计意图
补齐弹窗体系:侧边抽屉。原创实现,与 Dialog 同构(原生 &lt;dialog&gt; showModal 白嫖焦点陷阱/Esc/top-layer),贴边定位 + 四方向滑入,内建头部/关闭、锁滚动、安全区。常用于移动导航、设置、详情面板。
:::
