# Spin <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

加载遮罩,就地盖在任意区域上方,内容不卸载、保留布局、屏蔽交互。

> **[在展示站中打开 Spin](https://magicood.github.io/magic-scope/#/spin)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。包裹任意 children,spinning 时在其上盖半透明遮罩 + 居中加载指示器(默认复用 Spinner,可 indicator 自定义),内容不卸载——保留布局、降透明度并模糊、屏蔽交互。

短促请求用 delay 防闪烁(spinning 须持续超过 delay 才真正显示,收起永远即时;判定抽成纯函数可单测)。支持 tip 文字、size、tone 语义色调与 fullscreen 全屏遮罩;无 children 时退化为行内/块级独立指示器。

a11y:遮罩 role=status + aria-busy + aria-live=polite 播报 tip(或 i18n「加载中」),被遮内容 aria-hidden + inert 防读屏与键盘穿透到不可见交互。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `spinning` | `boolean` | `true` | 是否加载中(显示遮罩 + 指示器)。默认 true。 |
| `tip` | `ReactNode` | — | 加载提示文字(指示器下方)。也用于读屏播报(无 tip 时回退 i18n「加载中」)。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 指示器尺寸。默认 md。 |
| `delay` | `number` | `0` | 防闪烁延迟(毫秒):spinning 由 false→true 后,需持续超过 delay 才真正显示遮罩;<br>期间若 spinning 又变回 false 则完全不闪。收起永远即时(delay 只拦「显」)。<br>判定逻辑抽到 logic.ts 的纯函数 shouldShow,可单测。 |
| `indicator` | `ReactNode` | — | 自定义指示器(ReactNode);给出时取代默认 Spinner 图标。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调(默认指示器读全库 tone 槽位 --ms-c / --ms-c-glow)。不传跟随上下文。 |
| `fullscreen` | `boolean` | `false` | 全屏遮罩:盖满视口(top-layer 之下、modal 之上的浮层);此时通常不传 children。 |
| `children` | `ReactNode` | — | 被包裹内容;spinning 时盖遮罩但不卸载(保留布局)。无 children 时仅渲染独立指示器。 |
| `wrapperClassName` | `string` | — | 根容器额外类名(等价于 classNames.root,二者都给则拼接)。 |
| `classNames` | `SpinClassNames` | — | 细粒度槽位类名。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `spin` `loading` `overlay` `mask` `feedback` `spinner` `fullscreen` `delay` |

::: details 需求原文 / 设计意图
需要一个在异步加载期间「就地」遮盖任意区域的反馈层:不能卸载内容(否则布局抖动、滚动位置丢失),而是盖一层半透明遮罩 + 居中加载图标并屏蔽交互。要能防止短促请求让遮罩一闪而过(delay 防闪烁,判定抽成纯函数可单测),要能复用既有 Spinner 图标或换上自定义指示器,要能选语义色调,并提供整页 fullscreen 变体。无障碍上加载区需 aria-busy/aria-live 播报,被遮内容要 aria-hidden + inert 防止读屏与键盘穿透到不可见交互。
:::
