# Toolbar <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

role=toolbar + roving tabindex 的复合动作容器,聚合按钮 / 链接 / 分隔 / 分组 / 单多选切换组,一组只占一个 Tab 位、方向键在项间移焦。

> **[在展示站中打开 Toolbar](https://magicood.github.io/magic-scope/#/toolbar)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

把多个动作按钮聚成一条的工具栏:整组只占一个 Tab 序、方向键(横向 ←/→、纵向 ↑/↓、Home/End)在项间移焦(roving tabindex),用于编辑器 / 看板顶栏。

子件覆盖动作按钮(Toolbar.Button)、链接(Toolbar.Link)、视觉分隔(Toolbar.Separator,role=separator)、逻辑分组(Toolbar.Group,role=group),以及单选 / 多选切换组(Toolbar.ToggleGroup + Toolbar.ToggleItem:single 走 radiogroup / radio,multiple 走 aria-pressed),切换组值受控 / 非受控双模式。

内容过多可换行(wrap)或横向滚动,绝不撑破容器;键盘 roving 范式对齐库内 Tabs / Segmented。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `orientation` | `"horizontal" \| "vertical"` | `horizontal` | 朝向:horizontal(横向,←/→ 移焦)\| vertical(纵排,↑/↓ 移焦)。默认 horizontal。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(随 data-ms-density 缩放,透传给后代项)。默认 md。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调,经全库 tone resolver 派生配色(透传给后代项)。默认 neutral。 |
| `variant` | `"solid" \| "outline" \| "plain"` | `ghost` | 根视觉变体:plain(无底)\| solid(实底卡片)\| outline(描边)。默认 plain。 |
| `wrap` | `boolean` | `false` | 内容过多时换行(否则横向溢出可滚动)。默认 false。 |
| `classNames` | `ToolbarClassNames` | — | 关键子部件类名。 |
| `iconOnly` | `boolean` | `false` | 仅图标(正方形紧凑);务必配 aria-label。 |
| `leftIcon` | `ReactNode` | — | 前置图标。 |
| `rightIcon` | `ReactNode` | — | 后置图标。 |
| `asChild` | `boolean` | `false` | 渲染为子元素(如 &lt;a&gt; / 路由 Link)并保留按钮样式(Radix Slot 风格)。 |
| `label` | `string` | — | 分组无障碍名(无可见 label 时建议提供)。 |
| `attached` | `boolean` | `true` | 吸附:相邻项合并圆角与边界(连续控件观感)。默认 false。 |
| `type` | `"single" \| "multiple"` | `button` | 单选(类 radiogroup)或多选。默认 single。 |
| `value` | `string \| string[] \| null` | — | 受控值(single 传 string\|null,multiple 传 string&#91;])。 |
| `defaultValue` | `string \| string[] \| null` | — | 非受控初始值。 |
| `allowDeselect` | `boolean` | `false` | single 模式下点击已选项是否允许取消(回到无选中)。默认 false。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onValueChange` | `(value: string \| string[] \| null) => void` | 选中变化回调。<br>· `value` — single 模式为 string\|null,multiple 模式为 string&#91;]。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `toolbar` `actions` `roving-tabindex` `toggle-group` `keyboard` `a11y` `compound` |

::: details 需求原文 / 设计意图
需要一个把多个动作按钮聚成一条的工具栏:整组只占一个 Tab 序、方向键(横向 ←/→、纵向 ↑/↓、Home/End)在项间移焦(roving tabindex),作为编辑器 / 看板顶栏这类高频场景的承载。子件要覆盖动作按钮、链接、视觉分隔(role=separator)、逻辑分组(role=group),以及单选 / 多选切换组(single 走 radiogroup/radio 语义,multiple 走 aria-pressed),切换组值受控 / 非受控双模式。内容过多要么换行(wrap)要么横向滚动,绝不撑破容器。键盘 roving 范式对齐库内 Tabs/Segmented,导航纯算法抽进 logic.ts 以便平移其它框架。
:::
