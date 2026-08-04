# FloatButton <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

悬浮操作钮(FAB):圆/方形 × 7 色调,带角标、tooltip,配套可展开 speed-dial 菜单。

> **[在展示站中打开 FloatButton](https://magicood.github.io/magic-scope/#/float-button)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,固定定位的悬浮操作入口。单钮支持 circle/square 形状、default/primary 类型与全库 7 色调 tone(只读 6 槽位、零硬编码配色与发光);可带 icon、方形内 description 文字(超长截断不撑破)、数字/小红点 badge(超 overflowCount 截为 N+)。

传 href 即渲染为 &lt;a&gt;(导航语义,&#95;blank 自动补 rel),否则渲染 &lt;button&gt;;传 tooltip 自动用 Tooltip 包裹(hover/focus 弹出)。配套 FloatButton.Group 堆叠/可展开菜单:click/hover 触发,子项沿 direction 错峰弹出,受控/非受控双通道,触发钮 aria-expanded/aria-controls 关联、收起态 inert 移出 tab 序、Esc 收起,错峰入场在 reduced-motion / data-ms-motion=off 下优雅降级。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `icon` | `ReactNode` | — | 图标(默认内容)。 |
| `description` | `ReactNode` | — | 方形按钮内的文字(圆形按钮亦可,但方形更适配)。超长自动截断不撑破。 |
| `tooltip` | `ReactNode` | — | 提示文案:传入即用 Tooltip 包裹本钮(hover/focus 弹出)。 |
| `tooltipPlacement` | `"left" \| "right" \| "bottom" \| "top" \| "top-end" \| "top-start" \| "bottom-end" \| "bottom-start" \| "left-start" \| "left-end" \| "right-start" \| "right-end"` | `left` | tooltip 方位。默认 left(浮钮通常贴右下,提示朝左不出屏)。 |
| `shape` | `"circle" \| "square"` | `circle` | 形状:圆形 / 方形(圆角)。默认 circle。 |
| `type` | `"primary" \| "default"` | `primary` | 类型:默认中性面 / 主色实底发光。默认 default。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调,经全库 tone resolver 派生配色与 glow。默认 primary。 |
| `badge` | `FloatButtonBadge` | — | 角标:数字(&gt;0 显示,超 overflowCount 截为 `N+`)或 `{ dot: true }` 小红点。 |
| `href` | `string` | — | 传入即渲染为 `<a href>`(导航语义),否则渲染 `<button>`。 |
| `target` | `string` | — | 链接打开方式(仅 href 时生效);`_blank` 自动补 rel 安全属性。 |
| `classNames` | `FloatButtonClassNames` | — | 各部件细粒度 className 槽位。 |
| `className` | `string` | — | 透传到根元素的额外 className。 |
| `style` | `CSSProperties` | — | 透传到根元素的内联样式。 |
| `children` | `ReactNode` | — | 内容(等价 icon;同时给 icon 时以 icon 优先,children 作 description 兜底)。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onClick` | `(event: MouseEvent<HTMLButtonElement \| HTMLAnchorElement, MouseEvent>) => void` | 点击回调(button 与 a 都触发)。<br>· `event` — 点击的鼠标事件(button 上为 button 元素,href 时为 a 元素)。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `float-button` `fab` `fixed` `speed-dial` `expandable` `badge` `tooltip` `tone` `controlled` `compound` `anchor` `a11y` `reduced-motion` |

::: details 需求原文 / 设计意图
需要一个生产级悬浮操作钮(对标 Ant Design FloatButton / Material FAB 且做出 magic 差异化):单钮要覆盖 circle/square 形状、default/primary 类型、全库 tone 槽位配色与发光、方形内文字 description、数字/点 badge、href 多态(导航语义)与可选 tooltip 包裹;复合形态 FloatButton.Group 要支持点击/悬停展开的纵向(及横向)speed-dial 菜单,带受控/非受控双通道、子项错峰入场、收/展图标切换。a11y 必须到位:触发钮 aria-expanded/aria-controls、收起态子项 inert 且不可聚焦、Esc 收起、键盘可达。固定定位叠加安全区,尺寸随密度缩放,动效在 prefers-reduced-motion 与 data-ms-motion=off 下优雅降级。可抽取的纯逻辑(badge 规整、错峰延时、reduced-motion 判定)落 logic.ts 以便平移其它框架。
:::
