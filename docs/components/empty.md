# Empty <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

空状态占位,内置极简插画 + 描述 + 操作区,7 档语义色驱动着色与光晕。

> **[在展示站中打开 Empty](https://magicood.github.io/magic-scope/#/empty)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

无数据 / 无结果 / 无搜索命中时的占位与引导:image 支持内置预设(default / simple)、自定义 ReactNode 或 false 关闭;description 默认走 i18n empty.description,可覆盖或关闭;children 作底部操作区(如重试按钮)。tone 7 档语义色驱动插画着色与克制光晕(受顶栏「光影」开关控制),size 随 data-ms-density 缩放;支持多态 as / asChild 与部件级 classNames。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `as` | `ElementType` | — | 多态根标签。默认 `div`。需要语义时换 `section` 等。与 `asChild` 互斥(asChild 优先)。 |
| `asChild` | `boolean` | `false` | 渲染为唯一子元素并把空状态样式合并上去(Radix Slot 风格,由子元素自带内容)。<br>用于不额外包一层 DOM 的场景。 |
| `image` | `string \| number \| bigint \| boolean \| ReactElement<unknown, string \| JSXElementConstructor<any>> \| Iterable<ReactNode> \| ReactPortal \| Promise<...> \| null` | — | 插画:<br>- 不传 → 内置极简插画(预设 `default`);<br>- 预设名 `'default'` / `'simple'` → 对应内置 SVG;<br>- 任意 `ReactNode` → 自定义插画(图片 / 图标 / 自绘 SVG);<br>- `false` → 完全不渲染插画列。<br>内置 SVG 用 `currentColor` 绘制,经 `tone` 着色。 |
| `description` | `ReactNode` | — | 描述文案。不传走 i18n `empty.description`(默认「暂无数据」);传 `false` 关闭描述;<br>传 `ReactNode` 覆盖。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调:驱动内置插画着色与发光(读统一 6 槽位)。默认 neutral。 |
| `classNames` | `EmptyClassNames` | — | 各部件细粒度 className。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `empty` `feedback` `placeholder` `empty-state` `no-data` `no-result` `illustration` `tone` `polymorphic` `a11y` |

::: details 需求原文 / 设计意图
空状态组件,对标 AntD Empty:数据为空 / 搜索无结果 / 列表无项时,展示极简插画 + 描述文案 + 可选操作区,引导用户下一步。magic-scope 生产级通用组件:自研、消费 tokens 的 --ms-&#42; 变量,内置插画用 currentColor + tone 着色,完整尺寸与 tone 体系、留口(多态 as / asChild / classNames / forwardRef),尊重 prefers-reduced-motion 与发光/动效总闸。
:::
