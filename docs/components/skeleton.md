# Skeleton <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

加载占位,三种形状(文本行 / 矩形 / 圆形),底色叠一道微光。

> **[在展示站中打开 Skeleton](https://magicood.github.io/magic-scope/#/skeleton)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

surface-raised 底色叠加一道移动微光(linear-gradient + background-position),提示内容正在加载。

纯装饰:内置 aria-hidden 且无语义角色,不进可访问性树。尊重 reduced-motion——降级为透明度呼吸而非完全静止。

宽高由你用 style / className 决定,组件只负责形状与微光;circle 取 width/height 较小者成圆。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/skeleton.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | `"circle" \| "rect" \| "text"` | `rect` | 占位形状。text 为文本行(较矮 + 小圆角),circle 为等宽高圆形,rect 为矩形(默认)。 |
| `animation` | `"none" \| "pulse" \| "shimmer" \| "wave"` | `shimmer` | 动画类型:渐变高亮 / 脉冲呼吸 / 波浪 / 关闭。默认 shimmer。受 data-ms-motion 与 reduced-motion 再降级。 |
| `lines` | `number` | `3` | 多行文本骨架(仅在视觉上排成多行):&gt;1 时渲染多个文本行,最后一行宽度自动收窄。<br>仅当未传 children(纯骨架)时生效;传入会自动切到 variant="text"。 |
| `width` | `string \| number` | — | 便捷宽度:number 视作 px,字符串原样写入 inline-size。映射到根元素 inline-size。 |
| `height` | `string \| number` | — | 便捷高度:number 视作 px,字符串原样写入 block-size。映射到根元素 block-size。 |
| `loading` | `boolean` | — | 内容感知:为 true 时显示骨架占位;为 false 时直接渲染 children(真实内容)。<br>配合 children 使用,实现「加载中显骨架 / 加载完显内容」的开关而无需调用方写条件分支。<br>不传时:有 children 即视为内容已就绪(loading 默认 false)。 |
| `asChild` | `boolean` | `false` | 渲染为子元素并保留骨架样式(Radix Slot 风格;由子元素自带内容)。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `skeleton` `loading` `placeholder` `shimmer` `pulse` `wave` `content-aware` `feedback` `react` |

::: details 需求原文 / 设计意图
加载占位,surface-raised 底叠加渐变高亮。补强到生产级深度:四档动画受 motion 档调控(off 停静态 / subtle 放慢)、多行文本骨架末行收窄、便捷 width/height、内容感知 loading 切换真实内容、SkeletonText/SkeletonGroup 组合与头像+标题+正文预制模板、asChild 多态。magic-scope 通用基础组件:自研、消费 tokens 的 --ms-&#42; 变量,完整状态与过渡、发光,尊重 prefers-reduced-motion。
:::
