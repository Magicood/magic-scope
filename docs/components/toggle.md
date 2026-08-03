# Toggle <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

双态切换按钮,用 aria-pressed 表达按下 / 未按下,典型用于工具栏里的图标按钮(加粗 / 斜体 / 静音)。

> **[在展示站中打开 Toggle](https://magicood.github.io/magic-scope/#/toggle)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

区别于 Switch(开 / 关)与 Segmented(多选其一)的单按钮双态控件:按下 / 未按下两态,语义走 aria-pressed 而非 checkbox / radio。

视觉沿用 Button 的 variant × tone × size × shape,与按钮族一致;未按下时静默(读 fg-muted),按下时点亮 tone 实底 / 柔底 / 描边并叠发光高亮。

受控(pressed + onPressedChange)与非受控(defaultPressed)双通道,键盘 Enter / Space 由原生 button 接管,disabled 与 reduced-motion 降级齐备。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `pressed` | `boolean` | — | 受控按下态。传入即受控(配合 onPressedChange);不传走非受控(defaultPressed)。 |
| `defaultPressed` | `boolean` | `false` | 初始按下态(非受控)。默认 false。 |
| `variant` | `"solid" \| "soft" \| "outline" \| "ghost"` | `ghost` | 视觉变体(复用 Button 风格):实底 / 柔色 / 描边 / 幽灵。<br>未按下态走「静默」基底,按下态才点亮该变体的 tone 配色。默认 ghost。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生按下态配色与发光。默认 primary。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `shape` | `"square" \| "default" \| "pill"` | `default` | 形状:默认圆角 / 胶囊 / 直角。默认 default。 |
| `iconOnly` | `boolean` | `false` | 仅图标(正方形紧凑);务必配 aria-label,否则读屏失名。 |
| `glow` | `boolean` | `true` | 按下态额外发光高亮(读 tone 槽位 --ms-c-glow)。默认 true。 |
| `children` | `ReactNode` | — | 按钮内容(图标 / 文字,如加粗的 B 按钮)。 |
| `...props` | `ComponentPropsWithoutRef<'button'>` | — | 透传原生 button 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onPressedChange` | `(pressed: boolean) => void` | 按下态变化(受控/非受控双通道核心回调)。<br>· `pressed` — 切换后的按下态:true=按下,false=未按下。 |

此外透传原生 `<button>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | inspired · 受外部启发重做 |
| 收录日期 | 2026-06-26 |
| 来源链接 | <https://www.radix-ui.com/primitives/docs/components/toggle> |
| 标签 | `toggle` `button` `pressed` `two-state` `icon-button` `toolbar` `controlled` `a11y` |

::: details 需求原文 / 设计意图
需要一个区别于 Switch(开 / 关)与 Segmented(多选其一)的单按钮双态控件:按下 / 未按下两态,语义走 aria-pressed 而非 checkbox / radio,适配工具栏里加粗 B / 斜体 I / 静音这类要保持激活态的图标按钮。视觉沿用 Button 的 variant × tone × size × shape,使其与按钮族一致;未按下时静默(读 fg-muted),按下时点亮 tone 实底 / 柔底 / 描边并叠发光高亮。受控(pressed + onPressedChange)与非受控(defaultPressed)双通道,键盘 Enter/Space 由原生 button 接管,disabled 与 reduced-motion 降级齐备。
:::
