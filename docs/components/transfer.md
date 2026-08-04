# Transfer <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

双列穿梭框,把数据项在「源池」与「目标」之间移动,移动逻辑为可单测纯函数。

> **[在展示站中打开 Transfer](https://magicood.github.io/magic-scope/#/transfer)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,消费 @magic-scope/tokens 的 --ms-&#42; 变量。真相源是单一 dataSource + targetKeys,切栏 / 过滤 / 算方向的移动逻辑全在零 React 的 logic.ts(可平移内核),onChange 回传 (targetKeys, direction, moveKeys) 便于外部审计。

两栏对称:各带全选表头(显示「已选 X/Y」计数)、按项 Checkbox、可选搜索框与空态;中间方向按钮按两侧选中态启用,支持单向模式。受控 targetKeys 与非受控 defaultTargetKeys 并存。a11y:list(ul/li)+ 每项 / 表头 checkbox + 带可访问名的方向 button;长 title 截断不撑破,尊重 prefers-reduced-motion。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `dataSource` * | `readonly TransferItem[]` | — | 全量数据源(左右两栏合并的真相源)。 |
| `targetKeys` | `readonly string[]` | — | 受控:位于右栏(目标)的 key 集合。 |
| `defaultTargetKeys` | `readonly string[]` | — | 非受控初始右栏 key 集合。 |
| `render` | `((item: TransferItem) => ReactNode)` | — | 自定义每项渲染(覆盖默认 title 文本);返回内联节点。 |
| `titles` | `readonly [ReactNode, ReactNode]` | — | 两栏标题 &#91;左, 右]。 |
| `showSearch` | `boolean` | `false` | 是否显示搜索框(两栏均显示)。默认 false。 |
| `filterOption` | `((query: string, item: TransferItem) => boolean)` | — | 自定义过滤匹配器(返回 true 保留);缺省按 title 包含匹配。 |
| `oneWay` | `boolean` | `false` | 单向模式:仅保留「左→右」方向按钮,右栏不显示移回控件。默认 false。 |
| `disabled` | `boolean` | `false` | 整体禁用:两栏不可选、方向按钮不可用。 |
| `classNames` | `TransferClassNames` | — | 细粒度槽位 className。 |
| `...props` | `ComponentPropsWithoutRef<'div'>` | — | 透传原生 div 属性(className / style / aria-&#42; / 事件等)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(targetKeys: string[], direction: TransferDirection, moveKeys: string[]) => void` | 右栏 key 集合变化回调。<br>· `targetKeys` — 移动后的新右栏 key 集合(按 dataSource 原序)。<br>· `direction` — 本次移动方向(`right` 左→右 / `left` 右→左)。<br>· `moveKeys` — 本次实际移动的 key(已剔除禁用 / 不存在的)。 |

此外透传原生 `<div>` 的全部标准事件(onClick / onFocus / onKeyDown …),与自有事件按 compose 合并、互不覆盖。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `transfer` `shuttle` `dual-list` `selection` `data-display` `checkbox` `search` |

::: details 需求原文 / 设计意图
需要一个把候选集分配到目标集的双列控件:常见于权限分配、字段挑选、收件人选择等场景。核心诉求——(1) 真相源是单一 dataSource + targetKeys,移动逻辑必须是可单测的纯函数(切栏/过滤/移动算方向),便于平移到其它框架;(2) 两栏对称,各自带全选表头(显示已选 X/Y)、按项复选、可选搜索、空态;(3) 中间方向按钮按两侧选中态启用,支持单向模式;(4) 受控 targetKeys 与非受控 defaultTargetKeys 并存,onChange 回传 (targetKeys, direction, moveKeys) 以便外部审计移动;(5) a11y:list + checkbox + 带可访问名的方向按钮;长 title 截断不撑破。
:::
