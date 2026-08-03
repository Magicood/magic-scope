# HoverCard <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

悬停富预览卡,trigger(链接 / 头像)hover 或 focus 延时弹出可交互富内容卡,指针可从 trigger 移入卡内而不关闭。

> **[在展示站中打开 HoverCard](https://magicood.github.io/magic-scope/#/hover-card)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

「鼠标悬停在链接 / 头像上预览富信息」的 overlay,区别于 Tooltip:可放图文、链接、按钮等可交互富内容,并允许指针从 trigger 平滑移入卡片内继续操作(桥接宽限做去向命中判定)。

进入延时 openDelay(默认 700ms)再弹,移开延时 closeDelay(默认 300ms)再关。原生 Popover API(top-layer)+ CSS Anchor Positioning 锚定,12 向 placement + offset + 可选箭头 + tone 色调驱动边框 / 发光。

复合 HoverCard / HoverCard.Trigger(asChild 注入)/ HoverCard.Content。受控(open + onOpenChange)/ 非受控(defaultOpen)双通道。a11y:补充信息层非 dialog——不抢焦不困焦,trigger aria-describedby 关联卡片,Esc 关闭;触屏诚实降级为 inert。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` * | `ReactNode` | — | 复合子树：&lt;HoverCard.Trigger&gt; + &lt;HoverCard.Content&gt;。 |
| `open` | `boolean` | — | 受控：是否打开。传入即进入受控模式（配合 onOpenChange)。 |
| `defaultOpen` | `boolean` | `false` | 非受控初始打开态。默认 false。 |
| `openDelay` | `number` | `700` | hover / focus 到打开的延时（毫秒)。默认 700。 |
| `closeDelay` | `number` | `300` | 移出到关闭的延时（毫秒，给指针穿越间隙留宽限)。默认 300。 |
| `placement` | `"left" \| "right" \| "bottom" \| "top" \| "top-end" \| "top-start" \| "bottom-end" \| "bottom-start" \| "left-start" \| "left-end" \| "right-start" \| "right-end"` | `bottom` | 卡片相对 trigger 的方位（12 向)。默认 bottom。 |
| `offset` | `number` | `8` | 卡片与 trigger 的间距（像素)。默认 8。 |
| `arrow` | `boolean` | `false` | 是否显示指向箭头。默认 false。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `neutral` | 语义色调，经全库 tone resolver 派生卡片边框 / 发光 / 箭头。默认 neutral。 |
| `className` | `string` | — | 透传到卡片根的额外 className。 |
| `classNames` | `HoverCardClassNames` | — | 各部件细粒度 className 槽位。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onOpenChange` | `(open: boolean) => void` | 显隐变化回调（受控 / 非受控均触发)。<br>· `open` — 变化后的目标显隐状态：true 为打开，false 为关闭。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | inspired · 受外部启发重做 |
| 收录日期 | 2026-06-26 |
| 来源链接 | <https://www.radix-ui.com/primitives/docs/components/hover-card> |
| 标签 | `hover-card` `overlay` `preview` `popover-api` `top-layer` `anchor` `placement` `arrow` `hover` `bridge` `tone` `controllable` `a11y` |

::: details 需求原文 / 设计意图
需要一个「鼠标悬停在链接/头像上预览富信息」的 overlay,区别于 Tooltip:Tooltip 只承载短文字、且不该放可交互内容;HoverCard 要能放图文、链接、按钮等可交互富内容,并允许指针从 trigger 平滑移入卡片内继续操作(中间空白不能一移开就关)。交互手感:进入延时约 700ms 再弹(避免扫过即弹的噪声),移开延时约 300ms 再关(给指针穿越 trigger 与卡片间隙留宽限)。可访问性上它是『补充信息』不是对话框——不能抢焦/困焦,键盘聚焦也要能触发(否则纯键盘用户拿不到),Esc 可关,trigger 用 aria-describedby 关联卡片。触屏没有 hover,要诚实降级(建议改点击触发的 Popover),不留一张无法关闭的悬空卡。定位复用与 Popover/Tooltip 同构的 placement→position-area 语义(多框架对等,不各写一套),进 top-layer 用原生 Popover API。
:::
