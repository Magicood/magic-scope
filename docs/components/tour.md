# Tour <Badge type="tip" text="stable" /> <Badge type="info" text="v0.1.0" />

引导漫游,遮罩在目标处镂空高亮 + 浮动引导卡,逐步带新手走完功能巡览。

> **[在展示站中打开 Tour](https://magicood.github.io/magic-scope/#/tour)** —— 交互 demo + 参数旋钮 + 真实源码,主题 / 密度 / 动效一键切换。

## 说明

自研、零依赖。半透明遮罩压暗全页,只在当前步目标处用 box-shadow spread「挖洞」聚焦注意力,洞内可点透 / 高亮;目标用 CSS 选择器或取值器惰性解析,位置随页面滚动与窗口缩放经 rAF 实时跟随,切步自动 scrollIntoView。

引导卡走 portal 进 document.body,含标题 / 描述 / 上一步·下一步·跳过·完成底栏与步数指示;方位按目标在视口的剩余空间自动推断(也可显式 placement)。受控(open + current + onChange)与非受控(defaultCurrent)双通道,onClose / onFinish 钩子,键盘 Esc 关、← / → 切步,ref 暴露 goTo/next/prev/close 命令式句柄,tone 经全库 resolver 着色。

## 参数 Props

自动抽取自真实 TS 类型(`scripts/extract-props.ts`),与源码永不漂移。

该组件无独立参数。

## 溯源

| 档案 | 值 |
| --- | --- |
| 来源类型 | original · 自研原创 |
| 收录日期 | 2026-06-26 |
| 标签 | `tour` `onboarding` `guide` `walkthrough` `spotlight` `coachmark` `overlay` `feedback` |

::: details 需求原文 / 设计意图
需要一个新手引导/功能巡览组件:用半透明遮罩压暗全页,只在当前步目标处挖出高亮洞聚焦注意力,旁边浮一张引导卡说明这一步并提供上一步/下一步/跳过/完成。要求目标用选择器或取值器惰性解析、位置随页面滚动与窗口缩放实时跟随,切步把目标滚动进视口;键盘可达(Esc 关、左右方向键切步);受控/非受控双通道便于接入业务状态机;文案走 i18n;可抽取的纯算法(步索引夹取、目标解析、镂空区计算、卡片方位推断)落 logic.ts 以便平移多框架。
:::
