# Statistic <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

单指标数值展示,千分位 / 精度格式化 + 趋势染色 + 挂载滚动动画。

> **[在展示站中打开 Statistic](https://magicood.github.io/magic-scope/#/statistic)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖,做仪表盘 / 概览卡里的单指标展示。数值格式化(千分位插入 + precision 小数位 + 拆 sign/integer/fraction 三段分字号)抽成零 React 纯函数(logic.ts),便于平移 core 与单测;number 与数字串都会被解析,非数字串(如 "N/A")原样透传。

trend up/down 不写死颜色,统一走全库 tone resolver(up→success / down→danger)并配方向箭头;loading 渲染骨架占位(aria-busy)。animateOnMount 用 requestAnimationFrame 从 0 缓出滚到终值,但尊重 prefers-reduced-motion 与 data-ms-motion=off —— 命中时直接落终值不滚动。数值容器给完整 aria-label(标题+趋势+前缀+数值+后缀),size × 密度缩放,prefix/suffix/trend/title 留 classNames 槽位,as 多态根。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` * | `string \| number` | — | 主数值。number 走格式化(千分位 + 精度 + 拆段),数字串(如 "1234.5")也会被解析;非数字串原样透传。 |
| `title` | `ReactNode` | — | 标题 / 指标名(渲染在数值上方,fg-muted)。 |
| `precision` | `number` | — | 小数位。仅对数值生效;不传则保留原始位数。 |
| `prefix` | `ReactNode` | — | 数值前缀(如 ¥ / $),随数值基线对齐。 |
| `suffix` | `ReactNode` | — | 数值后缀(如 % / 单位),随数值基线对齐。 |
| `groupSeparator` | `string` | `,` | 千分位分隔符。默认 ','。传空串关闭分组。 |
| `trend` | `"up" \| "down"` | — | 趋势:up 染 success + 上箭头,down 染 danger + 下箭头。不传则中性(沿用 fg)。 |
| `loading` | `boolean` | `false` | 加载态:渲染 skeleton 占位(aria-busy),不显示真实数值。 |
| `size` | `"sm" \| "md" \| "lg"` | `md` | 尺寸(数值字号随密度 data-ms-density 缩放)。默认 md。 |
| `valueClassName` | `string` | — | 数值区类名留口(等价 classNames.value 的便捷别名)。 |
| `animateOnMount` | `boolean` | `false` | 挂载时从 0 用 requestAnimationFrame 滚动到目标值(仅对数值有效)。<br>尊重 prefers-reduced-motion 与 data-ms-motion=off:命中时直接显示终值,不滚动。 |
| `animateDuration` | `number` | `1000` | 滚动动画时长(ms)。默认 1000。 |
| `classNames` | `StatisticClassNames` | — | 子部件类名细粒度槽位。 |
| `as` | `ElementType` | — | 多态根元素(默认 div)。 |
| `className` | `string` | — | 根元素额外类名。 |
| `style` | `CSSProperties` | — | 根元素内联样式。 |
| `aria-label` | `string` | — | 无障碍名覆盖。不传则由 title + prefix/value/suffix 自动拼出。 |
| `id` | `string` | — | id 透传。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `statistic` `metric` `number` `kpi` `data-display` `count-up` `trend` `skeleton` |

::: details 需求原文 / 设计意图
做仪表盘/概览卡里的单指标展示。硬约束:1) 数值格式化(千分位插入 + precision 小数位 + 拆 sign/integer/fraction 三段分字号)必须是零 React 的纯函数(logic.ts),便于平移 core 与单测;2) trend up/down 不写死颜色,统一走全库 tone resolver(up→success / down→danger 暴露 --ms-c)并配方向箭头;3) animateOnMount 用 requestAnimationFrame 从 0 缓出滚到终值,但必须尊重 prefers-reduced-motion 与 data-ms-motion=off —— 命中时直接落终值不滚动;4) 只读统计文本,数值容器给完整 aria-label(标题+趋势+前缀+数值+后缀)供屏幕阅读器一次读出;5) 超长 title/value 不撑破容器(min-inline-size:0 + 单行省略);6) prefix/suffix/trend/title 子部件留 classNames 槽位,as 多态根。
:::
