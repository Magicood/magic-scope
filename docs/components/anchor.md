# Anchor <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

滚动锚点导航(scroll-spy),跟随滚动高亮当前小节,墨条平滑指示。

> **[在展示站中打开 Anchor](https://magicood.github.io/magic-scope/#/anchor)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖的页内目录导航:监听滚动容器算出当前可视小节并高亮,墨条指示器用 CSS 变量驱动平移、接 tone 槽位染色发光。

「算哪个高亮」抽成零 React 的纯函数 resolveActiveLink(便于单测、可平移多框架),DOM 读 offset 与滚动副作用走 requestAnimationFrame 节流留在壳层。点击锚点 preventDefault 改走平滑 scrollTo(尊重 prefers-reduced-motion / data-ms-motion=off),支持 targetOffset 顶部留白。容器可由 getContainer 指定(默认 window),支持嵌套缩进、受控/非受控双模式,a11y 用 nav landmark + active 链接 aria-current=location。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` * | `AnchorItem[]` | — | 锚点数据(支持嵌套 children)。 |
| `offsetTop` | `number` | `0` | 判定偏移:命中线在容器顶部下方多少 px 处开始算「进入」。默认 0。 |
| `targetOffset` | `number` | `0` | 点击滚动后,目标距容器顶部留白(滚动落点上移多少 px)。默认 0。 |
| `activeKey` | `string \| null` | — | 受控 active key(传入即受控,高亮由外部决定;仍触发 onChange)。 |
| `getContainer` | `(() => HTMLElement \| Window)` | — | 滚动容器获取器:返回监听滚动的元素或 window。默认 () =&gt; window。 |
| `bounds` | `number` | `5` | 命中边界(像素容差),越大越「提前」命中下一节。默认 5。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(字号 / 行距 / 缩进随 data-ms-density 缩放)。默认 md。 |
| `showInk` | `boolean` | `true` | 墨条指示器开关。默认 true。 |
| `ariaLabel` | `string` | — | nav 的可访问名(landmark 标签)。不传则走字典 anchor.nav(默认「页内导航」)。 |
| `classNames` | `AnchorClassNames` | — | 子部件类名留口(细粒度槽位)。 |
| `...props` | `ComponentPropsWithoutRef<'nav'>` | — | 透传原生 nav 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(activeKey: string \| null) => void` | active 变化回调(返回新的 active key;无命中为 null)。<br>· `activeKey` — 当前命中的锚点项 key(对应 items 里的 `key`);滚动未命中任何项时为 null。 |

此外透传原生 `<nav>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `navigation` `scroll-spy` `anchor` `toc` `scrollspy` `in-page-nav` |

::: details 需求原文 / 设计意图
页内长文/文档需要一个跟随滚动自动高亮当前小节的目录导航。核心硬约束:把『算哪个高亮』做成零 React 的纯函数 resolveActiveLink(入参为壳层已读好的各锚点 offsetTop 数组 + scrollTop + bounds + offsetTop),DOM 读 offset 与滚动副作用全部留在 React 壳层,保证逻辑可单测、可平移到其它框架。判定线 = scrollTop + offsetTop + bounds,取判定线之上最靠下的锚点为 active,页面顶部时回退首项。点击锚点必须 preventDefault 改走平滑 scrollTo(尊重 prefers-reduced-motion 与 data-ms-motion=off 时瞬时跳转),并支持 targetOffset 顶部留白。滚动容器可由 getContainer 指定(默认 window),滚动监听走 requestAnimationFrame 节流。受控/非受控双模式(activeKey 受控时高亮由外部决定但仍发 onChange)。a11y:nav landmark + 链接列表,active 链接 aria-current=location。墨条用 CSS 变量驱动平移、接 tone 槽位染色发光。
:::
