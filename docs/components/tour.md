# Tour <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

引导漫游,遮罩在目标处镂空高亮 + 浮动引导卡,逐步带新手走完功能巡览。

> **[在展示站中打开 Tour](https://magicood.github.io/magic-scope/#/tour)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖。半透明遮罩压暗全页,只在当前步目标处用 box-shadow spread「挖洞」聚焦注意力,洞内可点透 / 高亮;目标用 CSS 选择器或取值器惰性解析,位置随页面滚动与窗口缩放经 rAF 实时跟随,切步自动 scrollIntoView。

引导卡走 portal 进 document.body,含标题 / 描述 / 上一步·下一步·跳过·完成底栏与步数指示;方位按目标在视口的剩余空间自动推断(也可显式 placement)。受控(open + current + onChange)与非受控(defaultCurrent)双通道,onClose / onFinish 钩子,键盘 Esc 关、← / → 切步,ref 暴露 goTo/next/prev/close 命令式句柄,tone 经全库 resolver 着色。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

| 参数 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `steps` * | `TourStep[]` | — | 引导步集。 |
| `open` | `boolean` | — | 是否打开(受控);省略则始终展示(配合非受控 current 用得少,一般会传)。 |
| `current` | `number` | — | 受控当前步索引。传入即进入受控,需配合 onChange 推进。 |
| `defaultCurrent` | `number` | `0` | 非受控初始步。默认 0。 |
| `spotlightPadding` | `number` | `8` | 高亮洞相对目标的外扩量(像素)。默认 8。 |
| `tone` | `"primary" \| "accent" \| "success" \| "warning" \| "danger" \| "info" \| "neutral"` | `primary` | 语义色调:经全库 tone resolver 派生卡片高亮 / focus 环 / 发光。默认 primary。 |
| `maskClosable` | `boolean` | `false` | 点击遮罩(高亮洞之外)是否关闭。默认 false(引导一般要求显式跳过 / 完成)。 |
| `closeOnEscape` | `boolean` | `true` | 按 Esc 是否关闭。默认 true。 |
| `scrollIntoView` | `boolean` | `true` | 切步时是否把目标滚动进视口。默认 true。 |
| `hideSkip` | `boolean` | `false` | 隐藏「跳过」。 |
| `showCounter` | `boolean` | `true` | 是否显示步数指示。默认 true。 |
| `closeIcon` | `ReactNode` | — | 自定义关闭(跳过 ×)图标。 |
| `className` | `string` | — | 遮罩根附加 className。 |
| `classNames` | `TourClassNames` | — | 各部件细粒度 className 槽位。 |
| `style` | `CSSProperties` | — | 透传到遮罩根的内联 style(与组件计算值合并,用户优先)。 |
| `container` | `Element \| null` | — | portal 挂载容器,默认 document.body。 |

## 事件 Events

| 事件 | 签名 | 说明 |
| --- | --- | --- |
| `onChange` | `(current: number) => void` | 步变化回调(上一步 / 下一步 / 程序化跳步)。<br>· `current` — 切换后的目标步索引(已夹取到合法区间)。 |
| `onClose` | `(info: { reason: "mask" \| "escape" \| "finish" \| "skip"; current: number; }) => void` | 关闭回调(Esc / 点击跳过 / 点击遮罩,据 maskClosable)。<br>· `info` — 关闭来源信息:reason 区分跳过 / Esc / 点遮罩 / 完成。 |
| `onFinish` | `(current: number) => void` | 走完最后一步点「完成」回调。<br>· `current` — 完成时所处的步索引(通常为最后一步)。 |

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `tour` `onboarding` `guide` `walkthrough` `spotlight` `coachmark` `overlay` `feedback` |

::: details 需求原文 / 设计意图
需要一个新手引导/功能巡览组件:用半透明遮罩压暗全页,只在当前步目标处挖出高亮洞聚焦注意力,旁边浮一张引导卡说明这一步并提供上一步/下一步/跳过/完成。要求目标用选择器或取值器惰性解析、位置随页面滚动与窗口缩放实时跟随,切步把目标滚动进视口;键盘可达(Esc 关、左右方向键切步);受控/非受控双通道便于接入业务状态机;文案走 i18n;可抽取的纯算法(步索引夹取、目标解析、镂空区计算、卡片方位推断)落 logic.ts 以便平移多框架。
:::
