# Carousel <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

内容轮播,children 即一屏:slide / fade 双效果、自动播放、拖拽切换,活动指示点随 tone 发光。

> **[在展示站中打开 Carousel](https://magicood.github.io/magic-scope/#/carousel)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖:每个 child 即一屏 slide,提供 slide(横/纵向位移)与 fade(叠放淡入淡出)两种切换效果,支持 loop 环绕、autoplay(可设间隔与悬停暂停)、可点指示点、prev/next 箭头与指针拖拽翻页。

受控 activeIndex/onChange 与非受控 defaultIndex 双通道,并经 ref 暴露命令式 goTo。索引推进/环绕/夹取/拖拽判定抽成零 React 纯函数以便平移其它框架。

a11y 到位:root role=region + aria-roledescription=carousel,非活动 slide 隐藏且不可聚焦,箭头与指示点带 i18n aria-label。reduced-motion / data-ms-motion=off 下自动停播并关切换过渡。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` * | `ReactNode` | — | 每个 child 即一屏 slide。 |
| `effect` | `"slide" \| "fade"` | `slide` | 切换效果:横向 / 纵向滑动 slide,或淡入淡出 fade。默认 slide。 |
| `loop` | `boolean` | `true` | 是否环绕循环(到末尾再下一张回首张)。默认 true。 |
| `vertical` | `boolean` | `false` | 纵向轮播(slide 效果下沿 Y 轴位移;箭头 / 拖拽改纵向)。默认 false。 |
| `autoplay` | `CarouselAutoplay` | `false` | 自动播放。`true` 用默认 5000ms;对象可设 `{ interval, pauseOnHover }`。默认关闭。<br>reduced-motion / data-ms-motion=off 下强制不自动播放。 |
| `dots` | `boolean` | `true` | 显示可点击的指示点。默认 true。 |
| `arrows` | `boolean` | `true` | 显示上一张 / 下一张箭头。默认 true。 |
| `draggable` | `boolean` | `true` | 指针拖拽切换(超过阈值翻页)。默认 true。 |
| `dragThreshold` | `number` | `50` | 拖拽翻页的位移阈值(像素)。默认 50。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 驱动箭头 / 活动指示点的发光与配色。默认 primary。 |
| `activeIndex` | `number` | — | 受控:当前活动 slide 索引。传入即进入受控模式。 |
| `defaultIndex` | `number` | `0` | 非受控初始索引。默认 0。 |
| `className` | `string` | — | 根容器 className。 |
| `classNames` | `CarouselClassNames` | — | 各部件细粒度 className 槽位。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(index: number) => void` | 活动索引变化回调(受控 / 非受控均触发)。<br>· `index` — 变化后的目标 slide 索引(0 起)。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `carousel` `slider` `slideshow` `gallery` `autoplay` `data-display` `magic` |

::: details 需求原文 / 设计意图
需要一个内容轮播:用 children 即一屏的直觉 API,支持横/纵滑动与淡入淡出两种切换、循环、自动播放(可悬停暂停)、指示点跳转、箭头翻页与指针拖拽。把索引推进/环绕/夹取/是否自动播放抽成零 React 纯函数(logic.ts)以便平移其它框架。无障碍要做到位:role=region + aria-roledescription=carousel、非活动 slide 隐藏且不可聚焦、指示点与箭头有清晰 aria-label 并接 i18n。诚实备注:v1 用 index 取模环绕 + 单条 track transform 位移,不做首尾克隆的无缝无限滚动(留待 v2)。
:::
