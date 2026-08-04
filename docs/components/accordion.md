# Accordion <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

手风琴折叠面板组,single / multiple 两种展开模式,键盘可达。

> **[在展示站中打开 Accordion](https://magicood.github.io/magic-scope/#/accordion)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。

展开/收起用 grid-template-rows: 0fr → 1fr 过渡,无需测量高度;头部为原生 &lt;button&gt;,带完整 aria 关联(aria-expanded / aria-controls,内容区 role="region" + aria-labelledby);↑↓ 在头部间移动焦点并跳过 disabled,Home / End 跳首尾,Enter / Space 由原生 button 触发切换。展开图标旋转量受顶栏「动效」开关控制。常见用法:FAQ 问答、设置分组、订单详情等需要分区折叠的场景。

## 静态预览

静态还原(深色奥术主题),仅展示典型形态;完整交互以展示站为准。

<!--@include: ../previews/accordion.md-->

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `"single" \| "multiple"` | `single` | single:同时只展开一项;multiple:可同时展开多项。默认 single。 |
| `items` * | `AccordionItem[]` | — | 面板项列表。 |
| `value` | `string \| string[]` | — | 受控展开值。single 取 string,multiple 取 string&#91;]。<br>传入即受控(配合 onValueChange);不传走非受控(defaultValue)。 |
| `defaultValue` | `string \| string[]` | — | 初始展开值(非受控)。single 取 string,multiple 取 string&#91;];宽松接受任一形态。 |
| `collapsible` | `boolean` | `true` | single 模式下是否允许全部收起(点已展开项可收起到无展开)。默认 true。<br>multiple 模式不受此项影响(各项始终可独立收起)。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调:根加 ms-tone-${tone},hover/open/focus 配色读 6 槽位。默认 primary。 |
| `classNames` | `AccordionClassNames` | — | 子部件类名插槽。 |
| `className` | `string` | — | 外部类名(作用于根容器)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onValueChange` | `(value: string \| string[]) => void` | 展开值变化(受控/非受控双通道核心回调)。<br>· `value` — 变化后的展开值:single 回展开项的 string、multiple 回展开项的 string&#91;]。 |
| `onExpandedChange` | `(value: string, open: boolean) => void` | 单项展开/收起瞬间触发。<br>· `value` — 被切换项的 value。<br>· `open` — 切换后该项是否展开:true=展开,false=收起。 |
| `onTriggerClick` | `(value: string, event: MouseEvent<HTMLButtonElement, MouseEvent>) => void` | 任意头部被点击(在内部切换逻辑之前调用)。<br>· `value` — 被点击项的 value。<br>· `event` — 该次点击的原始鼠标事件,可 `preventDefault()` 阻断内部切换。 |
| `onKeyDown` | `(event: KeyboardEvent<HTMLButtonElement>) => void` | 头部键盘事件外抛/可拦截(在 ↑↓/Home/End 内部导航之前调用)。<br>· `event` — 头部触发按钮的原始键盘事件,可 `preventDefault()` 阻断内部导航。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-25 |
| 标签 | `accordion` `collapse` `disclosure` `layout` `arcane` `react` `zero-dependency` `accessible` `keyboard` `controlled` `tone` `collapsible` `inert` `compose-events` |

::: details 需求原文 / 设计意图
手风琴:可折叠面板组,grid-template-rows 0fr→1fr 平滑展开、▸ 图标旋转、深色发光,支持 single/multiple 与键盘 ↑↓ 导航。工程要求(magic-scope 结构/导航组件):自研、消费 tokens,完整状态、键盘可达、fx/motion 开关、逻辑属性。补强到旗舰深度:受控/非受控双模式、collapsible 全收、tone 色调、全量语义事件回调与原生事件透传、classNames 插槽、可替换指示符、inert+延迟 visibility 修复 hidden 与 grid 过渡冲突。
:::
