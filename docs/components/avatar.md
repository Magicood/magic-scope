# Avatar <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

头像,展示用户图片或姓名首字母占位,两种形状与三档尺寸。

> **[在展示站中打开 Avatar](https://magicood.github.io/magic-scope/#/avatar)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。

有 src 渲染 &lt;img&gt;(object-fit:cover 填充);无 src 时取 name 首字母(大写、最多 2 字)居中作占位,底色为 primary 与 surface 混色、文字 primary。圆形走 radius-full,方形走 radius-md。role="img" + aria-label=name 提供无障碍标签。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/avatar.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `number \| AvatarSize` | `md` | 尺寸预设(随 data-ms-density 缩放)。默认 md。传 number 时作为像素边长覆盖预设。 |
| `shape` | `"circle" \| "rounded" \| "square"` | `circle` | 形状:圆形 / 中等圆角 / 直角。默认 circle。 |
| `src` | `string` | — | 头像图片地址。提供且加载成功时渲染 &lt;img&gt;(object-fit:cover);失败回退占位。 |
| `name` | `string` | — | 用户名。无 src/加载失败时取首字母占位;同时用于无障碍标签与确定性配色。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调,经全库 tone resolver 派生配色。默认随 colorful 由 name 哈希决定,否则 primary。 |
| `colorful` | `boolean` | `true` | 按 name 哈希给占位确定性配色(同名同色)。默认 true;显式传 tone 时以 tone 为准。 |
| `status` | `"online" \| "offline" \| "busy" \| "away"` | — | 状态徽标:在右下角渲染状态点(online/offline/busy/away)。 |
| `statusPulse` | `boolean` | `false` | 状态点呼吸脉冲(受 --ms-motion-scale 门控)。默认 false。 |
| `ring` | `boolean` | `false` | 描边光环(tone 发光环),用于强调当前用户 / 在线态。 |
| `bordered` | `boolean` | — | 是否带可见边框(占位态默认有柔边,图片态默认无)。 |
| `glow` | `"off" \| "auto" \| "hover" \| "always"` | `auto` | 发光强度(实例级,覆盖全局 fx):auto 仅占位态柔光 / off / hover 仅悬停 / always 常亮。默认 auto。 |
| `fallback` | `ReactNode` | — | 自定义占位内容(覆盖首字母):图标 / emoji 等任意 ReactNode。 |
| `imgProps` | `ImgHTMLAttributes<HTMLImageElement>` | — | 透传给内部 &lt;img&gt; 的原生属性(loading/decoding/srcSet/sizes/referrerPolicy 等)。 |
| `asChild` | `boolean` | `false` | 渲染为子元素(如 &lt;a&gt; / 路由 Link)并保留头像样式与内容(Radix Slot 风格)。 |
| `...props` | `ComponentPropsWithoutRef<'span'>` | — | 透传原生 span 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<span>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `avatar` `data-display` `user` `image` `initials` `profile` `status` `presence` `group` `stacked` `tone` `fallback` |

::: details 需求原文 / 设计意图
头像组件,展示用户图片或姓名首字母占位。补强到生产级深度:接全库 tone 槽位(只读 6 槽位,零硬编码配色)、name 哈希确定性配色、img 加载失败回退、状态点(presence,可脉冲)、光环/边框、circle/rounded/square 三形状、尺寸预设与 number 像素尺寸(随密度缩放)、实例级 glow、fallback 槽位、imgProps 透传、asChild 多态、AvatarGroup 重叠堆叠+余量占位。magic-scope 通用基础组件:自研、消费 tokens 的 --ms-* 变量,完整状态与过渡、发光,尊重 prefers-reduced-motion 与 data-ms-motion/fx 总闸。
:::
