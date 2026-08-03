# Image <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

图片,原生懒加载 + 加载骨架 + 失败兜底链,内建点击预览灯箱(缩放/旋转/还原)。

> **[在展示站中打开 Image](https://magicood.github.io/magic-scope/#/image)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。

用原生 loading=lazy 做进视口懒加载,加载中给脉冲骨架避免布局跳动;主图加载失败时沿 fallbackSrc 链逐级降级,全部失败再落到错误占位态。支持 width/height、object-fit(cover/contain/fill/none/scale-down)与圆角档(含 full 圆形)。开启 preview 后图片可点击/回车放大进全屏灯箱,带缩放/旋转/还原/关闭工具栏,键盘 Esc 关、+/- 缩放、r 旋转、0 还原,开合支持受控。变换状态机与来源回退解析抽成零依赖纯函数,便于单测与跨框架平移。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | `string` | — | 图片地址(主图)。 |
| `alt` | `string` | — | 替代文本(无障碍必填语义;装饰图传空串以从无障碍树移除)。 |
| `fallbackSrc` | `string \| string[]` | — | 主图加载失败后的兜底来源链(按顺序逐级尝试)。<br>传单个字符串或数组;全部失败后进入错误占位态。 |
| `width` | `string \| number` | — | 宽(数值按 px,或任意 CSS 长度串)。 |
| `height` | `string \| number` | — | 高(数值按 px,或任意 CSS 长度串)。 |
| `fit` | `"none" \| "fill" \| "cover" \| "contain" \| "scale-down"` | `cover` | 填充方式(object-fit)。默认 cover。<br>备注:object-fit 仅对 &lt;img&gt; 这类替换元素生效。 |
| `rounded` | `"none" \| "sm" \| "md" \| "lg" \| "xl" \| "full"` | `none` | 圆角档(走 --ms-radius-*);full=圆形(适合头像式裁切)。默认 none。 |
| `lazy` | `boolean` | `true` | 懒加载。默认 true → loading="lazy"(浏览器原生,进视口才取图);<br>false → loading="eager"。原生不支持的旧引擎自动忽略该属性、照常加载(渐进增强)。 |
| `decoding` | `"auto" \| "sync" \| "async"` | `async` | 解码提示(透传 decoding,默认 async 不阻塞渲染)。 |
| `preview` | `boolean` | `false` | 是否启用点击预览灯箱。默认 false。<br>开启后图片可点击/回车放大到全屏遮罩,带缩放/旋转/还原工具栏。 |
| `previewOpen` | `boolean` | — | 受控:预览灯箱是否打开(配合 onPreviewOpenChange)。 |
| `placeholder` | `ReactNode` | — | 加载中占位(自定义 skeleton / 内容);不传则用内建脉冲骨架。 |
| `fallback` | `ReactNode` | — | 错误态自定义内容;不传则显示内建图标 + i18n image.error 文案。 |
| `toolbarLabels` | `{ zoomIn?: string; zoomOut?: string; rotate?: string \| undefined; reset?: string \| undefined; close?: string \| undefined; } \| undefined` | — | 灯箱工具按钮的 aria-label 覆盖(本组件 i18n 字典仅预置 image.error/image.preview,<br>这些更细的工具标签作为可覆盖 prop 给出中文默认值,便于按需本地化)。 |
| `className` | `string` | — | 组件根 className(&lt;figure&gt; 包裹层)。 |
| `classNames` | `{ root?: string; img?: string; skeleton?: string \| undefined; error?: string \| undefined; preview?: string \| undefined; previewImg?: string \| undefined; toolbar?: string \| undefined; } \| undefined` | — | 分槽 className:根 / img / 骨架 / 错误态 / 灯箱遮罩 / 灯箱大图 / 工具栏。 |
| `...props` | `ComponentPropsWithoutRef<'img'>` | — | 透传原生 img 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onPreviewOpenChange` | `(open: boolean) => void` | 预览开合回调(受控或非受控均可监听)。<br>· `open` — 变化后的目标显隐:true 打开灯箱,false 关闭。 |
| `onLoad` | `(event: SyntheticEvent<HTMLImageElement, Event>) => void` | 加载完成回调(图片解码并可显示后)。<br>· `event` — 原生 &lt;img&gt; 的 load 合成事件。 |
| `onError` | `(event: SyntheticEvent<HTMLImageElement, Event>) => void` | 全部来源(主图 + fallback 链)均失败后的回调。<br>· `event` — 最后一次失败的 &lt;img&gt; error 合成事件。 |

此外透传原生 `<img>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `image` `img` `lazy` `fallback` `preview` `lightbox` `zoom` `media` |

::: details 需求原文 / 设计意图
需要一个生产级图片组件:用原生 loading=lazy 做懒加载、加载中给脉冲骨架避免布局跳动;主图加载失败时沿 fallbackSrc 链逐级降级,全部失败再落到错误占位态;支持 width/height/object-fit/圆角(含圆形)。点击进入全屏预览灯箱,带缩放/旋转/还原/关闭工具栏,支持键盘(Esc 关、+/- 缩放、r 旋转、0 还原)与受控开合。把预览的变换状态机(缩放/旋转步进与夹取)和来源回退解析抽成零依赖纯函数便于单测与跨框架平移。多图组预览(ImageGroup:一处打开、整组左右切换)留待后续作为复合组件,本组件先做单图。
:::
