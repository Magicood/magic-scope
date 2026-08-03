# Kbd <Badge type="tip" text="stable" /> <Badge type="info" text="v0.2.0" />

键盘按键样式,展示快捷键如 ⌘K、Ctrl + C,带键帽立体感。

> **[在展示站中打开 Kbd](https://magicood.github.io/magic-scope/#/kbd)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-* 变量。

surface-raised 底 + 1px 描边 + 加粗底边模拟键帽立体感,radius-sm、font-mono、紧凑内边距。

组合键用多个 &lt;Kbd&gt; 并以分隔符拼接即可;无交互状态但保留 transition 以备未来。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/kbd.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `keys` | `string \| readonly string[]` | — | 快捷键。传 'cmd+shift+k' 或 &#91;'cmd','k'] 时,会拆成多个键帽并按平台符号化渲染。<br>不传则把 children 当单个键帽内容(向后兼容旧用法)。 |
| `platform` | `"auto" \| "mac" \| "win"` | `auto` | 目标平台:auto 经 navigator 探测 / mac 强制 macOS 符号 / win 强制 Windows 文本。默认 auto。 |
| `separator` | `ReactNode` | — | 多键帽之间的分隔符,可传任意 ReactNode(默认无字符,纯间距;常见传 '+' 或 ' ')。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸:sm 紧凑 / md 默认 / lg 放大(随 data-ms-density 缩放)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调,经全库 tone resolver 派生配色与发光。默认 neutral。 |
| `asChild` | `boolean` | `false` | 渲染为子元素并保留键帽样式(Radix Slot 风格;由子元素自带内容)。 |
| `classNames` | `{ key?: string; separator?: string; } \| undefined` | — | 关键子部件 className(键帽 / 分隔符)。 |
| `...props` | `ComponentPropsWithoutRef<'kbd'>` | — | 透传原生 kbd 属性(className / style / aria-* / 事件等)。 |

## 事件 Events

此外透传原生 `<kbd>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-24 |
| 标签 | `kbd` `keyboard` `key` `shortcut` `hotkey` `keycap` `combo` `platform` `mac` `tone` `data-display` |

::: details 需求原文 / 设计意图
键盘按键样式组件,surface-raised 底配加粗底边模拟键帽立体感,等宽字号展示快捷键。magic-scope 通用基础组件:自研、消费 tokens 的 --ms-* 变量,完整状态与过渡、发光,尊重 prefers-reduced-motion。深度补强:keys 多键帽解析(纯函数 logic.ts,可平移 core)+ 平台符号映射(cmd→⌘ ctrl→⌃ alt→⌥ shift→⇧ enter→⏎ esc→⎋ del→⌫)+ tone 色调 + lg 档 + 可定制 separator。
:::
