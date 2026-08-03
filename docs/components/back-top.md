# BackTop <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

回到顶部浮钮:滚过阈值淡入,点击缓动滚回顶部,接 tone 色调与密度缩放。

> **[在展示站中打开 BackTop](https://magicood.github.io/magic-scope/#/back-top)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。固定定位(fixed)右下,right/bottom 可调并叠加安全区。

监听滚动容器(默认 window,可传 target=()=&gt;HTMLElement\|Window 指向内部滚动容器),scrollTop 超过 visibilityHeight(默认 400)才淡入,否则淡出并移出 tab 序 + aria-hidden,避免不可见时被键盘/读屏命中。

点击用 requestAnimationFrame + easeInOutCubic 缓动滚回顶部(可调 duration);prefers-reduced-motion 或 data-ms-motion="off" 时降级为瞬时归顶。回顶与用户 onClick 经 composeEventHandlers 合并,用户可 preventDefault 阻断回顶。tone 7 色只读全库槽位、circle/square 形状、尺寸随 data-ms-density 缩放、focus-visible 发光环。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `visibilityHeight` | `number` | `400` | 滚动超过该高度(px)才淡入显示,否则淡出隐藏。默认 400。 |
| `target` | `BackTopTarget` | — | 滚动容器获取器(()=&gt;HTMLElement\|Window)。默认 window。 |
| `duration` | `number` | `450` | 平滑回顶时长(ms)。减弱动效时忽略本值瞬时归顶。默认 450。 |
| `right` | `number` | `24` | 定位:距视口右侧距离(px)。默认 24。 |
| `bottom` | `number` | `24` | 定位:距视口底部距离(px)。默认 24。 |
| `shape` | `"circle" \| "square"` | `circle` | 形状:圆形 / 方形(圆角)。默认 circle。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生配色与 glow。默认 primary。 |
| `children` | `ReactNode` | — | 自定义内容(默认向上箭头图标)。 |
| `iconClassName` | `string` | — | 图标/内容部件类名留口。 |
| `...props` | `ComponentPropsWithoutRef<'button'>` | — | 透传原生 button 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<button>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `navigation` `scroll` `back-to-top` `fab` `floating` `affix` |

::: details 需求原文 / 设计意图
长页面的「回到顶部」浮钮,定位 fixed 右下、距离可调(right/bottom)并叠加安全区。监听滚动容器(默认 window,可传 ()=&gt;HTMLElement\|Window 指向内部滚动容器),scrollTop 超过 visibilityHeight(默认 400)才淡入,否则淡出并移出 tab 序 + aria-hidden,避免不可见时被键盘/读屏命中。点击用 requestAnimationFrame + easeInOutCubic 缓动滚回顶部(可调 duration);prefers-reduced-motion 或 data-ms-motion=off 时降级为瞬时 scrollTo(0)。回顶动画与用户 onClick 解耦合并(composeEventHandlers,用户可 preventDefault 阻断回顶)。tone 7 色只读全库槽位、circle/square 形状、尺寸随 data-ms-density 缩放、focus-visible 发光环。缓动/滚动插值/可见性判定抽到零依赖 logic.ts 以便平移其它框架。
:::
