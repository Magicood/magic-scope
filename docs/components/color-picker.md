# ColorPicker <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

颜色选择器:2D 饱和度-明度面板 + hue/alpha 滑条 + 三格式互转 + 预设 + 屏幕取色。

> **[在展示站中打开 ColorPicker](https://magicood.github.io/magic-scope/#/color-picker)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,内部以 HSVA 为唯一真相源,全部色彩数学(HSV/RGB/HSL/HEX 互转、parseColor/formatColor)抽成纯函数沉到 logic.ts,便于平移 vue / web-component 共用同一套色彩语义。色块按钮触发并复用 Popover 浮层承载面板。

交互含拖拽式 2D 饱和度-明度面板、hue 与可选 alpha 滑条(棋盘格底)、hex/rgb/hsl 文本输入与格式切换、预设色板,以及 Chromium 上的系统级 EyeDropper 屏幕取色(特性检测,不支持即不渲染)。面板与各滑条均 role=slider、方向键全键盘可达,尊重 prefers-reduced-motion 与 data-ms-motion=off。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 受控值(颜色串,吃 #hex / #hexa / rgb() / rgba() / hsl() / hsla())。传入即受控。 |
| `defaultValue` | `string` | `#ff0000` | 非受控初始值。缺省 #ff0000。 |
| `format` | `"hex" \| "rgb" \| "hsl"` | — | 输出格式:hex / rgb / hsl;同时决定文本输入框的格式与默认切换。默认 hex。 |
| `alpha` | `boolean` | `true` | 是否暴露 alpha 滑条(关掉则颜色恒不透明,输出不带 alpha 通道)。默认 true。 |
| `presets` | `readonly string[]` | — | 预设色板(颜色串数组);点击即选中。 |
| `formatSwitcher` | `boolean` | `true` | 是否允许切换 hex/rgb/hsl 格式(显示格式切换器;受控 format 时自动隐藏)。默认 true。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `disabled` | `boolean` | `false` | 禁用。 |
| `placement` | `"left" \| "right" \| "bottom" \| "top" \| "top-end" \| "top-start" \| "bottom-end" \| "bottom-start" \| "left-start" \| "left-end" \| "right-start" \| "right-end"` | `bottom-start` | 浮层方位(12 向),透传 Popover。默认 bottom-start。 |
| `open` | `boolean` | — | 受控浮层开合。 |
| `aria-label` | `string` | — | 触发色块按钮 aria-label(无可见文字标签时务必给;缺省用当前颜色串)。 |
| `className` | `string` | — | 触发色块按钮附加 className。 |
| `classNames` | `ColorPickerClassNames` | — | 各部件细粒度 className 槽位。 |
| `...props` | `ComponentPropsWithoutRef<'button'>` | — | 透传原生 button 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string) => void` | 值变化回调,入参为按当前 format 格式化的颜色串。<br>· `value` — 按当前 format 格式化后的颜色串(全不透明时为简洁形式,带透明度时升 8 位 hex / rgba / hsla)。 |
| `onOpenChange` | `(open: boolean) => void` | 浮层开合变化回调。<br>· `open` — 浮层变化后的开合状态(true 为打开,false 为关闭)。 |

此外透传原生 `<button>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `color` `color-picker` `hsv` `rgb` `hsl` `hex` `eyedropper` `alpha` `swatch` `popover` `forms` |

::: details 需求原文 / 设计意图
需要一个能覆盖完整取色工作流的颜色选择器:用户既要能在二维面板上拖拽直觉地调饱和度/明度,又要能精确粘贴 hex/rgb/hsl 任意格式的色值并在三种表示间自由切换;支持透明度(alpha)与预设色板复用品牌色;在 Chromium 上还能用系统级 EyeDropper 从屏幕任意位置吸色。设计上把全部色彩数学(HSV/RGB/HSL/HEX 互转、parseColor/formatColor)抽成零依赖纯函数沉到 logic.ts,组件做薄壳,以便后续平移到 vue / web-component 时共用同一套色彩语义;内部状态统一以 HSVA 为真相源(2D 面板天然映射 s/v、hue 滑条给 h、alpha 滑条给 a)。交互全键盘可达(面板与各滑条均 role=slider、方向键微调),诚实暴露 EyeDropper 的浏览器兼容边界(不支持即不渲染该按钮)。
:::
