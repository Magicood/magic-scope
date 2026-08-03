# Marquee <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

无限跑马灯,children 沿主轴无缝无限滚动(内容克隆 N 份首尾相接,CSS transform 位移后回卷)。

> **[在展示站中打开 Marquee](https://magicood.github.io/magic-scope/#/marquee)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

logo 墙 / 公告 / 弹幕场景的无限滚动条:内容首尾相接视觉无缝、GPU 友好(只动 transform)。

支持四方向(left / right / up / down)与横纵双向(vertical),speed(px/s)或 duration(固定圈秒)控速,悬停(pauseOnHover)或按下(pauseOnClick)暂停,两端淡出遮罩(gradient),自动或固定克隆份数(repeat)。

reduced-motion / data-ms-motion=off 下停滚静态展示;克隆份对 AT 隐藏、整体可命名、不抢焦点。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` * | `ReactNode` | — | 滚动内容(原样克隆 N 份首尾相接实现无缝循环)。 |
| `direction` | `"left" \| "right" \| "up" \| "down"` | `left` | 主轴方向。`left`/`right` 横向,`up`/`down` 纵向。默认 left。<br>设 `up`/`down` 等价于开启 `vertical`(方向已隐含纵向)。 |
| `speed` | `number` | `50` | 滚动速度(像素/秒)。与 `duration` 二选一;两者都给时 `duration` 优先。<br>需测得内容尺寸后才能换算成时长(挂载后用 ResizeObserver 探测),测得前回退默认时长。<br>默认 50。 |
| `duration` | `number` | — | 一圈(位移一份内容)的秒数。给了它就忽略 `speed`,直接用固定时长(与内容尺寸无关、最稳定)。<br>默认不设(走 speed)。 |
| `pauseOnHover` | `boolean` | `true` | 悬停时暂停滚动。默认 true。 |
| `pauseOnClick` | `boolean` | `false` | 按下(点击)时暂停滚动,松开恢复。默认 false。 |
| `gap` | `string \| number` | `1rem` | 克隆份之间的间距(任意 CSS 长度,如 '1rem' / '24px';数字按 px)。默认 '1rem'。 |
| `repeat` | `number` | — | 克隆份数。不给则挂载后按容器/内容比自动算(至少 2 份,保证铺满 + 冗余)。<br>显式给数字则固定该份数。 |
| `reverse` | `boolean` | `false` | 反向滚动(在 `direction` 基础上再翻转一次)。默认 false。 |
| `gradient` | `boolean` | `false` | 两端淡出遮罩(主轴两端渐隐,暗示内容延续)。默认 false。 |
| `gradientColor` | `string` | — | 淡出遮罩颜色。默认跟随 `--ms-color-bg`(容器背景)。 |
| `gradientWidth` | `string \| number` | `15%` | 淡出遮罩宽度(任意 CSS 长度;数字按 px)。默认 '15%'。 |
| `vertical` | `boolean` | `false` | 纵向滚动(等价于 `direction` 取 up/down;与纵向 `direction` 取或)。默认 false。 |
| `aria-label` | `string` | — | 整体无障碍标签(描述这条跑马灯的内容主题)。 |
| `classNames` | `MarqueeClassNames` | — | 细粒度 className 槽位(root / track / group)。 |
| `className` | `string` | — | 根容器额外类名。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `marquee` `scroll` `ticker` `infinite-scroll` `animation` `seamless` `data-display` |

::: details 需求原文 / 设计意图
需要一个 logo 墙 / 公告 / 弹幕场景的无限滚动条:内容首尾相接视觉无缝、GPU 友好(只动 transform)、可控速度与方向、悬停可暂停、两端能渐隐暗示延续。核心是把无缝循环做对——整数份克隆 + 位移 -100/repeat% 取模动画,而非靠 JS 每帧改 left。布局算法(份数 / 一圈时长 / 位移百分比)抽进零依赖 logic.ts 以便平移到其它框架。无障碍上克隆份对 AT 隐藏、整体可命名、不抢焦点;尊重 reduced-motion 与全库动效总闸。
:::
