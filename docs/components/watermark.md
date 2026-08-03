# Watermark <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

在任意内容上平铺旋转的文字 / 图片水印,pointer-events:none 绝不挡下层交互。

> **[在展示站中打开 Watermark](https://magicood.github.io/magic-scope/#/watermark)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖的 layout 原语:用离屏 canvas 绘制一个水印「单元」(文字多行或图片,带旋转),按 devicePixelRatio 放大后 toDataURL,作为覆盖层的 repeating background 无缝平铺——而非 DOM 文本堆叠,故 Retina 不糊、节点极少。

覆盖层绝对定位铺满、aria-hidden 纯装饰不进可访问性树、pointer-events:none 不挡点击 / 选择 / 滚动;rotate / gap / offset / opacity / fontSize / fontColor / fontFamily / zIndex 全可控,文字与图片二选一(image 优先)。

降级安全:SSR / 无 2d 上下文 / 图片加载失败时不渲染背景但仍正常包裹 children、不抛错。诚实备注:当前未做 MutationObserver 防删除加固,面向视觉水印 / 溯源标注而非对抗恶意 DOM 篡改。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | `string \| string[]` | — | 水印文字;字符串单行,字符串数组多行(逐行叠放)。与 `image` 二选一,二者都给时 `image` 优先。 |
| `image` | `string` | — | 水印图片 url(与 `content` 二选一,优先于 content)。图片按 `width`/`height` 绘制。 |
| `width` | `number` | — | 单元内容宽(逻辑像素)。不传:文字按 measureText / 估算,图片默认 120。 |
| `height` | `number` | — | 单元内容高(逻辑像素)。不传:文字按行数 × 行高,图片默认 64。 |
| `rotate` | `number` | `-22` | 旋转角(度,正为顺时针)。默认 -22。 |
| `gap` | `[number, number]` | — | 平铺间距 &#91;x, y](像素)。默认 &#91;100, 100]。 |
| `offset` | `[number, number]` | — | 整体平铺偏移 &#91;x, y](像素,错落起点)。默认 &#91;0, 0]。 |
| `opacity` | `number` | `0.15` | 不透明度(0–1)。默认 0.15。 |
| `fontColor` | `string` | — | 文字颜色(CSS 颜色值)。默认取设计 token 前景弱化色。 |
| `fontSize` | `number` | `16` | 文字字号(像素)。默认 16。 |
| `fontFamily` | `string` | — | 文字字体族。默认取设计 token sans。 |
| `zIndex` | `number` | `9` | 覆盖层层级。默认 9。 |
| `children` | `ReactNode` | — | 被覆盖的内容。 |
| `classNames` | `WatermarkClassNames` | — | 子部件类名细粒度留口(root / overlay)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `watermark` `overlay` `layout` `canvas` `branding` `traceability` |

::: details 需求原文 / 设计意图
需求:给任意内容区叠加可平铺水印用于溯源/品牌标注。硬约束:(1) 覆盖层 pointer-events:none 绝不挡下层点击/选择/滚动;(2) 高 DPI 必须清晰——离屏 canvas 按 devicePixelRatio 放大后 toDataURL 作为 repeating background 平铺,而非 DOM 文本堆叠;(3) 文字(多行)与图片二选一,旋转/间距/偏移/不透明度/字号字色字体/zIndex 全可配;(4) 降级安全:SSR / 无 2d 上下文 / 图片加载失败时不渲染背景但仍正常包裹 children、不抛错;(5) 覆盖层 aria-hidden 纯装饰不进可访问性树。单元画布的尺寸/中心布局抽为零依赖纯函数 logic.ts 以便单测与跨框架平移。已知取舍:未做 MutationObserver 防删除/防篡改加固(留 TODO),当前面向视觉水印而非对抗恶意 DOM 篡改。
:::
