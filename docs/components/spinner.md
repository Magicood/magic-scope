# Spinner <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

加载旋转器,持续旋转的发光圆环,三档尺寸,尊重 reduced-motion。

> **[在展示站中打开 Spinner](https://magicood.github.io/magic-scope/#/spinner)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。

role="status" 并带 aria-label 供读屏播报;尺寸(sm / md / lg)同时决定圆环直径与边宽。开启系统「减弱动态效果」时放慢旋转而非完全静止,保留「加载中」语义。可透传原生 &lt;span&gt; 属性,便于行内搭配文案或塞进按钮。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/spinner.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(同时决定指示器直径与边宽/点径)。默认 md。 |
| `variant` | `"ring" \| "dots" \| "bars"` | `ring` | 形态变体:ring 旋转圆环(默认)/ dots 三点跳动 / bars 多条波动。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | — | 语义色调,经全库 tone resolver 派生配色(读 --ms-c / --ms-c-glow 槽位)。<br>不传时不加 tone 类,跟随上下文 currentColor / 父级 tone(放进彩色 Button 内会自动随之)。 |
| `label` | `string` | — | 无障碍文案,读屏播报。默认走 i18n 字典 spinner.label(「加载中」)。 |
| `showLabel` | `boolean` | `false` | 是否把 label 同时渲染为可见旁注文字(默认 false,仅作 aria-label 隐形播报)。 |
| `labelPlacement` | `"end" \| "start" \| "bottom" \| "top"` | `end` | 可见 label 相对指示器的位置(showLabel 为 true 时生效)。默认 end。 |
| `labelContent` | `ReactNode` | — | 自定义可见旁注内容(ReactNode 槽位)。给出时覆盖 label 文本作为可见内容,<br>但 aria-label 仍用 label 保证读屏语义。隐含 showLabel。 |
| `...props` | `ComponentPropsWithoutRef<'span'>` | — | 透传原生 span 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<span>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `spinner` `loader` `loading` `feedback` `progress` `status` `indicator` `ring` `dots` `bars` `tone` `i18n` |

::: details 需求原文 / 设计意图
加载旋转器,role=status。magic-scope 通用基础组件:自研、消费 tokens 的 --ms-* 变量。补强为旗舰深度:形态变体(ring/dots/bars)、tone 色调系统(读 6 槽位,不传随 currentColor)、可见旁注 label(showLabel/labelPlacement/labelContent)、i18n aria-label(spinner.label)、密度缩放、发光与动效全局一键降级、...rest 留口透传。
:::
